"""Part 8 "Asir sulton" (copy of edit_p7.py, FORMAT v2). Part 6 "Fillar hujumi" (2026-11-18), new 45-60 s format (TEMUR.md "YANGI FORMAT"): one take public/audio6/all_raw.mp3 used UNCUT
(question included), shifted so the voice starts at 0.4 s. Big on-screen hook text, "Oldingi qismda" callback (Part 5 m16), India route map,
date cards, question card C, subscribe card with "ERTAGA 7-QISM".
Outputs: public/voice8/voice_p8.wav, src/edit_p8.json, edit/sfx_plan_p8.json, edit/music_p8.wav
"""
import json, math, pathlib, re, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
rd = lambda p: json.loads((root / p).read_text(encoding='utf-8'))
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / p), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768

w0 = rd('src/words8.json')
OFF = 0.4 - w0[0]['s']
words = [dict(t=x['t'], s=x['s'] + OFF, e=x['e'] + OFF) for x in w0]
ASK_END = words[-1]['e'] + 0.35
SUB_LEN = 3.2
TOTAL = ASK_END + SUB_LEN

sents, cur = [], []
for i, x in enumerate(words):
    cur.append(i)
    if x['t'].rstrip('"').endswith(('.', '?', '!')): sents.append(cur); cur = []
if cur: sents.append(cur)
assert len(sents) == 41, len(sents)
SS = lambda n: words[sents[n - 1][0]]['s']
SE = lambda n: words[sents[n - 1][-1]]['e']
W = lambda i: words[i]['s']
E = lambda i: words[i]['e']
def wi(n, word):
    for k in sents[n - 1]:
        if re.sub(r'[.,?!:"]', '', words[k]['t']).lower().startswith(word.lower()): return k
    raise KeyError((n, word))

AV = load('public/audio8/all_raw.mp3')
out = np.zeros(int((TOTAL + 1) * SR)); s0 = int(OFF * SR)
out[s0:s0 + len(AV)] += AV[:len(out) - s0]
(root / 'public/voice8').mkdir(exist_ok=True)
with wave.open(str(root / 'public/voice8/voice_p8.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())

def bound(a):
    kind, v = a
    if kind == 't': return 0.0
    if kind == 's':
        pe = SE(v - 1) + 0.12
        return pe + 0.5 * (SS(v) - 0.12 - pe)
    return W(v) - 0.10
spec = [  # (anchor, img | "mo:<scene>", move, transition, grade). FORMAT v2: no shot over ~4 s, a new frame every 3-4 s.
    (('t', 0), '02', 'in2', 'none', 'warm'),                   # hook: Boyazid led in with tied hands
    (('w', wi(1, 'temurning')), '04', 'push', 'fade', 'warm'), # close-up of his face
    (('s', 2), '01', 'in', 'fade', 'warm'),                    # Bu - Usmonli sultoni Boyazid
    (('w', wi(2, 'laqabi')), '05', 'in2', 'fade', 'cold'),     # Yildirim (lightning)
    (('s', 3), '03', 'push', 'fade', 'warm'),                  # Endi Temur uni nima qiladi?
    (('s', 4), 'o15', 'in2', 'dip', 'warm'),                   # Oldingi qismda (moving shot, 7-qism)
    (('s', 5), '06', 'in', 'fade', 'warm'),                    # g'arbda Boyazid kuchayib
    (('s', 6), '07', 'in', 'fade', 'warm'),                    # maktub
    (('w', wi(7, 'boyazid')), '08', 'in2', 'fade', 'warm'),    # kibr bilan javob
    (('s', 8), 'mo:threat', 'none', 'fade', 'warm'),           # Tabrizgacha boraman
    (('s', 9), '09', 'in', 'dip', 'warm'),                     # amirlar ikkilanardi
    (('w', wi(9, 'lekin')), '10', 'in2', 'fade', 'warm'),      # baribir yo'lga chiqadi
    (('s', 10), '11', 'in', 'fade', 'cold'),                   # o'rmonli tor yo'llarda kutadi
    (('s', 11), 'mo:detour', 'none', 'fade', 'warm'),          # aylanib Anqaraga
    (('s', 13), '12', 'in2', 'fade', 'warm'),                  # Temur deydi: piyoda
    (('s', 15), '13', 'in', 'fade', 'warm'),                   # holdan toyadi
    (('s', 16), '14', 'in', 'fade', 'warm'),                   # quduq
    (('s', 17), '15', 'out', 'fade', 'warm'),                  # Anqara yonida qarorgoh
    (('s', 18), '16', 'in2', 'fade', 'warm'),                  # buloqni yog'och bilan
    (('w', wi(18, "yog'och")), '16', 'push', 'none', 'warm'),  # yog'och bilan
    (('s', 19), '17', 'push', 'fade', 'warm'),                 # jazirama, charchagan
    (('s', 20), '18', 'out', 'dip', 'warm'),                   # saf tortadi
    (('s', 21), '19', 'in', 'fade', 'warm'),                   # fillarga sovut
    (('s', 22), '20', 'in', 'fade', 'cold'),                   # qora sovutli otliqlar
    (('s', 23), '20', 'push', 'none', 'cold'),                 # faqat ko'zlari
    (('s', 24), '21', 'in2', 'fade', 'warm'),                  # qattiq turadi
    (('w', wi(24, 'lekin')), '22', 'in', 'fade', 'warm'),      # chekinadi
    (('s', 25), '23', 'push', 'fade', 'warm'),                 # tepalikdan qaraydi
    (('s', 27), '24', 'in2', 'fade', 'warm'),                  # kechgacha jang
    (('w', wi(27, 'keyin')), '25', 'in', 'fade', 'warm'),      # yorib qochadi
    (('s', 28), '26', 'in2', 'fade', 'warm'),                  # quvib yetadi
    (('s', 29), '27', 'push', 'dip', 'warm'),                  # Temur buyuradi
    (('s', 31), '28', 'in', 'fade', 'warm'),                   # ro'parasiga
    (('s', 33), '28', 'push', 'none', 'warm'),                 # quloq solmading
    (('s', 34), '27', 'faceT', 'fade', 'warm'),                # yaxshilikdan boshqa
    (('s', 35), '04', 'in', 'fade', 'warm'),                   # xatosini tan oladi
    (('s', 36), '29', 'in', 'fade', 'warm'),                   # shohona to'n
    (('w', wi(36, "yo'qolgan")), '30', 'in2', 'fade', 'warm'), # o'g'li
    (('s', 37), '31', 'inslow', 'dip', 'cold'),                # asirlikda vafot etdi
    (('s', 38), '32', 'in', 'dip', 'warm'),                    # ertaga: Ispaniyadan elchi
    (('s', 39), '32', 'push', 'none', 'warm'),                 # o'z ko'zi bilan
    (('s', 40), '01', 'inslow', 'dip', 'warm'),                # savol
    (('s', 41), '23', 'inslow', 'fade', 'warm'),               # Ha yoki yo'q
]
bounds = [bound(a) for a, *_ in spec] + [TOTAL]
shots = [dict(t0=round(bounds[k], 3), t1=round(bounds[k + 1], 3), img=img, mv=mv, tr=trn, grade=gr)
         for k, (a, img, mv, trn, gr) in enumerate(spec)]
assert all(s['t1'] > s['t0'] for s in shots)

over = []
over.append(dict(k='tag', t0=0.0, t1=round(SE(1) + 0.2, 3), text="8-QISM"))
over.append(dict(k='hook', t0=0.2, t1=round(SE(1) + 0.2, 3), text="SULTON", sub="ASIRDA", y=760))
over.append(dict(k='name', t0=round(W(wi(2, 'boyazid')), 3), t1=round(SE(2) + 0.3, 3), text="BOYAZID", sub="YILDIRIM", sub_t=round(W(wi(2, 'yildirim')) - W(wi(2, 'boyazid')), 3)))
over.append(dict(k='name', t0=round(SS(17), 3), t1=round(SE(17) + 0.3, 3), text="ANQARA", sub="1402", sub_t=0.3))
q0 = SS(40)
over.append(dict(k='q', t0=round(q0 - 0.2, 3), t1=round(ASK_END, 3), pop=round((W(wi(40, 'boyazidni')) - q0 + 0.4) * 30)))
over.append(dict(k='subend', t0=round(ASK_END, 3), t1=round(TOTAL, 3), text="KEYINGI QISM: ELCHI"))
for a, b in ((0, SE(3) + 0.3), (SS(29), SE(34) + 0.3), (SS(37), SE(37) + 0.4)):
    over.append(dict(k='bars', t0=round(max(0, a), 3), t1=round(b, 3)))

FIXW = (("usmonli", "Usmonli"), ("chaqmoq", "Chaqmoq"), ("amrlari", "amirlari"), ("Anadoluga", "Anado'luga"), ("Chegaringdan", "Chegarangdan"), ("Ankara", "Anqara"), ("bahodirlardan", "bahodirlaridan"), ("Sizchi", "Siz-chi,"), ("o'tkazadi", "o'tqazadi"), ("Tabriz", "Tabrizgacha"), ("gacha", ""), ("ming", "1402-yil,"))
SKIP = set(range(wi(1, "to'rt"), wi(1, 'iyul')))   # '1402-yil, iyul' replaces the spoken year
toks = []
for i, x in enumerate(words):
    if i in SKIP: continue
    t = x['t']
    for a, b in FIXW:
        if t.startswith(a): t = b + t[len(a):]
    if ':"' in t:   # 'so'raydi:"Jangda' is one Scribe token: split it so the caption can break after the colon
        a, b = t.split(':"', 1); m = W(i) + (E(i) - W(i)) * len(a) / len(t)
        toks += [(W(i), m, a + ':'), (m, E(i), b)]; continue
    if t == '': continue
    toks.append((W(i), E(i), t))
NOBREAK = ('Bizning', 'Jangda', 'Temur', 'Temurning', 'ming', 'yuz', 'besh-olti', 'Sulton', 'Mallu', 'ayollar', 'yog\'och', 'bitta', 'Ha')
def split_sentence(ts):
    n = len(ts); L = [len(t[2]) for t in ts]
    width = lambda i, j: sum(L[i:j]) + (j - i - 1)
    if width(0, n) <= 30 and n <= 6: return [ts]
    k = max(2, math.ceil(width(0, n) / 26)); target = width(0, n) / k
    best = {0: (0.0, [])}
    for j in range(1, n + 1):
        cand = None
        for i in range(max(0, j - 6), j):
            if i not in best: continue
            w = width(i, j)
            if w > 36 and j - i > 1: continue
            c = best[i][0] + (w - target) ** 2 + (500 if j - i == 1 else 0) - (80 if ts[j - 1][2].endswith((',', ':')) and j < n else 0) + (400 if j < n and ts[j - 1][2] in NOBREAK else 0)
            if cand is None or c < cand[0]: cand = (c, best[i][1] + [(i, j)])
        if cand: best[j] = cand
    return [ts[i:j] for i, j in best[n][1]]
chunks, cur = [], []
for tk in toks:
    cur.append(tk)
    if tk[2].rstrip('"').endswith(('.', '?', '!')): chunks += split_sentence(cur); cur = []
if cur: chunks += split_sentence(cur)
for k, ch in enumerate(chunks):
    t0 = ch[0][0] - 0.04; t1 = ch[-1][1] + 0.22
    if k + 1 < len(chunks): t1 = min(t1, chunks[k + 1][0][0] - 0.06)
    over.append(dict(k='sub', t0=round(t0, 3), t1=round(max(t1, t0 + 0.5), 3), text=' '.join(c[2] for c in ch)))
(root / 'src/edit_p8.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False), encoding='utf-8')

sfx = [dict(k='boom', t=0.25), dict(k='heart', t=0.4, dur=round(SE(3) - 0.2, 3)),
       dict(k='wind', t=round(SS(10), 3), dur=round(SE(12) - SS(10), 3)), dict(k='wind', t=round(SS(19), 3), dur=round(SE(19) - SS(19) + 0.5, 3)),
       dict(k='boom', t=round(SS(20), 3)), dict(k='drum', t=round(SS(20) + 0.6, 3)),
       dict(k='clang', t=round(SS(24) + 0.2, 3)), dict(k='clang', t=round(W(wi(27, 'jang')), 3)),
       dict(k='gallop', t=round(W(wi(27, 'keyin')), 3), dur=round(SE(28) - W(wi(27, 'keyin')), 3)),
       dict(k='boom', t=round(SS(37), 3))]
tap = ASK_END + 26 / 30
sfx += [dict(k='click', t=round(tap - 0.02, 3)), dict(k='bell', t=round(tap + 0.12, 3))]
for sh in shots:
    if sh['img'].startswith('mo:'): sfx.append(dict(k='whoosh', t=round(sh['t0'] - 0.15, 3)))
(root / 'edit/sfx_plan_p8.json').write_text(json.dumps(dict(total=round(TOTAL + 2, 2), items=sfx)))

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'edit/music.mp3'), '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
mu = np.frombuffer(raw, dtype='<i2').astype(np.float32).reshape(-1, 2) / 32768
# the voice is longer than the song: extend on the bar grid like Part 5 (repeat the section from 36 s), start 24 s into the song
PH, XF = 0.031, 0.75
seg = lambda a, b: mu[int(a * SR):int(b * SR)]
def xjoin(x, y):
    n = int(XF * SR); r = np.linspace(0, 1, n)[:, None]
    return np.concatenate([x[:-n], x[-n:] * np.cos(r * np.pi / 2) + y[:n] * np.sin(r * np.pi / 2), y[n:]])
h = XF / 2
START = 24.0
rep = max(0, math.ceil((TOTAL + START - 13 - 96) / 3.0)) * 3.0
parts = [seg(START + PH, 96 + PH + h)]
if rep > 0: parts.append(seg(36 + PH - h, 36 + rep + PH + h))
parts.append(seg(96 + PH - h, 113))
m2 = parts[0]
for p in parts[1:]: m2 = xjoin(m2, p)
with wave.open(str(root / 'edit/music_p8.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m2, -1, 1) * 32767).astype('<i2').tobytes())
print('music %.1fs' % (len(m2) / SR))
L = [s['t1'] - s['t0'] for s in shots]
print('total %.1fs | shots %d, avg %.2fs, min %.2fs' % (TOTAL, len(shots), TOTAL / len(shots), min(L)))
print(' '.join('%s:%.1f' % (x['img'], x['t1'] - x['t0']) for x in shots))
