const { start2 } = require('./common2');
(async () => { const { ctx, p } = await start2();
  const r = await p.evaluate(async () => {
    const c2 = n => Math.round(n * 100) / 100; let b = db.batch(), n = 0, inv = 0, bk = 0;
    const flush = async () => { if (n) await b.commit(); b = db.batch(); n = 0; };
    for (const d of (await col('invoices').where('seed', '==', 'rm').get()).docs) { const x = d.data(); if (x.category !== 'merce') continue;
      const taxable = c2(x.taxable * .62), vat = c2(taxable * (x.supplierName === 'Cantina Demo' ? .22 : .1)); b.update(d.ref, { taxable, vat, total: c2(taxable + vat) }); n++; inv++; if (n >= 400) await flush(); }
    for (const d of (await col('bookings').where('seed', '==', 'rm').get()).docs) { const x = d.data(); if (!(x.date < '2026-09-10') || typeof x.contoSaldatoImporto !== 'number') continue;
      b.update(d.ref, { contoSaldatoImporto: c2(x.contoSaldatoImporto * .95) }); n++; bk++; if (n >= 400) await flush(); }
    await flush(); return { inv, bk, now: new Date().toString() };
  });
  console.log(JSON.stringify(r)); await ctx.close(); })();
