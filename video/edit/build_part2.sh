#!/bin/bash
# Rebuild Part 2 ("Do'st va dushman"). Stages as in build_part1.sh: prep, audio, render, final.
# Mix differs from Part 1 on the user's request ("jarangdorroq"): louder (-14 LUFS), presence lift on the voice, less music bass.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out exports
STAGE="${1:-all}"
CHROME="${CHROME:-/opt/pw-browsers/chromium}"
total() { python3 -c "import json;print(json.load(open('src/edit_p2.json'))['end'])"; }
ENC=(-c:v libx264 -crf 21 -preset medium -maxrate 7M -bufsize 14M -pix_fmt yuv420p -c:a copy -movflags +faststart)

if [[ $STAGE == all || $STAGE == prep ]]; then
  ./edit/bake_p2.sh
  python3 edit/edit_p2.py
  python3 edit/sfx_p2.py
  python3 edit/make_ir.py out/ir.wav
fi

if [[ $STAGE == all || $STAGE == audio ]]; then
  [[ -f out/ir.wav ]] || python3 edit/make_ir.py out/ir.wav
  T=$(total)
  ffmpeg -v error -y -i public/voice2/voice_p2.wav -i edit/music_p2.wav -i edit/sfx_p2.wav -i out/ir.wav -filter_complex "
    [0:a]aresample=44100,highpass=f=70,dynaudnorm=f=300:g=7:p=0.9,equalizer=f=3200:t=q:w=1.1:g=2.5,equalizer=f=8000:t=q:w=0.8:g=1.5,apad=whole_dur=$T,asplit=2[vd][vw];
    [vw][3:a]afir=dry=0:wet=10,volume=0.16,highpass=f=200[wet];
    [vd][wet]amix=inputs=2:normalize=0:duration=first,asplit=2[v][vk];
    [1:a]aresample=44100,dynaudnorm=f=700:g=15:p=0.85:m=8,highpass=f=45,equalizer=f=95:t=q:w=0.9:g=-3,volume=0.55,afade=t=in:d=1.5,apad=whole_dur=$T[m];
    [m][vk]sidechaincompress=threshold=0.04:ratio=1.8:attack=40:release=900:makeup=1[md];
    [2:a]aresample=44100,volume=0.45[s];
    [v][md][s]amix=inputs=3:normalize=0:duration=longest,atrim=0:$T,afade=t=out:st=$(python3 -c "print($T-2.5)"):d=2.5,loudnorm=I=-14:TP=-1.0:LRA=11,volume=1.6dB,alimiter=limit=0.89:level=false" \
    -ac 2 -ar 44100 -c:a aac -b:a 192k out/audio_p2.m4a
fi

if [[ $STAGE == all || $STAGE == render ]]; then
  npx remotion render src/index.ts Part2 out/video_p2_raw.mp4 --browser-executable="$CHROME" --concurrency=4 --crf=14 --codec=h264 --muted
fi

if [[ $STAGE == all || $STAGE == final ]]; then
  T="${LIMIT:-$(total)}"
  ffmpeg -v error -y -i out/video_p2_raw.mp4 -i out/audio_p2.m4a -vf "noise=alls=4:allf=t" -t "$T" "${ENC[@]}" exports/part2_dost_va_dushman_1080p_logosiz.mp4
  ffmpeg -v error -y -i out/video_p2_raw.mp4 -i out/audio_p2.m4a -loop 1 -framerate 30 -i instagram/logo_rotating.png -loop 1 -framerate 30 -i instagram/logo_static.png -filter_complex "
    [2:v]format=rgba,rotate=a=0.45*t:c=none:ow=iw:oh=ih,scale=170:170,geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='alpha(X,Y)*(0.72+0.28*sin(2*PI*T/2.6))'[a];
    [3:v]format=rgba,scale=170:170[b];
    [0:v][b]overlay=W-w-34:150:shortest=1[v1];[v1][a]overlay=W-w-34:150:shortest=1,noise=alls=4:allf=t[vo]" \
    -map "[vo]" -map 1:a -t "$T" "${ENC[@]}" exports/part2_dost_va_dushman_1080p.mp4
fi
echo "done: $STAGE"
