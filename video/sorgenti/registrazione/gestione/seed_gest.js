// Seeds ~2 months of evenings + management data in the DEMO account only.
// Every doc written here carries seed:'rm' so clean_gest.js removes exactly these.
const { start } = require('../common');
(async () => { const { ctx, p } = await start();
  const r = await p.evaluate(async () => {
    const TS = firebase.firestore.Timestamp, SV = firebase.firestore.FieldValue.serverTimestamp(), M = 'rm';
    let seedN = 42; const rnd = () => { seedN |= 0; seedN = seedN + 0x6D2B79F5 | 0; let t = Math.imul(seedN ^ seedN >>> 15, 1 | seedN); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
    const wpick = list => { const tot = list.reduce((s, x) => s + x[1], 0); let v = rnd() * tot; for (const x of list) { v -= x[1]; if (v <= 0) return x[0]; } return list[list.length - 1][0]; };
    const c2 = n => Math.round(n * 100) / 100;
    const at = (date, hm, addMin = 0) => { const [y, mo, d] = date.split('-').map(Number), [h, m] = hm.split(':').map(Number); return new Date(y, mo - 1, d, h, m + addMin).getTime(); };
    const keyOf = dt => dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    let batch = db.batch(), ops = 0, total = 0;
    const put = async (ref, data) => { batch.set(ref, { ...data, seed: M }); ops++; total++; if (ops >= 400) { await batch.commit(); batch = db.batch(); ops = 0; } };
    const flush = async () => { if (ops) await batch.commit(); batch = db.batch(); ops = 0; };

    // restaurant name shown in the header (restored by clean_gest.js)
    await db.collection('restaurants').doc(currentRestaurantId).update({ name: 'Trattoria Demo', tagline: 'Cucina di casa' });

    // menu
    const dCu = col('destinations').doc(), dBar = col('destinations').doc();
    await put(dCu, { name: 'Cucina', order: 0, createdAt: SV }); await put(dBar, { name: 'Bar', order: 1, createdAt: SV });
    const MENU = [
      ['Antipasti', dCu.id, [['Tagliere di salumi e formaggi', 14, ['Latte'], 1], ['Bruschette al pomodoro', 7, ['Glutine'], 1], ['Frittelle di baccalà', 9, ['Glutine', 'Pesce', 'Uova'], 1]]],
      ['Primi', dCu.id, [['Tagliatelle al ragù', 12, ['Glutine', 'Uova', 'Sedano'], 1], ['Risotto ai porcini', 14, ['Latte'], 0], ['Spaghetti alle vongole', 15, ['Glutine', 'Molluschi'], 0], ['Gnocchi al pomodoro', 11, ['Glutine'], 1]]],
      ['Secondi', dCu.id, [['Tagliata di manzo', 22, [], 0], ['Frittura di calamari', 18, ['Glutine', 'Molluschi'], 1], ['Filetto di branzino', 19, ['Pesce'], 0]]],
      ['Dolci', dCu.id, [['Tiramisù', 6, ['Uova', 'Latte', 'Glutine'], 1], ['Panna cotta', 5, ['Latte'], 1], ['Sorbetto al limone', 4, [], 0]]],
      ['Bevande', dBar.id, [['Acqua naturale', 2.5, [], 1], ['Acqua frizzante', 2.5, [], 1], ['Vino della casa ¼', 5, ['Anidride solforosa'], 0], ['Birra alla spina', 5, ['Glutine'], 0], ['Caffè', 1.5, [], 0]]],
      ['Coperto', null, [['Coperto', 2.5, [], 0]]],
    ];
    const I = {}; let o = 0;
    for (const [cn, dest, items] of MENU) {
      const cref = col('menuCategories').doc(); await put(cref, { name: cn, destinationId: dest, order: o++, createdAt: SV });
      let io = 0;
      for (const [name, price, allergens, asp] of items) { const ref = col('menuItems').doc(); I[name] = { id: ref.id, price, dest };
        await put(ref, { categoryId: cref.id, name, price, description: null, destinationOverrideId: null, allergens, availableForAsporto: !!asp, optionsOverride: null, order: io++, createdAt: SV }); }
    }
    const line = (name, qty, uscita) => ({ menuItemId: I[name].id, name, price: I[name].price, qty, uscita, destinationId: I[name].dest, extras: [], removals: [] });
    const ANT = [['Tagliere di salumi e formaggi', 45], ['Bruschette al pomodoro', 35], ['Frittelle di baccalà', 20]];
    const PRI = [['Tagliatelle al ragù', 36], ['Spaghetti alle vongole', 30], ['Risotto ai porcini', 20], ['Gnocchi al pomodoro', 14]];
    const SEC = [['Tagliata di manzo', 40], ['Frittura di calamari', 35], ['Filetto di branzino', 25]];
    const DOL = [['Tiramisù', 55], ['Panna cotta', 30], ['Sorbetto al limone', 15]];
    const order = people => { const L = {}; const add = (n, u) => { const k = n + '|' + u; L[k] = L[k] || { n, u, q: 0 }; L[k].q++; };
      for (let i = 0; i < Math.max(1, Math.round(people / 2.5)); i++) if (rnd() < .7) add(wpick(ANT), 1);
      for (let i = 0; i < people; i++) { if (rnd() < .78) add(wpick(PRI), 2); if (rnd() < .55) add(wpick(SEC), 3); if (rnd() < .45) add(wpick(DOL), 4); if (rnd() < .6) add('Caffè', 4); if (rnd() < .18) add('Birra alla spina', 1); }
      for (let i = 0; i < Math.ceil(people / 2); i++) { add(rnd() < .6 ? 'Acqua naturale' : 'Acqua frizzante', 1); if (rnd() < .6) add('Vino della casa ¼', 1); }
      return Object.values(L).map(x => line(x.n, x.q, x.u)); };

    const FIRST = ['Marco', 'Giulia', 'Luca', 'Sara', 'Paolo', 'Chiara', 'Andrea', 'Elena', 'Davide', 'Marta', 'Simone', 'Francesca', 'Matteo', 'Laura', 'Stefano', 'Valentina', 'Alessio', 'Federica', 'Roberto', 'Silvia', 'Giorgio', 'Anna', 'Fabio', 'Irene'];
    const LAST = ['Rossi', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferri'];
    const TIMES = ['19:30', '19:45', '20:00', '20:00', '20:15', '20:30', '20:30', '20:45', '21:00', '21:15', '21:30'];

    // history: 11 Aug -> 9 Oct, closed on Mondays; 25 Sep keeps only the team's original bookings
    const BASE = { 2: 8, 3: 9, 4: 11, 5: 15, 6: 18, 0: 13 };
    const d0 = new Date(2026, 7, 11), d1 = new Date(2026, 9, 9); const span = (d1 - d0) / 864e5;
    let nights = 0, bookingsN = 0;
    for (let dt = new Date(d0); dt <= d1; dt.setDate(dt.getDate() + 1)) {
      const dow = dt.getDay(), date = keyOf(dt); if (dow === 1 || date === '2026-09-25') continue;
      const prog = (dt - d0) / 864e5 / span, n = Math.max(5, Math.round(BASE[dow] * (0.9 + 0.22 * prog) + ri(-2, 2)));
      nights++;
      for (let i = 0; i < n; i++) {
        const people = pick([2, 2, 2, 3, 4, 4, 4, 2, 5, 6, 4, 2]), time = pick(TIMES), walk = rnd() < .14, noShow = !walk && rnd() < .03;
        const table = String(((i * 5 + ri(0, 3)) % 14) + 1), ref = col('bookings').doc();
        const b = { date, name: walk ? 'Non Prenotato' : pick(FIRST) + ' ' + pick(LAST), table, joined: [], people, chairs: 0, time, priority: false, priorityAt: null, notes: '', email: null,
          welcome: !noShow, ordered: !noShow, readyToOrder: false, noShow, isWalkin: walk, createdAt: TS.fromMillis(at(date, '12:00', -60 * 24 * ri(0, 6))) };
        if (noShow) { await put(ref, { ...b, arrived: false, arrivedAt: null }); bookingsN++; continue; }
        const a = at(date, time, ri(-5, 12)), z = a + ri(70, 125) * 60000, items = order(people);
        const tot = c2(items.reduce((s, l) => s + l.price * l.qty, 0) + 2.5 * people);
        await put(ref, { ...b, arrived: true, arrivedAt: TS.fromMillis(a), departed: true, departedAt: TS.fromMillis(z), contoSaldato: true, contoSaldatoAt: TS.fromMillis(z - 4 * 60000), metodoPagamento: rnd() < .72 ? 'carta' : 'contanti', contoSaldatoImporto: tot });
        await put(col('comande').doc(ref.id), { bookingId: ref.id, items, updatedAt: TS.fromMillis(a + 25 * 60000), servedAt: TS.fromMillis(a + 70 * 60000), readyKeys: {} });
        bookingsN++;
      }
    }

    // staff, pay and shifts
    const STAFF = [['Franco', 'Cucina', '17:30', '23:30', [2, 3, 4, 5, 6, 0], { mode: 'monthly', rate: 2300, onTop: 35 }],
      ['Nadia', 'Cucina', '18:00', '23:00', [3, 4, 5, 6, 0], { mode: 'hourly', rate: 12, onTop: 30 }],
      ['Marta', 'Sala', '18:30', '23:30', [2, 3, 4, 5, 6], { mode: 'hourly', rate: 12, onTop: 30 }],
      ['Sofia', 'Sala', '18:30', '23:30', [2, 3, 5, 6, 0], { mode: 'hourly', rate: 11, onTop: 30 }],
      ['Giorgio', 'Sala', '19:00', '23:45', [4, 5, 6, 0], { mode: 'hourly', rate: 11, onTop: 30 }],
      ['Ivan', 'Bar', '19:00', '23:45', [4, 5, 6, 0], { mode: 'daily', rate: 85, onTop: 30 }]];
    const P = {};
    for (const [name, role, s, e, days, pay] of STAFF) {
      const ref = col('profiles').doc(); P[name] = ref.id;
      await put(ref, { name, role: name === 'Franco' ? 'gestione' : 'sala', pin: null, createdAt: TS.fromMillis(Date.now() - 864e5 * 60) });
      await put(col('staffPay').doc(ref.id), { profileName: name, mode: pay.mode, rate: pay.rate, onTop: pay.onTop, updatedAt: SV });
      for (let dt = new Date(2026, 8, 1); dt <= new Date(2026, 9, 25); dt.setDate(dt.getDate() + 1)) {
        const date = keyOf(dt); if (!days.includes(dt.getDay())) continue;
        if (name === 'Sofia' && date === '2026-10-15') { await put(col('shifts').doc(), { date, profileId: ref.id, profileName: name, kind: 'off', start: null, end: null, role, note: 'Giorno libero', createdAt: SV, updatedAt: SV }); continue; }
        await put(col('shifts').doc(), { date, profileId: ref.id, profileName: name, kind: 'work', start: s, end: e, role, note: null, createdAt: SV, updatedAt: SV });
      }
    }

    // fixed costs
    const EXP = [['Affitto del locale', 'affitto', 2400, 'monthly', null, '2026-01-01'], ['Commercialista', 'servizi', 220, 'monthly', null, '2026-01-01'],
      ['Assicurazione', 'altro', 1320, 'yearly', null, '2026-01-01'], ['Manutenzione cappa', 'servizi', 380, 'once', '2026-10-03', null]];
    for (const [name, category, amount, kind, date, from] of EXP) await put(col('expenses').doc(), { name, category, amount, kind, date, from, to: null, updatedAt: SV, createdAt: SV });

    // suppliers + invoices (last ~6 weeks)
    const SUP = [['Ortofrutta Demo', 'merce', [180, 320]], ['Pescheria Demo', 'merce', [380, 620]], ['Macelleria Demo', 'merce', [300, 520]], ['Caseificio Demo', 'merce', [160, 300]], ['Cantina Demo', 'merce', [420, 760]], ['Dispensa Demo', 'merce', [200, 420]]];
    for (const [name, category] of SUP) await put(col('suppliers').doc(name.toLowerCase().replace(/[^a-z0-9]+/g, '-')), { name, category, phone: null, email: null, createdAt: SV });
    await put(col('suppliers').doc('energia-demo'), { name: 'Energia Demo', category: 'utenze', phone: null, email: null, createdAt: SV });
    let invN = 0;
    for (let dt = new Date(2026, 7, 25); dt <= new Date(2026, 9, 9); dt.setDate(dt.getDate() + 1)) {
      const dow = dt.getDay(), date = keyOf(dt); if (![2, 4, 5].includes(dow)) continue;
      for (const [name, category, [lo, hi]] of SUP) {
        if (rnd() < (name === 'Ortofrutta Demo' ? .95 : name === 'Pescheria Demo' || name === 'Macelleria Demo' ? .7 : .35)) {
          const taxable = c2(ri(lo, hi) + rnd()), vat = c2(taxable * (name === 'Cantina Demo' ? .22 : .1)), due = new Date(dt); due.setDate(due.getDate() + 30);
          const dueKey = keyOf(due), paid = dueKey < '2026-10-10';
          await put(col('invoices').doc(), { supplierName: name, number: String(ri(100, 999)) + '/' + (dt.getMonth() + 1), date, dueDate: dueKey, documentType: 'fattura', category, lines: [], taxable, vat, total: c2(taxable + vat),
            paid, paidAt: paid ? at(dueKey, '10:00') : null, remind: !paid, remindedDay: null, registeredToStock: false, source: 'xml', createdBy: null, createdAt: TS.fromMillis(at(date, '11:00')) });
          invN++;
        }
      }
    }
    for (const [date, taxable] of [['2026-08-31', 690.4], ['2026-09-30', 742.8]]) { const vat = c2(taxable * .22);
      await put(col('invoices').doc(), { supplierName: 'Energia Demo', number: 'E' + ri(10000, 99999), date, dueDate: date.slice(0, 8) + '28', documentType: 'fattura', category: 'utenze', lines: [], taxable, vat, total: c2(taxable + vat),
        paid: date < '2026-09-15', paidAt: null, remind: true, remindedDay: null, registeredToStock: false, source: 'xml', createdBy: null, createdAt: TS.fromMillis(at(date, '11:00')) }); invN++; }

    // stock
    const now = Date.now(), yest = now - 864e5;
    const INV = [['Mozzarella fiordilatte', 'frigo', 'kg', 3, 4, 'Caseificio Demo', 6, 7.9], ['Parmigiano', 'frigo', 'kg', 4.5, 2, 'Caseificio Demo', 3, 17.5], ['Uova', 'frigo', 'pz', 90, 60, 'Dispensa Demo', 90, .28],
      ['Panna fresca', 'frigo', 'lt', 1, 3, 'Caseificio Demo', 5, 4.2], ['Calamari', 'frigo', 'kg', 0, 3, 'Pescheria Demo', 6, 14.5], ['Branzino', 'frigo', 'pz', 14, 8, 'Pescheria Demo', 12, 6.8],
      ['Controfiletto di manzo', 'frigo', 'kg', 6, 4, 'Macelleria Demo', 5, 24], ['Farina 00', 'dispensa', 'kg', 12, 10, 'Dispensa Demo', 25, .9], ['Riso Carnaroli', 'dispensa', 'kg', 2, 4, 'Dispensa Demo', 10, 3.6],
      ['Olio extravergine', 'dispensa', 'lt', 18, 10, 'Dispensa Demo', 10, 9.5], ['Pomodori pelati', 'dispensa', 'kg', 9, 6, 'Ortofrutta Demo', 10, 1.9], ['Caffè in grani', 'dispensa', 'kg', 1, 2, 'Dispensa Demo', 3, 18],
      ['Vino della casa', 'bevande', 'lt', 40, 20, 'Cantina Demo', 30, 3.2], ['Acqua naturale', 'bevande', 'bott', 48, 36, 'Dispensa Demo', 48, .35], ['Birra alla spina', 'bevande', 'fusti', 1, 2, 'Cantina Demo', 2, 95]];
    for (const [name, category, unit, qty, threshold, supplier, reorderQty, lastPrice] of INV)
      await put(col('inventory').doc(), { name, unit, category, qty, qtyAt: yest, threshold, supplier, reorderQty, menuItemIds: [], unitsPerSale: 1, aliases: [], lastPrice, prevPrice: null, lastPriceAt: yest, lastBuyQty: reorderQty, createdAt: SV, updatedAt: SV });

    // tasks for the checklist board
    await put(col('tasks').doc(), { text: 'La lavastoviglie perde acqua', urgency: 'today', photo: null, state: 'doing', createdById: P.Marta, createdByName: 'Marta', createdAt: TS.fromMillis(now - 50 * 60000), byId: P.Franco, byName: 'Franco', doingAt: TS.fromMillis(now - 20 * 60000) });
    await put(col('tasks').doc(), { text: 'Lampadina fulminata in bagno', urgency: 'today', photo: null, state: 'todo', createdById: P.Giorgio, createdByName: 'Giorgio', createdAt: TS.fromMillis(now - 12 * 60000) });
    await flush();
    return { nights, bookingsN, invN, total, profiles: P, menu: Object.keys(I).length };
  });
  console.log(JSON.stringify(r)); await ctx.close(); })();
