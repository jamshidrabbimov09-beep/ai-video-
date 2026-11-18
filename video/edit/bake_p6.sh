#!/bin/bash
# Part 6: bring the Flow images (768x1376 or 1116x2000) to 1296x2322 (Lanczos + light sharpening) and bake the colour grades into public/p6g/.
cd "$(dirname "$0")/../public" || exit 1
mkdir -p p6g/warm p6g/cold
UP="scale=1296:2322:force_original_aspect_ratio=increase:flags=lanczos,crop=1296:2322,unsharp=5:5:0.5:5:5:0.0"
for f in p6img/n*.jpg p5img/m16.jpg; do
  b=$(basename "$f")
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.08:saturation=1.05" -q:v 2 p6g/warm/$b
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.1:saturation=0.78:brightness=-0.04,hue=h=-10" -q:v 2 p6g/cold/$b
done
echo baked $(ls p6g/warm | wc -l) images
