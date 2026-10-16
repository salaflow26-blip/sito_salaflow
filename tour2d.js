// =====================================================================
// IL GIRO DEL LOCALE — la scena illustrata (2D, SVG)
// Un solo spaccato del locale visto di lato: Sala, Cucina e Ufficio una accanto all'altra, di notte.
// La telecamera scorre da una stanza all'altra e tre protagonisti (Marco, Elena, Giulia) vivono la storia.
// Tutto è una funzione di `pos` (0 = ingresso ... 7 = chiusura del giro): scorrendo avanti e indietro la storia
// si riavvolge. Nessuna immagine esterna e nessuna libreria: solo forme disegnate qui (vedi tour2d-art.js).
// Stessa interfaccia della vecchia scena 3D: createStage(...) → { render, resize, setFrame, setObstacles, ... }.
// =====================================================================
import { MENTA, WARM, X_CUC, X_UFF, WORLD_W, T8, defsMarkup, skyMarkup, building, salaBack, sala8Under, sala8Seated, sala8Top, sala8Card, salaLamps, cucina, ufficio } from './tour2d-art.js';

const NS = 'http://www.w3.org/2000/svg';
const LEGNO = '#dcc29c';
const SKIN = ['#e8b894', '#d49a72', '#a8744f', '#f2cdb0', '#c08a62'];
const SKIN_SH = ['#cf9d79', '#b9805b', '#8d5c3b', '#d9b394', '#a6704c'];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const seg = (pos, a, b) => clamp((pos - a) / (b - a), 0, 1);
const f1 = (n) => (Math.round(n * 10) / 10).toString();
const f2 = (n) => (Math.round(n * 100) / 100).toString();
const rad = (d) => d * Math.PI / 180;

// ---------------------------------------------------------------- persone (di profilo, guardano a destra; a sinistra si specchiano)
// Ogni articolazione si calcola dagli angoli, così la stessa figura cammina, siede, tiene il telefono o porta i piatti.
const ARM_L1 = 34, ARM_L2 = 29, LEG_L1 = 42, LEG_L2 = 42;
function limbPts(ox, oy, a1, a2, l1, l2) {
    const e = [ox + Math.sin(rad(a1)) * l1, oy + Math.cos(rad(a1)) * l1];
    const w = [e[0] + Math.sin(rad(a2)) * l2, e[1] + Math.cos(rad(a2)) * l2];
    return [[ox, oy], e, w];
}
const pd = (pts) => 'M' + pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' L');

const HAIR = {
    short: (c) => `<path d="M-13,-14 C-18,-40 10,-48 21,-31 C14,-37 4,-35 -3,-27 C-7,-23 -9,-18 -11,-9 C-13,-10 -13,-12 -13,-14 Z" fill="${c}"/>`,
    long: (c) => `<path d="M-14,-12 C-20,-44 14,-50 21,-30 C13,-36 3,-34 -3,-28 C-6,-22 -7,-14 -7,-4 C-7,12 -5,26 -2,34 C-12,34 -18,22 -18,6 Z" fill="${c}"/>`,
    bun: (c) => `<circle cx="-8" cy="-38" r="9" fill="${c}"/><path d="M-13,-14 C-18,-40 10,-48 21,-31 C14,-37 4,-35 -3,-27 C-7,-23 -9,-18 -11,-9 C-13,-10 -13,-12 -13,-14 Z" fill="${c}"/>`,
    curly: (c) => [[-8, -28, 10], [4, -33, 11], [15, -26, 9], [-12, -18, 9], [0, -24, 11]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join(''),
};

function figureMarkup(o) {
    const sk = SKIN[o.skin ?? 1], ss = SKIN_SH[o.skin ?? 1];
    const shirt = o.shirt || '#eef3f0', shade = o.shade || '#c5d1cb', tr = o.trousers || '#2a3833', trB = o.trousersB || '#1e2927', shoes = o.shoes || '#0b0f0e';
    const hair = o.hair || '#241912';
    const hat = o.hat
        ? `<path d="M-14,-24 C-30,-30 -26,-52 -10,-52 C-8,-62 12,-64 14,-52 C28,-54 32,-32 16,-26 L16,-18 L-12,-18 Z" fill="#f4f6f3"/><path d="M-12,-20 L16,-20" stroke="#cfd8d3" stroke-width="2"/>`
        : (HAIR[o.hairStyle || 'short'] || HAIR.short)(hair);
    const apron = o.apron
        ? `<path d="M-1,-140 L23,-140 L31,-44 Q14,-38 -3,-44 Z" fill="${o.apron}"/><path d="M3,-140 L-1,-156" stroke="${o.apron}" stroke-width="4.5" stroke-linecap="round"/>${o.apronTrim ? `<path d="M-1,-140 L23,-140" stroke="${o.apronTrim}" stroke-width="2" opacity=".8"/>` : ''}<rect x="9" y="-92" width="15" height="15" rx="3.5" fill="${o.apronPocket || '#2a3f35'}"/>${o.apronTrim ? `<rect x="13" y="-99" width="2.6" height="10" rx="1.3" fill="${o.apronTrim}"/>` : ''}`
        : '';
    const jacket = o.jacket
        ? `<path d="M-19,-86 C-22,-118 -19,-140 -11,-153 L14,-153 C23,-140 24,-116 22,-86 Z" fill="${o.jacket}"/><path d="M5,-150 L11,-92" stroke="#00000040" stroke-width="2"/><rect x="2" y="-130" width="5" height="5" rx="2.5" fill="#ffffff55"/>`
        : '';
    return `<ellipse class="f-shadow" cx="4" cy="4" rx="46" ry="9" fill="#000" opacity=".5"/>
  <path class="f-legB" fill="none" stroke="${trB}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path class="f-shoeB" fill="${shoes}"/>
  <g class="f-body">
    <path class="f-armB" fill="none" stroke="${shade}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="f-handB" r="7" fill="${ss}"/>
    <path d="M-19,-86 C-22,-118 -19,-140 -11,-153 L14,-153 C23,-140 24,-116 22,-86 Z" fill="${shirt}"/>
    <path d="M-19,-86 C-22,-118 -19,-140 -11,-153 L-3,-153 C-9,-130 -10,-110 -9,-86 Z" fill="${shade}" opacity=".6"/>
    ${jacket}
    <rect x="-4" y="-165" width="14" height="17" rx="6" fill="${ss}"/>
    <path d="M-20,-98 L23,-98 L24,-78 Q2,-71 -21,-78 Z" fill="${tr}"/>
  </g>
  <path class="f-legF" fill="none" stroke="${tr}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <path class="f-shoeF" fill="${shoes}"/>
  <g class="f-body2">
    ${apron}
    <g class="f-head" transform="translate(2 -160)">
      <circle cx="3" cy="-15" r="15.5" fill="${sk}"/>
      ${hat}
      <circle cx="-3" cy="-13" r="4" fill="${ss}"/>
      <circle cx="19" cy="-11" r="3.4" fill="${sk}"/>
    </g>
    <path class="f-armF-up" fill="none" stroke="${shirt}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="f-armF-low" fill="none" stroke="${sk}" stroke-width="13.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="f-cuff" fill="none" stroke="${shirt}" stroke-width="17" stroke-linecap="round"/>
    <circle class="f-handF" r="7.4" fill="${sk}"/>
    <g class="f-hold"></g>
  </g>`;
}

const PHONE_SVG = `<rect x="-3" y="-27" width="15" height="27" rx="3.6" fill="#0c1210" stroke="#33463e" stroke-width="1.1"/><rect class="f-screen" x="-1" y="-25" width="11" height="22.4" rx="2" fill="${MENTA}" opacity=".85"/>`;
const TRAY_SVG = `<ellipse cx="14" cy="-2" rx="34" ry="5" fill="#9aa8a2"/><ellipse cx="2" cy="-8" rx="15" ry="4.2" fill="#fffdf5"/><ellipse cx="2" cy="-8" rx="9" ry="2.4" fill="#e9e1cf"/><path d="M-4,-11 q4,-5 8,0 q-2,4 -8,0z" fill="#c4684a"/><ellipse cx="26" cy="-8" rx="15" ry="4.2" fill="#fffdf5"/><ellipse cx="26" cy="-8" rx="9" ry="2.4" fill="#e9e1cf"/><path d="M20,-11 q5,-6 11,0 q-3,4 -11,0z" fill="#d9a545"/><ellipse cx="14" cy="-14" rx="12" ry="3.4" fill="#fffdf5"/><path d="M8,-17 q6,-6 12,0 q-6,3 -12,0z" fill="#7d9e58"/>`;

class Figure {
    constructor(parent, o) {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'fig');
        g.innerHTML = figureMarkup(o);
        parent.appendChild(g);
        this.g = g;
        const q = (c) => g.querySelector('.' + c);
        for (const k of ['f-shadow', 'f-legB', 'f-shoeB', 'f-body', 'f-armB', 'f-handB', 'f-legF', 'f-shoeF', 'f-body2', 'f-head', 'f-armF-up', 'f-armF-low', 'f-cuff', 'f-hold', 'f-handF']) this[k] = q(k);
        this.mode = ''; this.screen = null;
        this.hand = [0, 0]; this.top = [0, -170]; this.pose0 = {};
    }
    // s = { x, y, k, dir (-1..1: anche a metà giravolta), sit, walk, ph, aF, aB, head, hold, screen, op }
    pose(s) {
        const k = s.k, dx = clamp(s.dir, -1, 1);
        this.g.setAttribute('transform', `translate(${f1(s.x)} ${f1(s.y)}) scale(${f2(k * (Math.abs(dx) < 0.04 ? 0.04 : dx))} ${f2(k)})`);
        const op = s.op === undefined ? 1 : s.op;
        this.g.style.opacity = op;
        this.g.style.display = op <= 0.002 ? 'none' : '';
        if (op <= 0.002) return;
        const sit = s.sit || 0, walk = s.walk || 0, ph = s.ph || 0;
        const dy = 44 * sit;
        const sw = Math.sin(ph) * 26 * walk;
        const th = sw * (1 - sit) + 86 * sit, thB = -sw * (1 - sit) + 80 * sit;
        const flexF = (Math.max(0, Math.sin(ph + 1.6)) * 38 * walk) * (1 - sit) + 86 * sit;
        const flexB = (Math.max(0, Math.sin(ph + 1.6 + Math.PI)) * 38 * walk) * (1 - sit) + 80 * sit;
        const lf = limbPts(2, -92 + dy, th, th - flexF, LEG_L1, LEG_L2);
        const lb = limbPts(-4, -92 + dy, thB, thB - flexB, LEG_L1, LEG_L2);
        this['f-legF'].setAttribute('d', pd(lf));
        this['f-legB'].setAttribute('d', pd(lb));
        const shoe = (w) => `M${f1(w[0] - 8)},${f1(w[1] - 1)} h30 a6,6 0 0 1 0,12 h-30 z`;
        this['f-shoeF'].setAttribute('d', shoe(lf[2]));
        this['f-shoeB'].setAttribute('d', shoe(lb[2]));
        const bt = `translate(0 ${f1(dy)})`;
        this['f-body'].setAttribute('transform', bt);
        this['f-body2'].setAttribute('transform', bt);
        const aF = s.aF || [0, 8], aB = s.aB || [0, 8];
        const pF = limbPts(4, -146, aF[0], aF[0] + aF[1], ARM_L1, ARM_L2), pB = limbPts(-2, -146, aB[0], aB[0] + aB[1], ARM_L1, ARM_L2);
        this['f-armF-up'].setAttribute('d', pd([pF[0], pF[1]]));
        this['f-armF-low'].setAttribute('d', pd([pF[1], pF[2]]));
        this['f-cuff'].setAttribute('d', pd([pF[1], [pF[1][0] + (pF[2][0] - pF[1][0]) * 0.25, pF[1][1] + (pF[2][1] - pF[1][1]) * 0.25]]));
        this['f-armB'].setAttribute('d', pd(pB));
        this['f-handF'].setAttribute('cx', f1(pF[2][0])); this['f-handF'].setAttribute('cy', f1(pF[2][1]));
        this['f-handB'].setAttribute('cx', f1(pB[2][0])); this['f-handB'].setAttribute('cy', f1(pB[2][1]));
        this['f-head'].setAttribute('transform', `translate(2 -160) rotate(${f1(s.head || 0)} 2 0)`);
        const want = s.hold || '';
        if (want !== this.mode) {
            this.mode = want;
            this['f-hold'].innerHTML = want === 'phone' ? PHONE_SVG : want === 'tray' ? TRAY_SVG : '';
            this.screen = this['f-hold'].querySelector('.f-screen');
        }
        if (want === 'phone') {
            this['f-hold'].setAttribute('transform', `translate(${f1(pF[2][0])} ${f1(pF[2][1])}) rotate(${f1(-(aF[0] + aF[1] - 90))})`);
            if (this.screen) this.screen.setAttribute('opacity', s.screen === undefined ? 0.85 : f2(s.screen));
        } else if (want === 'tray') {
            this['f-hold'].setAttribute('transform', `translate(${f1(pF[2][0] - 12)} ${f1(pF[2][1] + 2)})`);
        }
        // punti utili in coordinate del mondo (telefono, testa)
        const kx = k * (Math.abs(dx) < 0.04 ? 0.04 : dx);
        this.hand = [s.x + pF[2][0] * kx, s.y + (pF[2][1] + dy) * k];
        this.topPt = [s.x + 2 * kx, s.y + (-172 + dy) * k];
    }
}

// ---------------------------------------------------------------- pose: ogni nome dà gli angoli delle braccia (e cosa si tiene in mano)
function poseTemplate(name, t, ph) {
    const br = Math.sin(t * 1.7) * 1.2;
    switch (name) {
        case 'walk': return { aF: [-Math.sin(ph) * 22, 8], aB: [Math.sin(ph) * 22, 8], head: 0 };
        case 'phone': return { aF: [20 + br, 71], aB: [4, 12], head: 9, hold: 'phone' };
        case 'tray': return { aF: [58, 36], aB: [52, 34], head: 3, hold: 'tray' };
        case 'stir': return { aF: [62 + Math.sin(t * 7) * 12, 30 + Math.sin(t * 7 + 1) * 8], aB: [30, 40], head: 5 };
        case 'tap': return { aF: [128 + Math.sin(t * 9) * 3, 28], aB: [4, 10], head: -4 };
        case 'sitType': return { aF: [62 + Math.sin(t * 9) * 3, 40 + Math.sin(t * 11) * 6], aB: [56, 44], head: 10, sit: 1 };
        case 'sitPhone': return { aF: [86, 60], aB: [40, 50], head: 6, sit: 1, hold: 'phone' };
        default: return { aF: [3 + br, 8], aB: [-2, 8], head: 0 };    // idle
    }
}
const blendPose = (a, b, u) => ({
    aF: [lerp(a.aF[0], b.aF[0], u), lerp(a.aF[1], b.aF[1], u)], aB: [lerp(a.aB[0], b.aB[0], u), lerp(a.aB[1], b.aB[1], u)],
    head: lerp(a.head, b.head, u), sit: lerp(a.sit || 0, b.sit || 0, u), hold: u > 0.5 ? b.hold : a.hold,
});

// ---------------------------------------------------------------- percorsi: keys = [{ t, x, y, dir, pose, op? }]
const depthK = (y) => lerp(0.95, 1.62, clamp((y - 640) / 212, 0, 1.3));
function sampleTrack(keys, pos, time) {
    let i = 0;
    while (i < keys.length - 2 && pos > keys[i + 1].t) i++;
    const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
    const before = pos <= keys[0].t, after = pos >= keys[keys.length - 1].t;
    const u = before ? 0 : after ? 1 : clamp((pos - a.t) / Math.max(1e-6, b.t - a.t), 0, 1);
    const dxm = b.x - a.x, dym = b.y - a.y, dist = Math.hypot(dxm, dym);
    const moving = dist > 3 && u > 0 && u < 1;
    const e = dist > 3 ? smooth(u) : u;
    const x = lerp(a.x, b.x, e), y = lerp(a.y, b.y, e);
    // cammino cumulativo (per la cadenza dei passi)
    let cum = 0;
    for (let k = 0; k < i; k++) cum += Math.hypot(keys[k + 1].x - keys[k].x, keys[k + 1].y - keys[k].y);
    cum += dist * e;
    // direzione: in cammino guarda dove va; da fermo quella indicata; la giravolta è una compressione rapida
    const d0 = a.dir, d1 = b.dir, dm = dist > 3 ? Math.sign(dxm) || d1 : d1;
    let dir;
    if (dist > 3) dir = u < 0.12 ? lerp(d0, dm, smooth(u / 0.12)) : u > 0.88 ? lerp(dm, d1, smooth((u - 0.88) / 0.12)) : dm;
    else dir = d0 === d1 ? d0 : lerp(d0, d1, smooth(clamp(u * 3, 0, 1)));
    const ph = cum * 0.052;
    const pa = poseTemplate(moving ? 'walk' : a.pose, time, ph), pb = poseTemplate(moving ? 'walk' : b.pose, time, ph);
    const pu = moving ? 1 : smooth(clamp((u - 0.0) / 0.35, 0, 1));
    const bl = blendPose(moving ? pb : pa, pb, moving ? 0 : pu);
    // a inizio e fine cammino le braccia passano da quelle ferme a quelle di passo
    let arms = bl;
    if (dist > 3) { const w = smooth(clamp(Math.min(u / 0.1, (1 - u) / 0.1), 0, 1)); arms = blendPose(poseTemplate(u < 0.5 ? a.pose : b.pose, time, ph), poseTemplate('walk', time, ph), w); arms.hold = u < 0.5 ? a.pose && poseTemplate(a.pose, time, ph).hold : poseTemplate(b.pose, time, ph).hold; arms.sit = lerp(poseTemplate(a.pose, time, ph).sit || 0, poseTemplate(b.pose, time, ph).sit || 0, e); }
    const op = a.op === undefined && b.op === undefined ? 1 : lerp(a.op ?? 1, b.op ?? 1, smooth(u));
    return { x, y, k: depthK(y), dir, walk: dist > 3 ? smooth(clamp(Math.min(u / 0.12, (1 - u) / 0.12), 0, 1)) : 0, ph, sit: arms.sit || 0, aF: arms.aF, aB: arms.aB, head: arms.head, hold: arms.hold, op };
}

// ---------------------------------------------------------------- la scena
export function createStage(host, labelsLayer, opts = {}) {
    host.textContent = '';
    const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

    // cielo: fisso allo schermo (con un po' di parallasse)
    const sky = el('svg', { class: 't2-sky', viewBox: '0 0 1600 900', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }, host);
    sky.innerHTML = skyMarkup();
    const skyFar = sky.querySelector('.sky-far'), skyMid = sky.querySelector('.sky-mid'), skyNear = sky.querySelector('.sky-near');
    // il mondo
    const world = el('svg', { class: 't2-world', 'aria-hidden': 'true' }, host);
    world.innerHTML = defsMarkup();
    const cam = el('g', {}, world);
    const sala = el('g', { id: 't2-sala' }, cam);
    sala.innerHTML = salaBack();
    const ring = el('g', { id: 't2-ring' }, sala);
    ring.innerHTML = `<ellipse id="ringBase" cx="930" cy="790" rx="300" ry="64" fill="none" stroke="${LEGNO}" stroke-width="4" stroke-dasharray="14 12"/><ellipse id="ringFill" cx="930" cy="790" rx="300" ry="64" fill="${MENTA}" opacity="0"/><ellipse id="ringOn" cx="930" cy="790" rx="300" ry="64" fill="none" stroke="${MENTA}" stroke-width="5" opacity="0"/><ellipse id="ringPulse" cx="930" cy="790" rx="300" ry="64" fill="none" stroke="${MENTA}" stroke-width="3" opacity="0"/>`;
    const lombLayer = el('g', {}, sala);
    const under = sala8Under();
    el('g', {}, sala).innerHTML = under.shadow + under.cloth;
    const seatedBox = el('g', {}, sala);
    const seated = sala8Seated();
    const seatedEls = seated.map(s => { const g = el('g', { opacity: '0' }, seatedBox); g.innerHTML = s; return g; });
    el('g', {}, sala).innerHTML = sala8Top();
    const foodG = el('g', { opacity: '0' }, sala);
    foodG.innerHTML = [812, 900, 970, 1052].map((px, i) => `<path d="M${px - 14},676 q8,-16 18,-4 q10,-12 14,4 q-16,6 -32,0z" fill="${['#c4684a', '#d9a545', '#c4684a', '#7d9e58'][i]}"/><circle cx="${px + 8}" cy="${666}" r="3.6" fill="#7d9e58"/>`).join('');
    const cardWrap = el('g', {}, sala); cardWrap.innerHTML = sala8Card();
    const card = cardWrap.querySelector('#t8card'), cardBar = cardWrap.querySelector('#t8cardBar');
    const marcoLayer = el('g', {}, sala);
    el('g', {}, sala).innerHTML = salaLamps();
    const cuc = el('g', { transform: `translate(${X_CUC} 0)` }, cam);
    cuc.innerHTML = cucina();
    const elenaLayer = el('g', {}, cuc);
    const uff = el('g', { transform: `translate(${X_UFF} 0)` }, cam);
    uff.innerHTML = ufficio();
    // sedia dell'ufficio (dietro Giulia)
    const chair = el('g', {}, uff);
    chair.innerHTML = `<rect x="236" y="560" width="22" height="190" rx="9" fill="#22312b"/><rect x="236" y="560" width="22" height="14" rx="7" fill="#32463e"/><rect x="238" y="716" width="120" height="16" rx="7" fill="#2b3e37"/><rect x="290" y="732" width="14" height="70" fill="#1c2824"/><path d="M250,802 h90" stroke="#1c2824" stroke-width="8" stroke-linecap="round"/>`;
    const giuliaLayer = el('g', {}, uff);
    el('g', {}, cam).innerHTML = building();
    const fx = el('g', {}, cam);
    const ticket = el('g', { opacity: '0' }, fx);
    ticket.innerHTML = `<rect x="-17" y="-31" width="34" height="62" rx="3" fill="#f1f4f2"/><rect x="-12" y="-22" width="22" height="3" fill="${MENTA}"/><rect x="-12" y="-12" width="16" height="3" fill="#8a9993"/><rect x="-12" y="-2" width="20" height="3" fill="#8a9993"/><rect x="-12" y="8" width="12" height="3" fill="#8a9993"/>`;
    const trail = Array.from({ length: 7 }, () => el('circle', { r: '5', fill: MENTA, opacity: '0' }, fx));
    const tapRipple = el('circle', { r: '6', fill: 'none', stroke: MENTA, 'stroke-width': '3', opacity: '0' }, fx);

    // cose che si muovono
    const q = (id) => world.querySelector(id);
    const doorLeaf = q('#doorLeaf'), doorDark = q('#doorDark'), doorSpill = q('#doorSpill'), doorKnob = q('#doorKnob');
    const kTicket = q('#kTicket'), scrNew = q('#scrNew'), scrDone = q('#scrDone'), passPlates = q('#passPlates');
    const flames = [...world.querySelectorAll('#flames .flame')], puffs = [...world.querySelectorAll('#steam .puff')];
    const wbars = [...world.querySelectorAll('.wbar')], mbars = [...world.querySelectorAll('.mbar')], flash = q('#flash');
    const flame = q('#flame');

    // persone
    const mk = (parent, o) => new Figure(parent, o);
    const marco = mk(marcoLayer, { skin: 1, hair: '#241912', hairStyle: 'short', shirt: '#eef3f0', shade: '#c5d1cb', trousers: '#2a3833', trousersB: '#1e2927', apron: '#1d2c26', apronTrim: MENTA });
    const elena = mk(elenaLayer, { skin: 3, hat: true, shirt: '#f6f7f4', shade: '#d6ddd9', trousers: '#2a3330', trousersB: '#1e2724', apron: '#39463f', apronPocket: '#46564e' });
    const giulia = mk(giuliaLayer, { skin: 0, hair: '#4a2a16', hairStyle: 'long', shirt: '#f1f4f2', shade: '#d6ddd9', jacket: '#b48a56', trousers: '#2b3532', trousersB: '#1e2724' });
    const lombardi = [
        mk(lombLayer, { skin: 0, hair: '#1d150f', hairStyle: 'short', shirt: '#587c99', shade: '#456277', trousers: '#2e3a52', trousersB: '#232d41' }),
        mk(lombLayer, { skin: 3, hair: '#4a3320', hairStyle: 'curly', shirt: '#d9a545', shade: '#b7872f', trousers: '#2e3a2c', trousersB: '#232d21' }),
        mk(lombLayer, { skin: 4, hair: '#1a1411', hairStyle: 'long', shirt: '#8fbfa4', shade: '#6f9d85', trousers: '#2a2a3a', trousersB: '#1f1f2c' }),
        mk(lombLayer, { skin: 1, hair: '#2e2018', hairStyle: 'bun', shirt: '#c4684a', shade: '#a14f35', trousers: '#2a3a52', trousersB: '#1f2c40' }),
    ];
    const LK = [1.0, 0.72, 0.70, 0.97];                 // statura relativa dei Lombardi
    const WAIT = [[300, 788], [215, 770], [345, 806], [165, 782]];   // dove aspettano l'ingresso in sala
    const SEAT_X = [808, 898, 968, 1056];

    // percorsi
    const FRONT = { x: 640, y: 850 };
    const MK = [
        { t: 0, x: 470, y: 845, dir: -1, pose: 'idle' }, { t: 0.5, x: 470, y: 845, dir: -1, pose: 'idle' }, { t: 0.7, x: 470, y: 845, dir: -1, pose: 'phone' },
        { t: 1.3, x: 470, y: 845, dir: -1, pose: 'phone' }, { t: 1.45, x: 470, y: 845, dir: -1, pose: 'idle' }, { t: 1.75, x: 470, y: 845, dir: 1, pose: 'idle' },
        { t: 2.35, x: FRONT.x, y: FRONT.y, dir: 1, pose: 'idle' }, { t: 2.62, x: FRONT.x, y: FRONT.y, dir: 1, pose: 'phone' }, { t: 3.3, x: FRONT.x, y: FRONT.y, dir: 1, pose: 'phone' },
        { t: 3.45, x: FRONT.x, y: FRONT.y, dir: 1, pose: 'idle' }, { t: 4.55, x: FRONT.x, y: FRONT.y, dir: 1, pose: 'idle' }, { t: 4.97, x: 1440, y: 805, dir: 1, pose: 'idle' },
        { t: 5.1, x: 1440, y: 805, dir: 1, pose: 'tray' }, { t: 5.42, x: 1150, y: 850, dir: -1, pose: 'tray' }, { t: 5.58, x: 1150, y: 850, dir: -1, pose: 'idle' }, { t: 7, x: 1150, y: 850, dir: -1, pose: 'idle' },
    ];
    const EK = [
        { t: 0, x: 640, y: 800, dir: 1, pose: 'stir' }, { t: 3.7, x: 640, y: 800, dir: 1, pose: 'stir' }, { t: 3.9, x: 470, y: 800, dir: 1, pose: 'tap' }, { t: 4.18, x: 470, y: 800, dir: 1, pose: 'tap' },
        { t: 4.34, x: 640, y: 800, dir: 1, pose: 'stir' }, { t: 4.6, x: 640, y: 800, dir: 1, pose: 'stir' }, { t: 4.74, x: 470, y: 800, dir: 1, pose: 'tap' }, { t: 4.92, x: 470, y: 800, dir: 1, pose: 'tap' },
        { t: 5.12, x: 640, y: 800, dir: 1, pose: 'stir' }, { t: 7, x: 640, y: 800, dir: 1, pose: 'stir' },
    ];
    const GK = [{ t: 0, x: 300, y: 806, dir: 1, pose: 'sitType' }, { t: 6.15, x: 300, y: 806, dir: 1, pose: 'sitType' }, { t: 6.27, x: 300, y: 806, dir: 1, pose: 'sitPhone' }, { t: 6.55, x: 300, y: 806, dir: 1, pose: 'sitPhone' }, { t: 6.67, x: 300, y: 806, dir: 1, pose: 'sitType' }, { t: 7, x: 300, y: 806, dir: 1, pose: 'sitType' }];
    const LK_KEYS = lombardi.map((_, i) => {
        const lag = i * 0.05, w = WAIT[i];
        return [
            { t: 0.1 + lag, x: 170, y: 650, dir: 1, pose: 'idle', op: 0 }, { t: 0.22 + lag, x: 170, y: 650, dir: 1, pose: 'idle', op: 1 },
            { t: 0.95 + lag, x: w[0], y: w[1], dir: 1, pose: 'idle', op: 1 }, { t: 1.7, x: w[0], y: w[1], dir: 1, pose: 'idle', op: 1 },
            { t: 1.86 + lag, x: w[0], y: w[1], dir: 1, pose: 'idle', op: 1 }, { t: 2.3 + lag, x: 395 + i * 52, y: 748 - (i % 2) * 10, dir: 1, pose: 'idle', op: 1 }, { t: 2.78 + lag * 2, x: SEAT_X[i] - 4, y: 704, dir: 1, pose: 'idle', op: 1 },
        ];
    });

    // etichette
    const labelDefs = {
        marco: { text: 'Marco, cameriere', anchor: () => marco.topPt, dy: -8, show: (pos) => pos > 0.7 && pos < 5.6 },
        elena: { text: 'Elena, cuoca', anchor: () => elena.topPt, dy: -30, show: (pos) => pos > 3.5 && pos < 5.2 },
        giulia: { text: 'Giulia, titolare', anchor: () => giulia.topPt, dy: -8, show: (pos) => pos > 5.5 && pos < 7.0 },
        t8: { text: 'Tavolo 8, prenotato', anchor: () => [T8.x, 560], dy: 0, show: (pos) => pos > 0.9 && pos < 2.45, cls: 'pin' },
        pass: { text: 'Comanda in arrivo', anchor: () => [X_CUC + 290, 290], dy: 0, show: (pos) => pos > 3.8 && pos < 4.6, cls: 'pin' },
    };
    const labels = {};
    for (const [k, d] of Object.entries(labelDefs)) {
        const n = document.createElement('div');
        n.className = 'label3d' + (d.cls ? ' ' + d.cls : '');
        n.textContent = d.text;
        labelsLayer.appendChild(n);
        labels[k] = { el: n, ...d };
    }

    // ---------- telecamera: per ogni momento un punto del mondo e quanto ne vogliamo vedere (larghezza, altezza)
    const KEYS = [
        { c: [1250, 400], fit: [2600, 1020], fitP: [1500, 1020], cP: [720, 420] },
        { c: [450, 560], fit: [1050, 600] },
        { c: [640, 560], fit: [1050, 600] },
        { c: [780, 560], fit: [940, 560] },
        { c: [X_CUC + 560, 520], fit: [1150, 660] },
        { c: [1560, 580], fit: [1650, 880] },
        { c: [X_UFF + 450, 470], fit: [1100, 700] },
        { c: [2560, 400], fit: [2600, 1020], fitP: [1500, 1020], cP: [3060, 420] },
    ];
    const easeDwell = (u) => { const a = 0.22, b = 0.78; if (u <= a) return 0; if (u >= b) return 1; return smoother((u - a) / (b - a)); };
    let view = { w: 1, h: 1, shiftX: 0, shiftY: 0, uw: 1, uh: 1 };
    let camState = { s: 1, fx: 0, fy: 0, cx: 0, cy: 0 };
    function cameraAt(pos) {
        const i = clamp(Math.floor(pos), 0, KEYS.length - 2);
        const e = easeDwell(pos - i);
        const a = KEYS[i], b = KEYS[i + 1];
        const portrait = view.w / view.h < 0.9;
        const ca = portrait && a.cP ? a.cP : a.c, cb = portrait && b.cP ? b.cP : b.c;
        const fa = portrait ? (a.fitP || a.fit.map(v => v * 0.62)) : a.fit, fb = portrait ? (b.fitP || b.fit.map(v => v * 0.62)) : b.fit;
        const breath = Math.sin(Math.PI * e);
        const fw = Math.exp(lerp(Math.log(fa[0]), Math.log(fb[0]), e)) * (1 + 0.28 * breath);
        const fh = Math.exp(lerp(Math.log(fa[1]), Math.log(fb[1]), e)) * (1 + 0.28 * breath);
        const s = Math.min(view.uw * view.w / fw, view.uh * view.h / fh);
        return { s, fx: lerp(ca[0], cb[0], e), fy: lerp(ca[1], cb[1], e) };
    }

    // ---------- aggiornamento per posizione
    const place = (fig, keys, pos, time, extra = {}) => { const s = sampleTrack(keys, pos, time); fig.pose(Object.assign(s, extra)); return s; };
    function update(pos, time) {
        // porta d'ingresso: si apre quando arrivano i Lombardi, si richiude dopo
        const open = smooth(seg(pos, 0.08, 0.22)) * (1 - smooth(seg(pos, 0.7, 0.9)));
        const th = open * 78 * Math.PI / 180, rx = 114 + 112 * Math.cos(th), dyv = 22 * Math.sin(th);
        doorLeaf.setAttribute('points', `114,422 ${f1(rx)},${f1(422 - dyv)} ${f1(rx)},${f1(638 + dyv)} 114,638`);
        doorKnob.setAttribute('cx', f1(rx - 16)); doorKnob.setAttribute('opacity', open > 0.9 ? 0.2 : 1);
        doorDark.setAttribute('opacity', f2(0.5 * (1 - open)));
        doorSpill.setAttribute('opacity', f2(0.12 + 0.3 * open));
        // Marco, Lombardi
        const m = place(marco, MK, pos, time, { screen: 0.55 + 0.4 * (pos > 0.7 && pos < 1.4 ? 1 : 0) + (pos > 0.98 && pos < 1.1 ? 0.2 : 0) });
        lombardi.forEach((p, i) => {
            const s = sampleTrack(LK_KEYS[i], pos, time);
            // il passo dei piccoli è più corto e frequente
            s.k *= LK[i];
            if (pos < 0.09) s.op = 0;
            p.pose(s);
        });
        // clienti seduti: appaiono uno a uno quando arrivano al tavolo
        seatedEls.forEach((g, i) => {
            const a = seg(pos, 2.84 + i * 0.1, 2.9 + i * 0.1);
            g.setAttribute('opacity', f2(a));
            g.setAttribute('transform', `translate(0 ${f1(Math.sin(time * 1.5 + i * 1.3) * 1.6)})`);
            lombardi[i].g.style.opacity = f2(1 - a);
            if (a >= 1) lombardi[i].g.style.display = 'none';
        });
        // tavolo 8: da «prenotato» ad «arrivato» quando Marco tocca
        const arrive = seg(pos, 1.02, 1.12);
        const pulse = pos > 1.05 && pos < 2.6 ? 0.5 + 0.5 * Math.sin((pos - 1.05) * 22) : 0;
        q('#ringBase').setAttribute('opacity', f2(0.7 * (1 - arrive)));
        q('#ringOn').setAttribute('opacity', f2(arrive * (0.78 + 0.22 * pulse)));
        q('#ringFill').setAttribute('opacity', f2(arrive * (0.07 + 0.07 * pulse)));
        const rp = pos > 1.05 && pos < 1.7 ? seg(pos, 1.05, 1.7) : 0;
        const pul = q('#ringPulse'); pul.setAttribute('opacity', rp > 0 ? f2((1 - rp) * 0.8) : 0); pul.setAttribute('rx', f1(300 + rp * 90)); pul.setAttribute('ry', f1(64 + rp * 20));
        cardBar.setAttribute('fill', arrive > 0.5 ? MENTA : '#a89572');
        card.setAttribute('opacity', f2(1 - seg(pos, 2.8, 3.0)));
        // il tocco di Marco sul telefono: un'onda
        const tp = seg(pos, 0.98, 1.2);
        if (tp > 0 && tp < 1) { tapRipple.setAttribute('cx', f1(marco.hand[0])); tapRipple.setAttribute('cy', f1(marco.hand[1] - 20)); tapRipple.setAttribute('r', f1(8 + tp * 60)); tapRipple.setAttribute('opacity', f2((1 - tp) * 0.9)); }
        else tapRipple.setAttribute('opacity', 0);
        // comanda in volo: dal telefono di Marco alla stecca in cucina
        const fl = seg(pos, 3.3, 3.78);
        const from = (pos < 3.3 ? marco.hand : marco.hand), to = [X_CUC + 291, 338];
        if (pos > 3.29 && pos < 3.8) {
            const e = smooth(fl), bx = lerp(from[0], to[0], e), by = lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * 280;
            ticket.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) rotate(${f1(Math.sin(e * 7) * 26)}) scale(${f2(0.7 + 0.5 * Math.sin(Math.PI * e))})`);
            ticket.setAttribute('opacity', f2(smooth(seg(pos, 3.29, 3.36)) * (1 - smooth(seg(pos, 3.74, 3.8)))));
            trail.forEach((c, i) => {
                const ee = smooth(clamp(fl - (i + 1) * 0.05, 0, 1));
                c.setAttribute('cx', f1(lerp(from[0], to[0], ee))); c.setAttribute('cy', f1(lerp(from[1], to[1], ee) - Math.sin(Math.PI * ee) * 280));
                c.setAttribute('opacity', f2(fl > 0 && fl < 1 ? 0.6 * (1 - i / trail.length) : 0)); c.setAttribute('r', f1(5 - i * 0.5));
            });
        } else { ticket.setAttribute('opacity', 0); trail.forEach(c => c.setAttribute('opacity', 0)); }
        // il biglietto sulla stecca (brilla finché Elena non ha finito)
        kTicket.setAttribute('opacity', f2(smooth(seg(pos, 3.76, 3.84)) * (1 - smooth(seg(pos, 4.84, 4.96)))));
        // schermo cucina: comanda nuova → tutto pronto
        const done = smooth(seg(pos, 4.72, 4.82));
        scrNew.setAttribute('opacity', f2(1 - done)); scrDone.setAttribute('opacity', f2(done));
        // Elena
        const el_ = place(elena, EK, pos, time);
        // fuochi e vapore
        const cooking = pos > 4.25 && pos < 4.7;
        flames.forEach((g, i) => { const sc = (cooking ? 1.0 : 0.5) + 0.12 * Math.sin(time * 14 + i * 2); g.setAttribute('transform', `translate(${[760, 850, 940][i]} 576) scale(${f2(0.8 + 0.1 * Math.sin(time * 11 + i))} ${f2(sc)}) translate(${-[760, 850, 940][i]} -576)`); g.setAttribute('opacity', cooking ? 1 : 0.45); });
        puffs.forEach((c, i) => {
            const ph = ((time * 0.45 + i / puffs.length) % 1);
            c.setAttribute('cx', f1(760 + (i % 3) * 90 + Math.sin(ph * 6 + i) * 10)); c.setAttribute('cy', f1(500 - ph * 190)); c.setAttribute('rx', f1(12 + ph * 26)); c.setAttribute('ry', f1(9 + ph * 16));
            c.setAttribute('opacity', cooking ? f2((1 - ph) * 0.2) : f2((1 - ph) * 0.05));
        });
        // piatti: sul passe → in mano a Marco → sul tavolo 8
        const popP = smooth(seg(pos, 4.8, 4.98)) * (1 - smooth(seg(pos, 5.06, 5.14)));
        passPlates.setAttribute('opacity', f2(popP));
        foodG.setAttribute('opacity', f2(smooth(seg(pos, 5.42, 5.56))));
        // ufficio: grafico a parete e monitor
        const grow = seg(pos, 5.6, 6.2);
        wbars.forEach((b, i) => { const v = [0.35, 0.52, 0.44, 0.66, 0.92, 0.6, 0.48, 0.74][i] * 168 * smooth(clamp(grow * 1.6 - i * 0.12, 0, 1)); b.setAttribute('height', f1(Math.max(4, v))); b.setAttribute('y', f1(300 - Math.max(4, v))); });
        const grow2 = seg(pos, 5.75, 6.35);
        mbars.forEach((b, i) => { const v = [0.3, 0.45, 0.4, 0.62, 0.55, 0.9, 0.7, 0.8][i] * 84 * smooth(clamp(grow2 * 1.6 - i * 0.1, 0, 1)); b.setAttribute('height', f1(Math.max(3, v))); b.setAttribute('y', f1(562 - Math.max(3, v))); });
        const fl2 = pos > 6.3 && pos < 6.4 ? Math.sin(seg(pos, 6.3, 6.4) * Math.PI) : 0;
        flash.setAttribute('opacity', f2(fl2 * 0.8));
        const gi = place(giulia, GK, pos, time, { screen: 0.9 });
        flame.setAttribute('transform', `translate(930 626) scale(${f2(1 + Math.sin(time * 9) * 0.06)} ${f2(1 + Math.sin(time * 7 + 1) * 0.1)}) translate(-930 -626)`);
        // etichette
        for (const k in labels) {
            const L = labels[k];
            L.visible = L.show(pos);
            if (k === 't8') { L.el.classList.toggle('on', arrive > 0.5); L.el.textContent = arrive > 0.5 ? 'Tavolo 8: arrivato' : 'Tavolo 8: prenotato'; }
        }
        return { m, el_, gi };
    }

    // ---------- resa
    let obstacles = [];
    function setObstacles(list) { obstacles = list; }
    function renderLabels() {
        const topSafe = obstacles.topSafe || 0;
        const placed = [];
        for (const k in labels) {
            const L = labels[k];
            if (!L.visible) { L.el.style.opacity = 0; continue; }
            const a = L.anchor();
            let x = camState.cx + camState.s * (a[0] - camState.fx), y = camState.cy + camState.s * (a[1] - camState.fy) + L.dy * camState.s;
            const hw = (L.el.offsetWidth || 120) / 2, hh = (L.el.offsetHeight || 24);
            if (x < 12 || x > view.w - 12 || y < topSafe + 8 || y > view.h - 8) { L.el.style.opacity = 0; continue; }
            for (const r of obstacles) {
                const l = x - hw, rr = x + hw, t = y - hh, bb = y;
                if (rr < r.l || l > r.r || bb < r.t || t > r.b) continue;
                if (r.r - r.l > view.w * 0.7) y = r.t - 6;
                else if ((r.l + r.r) / 2 < view.w / 2) x = r.r + 8 + hw;
                else x = r.l - 8 - hw;
            }
            x = clamp(x, hw + 6, view.w - hw - 6);
            y = Math.max(y, topSafe + hh + 6);
            for (const p of placed) if (Math.abs(x - p.x) < hw + p.hw && Math.abs(y - p.y) < hh + 4) y = p.y - hh - 6;
            placed.push({ x, y, hw });
            L.el.style.opacity = 1;
            L.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
        }
    }
    function resize(w, h, shiftX = 0, shiftY = 0, uw = 1 - Math.abs(shiftX) * 2, uh = 1 - Math.abs(shiftY) * 2) {
        view = { w, h, shiftX, shiftY, uw, uh };
        world.setAttribute('width', w); world.setAttribute('height', h);
        world.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
    function setFrame(shiftX, shiftY, uw, uh) { view.shiftX = shiftX; view.shiftY = shiftY; view.uw = uw; view.uh = uh; }
    let lastTime = 0;
    function render(pos, time) {
        update(pos, time);
        const c = cameraAt(pos);
        // il centro della parte libera dello schermo
        const cx = view.w / 2 + view.shiftX * view.w, cy = view.h / 2 + view.shiftY * view.h;
        camState = { s: c.s, fx: c.fx, fy: c.fy, cx, cy };
        cam.setAttribute('transform', `translate(${f1(cx - c.s * c.fx)} ${f1(cy - c.s * c.fy)}) scale(${(c.s).toFixed(4)})`);
        // il cielo scivola più piano della scena (parallasse)
        const px = c.fx, py = c.fy;
        skyFar.setAttribute('transform', `translate(${f1(-px * 0.012)} ${f1(-py * 0.01)})`);
        skyMid.setAttribute('transform', `translate(${f1(-px * 0.035)} ${f1(-py * 0.02)})`);
        skyNear.setAttribute('transform', `translate(${f1(-px * 0.07)} ${f1(-py * 0.035)})`);
        renderLabels();
        lastTime = time;
        return 0;
    }
    function setMode() {}
    function getMode() { return 'outside'; }
    function dispose() { host.textContent = ''; labelsLayer.textContent = ''; }
    return { render, resize, setFrame, setObstacles, setMode, getMode, dispose };
}
