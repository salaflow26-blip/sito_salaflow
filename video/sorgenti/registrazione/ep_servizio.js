const { director } = require('./director');
const ep = async d => {
  const { p } = d;
  const tile = n => p.locator('#arrived-list .btn-tap:visible', { hasText: n }).first();
  await d.tap(d.V('Servizio'), { silent: true, after: 1500 });
  await d.shot({ t: 'La sala, *in diretta*', s: 'Ogni tavolo seduto è una tessera, aggiornata su tutti i telefoni', zoom: await d.zoomOn(p.locator('#arrived-list .grid:visible').first(), 8) });
  await d.shot({ b: 8, t: 'Si legge *al volo*', s: 'Da quanto sono seduti, chi ha priorità, chi è pronto per ordinare', zoom: await d.zoomOn(tile('Andrea'), 16) });
  await d.tap(tile('Bianchi'), { after: 1200 });
  await d.shot({ t: 'Tocchi un *tavolo*', s: 'Tutto quello che serve per servirlo' });
  await d.tap(d.R(/avvisa/i), { after: 1400 });
  await d.shot({ b: 10, t: '“Pronti per *ordinare*”', s: 'Con Avvisa lo sa tutta la sala: arriva una notifica a ogni cameriere' });
  await p.evaluate(() => closeServizioModal()); await d.wait(900);
  await d.shot({ b: 6, t: 'Il tavolo *si alza*', s: 'Marco Rossi ha finito: tocchi il tavolo 2' });
  await d.tap(tile('Marco Rossi'), { after: 1200 });
  await d.shot({ b: 6, t: '*Tavolo liberato*', s: 'Un tocco quando se ne vanno' });
  await d.tap(d.R(/tavolo liberato/i), { after: 1200 });
  await d.shot({ b: 10, t: 'Va *riordinato*?', s: 'Te lo chiede, perché un caffè non sporca come una cena' });
  await d.tap(d.R(/sì, va riordinato/i), { after: 1400 });
  await d.shot({ b: 8, t: 'Resta come *promemoria*', s: 'Finché nessuno lo sistema, non lo propone ai walk-in' });
  const rt = p.locator('#tab-servizio .btn-tap:visible', { hasText: /riordin/i }).first();
  if (await rt.count()) { await d.tap(rt, { after: 1400 }); await d.shot({ b: 6, t: 'Sistemato, *di nuovo libero*', s: 'Un tocco e il tavolo torna disponibile' }); }
  // the 90-minute reminder
  await p.evaluate(async () => { const b = (await col('bookings').get()).docs.find(d => d.data().name === 'Andrea Colombo'); await b.ref.update({ arrivedAt: firebase.firestore.Timestamp.fromMillis(Date.now() - 96 * 60000) }); });
  await p.locator('#occupancy-prompt-banner').waitFor({ timeout: 45000 }); await d.wait(1200);
  await d.shot({ b: 10, t: 'Dopo *un’ora e mezza*', s: 'Ti chiede se il tavolo si è alzato. Le tavolate da 7 in su no: restano di più' });
  await d.tap(p.locator('#occupancy-prompt-banner').getByText(/^\s*No/).first(), { after: 1200 });
  await d.shot({ b: 8, t: 'Rispondi *No*', s: 'Te lo richiede fra 20 minuti. “Non lo so” lo passa a un collega' });
};
ep.pre = async () => {
  const TS = firebase.firestore.Timestamp, ago = m => TS.fromMillis(Date.now() - m * 60000);
  for (const d of (await col('bookings').get()).docs) { const x = d.data();
    if (x.name === 'Marco Rossi') await d.ref.update({ arrived: true, departed: false, departedAt: null, needsReset: false, arrivedAt: ago(62) });
    if (x.name === 'Famiglia Bianchi') await d.ref.update({ readyToOrder: false, priority: false });
    if (x.name === 'Andrea Colombo') await d.ref.update({ arrivedAt: ago(14), readyToOrder: true, occupancySnoozedUntil: null });
    if (x.name === 'Sara Conti') await d.ref.update({ needsReset: false });
  }
};
director('servizio', ep);
