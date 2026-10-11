# SalaFlow — Landing Page

Sito vetrina statico (HTML/CSS/JS puro, nessun framework) per presentare SalaFlow.

## Struttura

```
index.html     la pagina (generata da brand/site-shots/build-landing.py nel repo del prodotto: si modifica lì)
styles.css     stile grafico (marchio S, Notte/Menta/Legno, come l'app)
script.js      il giro del locale (scroll → storia), schermate in mano ai personaggi, menu, modulo Formspree
tour3d.js      la scena 3D (Three.js, stile cartone animato morbido; ?style=clay per la versione "plastico d'architetto"): ristorante, Marco, Elena, Giulia, camera da fuori e in prima persona. Si carica solo se c'è WebGL
vendor/        three.module.min.js (Three.js 0.160.1, licenza MIT) + licenza
fonts/         Plus Jakarta Sans (variabile) e Fraunces 500, sottoinsieme latino, licenza OFL: ospitati qui, nessuna richiesta a Google
img/           12 schermate reali dell'app con dati dimostrativi (webp)
```

Nessuna build richiesta: è un sito statico, pronto così com'è.

## Pubblicare su Vercel

1. Crea un repository su GitHub e carica questi file:
   ```bash
   git init
   git add .
   git commit -m "Prima versione landing page SalaFlow"
   git branch -M main
   git remote add origin https://github.com/<tuo-utente>/<nome-repo>.git
   git push -u origin main
   ```
2. Vai su [vercel.com](https://vercel.com), collega il tuo account GitHub.
3. "Add New Project" → seleziona il repository appena creato.
4. Framework: **Other** (nessuna build da configurare). Lascia tutto com'è e premi **Deploy**.

Il sito sarà online in meno di un minuto, con un link tipo `nome-progetto.vercel.app`.
Da Vercel puoi poi collegare un dominio vero (es. `salaflow.app`) da Settings → Domains.

## Collegare il form a un servizio vero

Il form "Prenota la tua Visita", in fondo alla pagina, al momento mostra solo un
messaggio di conferma, ma **non salva né invia davvero i dati da nessuna parte**.

Per iniziare a ricevere sul serio le richieste, il modo più veloce senza scrivere un
backend è usare un servizio come [Formspree](https://formspree.io) (gratuito per iniziare):

1. Crea un account su Formspree e un nuovo form: ti darà un indirizzo tipo
   `https://formspree.io/f/xxxxxxxx`.
2. In `index.html`, aggiungi `action="https://formspree.io/f/xxxxxxxx" method="POST"`
   al tag `<form id="demoForm">`.
3. In `script.js`, la funzione `handleFormSubmit` va aggiornata per inviare davvero i
   dati (con `fetch`) invece di limitarsi a mostrare il messaggio — c'è già un commento
   nel file che spiega dove intervenire.

In alternativa: Google Forms, Mailchimp, o un webhook personalizzato funzionano allo
stesso modo.
