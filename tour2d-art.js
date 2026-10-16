// Disegni fissi del giro: le tre stanze del locale (Sala, Cucina, Ufficio), il cielo di notte, i tavoli e i clienti.
// Tutto SVG scritto a mano, nei colori del sito. Le parti che si muovono (porta, fiamme, comanda, grafico...)
// hanno un id e le pilota tour2d.js.
export const MENTA = '#2dd8a3', WARM = '#ffc983';
const SKIN = ['#e8b894', '#d49a72', '#a8744f', '#f2cdb0', '#c08a62'];
const SKIN_SH = ['#cf9d79', '#b9805b', '#8d5c3b', '#d9b394', '#a6704c'];
export const X_CUC = 1600, X_UFF = 2800, WORLD_W = 3800;

// ---------------------------------------------------------------- clienti seduti (di fronte, dietro il tavolo)
export function guestMarkup(x, shirt, skin, hair, style, k, yb, chair) {
    const s = SKIN[skin], ss = SKIN_SH[skin];
    const hy = yb - 168;
    let h = '';
    if (style === 'long') h += `<path d="M${x - 30},${hy + 2} C${x - 34},${hy - 34} ${x + 34},${hy - 34} ${x + 30},${hy + 2} L${x + 34},${hy + 52} C${x + 20},${hy + 60} ${x - 20},${hy + 60} ${x - 34},${hy + 52} Z" fill="${hair}"/>`;
    const face = `<ellipse cx="${x}" cy="${hy}" rx="25" ry="28" fill="${s}"/><ellipse cx="${x - 25}" cy="${hy + 4}" rx="4.5" ry="6.5" fill="${ss}"/><ellipse cx="${x + 25}" cy="${hy + 4}" rx="4.5" ry="6.5" fill="${ss}"/><path d="M${x - 6},${hy + 10} q6,6 12,0" fill="none" stroke="${ss}" stroke-width="2.2" stroke-linecap="round"/>`;
    let top = '';
    if (style === 'short') top = `<path d="M${x - 27},${hy - 4} C${x - 30},${hy - 34} ${x + 30},${hy - 34} ${x + 27},${hy - 4} C${x + 20},${hy - 18} ${x + 4},${hy - 20} ${x - 6},${hy - 14} C${x - 14},${hy - 10} ${x - 22},${hy - 8} ${x - 27},${hy - 4} Z" fill="${hair}"/>`;
    else if (style === 'long') top = `<path d="M${x - 27},${hy + 2} C${x - 30},${hy - 34} ${x + 30},${hy - 34} ${x + 27},${hy + 2} C${x + 22},${hy - 16} ${x + 6},${hy - 20} ${x - 4},${hy - 17} C${x - 14},${hy - 12} ${x - 22},${hy - 6} ${x - 27},${hy + 2} Z" fill="${hair}"/>`;
    else if (style === 'bun') top = `<circle cx="${x}" cy="${hy - 34}" r="12" fill="${hair}"/><path d="M${x - 27},${hy - 2} C${x - 30},${hy - 34} ${x + 30},${hy - 34} ${x + 27},${hy - 2} C${x + 18},${hy - 18} ${x - 18},${hy - 18} ${x - 27},${hy - 2} Z" fill="${hair}"/>`;
    else if (style === 'curly') top = [[-22, -14, 13], [-8, -24, 14], [8, -25, 14], [22, -14, 13], [0, -14, 15]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${hy + dy}" r="${r}" fill="${hair}"/>`).join('');
    return `<g transform="translate(${x} ${yb}) scale(${k}) translate(${-x} ${-yb})">`
        + (chair ? `<rect x="${x - 58}" y="${yb - 168}" width="116" height="190" rx="26" fill="#22312b"/><rect x="${x - 58}" y="${yb - 168}" width="116" height="14" rx="7" fill="#32463e"/>` : '')
        + `<path d="M${x - 44},${yb - 108} L${x - 52},${yb - 52} L${x - 36},${yb - 12}" fill="none" stroke="${shirt}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>`
        + `<path d="M${x + 44},${yb - 108} L${x + 52},${yb - 52} L${x + 36},${yb - 12}" fill="none" stroke="${shirt}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>`
        + `<path d="M${x - 50},${yb} L${x - 50},${yb - 84} C${x - 50},${yb - 112} ${x - 30},${yb - 122} ${x - 14},${yb - 124} L${x + 14},${yb - 124} C${x + 30},${yb - 122} ${x + 50},${yb - 112} ${x + 50},${yb - 84} L${x + 50},${yb} Z" fill="${shirt}"/>`
        + `<path d="M${x + 14},${yb - 124} C${x + 30},${yb - 122} ${x + 50},${yb - 112} ${x + 50},${yb - 84} L${x + 50},${yb} L${x + 22},${yb} L${x + 26},${yb - 90} C${x + 26},${yb - 108} ${x + 22},${yb - 120} ${x + 14},${yb - 124} Z" fill="#00000033"/>`
        + `<rect x="${x - 9}" y="${yb - 142}" width="18" height="24" rx="8" fill="${ss}"/>` + h + face + top
        + `<ellipse cx="${x - 40}" cy="${yb - 9}" rx="8" ry="6.5" fill="${s}"/><ellipse cx="${x + 40}" cy="${yb - 9}" rx="8" ry="6.5" fill="${s}"/></g>`;
}

export function tableMarkup(x, y, rx, drop = 118) {
    const ry = rx * 0.14;
    let t = `<path d="M${x - rx},${y} L${x - rx - 6},${y + drop} Q${x - rx * 0.5},${y + drop + 16} ${x},${y + drop + 10} Q${x + rx * 0.5},${y + drop + 16} ${x + rx + 6},${y + drop} L${x + rx},${y} Z" fill="url(#cloth)"/>`;
    for (const fx of [-0.72, -0.38, 0.0, 0.38, 0.72]) t += `<path d="M${x + rx * fx},${y + ry * 0.9} Q${x + rx * fx * 1.04},${y + drop * 0.5} ${x + rx * fx * 1.06},${y + drop + 8}" fill="none" stroke="#000" stroke-opacity=".10" stroke-width="3"/>`;
    t += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f3ead8"/><ellipse cx="${x}" cy="${y}" rx="${rx - 10}" ry="${ry - 3}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
    return { table: t, shadow: `<ellipse cx="${x}" cy="${y + drop + 12}" rx="${rx + 40}" ry="${rx * 0.16}" fill="#000" opacity=".5"/>` };
}

// tavolo lontano con due clienti (solo per riempire la sala: più scuro e senza dettagli)
export function farTable(x, y, k, seed) {
    const rx = 190 * k;
    const cols = [['#46606f', 'long', '#2a1d14'], ['#7a4a3a', 'short', '#1a1411'], ['#516b57', 'bun', '#3b2a1c'], ['#6e5a3a', 'short', '#4a3a2a']];
    const a = cols[seed % 4], b = cols[(seed + 1) % 4];
    const t = tableMarkup(x, y, rx, Math.round(112 * k));
    return `<g opacity=".86">${t.shadow}${guestMarkup(x - 62 * k, a[0], seed % 5, a[2], a[1], k * 0.92, y + 18, true)}${guestMarkup(x + 62 * k, b[0], (seed + 2) % 5, b[2], b[1], k * 0.92, y + 18, true)}${t.table}<circle cx="${x}" cy="${y - 6}" r="${22 * k + 8}" fill="url(#candle)" opacity=".8"/><ellipse cx="${x}" cy="${y - 4}" rx="5" ry="5" fill="${WARM}"/></g>`;
}

// ---------------------------------------------------------------- colori e sfumature comuni
export function defsMarkup() {
    return `<defs>
 <linearGradient id="wallS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1110"/><stop offset="1" stop-color="#16231e"/></linearGradient>
 <linearGradient id="wallK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1816"/><stop offset="1" stop-color="#1b2c28"/></linearGradient>
 <linearGradient id="wallU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c141a"/><stop offset="1" stop-color="#16232b"/></linearGradient>
 <linearGradient id="floorS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16211c"/><stop offset="1" stop-color="#080c0b"/></linearGradient>
 <linearGradient id="floorK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2623"/><stop offset="1" stop-color="#0a0f0e"/></linearGradient>
 <linearGradient id="floorU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2420"/><stop offset="1" stop-color="#0a0e0d"/></linearGradient>
 <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a25"/><stop offset="1" stop-color="#17303a"/></linearGradient>
 <linearGradient id="cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece2cd"/><stop offset="1" stop-color="#a99d86"/></linearGradient>
 <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a9993"/><stop offset="1" stop-color="#53615c"/></linearGradient>
 <linearGradient id="steelD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6c66"/><stop offset="1" stop-color="#37433f"/></linearGradient>
 <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b08a5a"/><stop offset="1" stop-color="#7d5f3b"/></linearGradient>
 <linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a17"/><stop offset="1" stop-color="#070a09"/></linearGradient>
 <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${WARM}" stop-opacity=".22"/><stop offset="1" stop-color="${WARM}" stop-opacity="0"/></linearGradient>
 <radialGradient id="pool"><stop offset="0" stop-color="${WARM}" stop-opacity=".30"/><stop offset="1" stop-color="${WARM}" stop-opacity="0"/></radialGradient>
 <radialGradient id="candle"><stop offset="0" stop-color="${WARM}" stop-opacity=".55"/><stop offset="1" stop-color="${WARM}" stop-opacity="0"/></radialGradient>
 <radialGradient id="glowM"><stop offset="0" stop-color="${MENTA}" stop-opacity=".5"/><stop offset="1" stop-color="${MENTA}" stop-opacity="0"/></radialGradient>
 <radialGradient id="glowC"><stop offset="0" stop-color="#cfeaff" stop-opacity=".45"/><stop offset="1" stop-color="#cfeaff" stop-opacity="0"/></radialGradient>
 <linearGradient id="doorGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2c18"/><stop offset="1" stop-color="#8a6a3a"/></linearGradient>
</defs>`;
}

// ---------------------------------------------------------------- cielo (fisso allo schermo, con un po' di parallasse)
export function skyMarkup() {
    let stars = '';
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) {
        const x = rnd() * 1800 - 100, y = rnd() * 520, r = 0.8 + rnd() * 1.6, o = 0.25 + rnd() * 0.6;
        stars += `<circle class="star" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#eef3f0" opacity="${f(o)}" style="animation-delay:${f(rnd() * 5)}s"/>`;
    }
    // palazzi lontani (sagome con qualche finestra accesa)
    const far = (baseY, color, seedN, op, win) => {
        let s2 = seedN; const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
        let out = '', x = -120;
        while (x < 1800) {
            const w = 90 + r2() * 150, h = 90 + r2() * 260;
            out += `<rect x="${f(x)}" y="${f(baseY - h)}" width="${f(w)}" height="${f(h + 400)}" fill="${color}" opacity="${op}"/>`;
            if (win) for (let k = 0; k < 6; k++) if (r2() > 0.55) out += `<rect x="${f(x + 12 + r2() * (w - 30))}" y="${f(baseY - h + 16 + r2() * (h - 40))}" width="7" height="10" fill="${WARM}" opacity="${f(0.35 + r2() * 0.4)}"/>`;
            x += w + 8 + r2() * 30;
        }
        return out;
    };
    return `<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05080a"/><stop offset=".6" stop-color="#0a1411"/><stop offset="1" stop-color="#101d19"/></linearGradient>
<radialGradient id="moonG"><stop offset="0" stop-color="#eef3f0" stop-opacity=".35"/><stop offset="1" stop-color="#eef3f0" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#skyG)"/>
<g class="sky-far">${stars}<circle cx="1330" cy="150" r="120" fill="url(#moonG)"/><circle cx="1330" cy="150" r="30" fill="#e8efe9" opacity=".92"/><circle cx="1320" cy="142" r="6" fill="#cfd8d3" opacity=".7"/><circle cx="1338" cy="160" r="4" fill="#cfd8d3" opacity=".6"/><circle cx="1342" cy="140" r="3" fill="#cfd8d3" opacity=".5"/></g>
<g class="sky-mid">${far(760, '#0d1714', 11, 0.9, true)}</g>
<g class="sky-near">${far(900, '#0a110f', 23, 1, false)}</g>`;
}
const f = (n) => (Math.round(n * 10) / 10).toString();

// ---------------------------------------------------------------- SALA (x 0..1600): sfondo, e poi in primo piano le luci
export function salaBack() {
    let s = '';
    s += `<rect width="1600" height="640" fill="url(#wallS)"/><rect y="390" width="1600" height="250" fill="#13201b"/><rect y="388" width="1600" height="6" fill="#26372f"/>`;
    for (let i = 0; i < 1600; i += 160) s += `<rect x="${i + 14}" y="410" width="132" height="200" rx="6" fill="none" stroke="#1d2e27" stroke-width="3"/>`;
    s += `<rect y="632" width="1600" height="14" fill="#0b1210"/>`;
    // porta d'ingresso sulla parete di fondo (si apre sulla strada: luce calda)
    s += `<g id="door"><rect x="104" y="412" width="132" height="226" rx="10" fill="#26372f"/><rect x="114" y="422" width="112" height="216" rx="6" fill="url(#doorGlow)"/>`
        + `<rect x="114" y="422" width="112" height="216" rx="6" fill="#0a0e0d" id="doorDark" opacity=".5"/>`
        + `<polygon id="doorLeaf" points="114,422 226,422 226,638 114,638" fill="#3a2e22" stroke="#4a3a2a" stroke-width="3"/><circle id="doorKnob" cx="210" cy="540" r="5" fill="${WARM}"/></g>`;
    s += `<ellipse cx="170" cy="640" rx="150" ry="22" fill="${WARM}" opacity=".12" id="doorSpill"/>`;
    // finestre sulla notte
    for (const wx of [640, 1010]) {
        s += `<g><rect x="${wx}" y="92" width="290" height="240" rx="10" fill="#0e1b24"/><rect x="${wx}" y="92" width="290" height="240" rx="10" fill="url(#night)"/>`;
        for (const [bx, by, br, bc] of [[40, 170, 9, '#ffd9a0'], [96, 140, 6, '#9fd8ff'], [150, 190, 11, '#ffb27a'], [214, 150, 7, '#ffe6b8'], [250, 205, 8, '#9fd8ff'], [70, 230, 6, '#ffc983']]) s += `<circle class="bokeh" cx="${wx + bx}" cy="${by + 60}" r="${br}" fill="${bc}" opacity=".5"/>`;
        s += `<rect x="${wx}" y="92" width="290" height="240" rx="10" fill="none" stroke="#31453c" stroke-width="9"/><rect x="${wx + 142}" y="92" width="7" height="240" fill="#31453c"/><rect x="${wx}" y="206" width="290" height="7" fill="#31453c"/></g>`;
    }
    // mensola con bottiglie
    s += `<rect x="1190" y="180" width="330" height="9" rx="4" fill="#3a2e22"/>`;
    ['#2f6a55', '#a2492f', '#caa456', '#3c6a8a', '#7d9e58', '#b4452f', '#d8b86c', '#3d7a62', '#4a4f8c'].forEach((c, i) => {
        const bx = 1204 + i * 35, h = 34 + (i * 7) % 18;
        s += `<rect x="${bx}" y="${180 - h}" width="17" height="${h}" rx="6" fill="${c}"/><rect x="${bx + 5}" y="${180 - h - 14}" width="7" height="16" rx="3" fill="${c}"/><rect x="${bx + 3}" y="${180 - h + 8}" width="3" height="${h - 16}" rx="1.5" fill="#fff" opacity=".22"/>`;
    });
    // pavimento
    s += `<rect y="640" width="1600" height="260" fill="url(#floorS)"/>`;
    for (let i = -6; i < 22; i++) s += `<path d="M${i * 110},640 L${i * 110 - (i - 8) * 70},900" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`;
    s += `<ellipse cx="930" cy="760" rx="520" ry="110" fill="url(#pool)"/><ellipse cx="400" cy="660" rx="260" ry="46" fill="url(#pool)" opacity=".5"/><ellipse cx="1330" cy="670" rx="280" ry="50" fill="url(#pool)" opacity=".55"/>`;
    // tavoli lontani
    s += farTable(560, 600, 0.6, 1) + farTable(1330, 624, 0.7, 3);
    return s;
}
// il tavolo 8 (sotto di lui i clienti che entrano, sopra i clienti seduti)
export const T8 = { x: 930, y: 660, rx: 218 };
export function sala8Under() {
    const t = tableMarkup(T8.x, T8.y, T8.rx);
    return { shadow: t.shadow, cloth: t.table };
}
export function sala8Seated() {
    const people = [[808, '#587c99', 0, '#1d150f', 'short', 1.0], [898, '#d9a545', 3, '#4a3320', 'curly', 0.72], [968, '#8fbfa4', 4, '#1a1411', 'long', 0.70], [1056, '#c4684a', 1, '#2e2018', 'bun', 0.97]];
    return people.map(([x, sh, sk, hr, st, k]) => guestMarkup(x, sh, sk, hr, st, k, 668, true));
}
export function sala8Top() {
    let s = '';
    for (const px of [812, 900, 970, 1052]) s += `<ellipse cx="${px}" cy="676" rx="30" ry="6.4" fill="#fffdf5"/><ellipse cx="${px}" cy="676" rx="19" ry="3.6" fill="#e9e1cf"/>`;
    s += `<g><rect x="850" y="632" width="9" height="30" rx="3" fill="#cfe6e0" opacity=".85"/><rect x="1004" y="632" width="9" height="30" rx="3" fill="#cfe6e0" opacity=".85"/><ellipse cx="930" cy="651" rx="40" ry="8" fill="#a0662e"/><ellipse cx="930" cy="647" rx="34" ry="6" fill="#d9a76a"/>`
        + `<rect x="923" y="624" width="14" height="26" rx="3" fill="#f6efe0"/><ellipse id="flame" cx="930" cy="618" rx="4.5" ry="9" fill="${WARM}"/><circle cx="930" cy="618" r="46" fill="url(#candle)"/></g>`;
    return s;
}
export function salaLamps() {
    let s = '';
    for (const [lx, ly, k] of [[930, 232, 1.0], [398, 230, 0.7], [1326, 232, 0.74], [160, 250, 0.6]]) {
        const w = 74 * k;
        s += `<g><line x1="${lx}" y1="0" x2="${lx}" y2="${f(ly - 48 * k)}" stroke="#3a4a43" stroke-width="3"/><path d="M${f(lx - w)},${ly} Q${f(lx - w)},${f(ly - 50 * k)} ${lx},${f(ly - 52 * k)} Q${f(lx + w)},${f(ly - 50 * k)} ${f(lx + w)},${ly} Z" fill="#2d463b"/>`
            + `<path d="M${f(lx - w)},${ly} Q${f(lx - w)},${f(ly - 50 * k)} ${f(lx - w * 0.2)},${f(ly - 52 * k)} L${f(lx - w * 0.4)},${ly} Z" fill="#fff" opacity=".12"/><ellipse cx="${lx}" cy="${ly}" rx="${f(w)}" ry="${f(10 * k)}" fill="${WARM}"/></g>`;
        const bot = 640 + (k === 1 ? 40 : 0);
        s += `<path d="M${f(lx - w * 0.9)},${ly} L${f(lx - w * 3.1)},${bot} L${f(lx + w * 3.1)},${bot} L${f(lx + w * 0.9)},${ly} Z" fill="url(#cone)"/>`;
    }
    return s;
}
// piccolo cartello «Riservato» sul tavolo 8 (poi diventa «Arrivati»)
export function sala8Card() {
    return `<g id="t8card"><path d="M902,640 L958,640 L952,668 L908,668 Z" fill="#fffdf5" stroke="#cfc7b2" stroke-width="1.5"/><rect id="t8cardBar" x="912" y="648" width="36" height="5" rx="2.5" fill="#a89572"/><rect x="916" y="657" width="28" height="3" rx="1.5" fill="#cfc7b2"/></g>`;
}

// ---------------------------------------------------------------- CUCINA (coordinate locali 0..1200, poi traslata a x=1600)
export function cucina() {
    let s = '';
    s += `<rect width="1200" height="640" fill="url(#wallK)"/>`;
    // piastrelle
    for (let y = 120; y < 640; y += 62) s += `<path d="M0,${y} H1200" stroke="#0b1513" stroke-width="2" opacity=".7"/>`;
    for (let x = 0; x < 1200; x += 86) s += `<path d="M${x},120 V640" stroke="#0b1513" stroke-width="2" opacity=".5"/>`;
    s += `<rect width="1200" height="120" fill="#0a1210"/><rect y="640" width="1200" height="14" fill="#0b1210"/>`;
    // pavimento a scacchi
    s += `<rect y="640" width="1200" height="260" fill="url(#floorK)"/>`;
    for (let i = -4; i < 20; i++) s += `<path d="M${i * 90},640 L${i * 90 - (i - 7) * 60},900" stroke="#000" stroke-opacity=".22" stroke-width="2"/>`;
    s += `<ellipse cx="700" cy="760" rx="440" ry="90" fill="url(#pool)" opacity=".7"/>`;
    // passavivande (finestra nel muro a sinistra) con luce calda
    // cappa sopra i fuochi
    s += `<path d="M640,260 L1040,260 L1000,150 L680,150 Z" fill="url(#steelD)"/><rect x="760" y="60" width="160" height="92" fill="url(#steelD)"/><path d="M640,260 L1040,260" stroke="#9fb0a9" stroke-width="3"/><rect x="660" y="262" width="360" height="9" fill="${WARM}" opacity=".55"/>`;
    // mestoli appesi
    s += `<path d="M330,200 H560" stroke="#8a9993" stroke-width="5" stroke-linecap="round"/>`;
    [[360, 70], [410, 90], [470, 60], [520, 80]].forEach(([x, l], i) => { s += `<path d="M${x},200 V${200 + l}" stroke="#8a9993" stroke-width="4"/><ellipse cx="${x}" cy="${200 + l + 10}" rx="${i % 2 ? 14 : 10}" ry="${i % 2 ? 10 : 12}" fill="#8a9993"/>`; });
    // schermo cucina sulla parete (due stati: comanda nuova / tutto pronto)
    s += `<g id="kScreen"><rect x="360" y="330" width="240" height="150" rx="10" fill="#05080a" stroke="#33463e" stroke-width="4"/>`
        + `<g id="scrNew"><rect x="376" y="346" width="100" height="118" rx="6" fill="#10201b" stroke="${MENTA}" stroke-width="2"/><rect x="386" y="358" width="60" height="6" rx="3" fill="${MENTA}"/><rect x="386" y="374" width="76" height="5" rx="2.5" fill="#cfd8d3" opacity=".6"/><rect x="386" y="388" width="64" height="5" rx="2.5" fill="#cfd8d3" opacity=".6"/><rect x="386" y="402" width="70" height="5" rx="2.5" fill="#cfd8d3" opacity=".6"/><rect x="386" y="424" width="48" height="26" rx="6" fill="#d9a545"/>`
        + `<rect x="490" y="346" width="96" height="54" rx="6" fill="#0b1411" stroke="#22332d" stroke-width="2"/><rect x="490" y="410" width="96" height="54" rx="6" fill="#0b1411" stroke="#22332d" stroke-width="2"/></g>`
        + `<g id="scrDone" opacity="0"><rect x="376" y="346" width="208" height="118" rx="6" fill="#0f2a22" stroke="${MENTA}" stroke-width="2"/><path d="M432,402 l22,22 l46,-50" fill="none" stroke="${MENTA}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><rect x="450" y="440" width="110" height="16" rx="8" fill="${MENTA}"/></g>`
        + `<circle cx="480" cy="405" r="150" fill="url(#glowM)" opacity=".35"/></g>`;
    // stecca delle comande con i biglietti
    s += `<rect x="100" y="300" width="230" height="7" rx="3" fill="#9fb0a9"/>`;
    [[130, '#f1f4f2'], [180, '#f1f4f2'], [230, '#f1f4f2']].forEach(([x, c]) => { s += `<rect x="${x}" y="307" width="34" height="62" rx="3" fill="${c}"/><rect x="${x + 5}" y="316" width="22" height="3" fill="#8a9993"/><rect x="${x + 5}" y="326" width="16" height="3" fill="#b3c0ba"/><rect x="${x + 5}" y="336" width="20" height="3" fill="#b3c0ba"/>`; });
    s += `<g id="kTicket" opacity="0"><rect x="274" y="307" width="34" height="62" rx="3" fill="#f1f4f2"/><rect x="279" y="316" width="22" height="3" fill="${MENTA}"/><rect x="279" y="326" width="16" height="3" fill="#8a9993"/><rect x="279" y="336" width="20" height="3" fill="#8a9993"/><rect x="279" y="346" width="12" height="3" fill="#8a9993"/><circle cx="291" cy="338" r="46" fill="url(#glowM)"/></g>`;
    // lampada di calore sul passe
    s += `<rect x="30" y="440" width="270" height="10" rx="5" fill="#d9822e"/><path d="M30,450 L300,450 L350,668 L-20,668 Z" fill="${WARM}" opacity=".10"/>`;
    // il passe: bancone in acciaio
    s += `<rect x="0" y="668" width="330" height="20" fill="url(#steel)"/><rect x="10" y="688" width="310" height="62" fill="url(#steelD)"/><path d="M20,708 H300 M20,730 H300" stroke="#2a3733" stroke-width="3"/>`;
    s += `<g id="passPlates" opacity="0">${plateOnPass(60, 664)}${plateOnPass(140, 664)}${plateOnPass(220, 664)}</g>`;
    // tavolo da lavoro con tagliere
    s += `<rect x="380" y="590" width="270" height="18" fill="url(#steel)"/><rect x="394" y="608" width="242" height="70" fill="url(#steelD)"/><rect x="420" y="574" width="110" height="16" rx="3" fill="#b08a5a"/><circle cx="560" cy="582" r="10" fill="#c4684a"/><circle cx="586" cy="584" r="8" fill="#7d9e58"/><path d="M450,572 l56,-6" stroke="#cfd8d3" stroke-width="5" stroke-linecap="round"/>`;
    // cucina: fuochi con pentole
    s += `<rect x="690" y="576" width="360" height="30" fill="url(#steel)"/><rect x="700" y="606" width="340" height="84" fill="url(#steelD)"/>`;
    [740, 830, 920, 1000].forEach(x => { s += `<circle cx="${x}" cy="690" r="9" fill="#0b1210" stroke="#9fb0a9" stroke-width="2"/>`; });
    s += `<g id="flames">${[760, 850, 940].map((x, i) => `<g class="flame" data-i="${i}"><path d="M${x - 14},576 C${x - 20},560 ${x - 6},548 ${x},534 C${x + 6},548 ${x + 20},560 ${x + 14},576 Z" fill="#ff9d3c" opacity=".9"/><path d="M${x - 7},576 C${x - 10},566 ${x - 2},560 ${x},550 C${x + 2},560 ${x + 10},566 ${x + 7},576 Z" fill="#ffe08a"/></g>`).join('')}</g>`;
    s += `<g><rect x="722" y="500" width="76" height="72" rx="6" fill="#6f7f79"/><rect x="716" y="496" width="88" height="10" rx="4" fill="#8a9993"/><rect x="796" y="522" width="26" height="8" rx="4" fill="#4a5853"/>`
        + `<path d="M812,590 H935 L945,572 H826 Z" fill="#37433f"/><ellipse cx="880" cy="574" rx="64" ry="9" fill="#8a9993"/><rect x="940" y="566" width="62" height="7" rx="3" fill="#4a5853"/>`
        + `<rect x="962" y="506" width="76" height="68" rx="6" fill="#516059"/><rect x="956" y="502" width="88" height="10" rx="4" fill="#8a9993"/></g>`;
    s += `<g id="steam">${[0, 1, 2, 3, 4, 5].map(i => `<ellipse class="puff" data-i="${i}" cx="${760 + (i % 3) * 90}" cy="480" rx="14" ry="10" fill="#dfe8e3" opacity="0"/>`).join('')}</g>`;
    // scaffale a destra con barattoli
    s += `<rect x="1080" y="260" width="100" height="8" rx="3" fill="#3a2e22"/><rect x="1080" y="370" width="100" height="8" rx="3" fill="#3a2e22"/><rect x="1080" y="480" width="100" height="8" rx="3" fill="#3a2e22"/>`;
    [[1090, 224, '#c4684a'], [1122, 236, '#d9a545'], [1150, 230, '#7d9e58'], [1096, 334, '#d9a545'], [1130, 330, '#c4684a'], [1160, 338, '#8fbfa4'], [1100, 444, '#7d9e58'], [1140, 440, '#d9a545']].forEach(([x, y, c]) => { s += `<rect x="${x}" y="${y}" width="26" height="${36}" rx="6" fill="${c}" opacity=".85"/><rect x="${x + 4}" y="${y - 6}" width="18" height="8" rx="3" fill="#cfd8d3"/>`; });
    return s;
}
function plateOnPass(x, y) {
    return `<ellipse cx="${x}" cy="${y}" rx="38" ry="8" fill="#fffdf5"/><ellipse cx="${x}" cy="${y}" rx="24" ry="4.5" fill="#e9e1cf"/><path d="M${x - 14},${y - 2} q8,-16 18,-4 q10,-12 14,4 q-16,6 -32,0z" fill="#c4684a"/><circle cx="${x + 8}" cy="${y - 10}" r="4" fill="#7d9e58"/>`;
}

// ---------------------------------------------------------------- UFFICIO (coordinate locali 0..1000, poi traslata a x=2800)
export function ufficio() {
    let s = '';
    s += `<rect width="1000" height="640" fill="url(#wallU)"/><rect y="640" width="1000" height="14" fill="#0b1210"/><rect y="640" width="1000" height="260" fill="url(#floorU)"/>`;
    for (let i = -4; i < 18; i++) s += `<path d="M${i * 90},640 L${i * 90 - (i - 6) * 60},900" stroke="#000" stroke-opacity=".2" stroke-width="2"/>`;
    s += `<ellipse cx="500" cy="760" rx="420" ry="90" fill="url(#glowC)" opacity=".6"/>`;
    // finestra sulla città
    s += `<g><rect x="600" y="90" width="320" height="250" rx="8" fill="url(#night)"/>`;
    for (let i = 0; i < 22; i++) { const x = 612 + (i * 37) % 296, y = 140 + (i * 53) % 190; s += `<rect x="${x}" y="${y}" width="${6 + (i % 3) * 3}" height="${8 + (i % 4) * 4}" fill="${i % 4 ? WARM : '#9fd8ff'}" opacity="${0.35 + (i % 5) * 0.1}"/>`; }
    s += `<rect x="600" y="90" width="320" height="250" rx="8" fill="none" stroke="#33463e" stroke-width="9"/><rect x="756" y="90" width="8" height="250" fill="#33463e"/></g>`;
    // lavagna con il grafico
    s += `<g><rect x="70" y="100" width="380" height="240" rx="10" fill="#0b1311" stroke="#33463e" stroke-width="6"/><text x="96" y="140" font-family="ui-monospace,Menlo,monospace" font-size="17" font-weight="700" letter-spacing="2" fill="#a9b6b0">INCASSO E COPERTI</text>`
        + `<path d="M96,300 H424" stroke="#a9b6b0" stroke-opacity=".3" stroke-width="2"/>`;
    for (let i = 0; i < 8; i++) s += `<rect class="wbar" data-i="${i}" x="${104 + i * 40}" y="300" width="26" height="4" rx="3" fill="${i === 4 ? MENTA : '#dcc29c'}" opacity="${i === 4 ? 1 : 0.75}"/>`;
    s += `</g>`;
    // scaffale con faldoni
    s += `<rect x="20" y="420" width="260" height="8" rx="3" fill="#3a2e22"/><rect x="20" y="520" width="260" height="8" rx="3" fill="#3a2e22"/>`;
    ['#6e8f86', '#c4684a', '#d9a545', '#587c99', '#8fbfa4', '#a0662e', '#516b57'].forEach((c, i) => { s += `<rect x="${32 + i * 34}" y="${368 + (i % 3) * 6}" width="26" height="${52 - (i % 3) * 6}" rx="3" fill="${c}" opacity=".85"/>`; });
    ['#587c99', '#d9a545', '#c4684a', '#6e8f86', '#7d9e58', '#a0662e'].forEach((c, i) => { s += `<rect x="${36 + i * 38}" y="${468 + (i % 2) * 4}" width="30" height="${52 - (i % 2) * 4}" rx="3" fill="${c}" opacity=".8"/>`; });
    // pianta
    s += `<g transform="translate(940 640)"><rect x="-26" y="-60" width="52" height="60" rx="10" fill="#2c3b36"/>`
        + `<path d="M0,-60 C-60,-100 -70,-170 -40,-220 C-10,-170 -4,-110 0,-60 Z" fill="#1e3a2c"/><path d="M0,-60 C50,-110 80,-170 62,-230 C28,-190 6,-120 0,-60 Z" fill="#244634"/><path d="M0,-60 C-8,-130 8,-210 34,-260 C32,-190 16,-120 0,-60 Z" fill="#183226"/></g>`;
    // scrivania in legno
    s += `<rect x="330" y="600" width="600" height="18" rx="4" fill="url(#wood)"/><rect x="350" y="618" width="560" height="120" fill="#6a4f31"/><rect x="368" y="634" width="190" height="86" rx="6" fill="#5a4229"/><rect x="578" y="634" width="190" height="86" rx="6" fill="#5a4229"/><rect x="520" y="574" width="14" height="10" fill="#cfd8d3" opacity="0"/>`;
    // monitor con il grafico
    s += `<g><rect x="610" y="440" width="230" height="150" rx="10" fill="#05080a" stroke="#33463e" stroke-width="5"/><rect x="636" y="590" width="26" height="12" fill="#33463e"/><rect x="700" y="590" width="100" height="10" rx="5" fill="#33463e"/><rect x="624" y="454" width="202" height="122" rx="5" fill="#0c1311"/>`
        + `<text x="636" y="476" font-family="ui-monospace,Menlo,monospace" font-size="12" font-weight="700" fill="#a9b6b0">UTILE STIMATO</text>`;
    for (let i = 0; i < 8; i++) s += `<rect class="mbar" data-i="${i}" x="${638 + i * 24}" y="560" width="16" height="3" rx="2" fill="${i === 5 ? MENTA : '#dcc29c'}" opacity=".8"/>`;
    s += `<circle cx="725" cy="515" r="150" fill="url(#glowC)" opacity=".55"/></g>`;
    // lampada, tazza, fogli
    s += `<g><path d="M390,600 L420,520 L470,500" fill="none" stroke="#9fb0a9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M455,494 L500,486 L494,512 Z" fill="#2d463b"/><path d="M458,506 L498,500 L540,600 L440,600 Z" fill="${WARM}" opacity=".10"/></g>`;
    s += `<rect x="860" y="572" width="26" height="28" rx="5" fill="#fffdf5"/><path d="M886,580 q14,2 0,14" fill="none" stroke="#fffdf5" stroke-width="5"/>`;
    s += `<g id="paperA"><rect x="520" y="584" width="70" height="14" rx="2" fill="#f1f4f2" transform="rotate(-3 555 590)"/><rect x="526" y="580" width="62" height="12" rx="2" fill="#e4ebe7" transform="rotate(2 555 586)"/></g>`;
    // flash della foto alla fattura
    s += `<circle id="flash" cx="470" cy="520" r="120" fill="#fff" opacity="0"/>`;
    return s;
}

// ---------------------------------------------------------------- involucro del palazzo: muri, tetto, insegna, strada
export function building() {
    let s = '';
    // strada e marciapiede
    s += `<rect x="-9000" y="900" width="22000" height="2400" fill="url(#street)"/><rect x="-9000" y="960" width="22000" height="8" fill="#1d2a25"/><rect x="-9000" y="1040" width="22000" height="6" fill="#16221e" opacity=".7"/>`;
    for (let x = -2200; x < 6000; x += 220) s += `<rect x="${x}" y="1100" width="110" height="9" rx="4" fill="#26362f" opacity=".6"/>`;
    // lampione a sinistra
    s += `<g transform="translate(-230 960)"><rect x="-6" y="-440" width="12" height="440" rx="4" fill="#26362f"/><path d="M0,-440 q60,-4 74,26" fill="none" stroke="#26362f" stroke-width="10" stroke-linecap="round"/><ellipse cx="82" cy="-408" rx="26" ry="10" fill="${WARM}"/><path d="M60,-400 L10,-10 L160,-10 Z" fill="${WARM}" opacity=".10"/><ellipse cx="80" cy="0" rx="150" ry="18" fill="${WARM}" opacity=".14"/></g>`;
    // fondazione
    s += `<rect x="-40" y="900" width="${WORLD_W + 80}" height="58" fill="#0b120f"/><rect x="-40" y="900" width="${WORLD_W + 80}" height="6" fill="#1d2d27"/>`;
    // tetto
    s += `<rect x="-60" y="-56" width="${WORLD_W + 120}" height="56" fill="#0c1411"/><rect x="-60" y="-56" width="${WORLD_W + 120}" height="6" fill="#26372f"/>`;
    s += `<rect x="-60" y="-140" width="${WORLD_W + 120}" height="84" fill="#080d0b"/>`;
    // insegna sul tetto sopra la sala
    s += `<g><rect x="520" y="-132" width="600" height="70" rx="12" fill="#0a0e0d" stroke="${MENTA}" stroke-width="3"/><text x="820" y="-80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="46" font-weight="500" fill="${MENTA}" letter-spacing="8">TRATTORIA</text><rect x="520" y="-132" width="600" height="70" rx="12" fill="${MENTA}" opacity=".06"/></g>`;
    // muri: esterni e divisori
    s += `<rect x="-44" y="-56" width="44" height="958" fill="#0e1613"/><rect x="${WORLD_W}" y="-56" width="44" height="958" fill="#0e1613"/>`;
    s += `<rect x="${X_CUC - 20}" y="0" width="40" height="900" fill="#0e1613"/><rect x="${X_UFF - 20}" y="0" width="40" height="900" fill="#0e1613"/>`;
    // finestra di passaggio fra sala e cucina (il passe) e porta fra cucina e ufficio
    s += `<rect x="${X_CUC - 20}" y="500" width="40" height="168" fill="url(#doorGlow)"/><rect x="${X_CUC - 24}" y="494" width="48" height="8" fill="#9fb0a9"/><rect x="${X_CUC - 24}" y="664" width="48" height="8" fill="#9fb0a9"/>`;
    s += `<rect x="${X_UFF - 20}" y="410" width="40" height="230" fill="#0a0e0d"/><rect x="${X_UFF - 24}" y="404" width="48" height="8" fill="#33463e"/>`;
    // finestre illuminate sul tetto/fronte: i tre locali hanno ciascuno la sua luce
    s += `<ellipse cx="800" cy="0" rx="800" ry="60" fill="${WARM}" opacity=".05"/>`;
    return s;
}
