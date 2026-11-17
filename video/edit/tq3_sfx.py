# Synthesised sound accents for "Tasavvur qil" ep.3 "Qanotli askarlar" (same generators as ep.1/ep.2).
import numpy as np, wave, sys, os
SR = 48000; DUR = 80.6
out = np.zeros(int(SR * DUR)); rng = np.random.default_rng(3)
def add(sig, t, g=1.0):
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

# hook: low hit on the first frame, long whoosh while the camera pulls back
add(drum(50), 0.05, 0.9)
add(whoosh(1.6), 0.4, 0.45)
add(whoosh(1.2), 4.9, 0.3)
for t in [10.85, 12.55, 19.4, 36.6, 42.7, 47.1, 53.15, 64.3]:
    add(whoosh(), t - 0.12, 0.35)
add(drum(60), 8.96, 0.8)            # Iskandar
add(pop(700), 11.0, 0.5)            # "?"
add(pop(1100), 17.14, 0.5)          # wings
add(drum(55), 19.98, 0.8)           # angry
for i in range(5): add(clink(2600 + i * 120), 22.96 + i * 0.07, 0.35)   # coins
add(drum(45), 24.3, 0.7)            # "Tun."
for i in range(8): add(clink(1700 + (i % 3) * 90), 28.84 + i * 0.4, 0.3)   # pegs hammered
add(whoosh(0.8), 33.42, 0.45)       # a climber falls
add(drum(40), 34.24, 0.5)
for i in range(5): add(pop(900 + i * 60), 39.52 + i * 0.1, 0.3)   # men on the peak
add(drum(65), 45.04, 0.8); add(pop(1200), 45.06, 0.4)              # winged soldiers
add(pop(800), 48.86, 0.5)           # magnifier
add(drum(50), 52.24, 0.8)           # surrender
add(pop(1000), 53.26, 0.5)          # "!"
add(pop(900), 55.22, 0.45)          # Ravshanak
for i in range(3): add(clink(3000 + i * 300), 57.56 + i * 0.08, 0.3)
add(pop(700), 58.4, 0.4)
add(pop(1300), 60.18, 0.5)          # heart
for i in range(3): add(clink(2800 + i * 250), 62.82 + i * 0.08, 0.3)
for i in range(3): add(pop(800 + i * 100), 64.5 + i * 0.12, 0.4)
for t in [67.47, 69.37, 71.99, 74.49]: add(pop(900), t, 0.5)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from follow_sfx import add_follow
add_follow(add, SR, 77.4)
out = out / max(1e-9, np.abs(out).max()) * 0.6
os.makedirs('public/tq3', exist_ok=True)
with wave.open('public/tq3/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
