"""Part 4 "O'zi qutqargan dushman" (2026-11-12), copied from edit_p3v2.py (Part 3 v2) (2026-11-12): expressive re-recorded narration used UNCUT (only shifted so the voice starts at 0.4 s),
motion-design inserts from src/p3motion.tsx between the stills. Based on edit_p3.py, same method as edit4.py (Part 1): beat-aligned narration, slow dissolves, full subtitles.
Inputs:  edit/transcript4.json, src/words4.json, public/voice3/all.mp3, edit/music.mp3
Outputs: public/voice4/voice_p4.wav, src/edit_p3v2.json, edit/sfx_plan_p3v2.json, edit/music_p3v2.wav (music extended on the bar grid)
"""
import json, math, pathlib, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
tr = json.loads((root / 'edit' / 'transcript4.json').read_text())
words = json.loads((root / 'src' / 'words4.json').read_text())
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
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(root / 'public/audio4/all_raw.mp3'), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
src = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768
END_HOLD = 1.9   # short end card: Part 1 retention dropped on the long black card
# outro (user's wish, 2026-11-13): a recorded question to the viewer, then a subscribe-button card
ASK_FILE = root / 'public/audio4/ask_raw.mp3'
ASK = None
if ASK_FILE.exists():
    araw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(ASK_FILE), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    av = np.frombuffer(araw, dtype='<i2').astype(np.float32) / 32768
    env = np.convolve(np.abs(av), np.ones(441) / 441, 'same'); on = np.where(env > 0.01)[0]
    av = av[max(0, on[0] - 2205):on[-1] + 4410]                        # trim silence, keep 50 ms / 100 ms
    # phrase boundaries = pauses longer than 0.25 s
    env = np.convolve(np.abs(av), np.ones(441) / 441, 'same'); quiet = env < 0.008
    ph, inp, s0 = [], False, 0
    for i in range(0, len(av), 441):
        q = quiet[i:i + 441].all()
        if not inp and not q: inp, s0 = True, i
        if inp and q:
            j = i
            while j < len(av) and quiet[j:j + 441].all(): j += 441
            if (j - i) / SR > 0.25 or j >= len(av): ph.append((s0 / SR, i / SR)); inp = False
    if inp: ph.append((s0 / SR, len(av) / SR))
    ASK = dict(t0=SE(len(sents)) + 0.6, dur=len(av) / SR, phrases=ph)
    SUB_LEN = 2.8
    TOTAL = ASK['t0'] + ASK['dur'] + 0.3 + SUB_LEN
else:
    TOTAL = SE(len(sents)) + END_HOLD
out = np.zeros(int(TOTAL * SR) + SR)
st = int(OFF * SR)
seg = src[max(0, -st):]
seg = seg[:max(0, int((SE(len(sents)) + 0.5) * SR) - max(0, st))]   # nothing from the raw file after the last sentence
out[max(0, st):max(0, st) + len(seg)] = seg[:len(out) - max(0, st)]
if ASK:
    a0 = int(ASK['t0'] * SR); out[a0:a0 + len(av)] += av
with wave.open(str(root / 'public/voice4/voice_p4.wav'), 'wb') as w:
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
    (('t', 0), '02', 'in2', 'dip', 'cold'),          # Sirdaryo bo'yi. Butazor ichida bir odam yotibdi.
    (('s', 3), '03', 'inslow', 'fade', 'cold'),      # Yalang'och, kamon o'qidan yaralangan
    (('s', 4), 'mo:line', 'none', 'fade', 'warm'),   # Chingizxon avlodidan bo'lgan shahzoda
    (('s', 5), '04', 'in2', 'fade', 'cold'),         # Ismi To'xtamish
    (('w', wi(6, 'u')), '05', 'inslow', 'fade', 'warm'),      # eng katta yaxshilik...
    (('w', wi(6, 'va')), '06', 'in', 'fade', 'cold'),  # ...va eng og'ir xiyonat
    (('s', 7), '07', 'panL', 'dip', 'warm'),         # O'rusxondan qochib, panoh so'rab
    (('s', 8), '08', 'inslow', 'fade', 'warm'),      # izzat, ziyofat
    (('s', 9), '09', 'out', 'fade', 'warm'),         # chodir, nog'ora, tuya va ot podalari
    (('s', 10), '10', 'in', 'fade', 'warm'),         # o'g'lidek ko'rdi
    (('s', 11), 'mo:lands', 'none', 'fade', 'warm'), # O'tror va Sig'noq
    (('s', 12), '11', 'in', 'dip', 'warm'),          # bas kela olmadi; bir jangda yengilib
    (('s', 13), '12', 'in2', 'fade', 'warm'),
    (('s', 14), '13', 'inslow', 'fade', 'warm'),     # kamondan o'q otildi
    (('w', wi(15, 'bek')), '14', 'inslow', 'fade', 'cold'),     # Temur yuborgan bek
    (('w', wi(15, 'uni')), '15', 'in', 'fade', 'warm'),
    (('w', wi(16, 'elchilar')), '16', 'inslow', 'dip', 'warm'),      # elchilar
    (('w', wi(18, 'ber')), '17', 'in2', 'fade', 'cold'),        # "U o'g'limni o'ldirdi..."
    (('w', wi(20, 'javob')), '18', 'in', 'fade', 'warm'),         # Temur javob beradi
    (('w', wi(22, 'bermayman')), '19', 'out', 'fade', 'cold'),        # Urush istasangiz, tayyormiz
    (('s', 24), 'mo:four', 'none', 'fade', 'warm'),  # to'rt marta qochib keldi
    (('s', 26), '20', 'inslow', 'fade', 'warm'),     # Dashti Qipchoq taxti
    (('s', 27), 'mo:horde', 'none', 'fade', 'warm'), # butun Oltin O'rda
    (('s', 28), '21', 'in2', 'dip', 'warm'),         # Jo'chi ulusining xoni
    (('s', 29), 'mo:line2', 'none', 'fade', 'warm'), # Chingiz avlodi / Temur xon bo'la olmasdi / yuqori turardi
    (('s', 32), '22', 'inslow', 'fade', 'warm'),     # bir qinga ikki qilich
    (('s', 33), 'mo:tabriz', 'none', 'dip', 'warm'), # 1385, qish: Darband -> Tabriz on the map
    (('s', 34), '23', 'panR', 'fade', 'cold'),       # Darband orqali o'tib
    (('w', wi(34, 'temurga')), '24', 'in', 'fade', 'warm'),
    (('s', 35), '25', 'inslow', 'dip', 'warm'),      # 1387, bahor. Kura
    (('s', 37), '26', 'in', 'fade', 'warm'),         # Temur buyuradi: jang qilmanglar
    (('s', 39), '27', 'in', 'fade', 'warm'),         # beklar ortga qaytadi
    (('w', wi(40, 'orqasidan')), '28', 'in2', 'fade', 'warm'),
    (('s', 41), '29', 'in', 'fade', 'warm'),         # Mironshoh
    (('s', 42), '30', 'inslow', 'fade', 'warm'),     # asirlar
    (('s', 43), '31', 'in', 'fade', 'warm'),         # "Oramizda ota-bola munosabati bor"
    (('s', 45), '32', 'inslow', 'dip', 'warm'),      # Javob o'sha yili keldi
    (('s', 46), '33', 'out', 'fade', 'warm'),        # Forsda
    (('s', 47), 'mo:invade', 'none', 'fade', 'warm'),# Movarounnahrga bostirib kirdi, Buxoro
    (('s', 49), '34', 'in', 'fade', 'warm'),         # Zanjirsaroy, Amudaryogacha
    (('s', 51), '35', 'in2', 'dip', 'cold'),         # uning uyini yondirgan edi
    (('s', 52), '36', 'inslow', 'fade', 'warm'),     # ortga qaytadi; dashtda izlash
    (('s', 54), '37', 'inslow', 'fade', 'warm'),     # Bu yurish qanday tugadi? (end card fades in after the voice)
]
bounds = []
for a, *_ in spec:
    bounds.append(0.0 if a[0] == 't' else bound(a))
bounds.append(TOTAL)
shots = []
for k, (a, img, mv, trn, gr) in enumerate(spec):
    shots.append(dict(t0=round(bounds[k], 3), t1=round(bounds[k + 1], 3), img=img, mv=mv, tr=trn, grade=gr))

# ---------- 4. overlays: top accents + full synchronized subtitles ----------
over = []
def accent(k, i0, text, sub=None, dur=3.4, sub_at=None):
    d = dict(k=k, t0=round(W(i0), 3), t1=round(W(i0) + dur, 3), text=text)
    if sub: d['sub'] = sub; d['sub_t'] = round(W(sub_at) - W(i0), 3) if sub_at is not None else 0.5
    over.append(d)
over.append(dict(k='tag', t0=0.3, t1=5.0, text="4-QISM"))
accent('name', wi(5, "to'xtamish"), "TO'XTAMISH", dur=2.2)
accent('name', wi(7, "o'rusxondan"), "O'RUSXON", dur=2.6)
accent('date', wi(33, 'ming'), "1385", "QISH", dur=SE(33) - W(wi(33, 'ming')) + 0.25, sub_at=wi(33, 'qish'))
accent('date', wi(35, 'ming'), "1387", "BAHOR", dur=SE(35) - W(wi(35, 'ming')) + 0.25, sub_at=wi(35, 'bahor'))
accent('name', wi(41, 'mironshoh'), "MIRONSHOH", dur=2.4)
if ASK:
    pq = ASK['phrases'][2][0] if len(ASK['phrases']) == 4 else ASK['dur'] * 0.45
    over.append(dict(k='q', t0=round(ASK['t0'] - 0.2, 3), t1=round(ASK['t0'] + ASK['dur'] + 0.3, 3), pop=round((pq + 0.2) * 30)))
    over.append(dict(k='subend', t0=round(ASK['t0'] + ASK['dur'] + 0.3, 3), t1=round(TOTAL, 3)))
else:
    over.append(dict(k='end', t0=round(SE(55) + 0.15, 3), t1=round(TOTAL, 3), text="KEYINGI QISMDA", sub="@unutilgan_qissalar"))
for a, b in ((SS(1) - 0.3, SE(3) + 0.3), (SS(51), SE(51) + 0.4)):
    over.append(dict(k='bars', t0=round(max(0, a), 3), t1=round(b, 3)))

# subtitle tokens: ASR spelling fixed against the script, spoken years shown as digits
FIX = {}
for k, x in enumerate(words):
    t = x['t']
    for a, b in (("Yalango'ch", "Yalang'och"), ("O'tiror", "O'tror"), ("sig'noq", "Sig'noq"), ("ordani", "O'rdani"), ("darband", "Darband"),
                 ("Movarunnahrga", "Movarounnahrga"), ("dashning", "dashtning")):
        if t.startswith(a): FIX[k] = b + t[len(a):]
MERGE = {wi(33, 'ming'): (wi(33, 'yil'), "1385-yil,"), wi(35, 'ming'): (wi(35, 'yil'), "1387-yil,"),
         wi(49, 'zanjir'): (wi(49, 'zanjir') + 1, "Zanjirsaroyini")}
toks = []; i = 0
while i < len(words):
    if i in MERGE:
        j, txt = MERGE[i]; toks.append((W(i), E(j), txt)); i = j + 1; continue
    toks.append((W(i), E(i), FIX.get(i, words[i]['t']))); i += 1
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
            c = best[i][0] + (w - target) ** 2 + (500 if j - i == 1 else 0) - (80 if ts[j - 1][2].endswith(',') and j < n else 0) + (400 if j < n and ts[j - 1][2] in ('Amir', 'Chingiz', 'Oltin', 'Dashti', 'kamon', 'ikki', "to'rt", "an'anasiga", 'bek', "Jo'chi", "qo'yib", 'u') else 0)
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
    txt = ' '.join(c[2] for c in ch)
    if txt.startswith(("1385-yil,", "1387-yil,")): continue  # shown by the date card instead
    over.append(dict(k='sub', t0=round(t0, 3), t1=round(max(t1, t0 + 0.5), 3), text=txt))

if ASK:
    TXT = ["Siz-chi?", "Temurning o'rnida bo'lganingizda...", "To'xtamishni yana kechirarmidingiz?", "Javobingizni izohda yozing."]
    ph = ASK['phrases']
    if len(ph) != len(TXT):   # fall back: spread the four lines over the clip by their length
        L = [len(t) for t in TXT]; tot = sum(L); c = 0; ph = []
        for l in L: ph.append((ASK['dur'] * c / tot, ASK['dur'] * (c + l) / tot)); c += l
    for (a0, a1), txt in zip(ph, TXT):
        over.append(dict(k='sub', t0=round(ASK['t0'] + a0 - 0.04, 3), t1=round(ASK['t0'] + a1 + 0.2, 3), text=txt))
    print('outro phrases', [(round(a, 2), round(b, 2)) for a, b in ASK['phrases']])
(root / 'src' / 'edit_p4.json').write_text(json.dumps(dict(fps=30, end=round(TOTAL, 3), shots=shots, over=over), ensure_ascii=False))

# ---------- 5. sparse sound accents ----------
sfx = [dict(k='boom', t=round(SS(6) + 0.0, 3)), dict(k='boom', t=round(W(wi(33, 'ming')), 3)), dict(k='boom', t=round(SS(51), 3)),
       dict(k='heart', t=round(0.4, 3), dur=round(SE(3) - 0.2, 3)), dict(k='heart', t=round(SS(51), 3), dur=round(SE(51) - SS(51) + 0.6, 3))]
if ASK:
    tap = ASK['t0'] + ASK['dur'] + 0.3 + 26 / 30          # SUB_TAP frame in src/p4outro.tsx
    sfx += [dict(k='click', t=round(tap - 0.02, 3)), dict(k='bell', t=round(tap + 0.12, 3))]
for sh in shots:
    if not (sh['img'] or '').startswith('mo:'): continue
    t0, d, kind = sh['t0'], sh['t1'] - sh['t0'], sh['img'][3:]
    sfx.append(dict(k='whoosh', t=round(t0 - 0.15, 3)))
    if kind in ('line', 'line2'): sfx.append(dict(k='chime', t=round(t0 + 0.9, 3)))
    if kind == 'line2': sfx.append(dict(k='snap', t=round(t0 + (52 + max(70, d * 30 * 0.42)) / 30, 3)))
    if kind == 'lands': sfx += [dict(k='thud', t=round(t0 + 0.7 + 0.5 * j, 3)) for j in range(2)]
    if kind == 'four': sfx += [dict(k='drum', t=round(t0 + 0.35 + j * (d - 0.9) / 4, 3)) for j in range(4)]
    if kind == 'horde': sfx.append(dict(k='drum', t=round(t0 + 0.3, 3)))
    if kind in ('tabriz', 'invade'): sfx.append(dict(k='gallop', t=round(t0, 3), dur=round(d, 3)))
(root / 'edit' / 'sfx_plan_p4.json').write_text(json.dumps(dict(total=round(TOTAL + 2, 2), items=sfx)))

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
with wave.open(str(root / 'edit/music_p4.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m2, -1, 1) * 32767).astype('<i2').tobytes())

print('total %.1fs | shots %d, avg %.2fs, min %.2fs | music %.1fs (repeat %.0fs)' % (TOTAL, len(shots), TOTAL / len(shots), min(s['t1'] - s['t0'] for s in shots), len(m2) / SR, rep))
print('song enters (36.03s) at sentence:', [i + 1 for i, p in enumerate(placed) if p['ns'] <= 36.03 <= p['ne'] + 0.5])
print(' '.join('%s:%.1f' % (x['img'], x['t1'] - x['t0']) for x in shots))
