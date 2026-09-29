// Seeds a realistic evening in the DEMO account only. Every doc gets seed:true so clean_seed.js can remove exactly these.
const { start } = require('./common');
(async () => { const { ctx, p } = await start();
  const r = await p.evaluate(async () => {
    const TS = firebase.firestore.Timestamp, now = Date.now(), ago = m => TS.fromMillis(now - m * 60000), SV = firebase.firestore.FieldValue.serverTimestamp();
    const date = document.getElementById('current-date').value;
    const dCu = (await col('destinations').add({ name: 'Cucina', order: 0, seed: true, createdAt: SV })).id;
    const dBar = (await col('destinations').add({ name: 'Bar', order: 1, seed: true, createdAt: SV })).id;
    const MENU = [
      ['Antipasti', dCu, [['Tagliere di salumi e formaggi', 14, ['Latte']], ['Bruschette al pomodoro', 7, ['Glutine']], ['Frittelle di baccalà', 9, ['Glutine', 'Pesce', 'Uova']]]],
      ['Primi', dCu, [['Tagliatelle al ragù', 12, ['Glutine', 'Uova', 'Sedano']], ['Risotto ai porcini', 14, ['Latte']], ['Spaghetti alle vongole', 15, ['Glutine', 'Molluschi']], ['Gnocchi al pomodoro', 11, ['Glutine']]]],
      ['Secondi', dCu, [['Tagliata di manzo', 22, []], ['Frittura di calamari', 18, ['Glutine', 'Molluschi']], ['Filetto di branzino', 19, ['Pesce']]]],
      ['Dolci', dCu, [['Tiramisù', 6, ['Uova', 'Latte', 'Glutine']], ['Panna cotta', 5, ['Latte']], ['Sorbetto al limone', 4, []]]],
      ['Bevande', dBar, [['Acqua naturale', 2.5, []], ['Acqua frizzante', 2.5, []], ['Vino della casa ¼', 5, ['Anidride solforosa']], ['Birra alla spina', 5, ['Glutine']], ['Caffè', 1.5, []]]],
      ['Coperto', null, [['Coperto', 2.5, []]]],
    ];
    let o = 0;
    for (const [cn, dest, items] of MENU) {
      const cid = (await col('menuCategories').add({ name: cn, destinationId: dest, order: o++, seed: true, createdAt: SV })).id;
      let io = 0;
      for (const [name, price, allergens] of items) await col('menuItems').add({ categoryId: cid, name, price, description: null, destinationOverrideId: null, allergens, availableForAsporto: false, optionsOverride: null, order: io++, seed: true, createdAt: SV });
    }
    const B = (table, name, people, time, x = {}) => col('bookings').add(Object.assign({ date, name, table, joined: [], people, chairs: 0, time, priority: false, priorityAt: null, notes: '', email: null,
      arrived: false, arrivedAt: null, welcome: false, ordered: false, readyToOrder: false, noShow: false, isWalkin: false, seed: true, createdAt: SV }, x));
    await B('1', 'Sara Conti', 2, '19:30', { arrived: true, arrivedAt: ago(110), welcome: true, ordered: true, departed: true, departedAt: ago(25), welcomeAllergens: [] });
    await B('2', 'Marco Rossi', 2, '19:30', { arrived: true, arrivedAt: ago(55), welcome: true, ordered: true });
    await B('5', 'Famiglia Bianchi', 4, '19:45', { arrived: true, arrivedAt: ago(40), welcome: true, chairs: 1, notes: 'Passeggino' });
    await B('8', 'Giulia Verdi', 6, '20:00', { arrived: true, arrivedAt: ago(18), priority: true, priorityAt: ago(18), notes: 'Compleanno' });
    await B('11', 'Andrea Colombo', 3, '20:00', { arrived: true, arrivedAt: ago(9), welcome: true, readyToOrder: true });
    await B('3', 'Luca Moretti', 4, '20:30');
    await B('9', 'Chiara Galli', 4, '20:45', { notes: 'Celiaca' });
    await B('12', 'Paolo Ricci', 6, '21:00');
    await B('14', 'Elena Ferrari', 2, '21:15');
    await B('6', 'Davide Marino', 4, '21:30', { notes: 'Occhio di Riguardo' });
    return 'ok ' + date;
  });
  console.log(r); await p.waitForTimeout(3000); await p.screenshot({ path: 'shots/seed_home.png' });
  await ctx.close(); })();
