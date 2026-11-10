"""Part 1, final edit (V4): beat-aligned narration, slow soft-dissolve image edit, full synchronized subtitles.

Music (edit/music.mp3) is 80 BPM with beats at 0.031 + 0.75 k s (measured). Every sentence of the narration starts on a
half-beat (0.375 s grid), pauses are 0.4-0.8 s, cuts are snapped to the beat grid, no shot is shorter than ~2.3 s.
Inputs:  edit/transcript.json (sentence timings), src/words.json (word timings), public/voice/all.mp3 (narration)
Outputs: public/voice/voice4.wav  re-timed narration (sentences cut at the quietest point of each pause)
         src/edit4.json           shots + overlays + subtitle chunks for Remotion (composition Part1V4)
         edit/sfx_plan4.json      sparse sound accents (rendered by edit/sfx4.py)
Run: python3 edit/edit4.py      (or the whole pipeline: edit/build_part1.sh)
"""
import json, math, pathlib, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
tr = json.loads((root / 'edit' / 'transcript.json').read_text())
words = json.loads((root / 'src' / 'words.json').read_text())
sents = tr['sentences']
SR = 44100
PH, GRID = 0.031, 0.375

# ---------- 1. re-time sentences onto the half-beat grid ----------
HEAD, TAIL, MIN_GAP = 0.06, 0.12, 0.42
def snap_up(t): return PH + math.ceil((t - PH) / GRID - 1e-6) * GRID
def snap_near(t): return PH + round((t - PH) / GRID) * GRID

placed = []
prev_end = None
for i, s in enumerate(sents):
    ns = 0.781 if i == 0 else snap_up(prev_end + TAIL + MIN_GAP)
    ne = ns + (s['end'] - s['start'])
    placed.append(dict(os=s['start'], oe=s['end'], ns=ns, ne=ne))
    prev_end = ne

def nt(t):
    if t <= placed[0]['os']: return placed[0]['ns'] - (placed[0]['os'] - t)
    for i, p in enumerate(placed):
        if p['os'] <= t <= p['oe']: return p['ns'] + (t - p['os'])
        if i + 1 < len(placed) and p['oe'] < t < placed[i + 1]['os']:
            q = placed[i + 1]; r = (t - p['oe']) / (q['os'] - p['oe'])
            return p['ne'] + r * (q['ns'] - p['ne'])
    return placed[-1]['ne'] + (t - placed[-1]['oe'])

W = lambda i: nt(words[i]['s'])
E = lambda i: nt(words[i]['e'])
SS = lambda n: placed[n - 1]['ns']          # sentence n (1-based) start
SE = lambda n: placed[n - 1]['ne']          # sentence n end

# ---------- 2. voice track (cut at the quietest point inside every pause -> no clipped word starts) ----------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'public/voice/all.mp3'), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
src = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768
END_HOLD = 3.2
TOTAL = SE(len(sents)) + END_HOLD
out = np.zeros(int(TOTAL * SR) + SR)
def quiet_point(a, b):
    a, b = int(a * SR), int(b * SR); w = int(0.02 * SR)
    best, at = 9, (a + b) // 2
    for i in range(a, max(a + 1, b - w), int(0.005 * SR)):
        e = float(np.mean(src[i:i + w] ** 2))
        if e < best: best, at = e, i + w // 2
    return at / SR
cuts = [max(0.0, sents[0]['start'] - 0.25)]
for i in range(1, len(sents)):
    cuts.append(quiet_point(sents[i - 1]['end'] + 0.02, sents[i]['start'] - 0.02))
cuts.append(sents[-1]['end'] + 0.35)
for i, p in enumerate(placed):
    a, b = int(cuts[i] * SR), int(cuts[i + 1] * SR)
    seg = src[a:b].copy(); n = len(seg); f = int(0.015 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    st = int((p['ns'] - (p['os'] - cuts[i])) * SR)
    out[max(0, st):max(0, st) + n] += seg[max(0, -st):]
with wave.open(str(root / 'public/voice/voice4.wav'), 'wb') as w:
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

spec = [  # (anchor, img, move, transition, grade)
    (('t', 0), '01', 'inslow', 'dip', 'warm'),
    (('s', 2), '03', 'in', 'fade', 'warm'),
    (('w', 12), '22', 'in', 'fade', 'warm'),
    (('s', 3), '04', 'in2', 'fade', 'warm'),
    (('s', 4), '06', 'panL', 'fade', 'warm'),
    (('s', 5), '07', 'in', 'fade', 'cold'),
    (('s', 6), '05', 'inslow', 'fade', 'cold'),
    (('s', 7), '11', 'in', 'fade', 'warm'),
    (('s', 8), '10', 'out', 'fade', 'cold'),
    (('s', 9), '30', 'up', 'fade', 'warm'),
    (('s', 10), None, 'none', 'dip', 'warm'),
    (('s', 11), '12', 'in', 'dip', 'warm'),
    (('w', 86), '14', 'out', 'fade', 'warm'),
    (('s', 13), '15', 'inslow', 'fade', 'warm'),
    (('s', 14), '16', 'in', 'fade', 'warm'),
    (('s', 15), '19b', 'drift', 'fade', 'warm'),
    (('s', 16), '17', 'in', 'dip', 'sepia'),
    (('s', 17), '18', 'in', 'fade', 'sepia'),
    (('s', 18), '28', 'panR', 'fade', 'sepia'),
    (('s', 19), '19b', 'drift', 'fade', 'sepia'),
    (('s', 20), '20m', 'map', 'dip', 'warm'),
    (('w', 142), '21', 'in', 'fade', 'warm'),
    (('s', 22), '23', 'in', 'fade', 'warm'),
    (('s', 23), '25', 'in', 'fade', 'warm'),
    (('s', 24), '26', 'in', 'fade', 'warm'),
    (('s', 25), '31', 'out', 'fade', 'warm'),
    (('s', 26), '27', 'in', 'fade', 'warm'),
    (('s', 27), '28', 'panL', 'fade', 'warm'),
    (('s', 28), '13', 'in', 'fade', 'warm'),
    (('s', 29), '06', 'inslow', 'fade', 'cold'),
    (('w', 201), '29', 'in', 'fade', 'cold'),
    (('w', 207), '30', 'in', 'fade', 'warm'),
    (('s', 30), '33', 'out', 'dip', 'warm'),
    (('w', 223), '32', 'inslow', 'fade', 'warm'),
    (('s', 31), '32', 'faceL', 'fade', 'cold'),
    (('s', 32), None, 'none', 'dip', 'warm'),
]
bounds = []
for a, *_ in spec:
    bounds.append(0.0 if a[0] == 't' else bound(a))
bounds.append(TOTAL)
# snap cuts to the beat grid (+-0.28 s) while keeping every shot >= 2.3 s
for k in range(1, len(bounds) - 1):
    c = snap_near(bounds[k])
    if abs(c - bounds[k]) <= 0.28 and c - bounds[k - 1] >= 2.3 and bounds[k + 1] - c >= 2.3:
        bounds[k] = c
MINLEN = 2.45
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
accent('title', 21, "AMIR TEMUR", dur=2.8)
accent('date', 29, "1363", "SEISTON", dur=4.2, sub_at=36)
accent('name', 56, "TEMUR-I LANG", "Cho'loq Temur", dur=4.2, sub_at=61)
accent('date', 76, "1336", "KESH", dur=4.2, sub_at=82)
accent('date', 148, "1360", dur=2.8)
over.append(dict(k='tag', t0=round(SS(16) - 0.1, 3), t1=round(SE(19) + 0.3, 3), text="RIVOYAT"))
_m = next(x for x in shots if x['img'] == '20m')
over.append(dict(k='map', t0=round(_m['t0'], 3), t1=round(_m['t1'], 3), text=""))
over.append(dict(k='end', t0=round(SS(32) - 0.15, 3), t1=round(TOTAL, 3), text="KEYINGI QISMDA", sub="@unutilgan_qissalar"))
for a, b in ((SS(5), SE(6) + 0.3), (W(197), E(212) + 0.2), (SS(31) - 0.1, SE(31) + 0.5)):
    over.append(dict(k='bars', t0=round(a, 3), t1=round(b, 3)))

# subtitle tokens: ASR spelling fixed, spoken numbers shown as digits
FIX = {36: "Seiston", 37: "dashti,", 56: "Temur-i", 94: "Tarag'ay.", 188: "dashtlar", 200: "Seistonda", 82: "Kesh.", 15: "o'tqazdi"}
MERGE = {29: (35, "1363-yil"), 76: (81, "1336-yil,"), 148: (153, "1360-yil")}
toks = []; i = 0
while i < len(words):
    if i in MERGE:
        j, txt = MERGE[i]; toks.append((W(i), E(j), txt)); i = j + 1; continue
    toks.append((W(i), E(i), FIX.get(i, words[i]['t']))); i += 1
chunks, cur = [], []
def flush():
    global cur
    if cur: chunks.append(cur); cur = []
for t0, t1, tx in toks:
    cur.append((t0, t1, tx))
    line = ' '.join(c[2] for c in cur)
    end_sent = tx.endswith(('.', '?', '!', ':'))
    if end_sent or (tx.endswith(',') and len(line) >= 15) or len(line) >= 30 or len(cur) >= 6: flush()
flush()
for k, ch in enumerate(chunks):
    t0 = ch[0][0] - 0.04
    t1 = ch[-1][1] + 0.22
    if k + 1 < len(chunks): t1 = min(t1, chunks[k + 1][0][0] - 0.06)
    over.append(dict(k='sub', t0=round(t0, 3), t1=round(max(t1, t0 + 0.5), 3), text=' '.join(c[2] for c in ch)))

(root / 'src' / 'edit4.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False))

# ---------- 5. sparse sound accents (long tails, never stacked) ----------
sfx = [dict(k='boom', t=round(W(21), 3)), dict(k='boom', t=round(W(29), 3)), dict(k='boom', t=round(W(56), 3)),
       dict(k='heart', t=round(SS(5), 3), dur=round(SE(6) - SS(5), 3)), dict(k='heart', t=round(W(197), 3), dur=round(E(206) - W(197) + 0.5, 3))]
(root / 'edit' / 'sfx_plan4.json').write_text(json.dumps(sfx))

print('total %.1fs | shots %d, avg %.2fs, min %.2fs' % (TOTAL, len(shots), TOTAL / len(shots), min(s['t1'] - s['t0'] for s in shots)))
print('song enters (music 36.03s) at sentence:', [i + 1 for i, p in enumerate(placed) if p['ns'] <= 36.03 <= p['ne'] + 0.5])
print('s9 %.2f-%.2f  s10 start %.2f  s29 start %.2f  last end %.2f' % (placed[8]['ns'], placed[8]['ne'], SS(10), SS(29), SE(32)))
