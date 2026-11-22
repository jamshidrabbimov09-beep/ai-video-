# Synthesised sound accents for the Aral Sea video ("Dengiz qayerga ketdi?"), same generators as tq4_sfx.py.
import numpy as np, wave, sys, os
SR = 48000; DUR = 95.2
out = np.zeros(int(SR * DUR)); rng = np.random.default_rng(5)
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
def waves(d):
    n = int(SR * d); x = rng.standard_normal(n); t = np.arange(n) / SR
    y = np.convolve(x, np.ones(200) / 200, 'same')
    return y * (0.6 + 0.4 * np.sin(2 * np.pi * t / 3.2)) * np.minimum(1, np.minimum(t, d - t) / 0.8) * 4
def wind(d):
    n = int(SR * d); x = rng.standard_normal(n); t = np.arange(n) / SR
    y = np.convolve(x, np.ones(40) / 40, 'same') - np.convolve(x, np.ones(400) / 400, 'same')
    return y * (0.5 + 0.5 * np.sin(2 * np.pi * t / 2.3)) * np.minimum(1, np.minimum(t, d - t) / 0.8) * 1.5

add(drum(50), 0.05, 0.8); add(wind(4.6), 0.1, 0.25)
add(pop(700), 4.0, 0.5)                                  # "?"
add(waves(6.4), 4.85, 0.35); add(drum(60), 4.86, 0.5)    # 1960
for i in range(6): add(clink(2500 + i * 90), 13.6 + i * 0.5, 0.2)   # cans
for i in range(4): add(pop(800 + i * 150), 19.6 + i * 0.45, 0.45)   # ranking rows
add(drum(65), 22.0, 0.6)
add(waves(7.5), 23.3, lambda_ := 0.3) if False else add(waves(7.5) * np.linspace(1, 0.1, int(SR * 7.5)), 23.3, 0.3)
for t in [28.16, 29.54, 31.02]: add(pop(1000), t, 0.5)
add(whoosh(0.9), 37.4, 0.4)                               # rivers turned away
add(drum(45), 40.8, 0.8)                                  # sea gone
add(pop(1200), 45.5, 0.4); add(drum(40), 46.7, 0.7)       # salt, fish dies
add(drum(70), 49.9, 0.8); add(pop(900), 50.0, 0.5)        # YOPILMAYDI
add(pop(700), 55.6, 0.5)                                  # ?!
add(drum(50), 58.4, 0.6); add(drum(40), 60.3, 0.9); add(clink(1800), 60.35, 0.5)   # 1990 lock
add(wind(6.6), 67.9, 0.35)                                # Orolqum
add(pop(900), 70.1, 0.4)
for i in range(6): add(pop(1300 + i * 80), 77.4 + i * 0.15, 0.3)   # saxaul grows
add(drum(60), 80.3, 0.5); add(pop(1500), 81.2, 0.4)       # dam, fish jumps
add(pop(900), 87.08, 0.5); add(pop(900), 88.3, 0.5)
for t in [4.8, 11.4, 18.4, 23.1, 31.9, 40.1, 45.3, 47.6, 58.3, 61.4, 67.8, 74.6, 82.1]:
    add(whoosh(), t - 0.12, 0.3)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from follow_sfx import add_follow
add_follow(add, SR, 91.9)
out = out / max(1e-9, np.abs(out).max()) * 0.6
with wave.open('public/orol/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
