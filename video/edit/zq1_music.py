# Synthesised film score for zombie part 1: dark intro, tense low strings during the siren,
# sad piano + strings for the phone call, swell on the mother's last words, hard cut to silence,
# low dread for Sardor, sad piano on the end card. Times come from public/zq1/timeline.json.
import numpy as np, wave, json
SR = 48000
T = json.load(open('public/zq1/timeline.json'))
DUR = T['end']
out = np.zeros(int(SR * DUR)); rng = np.random.default_rng(11)
def add(sig, t, g=1.0):
    i = int(t * SR)
    if i >= len(out): return
    n = min(len(sig), len(out) - i); out[i:i + n] += sig[:n] * g
def hz(n):  # note name -> frequency
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    s = names[n[0]] + (1 if '#' in n else 0) + (int(n[-1]) - 4) * 12
    return 440 * 2 ** (s / 12)
def piano(n, d=3.0, v=1.0):
    f = hz(n); k = int(SR * d); t = np.arange(k) / SR
    y = sum(a * np.sin(2 * np.pi * f * m * t * (1 + 0.0004 * m * m)) * np.exp(-t * (1.2 + m * 0.9)) for m, a in [(1, 1), (2, 0.45), (3, 0.22), (4, 0.1), (5, 0.05)])
    y *= np.minimum(t / 0.004, 1)
    return y * v * 0.35
def strings(notes, d, att=1.5, rel=1.5, v=1.0, bright=6):
    k = int(SR * d); t = np.arange(k) / SR
    y = np.zeros(k)
    for n in notes:
        f = hz(n)
        for det in (-0.004, 0, 0.005):
            ph = 2 * np.pi * f * (1 + det) * t + 0.003 * np.sin(2 * np.pi * 5.2 * t) * f / 5.2
            y += sum(np.sin(m * ph) / m for m in range(1, bright))
    e = np.minimum(t / att, 1) * np.minimum((d - t) / rel, 1).clip(0, 1)
    return y * e * v * 0.05
def stac(n, v=1.0):  # short low string stab
    f = hz(n); k = int(SR * 0.22); t = np.arange(k) / SR
    y = sum(np.sin(2 * np.pi * f * m * t) / m for m in range(1, 7)) * np.exp(-t * 14) * np.minimum(t / 0.01, 1)
    return y * v * 0.25
def drone(d, f=55.0, v=1.0):
    k = int(SR * d); t = np.arange(k) / SR
    y = np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2 * t + 0.3 * np.sin(t)) + 0.25 * np.sin(2 * np.pi * f * 3.01 * t)
    return y * np.minimum(t / 2, 1) * np.minimum((d - t) / 1.5, 1).clip(0, 1) * v * 0.18
def hit():
    k = int(SR * 2.5); t = np.arange(k) / SR
    y = np.sin(2 * np.pi * 40 * t) * np.exp(-t * 1.5) + rng.standard_normal(k) * np.exp(-t * 6) * 0.4
    return y * 0.6

CH = {'Am': ['A3', 'C4', 'E4'], 'F': ['F3', 'A3', 'C4'], 'C': ['C4', 'E4', 'G4'], 'G': ['G3', 'B3', 'D4'], 'Dm': ['D4', 'F4', 'A4'], 'E': ['E3', 'G#3', 'B3']}
BASS = {'Am': 'A2', 'F': 'F2', 'C': 'C3', 'G': 'G2', 'Dm': 'D3', 'E': 'E2'}

# A. "Bugun... orzusi ushaldi": two low piano notes and a dark pad
add(piano('A2', 4, 1.2), T['dark']); add(piano('E3', 4, 0.9), T['dark'] + 1.4)
add(strings(['A2', 'E3'], T['tense'] - T['dark'], 1.0, 0.3, 0.7, 4), T['dark'])
# B. siren: driving low string ostinato, crescendo, tremolo on top later
beat = 60 / 116 / 2
t = T['tense']; i = 0
while t < T['sad'] - 0.2:
    g = 0.5 + 0.5 * (t - T['tense']) / (T['sad'] - T['tense'])
    add(stac('A2' if i % 8 < 6 else 'F2', g), t); add(stac('A1', g * 0.7), t)
    t += beat; i += 1
add(strings(['E5', 'F5'], T['sad'] - T['tense'] - 6, 3, 0.4, 0.5, 4), T['tense'] + 6)
add(drone(T['sad'] - T['tense'], 55, 0.8), T['tense'])
# C/D. sad piano + strings through the freeze, the call and the dialogue
prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E']
cl = 3.6
t = T['sad']; k = 0
mel = ['E5', 'D5', 'C5', 'B4', 'C5', 'A4', 'D5', 'G#4']
while t < T['love'] - 0.1:
    c = prog[k % len(prog)]
    d = min(cl, T['love'] - t)
    dial = t >= T['call']
    add(strings(CH[c], d + 0.8, 1.2 if dial else 2.0, 1.0, 0.9 if dial else 0.6), t)
    add(piano(BASS[c], 3.5, 0.9), t)
    for j, n in enumerate([CH[c][0], CH[c][1], CH[c][2], CH[c][1]]):
        if t + j * 0.9 < T['love']:
            add(piano(n.replace('3', '4') if dial else n, 2.5, 0.45), t + j * 0.9)
    if dial and t + 1.8 < T['love']:
        add(piano(mel[k % len(mel)], 3.0, 0.8), t + 1.8)
    t += cl; k += 1
# E. the mother's last words: full swell, then a hard cut at the call drop
sw = T['cut'] - T['love']
add(strings(['A3', 'C4', 'E4', 'A4', 'E5'], sw + 0.05, 1.0, 0.05, 1.4, 8), T['love'])
add(piano('A2', 3, 1.0), T['love']); add(piano('E5', 3, 0.9), T['love'] + 0.6); add(piano('C5', 3, 0.8), T['love'] + 1.6)
# F. silence until Sardor; G. low dread rising to the hit
dd = T['hit'] - T['sardor']
add(drone(dd + 0.5, 41.2, 1.2), T['sardor'])
k = int(SR * dd); tt = np.arange(k) / SR
cluster = sum(np.sin(2 * np.pi * f * tt) for f in (hz('A5'), hz('A#5'), hz('B5'))) * (tt / dd) ** 2 * 0.07
add(cluster, T['sardor'])
add(hit(), T['hit'])
# H. end card: lonely piano
for j, n in enumerate(['A4', 'E4', 'C4', 'B3', 'A3']):
    add(piano(n, 3.5, 0.6), T['card'] + 0.6 + j * 0.9)
add(strings(['A2', 'E3'], DUR - T['card'] - 0.5, 1.5, 1.5, 0.5, 4), T['card'] + 0.5)

# cheap reverb: convolve with a decaying noise tail
ir_n = int(SR * 2.2); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 3.0)
ir[0] = 0; ir /= np.abs(ir).sum() / 6
L = len(out) + ir_n
F = np.fft.rfft(out, n=1 << (L - 1).bit_length()) * np.fft.rfft(ir, n=1 << (L - 1).bit_length())
wet = np.fft.irfft(F)[:len(out)]
mix = out * 0.75 + wet * 0.35
# keep the hard cut truly silent
c0, c1 = int(T['cut'] * SR), int(T['sardor'] * SR)
mix[c0:c1] = 0
mix = mix / max(1e-9, np.abs(mix).max()) * 0.8
with wave.open('public/zq1/music.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('music ok', round(DUR, 1), 's')
