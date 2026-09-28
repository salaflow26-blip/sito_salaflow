# Video di lancio — sorgenti

Motion design generato in codice: `stage.html` disegna ogni fotogramma in funzione del tempo
(`window.render(t)`), `render.js` lo cattura con Playwright a 60fps e ffmpeg lo codifica.
L'interfaccia dell'app è ricostruita in HTML/CSS partendo dalle schermate vere (così gli zoom restano nitidi).

```bash
cd video/sorgenti
./build.sh          # 16:9 per il sito + teaser Instagram
./build.sh h        # solo il 16:9 del sito (~25 min con il motion blur)
./build.sh ig       # solo Instagram (9:16, zone sicure Reels, testi "presto disponibile")
./build.sh igs      # teaser Instagram corto (~32s)
BLUR=1 ./build.sh h # anteprima veloce, senza motion blur
node render.js stills h 10,20.5,33   # fotogrammi singoli in build/stills/ (utile mentre si modifica)
```

Servono Node + Playwright, ffmpeg con libx264 (`FFMPEG=/percorso` per indicarne uno), Python 3 con numpy.

## Versione per il sito (`h`)
- È pensata per il riquadro `#video-demo` di `index.html`: sul computer si vede intero (16:9), sul telefono
  il CSS del sito lo ritaglia al centro (3:4, i 810 px centrali). Telefono, didascalie e tutto ciò che
  serve per capire stanno in quella colonna; ai lati ci sono solo extra da computer (numero del passo con
  una frase di spiegazione a sinistra, elenco dei passi a destra), che sul telefono spariscono per intero.
- L'angolo in basso a destra resta libero per il pulsante dell'audio del sito.
- Rispetto alle versioni Instagram ha 2 battute in più: la scena "Promemoria" (`PM0`..`PM1`), prima delle
  comande. `mix.py site` ripete le battute 11-12 della musica in quel punto, allineate sui colpi di batteria.
- Motion blur: per ogni fotogramma `render.js` misura quanto si muove ogni elemento durante l'esposizione
  (`motionAt`) e fa la media di 1, 4, 8 o 16 sottofotogrammi (otturatore a 180°).

## Dove si cambia cosa
- Tempi: tutto è agganciato alla musica (112 BPM, `bar(n)` = battuta n). Il drop è a `bar(9)` ≈ 19,4s.
- Testi: `mkCap(...)` e l'oggetto `C` in `stage.html`; spiegazioni ed elenco dei passi in `STEPS`;
  chiusura in fondo al file (`endBox`).
- Audio: `mix.py` usa la musica di `demo.mp4` e aggiunge whoosh e tap sintetizzati.
- Font: Plus Jakarta Sans, Caveat, DM Serif Text (SIL Open Font License), in `font/`.
- Taglio corto (`igs`): stesse scene, montate a fette di una battuta e mezza (`SEG` in fondo a `stage.html`);
  l'audio corrispondente è in `mix_short.py` (musica dalla battuta 5, drop a 8,6s quando entra il telefono, chiusura sul finale del brano).
