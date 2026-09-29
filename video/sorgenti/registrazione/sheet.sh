#!/bin/bash
# sheet.sh <ep> : contact sheet of all steps, 7 per row
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
D=/home/user/sito_salaflow/video/sorgenti/build/ep/$1; n=$(ls $D/*.png | grep -v sheet | wc -l)
args=(); f=""; for i in $(seq 0 $((n-1))); do args+=(-i $D/$i.png); f+="[$i]scale=300:600[s$i];"; done
cols=7; rows=$(( (n+cols-1)/cols )); pad=$((rows*cols-n))
for j in $(seq 1 $pad); do args+=(-f lavfi -i color=black:s=300x600); k=$((n+j-1)); f+="[$k]null[s$k];"; done
tot=$((n+pad)); lay=""; for i in $(seq 0 $((tot-1))); do lay+="[s$i]"; done
pos=""; for i in $(seq 0 $((tot-1))); do x=$(( (i%cols)*300 )); y=$(( (i/cols)*600 )); pos+="${x}_${y}|"; done
$FF -loglevel error -y "${args[@]}" -filter_complex "$f${lay}xstack=inputs=$tot:layout=${pos%|}" -frames:v 1 $D/sheet.jpg && echo $D/sheet.jpg
