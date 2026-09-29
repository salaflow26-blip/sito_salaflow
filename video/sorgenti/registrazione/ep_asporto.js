// Episodio 12: asporto dal sito. Rende ordinabili da asporto alcuni piatti (flag sul piatto),
// ordina dalla pagina pubblica come un cliente, accetta in app e invia la comanda.
const { director } = require('./director');
const ASP = ['Tagliatelle al ragù', 'Gnocchi al pomodoro', 'Tiramisù', 'Acqua naturale', 'Frittura di calamari'];
const ep = async d => {
  const { p } = d; const Q = sel => p.locator(sel).locator('visible=true').first();
  // 1. in app: the dish flag
  await p.evaluate(() => switchTab('impostazioni')); await d.wait(900);
  await d.tap(d.V('Piatti'), { silent: true, after: 1200 });
  await d.tap(d.V('Secondi'), { silent: true, after: 900 });
  await d.tap(p.locator('[onclick^="openEditDishModal("]:visible').nth(1), { silent: true, after: 1200 });
  const cb = p.locator('#dish-form-asporto'); await cb.evaluate(e => e.scrollIntoView({ block: 'center' })); await d.wait(600);
  await d.shot({ b: 8, t: 'Scegli cosa si può *portare via*', s: 'Sulla scheda del piatto: “Disponibile per l’asporto”' });
  await d.tap(cb, { after: 500 });
  await d.shot({ b: 6, t: 'La frittura, *sì*', s: 'Salvi, e compare nel menu asporto del sito', zoom: await d.zoomOn(cb.locator('xpath=ancestor::label[1] | ancestor::div[1]').first(), 30) });
  await d.tap(d.R(/salva piatto/i), { silent: true, after: 1500 });
  // 2. the customer
  await p.evaluate(() => openAppMenu()); await d.wait(700); await d.V('Richieste prenotazione').click(); await d.wait(1500);
  const link = await p.evaluate(() => [...document.querySelectorAll('input,a,code,span,div,p')].map(e => (e.value || e.textContent || '').trim()).find(t => /^https:\/\/\S*prenota\.html\?r=\S+$/.test(t)));
  await p.goto(link, { waitUntil: 'load' }); await d.wait(3000);
  await d.shot({ b: 8, t: 'Sul link del locale ora c’è *l’asporto*', s: 'Il cliente sceglie: prenotare un tavolo o ordinare da portare via' });
  await d.tap(p.locator('#mode-btn-asporto'), { after: 1000 });
  await d.shot({ b: 8, t: 'Il *menu asporto*', s: 'Solo i piatti che hai scelto, con prezzi e allergeni' });
  const alg = p.locator('#asporto-form label:visible', { hasText: 'Glutine' }).first();
  await d.tap(alg, { after: 700 });
  await p.locator('#asporto-menu').evaluate(e => e.scrollIntoView({ block: 'start' })); await p.mouse.wheel(0, -60); await d.wait(600);
  await d.shot({ b: 8, t: 'Celiaco? Lo *vede subito*', s: 'Segna l’allergia e i piatti che la contengono si evidenziano' });
  await alg.evaluate(e => e.click()); await d.wait(400);
  const plus = n => p.locator('#asporto-menu').locator(`xpath=.//*[normalize-space(text())="${n}"]/ancestor::div[.//button][1]//button[last()]`).first();
  await d.tap(plus('Tagliatelle al ragù'), { after: 300 }); await d.tap(plus('Tagliatelle al ragù'), { silent: true, after: 300 });
  await p.evaluate(() => { toggleAsportoCategory('Secondi'); toggleAsportoCategory('Dolci'); }); await d.wait(600);
  await d.tap(plus('Frittura di calamari'), { silent: true, after: 300 }); await d.tap(plus('Tiramisù'), { silent: true, after: 300 }); await d.tap(plus('Tiramisù'), { silent: true, after: 600 });
  await p.locator('#asporto-cart-summary').evaluate(e => e.scrollIntoView({ block: 'center' })); await d.wait(500);
  await d.shot({ b: 8, t: 'Aggiunge i *piatti*', s: 'Il totale si aggiorna mentre sceglie' });
  const f = p.locator('#asporto-form');
  await p.fill('#asp-name', 'Davide Neri'); await p.fill('#asp-phone', '347 000 0000');
  await p.locator('#asp-time').selectOption('20:30').catch(() => {});
  await p.locator('#asp-submit-btn').evaluate(e => e.scrollIntoView({ block: 'end' })); await p.mouse.wheel(0, 40); await d.wait(500);
  await d.shot({ b: 8, t: 'Nome, telefono, *orario di ritiro*', s: 'Se a quell’ora la cucina è piena, gli propone un altro orario' });
  await d.tap(p.locator('#asp-submit-btn'), { after: 1000 });
  for (let k = 0; k < 30 && /invio/i.test(await p.locator('#asp-submit-btn').innerText().catch(() => '')); k++) await d.wait(500);
  await d.wait(1500); console.log('ERR:', await p.locator('#asp-form-error').innerText().catch(() => ''), '|', (await p.locator('body').innerText()).slice(0, 300).replace(/\n/g, ' '));
  await d.shot({ b: 8, t: 'Ordine *inviato*', s: 'Non è ancora confermato: decide il locale', settle: 300 });
  // 3. back in the app
  await p.goto('https://salaflow-6d0f7.web.app/', { waitUntil: 'load' }); await d.wait(4000);
  await p.evaluate(() => { const o = document.getElementById('profile-picker-overlay'); if (o && !o.classList.contains('hidden')) closeProfilePicker(); openAppMenu(); }); await d.wait(700);
  await d.V('Richieste prenotazione').click(); await d.wait(1600);
  const card = p.getByText('Davide Neri').locator('visible=true').first(); await card.evaluate(e => e.scrollIntoView({ block: 'center' })); await d.wait(600);
  await d.shot({ b: 10, t: 'Arriva *in app*', s: 'Con i piatti, il totale e l’orario di ritiro. Accetti o rifiuti' });
  await d.tap(d.R(/accetta/i), { after: 1800 });
  await d.shot({ b: 10, t: 'Accetti: la comanda è *già pronta*', s: 'Con i piatti richiesti. Controlli, cambi se serve, e la mandi in cucina' });
  await d.tap(p.locator('#comanda-modal').getByText(/invia comanda/i).first(), { after: 1800 });
  await p.evaluate(() => switchTab('asporto')); await d.wait(1400);
  await d.shot({ b: 10, t: 'Nell’elenco *asporti*', s: 'Con l’orario di ritiro: quando passa, lo trovi pronto' });
};
ep.pre = async () => {
  for (const c of ['asportoRequests', 'asporti']) for (const d of (await col(c).get()).docs) { await col('comande').doc(d.id).delete(); await d.ref.delete(); }
  const want = ['Tagliatelle al ragù', 'Gnocchi al pomodoro', 'Tiramisù', 'Acqua naturale'];
  for (const d of (await col('menuItems').get()).docs) await d.ref.update({ availableForAsporto: want.includes(d.data().name) });
};
director(process.env.EPID || 'asporto', ep);
