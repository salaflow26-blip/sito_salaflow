// node render.js stills h 1.2,5,10  -> stills/h_<t>.png
// node render.js video h [fps] [workers] -> out_h.mp4 (no audio)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
const FF = process.env.FFMPEG || 'ffmpeg';
const [mode, f, arg, wk] = process.argv.slice(2);
const W = f === 'h' ? 1920 : 1080, H = f === 'h' ? 1080 : 1920;
const url = 'file://' + path.join(__dirname, 'stage.html') + '?f=' + f;
async function open(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(url); await page.evaluate(() => window.ready);
  return page;
}
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
  if (mode === 'stills') {
    const page = await open(browser);
    fs.mkdirSync(path.join(__dirname, 'build', 'stills'), { recursive: true });
    for (const t of arg.split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(__dirname, 'build', 'stills', `${f}_${t}.png`) });
    }
  } else {
    const fps = +(arg || 60), workers = +(wk || 3);
    const dur = await (await open(browser)).evaluate(() => DURATION);
    const N = Math.round(dur * fps), per = Math.ceil(N / workers);
    await Promise.all([...Array(workers)].map(async (_, w) => {
      const page = await open(browser);
      const a = w * per, b = Math.min(N, a + per);
      const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(__dirname, 'build', `part_${f}_${w}.mp4`)]);
      for (let i = a; i < b; i++) {
        await page.evaluate(t => render(t), i / fps);
        const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        if (i % 300 === 0) console.log(f, 'w' + w, i, '/', b);
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r));
    }));
    fs.writeFileSync(path.join(__dirname, 'build', `parts_${f}.txt`), [...Array(workers)].map((_, w) => `file 'part_${f}_${w}.mp4'`).join('\n'));
  }
  await browser.close();
})();
