"""Toshkent 1994, ep.1: synthesised score + sfx, mixed with the voice -> public/t94/mix.wav"""
import numpy as np, subprocess, os

SR = 44100
DUR = 80.0
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public', 't94c')
rng = np.random.default_rng(7)
t = np.arange(N) / SR


def load(f):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True).stdout
    return np.frombuffer(b, np.float32).copy()


def lp(x, a):  # one-pole lowpass, a in (0,1)
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)


def env(t0, t1, att=0.5, rel=1.0):
    e = np.zeros(N)
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR))
    seg = np.arange(i1 - i0) / SR
    e[i0:i1] = np.minimum(1, seg / max(att, 1e-3)) * np.minimum(1, (t1 - t0 - seg) / max(rel, 1e-3))
    return np.clip(e, 0, 1)


def place(dst, x, at, g=1.0):
    i = int(at * SR)
    n = min(len(x), N - i)
    if n > 0:
        dst[i:i + n] += x[:n] * g


out = np.zeros(N)
def drone(f0, g):
    return g * (np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * t + 1)
                + 0.3 * np.sin(2 * np.pi * (f0 * 2.01) * t))
score = drone(55, 1) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t)) * env(0, 77, 2, 1.5)
score += drone(41.2, 0.8) * env(48, 75.8, 3, 1)
score += 0.3 * np.sin(2 * np.pi * 740 * t + 2 * np.sin(2 * np.pi * 0.2 * t)) * env(64, 75.6, 2, 1)
out += score * 0.03
# night street rain
noise = rng.standard_normal(N)
out += (lp(noise, 0.25) * 0.5) * env(43, 48.4, 0.5, 0.5) * 0.04

def boom(dur=2.5, f=48, g=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    fr = f * (1 + 1.5 * np.exp(-tt * 12))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 2.2)
    s += lp(rng.standard_normal(n), 0.03) * np.exp(-tt * 6) * 2
    return s * g




# clock ticks: slow at start, faster toward 05:59
def tick():
    n = int(0.03 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 200)
for k in range(4): place(out, tick(), 0.3 + k, 0.07)
for k in range(6): place(out, tick(), 48.5 + k * 0.6, 0.07)
x = 56.0; step = 0.6
while x < 59.4:
    place(out, tick(), x, 0.09); step = max(0.18, step * 0.88); x += step
# hits
for at, g in [(0.0, 0.5), (12.3, 0.4), (33.4, 0.35), (59.5, 0.6), (64.0, 0.7), (75.8, 0.7)]:
    place(out, boom(), at, g)
# drawers / search rumble
for k in range(5): place(out, boom(0.25, 140, 1), 4.4 + k * 0.9, 0.1)
# knocks on Salim's door and on Sardor's door
for k in range(3): place(out, boom(0.15, 160, 1), 22.6 + k * 0.32, 0.25)
for k in range(3): place(out, boom(0.15, 150, 1), 59.5 + k * 0.32, 0.35)
# door chain rattle + door open creak
n = int(0.5 * SR); tt = np.arange(n) / SR
chain = (rng.standard_normal(n) - lp(rng.standard_normal(n), 0.4)) * (np.sin(2 * np.pi * 14 * tt) > 0.3) * np.exp(-tt * 5)
place(out, chain, 25.0, 0.08)
n = int(0.9 * SR); tt = np.arange(n) / SR
creak = np.sin(2 * np.pi * (250 + 150 * tt) * tt) * (np.sin(2 * np.pi * 26 * tt) > 0) * np.exp(-tt * 2)
place(out, creak, 63.0, 0.07)
# heartbeat while waiting
for k in range(6):
    at = 55.0 + k * 0.75
    place(out, boom(0.35, 45, 1), at, 0.2); place(out, boom(0.3, 40, 1), at + 0.22, 0.13)

# voice
v = load(os.path.join(PUB, 'raw.mp3'))
voice = np.zeros(N)
voice[:min(N, len(v))] = v[:N]
# duck music under the voice
venv = lp(np.abs(voice) > 0.02, 0.0004)
out *= 1 - 0.7 * np.clip(venv * 3, 0, 1)
mix = voice * 1.6 + out
mix /= max(1e-6, np.max(np.abs(mix))) / 0.95
tmp = os.path.join(PUB, 'mix_pre.wav')
import wave
with wave.open(tmp, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', str(SR),
                '-ac', '2', os.path.join(PUB, 'mix.wav')], check=True)
os.remove(tmp)
print('ok')
