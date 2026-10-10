# Video di lancio SalaFlow — versione Remotion

Video verticale 1080×1920, 30 fps, 44 s, fatto con [Remotion](https://www.remotion.dev) (React).
Tutte le schermate sono vere, prese dall'account demo ("Trattoria Demo") con dati di prova.

## Comandi

```bash
cd video/remotion
npm i
npm run dev                      # Remotion Studio: anteprima e modifiche dal browser
npx remotion render Lancio out/salaflow-lancio-remotion.mp4 --crf=20 --jpeg-quality=92
```

Nello Studio ogni scena è anche una composizione a sé (cartella "Scene"), così la si può vedere e ritoccare da sola.

## Struttura

- `src/Launch.tsx`: la timeline. Ogni taglio cade su una battuta della musica (112 BPM, 64,24 fotogrammi a battuta).
  Le transizioni durano 14 fotogrammi e sono centrate sulla battuta.
- `src/features.ts`: testo, schermata e riquadro ingrandito (coordinate in pixel della schermata) di ogni funzione.
- `src/scenes/`: gancio sul quaderno, logo, scena funzione generica, capitolo "E per chi gestisce", staff (turni e checklist), muro di schermate, finale.
- `src/components/`: telefono/tablet, titoli animati, sfondo, light leak.
- `public/shots/`: le schermate. Le `*_full.jpg` sono pagine intere che scorrono dentro il telefono.
- `public/music.mp3`: generata da `scripts/mix.py` (stessa musica degli altri video; serve `../sorgenti/build/music.raw`).

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
