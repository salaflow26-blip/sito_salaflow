// Captures the app screens from stage.html (site timeline) as transparent PNGs for reel.html:
// phone only, flat, scale 2, in a 900x1800 image. dy moves the phone up to show its lower half.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'build', 'reel');
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = [
  ['map', 11.2, 0], ['walkin', 14.9, 0], ['grid', 21.6, 0], ['alg', 25.9, 0],
  ['comanda', 34.7, 0], ['promemoria', 29.6, -700],
];
(async () => {
  const b = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: 900, height: 1800 } });
  await p.goto('file://' + path.join(__dirname, 'stage.html') + '?f=h');
  await p.evaluate(() => window.ready);
  const solo = (sel, tfm) => p.evaluate(([sel, tfm]) => {
    document.documentElement.style.background = document.body.style.background = 'transparent';
    const st = document.getElementById('stage'); st.style.background = 'transparent'; st.style.width = '900px'; st.style.height = '1800px';
    for (const id of ['bgl', 'ui', 'flash', 'grain', 'vig', 'fade']) document.getElementById(id).style.display = 'none';
    const keep = document.querySelector(sel).closest('.dev');
    [...document.getElementById('world').children].forEach(c => c.style.display = c === keep ? '' : 'none');
    keep.style.transform = tfm; keep.style.filter = 'none'; keep.style.opacity = 1;
    document.querySelectorAll('.pop,.tap').forEach(e => e.style.display = 'none');
  }, [sel, tfm]);
  for (const [name, t, dy] of SHOTS) {
    await p.evaluate(t => render(t), t);
    await solo('.phone', `translate3d(450px,${900 + dy}px,0) scale(2)`);
    await p.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: true });
  }
  await p.evaluate(t => render(t), 3.4);
  await solo('#paper', 'translate3d(450px,900px,0) rotate(-5deg) scale(1.35)');
  await p.screenshot({ path: path.join(OUT, 'paper.png'), omitBackground: true });
  await b.close();
})();
