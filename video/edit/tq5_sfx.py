# Synthesised sound accents for "Tasavvur qil" #5 "Chaqmoq sulton" (same generators as ep.1/ep.2).
import numpy as np, wave, sys, os
SR = 48000; DUR = 52.4
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

thunder(0.5)                                    # lightning between the rulers
for i in range(3): add(clink(1800 + i * 200), 5.0 + i * 0.06, 0.35)   # shackles
for t in [6.3, 10.9, 13.5, 16.95, 18.95, 23.85, 28.4, 32.05, 35.65, 37.25, 41.55, 44.25, 48.7]:
    add(whoosh(), t - 0.12, 0.33)
add(pop(700), 6.4, 0.5)                         # "?"
add(pop(900), 7.3, 0.5); add(pop(1000), 8.65, 0.5)   # cards 1, 2
add(drum(60), 11.0, 0.6)                        # 1402
thunder(15.95)                                  # chaqmoq
for i in range(4): add(clink(2200 + i * 150), 18.3 + i * 0.07, 0.3)   # shields fall
add(drum(55), 18.4, 0.5)
heart(19.4, 3)                                  # steel men
add(drum(50), 22.3, 0.6)                        # only the eyes
for i in range(5): add(drum(38), 24.0 + i * 0.9, 0.5)   # elephant steps
add(pop(1100), 29.4, 0.5)                       # idea
add(pop(800), 31.0, 0.45)                       # order scroll
for d in [32.7, 33.3, 33.9, 34.4]: splash(d + 0.35)    # stumps fall into the spring
add(drum(45), 35.0, 0.6)                        # no water
add(drum(50), 35.75, 0.6)
add(pop(900), 37.6, 0.45)                       # speech bubble
add(pop(1000), 43.1, 0.45)                      # arrow
for t in [44.5, 44.6, 45.8, 46.92, 47.76]: add(pop(900), t, 0.45)
add(pop(800), 48.7, 0.5)                        # end card
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from follow_sfx import add_follow
add_follow(add, SR, 49.0)
out = out / max(1e-9, np.abs(out).max()) * 0.6
os.makedirs('public/tq5', exist_ok=True)
with wave.open('public/tq5/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
