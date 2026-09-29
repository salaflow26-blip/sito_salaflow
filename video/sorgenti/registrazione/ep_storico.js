const { director } = require('./director');
const ep = async d => {
  const { p } = d; const Q = sel => p.locator(sel).locator('visible=true').first();
  await p.evaluate(() => openAppMenu()); await d.wait(800);
  await d.shot({ b: 6, t: 'Ogni serata *resta*', s: 'Dal menu: Storico e Grafici' });
  await d.tap(d.V('Storico'), { after: 1400 });
  await d.shot({ b: 8, t: 'Lo *storico*', s: 'Giorno per giorno: tavoli prenotati, arrivati e coperti' });
  await d.tap(p.getByText('25/09/2026').locator('visible=true').first(), { after: 1600 });
  await d.shot({ b: 8, t: 'Riapri una *serata*', s: 'Chi c’era, a che ora, a che tavolo, con che note' });
  await p.evaluate(() => { document.getElementById('current-date').value = new Date().toISOString().slice(0, 10); document.getElementById('current-date').dispatchEvent(new Event('change', { bubbles: true })); }); await d.wait(1200);
  await p.evaluate(() => openAppMenu()); await d.wait(700);
  await d.tap(d.V('Grafici'), { silent: true, after: 1600 });
  await d.shot({ b: 8, t: 'I *grafici*', s: 'Esporti la serata in Excel e vedi i coperti per sala' });
  const avg = p.locator('#avg-occupancy-card');
  if (await avg.isVisible().catch(() => false)) { await avg.evaluate(e => e.scrollIntoView({ block: 'center' })); await d.wait(600);
    await d.shot({ b: 8, t: 'Tempo medio *al tavolo*', s: 'Da quando arrivano a quando si alzano, calcolato da solo', zoom: await d.zoomOn(avg, 12) }); }
  const sel = p.locator('select:visible').last(); await sel.selectOption({ index: 1 }); await sel.evaluate(e => e.scrollIntoView({ block: 'start' })); await d.wait(1500);
  await d.shot({ b: 8, t: 'Picco degli *arrivi*', s: 'A che ora arriva la gente: sai quando serve una persona in più' });
  await sel.selectOption({ index: 0 }); await sel.evaluate(e => e.scrollIntoView({ block: 'start' })); await d.wait(1500);
  await d.shot({ b: 8, t: 'I coperti *nel tempo*', s: 'Serata dopo serata, l’andamento del locale' });
};
ep.pre = async () => { await db.collection('restaurants').doc(currentRestaurantId).update({ requireProfilePin: false }); for (const d of (await col('profiles').get()).docs) await d.ref.delete(); try { localStorage.clear(); } catch (e) {} };
director('storico', ep);
