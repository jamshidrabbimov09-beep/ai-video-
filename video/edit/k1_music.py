# Original cheerful backing track for the 1K video, synthesised in code (no licences, no credits) -> public/k1/music.wav
# 120 bpm, C major, I-V-vi-IV. Plucked (Karplus-Strong, dutar-like) melody, soft bass, claps, bell sparkles.
import numpy as np, wave
SR = 48000; DUR = 27.0; BEAT = 0.5; T0 = 2.6  # groove starts on the "1K" boom
out = np.zeros((int(SR * DUR), 2))
rng = np.random.default_rng(3)
def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), len(out) - i)
    if n <= 0: return
    out[i:i + n, 0] += sig[:n] * g * (1 - pan) ** 0.5 * 0.9
    out[i:i + n, 1] += sig[:n] * g * (1 + pan) ** 0.5 * 0.9
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(m, d=0.6, bright=0.5):
    f = hz(m); N = int(SR / f); n = int(SR * d)
    buf = rng.uniform(-1, 1, N); y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % N]
        buf[i % N] = 0.5 * (buf[i % N] + buf[(i + 1) % N]) * (0.994 + 0.004 * bright)
    return y * np.minimum(np.arange(n) / (SR * 0.002), 1)
def bass(m, d):
    n = int(SR * d); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return s * np.exp(-t * 3) * np.minimum(t / 0.01, 1)
def bell(m):
    n = int(SR * 1.0); t = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 4)
def clap():
    n = int(SR * 0.15); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * 30)
    for d in (0.01, 0.02): k = int(d * SR); s[k:] += rng.standard_normal(n - k) * np.exp(-t[:n - k] * 30) * 0.6
    return np.convolve(s, [1, -0.6], 'same')
def kick():
    n = int(SR * 0.3); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 25)) * t) * np.exp(-t * 9)
def hat():
    n = int(SR * 0.05); t = np.arange(n) / SR
    return np.diff(rng.standard_normal(n + 1)) * np.exp(-t * 80) * 0.5
# chord roots for C G Am F, and a bouncy 8-note melody per bar
CH = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
MEL = [[72, 74, 76, 79, 76, 74, 72, 74], [71, 74, 79, 74, 71, 74, 76, 74], [72, 76, 81, 79, 76, 74, 72, 76], [77, 76, 74, 72, 74, 76, 79, 81]]
MEL2 = [[79, None, 76, 79, 81, 79, 76, None], [79, None, 74, 79, 83, 81, 79, None], [81, None, 76, 81, 84, 83, 81, None], [81, 79, 77, 76, 77, 79, 81, 84]]
# intro (counter, 0-2.6 s): rising plucks
for k in range(10): add(pluck(60 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][k], 0.4), 0.25 * k, 0.25 * (0.5 + k / 18), pan=0.3)
add(bell(84), T0, 0.35); add(bell(91), T0, 0.2, pan=0.4)
bars = int((DUR - T0 - 1.0) / (4 * BEAT))
for b in range(bars):
    tb = T0 + b * 4 * BEAT; root, ch = CH[b % 4]; mel = (MEL if (b // 4) % 2 == 0 else MEL2)[b % 4]
    for q in range(4):
        tq = tb + q * BEAT
        add(kick(), tq, 0.55)
        add(bass(root if q % 2 == 0 else root + 7, BEAT * 0.9), tq, 0.35)
        if q in (1, 3): add(clap(), tq, 0.22)
        add(hat(), tq + BEAT / 2, 0.18, pan=0.5)
        for j, m in enumerate(ch): add(pluck(m, 0.35, 0.2), tq + BEAT / 2, 0.07, pan=-0.4 + j * 0.1)
    for e, m in enumerate(mel):
        if m is not None: add(pluck(m, 0.5, 0.8), tb + e * BEAT / 2, 0.26, pan=0.2)
    if b % 4 == 0: add(bell(84 + (b // 4) % 2 * 7), tb, 0.12, pan=-0.5)
# final hit
tend = T0 + bars * 4 * BEAT
for m in [48, 60, 64, 67, 72]: add(pluck(m, 1.5), tend, 0.25)
add(kick(), tend, 0.7); add(bell(84), tend, 0.3)
# simple room: short stereo echo
d = int(0.11 * SR); out[d:, 0] += out[:-d, 1] * 0.18; out[d:, 1] += out[:-d, 0] * 0.18
out = out / np.max(np.abs(out)) * 0.9
with wave.open('public/k1/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('bars', bars, 'end', tend)
