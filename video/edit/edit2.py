"""Part 1, version 3: beat-aligned voice timeline + slower soft-dissolve edit.

Music is 80 BPM with beats at 0.031 + 0.75 k s (measured). Every sentence of the narration starts on a half-beat (0.375 s grid),
pauses are 0.4-0.8 s, cuts are snapped to the beat grid. Writes:
  public/voice/voice3.wav   re-timed narration
  src/edit3.json            shots + overlays for Remotion (Part1V3)
  edit/sfx_plan3.json       sparse sound accents
Run: python3 edit/edit2.py
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

# ---------- 2. voice track ----------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'public/voice/all.mp3'), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
src = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768
END_HOLD = 3.2
TOTAL = SE(len(sents)) + END_HOLD
out = np.zeros(int(TOTAL * SR) + SR)
for p in placed:
    a, b = int((p['os'] - HEAD) * SR), int((p['oe'] + TAIL) * SR)
    seg = src[max(0, a):b].copy()
    n = len(seg); f = int(0.012 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    st = int((p['ns'] - HEAD) * SR)
    out[st:st + n] += seg
with wave.open(str(root / 'public/voice/voice3.wav'), 'wb') as w:
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
    (('w', 218), '27', 'inslow', 'fade', 'cold'),
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
shots = []
for k, (a, img, mv, trn, gr) in enumerate(spec):
    shots.append(dict(t0=round(bounds[k], 3), t1=round(bounds[k + 1], 3), img=img, mv=mv, tr=trn, grade=gr))

# ---------- 4. overlays (all text is pinned to the spoken word) ----------
over = []
def cap(i0, i1, text, sub=None, sub_at=None, tail=0.35, k='cap'):
    d = dict(k=k, t0=round(W(i0), 3), t1=round(E(i1) + tail, 3), text=text)
    if sub: d['sub'] = sub; d['sub_t'] = round(W(sub_at) - W(i0), 3) if sub_at is not None else 0.4
    over.append(d)
cap(7, 11, "NA XON, NA CHINGIZ AVLODI")
over.append(dict(k='title', t0=round(W(21), 3), t1=round(W(21) + 2.7, 3), text="AMIR TEMUR"))
cap(26, 28, "BIR O'QDAN TUG'ILGAN", tail=0.45)
cap(29, 38, "1363", sub="SEISTON", sub_at=36, k='date', tail=0.2)
cap(56, 62, "TEMUR-I LANG", sub="Cho'loq Temur", sub_at=61, tail=0.9)
cap(70, 72, "TIZ CHO'KISHNI BILMAYDI", tail=0.4)
cap(74, 75, "BOSHIDAN BOSHLAYMIZ", k='mid', tail=0.4)
cap(76, 82, "1336", sub="KESH", sub_at=82, k='date', tail=0.3)
cap(86, 87, "BARLOS QABILASI", tail=0.3)
cap(92, 94, "KICHIK AMIR TARAG'AY", tail=0.5)
cap(95, 99, "SANA MANBALARDA HAR XIL", tail=0.3)
cap(106, 109, "AYNAN SHU KUNI - DEMAYMIZ", k='mid', tail=0.5)
over.append(dict(k='tag', t0=round(SS(16) - 0.1, 3), t1=round(SE(19) + 0.3, 3), text="RIVOYAT"))
cap(129, 132, "RIVOYAT HALI TARIX EMAS", k='mid', tail=0.5)
over.append(dict(k='map', t0=round(shots[20]['t0'], 3), t1=round(shots[20]['t1'], 3), text=""))
cap(135, 135, "MOVAROUNNAHR", tail=1.2)
cap(138, 139, "MO'G'UL XONLARI", tail=0.4)
cap(148, 153, "1360", k='date', tail=0.2)
cap(156, 157, "TUG'LUQ TEMUR", tail=0.6)
cap(162, 163, "YOSH TEMUR", tail=0.5)
cap(169, 170, "XIYONAT?", tail=0.3)
cap(172, 172, "AQL?", tail=0.6)
cap(176, 177, "YO'LINI O'ZGARTIRDI", tail=0.4)
cap(181, 182, "AMIR HUSAYN", tail=0.6)
cap(196, 196, "TO'XTAMADI", tail=0.5)
cap(200, 200, "SEISTON", tail=1.0)
cap(211, 212, "TARK ETMADI", tail=0.5)
cap(214, 217, "HECH KIM TANIMASDI", tail=0.4)
cap(219, 220, "BU ITTIFOQ", tail=0.3)
cap(224, 226, "ENG KATTA XAVF", tail=0.5)
over.append(dict(k='ask', t0=round(W(228), 3), t1=round(E(232) + 0.8, 3), text="DO'ST DUSHMANGA AYLANGANDA NIMA BO'LADI?"))
over.append(dict(k='end', t0=round(SS(32) - 0.15, 3), t1=round(TOTAL, 3), text="KEYINGI QISMDA", sub="@unutilgan_qissalar"))
for a, b in ((SS(5), SE(6) + 0.3), (W(197), E(212) + 0.2), (SS(31) - 0.1, SE(31) + 0.5)):
    over.append(dict(k='bars', t0=round(a, 3), t1=round(b, 3)))

# make sure no two captions overlap in time
caps = sorted([o for o in over if o['k'] in ('cap', 'date', 'mid', 'title', 'ask')], key=lambda o: o['t0'])
for a, b in zip(caps, caps[1:]):
    if a['t1'] > b['t0'] - 0.05: a['t1'] = round(b['t0'] - 0.05, 3)

(root / 'src' / 'edit3.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False))

# ---------- 5. sparse sound accents (long tails, never stacked) ----------
sfx = [dict(k='boom', t=round(W(21), 3)), dict(k='boom', t=round(W(29), 3)), dict(k='boom', t=round(W(56), 3)),
       dict(k='heart', t=round(SS(5), 3), dur=round(SE(6) - SS(5), 3)), dict(k='heart', t=round(W(197), 3), dur=round(E(206) - W(197) + 0.5, 3))]
(root / 'edit' / 'sfx_plan3.json').write_text(json.dumps(sfx))

print('total %.1fs | shots %d, avg %.2fs, min %.2fs' % (TOTAL, len(shots), TOTAL / len(shots), min(s['t1'] - s['t0'] for s in shots)))
print('song enters (music 36.03s) at sentence:', [i + 1 for i, p in enumerate(placed) if p['ns'] <= 36.03 <= p['ne'] + 0.5])
print('s9 %.2f-%.2f  s10 start %.2f  s29 start %.2f  last end %.2f' % (placed[8]['ns'], placed[8]['ne'], SS(10), SS(29), SE(32)))
