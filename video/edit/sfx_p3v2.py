"""Part 3 version of sfx4.py. Sparse accents: three soft low booms (long tails) and two heartbeat passages locked to the 80 BPM grid."""
import json, wave, numpy as np, pathlib
SR = 44100
here = pathlib.Path(__file__).resolve().parent
_p = json.loads((here / 'sfx_plan_p3v2.json').read_text()); plan = _p['items']
total = int(_p['total'] * SR); out = np.zeros(total)
def t(n): return np.arange(int(n * SR)) / SR
def boom():
    x = t(2.8)
    s = np.sin(2 * np.pi * (46 + 30 * np.exp(-6 * x)) * x) * np.exp(-1.7 * x)
    s += 0.35 * np.sin(2 * np.pi * 92 * x) * np.exp(-3.2 * x)
    return s * np.minimum(1, x / 0.012) * 0.9
def heart(at, dur):
    n = int(dur / 0.75) + 1
    k0 = int(np.ceil((at - 0.031) / 0.75)); buf = np.zeros(int(dur * SR) + SR)
    for i in range(n):
        base = (0.031 + (k0 + i) * 0.75) - at
        if base < 0 or base > dur: continue
        for off, amp in ((0.0, 1.0), (0.22, 0.65)):
            st = int((base + off) * SR); x = t(0.45)
            b = np.sin(2 * np.pi * 50 * x) * np.exp(-9 * x) * amp * np.minimum(1, x / 0.01)
            e = min(len(b), len(buf) - st)
            if e > 0: buf[st:st + e] += b[:e]
    n = len(buf); ar = np.arange(n)
    return buf * np.minimum(1, np.minimum(ar / (0.8 * SR), (n - ar) / (1.0 * SR)))
def whoosh():
    x = t(0.9); n = np.random.default_rng(3).standard_normal(len(x))
    env = np.sin(np.pi * np.clip(x / 0.9, 0, 1)) ** 2
    b = np.convolve(n, np.ones(40) / 40, 'same')
    return b * env * 0.5
def drum():
    x = t(1.2)
    s = np.sin(2 * np.pi * (70 + 40 * np.exp(-18 * x)) * x) * np.exp(-4.5 * x)
    n = np.random.default_rng(5).standard_normal(len(x)) * np.exp(-30 * x) * 0.25
    return (s + n) * np.minimum(1, x / 0.004) * 0.8
def snap():
    x = t(0.5); n = np.random.default_rng(7).standard_normal(len(x))
    return (n * np.exp(-25 * x) * 0.6 + np.sin(2 * np.pi * 180 * x) * np.exp(-12 * x) * 0.4)
def creak():
    x = t(1.4); f = 90 + 25 * np.sin(2 * np.pi * 1.3 * x)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25
    s = np.convolve(s, np.ones(30) / 30, 'same')
    return s * np.sin(np.pi * x / 1.4) * 0.5
def chime(f0=880):
    x = t(2.6)
    s = sum(a * np.sin(2 * np.pi * f0 * m * x) * np.exp(-d * x) for m, a, d in ((1, 1, 2.2), (2.76, 0.45, 3.5), (5.4, 0.2, 6)))
    return s * np.minimum(1, x / 0.003) * 0.32
def thud():
    x = t(0.5)
    return np.sin(2 * np.pi * (95 + 60 * np.exp(-30 * x)) * x) * np.exp(-14 * x) * 0.55
def gallop(dur):
    buf = np.zeros(int(dur * SR) + SR); x = t(0.12)
    hit = np.sin(2 * np.pi * 130 * x) * np.exp(-45 * x) + np.random.default_rng(9).standard_normal(len(x)) * np.exp(-60 * x) * 0.3
    k = 0.0
    while k < dur:
        for off, a in ((0, 0.7), (0.09, 0.55), (0.2, 1.0)):
            st = int((k + off) * SR)
            if st + len(hit) < len(buf): buf[st:st + len(hit)] += hit * a
        k += 0.42
    n = len(buf); ar = np.arange(n)
    return buf * np.minimum(1, np.minimum(ar / (0.5 * SR), (n - ar) / (0.8 * SR))) * 0.3
for it in plan:
    extra = {'whoosh': whoosh, 'drum': drum, 'snap': snap, 'creak': creak, 'chime': chime, 'chime2': lambda: chime(660), 'thud': thud}
    if it['k'] in extra or it['k'] == 'gallop':
        sig = gallop(it['dur']) if it['k'] == 'gallop' else extra[it['k']]()
        s = int(it['t'] * SR); out[s:s + len(sig)] += sig[:max(0, total - s)]
        continue
    if it['k'] == 'boom': sig, at = boom(), it['t']
    else: sig, at = heart(it['t'], it['dur']), it['t']
    s = int(at * SR); out[s:s + len(sig)] += sig[:total - s]
out = out / max(1e-9, np.max(np.abs(out))) * 0.85
with wave.open(str(here / 'sfx_p3v2.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok')
