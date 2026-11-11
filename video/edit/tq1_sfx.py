# Synthesised sound accents for "Tasavvur qil" ep.1 (no external samples).
import numpy as np, wave
SR = 48000; DUR = 62.2
out = np.zeros(int(SR * DUR))
rng = np.random.default_rng(1)
def add(sig, t, g=1.0):
    i = int(t * SR); n = min(len(sig), len(out) - i); out[i:i + n] += sig[:n] * g
def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def whoosh(d=0.35):
    n = int(SR * d); x = rng.standard_normal(n); t = np.arange(n) / n
    # band-pass sweep by moving average of varying length
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
for t in [5.2, 9.4, 21.0, 28.45, 31.8, 36.3, 43.6, 46.95, 51.3, 58.95]:
    add(whoosh(), t - 0.12, 0.35)
add(whoosh(0.5), 0.95, 0.5)          # outfit change
add(pop(700), 3.02, 0.5)             # calendar
for t in [6.88, 7.15, 7.68]: add(drum(), t, 0.9)
for i in range(10): add(pop(800 + i * 40), 10.75 + i * 0.13, 0.25)
for t in [14.3, 14.84, 16.2, 17.8]: add(pop(600), t, 0.4)
for t in [22.26, 23.0, 23.66, 24.28, 24.88, 25.5]: add(pop(1100), t, 0.4)
add(drum(55), 26.3, 0.9)             # stamp
for i in range(7): add(clink(2200 + i * 90), 44.0 + i * 2.0 / 7, 0.6)
add(drum(50), 49.68, 1.0)            # alarm
add(drum(60), 51.42, 0.8)
add(pop(900), 60.0, 0.5)
out = out / max(1e-9, np.abs(out).max()) * 0.6
with wave.open('public/tq1/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
