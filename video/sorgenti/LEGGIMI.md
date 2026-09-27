# Video di lancio — sorgenti

Motion design generato in codice: `stage.html` disegna ogni fotogramma in funzione del tempo
(`window.render(t)`), `render.js` lo cattura con Playwright a 60fps e ffmpeg lo codifica.
L'interfaccia dell'app è ricostruita in HTML/CSS partendo dalle schermate vere (così gli zoom restano nitidi).

```bash
cd video/sorgenti
./build.sh          # 16:9 + teaser Instagram   ·   ./build.sh h   solo 16:9   ·   ./build.sh ig   solo Instagram (9:16, zone sicure Reels, testi "presto disponibile")
./build.sh igs      # teaser Instagram corto (~32s)
node render.js stills h 10,20.5,33   # anteprime singole in build/stills/ (utile mentre si modifica)
```

Servono Node + Playwright, ffmpeg con libx264 (`FFMPEG=/percorso` per indicarne uno), Python 3 con numpy.

- Tempi: tutto è agganciato alla musica (112 BPM, `bar(n)` = battuta n). Il drop è a `bar(9)` ≈ 19,4s.
- Testi: `mkCap(...)` e l'oggetto `C` in `stage.html`; chiusura in fondo al file (`endBox`).
- Audio: `mix.py` usa la musica di `demo.mp4` e aggiunge whoosh e tap sintetizzati.
- Font: Plus Jakarta Sans, Caveat, DM Serif Text (SIL Open Font License), in `font/`.
- Taglio corto (`igs`): stesse scene, montate a fette di una battuta e mezza (`SEG` in fondo a `stage.html`);
  l'audio corrispondente è in `mix_short.py` (musica dalla battuta 5, drop a 8,6s quando entra il telefono, chiusura sul finale del brano).
