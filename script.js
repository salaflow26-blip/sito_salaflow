// ---------------------------------------------------------
// Il browser di suo tenta di "ricordare" la posizione di scroll
// tra un refresh e l'altro: dopo un ricaricamento la pagina si
// ritrovava a metà invece che in cima. Disattivato, e riportata
// in cima esplicitamente — a meno che l'URL non punti già a una
// sezione precisa (es. arrivando da un link a "#faq" o "#cucina").
// ---------------------------------------------------------
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
if (!location.hash) {
    window.scrollTo(0, 0);
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Testo ingrandito dal browser (accessibilità) su uno schermo piccolo: il pulsante dell'intestazione
// non ci sta più accanto al logo e al menu, quindi lascia il posto al menu (che ha lo stesso pulsante).
function checkBigText() {
    const px = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    document.documentElement.classList.toggle('big-text', px >= 18.5 && window.innerWidth < 1100);
}
checkBigText();
window.addEventListener('resize', checkBigText);
const stickyCtaEl = document.getElementById('stickyCta');
const demoSectionEl = document.getElementById('demo');
let ticking = false;
let lbClosedAt = -1000;       // quando si è chiuso l'ingrandimento (serve contro i tocchi fantasma)

// ---------------------------------------------------------
// Statistiche di visita anonime, nostre (si leggono in admin → «Sito»).
// Si manda un evento per ogni punto raggiunto (visita, giro sala/cucina/ufficio, «ingrandisci»,
// «salta il giro», modulo inviato...) a una funzione che aggiunge +1 a un contatore del giorno.
// Niente cookie, niente IP, nessun identificativo: si contano le sessioni (ogni evento una volta
// sola per scheda aperta, ricordato in sessionStorage), non le persone. Solo sul sito vero, e non
// se il browser chiede di non essere tracciato (Do Not Track / Global Privacy Control).
// ---------------------------------------------------------
const STATS_URL = 'https://europe-west1-salaflow-6d0f7.cloudfunctions.net/siteEvent';
const STATS_HOSTS = /^(www\.)?salaflow\.com$|\.vercel\.app$/;
const STATS_EVENTS = {
    '/giro/sala': 'giro_sala', '/giro/cucina': 'giro_cucina', '/giro/ufficio': 'giro_ufficio', '/giro/fine': 'giro_fine',
    '/giro/saltato': 'giro_saltato', '/giro/lento': 'giro_lento', '/giro/blocchi': 'giro_blocchi',
    '/ingrandisci': 'ingrandisci', '/cta': 'cta_click', '/modulo-inviato': 'modulo_inviato'
};
const statsOn = STATS_HOSTS.test(location.hostname) && navigator.doNotTrack !== '1' && !navigator.globalPrivacyControl;
const sentEvents = new Set();
try { JSON.parse(sessionStorage.getItem('salaflow_ev') || '[]').forEach(e => sentEvents.add(e)); } catch (e) { /* senza memoria di sessione si conta per pagina */ }
function statsSource() {
    const q = new URLSearchParams(location.search);
    const utm = (q.get('utm_source') || q.get('ref') || '').toLowerCase();
    let host = '';
    try { host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch (e) { /* referrer non valido */ }
    const probe = utm || host;
    if (!probe) return 'diretto';
    if (/instagram|(^|\.)ig$/.test(probe)) return 'instagram';
    if (/whatsapp|wa\.me/.test(probe)) return 'whatsapp';
    if (/google/.test(probe)) return 'google';
    if (/facebook|fb\.com|fb$/.test(probe)) return 'facebook';
    if (host === location.hostname) return 'diretto';
    return 'altro';
}
function sendStat(event, extra) {
    if (!statsOn || sentEvents.has(event)) return;
    sentEvents.add(event);
    try { sessionStorage.setItem('salaflow_ev', JSON.stringify([...sentEvents])); } catch (e) { /* ok */ }
    try {
        const body = JSON.stringify(Object.assign({ e: event }, extra || {}));
        // sendBeacon parte anche se la pagina si chiude; in alternativa fetch con keepalive
        if (!(navigator.sendBeacon && navigator.sendBeacon(STATS_URL, body))) fetch(STATS_URL, { method: 'POST', body, keepalive: true, mode: 'no-cors' }).catch(() => {});
    } catch (e) { /* le statistiche non devono mai rompere il sito */ }
}
function track(path) { const ev = STATS_EVENTS[path]; if (ev) sendStat(ev); }
sendStat('visita', { s: statsSource(), d: (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820) ? 'mobile' : 'desktop' });
document.querySelectorAll('a[href="#demo"]').forEach(a => a.addEventListener('click', () => track('/cta')));

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------------------------------------------------------
// Navigazione: menu mobile e stato "scrolled"
// ---------------------------------------------------------
const navEl = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

function closeMobileNav(returnFocus) {
    if (!navMobile || !navToggle) return;
    navMobile.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Apri il menu');
    if (returnFocus) navToggle.focus();
}
if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
        if (performance.now() - lbClosedAt < 450) return;      // tocco fantasma dopo la chiusura dell'ingrandimento
        const isOpen = navMobile.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Chiudi il menu' : 'Apri il menu');
    });
    navMobile.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMobileNav(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMobile.classList.contains('is-open')) closeMobileNav(true);
    });
}

// ---------------------------------------------------------
// IL GIRO DEL LOCALE (3D)
// Lo scroll fa scorrere una storia: la famiglia Lombardi entra, Marco li segna arrivati,
// ordinano, la comanda arriva in cucina, Elena prepara, il piatto torna in sala e a fine
// serata Giulia guarda i numeri. `pos` va da 0 a 7 (un numero intero per ogni momento);
// la scena 3D (tour3d.js) e le schermate dell'app sono funzioni di `pos`, quindi si può
// tornare indietro quanto si vuole. Senza JS, senza WebGL o con "riduci movimento" la
// pagina diventa una serie di blocchi uno sotto l'altro, con le stesse schermate.
// ---------------------------------------------------------
const story = document.querySelector('.story');
const pin = story && story.querySelector('.story-pin');
const canvas = document.getElementById('stage3d');
const labelsLayer = document.getElementById('labels3d');
const beats = story ? [...story.querySelectorAll('.beat')] : [];
const hud = document.getElementById('hud');
const hudData = hud ? JSON.parse(hud.dataset.hud) : { steps: [], chips: [] };
const hudFrames = hud ? [...hud.querySelectorAll('.hud-frame')] : [];
const hudChips = hud ? [...hud.querySelectorAll('.hud-chips button')] : [];
const storyNav = document.getElementById('storyNav');
const navLinks = [...document.querySelectorAll('.nav-links a[data-beat-go]')];
const loadingEl = document.getElementById('storyLoading');
const PMAX = story ? Number(story.dataset.n) - 1 : 0;         // posizioni della scena 3D: 0..PMAX
const FROMS = beats.map(b => Number(b.dataset.from));          // da che posizione si accende ogni didascalia
const beatIndexAt = (pos) => { let i = 0; FROMS.forEach((f, k) => { if (pos >= f - 1e-6) i = k; }); return i; };
const BEAT_PATH = { sala: '/giro/sala', cucina: '/giro/cucina', gestione: '/giro/ufficio', fine: '/giro/fine' };
const CHIP_IMGS = ['andamento', 'utile', 'fattura', 'turni'];

let live = false;
let stage = null;
let loadingStage = false;
let ready = false;
let targetPos = 0, curPos = 0, lastT = 0, raf = 0, visible = true;
let activeBeat = 0;
let W = 0, H = 0;

function webglOK() {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
}
function wantLive() {
    return !!story && beats.length > 1 && !reduceMotion.matches && window.innerHeight >= 480 && webglOK() && !wantBlocks() && stageFits();
}
// Le didascalie devono stare nello schermo senza coprire la scena. Se non ci stanno (testo ingrandito
// dal browser, schermi molto piccoli) il giro non parte e restano i blocchi uno sotto l'altro, leggibili.
function fitInfo() {
    const wasLive = story.classList.contains('is-live');
    story.classList.add('is-live');
    const ph = pin.clientHeight, narrow = pin.clientWidth <= 820;
    // su telefoni bassi (es. il browser di Instagram) la didascalia si fa più compatta, così il giro resta
    story.classList.toggle('is-compact', narrow && ph < 700);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const hs = beats.map(b => b.querySelector('.beat-copy').offsetHeight);
    const capMid = Math.max(...hs.slice(1, -1));          // didascalie con il telefono (sala, cucina, ufficio)
    let ok;
    if (narrow) ok = hs[0] <= ph * 0.7 && hs[hs.length - 1] <= ph * 0.62 && ph - capMid >= rem * 23.7;   // il telefono in mano ai personaggi deve starci sopra la didascalia (almeno 4,6rem di larghezza)
    else ok = Math.max(...hs) <= ph - rem * 9;
    if (!wasLive) story.classList.remove('is-live');
    return { ok, hs, capMid, ph };
}
// Il risultato si ricorda finché non cambia la larghezza o la dimensione del testo: le variazioni di altezza
// (la barra di Safari che si nasconde mentre si scorre) non devono spegnere il giro a metà.
let fitKey = '', fitOk = true;
function stageFits() {
    const key = window.innerWidth + '|' + getComputedStyle(document.documentElement).fontSize;
    if (key !== fitKey) { fitKey = key; fitOk = fitInfo().ok; }
    return fitOk;
}
// ?3d=off forza la versione a blocchi, ?3d=force impedisce il passaggio automatico (utile per i test)
const MODE_3D = new URLSearchParams(location.search).get('3d');
function wantBlocks() {
    if (MODE_3D === 'off') return true;
    if (MODE_3D === 'force') return false;
    try { if (sessionStorage.getItem('salaflow_3d') === 'off') return true; } catch (e) { /* ok */ }
    const c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return true;      // risparmio dati o rete molto lenta
    if (navigator.deviceMemory && navigator.deviceMemory <= 1) return true;
    return false;
}
function isLowPower() {
    return window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
}
function span() { return Math.max(1, story.offsetHeight - pin.offsetHeight); }

function layout() {
    if (!stage) return;
    W = pin.clientWidth;
    H = pin.clientHeight;
    const narrow = W <= 820;
    // su telefono il telefono "in mano" prende lo spazio che resta sopra la didascalia (vedi --hudw nel CSS)
    if (narrow) story.style.setProperty('--cap-h', fitInfo().capMid + 'px'); else story.style.removeProperty('--cap-h');
    // la parte libera dello schermo: a destra del testo su computer, sopra la scheda su telefono
    if (narrow) stage.resize(W, H, -0.14, -0.1, 0.72, 0.6);
    else stage.resize(W, H, 0.075, 0, 0.74, 0.94);
}

// Un momento del giro conta come «raggiunto» solo se ci si ferma almeno 0,8 s con il giro a schermo:
// scorrere in fretta (o il salto del menu / «salta il giro») non fa contare i momenti attraversati.
let dwellIdx = -1, dwellTimer = 0;
function dwellBeat() {
    const idx = beatIndexAt(targetPos);
    if (idx === dwellIdx) return;
    dwellIdx = idx;
    clearTimeout(dwellTimer);
    if (!BEAT_PATH[beats[idx].id]) return;
    dwellTimer = setTimeout(() => {
        const r = story.getBoundingClientRect();
        if (live && r.top <= 1 && r.bottom > window.innerHeight * 0.5 && beatIndexAt(targetPos) === idx) track(BEAT_PATH[beats[idx].id]);
    }, 800);
}
function readScroll(snap) {
    if (!live) return;
    const r = story.getBoundingClientRect();
    const p = clamp(-r.top / span(), 0, 1);
    targetPos = p * PMAX;
    dwellBeat();
    if (snap) curPos = targetPos;
    schedule();
}

// Dopo il riscaldamento (compilazione, texture) misura la durata dei fotogrammi: se la mediana
// supera ~38 ms (sotto i 26 fps) il telefono fa fatica e si passa alla versione a blocchi.
const fpsSamples = [];
let fpsFrames = 0, fpsDone = false;
function sampleFps(dt) {
    if (fpsDone || MODE_3D === 'force') return;
    fpsFrames++;
    if (fpsFrames <= 30 || dt > 0.3) return;            // scarta il riscaldamento e le pause (scheda in background)
    fpsSamples.push(dt);
    const n = fpsSamples.length;
    // molto lento: bastano ~45 fotogrammi; lento al limite: ne servono ~90
    if (n !== 45 && n < 90) return;
    const sorted = fpsSamples.slice().sort((a, b) => a - b);
    const median = sorted[Math.floor(n / 2)];
    const slow = n >= 90 ? median > 0.038 : median > 0.055;
    if (n >= 90) fpsDone = true;
    if (slow) {
        fpsDone = true;
        try { sessionStorage.setItem('salaflow_3d', 'off'); } catch (e) { /* ok */ }
        track('/giro/lento');
        setLive(false);
    }
}
function schedule() {
    if (!live || !ready || raf || !visible || document.hidden) return;
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
}
// riquadri che coprono la scena: le etichette 3D li evitano
function updateObstacles() {
    const list = [];
    const add = (el, pad) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;
        const pr = pin.getBoundingClientRect();
        list.push({ l: r.left - pr.left - pad, r: r.right - pr.left + pad, t: r.top - pr.top - pad, b: r.bottom - pr.top + pad });
    };
    const cur = beats[activeBeat];
    add(cur && cur.querySelector('.beat-copy'), 6);
    if (hud && hud.classList.contains('is-on')) add(hudFrames.find(f => f.classList.contains('is-on')), 6);
    add(storyNav, 4);
    list.topSafe = 62;
    stage.setObstacles(list);
}
function frame(t) {
    raf = 0;
    const rawDt = ((t - lastT) / 1000) || 0.016;
    const dt = Math.min(0.05, rawDt);
    lastT = t;
    sampleFps(rawDt);
    const d = targetPos - curPos;
    if (Math.abs(d) < 0.0006) curPos = targetPos; else curPos += d * (1 - Math.exp(-dt * 6.5));
    // all'inizio e alla fine il testo è grande: la scena si sposta a destra per non coprirlo
    if (W > 820) {
        const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
        const f = clamp((1 - sm(curPos / 0.9)) + sm((curPos - 6.1) / 0.9), 0, 1);
        stage.setFrame(0.075 + 0.17 * f, 0, 0.74 - 0.18 * f, 0.94);
    }
    updateObstacles();
    stage.render(curPos, t / 1000);
    updateUI(curPos);
    // la scena respira anche da ferma (luci, persone): si continua a disegnare finché è a schermo
    schedule();
}

// ----- le schermate dell'app che compaiono in mano ai personaggi
function hudAt(pos) {
    let device = null, img = null;
    for (const s of hudData.steps) {
        if (s.pos > pos) break;
        if (s.device !== undefined) { device = s.device; img = s.device === null ? null : (s.img || img); }
    }
    return { device, img };
}
function updateHud(pos) {
    if (!hud) return;
    const { device, img } = hudAt(pos);
    hud.classList.toggle('is-on', !!device);
    hudFrames.forEach(f => {
        const on = f.dataset.kind === device;
        f.classList.toggle('is-on', on);
        f.querySelectorAll('img').forEach(i => i.classList.toggle('is-on', on && i.dataset.img === img));
    });
    const showChips = pos > 5.5 && pos < 6.95;
    hud.classList.toggle('show-chips', showChips);
    if (showChips) hudChips.forEach((b, i) => b.classList.toggle('is-on', CHIP_IMGS[i] === img));
    // tocchi (il cerchio verde sul pulsante)
    hudFrames.forEach(f => { const t = f.querySelector('.tap'); if (t) t.style.opacity = 0; });
    for (const s of hudData.steps) {
        if (!s.tap) continue;
        const k = (pos - (s.pos - 0.06)) / 0.22;
        if (k < 0 || k > 1) continue;
        const f = hudFrames.find(x => x.dataset.kind === s.tap.device);
        const t = f && f.querySelector('.tap');
        if (!t) continue;
        t.style.left = (s.tap.x * 100) + '%';
        t.style.top = (s.tap.y * 100) + '%';
        t.style.opacity = k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7;
        t.style.transform = `scale(${0.5 + k * 1.5})`;
    }
}

function updateUI(pos) {
    const idx = beatIndexAt(pos);
    if (idx !== activeBeat) {
        activeBeat = idx;
        beats.forEach((b, i) => { b.classList.toggle('is-active', i === idx); if ('inert' in b) b.inert = i !== idx; });
        const inTour = idx >= 1 && idx <= 3;
        navLinks.forEach(a => {
            const g = Number(a.dataset.beatGo);
            const cur = g === 1 ? idx === 1 : g === 4 ? idx === 2 : idx === 3;
            a.classList.toggle('is-current', inTour && cur);
        });
    }
    updateHud(pos);
    if (storyNav) {
        storyNav.style.setProperty('--p', (pos / PMAX).toFixed(4));
        const stops = [...storyNav.querySelectorAll('button')];
        let on = 0;
        stops.forEach((b, i) => { if (Number(b.dataset.pos) <= pos + 0.45) on = i; });
        stops.forEach((b, i) => b.classList.toggle('is-on', i === on));
    }
    updateStickyCta();
}

function goTo(pos, instant) {
    if (!live) {
        const el = beats[beatIndexAt(pos)];
        if (el) el.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
        return;
    }
    const top = story.getBoundingClientRect().top + window.scrollY + (span() / PMAX) * pos;
    window.scrollTo({ top, behavior: instant ? 'auto' : 'smooth' });
}

async function startStage() {
    if (stage || loadingStage) return;
    loadingStage = true;
    if (loadingEl) loadingEl.hidden = false;
    try {
        // scarica la libreria 3D in parallelo al file della scena (altrimenti partirebbe solo dopo)
        ['vendor/three.module.min.js', 'tour3d.js'].forEach(href => {
            const l = document.createElement('link'); l.rel = 'modulepreload'; l.href = href; document.head.appendChild(l);
        });
        const mod = await import('./tour3d.js');
        if (!live) return;
        stage = mod.createStage(canvas, labelsLayer, { lowPower: isLowPower() });
        layout();
        ready = true;
        readScroll(true);
        story.classList.add('is-ready');
        if (loadingEl) loadingEl.hidden = true;
        activeBeat = -1;
        updateUI(curPos);
        schedule();
    } catch (err) {
        console.warn('Il giro in 3D non è partito, resta la versione a blocchi.', err);
        setLive(false);
    } finally {
        loadingStage = false;
    }
}

function setLive(on) {
    live = on;
    story.classList.toggle('is-live', on);
    if (on) {
        beats.forEach((b, i) => { b.classList.toggle('is-active', i === 0); if ('inert' in b) b.inert = i !== 0; });
        startStage();
    } else {
        story.classList.remove('is-ready');
        if (loadingEl) loadingEl.hidden = true;
        beats.forEach(b => { b.classList.remove('is-active'); if ('inert' in b) b.inert = false; });
        if (hud) hud.classList.remove('is-on');
    }
}

// ---------------------------------------------------------
// Il telefono (o il tablet) si può toccare per ingrandirlo: finestra con la schermata grande,
// cosa fa, e frecce per scorrere tutte le schermate della storia.
// ---------------------------------------------------------
const lb = document.getElementById('lightbox');
const lbShots = hudData.shots || [];
let lbIndex = 0;
let lbOpener = null;
function renderLb() {
    const s = lbShots[lbIndex];
    if (!s || !lb) return;
    const tablet = s.kind === 'tablet';
    const img = lb.querySelector('.lb-shot img');
    lb.classList.toggle('is-tablet', tablet);
    img.width = tablet ? 2360 : 860;
    img.height = tablet ? 1520 : 1864;
    img.src = `img/${s.img}.webp`;
    img.alt = s.title;
    lb.querySelector('.lb-title').textContent = s.title;
    lb.querySelector('.lb-text').textContent = s.text;
    lb.querySelector('.lb-count').textContent = `${lbIndex + 1} di ${lbShots.length}`;
}
function openLb(imgName, opener) {
    if (!lb || !lbShots.length) return;
    const i = lbShots.findIndex(x => x.img === imgName);
    lbIndex = i < 0 ? 0 : i;
    lbOpener = opener || null;
    track('/ingrandisci');
    renderLb();
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    lb.focus({ preventScroll: true });
}
function closeLb() {
    if (!lb || lb.hidden) return;
    lbClosedAt = performance.now();
    lb.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (lbOpener && lbOpener.focus) lbOpener.focus();
}
function stepLb(d) {
    lbIndex = (lbIndex + d + lbShots.length) % lbShots.length;
    renderLb();
}
if (lb) {
    // la cornice del telefono è coperta da un vero <button> trasparente (su iPhone il tocco su un semplice <div> non è affidabile)
    hudFrames.forEach(f => f.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => openLb(hudAt(curPos).img, f.querySelector('.hud-zoom')))));
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', () => stepLb(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => stepLb(1));
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-figure')) closeLb(); });
    document.addEventListener('keydown', (e) => {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLb();
        else if (e.key === 'ArrowLeft') stepLb(-1);
        else if (e.key === 'ArrowRight') stepLb(1);
        else if (e.key === 'Tab') {
            const f = [...lb.querySelectorAll('button')];
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
    let touchX = null;
    lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
    }, { passive: true });
}

// pulsanti e link che portano a un momento della storia
document.querySelectorAll('[data-beat-go]').forEach(el => {
    el.addEventListener('click', (e) => {
        if (!live) return;
        e.preventDefault();
        closeMobileNav(false);
        goTo(Number(el.dataset.beatGo));
    });
});
if (storyNav) storyNav.querySelectorAll('button').forEach(b => b.addEventListener('click', () => goTo(Number(b.dataset.pos))));
hudChips.forEach(b => b.addEventListener('click', () => goTo(Number(b.dataset.pos) + 0.02)));
const skipTour = document.getElementById('skipTour');
if (skipTour) skipTour.addEventListener('click', () => track('/giro/saltato'));
const brandLink = document.querySelector('.brand');
if (brandLink) brandLink.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

if (story) {
    setLive(wantLive());
    if (!live) track('/giro/blocchi');
    reduceMotion.addEventListener('change', () => setLive(wantLive()));
    window.addEventListener('resize', () => {
        const should = wantLive();
        if (should !== live) { setLive(should); return; }
        if (live && stage) { layout(); readScroll(true); }
    });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            if (visible) schedule();
        }, { rootMargin: '100px' }).observe(story);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
    // a font caricati le didascalie cambiano un po': si rimisura lo spazio per il telefono
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (live && stage) layout(); });
    // arrivando con #sala / #cucina / #gestione si parte dal momento giusto
    const jump = { sala: 1, cucina: 4, gestione: 6 }[location.hash.slice(1)];
    if (jump && live) {
        document.documentElement.style.scrollBehavior = 'auto';
        requestAnimationFrame(() => { goTo(jump, true); document.documentElement.style.scrollBehavior = ''; });
    }
    // per i test automatici: salta subito alla posizione dello scroll invece di scivolarci
    window.__story = { fit: fitInfo, snap() { readScroll(true); }, get pos() { return curPos; }, get stage() { return stage; } };
}

// ---------------------------------------------------------
// Scroll: nav, CTA fissa su telefono
// ---------------------------------------------------------
function updateStickyCta() {
    if (!stickyCtaEl) return;
    // durante il giro c'è già il suo pulsante: la CTA fissa compare dopo, quando il giro è finito
    const pastStory = story && live ? story.getBoundingClientRect().bottom < window.innerHeight - 24 : window.scrollY > window.innerHeight * 0.8;
    let overForm = false;
    if (demoSectionEl) {
        const r = demoSectionEl.getBoundingClientRect();
        overForm = r.top < window.innerHeight * 0.7 && r.bottom > 0;
    }
    // niente CTA fissa nemmeno sopra la tabella di confronto: copriva il testo
    const cmp = document.getElementById('confronto');
    let overCompare = false;
    if (cmp) {
        const c = cmp.getBoundingClientRect();
        overCompare = c.top < window.innerHeight && c.bottom > 60;
    }
    stickyCtaEl.classList.toggle('is-visible', pastStory && !overForm && !overCompare);
}
function onScroll() {
    ticking = false;
    if (navEl) navEl.classList.toggle('is-scrolled', window.scrollY > 24);
    readScroll(false);
    updateStickyCta();
}
window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

// ---------------------------------------------------------
// Entrata morbida delle sezioni dopo il giro
// ---------------------------------------------------------
const revealTargets = document.querySelectorAll('.band h2, .compare-wrap, .fine, .origin .wrap > *, .where-row, .faq-item, .cta-block');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
    revealTargets.forEach((node, i) => {
        node.classList.add('reveal');
        node.style.transitionDelay = `${(i % 4) * 60}ms`;
    });
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    revealTargets.forEach(node => revealObserver.observe(node));
}

// ---------------------------------------------------------
// Domande frequenti: aprendone una, le altre si chiudono.
// ---------------------------------------------------------
const faqItems = [...document.querySelectorAll('.faq-item')];
faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
        if (!item.open) return;
        faqItems.forEach(other => { if (other !== item) other.open = false; });
    });
});

// ---------------------------------------------------------
// Form richiesta visita, collegato a Formspree (https://formspree.io):
// al submit i dati vengono inviati via POST e Formspree li gira per
// email all'indirizzo configurato sul suo sito, senza backend nostro.
// ---------------------------------------------------------
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvkoerqq';

function handleFormSubmit(form, feedbackEl, message) {
    if (!form || !feedbackEl) return;
    const checkEl = feedbackEl.querySelector('.t-success-check');
    const textEl = feedbackEl.querySelector('#demoFeedbackText');
    const errorEl = document.getElementById('demoFormError');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorEl) errorEl.hidden = true;

        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Invio…';

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Invio fallito');
            track('/modulo-inviato');

            textEl.textContent = message;
            feedbackEl.hidden = false;
            if (checkEl) {
                checkEl.setAttribute('data-state', 'out');
                void checkEl.offsetWidth;
                checkEl.setAttribute('data-state', 'in');
            }
            form.reset();
        } catch (err) {
            if (errorEl) {
                errorEl.textContent = 'Invio non riuscito. Riprova, oppure scrivici a info@salaflow.com.';
                errorEl.hidden = false;
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
        }
    });
}

handleFormSubmit(
    document.getElementById('demoForm'),
    document.getElementById('demoFeedback'),
    'Richiesta ricevuta! Ti contattiamo a breve per organizzare la visita.'
);
