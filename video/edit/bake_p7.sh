#!/bin/bash
# Part 7: bring the Flow images (768x1376 or 1116x2000) to 1296x2322 (Lanczos + light sharpening) and bake the colour grades into public/p7g/.
cd "$(dirname "$0")/../public" || exit 1
mkdir -p p7g/warm p7g/cold
UP="scale=1296:2322:force_original_aspect_ratio=increase:flags=lanczos,crop=1296:2322,unsharp=5:5:0.5:5:5:0.0"
for f in p7img/o*.jpg p6img/n01.jpg p6img/n19.jpg; do
  b=$(basename "$f")
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.08:saturation=1.05" -q:v 2 p7g/warm/$b
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.1:saturation=0.78:brightness=-0.04,hue=h=-10" -q:v 2 p7g/cold/$b
done
echo baked $(ls p7g/warm | wc -l) images
