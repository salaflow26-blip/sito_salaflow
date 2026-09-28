#!/usr/bin/env bash
# Rigenera i video in video/ (serve node+playwright, ffmpeg con libx264, python3+numpy)
#   ./build.sh              16:9 per il sito + teaser Instagram
#   ./build.sh h | ig | igs un formato solo.   BLUR=1 ./build.sh h  anteprima veloce senza motion blur
set -euo pipefail
cd "$(dirname "$0")"
FF="${FFMPEG:-ffmpeg}"
K="${BLUR:-16}"                                                                         # slot di motion blur per fotogramma
mkdir -p build/stills
"$FF" -loglevel error -y -i ../../demo.mp4 -vn -ac 2 -ar 48000 -f f32le build/music.raw   # musica della demo
python3 mix.py site                                                                     # sito: musica +2 battute, whoosh, tap
python3 mix.py                                                                          # instagram
python3 mix_short.py                                                                    # audio del taglio corto
for f in ${@:-h ig}; do
  node render.js video "$f" 60 4 "$K"                                                    # fotogrammi a 60fps
  case "$f" in h) name=lancio-16x9 wav=mix_site;; v) name=lancio-9x16 wav=mix;; ig) name=teaser-instagram-9x16 wav=mix;; igs) name=teaser-instagram-corto-9x16 wav=mix_short;; esac
  "$FF" -loglevel error -y -f concat -safe 0 -i "build/parts_$f.txt" -i "build/$wav.wav" -map 0:v -map 1:a \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart \
    "../salaflow-$name.mp4"
  if [ "$f" = h ]; then                                                                  # versione leggera per il sito
    "$FF" -loglevel error -y -f concat -safe 0 -i build/parts_h.txt -i build/mix_site.wav -map 0:v -map 1:a \
      -c:v libx264 -preset slower -crf 25 -tune animation -pix_fmt yuv420p -profile:v high -level 4.2 \
      -c:a aac -b:a 128k -shortest -movflags +faststart ../../salaflow-tour.mp4
  fi
done
