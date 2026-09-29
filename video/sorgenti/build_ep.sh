#!/bin/bash
# ./build_ep.sh <episode id> [fps] [workers] [K]  ->  ../funzioni/salaflow-funzione-NN-<file>.mp4
set -e
cd "$(dirname "$0")"
ID=$1; FPS=${2:-30}; W=${3:-4}; K=${4:-4}
FF=${FFMPEG:-/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}
META=$(node -e "const s=require('fs').readFileSync('episodio.html','utf8');const m=s.match(new RegExp('\\\\b'+process.argv[1]+':\\\\s*\\\\{ n: (\\\\d+),\\\\s*file: \\'([^\\']+)\\''));console.log(String(m[1]).padStart(2,'0')+'-'+m[2])" $ID)
python3 mix_episodio.py $ID
PAGE=episodio.html FFMPEG=$FF node render.js video $ID $FPS $W $K
mkdir -p ../funzioni
$FF -loglevel error -y -f concat -safe 0 -i build/parts_$ID.txt -i build/mix_ep_$ID.wav -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k -shortest ../funzioni/salaflow-funzione-$META.mp4
rm -f build/part_${ID}_*.mp4
echo "done ../funzioni/salaflow-funzione-$META.mp4"
