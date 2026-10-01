// Records an episode: real app screenshots + where the finger taps + captions -> OUT/<ep>/steps.json
const { open } = require('./lib');
const fs = require('fs'), path = require('path');
const OUT = '/home/user/sito_salaflow/video/sorgenti/build/ep';
exports.director = async (ep, fn, dev = {}) => {
  const dir = path.join(OUT, ep); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const { ctx, p } = await open(dev.w || 430, dev.h || 860);
  p.on('dialog', d => { console.log('DIALOG', d.message()); d.accept(); });
  await p.goto('https://salaflow-6d0f7.web.app/', { waitUntil: 'load' }); await p.waitForTimeout(4000);
  const sk = p.locator('text=Salta il tour').first(); if (await sk.isVisible().catch(() => 0)) { await sk.click(); await p.waitForTimeout(600); }
  await p.addStyleTag({ content: '*{caret-color:transparent!important} ::-webkit-scrollbar{display:none}' });
  await p.locator('[aria-label="Apri menu"]').waitFor({ timeout: 30000 });
  for (let k = 0; k < 30; k++) { if (await p.evaluate(async () => { try { await col('bookings').limit(1).get(); return true; } catch (e) { return false; } })) break; await p.waitForTimeout(1000); }
  if (fn.pre) { await p.evaluate(fn.pre, fn.preArg); await p.waitForTimeout(1000); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(4000); const sk2 = p.locator('text=Salta il tour').first(); if (await sk2.isVisible().catch(() => 0)) await sk2.click(); await p.addStyleTag({ content: '*{caret-color:transparent!important} ::-webkit-scrollbar{display:none}' }); }
  await p.evaluate(() => { const o = document.getElementById('profile-picker-overlay'); if (o && !o.classList.contains('hidden') && typeof closeProfilePicker === 'function') closeProfilePicker(); });
  const steps = []; let last = null;
  const d = {
    p,
    V: t => p.getByText(t, { exact: true }).locator('visible=true').first(),
    R: re => p.getByText(re).locator('visible=true').first(),
    wait: ms => p.waitForTimeout(ms),
    // screenshot = one step of the video. o: {t:'title', s:'sub', bars, zoom:[x,y,w,h] css px}
    shot: async (o) => { await p.waitForTimeout(o.settle ?? 700); const i = steps.length; await p.screenshot({ path: path.join(dir, `${i}.png`) });
      last = Object.assign({ img: `${i}.png` }, o); delete last.settle; steps.push(last); console.log(`[${ep}] ${i}: ${o.t}`); return last; },
    box: async loc => { const b = await loc.boundingBox(); return b && [b.x, b.y, b.width, b.height].map(Math.round); },
    zoomOn: async (loc, pad = 12) => { const b = await d.box(loc); return b && [b[0] - pad, b[1] - pad, b[2] + 2 * pad, b[3] + 2 * pad]; },
    zoomUnion: async (a, b, pad = 12) => { const A = await d.box(a), B = await d.box(b); const x0 = Math.min(A[0], B[0]), y0 = Math.min(A[1], B[1]), x1 = Math.max(A[0] + A[2], B[0] + B[2]), y1 = Math.max(A[1] + A[3], B[1] + B[3]); return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad]; },
    // tap marks the element on the LAST screenshot, then clicks it for real
    tap: async (loc, o = {}) => { await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await d.box(loc); if (last && !o.silent) (last.taps = last.taps || []).push({ b, kind: o.press ? 'press' : 'tap' });
      if (o.press) { await p.mouse.move(b[0] + b[2] / 2, b[1] + b[3] / 2); await p.mouse.down(); await p.waitForTimeout(o.press); await p.mouse.up(); }
      else { try { await loc.click({ timeout: 5000 }); } catch (e) { await loc.evaluate(el => el.click()); } } await p.waitForTimeout(o.after ?? 900); },
    // swipe: finger drag from the card's left part by dx css px; shot o.mid is taken mid-swipe (before releasing)
    swipe: async (loc, dx, o = {}) => { await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await d.box(loc); const x = b[0] + 70, y = b[1] + b[3] / 2;
      if (last && !o.silent) (last.taps = last.taps || []).push({ b: [x - 1, y - 1, 2, 2], kind: 'swipe', dx });
      await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 16; i++) { await p.mouse.move(x + dx * i / 16, y); await p.waitForTimeout(16); }
      if (o.mid) { await p.waitForTimeout(120); await d.shot(o.mid); }
      await p.mouse.up(); await p.waitForTimeout(o.after ?? 1400); },
    // drag from the centre of loc by (dx, dy)
    drag: async (loc, dx, dy, o = {}) => { const b = await d.box(loc); const x = b[0] + b[2] / 2, y = b[1] + b[3] / 2;
      if (last && !o.silent) (last.taps = last.taps || []).push({ b: [x - 1, y - 1, 2, 2], kind: 'swipe', dx, dy });
      await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 20; i++) { await p.mouse.move(x + dx * i / 20, y + dy * i / 20); await p.waitForTimeout(20); }
      await p.mouse.up(); await p.waitForTimeout(o.after ?? 1000); },
    type: async (loc, text) => { await loc.fill(text); await p.waitForTimeout(300); },
    menu: async it => { await d.tap(p.locator('[aria-label="Apri menu"]'), { silent: true, after: 700 }); await d.tap(d.V(it), { silent: true, after: 1500 }); },
  };
  try { await fn(d); } finally {
    fs.writeFileSync(path.join(dir, 'steps.json'), JSON.stringify(steps, null, 1)); fs.writeFileSync(path.join(dir, 'steps.js'), 'window.EP_STEPS = ' + JSON.stringify(steps, null, 1) + ';\n');
    await ctx.close();
  }
};
