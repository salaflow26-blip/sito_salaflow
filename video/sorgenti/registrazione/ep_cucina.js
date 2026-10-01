// Episodio 13: schermo cucina (tablet). Comande di prova a tempi diversi, spunta dei piatti,
// reparto Bar, "Manda in sala", comanda nuova che arriva in diretta.
const { director } = require('./director');
const ORDERS = {
  'Giulia Verdi': { ago: 17, items: [['Bruschette al pomodoro', 3, 1], ['Tagliere di salumi e formaggi', 1, 1], ['Vino della casa ¼', 3, 1], ['Acqua frizzante', 2, 1], ['Tagliatelle al ragù', 3, 2], ['Risotto ai porcini', 3, 2]] },
  'Famiglia Bianchi': { ago: 10, items: [['Tagliatelle al ragù', 1, 1], ['Tagliatelle al ragù', 1, 1, true], ['Gnocchi al pomodoro', 2, 1], ['Birra alla spina', 2, 1], ['Acqua naturale', 1, 1]] },
  'Andrea Colombo': { ago: 3, items: [['Risotto ai porcini', 2, 1], ['Tagliata di manzo', 1, 1], ['Acqua naturale', 1, 1]] },
  'Marco Rossi': { ago: 1, items: [['Spaghetti alle vongole', 2, 1], ['Vino della casa ¼', 1, 1]] },
};
const ep = async d => {
  const { p } = d;
  const ticket = n => p.locator('.cucina-ticket', { hasText: n }).first();
  const dish = (tk, n) => tk.locator('.cucina-dish', { hasText: n });
  const center = async n => { await ticket(n).evaluate(e => e.scrollIntoView({ inline: 'center', block: 'nearest' })); await d.wait(500); };
  await p.evaluate(() => openAppMenu()); await d.wait(800);
  await d.shot({ b: 6, t: 'Un tablet *in cucina*', s: 'Dal menu: “Cucina”' });
  await d.tap(p.locator('#menu-item-cucina'), { after: 1800 });
  await d.shot({ b: 10, t: 'Le comande, *in fila*', s: 'Arrivano dalla sala in tempo reale: una colonna per tavolo, dalla più vecchia' });
  await d.shot({ b: 8, t: 'Cosa c’è *da preparare*', s: 'In alto il totale: quante tagliatelle, quanti risotti, tutti insieme', zoom: await d.zoomUnion(p.locator('.cucina-prep-label'), p.locator('.cucina-prep-chip').nth(1), 10) });
  const old = ticket('Tav. 8');
  await d.shot({ b: 8, t: 'Il tempo *si vede*', s: 'Dopo 9 minuti la comanda diventa gialla, dopo 15 rossa', zoom: await d.zoomOn(old.locator('.cucina-ticket-head'), 12) });
  const al = p.locator('.cucina-allergy-bar').first();
  await al.evaluate(e => e.closest('.cucina-ticket').scrollIntoView({ inline: 'center', block: 'nearest' })); await d.wait(600);
  await d.shot({ b: 8, t: 'Le allergie *in testa*', s: 'Quelle segnate all’accoglienza arrivano sulla comanda', zoom: await d.zoomOn(al, 12) });
  const t5 = ticket('Tav. 5'); await center('Tav. 5');
  await d.shot({ b: 6, t: 'Pronto? *Un tocco*', s: 'Spunti ogni piatto quando esce' });
  await d.tap(dish(t5, 'Gnocchi'), { after: 400 });
  await d.tap(dish(t5, 'Tagliatelle').nth(0), { silent: true, after: 400 });
  await d.tap(dish(t5, 'Tagliatelle').nth(1), { after: 1000 });
  await center('Tav. 5');
  await d.shot({ b: 10, t: 'Cucina fatta, *manca il bar*', s: 'Il tavolo 5 aspetta le birre: la comanda lo dice, e avvisa', settle: 200, zoom: await d.zoomUnion(t5.locator('[data-send]'), p.locator('#cucina-toast-stack .cucina-toast').first(), 14) });
  await d.tap(p.locator('.cucina-dest-tab', { hasText: 'Bar' }), { after: 1400 });
  await d.shot({ b: 8, t: 'Lo schermo del *bar*', s: 'Stessa cosa, solo bevande. I piatti della cucina in piccolo, per sapere a che punto è' });
  const b5 = ticket('Tav. 5'); await center('Tav. 5');
  await d.tap(dish(b5, 'Birra'), { silent: true, after: 400 });
  await d.tap(dish(b5, 'Acqua'), { after: 1000 });
  await center('Tav. 5');
  await d.shot({ b: 8, t: 'Tutto pronto: *in sala*', s: 'Quando ogni reparto ha finito compare “Manda in sala”', zoom: await d.zoomOn(b5.locator('[data-send]'), 50) });
  await d.tap(b5.locator('[data-send]'), { after: 1400 });
  await d.shot({ b: 6, t: 'Evasa', s: 'La comanda esce dallo schermo', settle: 200 });
  await d.tap(p.locator('.cucina-dest-tab', { hasText: 'Cucina' }), { silent: true, after: 1000 });
  await p.evaluate(async () => {
    const items = {}, cats = {}; for (const x of (await col('menuCategories').get()).docs) cats[x.id] = x.data().destinationId || null;
    for (const x of (await col('menuItems').get()).docs) items[x.data().name] = { id: x.id, ...x.data() };
    const L = (n, q, u) => ({ menuItemId: items[n].id, name: n, price: items[n].price, qty: q, uscita: u, extras: [], removals: [], destinationId: cats[items[n].categoryId] });
    const b = (await col('bookings').get()).docs.find(x => x.data().name === 'Luca Moretti');
    await col('comande').doc(b.id).set({ bookingId: b.id, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), items: [L('Frittura di calamari', 2, 1), L('Tagliatelle al ragù', 2, 1), L('Birra alla spina', 4, 1)] });
  }); await d.wait(1800);
  await p.locator('.cucina-ticket', { hasText: 'Tav. 3' }).evaluate(e => e.scrollIntoView({ inline: 'center', block: 'nearest' })); await d.wait(600);
  await d.shot({ b: 8, t: 'Nuova comanda, *subito*', s: 'Il cameriere la invia dal tavolo 3 e appare in fondo alla fila' });
  await d.tap(p.locator('#cucina-settings-btn'), { after: 1000 });
  await d.shot({ b: 8, t: 'Ogni tablet *a modo suo*', s: 'Scegli se vedere anche i piatti degli altri reparti' });
};
ep.pre = async (O) => {
  const TS = firebase.firestore.Timestamp;
  const items = {}, cats = {}; for (const x of (await col('menuCategories').get()).docs) cats[x.id] = x.data().destinationId || null;
  for (const x of (await col('menuItems').get()).docs) items[x.data().name] = { id: x.id, ...x.data() };
  const L = (n, q, u, mod) => ({ menuItemId: items[n].id, name: n, price: items[n].price + (mod ? 1 : 0), qty: q, uscita: u, destinationId: cats[items[n].categoryId],
    extras: mod ? [{ id: 'e1', name: 'Parmigiano extra', price: 1 }] : [], removals: mod ? [{ id: 'r1', name: 'Cipolla' }] : [] });
  for (const x of (await col('comande').get()).docs) await x.ref.delete();
  for (const b of (await col('bookings').get()).docs) { const o = O[b.data().name]; if (!o || b.data().date === '2026-09-25') continue;
    if (b.data().name === 'Andrea Colombo') await b.ref.update({ notes: '⚠️ Allergeni: Glutine' });
    await col('comande').doc(b.id).set({ bookingId: b.id, updatedAt: TS.fromMillis(Date.now() - o.ago * 60000), items: o.items.map(i => L(...i)) }); }
};
ep.preArg = ORDERS;
director('cucina', ep, { w: 768, h: 1024 });
module.exports = { ORDERS };
