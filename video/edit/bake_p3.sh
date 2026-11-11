#!/bin/bash
# Part 3: upscale the 768x1376 Flow images to 1296x2322 (Lanczos + light sharpening) and bake the colour grades into public/p3g/.
cd "$(dirname "$0")/../public" || exit 1
mkdir -p p3g/warm p3g/sepia p3g/cold
UP="scale=1296:-2:flags=lanczos,unsharp=5:5:0.6:5:5:0.0"
for f in p3img/k*.jpg; do
  b=$(basename "$f")
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.08:saturation=1.05" -q:v 2 p3g/warm/$b
  ffmpeg -v error -y -i "$f" -vf "$UP,colorchannelmixer=.50:.55:.12:0:.38:.55:.10:0:.25:.42:.10,eq=contrast=1.06:saturation=0.9" -q:v 2 p3g/sepia/$b
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.1:saturation=0.78:brightness=-0.04,hue=h=-10" -q:v 2 p3g/cold/$b
done
echo baked $(ls p3g/warm | wc -l) images
