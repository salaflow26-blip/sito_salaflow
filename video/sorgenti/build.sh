#!/usr/bin/env bash
# Rigenera video/salaflow-lancio-16x9.mp4 e -9x16.mp4 (serve node+playwright, ffmpeg con libx264, python3+numpy)
set -euo pipefail
cd "$(dirname "$0")"
FF="${FFMPEG:-ffmpeg}"
mkdir -p build/stills
"$FF" -loglevel error -y -i ../../demo.mp4 -vn -ac 2 -ar 48000 -f f32le build/music.raw   # musica della demo
python3 mix.py                                                                          # musica + whoosh + tap
for f in ${@:-h v}; do
  node render.js video "$f" 60 4                                                         # fotogrammi a 60fps
  name=$([ "$f" = h ] && echo 16x9 || echo 9x16)
  "$FF" -loglevel error -y -f concat -safe 0 -i "build/parts_$f.txt" -i build/mix.wav -map 0:v -map 1:a \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart \
    "../salaflow-lancio-$name.mp4"
done
