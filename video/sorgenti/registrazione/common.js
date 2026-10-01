const { open } = require('./lib');
exports.vis = p => p.evaluate(() => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) { const n = w.currentNode, e = n.parentElement, t = n.textContent.trim(); if (!t || !e) continue;
    const r = e.getBoundingClientRect(), s = getComputedStyle(e); if (r.width && r.height && s.visibility !== 'hidden' && +s.opacity !== 0 && r.bottom > 0 && r.top < innerHeight) out.push(t); }
  return out.join(' · ').replace(/ · Tavoli · Servizio · Cerca · Mappa · Menu · Richieste prenotazione.*$/, ''); });
exports.start = async () => { const { ctx, p } = await open();
  await p.goto('https://salaflow-6d0f7.web.app/', { waitUntil: 'load' }); await p.waitForTimeout(3500);
  const s = p.locator('text=Salta il tour').first(); if (await s.isVisible().catch(() => 0)) await s.click();
  for (let k = 0; k < 30; k++) { if (await p.evaluate(async () => { try { await col('bookings').limit(1).get(); return true; } catch (e) { return false; } })) break; await p.waitForTimeout(1000); }
  p.V = t => p.getByText(t, { exact: true }).locator('visible=true').first();
  p.menu = async it => { await p.click('[aria-label="Apri menu"]'); await p.waitForTimeout(700); await p.V(it).click(); await p.waitForTimeout(1800); };
  p.shot = async n => { await p.screenshot({ path: `shots/${n}.png` }); console.log('\n=== ' + n + '\n' + (await exports.vis(p)).slice(0, 2500)); };
  p.inputs = () => p.evaluate(() => [...document.querySelectorAll('input,textarea,select')].filter(e => e.offsetParent).map(e => `${e.tagName} ${e.type} ph="${e.placeholder}" v="${e.value}"`).join('\n'));
  return { ctx, p }; };
