// Renders every still/overlay PNG for both formats with Playwright.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'build');
fs.mkdirSync(DIR, { recursive: true });
const LOGO = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '..', '..', 'logo.png')).toString('base64');

const FONTCSS = '<style>' + [500,600,700,800].map(w => `@font-face{font-family:'Plus Jakarta Sans';font-weight:${w};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(__dirname, 'font', 'PlusJakartaSans-' + w + '.ttf')).toString('base64')}) format('truetype')}`).join('') + '</style>';

const FORMATS = {
  h: { W: 1920, H: 1080, phone: { x: 1178, y: 68, w: 444, h: 944 } },
  v: { W: 1080, H: 1920, phone: { x: 251, y: 120, w: 577, h: 1227 } },
};

const CAPTIONS = {
  map: ['Piantina', 'La piantina,<br>in tempo reale.'],
  walkin: ['Accoglienza', 'Walk-in e prenotazioni,<br>con un tocco.'],
  search: ['Ricerca', 'Trovi la prenotazione<br>in un secondo.'],
  grid: ['Servizio', 'Tutta la serata,<br>a colpo d’occhio.'],
  allergens: ['Allergeni', 'Le allergie,<br>annotate sul tavolo.'],
  comanda: ['Comanda', 'Dal tavolo,<br>alla comanda.'],
  locanda: ['Sul campo', 'Già al lavoro alla<br>Locanda Del Convento.'],
};

const base = (W, H, body, extraCss = '', bg = 'transparent') => `<!doctype html><html><head>
<meta charset="utf-8">
${FONTCSS}
<style>
  html,body{margin:0;width:${W}px;height:${H}px;background:${bg};overflow:hidden}
  *{box-sizing:border-box}
  body{font-family:'Plus Jakarta Sans',sans-serif;color:#f2f7f5;position:relative;-webkit-font-smoothing:antialiased}
  .accent{color:#2dd8a3}
  .kicker{font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#2dd8a3;display:flex;align-items:center;gap:.6em}
  .kicker::before{content:'';width:.55em;height:.55em;border-radius:50%;background:#2dd8a3;box-shadow:0 0 18px #2dd8a3}
  .head{font-weight:800;letter-spacing:-.02em;word-spacing:.08em;line-height:1.08}
  .logo{border-radius:22.5%;overflow:hidden;box-shadow:0 20px 60px -10px rgba(45,216,163,.35)}
  .logo img{width:100%;height:100%;display:block;transform:scale(1.02)}
  ${extraCss}
</style></head><body>${body}</body></html>`;

async function shot(page, W, H, html, file, omitBackground = true) {
  await page.setViewportSize({ width: W, height: H });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(DIR, file), omitBackground });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const [k, f] of Object.entries(FORMATS)) {
    const { W, H, phone: p } = f;
    const vert = k === 'v';

    // Background: brand dark with soft mint glow behind the phone.
    const gx = p.x + p.w / 2, gy = p.y + p.h / 2;
    await shot(page, W, H, base(W, H, `
      <div style="position:absolute;inset:0;background:
        radial-gradient(${p.w * 1.6}px ${p.h * 0.9}px at ${gx}px ${gy}px, rgba(45,216,163,.16), transparent 70%),
        radial-gradient(1200px 800px at ${vert ? '50% 110%' : '0% 100%'}, rgba(45,216,163,.07), transparent 70%),
        #0a0e0d"></div>
      <div style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;border-radius:${p.w * 0.14}px;
        box-shadow:0 40px 120px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(45,216,163,.18)"></div>`), `bg_${k}.png`, false);

    // Plain background for full-screen cards (no phone shadow).
    await shot(page, W, H, base(W, H, `
      <div style="position:absolute;inset:0;background:
        radial-gradient(${vert ? 900 : 1100}px ${vert ? 900 : 700}px at 50% 45%, rgba(45,216,163,.12), transparent 70%), #0a0e0d"></div>`),
      `bgcard_${k}.png`, false);

    // Captions.
    for (const [name, [kick, head]] of Object.entries(CAPTIONS)) {
      const pos = vert
        ? `left:0;right:0;top:1410px;text-align:center;align-items:center`
        : `left:170px;top:0;bottom:0;width:900px;justify-content:center`;
      await shot(page, W, H, base(W, H, `
        <div style="position:absolute;${pos};display:flex;flex-direction:column;gap:${vert ? 28 : 30}px">
          <div class="kicker" style="font-size:${vert ? 30 : 26}px;${vert ? 'justify-content:center' : ''}">${kick}</div>
          <div class="head" style="font-size:${vert ? 76 : 84}px">${head}</div>
        </div>`), `cap_${name}_${k}.png`);
    }

    // Hook lines.
    const hookSize = vert ? 88 : 104;
    await shot(page, W, H, base(W, H, `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 60px">
        <div class="head" style="font-size:${hookSize}px">Sabato sera.<br>Sala piena.</div>
        <div class="head" style="font-size:${hookSize * 0.62}px;margin-top:${vert ? 56 : 44}px;visibility:hidden">E il quaderno<br>non basta più.</div>
      </div>`), `hook1_${k}.png`);
    await shot(page, W, H, base(W, H, `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 60px">
        <div class="head" style="font-size:${hookSize}px;visibility:hidden">Sabato sera.<br>Sala piena.</div>
        <div class="head" style="font-size:${hookSize * 0.62}px;margin-top:${vert ? 56 : 44}px;color:#9fb3ab;font-weight:600">E il quaderno ${vert ? '<br>' : ''}non basta più.</div>
      </div>`), `hook2_${k}.png`);

    // Logo reveal: mark + wordmark, then tagline.
    const L = vert ? 260 : 220;
    const logoBlock = (showTag, showMark) => `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
        <div style="visibility:${showMark ? 'visible' : 'hidden'};display:flex;flex-direction:column;align-items:center">
          <div class="logo" style="width:${L}px;height:${L}px"><img src="${LOGO}"></div>
          <div class="head" style="font-size:${vert ? 110 : 100}px;margin-top:40px">Sala<span class="accent">Flow</span></div>
        </div>
        <div style="visibility:${showTag ? 'visible' : 'hidden'};font-size:${vert ? 44 : 40}px;font-weight:500;color:#9fb3ab;margin-top:22px;padding:0 60px">
          La tua sala, finalmente sotto controllo.</div>
      </div>`;
    await shot(page, W, H, base(W, H, logoBlock(false, true)), `logo1_${k}.png`);
    await shot(page, W, H, base(W, H, logoBlock(true, false)), `logo2_${k}.png`);

    // End card in four layers (logo+tagline / button / url / team).
    const E = vert ? 220 : 170;
    const layers = [
      `<div class="logo" style="width:${E}px;height:${E}px"><img src="${LOGO}"></div>
       <div class="head" style="font-size:${vert ? 84 : 76}px;margin-top:40px">Dalla sala, <span class="accent">per la sala.</span></div>`,
      `<div style="margin-top:${vert ? 70 : 54}px;padding:${vert ? '30px 64px' : '24px 54px'};border-radius:999px;background:#2dd8a3;color:#06231a;
         font-weight:800;font-size:${vert ? 44 : 36}px;box-shadow:0 14px 40px -10px rgba(45,216,163,.6)">Prenota una visita</div>`,
      `<div style="margin-top:${vert ? 34 : 26}px;font-size:${vert ? 38 : 32}px;font-weight:600;color:#cfe0da;letter-spacing:.02em">salaflow.com</div>`,
      `<div style="margin-top:${vert ? 90 : 60}px;font-size:${vert ? 28 : 22}px;font-weight:500;color:#6f8580">Fatto da Luca, Filippo e Antonio</div>`,
    ];
    for (let i = 0; i < layers.length; i++) {
      const body = layers.map((l, j) => `<div style="visibility:${i === j ? 'visible' : 'hidden'};display:flex;flex-direction:column;align-items:center">${l}</div>`).join('');
      await shot(page, W, H, base(W, H, `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">${body}</div>`), `end${i + 1}_${k}.png`);
    }
  }

  // Phone mask for the 600x1080 crop of demo.mp4 (phone at x 78..522, y 68..1012 in crop).
  await shot(page, 600, 1080, `<html><body style="margin:0;background:#000">
    <div style="position:absolute;left:79px;top:69px;width:442px;height:942px;border-radius:62px;background:#fff"></div></body></html>`, 'mask.png', false);

  await browser.close();
})();
