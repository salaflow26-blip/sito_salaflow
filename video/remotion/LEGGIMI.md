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

## Note

- Il light leak usa WebGL: in un ambiente senza GPU `remotion.config.ts` usa `swangle` (SwiftShader).
- Le transizioni "blur slide" usano HTML-in-canvas, che il browser di rendering di Remotion supporta già.
- Licenza Remotion: gratuita per team fino a 3 persone.

## Dati demo per le schermate

Gli script sono in `video/sorgenti/registrazione/gestione/` (usano il profilo browser già loggato di `../lib.js`):

1. `seed_gest.js`: due mesi di serate, menu, staff, turni, fatture, magazzino e spese (ogni documento ha `seed:'rm'`).
2. `tune.js`: ritocca i totali (merce ~30% dell'incasso, crescita sul periodo prima).
3. `seed_today.js`: la serata in corso (tavoli arrivati, comande in cucina).
4. `cattura_g*.js`: le catture. La fattura si carica da `fattura-ortofrutta-demo.xml`.
5. `clean_gest.js`: toglie tutto quello che gli script hanno aggiunto e rimette il nome "Nuovo Ristorante".
