"""Synthesize the sound-effect track from sfx_plan.json -> sfx.wav (44.1 kHz mono). No background noise bed."""
import json, wave, numpy as np, pathlib
SR = 44100
here = pathlib.Path(__file__).resolve().parent
plan = json.loads((here / 'sfx_plan.json').read_text())
total = int((114.6 + 2) * SR)
out = np.zeros(total)
rng = np.random.default_rng(7)

def t(n): return np.arange(int(n * SR)) / SR
def env_exp(x, k): return np.exp(-k * x)

def whoosh(dur=0.6, soft=False):
    x = t(dur); n = rng.standard_normal(len(x))
    # band-limited noise swept by amplitude envelope (no steady hiss)
    from numpy.fft import rfft, irfft
    S = rfft(n); f = np.fft.rfftfreq(len(n), 1 / SR)
    S *= ((f > 400) & (f < (2500 if soft else 4500))).astype(float)
    n = irfft(S, len(n))
    e = np.sin(np.pi * x / dur) ** 2
    return n / np.max(np.abs(n)) * e * (0.35 if soft else 0.6)

def hit(dur=0.9, soft=False):
    x = t(dur)
    s = np.sin(2 * np.pi * (48 + 40 * np.exp(-12 * x)) * x) * env_exp(x, 5.0)
    s += 0.5 * np.sin(2 * np.pi * 96 * x) * env_exp(x, 9)
    c = rng.standard_normal(len(x)) * env_exp(x, 60) * 0.25
    return (s + c) * (0.55 if soft else 1.0)

def glitch(dur=0.22):
    x = t(dur); n = np.sign(np.sin(2 * np.pi * rng.uniform(300, 900) * x)) * (rng.random(len(x)) > 0.55)
    return n * env_exp(x, 12) * 0.35

def riser(dur):
    x = t(dur); f = 120 + 900 * (x / dur) ** 2
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (x / dur) ** 2 * 0.28
    return s * np.minimum(1, (dur - x) / 0.08 + 0.0) if False else s

def heart(dur):
    n = int(dur / 0.95) + 1; buf = np.zeros(int(dur * SR))
    for i in range(n):
        for off, amp in ((0.0, 1.0), (0.26, 0.7)):
            st = int((i * 0.95 + off) * SR); x = t(0.35)
            b = np.sin(2 * np.pi * 52 * x) * env_exp(x, 14) * amp * 0.9
            e = min(len(b), len(buf) - st)
            if e > 0: buf[st:st + e] += b[:e]
    fade = np.minimum(1, np.minimum(np.arange(len(buf)) / (0.6 * SR), (len(buf) - np.arange(len(buf))) / (0.8 * SR)))
    return buf * fade

def put(sig, at):
    s = int(max(0, at) * SR); e = min(total, s + len(sig))
    if e > s: out[s:e] += sig[:e - s]

for it in plan:
    k, at = it['k'], it['t']
    if k == 'whoosh': put(whoosh(0.55), at)
    elif k == 'whoosh_soft': put(whoosh(0.7, True), at)
    elif k == 'hit': put(hit(), at)
    elif k == 'hit_soft': put(hit(1.0, True), at)
    elif k == 'glitch': put(glitch(), at)
    elif k == 'riser': put(riser(it['dur']), at)
    elif k == 'heart': put(heart(it['dur']), at)

out = out / max(1e-9, np.max(np.abs(out))) * 0.9
pcm = (out * 32767).astype('<i2')
with wave.open(str(here / 'sfx.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sfx.wav', len(out) / SR, 's')
