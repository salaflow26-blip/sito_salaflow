# Video di lancio SalaFlow — versione Remotion

Video verticale 1080×1920, 30 fps, 62 s, fatto con [Remotion](https://www.remotion.dev) (React).
Tutte le schermate sono vere, prese dall'account demo ("Trattoria Demo") con dati di prova.

## Comandi

```bash
cd video/remotion
npm i
npm run dev                      # Remotion Studio: anteprima e modifiche dal browser
npx remotion render Lancio out/salaflow-lancio-remotion.mp4 --crf=20 --jpeg-quality=92
# con un'altra musica:
npx remotion render Lancio out/lancio-jazz.mp4 --props='{"music":"music/2-jazz.mp3"}' --crf=20 --jpeg-quality=92
```

Nello Studio ogni scena è anche una composizione a sé (cartella "Scene"), così la si può vedere e ritoccare da sola.

## Struttura

- `src/Launch.tsx`: la timeline. Le musiche sono portate a 120 BPM, quindi una battuta = 2 s = 60 fotogrammi:
  gancio e logo 2 battute, ogni funzione 2 battute (4 s), capitolo 1, muro 1,5, finale 2,5.
  Le transizioni durano 14 fotogrammi e sono centrate sulla battuta.
- `src/features.ts`: testo, schermata e riquadro ingrandito (coordinate in pixel della schermata) di ogni funzione.
- `src/scenes/`: gancio sul quaderno, logo, scena funzione generica, capitolo "E per chi gestisce", staff (turni e checklist), muro di schermate, finale.
- `src/components/`: telefono/tablet, titoli animati, sfondo, light leak.
- `public/shots/`: le schermate. Le `*_full.jpg` sono pagine intere che scorrono dentro il telefono.
- `public/music/`: le musiche, già a 120 BPM e allineate ai tagli da `scripts/music.py`
  (`python3 scripts/music.py brano.mp3 public/music/nome.mp3 [--anchor secondi]`).

## Cartone "Hai tutto sotto controllo"

Composizione `Cartone` (circa 79 s): stile cartone anni '30 disegnato in codice (`src/cartoon/`).
- `script.ts`: le battute con chi parla e la durata. Quando c'è la voce registrata, si mettono qui i tempi veri.
- `Toon.tsx`: il personaggio "a tubo di gomma" (oste, ragazzo, cuoco, nonno). `Props.tsx`: quaderno, telefono, post-it, ecc.
- `Scenes.tsx`: le 29 inquadrature. `Scenery.tsx`: trattoria, cucina, effetto pellicola.
- Copione per la registrazione e prompt per un'AI video: `video/cartone/copione-e-prompt.md`.

```bash
npx remotion render Cartone out/cartone.mp4 --crf=21 --jpeg-quality=90
```

### Versione con le immagini AI (`CartoneAI`, circa 82 s)

Stessa storia, fatta con le immagini del team:
- scene 1-15: le clip di Kling (`public/clips/scena-XX.mp4`);
- scene 11 e 16-30: le immagini di ChatGPT (`public/clips/nuove/nuova-XX.jpg`), animate da `scripts/vivi.py`.
  Per ogni immagine c'è un "rig": zone morbide (testa, mani, quaderno…) che ruotano, si schiacciano e saltellano a tempo
  di musica (120 BPM). Il risultato va in `public/clips/vivi/nuova-XX.mp4`; i punti da seguire (schermi dei telefoni,
  lampada, occhi) vanno in `src/cartoon/vivi.json`. **Dopo aver cambiato le durate in `script.ts` va rilanciato**:
  `python3 scripts/vivi.py` (circa 2 minuti);
- scene 24-26: costruite in `src/cartoon/ai/` attorno alle schermate vere: il colore che esce dal telefono,
  il telefono in prima persona coi pezzi dell'app che volano fuori (`mano-25.png` e `sfondo-25.jpg` sono la mano
  scontornata e lo sfondo ricostruito), le schermate di gestione in 3D.

```bash
python3 scripts/vivi.py            # solo se sono cambiati i tempi o le immagini
npx remotion render CartoneAI out/cartone-ai.mp4 --concurrency=4 --crf=20 --jpeg-quality=92
```

La musica (`swing.mp3`) è lunga quanto il video: se cambia la durata totale si rifà con
`python3 scripts/music.py brano.mp3 public/music/swing.mp3 --total SECONDI --first 0 --anchor 0.3 --no-cuts`.

## Presentazione cinematografica (`Presentazione`, 16:9, 78 s)

Pensata per girare a schermo intero su un monitor e filmarla col telefono, come i reel "dietro le quinte".
Sfondi video sfocati, titoli enormi da keynote, notifiche e pulsanti in vetro, le schermate vere in 3D (`src/presentazione/`).
Sezioni (in `SECTIONS`): sabato sera, il caos delle notifiche, il logo, "Un'app. Tutto il locale.", le cinque funzioni
del servizio con il pulsante "Avanti", la gestione, "Presto disponibile" con "Prenota una visita".

```bash
npx remotion render Presentazione out/presentazione.mp4 --concurrency=4 --crf=19 --jpeg-quality=92
```

- Sfondi (`public/presentazione/bg-*.mp4`): video di [Mixkit](https://mixkit.co/free-stock-video/) (licenza "Stock Video Free License":
  uso commerciale consentito), già sfocati e ricodificati; le persone non si riconoscono.
- Audio (`public/music/presentazione.mp3`): la musica portata a 120 BPM con `scripts/music.py`, più gli effetti
  (whoosh, colpo sul logo, notifiche, tocchi) sintetizzati da `scripts/sfx.py` sui fotogrammi dei tagli.

## Musiche

Tutte da [Mixkit](https://mixkit.co/free-stock-music/), licenza "Stock Music Free License": uso commerciale,
social e pubblicità consentiti, citazione non obbligatoria (non si possono fare remix solo musicali né registrarle a proprio nome).

| File | Brano | Autore |
| --- | --- | --- |
| `1-funk.mp3` | Midnight Funk | Michael Ramir C. |
| `2-jazz.mp3` | Dry Gin | Michael Ramir C. |
| `3-house.mp3` | House 02 | Lily J |
| `4-pop.mp3` | Motivating Mornings | Ahjay Stelino |
| `5-acustico.mp3` | Tears of Joy | Michael Ramir C. |
| `swing.mp3` (cartone) | I'm Hungry! | Michael Ramir C. |
| `presentazione.mp3` | I Won't Surrender | Michael Ramir C. |

## Note

- Il light leak usa WebGL: in un ambiente senza GPU `remotion.config.ts` usa `swangle` (SwiftShader).
- Le transizioni "blur slide" usano HTML-in-canvas, che il browser di rendering di Remotion supporta già.
- Licenza Remotion: gratuita per team fino a 3 persone.
- Il carattere del manifesto (`font/AlfaSlabOne.ttf`, Alfa Slab One) è di Google Fonts, licenza SIL Open Font License.

## Dati demo per le schermate

Gli script sono in `video/sorgenti/registrazione/gestione/` (usano il profilo browser già loggato di `../lib.js`):

1. `seed_gest.js`: due mesi di serate, menu, staff, turni, fatture, magazzino e spese (ogni documento ha `seed:'rm'`).
2. `tune.js`: ritocca i totali (merce ~30% dell'incasso, crescita sul periodo prima).
3. `seed_today.js`: la serata in corso (tavoli arrivati, comande in cucina).
4. `cattura_g*.js`: le catture. La fattura si carica da `fattura-ortofrutta-demo.xml`.
5. `clean_gest.js`: toglie tutto quello che gli script hanno aggiunto e rimette il nome "Nuovo Ristorante".
