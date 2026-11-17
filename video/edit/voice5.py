"""5-qism ovozi: asosiy yozuvdagi xato gapni ("qo'rqmaydimi") qayta yozilgan gap ("cho'chimaydimi") bilan almashtiradi,
ilgak va yakuniy savolni alohida faylga ajratadi, so'z vaqtlarini moslaydi.

Kirish: public/audio5/all_raw.mp3 (asosiy, 135.97 s), public/audio5/extra_raw.mp3 (tuzatish + ilgak + savol, 22.83 s),
edit/transcript5_diar.json (ikkalasi 3 s pauza bilan ulanib, bitta Scribe transkripsiyasi; extra 138.967 s dan boshlanadi).
Kesish nuqtalari silencedetect bo'yicha, haqiqiy pauzalar o'rtasida.
Chiqish: public/voice5/all.wav, hook.wav, ask.wav; src/words5.json, src/words5_hook.json, src/words5_ask.json.
"""
import json, subprocess, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'public/audio5/all_raw.mp3')
X = os.path.join(ROOT, 'public/audio5/extra_raw.mp3')
OUT = os.path.join(ROOT, 'public/voice5')
os.makedirs(OUT, exist_ok=True)

XOFF = 135.967 + 3.0          # extra fayl transkriptda shu vaqtdan boshlanadi
CUT1, CUT2 = 84.65, 87.74     # asosiy: olib tashlanadigan gap (pauzalar o'rtasi)
FIX = (0.0, 3.27)             # extra: tuzatilgan gap
HOOK = (3.27, 16.34)          # extra: keyingi qism ilgagi
ASK = (16.34, 22.83)          # extra: yakuniy savol


def ff(*args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


fmt = 'aformat=sample_rates=44100:channel_layouts=mono'
ff('-i', A, '-i', X, '-filter_complex',
   f'[0:a]atrim=0:{CUT1},asetpts=N/SR/TB,{fmt}[a];'
   f'[1:a]atrim={FIX[0]}:{FIX[1]},asetpts=N/SR/TB,{fmt}[f];'
   f'[0:a]atrim=start={CUT2},asetpts=N/SR/TB,{fmt}[b];'
   '[a][f][b]concat=n=3:v=0:a=1', os.path.join(OUT, 'all.wav'))
for name, (s, e) in (('hook', HOOK), ('ask', ASK)):
    ff('-i', X, '-af', f'atrim={s}:{e},asetpts=N/SR/TB,{fmt}', os.path.join(OUT, f'{name}.wav'))

words = [w for w in json.load(open(os.path.join(ROOT, 'edit/transcript5_diar.json'), encoding='utf-8'))['words']
         if w.get('type') == 'word']


def W(w, shift):
    return {'t': w['text'], 's': round(w['start'] + shift, 3), 'e': round(w['end'] + shift, 3)}


fixlen = FIX[1] - FIX[0]
main = []
for w in words:
    if w['end'] <= CUT1:
        main.append(W(w, 0))
    elif XOFF + FIX[0] <= w['start'] < XOFF + FIX[1]:
        main.append(W(w, CUT1 - XOFF - FIX[0]))
    elif CUT2 <= w['start'] < XOFF:
        main.append(W(w, CUT1 + fixlen - CUT2))
main.sort(key=lambda w: w['s'])
hook = [W(w, -XOFF - HOOK[0]) for w in words if XOFF + HOOK[0] <= w['start'] < XOFF + HOOK[1]]
ask = [W(w, -XOFF - ASK[0]) for w in words if w['start'] >= XOFF + ASK[0]]
for name, ws in (('words5', main), ('words5_hook', hook), ('words5_ask', ask)):
    json.dump(ws, open(os.path.join(ROOT, f'src/{name}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(len(main), len(hook), len(ask))
print(' '.join(w['t'] for w in main if 82 < w['s'] < 92))
