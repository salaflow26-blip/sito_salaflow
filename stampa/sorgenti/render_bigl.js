const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1600 } });
  await p.goto('file://' + path.join(__dirname, 'biglietto.html')); await p.evaluate(() => window.ready); await p.waitForTimeout(300);
  for (const id of ['front', 'back']) await p.locator('#' + id).screenshot({ path: `/tmp/claude-0/bigl_${id}.png` });
  await b.close(); })();
