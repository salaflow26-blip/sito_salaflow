// Removes everything seed_gest.js / the capture scripts added to the DEMO account and restores its name.
// Docs tagged seed:'rm' go; docs the UI created during capture (no tag) go only if created after START.
const { start } = require('../common');
const START = Number(require('fs').readFileSync(__dirname + '/seed_start.txt', 'utf8'));
(async () => { const { ctx, p } = await start();
  const r = await p.evaluate(async (START) => {
    const out = {}, TS = firebase.firestore.Timestamp.fromMillis(START - 60000);
    const kill = async (docs) => { for (let i = 0; i < docs.length; i += 400) { const b = db.batch(); docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit(); } return docs.length; };
    const ALL = ['bookings', 'comande', 'asporti', 'asportoRequests', 'menuItems', 'menuCategories', 'destinations', 'profiles', 'staffPay', 'shifts', 'attendance', 'shiftSwaps', 'shiftPublishes', 'timeOffRequests', 'turniSettings',
      'inventory', 'suppliers', 'invoices', 'expenses', 'taxSettings', 'checklists', 'checklistRuns', 'tasks', 'sospesi', 'wasteLog', 'availability', 'activityLog', 'bookingRequests', 'floorPlanOverrides'];
    for (const c of ALL) {
      const tagged = (await col(c).where('seed', '==', 'rm').get()).docs;
      let fresh = [];
      try { fresh = (await col(c).where('createdAt', '>=', TS).get()).docs.filter(d => d.data().seed !== 'rm'); } catch (e) {}
      // per-day/settings docs written by the UI without createdAt
      if (['checklistRuns', 'turniSettings', 'taxSettings', 'shiftPublishes', 'attendance'].includes(c)) fresh = (await col(c).get()).docs.filter(d => d.data().seed !== 'rm');
      const n = await kill([...tagged, ...fresh]); if (n) out[c] = n;
    }
    await db.collection('restaurants').doc(currentRestaurantId).update({ name: 'Nuovo Ristorante', tagline: '' });
    return out;
  }, START);
  console.log(JSON.stringify(r)); await ctx.close(); })();
