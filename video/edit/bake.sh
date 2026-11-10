#!/bin/bash
# Bake colour grades into the images so Remotion does not need CSS filters (much faster render).
cd "$(dirname "$0")/../public" || exit 1
mkdir -p p1g/warm p1g/sepia p1g/cold
for f in p1img/i*.jpg; do
  b=$(basename "$f")
  ffmpeg -v error -y -i "$f" -vf "eq=contrast=1.08:saturation=1.05" -q:v 3 p1g/warm/$b
  ffmpeg -v error -y -i "$f" -vf "colorchannelmixer=.50:.55:.12:0:.38:.55:.10:0:.25:.42:.10,eq=contrast=1.06:saturation=0.9" -q:v 3 p1g/sepia/$b
  ffmpeg -v error -y -i "$f" -vf "eq=contrast=1.1:saturation=0.78:brightness=-0.04,hue=h=-10" -q:v 3 p1g/cold/$b
done
ffmpeg -v error -y -i p1img/i19.jpg -vf "gblur=sigma=16,eq=brightness=-0.30" -q:v 3 p1g/warm/i19b.jpg
ffmpeg -v error -y -i p1img/i19.jpg -vf "gblur=sigma=16,eq=brightness=-0.28,colorchannelmixer=.50:.55:.12:0:.38:.55:.10:0:.25:.42:.10" -q:v 3 p1g/sepia/i19b.jpg
ffmpeg -v error -y -i p1img/i20.jpg -vf "eq=brightness=0.14:contrast=1.18:saturation=1.25" -q:v 3 p1g/warm/i20m.jpg
echo baked $(ls p1g/warm | wc -l) images
