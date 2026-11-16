"""Synthesised beat + accents for the Bek edit (BekEdit.tsx), 120 BPM, 16 s.
Writes public/bekedit/beat.wav. Cuts in frames (30 fps): 150 180 255 285 315 390 420."""
import numpy as np, wave, os

SR = 44100
DUR = 16.0
BEAT = 0.5
N = int(SR * DUR)
out = np.zeros((N, 2))
rng = np.random.default_rng(7)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    if sig.ndim == 1:
        l, r = np.sqrt(0.5 - pan / 2), np.sqrt(0.5 + pan / 2)
        sig = np.stack([sig * l, sig * r], 1)
    out[i:i + len(sig)] += sig * gain


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def kick(d=0.35):
    n = int(SR * d); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.12)


def sub808(freq, d=0.45):
    n = int(SR * d); t = np.arange(n) / SR
    f = freq * (1 + 0.6 * np.exp(-t / 0.02))
    s = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR))
    return s * env(n, 0.003, d / 2.5)


def snare():
    n = int(SR * 0.25); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.convolve(noise, [1, -0.9], 'same')
    return (0.7 * noise * env(n, 0.001, 0.07) + 0.5 * np.sin(2 * np.pi * 190 * t) * env(n, 0.001, 0.05))


def hat(d=0.05):
    n = int(SR * d)
    s = np.diff(rng.standard_normal(n + 1))
    return s * env(n, 0.0005, d / 3)


def whoosh(d=0.45, rev=False):
    n = int(SR * d); t = np.linspace(0, 1, n)
    s = rng.standard_normal(n)
    # crude moving band: mix of differentiated and smoothed noise
    hi = np.diff(np.concatenate([[0], s]))
    lo = np.convolve(s, np.ones(30) / 30, 'same')
    mix = hi * t + lo * (1 - t) * 3
    e = np.sin(np.pi * t) ** 2
    e = e if not rev else t ** 3
    return mix * e * 0.5


def impact(d=1.6):
    n = int(SR * d); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.08)) / SR) * env(n, 0.002, 0.5)
    crack = rng.standard_normal(n) * env(n, 0.0005, 0.04)
    return np.tanh(1.5 * (boom + 0.6 * crack))


def chime(freq, d=1.8):
    n = int(SR * d); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * freq * m * t) / m for m in (1, 2.76, 5.4))
    return s * env(n, 0.002, 0.5) * 0.3


def pad(freqs, d):
    n = int(SR * d); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.3 * t)) for f in freqs)
    e = np.minimum(t / 0.8, 1) * np.minimum((d - t) / 0.8, 1)
    return s * e / len(freqs)


D2, F2, A1, C2 = 73.42, 87.31, 55.0, 65.41
# 0-5 s: rising intro on the stage, kick + whoosh on every outfit swap
add(pad([146.8, 174.6, 220.0], 5.2), 0, 0.12)
add(whoosh(5.0, rev=True), 0, 0.25)
for b in range(10):
    t = b * BEAT
    add(kick(), t, 0.8)
    add(whoosh(0.3), t - 0.05 if t else 0, 0.35, pan=0.5 if b % 2 else -0.5)
    add(hat(), t + 0.25, 0.25)
add(chime(880), 0, 0.5)

# 5-14 s: full beat
bass = [D2, D2, F2, C2, D2, D2, A1, C2]
for b in range(10, 28):
    t = b * BEAT
    if b % 2 == 0:
        add(kick(), t, 0.95)
        add(sub808(bass[(b // 2) % 8]), t, 0.55)
    else:
        add(snare(), t, 0.55)
    for h in range(4):
        add(hat(0.04), t + h * BEAT / 4, 0.18 if h % 2 else 0.28, pan=0.3)
add(pad([146.8, 174.6, 220.0, 261.6], 9.2), 5, 0.1)

# shot accents
for fr in (150, 285):
    add(impact(), fr / 30, 0.7)
for fr in (180, 255, 315, 390):
    add(whoosh(0.4), fr / 30 - 0.2, 0.6)

# logo: reverse riser, impact, ice chimes
add(whoosh(0.9, rev=True), 13.1, 0.6)
add(impact(2.0), 14.0, 1.0)
for i, f in enumerate((1318.5, 1760.0, 2093.0, 2637.0)):
    add(chime(f, 2.0), 14.0 + i * 0.07, 0.6, pan=(-0.6, 0.2, -0.2, 0.6)[i])

# fade out last 0.6 s
fade = np.ones(N); k = int(0.6 * SR); fade[-k:] = np.linspace(1, 0, k)
out *= fade[:, None]
out /= np.abs(out).max() * 1.12

os.makedirs('public/bekedit', exist_ok=True)
with wave.open('public/bekedit/beat.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok')
