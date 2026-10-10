const { start2 } = require('./common2');
(async () => { const { ctx, p } = await start2();
  const ids = await p.evaluate(async () => {
    const P = {}; (await col('profiles').get()).docs.forEach(d => P[d.data().name] = d.id);
    const lists = (await col('checklists').get()).docs.map(d => ({ id: d.id, ...d.data() }));
    const ap = lists.find(l => l.name === 'Apertura'), day = localDateString(new Date(Date.now() - 5 * 3600 * 1000));
    const who = ['Franco', 'Marta', 'Ivan', 'Marta', 'Nadia', 'Sofia', 'Giorgio'], now = Date.now(), items = {};
    ap.items.forEach((it, i) => { if (i < 6) items[it.id] = { state: 'done', byId: P[who[i]], byName: who[i], at: now - (90 - i * 9) * 60000 }; else if (i === 6) items[it.id] = { state: 'doing', byId: P.Giorgio, byName: 'Giorgio', at: now - 6 * 60000 }; });
    await col('checklistRuns').doc(ap.id + '_' + day.replace(/-/g, '')).set({ checklistId: ap.id, date: day, items, leaderId: P.Marta, leaderName: 'Marta' }, { merge: true });
    const bk = {}; (await col('bookings').where('date', '==', document.getElementById('current-date').value).get()).docs.forEach(d => bk[d.data().table] = d.id);
    return { ap: ap.id, bk };
  });
  console.log(JSON.stringify(ids));
  await p.menu('Checklist'); await p.waitForTimeout(1500); await p.evaluate(() => scrollTo(0, 0)); await p.snap('12_checklist', true);
  await p.evaluate(() => chkSelect('tasks')); await p.waitForTimeout(1200); await p.evaluate(() => scrollTo(0, 0)); await p.snap('12b_mansioni', true); console.log((await p.txt()).slice(0, 600));
  await p.menu('Turni'); await p.waitForTimeout(1500); await p.evaluate(() => scrollTo(0, 0)); await p.snap('11_turni', true);
  // service
  await p.evaluate(() => switchTab('tavoli')); await p.waitForTimeout(1200); await p.snap('20_home', true);
  await p.evaluate(() => switchTab('servizio')); await p.waitForTimeout(1500); await p.snap('21_servizio', true); console.log('--- servizio\n' + (await p.txt()).slice(0, 500));
  await p.evaluate(() => switchTab('mappa')); await p.waitForTimeout(1500); await p.snap('22_mappa', false);
  await p.evaluate(() => switchTab('tavoli')); await p.waitForTimeout(800);
  await p.evaluate(id => openComandaComposer(id), ids.bk['11']); await p.waitForTimeout(2000); await p.snap('23_comanda_vuota', false); console.log('--- comanda\n' + (await p.txt()).slice(0, 500));
  await p.evaluate(() => closeComandaComposer()); await p.waitForTimeout(600);
  await p.evaluate(id => openComandaComposer(id), ids.bk['5']); await p.waitForTimeout(2000); await p.snap('24_comanda_t5', true);
  await p.evaluate(() => closeComandaComposer()); await p.waitForTimeout(600);
  await p.evaluate(id => openCassaForBooking(id), ids.bk['4']); await p.waitForTimeout(2500); await p.snap('25_cassa', true); console.log('--- cassa\n' + (await p.txt()).slice(0, 500));
  await ctx.close(); })();
