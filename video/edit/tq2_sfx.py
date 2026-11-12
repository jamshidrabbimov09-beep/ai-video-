# Synthesised sound accents for "Tasavvur qil" ep.2 (same generators as ep.1).
import numpy as np, wave
SR = 48000; DUR = 64.0
out = np.zeros(int(SR * DUR)); rng = np.random.default_rng(2)
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
def buzz():
    n = int(SR * 0.35); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 110 * t)) * env(n, 0.005, 0.15) * 0.4
for t in [4.4, 6.6, 8.6, 12.2, 22.7, 24.85, 30.9, 34.3, 39.8, 46.65, 49.85, 57.1]:
    add(whoosh(), t - 0.12, 0.35)
add(pop(700), 3.1, 0.5)
for t in [4.5, 5.28, 5.78]: add(pop(800), t, 0.45)
for i in range(6): add(clink(1800 + i * 50), 10.1 + i * 0.39, 0.35)   # hammer
add(drum(60), 11.36, 0.9)
for t in [16.34, 19.22, 21.5]: add(buzz(), t, 0.6)
add(pop(1200), 24.22, 0.6)
for t in [27.6, 28.06, 29.54, 35.1, 36.3]: add(pop(1000), t, 0.45)
add(drum(55), 41.3, 0.7)
add(drum(50), 45.4, 0.8)
for t in [49.92, 52.34, 55.34]: add(drum(65), t, 0.85)
for t in [59.55, 60.1, 61.0]: add(pop(900), t, 0.5)
out = out / max(1e-9, np.abs(out).max()) * 0.6
with wave.open('public/tq2/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
