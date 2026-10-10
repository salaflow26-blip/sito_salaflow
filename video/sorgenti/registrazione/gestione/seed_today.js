// Tonight's live service in the DEMO account (seed:'rm').
const { start2 } = require('./common2');
(async () => { const { ctx, p } = await start2();
  const r = await p.evaluate(async () => {
    const TS = firebase.firestore.Timestamp, now = Date.now(), ago = m => TS.fromMillis(now - m * 60000), SV = firebase.firestore.FieldValue.serverTimestamp();
    const date = document.getElementById('current-date').value;
    const I = {}; (await col('menuItems').where('seed', '==', 'rm').get()).docs.forEach(d => I[d.data().name] = { id: d.id, ...d.data() });
    const cats = {}; (await col('menuCategories').where('seed', '==', 'rm').get()).docs.forEach(d => cats[d.id] = d.data());
    const L = (name, qty, uscita, x = {}) => ({ menuItemId: I[name].id, name, price: I[name].price + (x.extras || []).reduce((s, e) => s + e.price, 0), qty, uscita, destinationId: cats[I[name].categoryId].destinationId, extras: x.extras || [], removals: x.removals || [] });
    const B = async (table, name, people, time, x = {}, items) => { const ref = col('bookings').doc();
      await ref.set(Object.assign({ date, name, table, joined: [], people, chairs: 0, time, priority: false, priorityAt: null, notes: '', email: null, arrived: false, arrivedAt: null, welcome: false, ordered: false, readyToOrder: false, noShow: false, isWalkin: false, seed: 'rm', createdAt: ago(60 * 24 * 2) }, x));
      if (items) await col('comande').doc(ref.id).set({ bookingId: ref.id, items: items.items, updatedAt: ago(items.ago), readyKeys: items.ready || {}, nudges: {}, seed: 'rm', ...(items.served ? { servedAt: ago(items.served) } : {}) });
      return ref.id; };
    await B('1', 'Sara Conti', 2, '19:30', { arrived: true, arrivedAt: ago(95), welcome: true, ordered: true, departed: true, departedAt: ago(8), contoSaldato: true, contoSaldatoAt: ago(12), metodoPagamento: 'carta', contoSaldatoImporto: 61 }, { ago: 80, served: 40, items: [L('Bruschette al pomodoro', 1, 1), L('Tagliatelle al ragù', 2, 2), L('Tiramisù', 1, 4), L('Acqua naturale', 1, 1), L('Vino della casa ¼', 1, 1)] });
    await B('2', 'Marco Rossi', 2, '19:30', { arrived: true, arrivedAt: ago(88), welcome: true, ordered: true }, { ago: 75, served: 30, items: [L('Spaghetti alle vongole', 2, 2), L('Filetto di branzino', 1, 3), L('Acqua frizzante', 1, 1)] });
    await B('4', 'Famiglia Bianchi', 4, '19:45', { arrived: true, arrivedAt: ago(70), welcome: true, ordered: true, chairs: 1, notes: 'Passeggino' }, { ago: 55, served: 20, items: [L('Tagliere di salumi e formaggi', 1, 1), L('Tagliatelle al ragù', 2, 2), L('Gnocchi al pomodoro', 2, 2), L('Tagliata di manzo', 2, 3), L('Acqua naturale', 2, 1)] });
    await B('5', 'Famiglia Ferri', 4, '20:00', { arrived: true, arrivedAt: ago(42), welcome: true, ordered: true, welcomeAllergens: ['Glutine'], notes: 'Celiaca' }, { ago: 14, items: [L('Frittelle di baccalà', 1, 1), L('Risotto ai porcini', 2, 2), L('Tagliatelle al ragù', 1, 2, { extras: [{ name: 'Parmigiano extra', price: 1 }], removals: ['Cipolla'] }), L('Frittura di calamari', 2, 3), L('Acqua naturale', 2, 1), L('Birra alla spina', 2, 1)], ready: {} });
    await B('8', 'Giulia Verdi', 6, '20:00', { arrived: true, arrivedAt: ago(38), priority: true, priorityAt: ago(38), welcome: true, ordered: true, notes: 'Compleanno' }, { ago: 9, items: [L('Tagliere di salumi e formaggi', 2, 1), L('Bruschette al pomodoro', 2, 1), L('Spaghetti alle vongole', 3, 2), L('Tagliatelle al ragù', 3, 2), L('Vino della casa ¼', 3, 1), L('Acqua naturale', 3, 1)] });
    await B('11', 'Andrea Colombo', 3, '20:15', { arrived: true, arrivedAt: ago(22), welcome: true, readyToOrder: true });
    await B('7', 'Laura Mancini', 2, '20:30', { arrived: true, arrivedAt: ago(12), welcome: true });
    await B('3', 'Luca Moretti', 4, '21:00');
    await B('9', 'Chiara Galli', 4, '21:00', { notes: 'Celiaca' });
    await B('12', 'Paolo Ricci', 6, '21:15');
    await B('14', 'Elena Ferrari', 2, '21:15');
    await B('6', 'Davide Marino', 4, '21:30', { notes: 'Occhio di Riguardo' });
    await B('10', 'Non Prenotato', 2, '20:40', { isWalkin: true, arrived: true, arrivedAt: ago(10), welcome: true });
    return 'ok ' + date + ' ' + Object.keys(I).length;
  });
  console.log(r); await p.waitForTimeout(2500); await p.snap('00_home_live', true); await ctx.close(); })();
