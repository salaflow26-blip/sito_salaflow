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
const stickyCtaEl = document.getElementById('stickyCta');
const demoSectionEl = document.getElementById('demo');
let ticking = false;

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
const N = beats.length;
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
    return !!story && N > 1 && !reduceMotion.matches && window.innerHeight >= 480 && webglOK();
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
    // la parte libera dello schermo: a destra del testo su computer, sopra la scheda su telefono
    if (narrow) stage.resize(W, H, -0.14, -0.1, 0.72, 0.6);
    else stage.resize(W, H, 0.075, 0, 0.74, 0.94);
}

function readScroll(snap) {
    if (!live) return;
    const r = story.getBoundingClientRect();
    const p = clamp(-r.top / span(), 0, 1);
    targetPos = p * (N - 1);
    if (snap) curPos = targetPos;
    schedule();
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
    const dt = Math.min(0.05, ((t - lastT) / 1000) || 0.016);
    lastT = t;
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
    const idx = clamp(Math.round(pos), 0, N - 1);
    if (idx !== activeBeat) {
        activeBeat = idx;
        beats.forEach((b, i) => { b.classList.toggle('is-active', i === idx); if ('inert' in b) b.inert = i !== idx; });
        const inTour = idx >= 1 && idx <= 6;
        navLinks.forEach(a => {
            const g = Number(a.dataset.beatGo);
            const cur = g === 1 ? idx >= 1 && idx <= 3 : g === 4 ? idx === 4 || idx === 5 : idx === 6;
            a.classList.toggle('is-current', inTour && cur);
        });
    }
    updateHud(pos);
    if (storyNav) {
        storyNav.style.setProperty('--p', (pos / (N - 1)).toFixed(4));
        const stops = [...storyNav.querySelectorAll('button')];
        let on = 0;
        stops.forEach((b, i) => { if (Number(b.dataset.pos) <= pos + 0.45) on = i; });
        stops.forEach((b, i) => b.classList.toggle('is-on', i === on));
    }
    updateStickyCta();
}

function goTo(pos, instant) {
    if (!live) {
        const el = beats[clamp(Math.round(pos), 0, N - 1)];
        if (el) el.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
        return;
    }
    const top = story.getBoundingClientRect().top + window.scrollY + (span() / (N - 1)) * pos;
    window.scrollTo({ top, behavior: instant ? 'auto' : 'smooth' });
}

async function startStage() {
    if (stage || loadingStage) return;
    loadingStage = true;
    if (loadingEl) loadingEl.hidden = false;
    try {
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
    renderLb();
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    lb.focus({ preventScroll: true });
}
function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (lbOpener && lbOpener.focus) lbOpener.focus();
}
function stepLb(d) {
    lbIndex = (lbIndex + d + lbShots.length) % lbShots.length;
    renderLb();
}
if (lb) {
    hudFrames.forEach(f => f.addEventListener('click', () => openLb(hudAt(curPos).img, f.querySelector('.hud-zoom'))));
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
const brandLink = document.querySelector('.brand');
if (brandLink) brandLink.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

if (story) {
    setLive(wantLive());
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
    // arrivando con #sala / #cucina / #gestione si parte dal momento giusto
    const jump = { sala: 1, cucina: 4, gestione: 6 }[location.hash.slice(1)];
    if (jump && live) {
        document.documentElement.style.scrollBehavior = 'auto';
        requestAnimationFrame(() => { goTo(jump, true); document.documentElement.style.scrollBehavior = ''; });
    }
    // per i test automatici: salta subito alla posizione dello scroll invece di scivolarci
    window.__story = { snap() { readScroll(true); }, get pos() { return curPos; }, get stage() { return stage; } };
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
