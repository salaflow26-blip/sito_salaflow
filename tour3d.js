// =====================================================================
// IL GIRO DEL LOCALE — la scena 3D
// Un piccolo ristorante "a casa di bambole" (pareti davanti tolte) con tre protagonisti:
// Marco (cameriere), Elena (cuoca) e Giulia (titolare). Tutto è una funzione di `pos`
// (0 = ingresso ... 7 = chiusura del giro), quindi scorrendo avanti e indietro la storia
// si riavvolge senza stati nascosti. Nessun modello esterno: solo forme semplici.
// =====================================================================
import * as THREE from './vendor/three.module.min.js';

const COL = {
    notte: 0x0a0e0d, slab: 0x141b18, wall: 0x232e2a, wallTop: 0x34423d, wallIn: 0x2a3631,
    legno: 0xdcc29c, legnoDark: 0x9c8460, menta: 0x2dd8a3, ciano: 0x11ede3, warm: 0xffc983,
    chair: 0x33453e, metal: 0x8f9c97, white: 0xf1f4f2,
};
const CAMERA_FOV = 34;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerpAngle = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; };
const seg = (pos, a, b) => clamp((pos - a) / (b - a), 0, 1);

// ---------------------------------------------------------------- materiali e forme
// Stile "animato": forme arrotondate, ombre morbide a tre toni (toon) e niente spigoli vivi.
const STYLE = (typeof location !== 'undefined' && new URLSearchParams(location.search).get('style')) || 'std';
const CLAY = STYLE === 'clay';
let GRAD = null;
function toonGradient() {
    if (GRAD) return GRAD;
    const data = new Uint8Array([70, 150, 215, 255]);
    GRAD = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
    GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter;
    GRAD.needsUpdate = true;
    return GRAD;
}
const matCache = new Map();
function mat(color, o = {}) {
    const key = color + '|' + (o.emissive || 0) + '|' + (o.emissiveIntensity ?? 1) + '|' + (o.opacity ?? 1) + '|' + (o.rough ?? 0.85) + '|' + (o.metal ?? 0);
    if (matCache.has(key) && !o.unique) return matCache.get(key);
    let m;
    if (CLAY) {
        // plastico d'architetto: tutto in argilla chiara, solo gli accenti restano a colori
        const accent = color === COL.menta || color === COL.ciano;
        const c = new THREE.Color(color);
        const hsl = {}; c.getHSL(hsl);
        const clay = accent ? c : new THREE.Color().setHSL(0.095, 0.06, clamp(0.4 + hsl.l * 0.56, 0.38, 0.93));
        m = new THREE.MeshStandardMaterial({ color: clay, roughness: 0.92, metalness: 0, emissive: accent ? (o.emissive ?? 0x000000) : 0x000000, emissiveIntensity: o.emissiveIntensity ?? 1, transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1 });
    } else if (STYLE === 'toon') {
        m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), emissive: o.emissive ?? 0x000000, emissiveIntensity: o.emissiveIntensity ?? 1, transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1 });
    } else {
        m = new THREE.MeshStandardMaterial({
            color, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0, flatShading: false,
            emissive: o.emissive ?? 0x000000, emissiveIntensity: o.emissiveIntensity ?? 1,
            transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1,
        });
    }
    if (!o.unique) matCache.set(key, m);
    return m;
}

// parallelepipedo con spigoli arrotondati (stessa idea di RoundedBoxGeometry di three, normali morbide)
const geoCache = new Map();
function rbGeo(w, h, d, r, segs) {
    const key = [w, h, d, r, segs].map(v => +v.toFixed(4)).join('|');
    if (geoCache.has(key)) return geoCache.get(key);
    const n = segs * 2 + 1;
    const g0 = new THREE.BoxGeometry(1, 1, 1, n, n, n);
    const g = g0.toNonIndexed();
    g0.dispose();
    const pos = g.attributes.position.array, nor = g.attributes.normal.array;
    const hs = 0.5 / n;                                  // mezzo "gradino" di suddivisione
    const bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.length; i += 3) {
        v.set(pos[i], pos[i + 1], pos[i + 2]);
        const sx = Math.sign(v.x), sy = Math.sign(v.y), sz = Math.sign(v.z);
        v.x -= sx * hs; v.y -= sy * hs; v.z -= sz * hs;
        v.normalize();
        pos[i] = bx * sx + v.x * r; pos[i + 1] = by * sy + v.y * r; pos[i + 2] = bz * sz + v.z * r;
        nor[i] = v.x; nor[i + 1] = v.y; nor[i + 2] = v.z;
    }
    g.attributes.position.needsUpdate = true;
    g.computeBoundingSphere();
    geoCache.set(key, g);
    return g;
}
function box(parent, w, h, d, color, x, y, z, o = {}) {
    const r = Math.min(o.r ?? 0.05, Math.min(w, h, d) / 2.2);
    const geo = r < 0.004 ? new THREE.BoxGeometry(w, h, d) : rbGeo(w, h, d, r, r > 0.03 ? 2 : 1);
    const m = new THREE.Mesh(geo, o.material || mat(color, o));
    m.position.set(x, y, z);
    if (o.ry) m.rotation.y = o.ry;
    parent.add(m);
    return m;
}
// solido di rotazione con bordo smussato (tavoli, pentole, lampade, sgabelli, piatti)
function lathe(profile, seg = 24) {
    return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
}
function capProfile(rt, rb, h, e) {
    e = Math.min(e, h / 2.2, rt, rb);
    const pts = [[0, -h / 2], [Math.max(0, rb - e), -h / 2]];
    for (let i = 1; i <= 4; i++) { const a = -Math.PI / 2 + (i / 4) * (Math.PI / 2); pts.push([rb - e + e * Math.cos(a), -h / 2 + e + e * Math.sin(a)]); }
    for (let i = 0; i <= 4; i++) { const a = (i / 4) * (Math.PI / 2); pts.push([rt - e + e * Math.cos(a), h / 2 - e + e * Math.sin(a)]); }
    pts.push([0, h / 2]);
    return pts;
}
const latheCache = new Map();
function cyl(parent, rt, rb, h, seg_, color, x, y, z, o = {}) {
    const e = o.edge ?? Math.min(0.025, h * 0.35, Math.min(rt, rb) * 0.5);
    const key = [rt, rb, h, e].map(v => +v.toFixed(4)).join('|');
    let geo = latheCache.get(key);
    if (!geo) { geo = lathe(capProfile(rt, rb, h, e), Math.max(14, seg_ * 2)); latheCache.set(key, geo); }
    const m = new THREE.Mesh(geo, o.material || mat(color, o));
    m.position.set(x, y, z);
    parent.add(m);
    return m;
}
const sphGeo = new Map();
function sph(parent, r, color, x, y, z, o = {}) {
    const seg_ = Math.max(o.seg || 0, 14);
    const key = r + '|' + seg_;
    let geo = sphGeo.get(key);
    if (!geo) { geo = new THREE.SphereGeometry(r, seg_, Math.round(seg_ * 0.75)); sphGeo.set(key, geo); }
    const m = new THREE.Mesh(geo, o.material || mat(color, o));
    m.position.set(x, y, z);
    parent.add(m);
    return m;
}
function capsule(parent, r, len, color, x, y, z, o = {}) {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, o.seg || 12), o.material || mat(color, o));
    m.position.set(x, y, z);
    parent.add(m);
    return m;
}
function glowMat(color, opacity = 1) {
    return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
}

// texture a gradiente radiale (macchie di luce e ombre morbide)
function radialTexture(inner, outer, size = 128) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, inner);
    gr.addColorStop(1, outer);
    g.fillStyle = gr;
    g.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}
let SHADOW_TEX = null, POOL_TEX = null;
function blob(parent, x, z, r, opacity = 0.5) {
    if (CLAY) return { visible: false };
    SHADOW_TEX = SHADOW_TEX || radialTexture('rgba(0,0,0,0.9)', 'rgba(0,0,0,0)');
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.025, z);
    parent.add(m);
    return m;
}
function pool(parent, x, z, r, color = 'rgba(255,201,131,', opacity = 0.35, y = 0.03) {
    if (CLAY) { opacity *= 0.35; }
    const t = radialTexture(color + '1)', color + '0)');
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    parent.add(m);
    return m;
}

function woodTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#3b2d21';
    g.fillRect(0, 0, 512, 512);
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let i = 0; i < 8; i++) {
        const x = i * 64;
        for (let j = 0; j < 4; j++) {
            const y = j * 128 + (i % 2) * 40;
            const v = 52 + Math.floor(rnd() * 22);
            g.fillStyle = `rgb(${v + 8},${v - 6},${v - 20})`;
            g.fillRect(x + 1, (y % 512) + 1, 62, 126);
        }
        g.fillStyle = 'rgba(0,0,0,0.35)';
        g.fillRect(x, 0, 2, 512);
    }
    for (let j = 0; j < 12; j++) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, j * 43 + (j % 3) * 11, 512, 2); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
}
function tileTexture(a = '#1d2824', b = '#17201d') {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * 64, j * 64, 64, 64); }
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

// ---------------------------------------------------------------- persone (stile cartone animato)
const SKIN = [0xf0c7a6, 0xd9a47c, 0xa8744f, 0xf7d8be, 0xc08a62];
function makePerson(o = {}) {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    const hip = new THREE.Group();
    hip.position.y = 0.74;
    body.add(hip);
    const skin = o.skin ?? SKIN[0];
    const pants = o.pants ?? 0x1f272a;
    const shirt = o.shirt ?? COL.white;

    const mkLeg = (side) => {
        const thigh = new THREE.Group();
        thigh.position.set(side * 0.1, 0, 0);
        hip.add(thigh);
        capsule(thigh, 0.085, 0.2, pants, 0, -0.17, 0);
        const knee = new THREE.Group();
        knee.position.y = -0.34;
        thigh.add(knee);
        capsule(knee, 0.072, 0.17, pants, 0, -0.16, 0);
        box(knee, 0.15, 0.09, 0.27, o.shoes ?? 0x20181a, 0, -0.34, 0.05, { r: 0.04 });
        return { thigh, knee };
    };
    const legL = mkLeg(-1), legR = mkLeg(1);

    const torso = new THREE.Group();                 // perno delle spalle (le braccia e la testa si agganciano qui)
    hip.add(torso);
    const torsoVis = new THREE.Group();              // solo ciò che si vede da fuori (si nasconde in prima persona)
    torso.add(torsoVis);
    capsule(torsoVis, 0.205, 0.27, shirt, 0, 0.34, 0);
    if (o.apron) {
        box(torsoVis, 0.32, 0.42, 0.07, o.apron, 0, 0.27, 0.185, { r: 0.03 });
        box(torsoVis, 0.07, 0.3, 0.05, o.apron, -0.1, 0.55, 0.15, { r: 0.02 });
        box(torsoVis, 0.07, 0.3, 0.05, o.apron, 0.1, 0.55, 0.15, { r: 0.02 });
    }
    if (o.collar) sph(torsoVis, 0.1, o.collar, 0, 0.64, 0.05, { seg: 10 }).scale.set(1.15, 0.5, 1);
    if (o.scarf) { const sc = sph(torsoVis, 0.13, o.scarf, 0, 0.62, 0.02, { seg: 12 }); sc.scale.set(1.2, 0.55, 1.1); }

    const mkArm = (side) => {
        const sh = new THREE.Group();
        sh.position.set(side * 0.255, 0.52, 0);
        torso.add(sh);
        capsule(sh, 0.058, 0.15, shirt, 0, -0.13, 0);
        const el = new THREE.Group();
        el.position.y = -0.27;
        sh.add(el);
        capsule(el, 0.052, 0.14, o.sleeve ?? shirt, 0, -0.12, 0);
        sph(el, 0.065, skin, 0, -0.27, 0, { seg: 10 });
        return { sh, el };
    };
    const armL = mkArm(-1), armR = mkArm(1);

    const head = new THREE.Group();
    head.position.y = 0.82;
    torso.add(head);
    const headVis = new THREE.Group();               // testa + capelli (nascosti in prima persona)
    if (CLAY) headVis.scale.setScalar(0.8);
    head.add(headVis);
    sph(headVis, 0.215, skin, 0, 0, 0, { seg: 20 });
    for (const sx of CLAY ? [] : [-1, 1]) {
        sph(headVis, 0.042, skin, sx * 0.205, -0.01, 0, { seg: 8 });                           // orecchie
        const eye = sph(headVis, 0.05, 0xffffff, sx * 0.08, 0.02, 0.185, { seg: 12 }); eye.scale.set(1, 1.15, 0.6);
        sph(headVis, 0.03, 0x1a1210, sx * 0.08, 0.018, 0.208, { seg: 10 });
        sph(headVis, 0.01, 0xffffff, sx * 0.088, 0.03, 0.232, { seg: 6 });
        const brow = box(headVis, 0.075, 0.017, 0.02, o.hair ?? 0x2a1d14, sx * 0.08, 0.098, 0.2, { r: 0.008 }); brow.rotation.z = -sx * 0.12;
        const cheek = sph(headVis, 0.036, 0xe8907a, sx * 0.13, -0.05, 0.165, { seg: 8, opacity: 0.55 }); cheek.scale.set(1, 0.7, 0.4);
    }
    if (!CLAY) {
        sph(headVis, 0.022, skin, 0, -0.01, 0.215, { seg: 8 });                                 // naso
        const smile = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.01, 6, 14, Math.PI), mat(0x7a3a30));
        smile.position.set(0, -0.045, 0.205); smile.rotation.z = Math.PI; smile.scale.set(1, 0.8, 1); headVis.add(smile);
    }
    if (o.hat) {
        cyl(headVis, 0.215, 0.205, 0.1, 16, COL.white, 0, 0.19, 0);
        const puff = sph(headVis, 0.25, COL.white, 0, 0.38, 0, { seg: 14 }); puff.scale.set(1, 0.78, 1);
        sph(headVis, 0.14, COL.white, 0.17, 0.36, 0.04, { seg: 10 }); sph(headVis, 0.14, COL.white, -0.17, 0.36, -0.03, { seg: 10 });
    } else {
        const hairMat = mat(o.hair ?? 0x2a1d14);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.228, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
        cap.position.set(0, 0.02, -0.025); cap.rotation.x = -0.18; headVis.add(cap);
        const fringe = sph(headVis, 0.115, o.hair ?? 0x2a1d14, 0.045, 0.165, 0.13, { seg: 12 }); fringe.scale.set(1.35, 0.7, 0.8);
        if (o.longHair) {
            capsule(headVis, 0.13, 0.16, o.hair ?? 0x2a1d14, 0, -0.11, -0.15);
            sph(headVis, 0.1, o.hair ?? 0x2a1d14, 0.12, -0.05, -0.1, { seg: 10 });
        }
        if (o.bun) sph(headVis, 0.1, o.hair ?? 0x2a1d14, 0, 0.27, -0.12, { seg: 12 });
    }
    // telefono in mano (si accende quando serve)
    const phone = box(armR.el, 0.085, 0.15, 0.016, 0x0c1210, 0, -0.34, 0.04, { r: 0.012 });
    const screen = box(phone, 0.068, 0.125, 0.004, COL.menta, 0, 0, 0.009, { material: glowMat(COL.menta, 0.95), r: 0.002 });
    phone.visible = false;
    // vassoio / piatti (ancora portapiatti)
    const carry = new THREE.Group();
    carry.position.set(0, 1.12, 0.38);
    root.add(carry);

    const shadow = blob(root, 0, 0, 0.45, 0.55);
    root.scale.setScalar(o.scale ?? 1);
    return { root, body, hip, legL, legR, armL, armR, head, headVis, torso, torsoVis, phone, screen, carry, shadow, face: 0, sitAmt: 0 };
}

// Applica la posa. t = tempo continuo (per le oscillazioni), s = stato { walk, phase, sit, phone, stir, type, carry }
function poseFor(p, s, t) {
    const sit = s.sit || 0;
    const walk = s.walk || 0;
    const ph = s.phase || 0;
    const sw = Math.sin(ph) * 0.62 * walk;
    // gambe
    p.legL.thigh.rotation.x = lerp(sw, -1.5, sit); p.legR.thigh.rotation.x = lerp(-sw, -1.5, sit);
    p.legL.knee.rotation.x = lerp(Math.max(0, -Math.sin(ph)) * 0.8 * walk, 1.5, sit);
    p.legR.knee.rotation.x = lerp(Math.max(0, Math.sin(ph)) * 0.8 * walk, 1.5, sit);
    const bob = Math.abs(Math.sin(ph)) * 0.03 * walk;
    p.body.position.y = -0.285 * sit + bob + Math.sin(t * 1.7 + (s.seed || 0)) * 0.006;
    p._sit = sit; p._bob = bob;
    // braccia
    let aL = -sw * 0.8, aR = sw * 0.8, eL = 0.12, eR = 0.12, zL = 0, zR = 0;
    if (s.type) { aL = -1.05 + Math.sin(t * 9) * 0.04; aR = -1.1 + Math.sin(t * 11 + 1) * 0.05; eL = eR = 0.7; }
    if (s.stir) { aR = -0.95 + Math.sin(t * 7) * 0.25; eR = 0.9; aL = -0.7; eL = 0.9; zR = Math.sin(t * 7) * 0.12; }
    if (s.phone) { aR = -1.25; eR = 1.25; aL = -0.3; eL = 0.3; }
    if (s.carry) { aL = -1.15; aR = -1.15; eL = eR = 0.5; zL = 0.18; zR = -0.18; }
    p.armL.sh.rotation.x = aL; p.armR.sh.rotation.x = aR;
    p.armL.el.rotation.x = -eL; p.armR.el.rotation.x = -eR;
    p.armL.sh.rotation.z = zL; p.armR.sh.rotation.z = zR;
    p.phone.visible = !!s.phone;
    p.carry.visible = !!s.carry;
}

// ---------------------------------------------------------------- percorsi (funzioni di pos)
// keys: [{ t, x, z, sit?, pose?: { phone, type, stir, carry }, face? }]
function makeTrack(keys) {
    const segs = [];
    let cum = 0;
    for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i], b = keys[i + 1];
        const dx = b.x - a.x, dz = b.z - a.z;
        const len = Math.hypot(dx, dz);
        segs.push({ a, b, len, c0: cum, dir: len > 0.001 ? Math.atan2(dx, dz) : null });
        cum += len;
    }
    return function sample(t) {
        if (t <= keys[0].t) { const k = keys[0]; return { x: k.x, z: k.z, sit: k.sit || 0, walk: 0, cum: 0, face: k.face ?? 0, pose: k.pose || {}, before: true }; }
        const last = keys[keys.length - 1];
        if (t >= last.t) { return { x: last.x, z: last.z, sit: last.sit || 0, walk: 0, cum, face: last.face ?? lastDir(segs), pose: last.pose || {} }; }
        let sg = segs[0];
        for (const s of segs) { if (t >= s.a.t && t <= s.b.t) { sg = s; break; } }
        const u = (t - sg.a.t) / Math.max(1e-6, sg.b.t - sg.a.t);
        const moving = sg.len > 0.02;
        const e = moving ? smooth(clamp(u, 0, 1)) : u;
        return {
            x: lerp(sg.a.x, sg.b.x, e), z: lerp(sg.a.z, sg.b.z, e),
            sit: lerp(sg.a.sit || 0, sg.b.sit || 0, smooth(clamp(u, 0, 1))),
            walk: moving ? 1 : 0, cum: sg.c0 + sg.len * e,
            face: moving ? sg.dir : (sg.b.face ?? sg.a.face ?? lastDir(segs, sg)),
            pose: (u > 0.5 ? sg.b.pose : sg.a.pose) || {},
        };
    };
}
function lastDir(segs, upTo) {
    let d = 0;
    for (const s of segs) { if (s.dir != null) d = s.dir; if (s === upTo) break; }
    return d;
}

// ---------------------------------------------------------------- la scena
export function createStage(canvas, labelsLayer, opts = {}) {
    const lowPower = !!opts.lowPower;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CLAY ? 0.9 : 1.2;
    renderer.setClearColor(COL.notte, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COL.notte);

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1.6, 0.5, 120);

    // luci
    scene.add(new THREE.HemisphereLight(CLAY ? 0xf3f1ec : 0xa9c2bb, CLAY ? 0x4f4d4a : 0x2a2018, CLAY ? 0.85 : 1.15));
    const key = new THREE.DirectionalLight(CLAY ? 0xfff4e6 : 0xffe0b4, CLAY ? 2.1 : 1.25);
    key.position.set(-6, 14, 12);
    if (CLAY) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        key.castShadow = true;
        key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(key.shadow.camera, { left: -17, right: 17, top: 11, bottom: -11, near: 1, far: 60 });
        key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
        key.position.set(-5, 15, 9);
    }
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x2dd8a3, 0.35);
    rim.position.set(10, 6, -10);
    scene.add(rim);
    const PL = CLAY ? 0.3 : 1;    // in argilla le luci puntiformi servono solo a scaldare, il lavoro lo fa la luce principale
    const lampSala = new THREE.PointLight(0xffc27a, 30 * PL, 13, 1.5); lampSala.position.set(-4.5, 2.4, 0.2); scene.add(lampSala);
    const lampCuc = new THREE.PointLight(0xffd9a0, 60 * PL, 13, 1.4); lampCuc.position.set(4, 2.4, -1.5); scene.add(lampCuc);
    const lampUff = new THREE.PointLight(0xcfeaff, 42 * PL, 11, 1.4); lampUff.position.set(9.5, 2.4, -1.2); scene.add(lampUff);
    const flash = new THREE.PointLight(0xffffff, 0, 6, 1.5); flash.position.set(8.9, 1.5, -2.2); scene.add(flash);

    const world = new THREE.Group();
    scene.add(world);

    // ---------- base, pavimenti, pareti
    box(world, 21.6, 0.5, 10.2, COL.slab, 1.5, -0.25, -0.3, { rough: 0.95 });
    box(world, 21.8, 0.04, 10.4, COL.legnoDark, 1.5, -0.05, -0.3, { rough: 0.7 });
    // marciapiede e strada a sinistra
    box(world, 7, 0.4, 8, 0x16201c, -13.2, -0.2, 0.2, { rough: 0.95 });
    box(world, 7, 0.02, 1.2, 0x1d2925, -13.2, 0.005, 3.7, { rough: 0.9 });

    const floorTexSala = woodTexture();
    floorTexSala.repeat.set(2.6, 2.4);
    const floorSala = new THREE.Mesh(new THREE.PlaneGeometry(10, 9), new THREE.MeshStandardMaterial(CLAY ? { color: 0xc6bcad, roughness: 0.95 } : { map: floorTexSala, roughness: 0.78, color: 0xd8c6b0 }));
    floorSala.rotation.x = -Math.PI / 2; floorSala.position.set(-4, 0.012, -0.5); world.add(floorSala);
    const floorTexCuc = tileTexture('#222f2a', '#1a2420');
    floorTexCuc.repeat.set(3, 4.5);
    const floorCuc = new THREE.Mesh(new THREE.PlaneGeometry(6, 9), new THREE.MeshStandardMaterial(CLAY ? { color: 0xb3b9b4, roughness: 0.95 } : { map: floorTexCuc, roughness: 0.6 }));
    floorCuc.rotation.x = -Math.PI / 2; floorCuc.position.set(4, 0.012, -0.5); world.add(floorCuc);
    const floorUff = new THREE.Mesh(new THREE.PlaneGeometry(5, 9), new THREE.MeshStandardMaterial({ color: CLAY ? 0xaab2b1 : 0x1b2624, roughness: 0.95 }));
    floorUff.rotation.x = -Math.PI / 2; floorUff.position.set(9.5, 0.012, -0.5); world.add(floorUff);
    box(world, 3.6, 0.012, 2.4, 0x22312e, 9.5, 0.018, -1.4, { rough: 1 }); // tappeto

    const H = 2.7, T = 0.2;
    const wallMat = mat(COL.wall, { rough: 0.9 });
    const wallBox = (x0, z0, x1, z1, y0 = 0, h = H) => {
        const w = Math.abs(x1 - x0) || T, d = Math.abs(z1 - z0) || T;
        const m = box(world, w, h, d, COL.wall, (x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2, { material: wallMat });
        box(world, w + 0.02, 0.06, d + 0.02, COL.wallTop, (x0 + x1) / 2, y0 + h + 0.03, (z0 + z1) / 2);
        return m;
    };
    wallBox(-9, -5, 12, -5);                                   // fondo
    wallBox(12, -5, 12, 4);                                    // destra
    wallBox(-9, -5, -9, 1.7);                                  // sinistra (porta tra 1.7 e 2.9)
    wallBox(-9, 2.9, -9, 4);
    wallBox(-9, 1.7, -9, 2.9, 2.1, H - 2.1);                   // architrave
    wallBox(1, -5, 1, -3.4);                                   // divisorio sala/cucina con il passe
    wallBox(1, -1.2, 1, 4);
    wallBox(1, -3.4, 1, -1.2, 0, 0.95);
    wallBox(1, -3.4, 1, -1.2, 2.15, H - 2.15);
    wallBox(7, -5, 7, 1.4);                                    // divisorio cucina/ufficio (porta tra 1.4 e 2.4)
    wallBox(7, 2.4, 7, 4);
    wallBox(7, 1.4, 7, 2.4, 2.1, H - 2.1);
    // infissi della porta d'ingresso
    box(world, 0.06, 2.1, 0.06, COL.legno, -9, 1.05, 1.7);
    box(world, 0.06, 2.1, 0.06, COL.legno, -9, 1.05, 2.9);
    const doorLeaf = box(world, 0.05, 2.0, 1.1, COL.legnoDark, -9.4, 1.0, 2.3 - 0.0);
    doorLeaf.visible = false;
    // finestra sul fondo (notte blu) e quadri
    const night = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.2), new THREE.MeshBasicMaterial({ color: 0x142a38 }));
    night.position.set(-6.3, 1.65, -4.88); world.add(night);
    for (let i = 0; i < 2; i++) box(world, 0.05, 1.2, 0.04, COL.legno, -7.6 + i * 1.3, 1.65, -4.86);
    box(world, 2.7, 0.05, 0.05, COL.legno, -6.3, 2.27, -4.86); box(world, 2.7, 0.05, 0.05, COL.legno, -6.3, 1.03, -4.86);
    // finestre sul muro sinistro
    for (const zc of [-2.9, -0.4]) {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ color: 0x142a38 }));
        w.rotation.y = Math.PI / 2; w.position.set(-8.88, 1.6, zc); world.add(w);
        box(world, 0.05, 0.05, 1.7, COL.legno, -8.86, 2.22, zc); box(world, 0.05, 0.05, 1.7, COL.legno, -8.86, 0.98, zc);
    }

    // ---------- fuori: lampione e piantina
    cyl(world, 0.05, 0.07, 3.4, 6, 0x2a3531, -11.4, 1.7, 0.4);
    sph(world, 0.22, COL.warm, -11.4, 3.5, 0.4, { material: glowMat(COL.warm), seg: 8 });
    const streetLamp = new THREE.PointLight(0xffc98a, 10, 8, 1.6); streetLamp.position.set(-11.2, 3.3, 0.6); scene.add(streetLamp);
    pool(world, -11.4, 0.6, 3, 'rgba(255,201,131,', 0.3, 0.012);
    if (!CLAY) {
        cyl(world, 0.12, 0.16, 1.2, 6, 0x3a2a1e, -15.2, 0.6, 2.4);
        sph(world, 0.9, 0x1f4a3b, -15.2, 1.9, 2.4, { seg: 7 });
        sph(world, 0.6, 0x28604c, -14.9, 2.6, 2.2, { seg: 6 });
    }

    // ---------- SALA
    const chairGeo = { seat: rbGeo(0.44, 0.08, 0.44, 0.035, 2), back: rbGeo(0.44, 0.5, 0.07, 0.03, 2), base: lathe(capProfile(0.05, 0.075, 0.4, 0.02), 14) };
    const chairData = [];
    const addChair = (x, z, ry) => chairData.push({ x, z, ry });
    const tables = [];
    const addRound = (id, x, z, r, seats, state, ang0 = 0) => {
        const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
        cyl(g, r, r, 0.07, 28, 0xc6ab82, 0, 0.75, 0, { edge: 0.032 });
        cyl(g, 0.06, 0.1, 0.72, 12, 0x2a3430, 0, 0.36, 0);
        cyl(g, r * 0.5, r * 0.55, 0.04, 14, 0x2a3430, 0, 0.02, 0);
        blob(world, x, z, r + 0.6, 0.45);
        const seatsPos = [];
        for (let i = 0; i < seats; i++) {
            const a = ang0 + (i / seats) * Math.PI * 2;
            const cx = x + Math.sin(a) * (r + 0.32), cz = z + Math.cos(a) * (r + 0.32);
            addChair(cx, cz, a + Math.PI);
            seatsPos.push({ x: cx, z: cz, a: a + Math.PI, tx: x + Math.sin(a) * (r + 0.12), tz: z + Math.cos(a) * (r + 0.12) });
        }
        const t = { id, x, z, r, g, seats: seatsPos, state, kind: 'round' };
        tables.push(t);
        return t;
    };
    const addRect = (id, x, z, w, d, seatsPerSide, state) => {
        const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
        box(g, w, 0.06, d, 0xc6ab82, 0, 0.75, 0, { rough: 0.6 });
        box(g, 0.1, 0.72, d * 0.7, 0x2a3430, -w * 0.32, 0.36, 0); box(g, 0.1, 0.72, d * 0.7, 0x2a3430, w * 0.32, 0.36, 0);
        blob(world, x, z, Math.max(w, d) * 0.9 + 0.3, 0.45);
        const seatsPos = [];
        for (let i = 0; i < seatsPerSide; i++) {
            const cx = x + (i - (seatsPerSide - 1) / 2) * (w / seatsPerSide + 0.05);
            for (const sgn of [-1, 1]) {
                const cz = z + sgn * (d / 2 + 0.3);
                addChair(cx, cz, sgn > 0 ? Math.PI : 0);
                seatsPos.push({ x: cx, z: cz, a: sgn > 0 ? Math.PI : 0, tx: cx, tz: z + sgn * (d / 2 + 0.1) });
            }
        }
        const t = { id, x, z, r: Math.max(w, d) / 2, g, seats: seatsPos, state, kind: 'rect' };
        tables.push(t);
        return t;
    };
    addRound(3, -7.3, -3.0, 0.6, 4, 'a', 0.3);
    addRound(4, -4.3, -3.2, 0.6, 4, 'a', 0.9);
    addRect(5, -7.2, -0.5, 1.3, 0.8, 2, 'a');
    addRect(6, -2.5, -1.1, 1.3, 0.8, 2, 'a');
    addRound(7, -0.3, 1.9, 0.6, 4, 'b', 0.4);
    const T8 = addRound(8, -4.0, 0.9, 0.7, 4, 'b', 0.8);
    addRound(9, -6.3, 3.2, 0.55, 4, 'f', 0.2);
    addRound(10, -1.9, 3.1, 0.55, 4, 'a', 0.5);

    // sedie (istanziate)
    const mkInst = (geo, color, offY) => {
        const im = new THREE.InstancedMesh(geo, mat(color), chairData.length);
        const d = new THREE.Object3D();
        chairData.forEach((c, i) => { d.position.set(c.x, offY, c.z); d.rotation.set(0, c.ry, 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
        world.add(im);
        return im;
    };
    mkInst(chairGeo.seat, COL.chair, 0.46);
    mkInst(chairGeo.base, 0x1c2522, 0.22);
    {
        const im = new THREE.InstancedMesh(chairGeo.back, mat(COL.chair), chairData.length);
        const d = new THREE.Object3D();
        chairData.forEach((c, i) => { d.rotation.set(0, c.ry, 0); d.position.set(c.x - Math.sin(c.ry) * 0.2, 0.72, c.z - Math.cos(c.ry) * 0.2); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
        world.add(im);
    }

    // anelli di stato sotto i tavoli (come i colori della piantina dell'app)
    const rings = [];
    for (const t of tables) {
        const rg = new THREE.Mesh(new THREE.RingGeometry(t.r + 0.5, t.r + 0.68, 40), new THREE.MeshBasicMaterial({ color: COL.legno, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
        rg.rotation.x = -Math.PI / 2; rg.position.set(t.x, 0.03, t.z); world.add(rg);
        const disc = new THREE.Mesh(new THREE.CircleGeometry(t.r + 0.5, 40), new THREE.MeshBasicMaterial({ color: COL.menta, transparent: true, opacity: 0, depthWrite: false }));
        disc.rotation.x = -Math.PI / 2; disc.position.set(t.x, 0.028, t.z); world.add(disc);
        t.ring = rg; t.disc = disc;
        const base = t.state === 'a' ? COL.menta : (t.state === 'b' ? COL.legno : COL.legno);
        rg.material.color.setHex(base);
        if (t.state === 'a') { rg.material.opacity = 0.55; disc.material.opacity = 0.07; }
        if (t.state === 'b' && t.id !== 8) rg.material.opacity = 0.5;
    }

    // luci a sospensione
    const pendants = [];
    const addPendant = (x, z, y = 2.15, r = 0.3) => {
        cyl(world, 0.012, 0.012, 2.7 - y, 4, 0x111111, x, (2.7 + y) / 2, z);
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), (CLAY ? new THREE.MeshStandardMaterial({ color: 0x8c8a85, roughness: 0.9, side: THREE.DoubleSide }) : new THREE.MeshToonMaterial({ color: 0x2b3a35, gradientMap: toonGradient(), side: THREE.DoubleSide })));
        m.position.set(x, y - 0.02, z); m.scale.y = 0.75; world.add(m);
        const bulb = sph(world, 0.09, COL.warm, x, y - 0.07, z, { material: glowMat(COL.warm), seg: 6 });
        pool(world, x, z, 1.7, 'rgba(255,201,131,', 0.22);
        pendants.push(bulb);
    };
    for (const t of tables) addPendant(t.x, t.z);

    // bancone del bar + sgabelli + bottiglie
    box(world, 4.4, 1.05, 0.7, 0x2a2018, -1.6, 0.525, -4.25, { rough: 0.7 });
    box(world, 4.5, 0.06, 0.82, COL.legno, -1.6, 1.08, -4.25, { rough: 0.5 });
    for (let i = 0; i < 5; i++) { cyl(world, 0.17, 0.17, 0.05, 10, COL.chair, -3.2 + i * 0.8, 0.7, -3.55); cyl(world, 0.03, 0.03, 0.7, 5, 0x15191b, -3.2 + i * 0.8, 0.35, -3.55); }
    box(world, 4.2, 0.05, 0.28, COL.legnoDark, -1.6, 1.55, -4.8);
    box(world, 4.2, 0.05, 0.28, COL.legnoDark, -1.6, 2.05, -4.8);
    const bottleCols = [0x2f6d4f, 0x8a5a2b, 0xd9b45a, 0x3b5f8a, 0x7b2e3a, 0x2f6d4f];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) cyl(world, 0.05, 0.06, 0.28, 6, bottleCols[(i + r) % bottleCols.length], -3.4 + i * 0.32, 1.72 + r * 0.5, -4.8, CLAY ? {} : { emissive: bottleCols[(i + r) % bottleCols.length], emissiveIntensity: 0.18 });
    // postazione accoglienza + cassa
    box(world, 0.7, 1.0, 0.45, 0x2a2018, -7.3, 0.5, 0.95);
    box(world, 0.78, 0.05, 0.52, COL.legno, -7.3, 1.02, 0.95);
    const stand = box(world, 0.34, 0.22, 0.02, COL.menta, -7.3, 1.2, 0.86, { material: glowMat(COL.menta, 0.9) }); stand.rotation.x = -0.3;
    box(world, 1.0, 0.95, 0.55, 0x2a2018, 0.2, 0.475, 3.4);
    // piante
    const plant = (x, z, s = 1) => { cyl(world, 0.2 * s, 0.15 * s, 0.35 * s, 8, 0x4a3426, x, 0.18 * s, z); for (let i = 0; i < 4; i++) sph(world, 0.22 * s, 0x2c6b4d, x + Math.sin(i * 1.6) * 0.18 * s, 0.5 * s + i * 0.13 * s, z + Math.cos(i * 1.6) * 0.18 * s, { seg: 6 }); };
    plant(-8.5, -4.4); plant(0.5, -4.3, 1.2); plant(-8.5, 3.5, 0.9);

    // ---------- CUCINA
    const kit = new THREE.Group(); world.add(kit);
    box(kit, 4.9, 0.9, 0.8, 0x394642, 4.0, 0.45, -4.55, { rough: 0.5, metal: 0.2 });
    box(kit, 5.0, 0.06, 0.9, COL.metal, 4.0, 0.93, -4.55, { rough: 0.35, metal: 0.5 });
    const burners = [];
    for (let i = 0; i < 4; i++) {
        cyl(kit, 0.2, 0.2, 0.03, 12, 0x15191b, 2.3 + i * 0.6, 0.97, -4.55);
        const f = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 8), glowMat(0xffa14a, 0.9)); f.position.set(2.3 + i * 0.6, 1.02, -4.55); kit.add(f); burners.push(f);
    }
    // pentole sui fuochi
    cyl(kit, 0.22, 0.2, 0.2, 12, 0x707d78, 2.9, 1.1, -4.55, { metal: 0.5, rough: 0.4 });
    cyl(kit, 0.2, 0.18, 0.14, 12, 0x707d78, 3.5, 1.07, -4.55, { metal: 0.5, rough: 0.4 });
    box(kit, 5.0, 0.12, 0.95, 0x2b3633, 3.9, 2.15, -4.4);                 // cappa
    box(kit, 1.2, 0.5, 0.9, 0x2b3633, 3.9, 2.45, -4.4);
    const hoodLight = box(kit, 4.6, 0.02, 0.5, 0xffd9a0, 3.9, 2.08, -4.4, { material: glowMat(0xffd9a0, 0.8) });
    box(kit, 0.8, 0.06, 0.55, 0x8aa09a, 6.0, 0.97, -4.55, { metal: 0.6, rough: 0.3 });           // lavello
    // isola
    box(kit, 2.7, 0.9, 1.0, 0x394642, 4.1, 0.45, -1.1, { rough: 0.5, metal: 0.2 });
    box(kit, 2.8, 0.06, 1.1, COL.legnoDark, 4.1, 0.93, -1.1, { rough: 0.5 });
    box(kit, 0.6, 0.03, 0.4, COL.legno, 3.5, 0.98, -1.2); box(kit, 0.5, 0.03, 0.36, 0x6f7f79, 4.6, 0.98, -1.0);
    for (let i = 0; i < 3; i++) sph(kit, 0.07, i === 0 ? 0xd86a4a : 0xe7d58a, 3.4 + i * 0.12, 1.05, -1.2, { seg: 6 });
    // frigo
    box(kit, 1.0, 1.95, 0.9, 0x6b7b76, 6.4, 0.98, -3.6, { metal: 0.4, rough: 0.35 });
    box(kit, 0.04, 0.5, 0.04, 0x1d2522, 5.9, 1.2, -3.15);
    // passe: ripiano + lampada di calore + binario comande
    box(kit, 0.8, 0.07, 2.2, COL.legno, 1.05, 0.98, -2.3, { rough: 0.5 });
    box(kit, 0.2, 0.05, 2.2, 0xffb35a, 1.2, 2.0, -2.3, { material: glowMat(0xffa14a, 0.9) });
    pool(kit, 0.9, -2.3, 1.6, 'rgba(255,170,80,', 0.25, 0.99);
    box(kit, 0.04, 0.04, 2.0, COL.metal, 1.35, 1.78, -2.3, { metal: 0.6 });
    // tablet cucina (mostra la schermata vera)
    const tabletBase = box(kit, 0.5, 0.05, 0.4, 0x1a2220, 1.9, 0.98, -0.95);
    const tabletGroup = new THREE.Group(); tabletGroup.position.set(1.9, 1.3, -0.95); tabletGroup.rotation.set(-0.35, 0.78, 0); kit.add(tabletGroup);
    box(tabletGroup, 0.78, 0.5, 0.03, 0x0d1311, 0, 0, 0);
    const tabletScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.464), new THREE.MeshBasicMaterial({ color: 0x15201c }));
    tabletScreen.position.z = 0.02; tabletGroup.add(tabletScreen);
    box(kit, 0.05, 0.32, 0.05, 0x1a2220, 1.9, 1.12, -1.0);
    const tex = new THREE.TextureLoader();
    const loadTex = (src, cb) => tex.load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; cb(t); });
    let texNuova = null, texPronto = null;
    loadTex('img/st_cucina_nuova.webp', (t) => { texNuova = t; tabletScreen.material.map = t; tabletScreen.material.color.setHex(0xffffff); tabletScreen.material.needsUpdate = true; });
    loadTex('img/st_cucina_pronto.webp', (t) => { texPronto = t; });
    // comanda (il foglietto che vola)
    const ticket = new THREE.Group(); world.add(ticket); ticket.visible = false;
    box(ticket, 0.3, 0.42, 0.012, COL.white, 0, 0, 0, { material: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.7 }) });
    box(ticket, 0.3, 0.07, 0.016, COL.menta, 0, 0.17, 0, { material: glowMat(COL.menta) });
    for (let i = 0; i < 4; i++) box(ticket, 0.2, 0.012, 0.016, 0x2b3633, 0, 0.07 - i * 0.07, 0.002);
    const trail = [];
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06 - i * 0.004, 6, 5), new THREE.MeshBasicMaterial({ color: COL.menta, transparent: true, opacity: 0 })); world.add(m); trail.push(m); }
    const ticketGlow = pool(world, 1.35, -2.3, 0.8, 'rgba(45,216,163,', 0, 1.8);
    // piatti
    const plates = [];
    for (let i = 0; i < 4; i++) {
        const g = new THREE.Group(); world.add(g);
        cyl(g, 0.2, 0.17, 0.03, 14, 0xf1f4f2, 0, 0, 0, { rough: 0.4 });
        sph(g, 0.1, i % 2 ? 0xc96a3f : 0xd9b45a, 0, 0.06, 0, { seg: 7 });
        sph(g, 0.05, 0x3a8a54, 0.06, 0.12, 0.02, { seg: 5 });
        g.visible = false;
        plates.push(g);
    }
    // vapore dalle pentole
    const steam = [];
    for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), new THREE.MeshBasicMaterial({ color: 0xdfe7e4, transparent: true, opacity: 0, depthWrite: false })); kit.add(m); steam.push(m); }

    // ---------- UFFICIO
    const off = new THREE.Group(); world.add(off);
    box(off, 2.6, 0.78, 0.95, 0x2d3532, 9.0, 0.39, -3.9, { rough: 0.6 });
    box(off, 2.7, 0.06, 1.05, COL.legno, 9.0, 0.81, -3.9, { rough: 0.45 });
    // monitor (grafico animato)
    const chartCanvas = document.createElement('canvas'); chartCanvas.width = 320; chartCanvas.height = 200;
    const chartTex = new THREE.CanvasTexture(chartCanvas); chartTex.colorSpace = THREE.SRGBColorSpace;
    box(off, 1.15, 0.7, 0.05, 0x0d1311, 9.0, 1.3, -4.15);
    const monitor = new THREE.Mesh(new THREE.PlaneGeometry(1.07, 0.62), new THREE.MeshBasicMaterial({ map: chartTex }));
    monitor.position.set(9.0, 1.3, -4.115); off.add(monitor);
    box(off, 0.08, 0.28, 0.08, 0x1a2220, 9.0, 0.97, -4.15); box(off, 0.4, 0.03, 0.22, 0x1a2220, 9.0, 0.84, -4.1);
    box(off, 0.7, 0.025, 0.24, 0x1a2220, 9.0, 0.85, -3.55);                    // tastiera
    for (let i = 0; i < 3; i++) box(off, 0.34, 0.025 + i * 0.01, 0.46, 0xf3f5f4, 8.05, 0.86 + i * 0.012, -3.8, { ry: i * 0.12 }); // fatture
    box(off, 0.18, 0.012, 0.3, 0x1a2220, 10.0, 0.85, -3.7, { ry: 0.4 });
    cyl(off, 0.03, 0.03, 0.5, 5, 0x1a2220, 10.1, 1.07, -4.3); sph(off, 0.1, COL.menta, 10.05, 1.36, -4.2, { material: glowMat(COL.menta), seg: 6 });
    // sedia girevole
    cyl(off, 0.24, 0.24, 0.07, 10, COL.chair, 9.0, 0.5, -2.75); box(off, 0.46, 0.5, 0.06, COL.chair, 9.0, 0.82, -2.45); cyl(off, 0.04, 0.04, 0.4, 5, 0x15191b, 9.0, 0.25, -2.75);
    blob(world, 9.0, -2.8, 0.7, 0.5); blob(world, 9.0, -3.9, 1.7, 0.4);
    // grafico a parete sul fondo (barre che crescono)
    const wallBars = [];
    box(off, 1.6, 1.25, 0.05, 0x141b18, 11.05, 1.75, -4.95);
    for (let i = 0; i < 6; i++) {
        const bar = box(off, 0.17, 1, 0.06, i === 4 ? COL.menta : COL.legno, 10.42 + i * 0.25, 1.28, -4.9, { material: i === 4 ? glowMat(COL.menta) : mat(COL.legno, { emissive: COL.legno, emissiveIntensity: 0.25 }) });
        bar.geometry.translate(0, 0.5, 0);
        bar.position.y = 1.28;
        bar.userData.h = [0.3, 0.45, 0.38, 0.62, 0.95, 0.55][i];
        wallBars.push(bar);
    }
    box(off, 1.45, 0.03, 0.06, COL.legno, 11.05, 1.27, -4.9);
    // scaffali con scatole (magazzino) e calendario turni
    for (let s = 0; s < 3; s++) {
        box(off, 0.5, 0.05, 2.8, COL.legnoDark, 7.4, 0.5 + s * 0.65, -2.8);
        for (let i = 0; i < 5; i++) { const hi = (i + s) % 4 === 0; box(off, 0.32, 0.38, 0.4, hi ? 0x2f8f73 : 0x8a7452, 7.4, 0.72 + s * 0.65, -4.0 + i * 0.52, { emissive: hi ? COL.menta : 0, emissiveIntensity: hi ? 0.25 : 0 }); }
    }
    box(off, 0.7, 0.9, 0.03, 0xf1f4f2, 8.0, 2.05, -4.93, { material: new THREE.MeshStandardMaterial({ color: 0xece8de, roughness: 0.9 }) });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) box(off, 0.1, 0.07, 0.03, (r + c) % 3 === 0 ? COL.menta : 0x6a756f, 7.78 + c * 0.11, 2.3 - r * 0.2, -4.9);
    cyl(off, 0.26, 0.2, 0.36, 8, 0x4a3426, 11.3, 0.18, 3.2); for (let i = 0; i < 5; i++) sph(off, 0.25, 0x2c6b4d, 11.3 + Math.sin(i * 1.3) * 0.25, 0.6 + i * 0.14, 3.2 + Math.cos(i * 1.3) * 0.25, { seg: 6 });
    box(off, 0.5, 1.2, 0.7, 0x6b7b76, 11.55, 0.6, -0.2, { metal: 0.3 });
    addPendant(9.0, -2.3, 2.25, 0.35);
    addPendant(4, -1.1, 2.2, 0.3); addPendant(4, -3.5, 2.2, 0.3);

    // ---------- persone
    const people = [];
    const addPerson = (o, track, extra = {}) => { const p = makePerson(o); p.track = track; p.name = extra.name; world.add(p.root); p.root.visible = !extra.hideBefore; Object.assign(p, extra); people.push(p); return p; };
    const WHO = {
        marco: { skin: SKIN[1], shirt: 0xf1f4f2, pants: 0x1f272a, apron: COL.menta, hair: 0x20150e, collar: 0x15191b },
        elena: { skin: SKIN[3], shirt: 0xf6f7f4, pants: 0x2a3330, hat: true, apron: 0x39463f },
        giulia: { skin: SKIN[0], shirt: 0xb48a56, pants: 0x20282b, hair: 0x4a2a16, longHair: true, collar: 0xf1f4f2 },
    };
    const lombardi = [
        { skin: SKIN[0], shirt: 0xb5543a, pants: 0x2a3a52, hair: 0x2a1d14, longHair: true },
        { skin: SKIN[2], shirt: 0x5a7690, pants: 0x30303a, hair: 0x15100c },
        { skin: SKIN[3], shirt: 0xc9a23a, pants: 0x2e3a2c, hair: 0x6a4a2a, scale: 0.88 },
        { skin: SKIN[4], shirt: 0x7a5aa0, pants: 0x1f272a, hair: 0x1b130d, scale: 0.8 },
    ];

    // Marco
    const sp = T8.seats;
    const front = { x: -4.0, z: 2.5 };
    addPerson(WHO.marco, makeTrack([
        { t: 0, x: -6.5, z: 1.5, face: -1.0, pose: {} },
        { t: 0.6, x: -6.5, z: 1.5, face: -1.0, pose: { phone: true } },
        { t: 1.3, x: -6.5, z: 1.5, face: -1.0, pose: { phone: true } },
        { t: 1.4, x: -6.5, z: 1.5, face: -1.0, pose: {} },
        { t: 1.75, x: -6.5, z: 1.5, face: Math.PI / 2, pose: {} },
        { t: 2.35, x: front.x, z: front.z, face: Math.PI, pose: {} },
        { t: 2.6, x: front.x, z: front.z, face: Math.PI, pose: { phone: true } },
        { t: 3.3, x: front.x, z: front.z, face: Math.PI, pose: { phone: true } },
        { t: 3.4, x: front.x, z: front.z, face: Math.PI, pose: {} },
        { t: 4.55, x: front.x, z: front.z, face: Math.PI, pose: {} },
        { t: 4.7, x: -2.7, z: 1.5, pose: {} },
        { t: 4.8, x: -1.0, z: 0.1, pose: {} },
        { t: 4.9, x: 0.0, z: -1.5, pose: {} },
        { t: 4.97, x: 0.15, z: -2.3, face: Math.PI / 2, pose: {} },
        { t: 5.06, x: 0.15, z: -2.3, face: Math.PI / 2, pose: { carry: true } },
        { t: 5.2, x: -1.0, z: 0.1, pose: { carry: true } },
        { t: 5.3, x: -2.8, z: 1.5, pose: { carry: true } },
        { t: 5.4, x: front.x, z: front.z, face: Math.PI, pose: { carry: true } },
        { t: 5.5, x: front.x, z: front.z, face: Math.PI, pose: {} },
    ]), { name: 'Marco', key: 'marco' });
    // Elena
    const stove = { x: 3.0, z: -3.45 }, tab = { x: 2.55, z: -0.5 }, passP = { x: 1.9, z: -2.4 };
    addPerson(WHO.elena, makeTrack([
        { t: 0, x: stove.x, z: stove.z, face: Math.PI, pose: { stir: true } },
        { t: 3.7, x: stove.x, z: stove.z, face: Math.PI, pose: { stir: true } },
        { t: 3.9, x: tab.x, z: tab.z, face: -2.14, pose: { type: true } },
        { t: 4.15, x: tab.x, z: tab.z, face: -2.14, pose: { type: true } },
        { t: 4.3, x: stove.x, z: stove.z, face: Math.PI, pose: { stir: true } },
        { t: 4.6, x: stove.x, z: stove.z, face: Math.PI, pose: { stir: true } },
        { t: 4.72, x: tab.x, z: tab.z, face: -2.14, pose: { type: true } },
        { t: 4.9, x: tab.x, z: tab.z, face: -2.14, pose: { type: true } },
        { t: 5.1, x: stove.x, z: stove.z, face: Math.PI, pose: { stir: true } },
    ]), { name: 'Elena', key: 'elena' });
    // Giulia
    const desk = { x: 9.0, z: -2.78 };
    addPerson(WHO.giulia, makeTrack([
        { t: 0, x: desk.x, z: desk.z, sit: 1, face: Math.PI, pose: { type: true } },
        { t: 6.15, x: desk.x, z: desk.z, sit: 1, face: Math.PI, pose: { type: true } },
        { t: 6.25, x: desk.x, z: desk.z, sit: 1, face: Math.PI, pose: { phone: true } },
        { t: 6.55, x: desk.x, z: desk.z, sit: 1, face: Math.PI, pose: { phone: true } },
        { t: 6.65, x: desk.x, z: desk.z, sit: 1, face: Math.PI, pose: { type: true } },
    ]), { name: 'Giulia', key: 'giulia' });
    // famiglia Lombardi: dalla strada alla porta, in attesa, poi al tavolo 8
    const wait = [[-8.0, 2.05], [-8.55, 2.55], [-7.85, 2.75], [-8.5, 1.85]];
    lombardi.forEach((o, i) => {
        const s = sp[i];
        const stand = { x: s.x - Math.sin(s.a) * 0.55, z: s.z - Math.cos(s.a) * 0.55 };
        const seatPos = { x: s.x + Math.sin(s.a) * 0.08 - Math.sin(s.a) * 0.0, z: s.z + Math.cos(s.a) * 0.08 };
        const lag = i * 0.07;
        addPerson(o, makeTrack([
            { t: 0.25 + lag, x: -14.5 - i * 0.7, z: 2.2 + (i % 2) * 0.4, face: Math.PI / 2, pose: {} },
            { t: 0.95 + lag, x: wait[i][0], z: wait[i][1], face: Math.PI / 2 + 0.2, pose: {} },
            { t: 1.7, x: wait[i][0], z: wait[i][1], face: Math.PI / 2 + 0.2, pose: {} },
            { t: 2.3 + lag * 2, x: stand.x, z: stand.z, face: s.a, pose: {} },
            { t: 2.5 + lag * 2, x: seatPos.x, z: seatPos.z, sit: 1, face: s.a, pose: {} },
        ]), { name: 'Lombardi' + i, hideBefore: true, key: 'lombardi' + i, seed: i });
    });
    // clienti già seduti
    const seatedSpec = [[3, 0, 2], [3, 2, 1], [4, 0, 3], [4, 2, 0], [5, 0, 4], [5, 3, 2], [6, 1, 1], [6, 2, 3], [10, 0, 0], [10, 2, 4]];
    const palette = [0x7a5a3a, 0x4d6f5a, 0xa3584a, 0x6a7fa0, 0xc4a352, 0x8b6fa0, 0x5b8a8a, 0xb36b5a, 0x6e7a52, 0x9a8a6a];
    seatedSpec.forEach(([id, idx, skinIdx], i) => {
        const t = tables.find(x => x.id === id); const s = t.seats[idx % t.seats.length];
        const p = makePerson({ skin: SKIN[skinIdx % SKIN.length], shirt: palette[i % palette.length], pants: 0x23282b, hair: [0x2a1d14, 0x15100c, 0x6a4a2a, 0x8a8a8a][i % 4], longHair: i % 3 === 0 });
        p.root.position.set(s.x + Math.sin(s.a) * 0.08, 0, s.z + Math.cos(s.a) * 0.08);
        p.root.rotation.y = s.a;
        p.seated = true; p.seed = i * 1.3;
        world.add(p.root); people.push(p);
    });

    if (CLAY) {
        world.traverse((o) => {
            if (!o.isMesh && !o.isInstancedMesh) return;
            const m = o.material;
            if (!m || m.isMeshBasicMaterial) return;
            o.castShadow = true; o.receiveShadow = true;
        });
    }

    // ---------- etichette HTML ancorate al 3D
    const labelDefs = {
        marco: { person: 'marco', text: 'Marco · cameriere', obj: () => people.find(p => p.key === 'marco').root, dy: 2.1, show: (pos) => pos > 0.7 && pos < 5.6 },
        elena: { person: 'elena', text: 'Elena · cuoca', obj: () => people.find(p => p.key === 'elena').root, dy: 2.35, show: (pos) => pos > 3.5 && pos < 5.2 },
        giulia: { person: 'giulia', text: 'Giulia · titolare', obj: () => people.find(p => p.key === 'giulia').root, dy: 1.85, show: (pos) => pos > 5.5 && pos < 7.0 },
        t8: { text: 'Tavolo 8 · Lombardi', obj: () => T8.g, dy: 1.9, show: (pos) => pos > 0.9 && pos < 2.45, cls: 'pin' },
        pass: { text: 'Comanda in arrivo', obj: () => ({ position: new THREE.Vector3(1.35, 0, -2.3) }), dy: 2.45, show: (pos) => pos > 3.8 && pos < 4.6, cls: 'pin' },
    };
    const labels = {};
    for (const [k, d] of Object.entries(labelDefs)) {
        const el = document.createElement('div');
        el.className = 'label3d' + (d.cls ? ' ' + d.cls : '');
        el.textContent = d.text;
        labelsLayer.appendChild(el);
        labels[k] = { el, ...d };
    }

    // ---------- camera
    const KEYS = [
        { pos: 0, t: [1.5, 0.2, -0.4], fit: [24, 10.5], fitP: [12.5, 11], tP: [-1.5, 0.2, -0.2], az: 12, el: 44 },
        { pos: 1, t: [-6.2, 0.9, 1.5], fit: [12.5, 7.2], az: 22, el: 32 },
        { pos: 2, t: [-5.0, 0.7, 1.0], fit: [11.5, 6.8], az: 8, el: 40 },
        { pos: 3, t: [-4.0, 1.0, 1.1], fit: [7.5, 5.0], az: 24, el: 30 },
        { pos: 4, t: [3.2, 1.0, -2.1], fit: [8.6, 5.8], az: -8, el: 38 },
        { pos: 5, t: [-1.4, 0.9, -0.3], fit: [11.5, 6.4], az: 4, el: 38 },
        { pos: 6, t: [9.3, 1.0, -2.2], fit: [6.4, 4.9], az: -8, el: 34 },
        { pos: 7, t: [1.5, 0.2, -0.4], fit: [24, 10.5], fitP: [12.5, 11], tP: [3.0, 0.2, -0.2], az: -12, el: 44 },
    ];
    const easeDwell = (u) => { const a = 0.22, b = 0.78; if (u <= a) return 0; if (u >= b) return 1; return smoother((u - a) / (b - a)); };
    const tmp = new THREE.Vector3();
    let view = { w: 1, h: 1, shiftX: 0, shiftY: 0, uw: 1, uh: 1 };
    const camOut = new THREE.PerspectiveCamera(), camFp = new THREE.PerspectiveCamera();
    function outsidePose(pos, time, cam) {
        const i = clamp(Math.floor(pos), 0, KEYS.length - 2);
        const e = easeDwell(pos - i);
        const a = KEYS[i], b = KEYS[i + 1];
        const mix = (u, v) => lerp(u, v, e);
        const portrait = view.w / view.h < 0.9;
        const ta = portrait && a.tP ? a.tP : a.t, tb = portrait && b.tP ? b.tP : b.t;
        const fa = portrait && a.fitP ? a.fitP : a.fit, fb = portrait && b.fitP ? b.fitP : b.fit;
        const t = [mix(ta[0], tb[0]), mix(ta[1], tb[1]), mix(ta[2], tb[2])];
        const breath = Math.sin(Math.PI * e);                       // a metà viaggio la camera si allarga un po'
        const fit = [mix(fa[0], fb[0]) * (1 + 0.5 * breath), mix(fa[1], fb[1]) * (1 + 0.5 * breath)];
        let az = mix(a.az, b.az), el = mix(a.el, b.el) + 7 * breath;
        if (pos < 0.4) az += Math.sin(time * 0.25) * 6; else if (pos > 6.6) az += Math.sin(time * 0.25) * 6;
        const aspect = view.w / view.h;
        const vf = THREE.MathUtils.degToRad(CAMERA_FOV);
        const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
        const dist = Math.max(fit[0] / (2 * Math.tan(hf / 2) * view.uw), fit[1] / (2 * Math.tan(vf / 2) * view.uh));
        const azr = THREE.MathUtils.degToRad(az), elr = THREE.MathUtils.degToRad(el);
        cam.position.set(t[0] + Math.sin(azr) * Math.cos(elr) * dist, t[1] + Math.sin(elr) * dist, t[2] + Math.cos(azr) * Math.cos(elr) * dist);
        cam.lookAt(t[0], t[1], t[2]);
    }

    // ---------- in prima persona: la camera sta negli occhi di chi vive la scena
    const P = {};
    people.forEach(p => { if (p.key) P[p.key] = p; });
    function subjectPlan(pos) {
        if (pos < 3.55) return ['marco', 'marco', 0];
        if (pos < 3.85) return ['marco', 'elena', smooth(seg(pos, 3.55, 3.85))];
        if (pos < 4.85) return ['elena', 'elena', 0];
        if (pos < 5.0) return ['elena', 'marco', smooth(seg(pos, 4.85, 5.0))];
        if (pos < 5.45) return ['marco', 'marco', 0];
        if (pos < 5.75) return ['marco', 'giulia', smooth(seg(pos, 5.45, 5.75))];
        return ['giulia', 'giulia', 0];
    }
    function eyeOf(key, time) {
        const p = P[key];
        const pz = p._pose || {};
        const target = pz.phone ? -0.36 : pz.stir ? -0.55 : pz.type ? -0.42 : pz.carry ? -0.3 : -0.1;
        p._pitch = p._pitch === undefined ? target : p._pitch + (target - p._pitch) * 0.1;
        const yaw = p.face + Math.sin(time * 0.6 + key.length) * 0.025;
        const y = 1.62 - 0.32 * (p._sit || 0) + (p._bob || 0);
        return { x: p.root.position.x + Math.sin(yaw) * 0.08, y, z: p.root.position.z + Math.cos(yaw) * 0.08, yaw, pitch: p._pitch };
    }
    const eye = new THREE.Vector3();
    function fpPose(pos, time, cam) {
        const [ka, kb, t] = subjectPlan(pos);
        const A = eyeOf(ka, time), B = t > 0 ? eyeOf(kb, time) : A;
        eye.set(lerp(A.x, B.x, t), lerp(A.y, B.y, t), lerp(A.z, B.z, t));
        const yaw = lerpAngle(A.yaw, B.yaw, t), pitch = lerp(A.pitch, B.pitch, t), cp = Math.cos(pitch);
        cam.position.copy(eye);
        cam.lookAt(eye.x + Math.sin(yaw) * cp, eye.y + Math.sin(pitch), eye.z + Math.cos(yaw) * cp);
        return t < 0.5 ? ka : kb;
    }

    // ---------- aggiornamento per posizione
    const dummy = new THREE.Vector3();
    const posTable8 = new THREE.Vector3(T8.x, 0.82, T8.z);
    function update(pos, time) {
        // pos è continuo: tutti i movimenti derivano da lui
        for (const p of people) {
            if (p.seated) {
                poseFor(p, { sit: 1, seed: p.seed, type: false }, time);
                p.armL.sh.rotation.x = -0.9; p.armR.sh.rotation.x = -0.75; p.armL.el.rotation.x = -0.6; p.armR.el.rotation.x = -0.6;
                p.shadow.visible = false;
                continue;
            }
            const s = p.track(pos);
            p.root.visible = !(p.hideBefore && s.before);
            p.root.position.set(s.x, 0, s.z);
            p.face = lerpAngle(p.face, s.face, p._init ? 0.18 : 1);
            p._init = true;
            p.root.rotation.y = p.face;
            const cadence = 2 * Math.PI / 0.85;
            poseFor(p, { sit: s.sit, walk: s.walk, phase: s.cum * cadence, ...s.pose, seed: p.seed || 0 }, time);
            p._pose = s.pose;
            p.shadow.visible = s.sit < 0.5;
        }
        // tavolo 8: da "prenotato" ad "arrivato" quando Marco tocca
        const arrive = seg(pos, 1.02, 1.12);
        const pulse = pos > 1.05 && pos < 2.0 ? (0.5 + 0.5 * Math.sin((pos - 1.05) * 22)) : 0;
        T8.ring.material.color.setHex(arrive > 0.5 ? COL.menta : COL.legno);
        T8.ring.material.opacity = lerp(0.55, 0.9, arrive) * (0.85 + 0.15 * pulse);
        T8.disc.material.opacity = arrive * (0.1 + 0.1 * pulse);
        const rs = 1 + (pos > 1.05 && pos < 1.6 ? (pos - 1.05) * 0.5 * (1 - seg(pos, 1.3, 1.6)) : 0) * (0.6 + 0.4 * Math.sin((pos - 1.05) * 30));
        T8.ring.scale.setScalar(rs);
        // comanda in volo
        const f = seg(pos, 3.3, 3.78);
        ticket.visible = pos > 3.29 && pos < 4.95;
        if (ticket.visible) {
            const a = new THREE.Vector3(front.x + 0.1, 1.35, front.z - 0.1), b = new THREE.Vector3(1.38, 1.62, -2.0 - (pos > 3.78 ? 0.1 : 0));
            const e = smooth(f);
            dummy.lerpVectors(a, b, e);
            dummy.y += Math.sin(Math.PI * e) * 2.3;
            ticket.position.copy(dummy);
            ticket.rotation.set(0, f < 1 ? e * 5.5 : Math.PI / 2, f < 1 ? Math.sin(e * 6) * 0.4 : 0);
            ticket.scale.setScalar(f < 1 ? 1.25 : 1.5);
            trail.forEach((m, i) => {
                const ee = smooth(clamp(f - (i + 1) * 0.045, 0, 1));
                dummy.lerpVectors(a, b, ee); dummy.y += Math.sin(Math.PI * ee) * 2.3;
                m.position.copy(dummy);
                m.material.opacity = (f > 0 && f < 1 ? 0.7 : 0) * (1 - i / trail.length);
            });
        } else trail.forEach(m => { m.material.opacity = 0; });
        ticketGlow.material.opacity = (pos > 3.78 && pos < 4.85) ? 0.5 + 0.2 * Math.sin(time * 6) : 0;
        // tablet cucina: nuova → pronta
        const wantReady = pos > 4.78;
        if (wantReady && texPronto && tabletScreen.material.map !== texPronto) { tabletScreen.material.map = texPronto; tabletScreen.material.needsUpdate = true; }
        if (!wantReady && texNuova && tabletScreen.material.map !== texNuova) { tabletScreen.material.map = texNuova; tabletScreen.material.needsUpdate = true; }
        // fuochi e vapore
        const cooking = pos > 4.25 && pos < 4.7;
        burners.forEach((b, i) => { b.visible = i < 2 || cooking; b.scale.y = 0.8 + 0.4 * Math.sin(time * 14 + i * 2); b.scale.x = b.scale.z = 0.9 + 0.2 * Math.sin(time * 11 + i); b.material.opacity = cooking ? 0.9 : 0.5; });
        steam.forEach((m, i) => {
            const ph = ((time * 0.5 + i / steam.length) % 1);
            const base = i % 2 ? 3.5 : 2.9;
            m.position.set(base + Math.sin(ph * 6 + i) * 0.08, 1.25 + ph * 1.1, -4.55 + Math.cos(ph * 5 + i) * 0.06);
            m.scale.setScalar(0.35 + ph * 0.6);
            m.material.opacity = cooking ? (1 - ph) * 0.1 : 0;
        });
        // piatti: sul passe → in mano a Marco → sul tavolo 8
        const carryFrom = 5.06;
        plates.forEach((g, i) => {
            if (pos < 4.8) { g.visible = false; return; }
            g.visible = true;
            const popS = smooth(seg(pos, 4.8, 4.98));
            if (pos < carryFrom) { g.position.set(1.05, 1.03 + 0.0, -3.0 + i * 0.32); g.scale.setScalar(popS); return; }
            g.scale.setScalar(1);
            const m = people.find(p => p.key === 'marco').root;
            if (pos < 5.42) { const ox = (i - 1.5) * 0.12; g.position.set(m.position.x + Math.sin(m.rotation.y) * 0.4 + Math.cos(m.rotation.y) * ox, 1.12 + (i % 2) * 0.06, m.position.z + Math.cos(m.rotation.y) * 0.4 - Math.sin(m.rotation.y) * ox); return; }
            const a = (i / 4) * Math.PI * 2 + 0.8;
            g.position.set(T8.x + Math.sin(a) * 0.38, 0.8, T8.z + Math.cos(a) * 0.38);
        });
        // ufficio: grafico a parete e monitor
        const grow = seg(pos, 5.6, 6.2);
        wallBars.forEach((b, i) => { const k = smooth(clamp(grow * 1.6 - i * 0.12, 0, 1)); b.scale.y = Math.max(0.02, b.userData.h * k); });
        drawChart(grow);
        flash.intensity = (pos > 6.3 && pos < 6.38) ? 40 * Math.sin(seg(pos, 6.3, 6.38) * Math.PI) : 0;
        // luci: leggero respiro
        pendants.forEach((b, i) => { b.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.03); });
        lampSala.intensity = (30 + Math.sin(time * 2.4) * 1) * PL;
        // etichette
        for (const k in labels) {
            const L = labels[k];
            const vis = L.show(pos);
            L.visible = vis;
            if (k === 't8') L.el.classList.toggle('on', arrive > 0.5);
            if (k === 't8') L.el.textContent = arrive > 0.5 ? 'Tavolo 8 · arrivato' : 'Tavolo 8 · prenotato';
        }
    }
    function drawChart(k) {
        const g = chartCanvas.getContext('2d');
        g.fillStyle = '#0c1311'; g.fillRect(0, 0, 320, 200);
        g.fillStyle = 'rgba(238,243,240,0.5)'; g.font = '600 13px ui-monospace, monospace';
        g.fillText('INCASSO · COPERTI', 14, 24);
        const vals = [0.35, 0.52, 0.44, 0.66, 0.9, 0.6, 0.48, 0.74];
        vals.forEach((v, i) => {
            const h = v * 120 * smooth(clamp(k * 1.5 - i * 0.07, 0, 1));
            g.fillStyle = i === 4 ? '#2dd8a3' : 'rgba(220,194,156,0.75)';
            g.fillRect(24 + i * 36, 170 - h, 22, h);
        });
        g.strokeStyle = 'rgba(238,243,240,0.25)'; g.beginPath(); g.moveTo(14, 170.5); g.lineTo(306, 170.5); g.stroke();
        chartTex.needsUpdate = true;
    }

    // ---------- resa
    const proj = new THREE.Vector3();
    function renderLabels(subject, fpE) {
        for (const k in labels) {
            const L = labels[k];
            const own = subject && fpE > 0.5 && L.person === subject;     // in prima persona non vedi la tua etichetta
            if (!L.visible || own) { L.el.style.opacity = 0; continue; }
            const o = L.obj();
            proj.copy(o.position || o.getWorldPosition(new THREE.Vector3()));
            proj.y += L.dy;
            proj.project(camera);
            const behind = proj.z > 1;
            const x = (proj.x * 0.5 + 0.5) * view.w, y = (-proj.y * 0.5 + 0.5) * view.h;
            L.el.style.opacity = behind ? 0 : 1;
            L.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
        }
    }
    let applied = { fov: 0, sx: NaN, sy: NaN, near: 0 };
    function applyProjection(fov, sx, sy, near) {
        if (applied.fov === fov && applied.sx === sx && applied.sy === sy && applied.near === near) return;
        applied = { fov, sx, sy, near };
        camera.fov = fov; camera.near = near;
        camera.setViewOffset(view.w, view.h, -sx * view.w, -sy * view.h, view.w, view.h);
        camera.updateProjectionMatrix();
    }
    // shiftX/shiftY: di quanto spostare il centro della scena (frazione dello schermo); uw/uh: parte dello schermo davvero libera
    function resize(w, h, shiftX = 0, shiftY = 0, uw = 1 - Math.abs(shiftX) * 2, uh = 1 - Math.abs(shiftY) * 2) {
        view = { w, h, shiftX, shiftY, uw, uh };
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        applied = { fov: 0, sx: NaN, sy: NaN, near: 0 };
    }
    // sposta il centro della scena durante la storia (es. più a destra mentre il titolo è a sinistra)
    function setFrame(shiftX, shiftY, uw, uh) {
        view.shiftX = shiftX; view.shiftY = shiftY; view.uw = uw; view.uh = uh;
    }
    let lastTime = 0, fpBlend = 0, fpTarget = 0;
    function setMode(m) { fpTarget = m === 'fp' ? 1 : 0; }
    function getMode() { return fpTarget > 0.5 ? 'fp' : 'outside'; }
    function render(pos, time) {
        const dt = clamp(time - lastTime, 0, 0.1);
        lastTime = time;
        fpBlend += (fpTarget - fpBlend) * (1 - Math.exp(-dt * 3));
        if (Math.abs(fpTarget - fpBlend) < 0.002) fpBlend = fpTarget;
        update(pos, time);
        // la prima persona parte dopo il titolo e finisce prima della chiusura: all'inizio e alla fine si vede il locale da fuori
        const gate = smooth(seg(pos, 0.5, 0.95)) * (1 - smooth(seg(pos, 6.55, 7.0)));
        const e = fpBlend * gate;
        outsidePose(pos, time, camOut);
        let subject = null;
        if (e > 0.001) {
            subject = fpPose(pos, time, camFp);
            camera.position.lerpVectors(camOut.position, camFp.position, e);
            camera.quaternion.slerpQuaternions(camOut.quaternion, camFp.quaternion, e);
        } else {
            camera.position.copy(camOut.position);
            camera.quaternion.copy(camOut.quaternion);
        }
        for (const k of ['marco', 'elena', 'giulia']) {
            const pr = P[k];
            const hide = e > 0.5 && subject === k;               // niente testa né busto davanti alla camera: restano le braccia
            pr.headVis.visible = !hide;
            pr.torsoVis.visible = !hide;
            if (hide) pr.phone.visible = false;
            pr.armL.sh.scale.setScalar(hide ? 0.78 : 1); pr.armR.sh.scale.setScalar(hide ? 0.78 : 1);
        }
        applyProjection(lerp(CAMERA_FOV, view.w / view.h < 0.9 ? 82 : 66, e), view.shiftX * (1 - e), view.shiftY * (1 - e), lerp(0.5, 0.08, e));
        renderer.render(scene, camera);
        renderLabels(subject, e);
        return e;
    }
    function dispose() { renderer.dispose(); }
    return { render, resize, setFrame, setMode, getMode, dispose, renderer, scene, camera, people, tables };
}
