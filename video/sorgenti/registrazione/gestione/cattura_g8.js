const { start2 } = require('./common2');
(async () => { const { ctx, p } = await start2();
  await p.menu('Gestione'); await p.waitForTimeout(800);
  await p.evaluate(() => gestGo('fatture')); await p.waitForTimeout(2000);
  await p.setInputFiles('#gest-file-doc', __dirname + '/fattura-ortofrutta-demo.xml'); await p.waitForTimeout(3000);
  // scroll to the lines and snap a mid view
  await p.evaluate(() => { const h = [...document.querySelectorAll('#gest-root p, #gest-root span, #gest-root h3')].find(e => /Righe lette/i.test(e.textContent)); if (h) h.scrollIntoView({ block: 'start' }); scrollBy(0, -90); }); await p.waitForTimeout(500);
  await p.snap('13b_fattura_righe', false);
  await p.getByText('REGISTRA IN MAGAZZINO', { exact: false }).locator('visible=true').first().click().catch(async () => p.getByText('Registra in magazzino').first().click());
  await p.waitForTimeout(1200); await p.snap('14_fattura_registrata', false); console.log((await p.txt()).slice(0, 500));
  await p.evaluate(() => gestGo('magazzino')); await p.waitForTimeout(2000); await p.evaluate(() => scrollTo(0, 0)); await p.snap('05_magazzino', true);
  await p.evaluate(() => gestGo('spesa')); await p.waitForTimeout(2000); await p.evaluate(() => scrollTo(0, 0)); await p.snap('06_spesa', true);
  await p.evaluate(() => gestGo('fatture')); await p.waitForTimeout(2000); await p.evaluate(() => scrollTo(0, 0)); await p.snap('04_fatture', true);
  // checklist
  await p.menu('Checklist'); await p.waitForTimeout(1200);
  await p.getByText('Crea Apertura e Chiusura di esempio', { exact: false }).locator('visible=true').first().click(); await p.waitForTimeout(2500);
  await p.evaluate(() => scrollTo(0, 0)); await p.snap('12_checklist_new', true); console.log('--- chk\n' + await p.txt());
  console.log('CHK DOM', await p.evaluate(() => [...document.querySelectorAll('#checklist-root button, [id*=chk] button, button[onclick*=chk]')].filter(b => b.offsetParent).slice(0, 40).map(b => (b.getAttribute('onclick') || '').slice(0, 60) + ' :: ' + b.innerText.trim().replace(/\s+/g, ' ').slice(0, 50)).join('\n')));
  await ctx.close(); })();
