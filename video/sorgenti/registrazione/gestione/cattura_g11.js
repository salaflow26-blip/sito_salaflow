const { start2 } = require('./common2');
(async () => { const mode = process.argv[2];
  if (mode === 'fix') { const { ctx, p } = await start2();
    console.log(await p.evaluate(async () => { const TS = firebase.firestore.Timestamp;
      const b = (await col('bookings').where('date', '==', document.getElementById('current-date').value).get()).docs.find(d => d.data().table === '5');
      await b.ref.update({ notes: '⚠️ Allergeni: Glutine' });
      const c = col('comande').doc(b.id), x = (await c.get()).data();
      x.items.forEach(it => { if (it.removals && it.removals.length) it.removals = [{ name: 'Cipolla' }]; });
      await c.update({ items: x.items, updatedAt: TS.fromMillis(Date.now() - 5 * 60000) }); return 'fixed'; }));
    await p.menu('Gestione'); await p.waitForTimeout(600);
    for (const [v, n] of [['magazzino', '05_magazzino'], ['spesa', '06_spesa'], ['fatture', '04_fatture']]) { await p.evaluate(v => gestGo(v), v); await p.waitForTimeout(2200); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); await p.snap(n, true); }
    await p.evaluate(() => switchTab('mappa')); await p.waitForTimeout(1500);
    await ctx.close(); return; }
  const { ctx, p } = await start2(768, 1024);
  await p.evaluate(() => switchTab('cucina')); await p.waitForTimeout(2500); await p.snap('30_cucina', false);
  await ctx.close(); })();
