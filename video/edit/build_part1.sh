#!/bin/bash
# Rebuild the Part 1 video (Amir Temur, "Cho'loq yigit") from the sources in this repo.
#   edit/build_part1.sh            all stages
#   edit/build_part1.sh prep       colour-graded images, timeline, sound accents, reverb impulse
#   edit/build_part1.sh audio      narration + reverb + ducked music + accents  -> out/audio.m4a
#   edit/build_part1.sh render     Remotion picture render (about 13 min)       -> out/video_raw.mp4
#   edit/build_part1.sh final      1080p exports with and without the logo      -> out/part1*.mp4
# Needs: ffmpeg, python3 with numpy, `npm install` done in video/. LIMIT=5 shortens the final exports for a quick test.
# The render is long: start it detached (setsid nohup ... &) and poll the log instead of running it in the foreground.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
STAGE="${1:-all}"
CHROME="${CHROME:-/opt/pw-browsers/chromium}"
total() { python3 -c "import json;print(json.load(open('src/edit4.json'))['end'])"; }
ENC=(-c:v libx264 -crf 21 -preset medium -maxrate 7M -bufsize 14M -pix_fmt yuv420p -c:a copy -movflags +faststart)

if [[ $STAGE == all || $STAGE == prep ]]; then
  ./edit/bake.sh
  python3 edit/edit4.py
  python3 edit/sfx4.py
  python3 edit/make_ir.py out/ir.wav
fi

if [[ $STAGE == all || $STAGE == audio ]]; then
  [[ -f out/ir.wav ]] || python3 edit/make_ir.py out/ir.wav
  T=$(total)
  ffmpeg -v error -y -i public/voice/voice4.wav -i edit/music.mp3 -i edit/sfx4.wav -i out/ir.wav -filter_complex "
    [0:a]aresample=44100,highpass=f=70,dynaudnorm=f=300:g=7:p=0.9,apad=whole_dur=$T,asplit=2[vd][vw];
    [vw][3:a]afir=dry=0:wet=10,volume=0.16,highpass=f=200[wet];
    [vd][wet]amix=inputs=2:normalize=0:duration=first,asplit=2[v][vk];
    [1:a]aresample=44100,dynaudnorm=f=700:g=15:p=0.85:m=8,volume=0.55,afade=t=in:d=1.5,apad=whole_dur=$T[m];
    [m][vk]sidechaincompress=threshold=0.04:ratio=1.8:attack=40:release=900:makeup=1[md];
    [2:a]aresample=44100,volume=0.55[s];
    [v][md][s]amix=inputs=3:normalize=0:duration=longest,atrim=0:$T,loudnorm=I=-16:TP=-1.5:LRA=11" \
    -ac 2 -ar 44100 -c:a aac -b:a 192k out/audio.m4a
fi

if [[ $STAGE == all || $STAGE == render ]]; then
  npx remotion render src/index.ts Part1V4 out/video_raw.mp4 --browser-executable="$CHROME" --concurrency=4 --crf=14 --codec=h264 --muted
fi

if [[ $STAGE == all || $STAGE == final ]]; then
  T="${LIMIT:-$(total)}"
  ffmpeg -v error -y -i out/video_raw.mp4 -i out/audio.m4a -vf "noise=alls=4:allf=t" -t "$T" "${ENC[@]}" out/part1_logosiz.mp4
  # animated logo, top right: star and rings rotate slowly and pulse, the UQ disc stays still
  ffmpeg -v error -y -i out/video_raw.mp4 -i out/audio.m4a -loop 1 -framerate 30 -i instagram/logo_rotating.png -loop 1 -framerate 30 -i instagram/logo_static.png -filter_complex "
    [2:v]format=rgba,rotate=a=0.45*t:c=none:ow=iw:oh=ih,scale=170:170,geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='alpha(X,Y)*(0.72+0.28*sin(2*PI*T/2.6))'[a];
    [3:v]format=rgba,scale=170:170[b];
    [0:v][b]overlay=W-w-34:150:shortest=1[v1];[v1][a]overlay=W-w-34:150:shortest=1,noise=alls=4:allf=t[vo]" \
    -map "[vo]" -map 1:a -t "$T" "${ENC[@]}" out/part1.mp4
fi
echo "done: $STAGE"
