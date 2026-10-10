const { start2 } = require('./common2');
(async () => { const mode = process.argv[2];
  if (mode === 'tablet') {
    const { ctx, p } = await start2(768, 1024);
    await p.evaluate(() => switchTab('cucina')); await p.waitForTimeout(2500); await p.snap('30_cucina', false); console.log((await p.txt()).slice(0, 600));
    await ctx.close(); return;
  }
  const { ctx, p } = await start2();
  const bk = await p.evaluate(async () => { const b = {}; (await col('bookings').where('date', '==', document.getElementById('current-date').value).get()).docs.forEach(d => b[d.data().table] = d.id); return b; });
  // comanda flow on T11
  await p.evaluate(id => openComandaComposer(id), bk['11']); await p.waitForTimeout(1800);
  await p.locator('text=PRIMI').locator('visible=true').first().click().catch(e => console.log('noprimi', e.message.slice(0, 80))); await p.waitForTimeout(1200);
  await p.snap('26_comanda_primi', false); console.log('--- primi\n' + await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 40).join(' | ')));
  const plusOf = n => p.locator('div', { hasText: n }).locator('button').filter({ hasText: '+' }).locator('visible=true').last();
  for (const n of ['Tagliatelle al ragù', 'Tagliatelle al ragù', 'Risotto ai porcini']) { await p.getByText(n, { exact: true }).locator('visible=true').first().click().catch(e => console.log('noitem', n)); await p.waitForTimeout(500); }
  await p.waitForTimeout(800); await p.snap('27_comanda_add', false);
  await ctx.close(); })();
