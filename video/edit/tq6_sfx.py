# Synthesised sound accents for "Tasavvur qil" #6 "Sen Boyazidsan" (same generators as ep.1/ep.2).
import numpy as np, wave, sys, os
SR = 48000; DUR = 93.3
out = np.zeros(int(SR * DUR)); rng = np.random.default_rng(3)
def add(sig, t, g=1.0):
    # main-take timebase -> final (two re-recorded 'Boyazid' words)
    t = t if t < 1.85 else (t + 0.112 if t < 82.12 else t + 0.336)
    i = int(t * SR); n = min(len(sig), len(out) - i); out[i:i + n] += sig[:n] * g
def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def whoosh(d=0.35):
    n = int(SR * d); x = rng.standard_normal(n); t = np.arange(n) / n
    y = np.convolve(x, np.ones(12) / 12, 'same') - np.convolve(x, np.ones(60) / 60, 'same')
    return y * np.sin(np.pi * t) ** 2 * 0.5
def drum(f=70):
    n = int(SR * 0.6); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f * t + 40 * (1 - np.exp(-t * 30)) / 30)) * env(n, 0.002, 0.18)
def pop(f=900):
    n = int(SR * 0.12); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t * (1 + 2 * np.exp(-t * 60))) * env(n, 0.001, 0.03)
def clink(f=2400):
    n = int(SR * 0.3); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.7 * t)) * env(n, 0.001, 0.07) * 0.5

def thunder(t0):
    n = int(SR * 1.4); x = rng.standard_normal(n); tt = np.arange(n) / SR
    y = np.convolve(x, np.ones(200) / 200, 'same') * np.exp(-tt / 0.45) * 3
    add(y, t0, 0.5); add(drum(42), t0, 0.8)
def splash(t0):
    n = int(SR * 0.4); x = rng.standard_normal(n); tt = np.arange(n) / SR
    add((np.convolve(x, np.ones(6) / 6, 'same')) * np.exp(-tt / 0.08) * 0.6, t0, 0.5); add(drum(90), t0, 0.4)
def heart(t0, n):
    for i in range(n):
        add(drum(48), t0 + i * 0.84, 0.55); add(drum(44), t0 + i * 0.84 + 0.22, 0.35)

for i in range(5): add(drum(40), 0.3 + i * 0.85, 0.45)     # Temur's army approaching
add(pop(900), 0.15, 0.5)                                   # 3 KUN
add(pop(1200), 1.2, 0.4)                                   # wink
for t in [4.8, 7.4, 10.0, 17.7, 20.3, 31.7, 41.9, 51.8, 55.6, 60.4, 65.8, 72.5, 81.8]:
    add(whoosh(), t - 0.12, 0.33)
add(pop(800), 5.7, 0.45); add(pop(1000), 5.9, 0.4)         # map labels
thunder(9.15)
for t in [11.7, 13.65, 15.65]: add(pop(900), t, 0.5)
add(drum(45), 18.4, 0.8)                                   # TAXMIN stamp
for t in [20.4, 31.8, 42.0]: add(pop(1000), t, 0.45)       # way badges
add(pop(900), 24.4, 0.45)
for i in range(4): add(drum(38), 29.0 + i * 0.7, 0.5)      # elephant
add(drum(55), 36.3, 0.5)                                   # villages burn
add(pop(800), 45.4, 0.45); add(drum(60), 46.78, 0.6)       # KAMAX
add(pop(1100), 48.6, 0.4); add(pop(700), 50.7, 0.5)
add(drum(60), 51.95, 0.8); add(pop(900), 54.6, 0.4)        # TARIX SHUNDAY BO'LGAN
for d in [57.6, 58.3, 59.0, 59.5]: splash(d + 0.35)
add(drum(45), 62.6, 0.6)
heart(65.9, 3)
add(drum(70), 70.46, 0.8)
for i in range(3): add(clink(2600 + i * 200), 71.0 + i * 0.07, 0.35)   # Sulton Mahmudxon
add(pop(900), 77.9, 0.45); add(drum(55), 79.0, 0.5)
for i in range(4): add(clink(2400 + i * 150), 80.4 + i * 0.07, 0.35)   # royal robe
for t in [81.95, 82.07, 82.19]: add(pop(900), t, 0.45)
for t in [84.3, 85.1, 86.1, 86.9]: add(pop(1000), t, 0.45)
add(drum(60), 88.4, 0.6)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from follow_sfx import add_follow
add_follow(add, SR, 89.4)
out = out / max(1e-9, np.abs(out).max()) * 0.6
with wave.open('public/tq6/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
