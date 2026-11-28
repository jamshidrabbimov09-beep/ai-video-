# Sound design for zombie series part 1 (cinematic: hum, heartbeat, two-tone siren, phone rings, call drop).
import numpy as np, wave
SR = 48000; DUR = 82.0; GAP = 1.5
out = np.zeros(int(SR * DUR)); rng = np.random.default_rng(7)
def add(sig, t, g=1.0):
    t = t + GAP if t >= 63.0 else t
    i = int(t * SR); n = min(len(sig), len(out) - i); out[i:i + n] += sig[:n] * g
def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def fade(y, f=0.4):
    n = len(y); k = int(SR * f); w = np.ones(n); w[:k] = np.linspace(0, 1, k); w[-k:] = np.linspace(1, 0, k); return y * w
def drum(f=55, d=0.25):
    n = int(SR * 0.6); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f * t + 30 * (1 - np.exp(-t * 30)) / 30)) * env(n, 0.002, d)
def heart(t0, n, bpm=70, g=0.7):
    for i in range(n):
        add(drum(48), t0 + i * 60 / bpm, g); add(drum(44), t0 + i * 60 / bpm + 0.22, g * 0.6)
def drone(d, f=55):
    n = int(SR * d); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t + np.sin(t * 0.7)) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)
    return fade(y * 0.25, 1.0)
def siren(d):
    n = int(SR * d); t = np.arange(n) / SR
    f = 650 + 250 * np.sign(np.sin(2 * np.pi * t / 1.4))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * 0.6 + 0.3 * np.sin(2 * ph)
    y = np.convolve(y, np.ones(30) / 30, 'same')
    return fade(y * 0.35, 0.6)
def ring(t0):
    n = int(SR * 1.0); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * 425 * t)) * (t < 0.8) * 0.3
    add(y, t0)
def beeps(t0):
    for i in range(3):
        n = int(SR * 0.18); t = np.arange(n) / SR; add(np.sin(2 * np.pi * 480 * t) * 0.3, t0 + i * 0.3)
def noise_hit(d=0.6):
    n = int(SR * d); return rng.standard_normal(n) * env(n, 0.002, 0.15) * 0.5

# 0-3.6 bedroom: low drone + game blips
add(drone(4.0, 45), 0, 0.8)
for i in range(6): add(drum(200 + i * 30, 0.05), 0.3 + i * 0.28, 0.25)
# 3.6 cut to black: silence then heartbeat
heart(4.2, 4, 64, 0.5)
# 7.62 siren
add(noise_hit(), 7.6, 0.8); add(drum(40, 0.4), 7.62, 1.0)
add(siren(27.0), 7.62, 0.9)
add(drone(30, 41), 8.0, 0.5)
# phone rings and pickup
ring(34.4); ring(35.8); ring(39.6)
add(drum(900, 0.02), 40.9, 0.4)
heart(37.0, 4, 80, 0.45)
# call drops
beeps(62.4)
add(drone(8, 38), 63.0, 0.6)
heart(70.0, 6, 90, 0.6)
add(noise_hit(1.0), 73.3, 0.9); add(drum(36, 0.5), 73.3, 1.0)
out = out / max(1e-9, np.abs(out).max()) * 0.7
with wave.open('public/zq1/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
