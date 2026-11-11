"""Part 2 version of sfx4.py. Sparse accents: three soft low booms (long tails) and two heartbeat passages locked to the 80 BPM grid."""
import json, wave, numpy as np, pathlib
SR = 44100
here = pathlib.Path(__file__).resolve().parent
_p = json.loads((here / 'sfx_plan_p2.json').read_text()); plan = _p['items']
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
for it in plan:
    if it['k'] == 'boom': sig, at = boom(), it['t']
    else: sig, at = heart(it['t'], it['dur']), it['t']
    s = int(at * SR); out[s:s + len(sig)] += sig[:total - s]
out = out / max(1e-9, np.max(np.abs(out))) * 0.85
with wave.open(str(here / 'sfx_p2.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok')
