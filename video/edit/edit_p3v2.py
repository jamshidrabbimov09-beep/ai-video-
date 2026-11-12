"""Part 3 v2 (2026-11-12): expressive re-recorded narration used UNCUT (only shifted so the voice starts at 0.4 s),
motion-design inserts from src/p3motion.tsx between the stills. Based on edit_p3.py, same method as edit4.py (Part 1): beat-aligned narration, slow dissolves, full subtitles.
Inputs:  edit/transcript3v2.json, src/words3v2.json, public/voice3/all.mp3, edit/music.mp3
Outputs: public/voice3/voice_p3v2.wav, src/edit_p3v2.json, edit/sfx_plan_p3v2.json, edit/music_p3v2.wav (music extended on the bar grid)
"""
import json, math, pathlib, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
tr = json.loads((root / 'edit' / 'transcript3v2.json').read_text())
words = json.loads((root / 'src' / 'words3v2.json').read_text())
sents = tr['sentences']
SR = 44100
PH, GRID = 0.031, 0.375

# ---------- 1. re-time sentences onto the half-beat grid ----------
HEAD, TAIL, MIN_GAP = 0.06, 0.12, 0.42
def snap_up(t): return PH + math.ceil((t - PH) / GRID - 1e-6) * GRID
def snap_near(t): return PH + round((t - PH) / GRID) * GRID

OFF = 0.4 - sents[0]['start']
placed = [dict(os=x['start'], oe=x['end'], ns=x['start'] + OFF, ne=x['end'] + OFF) for x in sents]
def nt(t):
    if t <= placed[0]['os']: return placed[0]['ns'] - (placed[0]['os'] - t)
    for i, p in enumerate(placed):
        if p['os'] <= t <= p['oe']: return p['ns'] + (t - p['os'])
        if i + 1 < len(placed) and p['oe'] < t < placed[i + 1]['os']:
            q = placed[i + 1]; r = (t - p['oe']) / (q['os'] - p['oe'])
            return p['ne'] + r * (q['ns'] - p['ne'])
    return placed[-1]['ne'] + (t - placed[-1]['oe'])

import re as _re
_starts = []
_k = 0
for _x in sents:
    _starts.append(_k); _k += len(_x['text'].split())
def wi(n, word):  # index of the first word in sentence n that starts with `word`
    k0 = _starts[n - 1]; k1 = k0 + len(sents[n - 1]['text'].split())
    for k in range(k0, k1):
        if _re.sub(r"[.,?!:]", '', words[k]['t']).lower().startswith(word.lower()): return k
    raise KeyError((n, word))
W = lambda i: nt(words[i]['s'])
E = lambda i: nt(words[i]['e'])
SS = lambda n: placed[n - 1]['ns']          # sentence n (1-based) start
SE = lambda n: placed[n - 1]['ne']          # sentence n end

# ---------- 2. voice track (cut at the quietest point inside every pause -> no clipped word starts) ----------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'public/audio3/all_v2_raw.mp3'), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
src = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768
END_HOLD = 1.9   # short end card: Part 1 retention dropped on the long black card
TOTAL = SE(len(sents)) + END_HOLD
out = np.zeros(int(TOTAL * SR) + SR)
st = int(OFF * SR)
seg = src[max(0, -st):]
out[max(0, st):max(0, st) + len(seg)] = seg[:len(out) - max(0, st)]
with wave.open(str(root / 'public/voice3/voice_p3v2.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())

# ---------- 3. shots (start anchors) ----------
# anchor: ('s', n) = middle of the pause before sentence n ; ('w', i) = just before word i
def bound(a):
    kind, v = a
    if kind == 's':
        pe = SE(v - 1) + TAIL if v > 1 else 0.0
        t = pe + 0.5 * (SS(v) - 0.12 - pe)
    else:
        t = W(v) - 0.10
    return t

spec = [  # (anchor, img or "mo:<scene>", move, transition, grade)
    (('t', 0), '01', 'in2', 'dip', 'warm'),
    (('w', wi(1, 'lekin')), '03', 'inslow', 'fade', 'warm'),
    (('s', 2), '10', 'in', 'fade', 'warm'),
    (('s', 4), '02', 'out', 'fade', 'warm'),
    (('s', 5), '05', 'inslow', 'dip', 'warm'),
    (('s', 6), '06', 'in', 'fade', 'cold'),
    (('s', 8), 'mo:gather', 'none', 'fade', 'warm'),
    (('s', 9), '04', 'inslow', 'fade', 'warm'),
    (('s', 10), '11', 'inslow', 'dip', 'warm'),
    (('s', 11), 'mo:tree', 'none', 'fade', 'warm'),
    (('s', 14), '16', 'in', 'fade', 'warm'),
    (('s', 16), '17', 'out', 'dip', 'warm'),
    (('s', 17), '19', 'out', 'fade', 'warm'),
    (('s', 18), 'mo:puppet', 'none', 'fade', 'warm'),
    (('s', 20), '22', 'in2', 'dip', 'warm'),
    (('s', 22), '23', 'in', 'fade', 'warm'),
    (('s', 23), '25', 'out', 'fade', 'warm'),
    (('s', 24), 'mo:koragon', 'none', 'fade', 'warm'),
    (('s', 27), 'mo:capital', 'none', 'dip', 'warm'),
    (('s', 29), '31', 'in', 'fade', 'warm'),
    (('s', 30), '30', 'in', 'fade', 'warm'),
    (('s', 31), '32', 'in', 'fade', 'warm'),
    (('s', 32), '33', 'inslow', 'dip', 'cold'),
    (('s', 33), '34', 'in', 'fade', 'warm'),
    (('w', wi(34, 'himoya')), '35', 'out', 'fade', 'warm'),
    (('s', 35), '36', 'inslow', 'fade', 'cold'),
    (('s', 36), '01', 'in2', 'fade', 'cold'),
    (('s', 37), None, 'none', 'dip', 'warm'),
]
bounds = []
for a, *_ in spec:
    bounds.append(0.0 if a[0] == 't' else bound(a))
bounds.append(TOTAL)
# snap cuts to the beat grid (+-0.28 s) while keeping every shot >= 2.3 s
for k in range(1, len(bounds) - 1):
    c = snap_near(bounds[k])
    if False and c - bounds[k - 1] >= 2.3 and bounds[k + 1] - c >= 2.3:
        bounds[k] = c
MINLEN = 2.3
keep = [0]
for k in range(1, len(spec)):
    if bounds[k + 1] - bounds[k] < MINLEN and spec[k][1] is not None and spec[k - 1][1] is not None and k != len(spec) - 1:
        continue  # absorbed by the previous shot
    keep.append(k)
spec2 = [spec[k] for k in keep]
b2 = [bounds[k] for k in keep] + [bounds[-1]]
spec, bounds = spec2, b2
shots = []
for k, (a, img, mv, trn, gr) in enumerate(spec):
    shots.append(dict(t0=round(bounds[k], 3), t1=round(bounds[k + 1], 3), img=img, mv=mv, tr=trn, grade=gr))

# ---------- 4. overlays: top accents + full synchronized subtitles ----------
over = []
def accent(k, i0, text, sub=None, dur=3.4, sub_at=None):
    d = dict(k=k, t0=round(W(i0), 3), t1=round(W(i0) + dur, 3), text=text)
    if sub: d['sub'] = sub; d['sub_t'] = round(W(sub_at) - W(i0), 3) if sub_at is not None else 0.5
    over.append(d)
# name cards appear exactly when the name is spoken (user, chat 4); fewer words on screen: name cards without a second line, end card only after the last subtitle
# top cards never repeat what the subtitle says at the same moment (the user found double text confusing)
over.append(dict(k='tag', t0=0.3, t1=5.3, text="3-QISM"))
accent('date', wi(5, 'ming'), "1370", "BAHOR. BALX", dur=4.0, sub_at=wi(5, 'bahor'))
accent('name', wi(16, 'suyurg'), "SUYURG'ATMISH", dur=3.0)
accent('name', wi(21, 'saroy'), "SAROYMULKXONIM", dur=3.0)
accent('name', wi(33, "to'xtamish"), "TO'XTAMISH", dur=3.0)
over.append(dict(k='end', t0=round(SE(37) + 0.15, 3), t1=round(TOTAL, 3), text="KEYINGI QISMDA", sub="@unutilgan_qissalar"))
for a, b in ((SS(6), SE(6) + 0.3), (SS(35), SE(36) + 0.4)):
    over.append(dict(k='bars', t0=round(a, 3), t1=round(b, 3)))

# subtitle tokens: ASR spelling fixed against the script, spoken years shown as digits
FIX = {}
MERGE = {wi(5, 'ming'): (wi(5, 'yil'), "1370-yil,"), wi(21, 'saroy'): (wi(21, 'saroy') + 2, "Saroymulkxonimga"), wi(22, 'qozon'): (wi(22, 'qozon') + 1, "Qozonxonning")}
toks = []; i = 0
while i < len(words):
    if i in MERGE:
        j, txt = MERGE[i]; toks.append((W(i), E(j), txt)); i = j + 1; continue
    toks.append((W(i), E(i), FIX.get(i, words[i]['t']))); i += 1
# balanced chunks per sentence: 2-5 words, about 26 characters, no one-word leftovers, breaks preferred after commas
def split_sentence(ts):
    n = len(ts); L = [len(t[2]) for t in ts]
    width = lambda i, j: sum(L[i:j]) + (j - i - 1)
    if width(0, n) <= 30 and n <= 6: return [ts]
    k = max(2, math.ceil(width(0, n) / 26))
    target = width(0, n) / k
    best = {0: (0.0, [])}
    for j in range(1, n + 1):
        cand = None
        for i in range(max(0, j - 6), j):
            if i not in best: continue
            w = width(i, j)
            if w > 36 and j - i > 1: continue
            c = best[i][0] + (w - target) ** 2 + (500 if j - i == 1 else 0) - (80 if ts[j - 1][2].endswith(',') and j < n else 0) + (400 if j < n and ts[j - 1][2] in ('Amir', 'Chingiz') else 0)
            if cand is None or c < cand[0]: cand = (c, best[i][1] + [(i, j)])
        if cand: best[j] = cand
    return [ts[i:j] for i, j in best[n][1]]
chunks, cur = [], []
for tk in toks:
    cur.append(tk)
    if tk[2].endswith(('.', '?', '!', ':')):
        chunks += split_sentence(cur); cur = []
if cur: chunks += split_sentence(cur)
for k, ch in enumerate(chunks):
    t0 = ch[0][0] - 0.04
    t1 = ch[-1][1] + 0.22
    if k + 1 < len(chunks): t1 = min(t1, chunks[k + 1][0][0] - 0.06)
    if ' '.join(c[2] for c in ch).startswith(("1370-yil,", "bahor, Balx", "Balx.")): continue  # shown by the date card instead
    over.append(dict(k='sub', t0=round(t0, 3), t1=round(max(t1, t0 + 0.5), 3), text=' '.join(c[2] for c in ch)))

(root / 'src' / 'edit_p3v2.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False))

# ---------- 5. sparse sound accents ----------
sfx = [dict(k='boom', t=round(W(wi(5, 'ming')), 3)), dict(k='boom', t=round(SS(35), 3)),
       dict(k='heart', t=round(SS(35), 3), dur=round(SE(36) - SS(35) + 0.5, 3))]
# motion scenes get their own soft sounds (synthesised in sfx_p3v2.py; Openverse sounds could not be downloaded here)
for sh in shots:
    if not (sh['img'] or '').startswith('mo:'): continue
    t0, d, kind = sh['t0'], sh['t1'] - sh['t0'], sh['img'][3:]
    sfx.append(dict(k='whoosh', t=round(t0 - 0.15, 3)))
    if kind == 'gather': sfx += [dict(k='drum', t=round(t0 + 0.3 + 0.75 * j, 3)) for j in range(4)]
    if kind == 'tree': sfx.append(dict(k='snap', t=round(t0 + max(80, d * 30 * 0.5) / 30 + 52 / 30, 3)))
    if kind == 'puppet': sfx.append(dict(k='creak', t=round(t0 + 0.6, 3)))
    if kind == 'koragon': sfx += [dict(k='chime', t=round(t0 + 1.55, 3)), dict(k='chime2', t=round(t0 + 54 / 30 + 0.5, 3))]
    if kind == 'capital': sfx += [dict(k='thud', t=round(t0 + 52 / 30 + j * (d - 52 / 30 - 0.4) / 6, 3)) for j in range(6)]
    if kind == 'rider': sfx.append(dict(k='gallop', t=round(t0, 3), dur=round(d, 3)))
(root / 'edit' / 'sfx_plan_p3v2.json').write_text(json.dumps(dict(total=round(TOTAL + 2, 2), items=sfx)))

# ---------- 6. music extended on the bar grid: 0-96 s, the song section again (36 s onward), then the outro (96-112 s) ----------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'edit/music.mp3'), '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
mu = np.frombuffer(raw, dtype='<i2').astype(np.float32).reshape(-1, 2) / 32768
BAR4 = 12.0
rep = max(0, round((TOTAL - 13 - 96) / BAR4)) * BAR4       # length of the repeated song part
def seg(a, b): return mu[int(a * SR):int(b * SR)]
XF = 0.75
def xjoin(x, y):
    n = int(XF * SR); r = np.linspace(0, 1, n)[:, None]
    return np.concatenate([x[:-n], x[-n:] * np.cos(r * np.pi / 2) + y[:n] * np.sin(r * np.pi / 2), y[n:]])
h = XF / 2
parts = [seg(0, 96 + PH + h)]
if rep > 0: parts.append(seg(36 + PH - h, 36 + rep + PH + h))
parts.append(seg(96 + PH - h, 113))
m2 = parts[0]
for p in parts[1:]: m2 = xjoin(m2, p)
with wave.open(str(root / 'edit/music_p3v2.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m2, -1, 1) * 32767).astype('<i2').tobytes())

print('total %.1fs | shots %d, avg %.2fs, min %.2fs | music %.1fs (repeat %.0fs)' % (TOTAL, len(shots), TOTAL / len(shots), min(s['t1'] - s['t0'] for s in shots), len(m2) / SR, rep))
print('song enters (36.03s) at sentence:', [i + 1 for i, p in enumerate(placed) if p['ns'] <= 36.03 <= p['ne'] + 0.5])
print(' '.join('%s:%.1f' % (x['img'], x['t1'] - x['t0']) for x in shots))
