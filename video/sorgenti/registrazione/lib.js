const { chromium } = require('playwright');
// SPKI pin of the agent proxy CA (it changes when the container restarts): trusts that CA only, verification stays on
const SPKI = require('child_process').execSync("openssl x509 -in /root/.ccr/agent-proxy-ca.crt -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64").toString().trim();
exports.open = async (w = 430, h = 932) => {
  const ctx = await chromium.launchPersistentContext(__dirname + '/profile', {
    args: ['--ignore-certificate-errors-spki-list=' + SPKI, '--lang=it-IT'], viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: 'Europe/Rome', locale: 'it-IT', env: { ...process.env, LANG: 'it_IT.UTF-8', LC_ALL: 'it_IT.UTF-8', LANGUAGE: 'it' } });
  const p = ctx.pages()[0] || await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  return { ctx, p };
};
exports.dump = async (p, name) => {
  await p.screenshot({ path: `shots/${name}.png`, fullPage: true });
  console.log('=== ' + name + ' | ' + p.url());
  console.log((await p.evaluate(() => document.body.innerText)).slice(0, 3000));
};
