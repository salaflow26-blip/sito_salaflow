// node fixcap.js <ep> <index> <field> <value> : edit a caption without re-recording
const fs = require('fs'), [ep, i, k, v] = process.argv.slice(2), D = '/home/user/sito_salaflow/video/sorgenti/build/ep/' + ep;
const s = JSON.parse(fs.readFileSync(D + '/steps.json')); s[+i][k] = isNaN(+v) ? v : +v;
fs.writeFileSync(D + '/steps.json', JSON.stringify(s, null, 1)); fs.writeFileSync(D + '/steps.js', 'window.EP_STEPS = ' + JSON.stringify(s, null, 1) + ';\n');
