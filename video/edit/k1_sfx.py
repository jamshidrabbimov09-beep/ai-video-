# Sound for the 1K celebration video (K1Video): counter ticks, boom, pops, follow click+bell -> public/k1/sfx.wav
import numpy as np, wave, sys
sys.path.insert(0, 'edit')
from follow_sfx import add_follow
SR = 48000; DUR = 27.0
out = np.zeros(int(SR * DUR))
def add(sig, t, g=1.0):
    i = int(t * SR); n = min(len(sig), len(out) - i)
    if n > 0: out[i:i + n] += sig[:n] * g
rng = np.random.default_rng(1)
def tick():
    n = int(SR * 0.03); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 3000 * t) * np.exp(-t * 250)
def boom():
    n = int(SR * 1.2); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (90 - 50 * t) * t) * np.exp(-t * 3) + rng.standard_normal(n) * np.exp(-t * 6) * 0.5) * 0.9
def pop_():
    n = int(SR * 0.12); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (500 + 2500 * t) * t) * np.exp(-t * 35) * 0.6
V0 = 4.3
# ticks follow the counter (value ~ p^0.6, so ticks get sparser)
for k in range(40):
    p = (k / 40) ** (1 / 0.6)
    add(tick(), 0.2 + p * 2.4, 0.35)
add(boom(), 2.6, 1.0)
for t0 in [2.8, 3.1, 3.4, 3.7, 3.95]: add(pop_(), t0 + 0.05, 0.7)
for t0 in [V0 + 4.77]: add(pop_(), t0, 0.8)
for t0 in [V0 + 6.74 + 0.6, V0 + 6.74 + 1.9, V0 + 6.74 + 3.3]: add(pop_(), t0, 0.7)
for i in range(5): add(pop_(), V0 + 11.8 + 0.3 + i * 0.3, 0.6)
for t0 in [V0 + 14.92, V0 + 17.1, V0 + 18.89]: add(pop_(), t0, 0.7)
add_follow(add, SR, 24.4)
out = np.clip(out * 0.5, -1, 1)
with wave.open('public/k1/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
