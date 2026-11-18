"""Part 6 "Fillar hujumi" (2026-11-18), new 45-60 s format (TEMUR.md "YANGI FORMAT"): one take public/audio6/all_raw.mp3 used UNCUT
(question included), shifted so the voice starts at 0.4 s. Big on-screen hook text, "Oldingi qismda" callback (Part 5 m16), India route map,
date cards, question card C, subscribe card with "ERTAGA 7-QISM".
Outputs: public/voice6/voice_p6.wav, src/edit_p6.json, edit/sfx_plan_p6.json, edit/music_p6.wav
"""
import json, math, pathlib, re, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
rd = lambda p: json.loads((root / p).read_text(encoding='utf-8'))
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / p), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768

w0 = rd('src/words6.json')
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
assert len(sents) == 26, len(sents)
SS = lambda n: words[sents[n - 1][0]]['s']
SE = lambda n: words[sents[n - 1][-1]]['e']
W = lambda i: words[i]['s']
E = lambda i: words[i]['e']
def wi(n, word):
    for k in sents[n - 1]:
        if re.sub(r'[.,?!:"]', '', words[k]['t']).lower().startswith(word.lower()): return k
    raise KeyError((n, word))

AV = load('public/audio6/all_raw.mp3')
out = np.zeros(int((TOTAL + 1) * SR)); s0 = int(OFF * SR)
out[s0:s0 + len(AV)] += AV[:len(out) - s0]
(root / 'public/voice6').mkdir(exist_ok=True)
with wave.open(str(root / 'public/voice6/voice_p6.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())

def bound(a):
    kind, v = a
    if kind == 't': return 0.0
    if kind == 's':
        pe = SE(v - 1) + 0.12
        return pe + 0.5 * (SS(v) - 0.12 - pe)
    return W(v) - 0.10
BUF = '17' if (root / 'public/p6img/n17.jpg').exists() else '16'
spec = [  # (anchor, img | "mo:<scene>", move, transition, grade)
    (('t', 0), '01', 'in2', 'none', 'warm'),                   # 120 jangovar fil (hook)
    (('s', 2), '02', 'in', 'fade', 'warm'),                    # askarlar filni birinchi ko'rardi
    (('s', 3), 'm16', 'inslow', 'dip', 'warm'),                # Oldingi qismda (5-qism, Temur tepalikda)
    (('s', 4), 'mo:india', 'none', 'fade', 'warm'),            # janubga, Hindistonga
    (('s', 5), '03', 'in', 'fade', 'warm'),                    # 1398
    (('s', 6), '04', 'inslow', 'fade', 'cold'),                # tog'larda qor
    (('w', wi(6, 'shunchalik')), '05', 'in', 'fade', 'cold'),       # otlar botib qolardi
    (('s', 7), '06', 'in2', 'fade', 'cold'),                   # kajavada arqonlarda
    (('w', wi(7, 'pastga')), '07', 'in', 'fade', 'cold'),      # pastga; besh marta
    (('s', 9), '08', 'out', 'dip', 'warm'),                    # Dekabr. Dehli.
    (('s', 11), '09', 'in', 'fade', 'warm'),                   # Sulton Mahmud va Mallu Xon
    (('w', wi(11, "o'n")), '10', 'inslow', 'fade', 'warm'),    # 10 ming otliq, 40 ming piyoda, 120 fil
    (('w', wi(11, 'yuz')), '11', 'in', 'fade', 'warm'),       # 120 fil; sovut
    (('s', 13), '12', 'up', 'fade', 'warm'),                   # yog'och supa, kamonchilar
    (('s', 14), '13', 'in', 'dip', 'warm'),                    # olimlardan so'raydi
    (('s', 15), '14', 'in', 'fade', 'warm'),                   # titrab
    (('s', 16), '15', 'in2', 'fade', 'warm'),                  # kulib yuboradi
    (('w', wi(17, 'qarorgoh')), '16', 'drift', 'fade', 'warm'),# xandaq
    (('s', 18), BUF, 'in', 'fade', 'warm'),                    # buyvollar
    (('s', 19), '18', 'inslow', 'dip', 'cold'),                # 17-dekabr, tong
    (('s', 21), '19', 'in2', 'fade', 'warm'),                  # fillar oldinga
    (('s', 22), '21', 'in', 'dip', 'warm'),                    # nima qildi? (Temur)
    (('s', 23), '20', 'inslow', 'fade', 'warm'),               # shahzoda filning ro'parasida
    (('s', 25), '10', 'inslow', 'dip', 'warm'),                # savol
]
bounds = [bound(a) for a, *_ in spec] + [TOTAL]
shots = [dict(t0=round(bounds[k], 3), t1=round(bounds[k + 1], 3), img=img, mv=mv, tr=trn, grade=gr)
         for k, (a, img, mv, trn, gr) in enumerate(spec)]
assert all(s['t1'] > s['t0'] for s in shots)

over = []
over.append(dict(k='hook', t0=0.25, t1=round(SE(2) + 0.2, 3), text="120", sub="JANGOVAR FIL"))
over.append(dict(k='tag', t0=round(SS(3) - 0.2, 3), t1=round(SE(4) + 0.3, 3), text="6-QISM"))
def date(n, a, text, sub=None, sub_at=None, last=None):
    i0 = wi(n, a); t1 = SE(last or n) + 0.3
    d = dict(k='date', t0=round(W(i0), 3), t1=round(t1, 3), text=text)
    if sub: d['sub'] = sub; d['sub_t'] = round(W(sub_at) - W(i0), 3) if sub_at is not None else 0.4
    over.append(d)
date(5, 'ming', "1398")
date(9, 'dekabr', "DEKABR", "DEHLI", sub_at=wi(10, 'dehli'), last=10)
date(19, "o'n", "17", "DEKABR", sub_at=wi(19, 'dekabr'), last=20)
q0 = SS(25)
over.append(dict(k='q', t0=round(q0 - 0.2, 3), t1=round(ASK_END, 3), pop=round((W(wi(25, 'fillarga')) - q0 + 0.4) * 30)))
over.append(dict(k='subend', t0=round(ASK_END, 3), t1=round(TOTAL, 3), text="ERTAGA 7-QISM"))
for a, b in ((SS(14), SE(16) + 0.3), (SS(22), SE(24) + 0.4)):
    over.append(dict(k='bars', t0=round(max(0, a), 3), t1=round(b, 3)))

FIXW = (("jangovor", "jangovar"), ("Malluxon", "Mallu Xon"), ("handaq", "xandaq"), ("dashta", "dashtda"), ("Siz-chi", "Siz-chi,"))
SKIP = set(sents[0]) | set(sents[4]) | set(sents[8]) | set(sents[9]) | set(sents[18]) | set(sents[19])   # shown by hook/date cards
toks = []
for i, x in enumerate(words):
    if i in SKIP: continue
    t = x['t']
    for a, b in FIXW:
        if t.startswith(a): t = b + t[len(a):]
    if ':"' in t:   # 'so'raydi:"Jangda' is one Scribe token: split it so the caption can break after the colon
        a, b = t.split(':"', 1); m = W(i) + (E(i) - W(i)) * len(a) / len(t)
        toks += [(W(i), m, a + ':'), (m, E(i), b)]; continue
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
(root / 'src/edit_p6.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False), encoding='utf-8')

sfx = [dict(k='boom', t=0.3), dict(k='heart', t=0.4, dur=round(SE(2) - 0.2, 3)),
       dict(k='boom', t=round(SS(9), 3)), dict(k='boom', t=round(SS(19), 3)),
       dict(k='heart', t=round(SS(21), 3), dur=round(SE(23) - SS(21) + 0.4, 3)), dict(k='boom', t=round(SS(23), 3))]
tap = ASK_END + 26 / 30
sfx += [dict(k='click', t=round(tap - 0.02, 3)), dict(k='bell', t=round(tap + 0.12, 3))]
for sh in shots:
    if sh['img'].startswith('mo:'): sfx.append(dict(k='whoosh', t=round(sh['t0'] - 0.15, 3)))
(root / 'edit/sfx_plan_p6.json').write_text(json.dumps(dict(total=round(TOTAL + 2, 2), items=sfx)))

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'edit/music.mp3'), '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
mu = np.frombuffer(raw, dtype='<i2').astype(np.float32).reshape(-1, 2) / 32768
# start 24 s into the song so the part the user likes (36 s) enters at ~12 s, under the mountains
m2 = mu[int(24.031 * SR):int((24.031 + TOTAL + 1) * SR)]
with wave.open(str(root / 'edit/music_p6.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m2, -1, 1) * 32767).astype('<i2').tobytes())
L = [s['t1'] - s['t0'] for s in shots]
print('total %.1fs | shots %d, avg %.2fs, min %.2fs' % (TOTAL, len(shots), TOTAL / len(shots), min(L)))
print(' '.join('%s:%.1f' % (x['img'], x['t1'] - x['t0']) for x in shots))
