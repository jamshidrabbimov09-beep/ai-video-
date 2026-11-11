#!/bin/bash
# Part 2: upscale the 768x1376 Flow images to 1296x2322 (Lanczos + light sharpening) and bake the colour grades into public/p2g/.
cd "$(dirname "$0")/../public" || exit 1
mkdir -p p2g/warm p2g/sepia p2g/cold
UP="scale=1296:-2:flags=lanczos,unsharp=5:5:0.6:5:5:0.0"
for f in p2img/j*.jpg; do
  b=$(basename "$f")
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.08:saturation=1.05" -q:v 2 p2g/warm/$b
  ffmpeg -v error -y -i "$f" -vf "$UP,colorchannelmixer=.50:.55:.12:0:.38:.55:.10:0:.25:.42:.10,eq=contrast=1.06:saturation=0.9" -q:v 2 p2g/sepia/$b
  ffmpeg -v error -y -i "$f" -vf "$UP,eq=contrast=1.1:saturation=0.78:brightness=-0.04,hue=h=-10" -q:v 2 p2g/cold/$b
done
echo baked $(ls p2g/warm | wc -l) images
