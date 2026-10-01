const { chromium } = require('playwright'); const path = require('path');
const P = ['Luca Piersanti', 'Filippo Ferroni', 'Antonio Ragnoli'];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1600 } });
  for (const n of P) { await p.goto('file://' + path.join(__dirname, 'biglietto.html') + '?n=' + encodeURIComponent(n)); await p.evaluate(() => window.ready); await p.waitForTimeout(300);
    await p.locator('#front').screenshot({ path: `/tmp/claude-0/bigl_${n.split(' ')[0].toLowerCase()}.png` }); }
  await b.close(); })();
