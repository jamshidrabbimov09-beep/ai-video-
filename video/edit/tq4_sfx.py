# Synthesised sound accents for "Tasavvur qil" ep.4 "Chingizxonning o'ng qo'li" (same generators as ep.1/ep.2).
import numpy as np, wave, sys, os
SR = 48000; DUR = 81.6
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

def heart(t0, n):
    for i in range(n):
        add(drum(48), t0 + i * 0.84, 0.55); add(drum(44), t0 + i * 0.84 + 0.22, 0.35)

add(drum(50), 0.05, 0.8)
add(whoosh(0.7), 2.2, 0.55)            # arrow flies
add(drum(80), 2.85, 0.8); add(pop(600), 2.86, 0.4)   # it hits the horse
add(pop(1100), 3.86, 0.5)              # green tick
for i in range(4): add(clink(2600 + i * 120), 6.2 + i * 0.07, 0.3)   # coins
add(drum(45), 8.1, 0.9)                # red cross
for t in [4.55, 9.35, 14.4, 19.5, 23.8, 26.6, 32.1, 40.1, 44.2, 47.95, 54.6, 59.45, 62.1, 67.3]:
    add(whoosh(), t - 0.12, 0.33)
add(pop(700), 9.42, 0.5)               # "?"
add(pop(900), 11.4, 0.4)               # arrow marker on Bek
add(drum(55), 18.7, 0.5)               # they bow
add(whoosh(0.9), 21.3, 0.45); add(drum(75), 22.4, 0.6)   # the arrow from the mountain
add(pop(700), 22.6, 0.45)
heart(23.9, 3)                          # silence
add(drum(60), 28.46, 0.6)              # "Men tekkizdim"
add(pop(1200), 37.5, 0.5)              # friend
add(drum(65), 40.24, 0.8)
for i in range(3): add(clink(2800 + i * 250), 40.26 + i * 0.08, 0.3)   # JEBE name card
add(pop(1000), 42.62, 0.4)             # star
add(drum(40), 45.06, 0.8)              # thunder: most frightening
add(pop(800), 47.0, 0.5)               # +4
for i in range(4): add(clink(2600 + i * 120), 53.0 + i * 0.07, 0.3)   # dream of coins
heart(54.8, 3)
add(drum(45), 57.44, 0.8)              # verdict
add(drum(40), 59.6, 0.8)               # red cross
add(drum(55), 64.0, 0.5); add(pop(900), 65.6, 0.4)   # the scale tips
for t in [70.2, 71.74, 73.56, 75.48]: add(pop(900), t, 0.5)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from follow_sfx import add_follow
add_follow(add, SR, 78.4)
out = out / max(1e-9, np.abs(out).max()) * 0.6
os.makedirs('public/tq4', exist_ok=True)
with wave.open('public/tq4/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
