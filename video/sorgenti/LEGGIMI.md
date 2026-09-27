# Video di lancio — sorgenti

Rigenera `video/salaflow-lancio-16x9.mp4` e `video/salaflow-lancio-9x16.mp4` a partire da `demo.mp4`.

```bash
cd video/sorgenti
node assets.js          # testi, sfondi e maschera telefono (PNG in build/), serve Playwright
python3 build.py        # monta i due formati (serve ffmpeg con libx264; FFMPEG=/percorso per cambiarlo)
python3 build.py h      # solo 16:9   ·   python3 build.py v   solo 9:16
```

- Testi delle didascalie: `CAPTIONS` in `assets.js`; chiusura (logo, "Prenota una visita", salaflow.com, squadra) più sotto nello stesso file.
- Tagli dalla demo (inizio/durata di ogni scena): `SCENES` in `build.py`.
- Font: Plus Jakarta Sans (SIL Open Font License), in `font/`.
