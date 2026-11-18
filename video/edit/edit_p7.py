"""Part 7 "Dehli qulaydi" (copy of edit_p6.py). Part 6 "Fillar hujumi" (2026-11-18), new 45-60 s format (TEMUR.md "YANGI FORMAT"): one take public/audio6/all_raw.mp3 used UNCUT
(question included), shifted so the voice starts at 0.4 s. Big on-screen hook text, "Oldingi qismda" callback (Part 5 m16), India route map,
date cards, question card C, subscribe card with "ERTAGA 7-QISM".
Outputs: public/voice7/voice_p7.wav, src/edit_p7.json, edit/sfx_plan_p7.json, edit/music_p7.wav
"""
import json, math, pathlib, re, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
rd = lambda p: json.loads((root / p).read_text(encoding='utf-8'))
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / p), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768

w0 = rd('src/words7.json')
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
assert len(sents) == 22, len(sents)
SS = lambda n: words[sents[n - 1][0]]['s']
SE = lambda n: words[sents[n - 1][-1]]['e']
W = lambda i: words[i]['s']
E = lambda i: words[i]['e']
def wi(n, word):
    for k in sents[n - 1]:
        if re.sub(r'[.,?!:"]', '', words[k]['t']).lower().startswith(word.lower()): return k
    raise KeyError((n, word))

AV = load('public/audio7/all_raw.mp3')
out = np.zeros(int((TOTAL + 1) * SR)); s0 = int(OFF * SR)
out[s0:s0 + len(AV)] += AV[:len(out) - s0]
(root / 'public/voice7').mkdir(exist_ok=True)
with wave.open(str(root / 'public/voice7/voice_p7.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())

def bound(a):
    kind, v = a
    if kind == 't': return 0.0
    if kind == 's':
        pe = SE(v - 1) + 0.12
        return pe + 0.5 * (SS(v) - 0.12 - pe)
    return W(v) - 0.10
spec = [  # (anchor, img | "mo:<scene>", move, transition, grade)
    (('t', 0), '01', 'in2', 'none', 'warm'),                   # Shahzoda filga qilich urdi (hook)
    (('s', 2), '02', 'in', 'fade', 'warm'),                    # 120 fil Temurniki bo'ldi
    (('s', 3), 'n01', 'inslow', 'dip', 'warm'),                # Oldingi qismda (6-qism fillar safi)
    (('s', 4), 'n19', 'in2', 'fade', 'cold'),                  # 17-dekabr; fillar oldinga
    (('s', 6), '03', 'in', 'fade', 'warm'),                    # Pir Muhammad
    (('s', 7), '04', 'in', 'fade', 'warm'),                    # kamonchilar
    (('s', 8), '05', 'in2', 'fade', 'warm'),                   # xartum
    (('s', 9), '06', 'panR', 'fade', 'warm'),                  # chekinadi
    (('s', 10), '07', 'in', 'fade', 'warm'),                   # Xalil Sulton
    (('w', wi(10, 'haydab')), '08', 'in', 'fade', 'warm'), # bobosining oldiga
    (('s', 11), '09', 'in', 'dip', 'cold'),                    # kechasi qochadi
    (('s', 12), '10', 'inslow', 'fade', 'warm'),               # Dehli taslim
    (('w', wi(12, 'lekin')), '11', 'in', 'fade', 'cold'),      # to'qnashuvlar
    (('s', 13), '12', 'out', 'fade', 'warm'),                  # talab, yoqib
    (('s', 14), '13', 'inslow', 'fade', 'warm'),               # tarixchilar fikricha
    (('s', 15), 'mo:spread', 'none', 'dip', 'warm'),           # fillar shaharlarga
    (('w', wi(15, 'sherozga')), '14', 'in', 'fade', 'warm'),                   # 1399 bahor
    (('w', wi(16, 'bahorida')), '15', 'in2', 'fade', 'warm'),      # Samarqandga kirib keladi
    (('s', 17), '16', 'in', 'fade', 'warm'),                   # shahar xalqi
    (('w', wi(17, 'lekin')), '17', 'inslow', 'dip', 'warm'),   # Temur uzoq qolmadi
    (('s', 18), '18', 'in2', 'fade', 'cold'),                  # Boyazid; keyingi qismda
    (('s', 20), '08', 'inslow', 'dip', 'warm'),                # savol
]
bounds = [bound(a) for a, *_ in spec] + [TOTAL]
shots = [dict(t0=round(bounds[k], 3), t1=round(bounds[k + 1], 3), img=img, mv=mv, tr=trn, grade=gr)
         for k, (a, img, mv, trn, gr) in enumerate(spec)]
assert all(s['t1'] > s['t0'] for s in shots)

over = []
over.append(dict(k='hook', t0=0.25, t1=round(SE(2) + 0.2, 3), text="120 FIL", sub="TEMURNIKI BO'LDI"))
over.append(dict(k='tag', t0=round(SS(3) - 0.2, 3), t1=round(SE(3) + 0.3, 3), text="7-QISM"))
def date(n, a, text, sub=None, sub_at=None, last=None, until=None):
    i0 = wi(n, a); t1 = (W(until) - 0.1) if until is not None else SE(last or n) + 0.3
    d = dict(k='date', t0=round(W(i0), 3), t1=round(t1 + 1.2 if until is not None else t1, 3), text=text)
    if sub: d['sub'] = sub; d['sub_t'] = round(W(sub_at) - W(i0), 3) if sub_at is not None else 0.4
    over.append(d)
date(4, "o'n", "17", "DEKABR", sub_at=wi(4, 'dekabr'))
date(16, 'ming', "1399", "BAHOR", sub_at=wi(16, 'bahorida'), until=wi(16, 'bahorida'))
over.append(dict(k='name', t0=round(W(wi(18, 'boyazid')), 3), t1=round(SE(19) + 0.3, 3), text="BOYAZID", sub="USMONLI SULTONI", sub_t=0.0))
q0 = SS(20)
over.append(dict(k='q', t0=round(q0 - 0.2, 3), t1=round(ASK_END, 3), pop=round((W(wi(21, 'fil')) - q0 + 0.4) * 30)))
over.append(dict(k='subend', t0=round(ASK_END, 3), t1=round(TOTAL, 3), text="TEZ ORADA 8-QISM"))
for a, b in ((SS(11), SE(11) + 0.3), (SS(13), SE(14) + 0.4)):
    over.append(dict(k='bars', t0=round(max(0, a), 3), t1=round(b, 3)))

FIXW = (("Xirot", "Hirot"), ("Dehliyni", "Dehlini"), ("sulton", "Sulton"), ("xon", "Xon"), ("usmonli", "Usmonli"))
SKIP = set(sents[0]) | set(sents[1]) | set(sents[3]) | set(range(wi(16, 'ming'), wi(16, 'bahorida')))   # shown by hook/date cards
toks = []
for i, x in enumerate(words):
    if i in SKIP: continue
    t = x['t']
    for a, b in FIXW:
        if t.startswith(a): t = b + t[len(a):]
    if ':"' in t:   # 'so'raydi:"Jangda' is one Scribe token: split it so the caption can break after the colon
        a, b = t.split(':"', 1); m = W(i) + (E(i) - W(i)) * len(a) / len(t)
        toks += [(W(i), m, a + ':'), (m, E(i), b)]; continue
    t = t.replace('Sultoni', 'sultoni')
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
(root / 'src/edit_p7.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False), encoding='utf-8')

sfx = [dict(k='boom', t=0.3), dict(k='boom', t=round(SS(4), 3)), dict(k='heart', t=round(SS(4), 3), dur=round(SE(6) - SS(4), 3)),
       dict(k='boom', t=round(SS(13), 3)), dict(k='boom', t=round(SS(18), 3))]
tap = ASK_END + 26 / 30
sfx += [dict(k='click', t=round(tap - 0.02, 3)), dict(k='bell', t=round(tap + 0.12, 3))]
for sh in shots:
    if sh['img'].startswith('mo:'): sfx.append(dict(k='whoosh', t=round(sh['t0'] - 0.15, 3)))
(root / 'edit/sfx_plan_p7.json').write_text(json.dumps(dict(total=round(TOTAL + 2, 2), items=sfx)))

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'edit/music.mp3'), '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
mu = np.frombuffer(raw, dtype='<i2').astype(np.float32).reshape(-1, 2) / 32768
# start 24 s into the song (as Part 6) so the part the user likes (36 s) enters at ~12 s, under the mountains
m2 = mu[int(24.031 * SR):int((24.031 + TOTAL + 1) * SR)]
with wave.open(str(root / 'edit/music_p7.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m2, -1, 1) * 32767).astype('<i2').tobytes())
L = [s['t1'] - s['t0'] for s in shots]
print('total %.1fs | shots %d, avg %.2fs, min %.2fs' % (TOTAL, len(shots), TOTAL / len(shots), min(L)))
print(' '.join('%s:%.1f' % (x['img'], x['t1'] - x['t0']) for x in shots))
