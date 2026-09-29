// node render.js stills h 1.2,5,10          -> build/stills/h_<t>.png
// node render.js video h [fps] [workers] [K] -> build/part_h_<w>.mp4 (no audio) + build/parts_h.txt
//   K > 1 turns on motion blur (180° shutter): ffmpeg averages K slots per output frame (tmix).
//   Each frame first measures how far anything moves during the exposure (motionAt) and renders only
//   as many subframes as that needs (1, 4, 8 or 16, each repeated to fill the K slots): still frames
//   cost one capture, the fastest zooms get 16 samples less than 2px apart, so no visible copies.
//   T0/T1 (seconds, env) render only part of the timeline, for tests.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
const FF = process.env.FFMPEG || 'ffmpeg';
const [mode, f, arg, wk, sb] = process.argv.slice(2);
const W = f === 'h' ? 1920 : 1080, H = f === 'h' ? 1080 : 1920;   // h = 16:9, everything else vertical
const url = 'file://' + path.join(__dirname, process.env.PAGE || 'stage.html') + '?f=' + f;   // PAGE=reel.html for the Reel
const OUT = path.join(__dirname, 'build');
fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(url); await page.evaluate(() => window.ready);
  page.cdp = await page.context().newCDPSession(page);
  return page;
}
// CDP capture: ~30% faster than page.screenshot for the same picture
async function grab(page) {
  const { data } = await page.cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 94 });
  return Buffer.from(data, 'base64');
}

(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
  if (mode === 'stills') {
    const page = await open(browser);
    for (const t of arg.split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(OUT, 'stills', `${f}_${t}.png`) });
    }
  } else {
    const fps = +(arg || 60), workers = +(wk || 4), K = +(sb || 1);
    const first = await open(browser);
    const dur = await first.evaluate(() => DURATION);
    const F0 = Math.round((+process.env.T0 || 0) * fps), F1 = Math.round((process.env.T1 ? +process.env.T1 : dur) * fps);
    const per = Math.ceil((F1 - F0) / workers);
    const shutter = 0.5 / fps;
    const stats = {};
    await Promise.all([...Array(workers)].map(async (_, w) => {
      const page = w ? await open(browser) : first;
      const a = F0 + w * per, b = Math.min(F1, a + per);
      const vf = K > 1 ? ['-vf', `tmix=frames=${K},select='eq(mod(n,${K}),${K - 1})',setpts=N/(${fps}*TB)`] : [];
      const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * K), '-c:v', 'mjpeg', '-i', '-', ...vf,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(OUT, `part_${f}_${w}.mp4`)]);
      ff.stderr.on('data', d => process.stderr.write(d));
      const write = async buf => { if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); };
      for (let i = a; i < b; i++) {
        const t = i / fps;
        let n = 1;
        if (K > 1) {
          const D = await page.evaluate(([t, h]) => motionAt(t, h), [t, shutter / 2]);   // px moved during the exposure
          n = Math.min(K, D <= 1.5 ? 1 : D <= 8 ? 4 : D <= 16 ? 8 : 16);
        }
        stats[n] = (stats[n] || 0) + 1;
        for (let j = 0; j < n; j++) {
          await page.evaluate(t => render(t), n === 1 ? t : t + ((j + .5) / n - .5) * shutter);
          const buf = await grab(page);
          for (let r = 0; r < K / n; r++) await write(buf);
        }
        if ((i - a) % 300 === 0) console.log(f, 'w' + w, i, '/', b);
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r));
    }));
    fs.writeFileSync(path.join(OUT, `parts_${f}.txt`), [...Array(workers)].map((_, w) => `file 'part_${f}_${w}.mp4'`).join('\n'));
    console.log(`frames ${F1 - F0}; subframes used -> frames:`, JSON.stringify(stats));
  }
  await browser.close();
})();
