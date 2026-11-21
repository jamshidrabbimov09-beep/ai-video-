#!/bin/bash
# Part 8: Flow images (768x1376) to 1296x2322 (Lanczos + light sharpening), grades baked into public/p8g/ (git-ignored).
# Dark scenes get a small lift so they read on a phone (FORMAT v2 rule).
cd "$(dirname "$0")/../public" || exit 1
mkdir -p p8g/warm p8g/cold
UP="scale=1296:2322:force_original_aspect_ratio=increase:flags=lanczos,crop=1296:2322,unsharp=5:5:0.6:5:5:0.0"
for f in p8img/p*.jpg p7img/o15.jpg; do
  b=$(basename "$f")
  ffmpeg -v error -y -i "$f" -vf "$UP,curves=all='0/0.03 0.25/0.29 0.5/0.53 1/1',eq=contrast=1.06:saturation=1.05" -q:v 2 p8g/warm/$b
  ffmpeg -v error -y -i "$f" -vf "$UP,curves=all='0/0.03 0.25/0.29 0.5/0.53 1/1',eq=contrast=1.08:saturation=0.8:brightness=-0.02,hue=h=-8" -q:v 2 p8g/cold/$b
done
echo baked $(ls p8g/warm | wc -l) images
