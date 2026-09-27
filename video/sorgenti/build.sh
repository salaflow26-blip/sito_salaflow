#!/usr/bin/env bash
# Rigenera video/salaflow-lancio-16x9.mp4 e -9x16.mp4 (serve node+playwright, ffmpeg con libx264, python3+numpy)
set -euo pipefail
cd "$(dirname "$0")"
FF="${FFMPEG:-ffmpeg}"
mkdir -p build/stills
"$FF" -loglevel error -y -i ../../demo.mp4 -vn -ac 2 -ar 48000 -f f32le build/music.raw   # musica della demo
python3 mix.py                                                                          # musica + whoosh + tap
python3 mix_short.py                                                                    # audio del taglio corto
for f in ${@:-h ig}; do
  node render.js video "$f" 60 4                                                         # fotogrammi a 60fps
  case "$f" in h) name=lancio-16x9;; v) name=lancio-9x16;; ig) name=teaser-instagram-9x16;; igs) name=teaser-instagram-corto-9x16;; esac
  "$FF" -loglevel error -y -f concat -safe 0 -i "build/parts_$f.txt" -i "build/$([ "$f" = igs ] && echo mix_short || echo mix).wav" -map 0:v -map 1:a \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart \
    "../salaflow-$name.mp4"
done
