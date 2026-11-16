"""Part 5 "Dasht yurishi" (2026-11-15), after edit_p4.py: narration used UNCUT (only shifted so the voice starts at 0.4 s),
then the next-part teaser (hook.wav) and the outro question (ask.wav), then the subscribe card. Stills + motion scenes (src/p5motion.tsx).
Inputs:  public/voice5/all.wav, hook.wav, ask.wav (edit/voice5.py), src/words5*.json, edit/music.mp3
Outputs: public/voice5/voice_p5.wav, src/edit_p5.json, edit/sfx_plan_p5.json, edit/music_p5.wav
"""
import json, math, pathlib, re, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
PH = 0.031
rd = lambda p: json.loads((root / p).read_text(encoding='utf-8'))
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / p), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768

# ---------- 1. one timeline: main voice, teaser, question ----------
wm, wh, wa = rd('src/words5.json'), rd('src/words5_hook.json'), rd('src/words5_ask.json')
# cold open (user, 2026-11-16): "Tasavvur qiling." is dropped (that phrase belongs to the user's other format); the video opens on
# the ram's-head sentence (it is heard again later in its place), then the narration continues from "Olti oy..."
def rsents(ws):
    out, cur = [], []
    for k, x in enumerate(ws):
        cur.append(k)
        if x['t'].rstrip('"').endswith(('.', '?', '!')) and not x['t'].endswith('...'): out.append(cur); cur = []
    return out + ([cur] if cur else [])
RS = rsents(wm)
CS = next(r for r in RS if any("qo'chqor" in wm[k]['t'].lower() for k in r))
C0, C1 = wm[CS[0]]['s'], wm[CS[-1]]['e']
COLD_T, GAP = 0.4, 0.85
R2 = wm[RS[1][0]]['s']                      # raw start of "Olti oy..."
OFF = COLD_T + (C1 - C0) + GAP - R2
cold = [dict(t=wm[k]['t'], s=wm[k]['s'] - C0 + COLD_T, e=wm[k]['e'] - C0 + COLD_T) for k in CS]
wm_main = wm[RS[1][0]:]
T_HOOK = wm[-1]['e'] + OFF + 0.9
T_ASK = T_HOOK + wh[-1]['e'] + 0.6
words = cold + [dict(t=x['t'], s=x['s'] + o, e=x['e'] + o) for ws, o in ((wm_main, OFF), (wh, T_HOOK), (wa, T_ASK)) for x in ws]
SUB_LEN = 2.8
ASK_END = T_ASK + wa[-1]['e'] + 0.35
TOTAL = ASK_END + SUB_LEN

# sentences (1-based): 1..37 main, 38..42 teaser, 43..44 question
sents, cur = [], []
for i, x in enumerate(words):
    cur.append(i)
    if x['t'].rstrip('"').endswith(('.', '?', '!')):
        sents.append(cur); cur = []
if cur: sents.append(cur)
assert len(sents) == 44, len(sents)
SS = lambda n: words[sents[n - 1][0]]['s']
SE = lambda n: words[sents[n - 1][-1]]['e']
W = lambda i: words[i]['s']
E = lambda i: words[i]['e']
def wi(n, word):
    for k in sents[n - 1]:
        if re.sub(r'[.,?!:"]', '', words[k]['t']).lower().startswith(word.lower()): return k
    raise KeyError((n, word))

out = np.zeros(int((TOTAL + 1) * SR))
AV = load('public/voice5/all.wav')
def fade(x, n=int(0.02 * SR)):
    x = x.copy(); r = np.linspace(0, 1, n); x[:n] *= r; x[-n:] *= r[::-1]; return x
clips = [(fade(AV[int((C0 - 0.06) * SR):int((C1 + 0.25) * SR)]), COLD_T - 0.06),       # cold open
         (fade(AV[int((R2 - 0.12) * SR):]), OFF + R2 - 0.12),                          # narration from "Olti oy"
         (load('public/voice5/hook.wav'), T_HOOK), (load('public/voice5/ask.wav'), T_ASK)]
for a, t0 in clips:
    s = int(t0 * SR); out[s:s + len(a)] += a[:len(out) - s]
with wave.open(str(root / 'public/voice5/voice_p5.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())

# ---------- 2. shots ----------
def bound(a):
    kind, v = a
    if kind == 't': return 0.0
    if kind == 's':
        pe = SE(v - 1) + 0.12
        return pe + 0.5 * (SS(v) - 0.12 - pe)
    return W(v) - 0.10

spec = [  # (anchor, img | "mo:<scene>", move, transition, grade)
    (('t', 0), '12', 'in2', 'dip', 'warm'),                    # cold open: qo'chqor kallasi 500 tanga (coins)
    (('s', 2), '01', 'in2', 'dip', 'warm'),                    # Olti oy, cheksiz dasht (face)
    (('w', wi(2, 'suv')), '02', 'drift', 'fade', 'warm'),      # suv yo'q, non yo'q
    (('w', wi(2, 'kechasi')), '04', 'in', 'fade', 'cold'),     # kechasi deyarli qorong'i tushmaydi
    (('s', 3), '05', 'in2', 'fade', 'warm'),                   # Temur qo'shini To'xtamishni izlab
    (('s', 4), '06', 'inslow', 'dip', 'cold'),                 # 1391 boshi; elchilar keladi
    (('s', 6), '07', 'in', 'fade', 'warm'),                    # 9 ot va lochin
    (('s', 7), '08', 'inslow', 'fade', 'warm'),                # kechirim so'raydi
    (('s', 8), '09', 'in', 'fade', 'warm'),                    # mendan bexabar yomon odamlar
    (('s', 9), '10', 'in2', 'fade', 'warm'),                   # Temur javob beradi
    (('s', 10), '10', 'faceL', 'none', 'warm'),                # Endi unga ishonib bo'lmaydi
    (('s', 11), 'mo:route', 'none', 'dip', 'warm'),            # dashtga kiradi, uch hafta (21 kun)
    (('s', 13), '11', 'inslow', 'fade', 'warm'),               # otlar holdan toyadi; ochlik boshlanadi
    (('s', 15), '12', 'in2', 'fade', 'warm'),                  # qo'chqor kallasi 500 tanga
    (('s', 16), '13', 'in', 'fade', 'warm'),                   # qush tuxumi, giyohlar
    (('s', 17), '14', 'out', 'fade', 'warm'),                  # katta ov
    (('w', wi(17, "qo'shin")), '15', 'in', 'fade', 'warm'),    # ov go'shti bilan omon qoladi
    (('s', 18), '16', 'inslow', 'dip', 'warm'),                # Ulug' tog'
    (('s', 19), '17', 'in', 'fade', 'warm'),                   # tosh tashish
    (('s', 21), '18', 'up', 'fade', 'warm'),                   # "Bizdan yodgorlik bo'lsin"
    (('s', 22), 'mo:route6', 'none', 'dip', 'warm'),           # 1391, 18-iyun; Qunduzcha (117 kun)
    (('w', wi(23, 'ikki')), '20', 'out', 'fade', 'warm'),      # ikki qo'shin yuzma-yuz; dushman ko'proq
    (('s', 25), '21', 'in', 'fade', 'warm'),                   # yetti qismga bo'lib saf
    (('w', wi(25, 'keyin')), '22', 'inslow', 'fade', 'warm'),  # otdan tushib chodir tikish
    (('s', 26), '23', 'in2', 'fade', 'warm'),                  # To'xtamish hayron
    (('s', 27), 'mo:flank', 'none', 'dip', 'warm'),            # Jang boshlanadi; orqaga aylanib o'tadi
    (('w', wi(28, 'lekin')), '26', 'in2', 'fade', 'warm'),     # Temurning o'zi unga qarab otlanadi
    (('w', wi(28, 'chiday')), '27', 'in', 'fade', 'warm'),     # qochadi
    (('s', 29), 'mo:pursuit', 'none', 'fade', 'warm'),         # Itil, ya'ni Volgagacha quvish
    (('s', 30), '28', 'panR', 'fade', 'cold'),                 # oldinda daryo, orqada qilich
    (('s', 31), '29', 'inslow', 'fade', 'cold'),               # Jo'chi ulusi tarqaladi
    (('s', 32), '30', 'in', 'dip', 'cold'),                    # uch yil o'tib Kavkazga
    (('s', 33), '31', 'inslow', 'fade', 'cold'),               # 1395 (date card)
    (('s', 34), 'mo:terek', 'none', 'fade', 'warm'),           # Terek bo'yida to'qnashuv
    (('s', 35), '32', 'inslow', 'fade', 'cold'),               # yengiladi, taxtidan ayriladi
    (('s', 36), 'mo:fall', 'none', 'fade', 'warm'),            # Oltin O'rda o'ziga kela olmadi
    (('s', 37), '40', 'inslow', 'dip', 'cold'),                # Temur qutqargan odam (4-qism, butazor)
    (('w', wi(37, "o'sha")), '33', 'in', 'fade', 'warm'),      # o'sha Temurning qo'lida
    (('s', 38), '34', 'inslow', 'dip', 'warm'),                # ilgak: shimoldagi dushman yengildi
    (('s', 39), 'mo:south', 'none', 'fade', 'warm'),           # janubga: Eron va Hindiston
    (('s', 40), '35', 'in2', 'fade', 'warm'),                  # jangovar fillar; keyingi qismda
    (('s', 43), '16', 'inslow', 'dip', 'warm'),                # savol
]
bounds = [bound(a) for a, *_ in spec] + [TOTAL]
shots = [dict(t0=round(bounds[k], 3), t1=round(bounds[k + 1], 3), img=img, mv=mv, tr=trn, grade=gr)
         for k, (a, img, mv, trn, gr) in enumerate(spec)]
assert all(s['t1'] > s['t0'] for s in shots)

# ---------- 3. overlays ----------
over = []
def accent(k, i0, text, sub=None, dur=3.4, sub_at=None):
    d = dict(k=k, t0=round(W(i0), 3), t1=round(W(i0) + dur, 3), text=text)
    if sub: d['sub'] = sub; d['sub_t'] = round(W(sub_at) - W(i0), 3) if sub_at is not None else 0.5
    over.append(d)
over.append(dict(k='tag', t0=0.3, t1=5.0, text="5-QISM"))
accent('date', wi(4, 'ming'), "1391", "YIL BOSHI", dur=SE(4) - W(wi(4, 'ming')) + 0.3, sub_at=wi(4, 'boshi'))
accent('name', wi(18, "ulug'"), "ULUG' TOG'", dur=2.6)
accent('date', wi(22, 'ming'), "1391", "18-IYUN", dur=SE(22) - W(wi(22, 'ming')) + 0.3, sub_at=wi(22, "o'n"))
accent('date', wi(33, 'ming'), "1395", None, dur=SE(33) - W(wi(33, 'ming')) + 0.3)
q0 = SS(43)
over.append(dict(k='q', t0=round(q0 - 0.2, 3), t1=round(ASK_END, 3), pop=round((W(wi(43, 'olti')) - q0 + 0.4) * 30)))
over.append(dict(k='subend', t0=round(ASK_END, 3), t1=round(TOTAL, 3)))
for a, b in ((SS(1) - 0.3, SE(3) + 0.3), (SS(37), SE(37) + 0.4), (SS(40), SE(42) + 0.4)):
    over.append(dict(k='bars', t0=round(max(0, a), 3), t1=round(b, 3)))

FIXW = (("To'xtamishtan", "To'xtamishdan"), ("yamyashil", "yam-yashil"), ("jangovor", "jangovar"))
toks = []; i = 0
MERGE = {wi(4, 'ming'): (wi(4, 'boshi'), "1391-yil boshi."), wi(22, 'ming'): (wi(22, 'iyun'), "1391-yil, 18-iyun."),
         wi(33, 'ming'): (wi(33, 'yil'), "1395-yil.")}
while i < len(words):
    if i in MERGE:
        j, txt = MERGE[i]; toks.append((W(i), E(j), txt)); i = j + 1; continue
    t = words[i]['t']
    for a, b in FIXW:
        if t.startswith(a): t = b + t[len(a):]
    toks.append((W(i), E(i), t)); i += 1
NOBREAK = ('Temur', 'Oltin', 'ikki', 'yetti', 'besh', 'tosh', 'qush', 'ov', "Jo'chi", 'Itil,', 'Terek', 'u', 'uch', 'Ulug\'', 'keng', 'jang')
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
    if tk[2].rstrip('"').endswith(('.', '?', '!')) or tk[2] == 'Siz-chi,':
        chunks += split_sentence(cur); cur = []
if cur: chunks += split_sentence(cur)
for k, ch in enumerate(chunks):
    t0 = ch[0][0] - 0.04; t1 = ch[-1][1] + 0.22
    if k + 1 < len(chunks): t1 = min(t1, chunks[k + 1][0][0] - 0.06)
    txt = ' '.join(c[2] for c in ch)
    if txt.startswith(("1391-yil", "1395-yil")): continue      # shown by the date card
    over.append(dict(k='sub', t0=round(t0, 3), t1=round(max(t1, t0 + 0.5), 3), text=txt))
(root / 'src/edit_p5.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False), encoding='utf-8')

# ---------- 4. sparse sound accents ----------
sfx = [dict(k='heart', t=0.4, dur=round(SE(3) - 0.2, 3)), dict(k='boom', t=round(W(wi(22, 'ming')), 3)),
       dict(k='boom', t=round(SS(27), 3)), dict(k='boom', t=round(SS(37), 3)), dict(k='heart', t=round(SS(37), 3), dur=round(SE(37) - SS(37) + 0.6, 3)),
       dict(k='boom', t=round(W(wi(40, 'hindistonda')), 3))]
tap = ASK_END + 26 / 30
sfx += [dict(k='click', t=round(tap - 0.02, 3)), dict(k='bell', t=round(tap + 0.12, 3))]
for sh in shots:
    if not sh['img'].startswith('mo:'): continue
    t0, d, kind = sh['t0'], sh['t1'] - sh['t0'], sh['img'][3:]
    sfx.append(dict(k='whoosh', t=round(t0 - 0.15, 3)))
    if kind in ('flank', 'pursuit'): sfx.append(dict(k='gallop', t=round(t0, 3), dur=round(d, 3)))
    if kind == 'terek': sfx.append(dict(k='drum', t=round(t0 + d * 0.62, 3)))
    if kind == 'fall': sfx.append(dict(k='thud', t=round(t0 + 0.8, 3)))
(root / 'edit/sfx_plan_p5.json').write_text(json.dumps(dict(total=round(TOTAL + 2, 2), items=sfx)))

# ---------- 5. music extended on the bar grid (as Part 4) ----------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'edit/music.mp3'), '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
mu = np.frombuffer(raw, dtype='<i2').astype(np.float32).reshape(-1, 2) / 32768
BAR4 = 12.0
rep = max(0, math.ceil((TOTAL - 13 - 96) / 3.0)) * 3.0   # whole bars (3 s at 80 BPM), never shorter than the video
seg = lambda a, b: mu[int(a * SR):int(b * SR)]
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
with wave.open(str(root / 'edit/music_p5.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m2, -1, 1) * 32767).astype('<i2').tobytes())

L = [s['t1'] - s['t0'] for s in shots]
print('total %.1fs | shots %d, avg %.2fs, min %.2fs | music %.1fs' % (TOTAL, len(shots), TOTAL / len(shots), min(L), len(m2) / SR))
print(' '.join('%s:%.1f' % (x['img'], x['t1'] - x['t0']) for x in shots))
