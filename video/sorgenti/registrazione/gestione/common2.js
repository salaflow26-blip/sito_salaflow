const { open } = require('../lib');
exports.start2 = async (w = 430, h = 860, who = 'Franco') => { const { ctx, p } = await open(w, h);
  await p.goto('https://salaflow-6d0f7.web.app/', { waitUntil: 'load' }); await p.waitForTimeout(3500);
  const s = p.locator('text=Salta il tour').first(); if (await s.isVisible().catch(() => 0)) await s.click();
  for (let k = 0; k < 30; k++) { if (await p.evaluate(async () => { try { await col('bookings').limit(1).get(); return true; } catch (e) { return false; } })) break; await p.waitForTimeout(1000); }
  const card = p.locator('#profile-picker-cards').getByText(who, { exact: true }).first();
  if (await card.isVisible().catch(() => 0)) { await card.click(); await p.waitForTimeout(1500); }
  const s2 = p.locator('text=Salta il tour').first(); if (await s2.isVisible().catch(() => 0)) { await s2.click(); await p.waitForTimeout(500); }
  p.V = t => p.getByText(t, { exact: true }).locator('visible=true').first();
  p.menu = async it => { await p.click('[aria-label="Apri menu"]'); await p.waitForTimeout(700); await p.V(it).click(); await p.waitForTimeout(1800); };
  p.snap = async (n, full) => { await p.screenshot({ path: `shots/gest/${n}.png` }); if (full) await p.screenshot({ path: `shots/gest/${n}_full.png`, fullPage: true }); console.log('shot', n); };
  p.txt = () => p.evaluate(() => { const out=[]; const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); while(w.nextNode()){const n=w.currentNode,e=n.parentElement,t=n.textContent.trim(); if(!t||!e) continue; const r=e.getBoundingClientRect(); if(r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(e).visibility!=='hidden') out.push(t);} return out.join(' · ').replace(/ · Tavoli · Servizio · Cerca · Mappa · Menu · Prenotazioni e asporto.*$/,'').slice(0,1800); });
  return { ctx, p }; };
