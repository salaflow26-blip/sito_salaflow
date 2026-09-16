// ---------------------------------------------------------
// Il browser di suo tenta di "ricordare" la posizione di scroll
// tra un refresh e l'altro: dopo un ricaricamento la pagina si
// ritrovava a metà invece che in cima. Disattivato, e riportata
// in cima esplicitamente — a meno che l'URL non punti già a una
// sezione precisa (es. arrivando da un link a "#confronto").
// ---------------------------------------------------------
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
if (!location.hash) {
    window.scrollTo(0, 0);
}

// ---------------------------------------------------------
// Anno corrente nel footer
// ---------------------------------------------------------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------------------------------------------------------
// Menu mobile
// ---------------------------------------------------------
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// Chi naviga da tastiera deve poter chiudere il menu con Esc senza
// dover tabbare fino in fondo per ritrovare il pulsante: il focus
// torna sul pulsante che l'ha aperto, non si perde nel vuoto.
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobile.classList.contains('open')) {
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
    }
});

// ---------------------------------------------------------
// Demo video inline: parte da sola (in muto) quando entra nello
// schermo scorrendo, si ferma quando esce — nessun tasto play.
// Finché non c'è ancora un <video> vero dentro #demoVideoFrame
// (vedi commento nell'HTML), questo non fa nulla: appena verrà
// aggiunto, funzionerà senza bisogno di toccare altro codice.
// ---------------------------------------------------------
const demoVideoFrame = document.getElementById('demoVideoFrame');
if (demoVideoFrame) {
    const demoVideoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = demoVideoFrame.querySelector('video');
            if (!video) return;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });
    demoVideoObserver.observe(demoVideoFrame);
}

// ---------------------------------------------------------
// Animazioni "reveal" all'ingresso in viewport — scaglionate:
// dentro una stessa griglia (es. le card funzionalità), ogni
// elemento parte con un piccolo ritardo in più rispetto al
// precedente, invece di comparire tutti insieme in blocco.
// ---------------------------------------------------------
// Passo di stagger allineato al token --duration-stagger (40ms) di
// transitions-dev/transitions-polish, invece di un valore inventato:
// con gruppi fino a 6 elementi resta sotto i ~300ms totali raccomandati
// dalla skill, letto da CSS così resta l'unica fonte di verità.
const staggerStepMs = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--duration-stagger')
) || 40;
const revealEls = document.querySelectorAll('.reveal');
revealEls.forEach((el, i) => {
    const siblingReveals = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal')) : [el];
    const indexInGroup = siblingReveals.indexOf(el);
    el.style.transitionDelay = `${Math.min(indexInGroup, 5) * staggerStepMs}ms`;
});

// ---------------------------------------------------------
// Titolo hero: "texts reveal" di transitions-dev (stagger + blur),
// al posto del fade generico usato dal resto della pagina — è
// above-the-fold, quindi parte al caricamento e non allo scroll.
// ---------------------------------------------------------
const heroStagger = document.getElementById('heroStagger');
if (heroStagger) {
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroStagger.classList.add('is-shown');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    staggerObserver.observe(heroStagger);
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// ---------------------------------------------------------
// Barra di progresso scroll in cima alla pagina, e comparsa
// della CTA fissa in basso (solo mobile) una volta superato
// l'hero — un solo scroll listener per entrambe le cose.
// ---------------------------------------------------------
const scrollProgressEl = document.getElementById('scrollProgress');
const stickyCtaEl = document.getElementById('stickyCta');
const heroEl = document.querySelector('.hero');
if (scrollProgressEl || stickyCtaEl) {
    let scrollTicking = false;
    const updateOnScroll = () => {
        if (scrollProgressEl) {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            scrollProgressEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        }
        if (stickyCtaEl && heroEl) {
            const pastHero = window.scrollY > heroEl.offsetHeight;
            stickyCtaEl.classList.toggle('visible', pastHero);
        }
        scrollTicking = false;
    };
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateOnScroll);
            scrollTicking = true;
        }
    });
    updateOnScroll();
}

// ---------------------------------------------------------
// Numeri che "contano" da 0 al valore reale quando entrano in
// vista, nella sezione di confronto carta/SalaFlow.
// ---------------------------------------------------------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const countEls = document.querySelectorAll('.count-num');
if (countEls.length) {
    const animateCount = (el) => {
        const target = parseInt(el.dataset.countTo, 10) || 0;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        if (prefersReducedMotion) {
            el.textContent = `${prefix}${target}${suffix}`;
            return;
        }
        const duration = 900;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    countEls.forEach(el => countObserver.observe(el));
}

// ---------------------------------------------------------
// Tilt 3D sulle card funzionalità al passaggio del mouse, con
// un riflesso che segue il puntatore — solo su mouse: su touch
// il gesto serve a scorrere la pagina, non a inclinare la card.
// ---------------------------------------------------------
if (!prefersReducedMotion) {
    const TILT_MAX_DEG = 10;
    document.querySelectorAll('.feature-card').forEach(card => {
        const inner = card.querySelector('.feature-card-inner');
        if (!inner) return;

        card.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            const r = card.getBoundingClientRect();
            const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
            const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
            inner.classList.add('is-tilting');
            inner.style.setProperty('--tilt-ry', ((px - 0.5) * TILT_MAX_DEG).toFixed(2) + 'deg');
            inner.style.setProperty('--tilt-rx', ((0.5 - py) * TILT_MAX_DEG).toFixed(2) + 'deg');
            inner.style.setProperty('--tilt-gx', (px * 100).toFixed(1) + '%');
            inner.style.setProperty('--tilt-gy', (py * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', () => {
            inner.classList.remove('is-tilting');
            inner.style.setProperty('--tilt-rx', '0deg');
            inner.style.setProperty('--tilt-ry', '0deg');
        });
    });
}

// ---------------------------------------------------------
// Mockup della piantina nell'hero: fa cambiare a rotazione lo
// stato di un tavolo, per dare l'idea di "sincronizzazione in
// tempo reale" a colpo d'occhio, senza dover leggere nulla.
// ---------------------------------------------------------
const mockTables = document.querySelectorAll('.mock-table');
if (mockTables.length) {
    const states = ['free', 'occ', 'res'];
    setInterval(() => {
        const table = mockTables[Math.floor(Math.random() * mockTables.length)];
        const current = states.find(s => table.classList.contains(s));
        const next = states[(states.indexOf(current) + 1) % states.length];
        table.classList.remove(current);
        table.classList.add(next);
        table.classList.add('mock-table-flip');
        setTimeout(() => table.classList.remove('mock-table-flip'), 350);
    }, 1800);
}

// ---------------------------------------------------------
// Form richiesta demo, collegato a Formspree (https://formspree.io):
// al submit i dati vengono inviati via POST come JSON e Formspree
// li gira per email all'indirizzo configurato sul suo sito, senza
// bisogno di un backend nostro. FORMSPREE_ENDPOINT va sostituito con
// l'endpoint del form creato sull'account Formspree del ristorante
// (Dashboard → New Form → copia l'URL "https://formspree.io/f/xxxxxxx").
// ---------------------------------------------------------
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvkoerqq';

function handleFormSubmit(form, feedbackEl, message) {
    const checkEl = feedbackEl.querySelector('.t-success-check');
    const textEl = feedbackEl.querySelector('#demoFeedbackText');
    const errorEl = document.getElementById('demoFormError');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorEl) errorEl.hidden = true;

        if (!FORMSPREE_ENDPOINT) {
            if (errorEl) {
                errorEl.textContent = 'Modulo non ancora collegato: configura FORMSPREE_ENDPOINT in script.js.';
                errorEl.hidden = false;
            }
            return;
        }

        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Invio...';

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
                errorEl.textContent = 'Invio non riuscito. Riprova, oppure scrivici a info@salaflow.app.';
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
