const { start2 } = require('./common2');
(async () => { const { ctx, p } = await start2();
  const hideNav = () => p.evaluate(() => { document.querySelectorAll('body *').forEach(e => { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && e.getBoundingClientRect().top > innerHeight * 0.6) { e.dataset.hid = '1'; e.style.visibility = 'hidden'; } }); });
  const showNav = () => p.evaluate(() => document.querySelectorAll('[data-hid]').forEach(e => { e.style.visibility = ''; delete e.dataset.hid; }));
  const full = async n => { await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); await hideNav(); await p.waitForTimeout(200); await p.screenshot({ path: `shots/gest/${n}_nonav.png`, fullPage: true }); await showNav(); console.log('full', n); };
  await p.menu('Gestione'); await p.waitForTimeout(600);
  for (const [v, n, w] of [['andamento', 'andamento', 4000], ['sim', 'cameriere', 4000], ['magazzino', 'magazzino', 2200]]) { await p.evaluate(v => gestGo(v), v); await p.waitForTimeout(w); await full(n); }
  await p.evaluate(() => gestGo('fatture')); await p.waitForTimeout(1500);
  await p.setInputFiles('#gest-file-doc', __dirname + '/fattura-ortofrutta-demo.xml'); await p.waitForTimeout(3000); await full('fattura');
  await p.getByText('ANNULLA', { exact: false }).locator('visible=true').first().click().catch(() => {}); await p.waitForTimeout(800);
  await p.menu('Turni'); await p.waitForTimeout(1500); await p.evaluate(() => typeof turniShiftWeek === 'function' && turniShiftWeek(0)); await full('turni');
  await p.menu('Checklist'); await p.waitForTimeout(1500); await full('checklist');
  await ctx.close(); })();
