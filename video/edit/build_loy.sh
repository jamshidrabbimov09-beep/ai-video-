#!/bin/bash
# "Loy jangi" battle breakdown. Stages: prep, audio, render, final. Without narration (public/loy/voice.wav) the audio is music only (preview).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out exports
STAGE="${1:-all}"
CHROME="${CHROME:-/opt/pw-browsers/chromium}"
T=$(python3 -c "import json;print(json.load(open('src/loy.json'))['end'])")
ENC=(-c:v libx264 -crf 20 -preset medium -maxrate 5500k -bufsize 11M -pix_fmt yuv420p -c:a copy -movflags +faststart)
if [[ $STAGE == all || $STAGE == prep ]]; then python3 edit/edit_loy.py; T=$(python3 -c "import json;print(json.load(open('src/loy.json'))['end'])"); fi
if [[ $STAGE == all || $STAGE == audio ]]; then
  FO=$(python3 -c "print($T-2.5)")
  if [[ -f public/loy/voice.wav ]]; then
    [[ -f out/ir.wav ]] || python3 edit/make_ir.py out/ir.wav
    ffmpeg -v error -y -i public/loy/voice.wav -ss 36.031 -i edit/music.mp3 -i out/ir.wav -filter_complex "
      [0:a]aresample=44100,highpass=f=70,dynaudnorm=f=300:g=7:p=0.9,equalizer=f=3200:t=q:w=1.1:g=2.5,apad=whole_dur=$T,asplit=2[vd][vw];
      [vw][2:a]afir=dry=0:wet=10,volume=0.16,highpass=f=200[wet];[vd][wet]amix=inputs=2:normalize=0:duration=first,asplit=2[v][vk];
      [1:a]aresample=44100,highpass=f=45,equalizer=f=95:t=q:w=0.9:g=-3,volume=0.5,afade=t=in:d=1.2[m];
      [m][vk]sidechaincompress=threshold=0.04:ratio=1.8:attack=40:release=900:makeup=1[md];
      [v][md]amix=inputs=2:normalize=0:duration=longest,atrim=0:$T,afade=t=out:st=$FO:d=2.5,loudnorm=I=-14:TP=-1.0:LRA=11,alimiter=limit=0.89:level=false" -ac 2 -ar 44100 -c:a aac -b:a 192k out/audio_loy.m4a
  else
    ffmpeg -v error -y -ss 36.031 -t "$T" -i edit/music.mp3 -af "afade=t=in:d=1.2,afade=t=out:st=$FO:d=2.5,loudnorm=I=-16:TP=-1.0" -ac 2 -ar 44100 -c:a aac -b:a 192k out/audio_loy.m4a
  fi
fi
if [[ $STAGE == all || $STAGE == render ]]; then
  npx remotion render src/index.ts LoyJangi out/video_loy_raw.mp4 --browser-executable="$CHROME" --concurrency=4 --crf=14 --codec=h264 --muted
fi
if [[ $STAGE == all || $STAGE == final ]]; then
  ffmpeg -v error -y -i out/video_loy_raw.mp4 -i out/audio_loy.m4a -vf "noise=alls=4:allf=t" -t "$T" "${ENC[@]}" exports/loy_jangi_1080p_logosiz.mp4
  ffmpeg -v error -y -i out/video_loy_raw.mp4 -i out/audio_loy.m4a -loop 1 -framerate 30 -i instagram/logo_rotating.png -loop 1 -framerate 30 -i instagram/logo_static.png -filter_complex "
    [2:v]format=rgba,rotate=a=0.45*t:c=none:ow=iw:oh=ih,scale=170:170,geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='alpha(X,Y)*(0.72+0.28*sin(2*PI*T/2.6))'[a];
    [3:v]format=rgba,scale=170:170[b];
    [0:v][b]overlay=W-w-34:150:shortest=1[v1];[v1][a]overlay=W-w-34:150:shortest=1,noise=alls=4:allf=t[vo]" \
    -map "[vo]" -map 1:a -t "$T" "${ENC[@]}" exports/loy_jangi_1080p.mp4
fi
echo "done: $STAGE"
