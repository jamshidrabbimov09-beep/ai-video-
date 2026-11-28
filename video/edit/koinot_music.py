# Synthesised space ambient for the Koinot video (36 s): pad chords, drone, shimmer and whooshes at stage changes.
import numpy as np, wave, sys
SR = 48000; T = 36.0; n = int(SR * T); t = np.arange(n) / SR
rng = np.random.default_rng(1)
def env(a, d, start, length):
    e = np.zeros(n); i0 = int(start * SR); L = int(length * SR)
    x = np.arange(L) / SR
    seg = np.minimum(1, x / a) * np.minimum(1, (length - x) / d)
    e[i0:i0 + L] = np.clip(seg, 0, 1)[: max(0, min(L, n - i0))]
    return e
def pad(freqs, start, length, amp):
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.25, 0, 0.3):
            ph = rng.uniform(0, 2 * np.pi)
            out += np.sin(2 * np.pi * (f + det) * t + ph) + 0.3 * np.sin(2 * np.pi * 2 * (f + det) * t + ph)
    return out * env(3.0, 3.5, start, length) * amp / len(freqs)
mix = np.zeros(n)
# chords (D minor-ish, slow), overlapping
chords = [([73.4, 146.8, 220, 261.6, 329.6], 0, 10), ([58.3, 116.5, 174.6, 233.1, 293.7], 8.5, 9),
          ([65.4, 130.8, 196, 261.6, 329.6], 16, 7.5), ([73.4, 146.8, 220, 293.7, 349.2, 440], 21.5, 8),
          ([87.3, 130.8, 174.6, 261.6, 349.2], 28, 5.5), ([73.4, 110, 146.8, 220, 293.7, 440, 587.3], 32.5, 3.5)]
for fr, s, L in chords: mix += pad(fr, s, L + 1.5, 0.22)
mix += 0.12 * np.sin(2 * np.pi * 36.7 * t) * np.minimum(1, t / 4) # drone
# shimmer arpeggio (soft bells)
notes = [587.3, 880, 698.5, 1174.7, 880, 1046.5]
for k, s in enumerate(np.arange(2.0, 34, 1.6)):
    f = notes[k % len(notes)]; i0 = int(s * SR); L = int(2.5 * SR); x = np.arange(L) / SR
    b = (np.sin(2*np.pi*f*x) + 0.3*np.sin(2*np.pi*2.01*f*x)) * np.exp(-x * 2.2) * 0.035
    mix[i0:i0 + L] += b[: n - i0]
# whooshes between stages + soft impacts at reveals
noise = rng.standard_normal(n)
from numpy.fft import rfft, irfft
def band(x, lo, hi):
    X = rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR); X[(fq < lo) | (fq > hi)] = 0; return irfft(X, len(x))
air = band(noise, 300, 4000)
for s, L in [(1.6, 2.4), (5.6, 2.2), (8.8, 2.2), (12.5, 3.4), (17.6, 4.6), (24.8, 4.0), (30.6, 3.0)]:
    i0 = int(s * SR); Lx = int(L * SR); x = np.linspace(0, 1, Lx)
    mix[i0:i0 + Lx] += air[i0:i0 + Lx] * np.sin(np.pi * x) ** 2 * 0.09
for s, a in [(21.7, 0.5), (28.4, 0.35), (33.0, 0.6)]:
    i0 = int(s * SR); L = int(3 * SR); x = np.arange(L) / SR
    boom = np.sin(2 * np.pi * (55 * np.exp(-x * 0.8)) * x) * np.exp(-x * 1.6) * a
    mix[i0:i0 + L] += boom[: n - i0]
# simple stereo reverb (comb delays)
L = mix.copy(); R = mix.copy()
for d, g in [(0.113, 0.35), (0.171, 0.3), (0.239, 0.25), (0.331, 0.2)]:
    k = int(d * SR); L[k:] += g * mix[:-k]; k2 = int(d * 1.13 * SR); R[k2:] += g * mix[:-k2]
st = np.stack([L, R], 1)
st *= np.minimum(1, (T - t) / 2.5)[:, None]
st /= np.abs(st).max() * 1.12
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
