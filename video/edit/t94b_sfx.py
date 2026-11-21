"""Toshkent 1994, ep.1: synthesised score + sfx, mixed with the voice -> public/t94/mix.wav"""
import numpy as np, subprocess, os

SR = 44100
DUR = 70.0
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public', 't94b')
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
noise = rng.standard_normal(N)
rain = lp(noise, 0.25) * 0.5 + (noise - lp(noise, 0.6)) * 0.25
renv = np.zeros(N)
for t0, t1 in [(26.4, 31.6), (58.5, 60.4)]:
    renv += env(t0, t1, 0.3, 0.4)
out += rain * renv * 0.05
# room tone / bulb hum in the back room
hum = np.sin(2 * np.pi * 100 * t) * 0.5 + np.sin(2 * np.pi * 50 * t)
out += hum * (env(0, 3.9, 0.2, 0.5) + env(31.5, 58.6, 0.5, 0.5)) * 0.006

def drone(f0, g):
    return g * (np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * t + 1)
                + 0.3 * np.sin(2 * np.pi * (f0 * 2.01) * t))
score = drone(55, 1) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t)) * env(0, 67.5, 2, 1.5)
score += drone(41.2, 0.8) * env(35, 66.4, 3, 1)
pulse = lp((np.sin(2 * np.pi * 2.0 * t) > 0.6).astype(float), 0.002)
score += np.sin(2 * np.pi * 65 * t) * pulse * env(23.1, 31.5, 0.5, 0.5) * 1.4
score += 0.3 * np.sin(2 * np.pi * 740 * t + 2 * np.sin(2 * np.pi * 0.2 * t)) * env(51.5, 58.5, 2, 1)
score += np.sin(2 * np.pi * 70 * t) * pulse * env(60.3, 64.0, 0.2, 0.5) * 1.6
out += score * 0.03

def boom(dur=2.5, f=48, g=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    fr = f * (1 + 1.5 * np.exp(-tt * 12))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 2.2)
    s += lp(rng.standard_normal(n), 0.03) * np.exp(-tt * 6) * 2
    return s * g



for at, g in [(0.0, 0.6), (26.6, 0.45), (28.9, 0.5), (35.0, 0.3), (46.4, 0.4), (55.2, 0.45), (64.0, 0.6), (66.4, 0.7)]:
    place(out, boom(), at, g)
# engine + screech
eng_f = 70 + 30 * env(24.7, 26.8, 1, 0.2)
eng = np.sign(np.sin(2 * np.pi * np.cumsum(eng_f) / SR)) * 0.5 + lp(rng.standard_normal(N), 0.05)
out += lp(eng, 0.05) * env(23.2, 28.8, 0.8, 0.8) * 0.08
n = int(1.0 * SR); tt = np.arange(n) / SR
scr = np.sin(2 * np.pi * (2300 + 300 * np.sin(2 * np.pi * 9 * tt)) * tt) * (1 - tt) * 0.6
place(out, scr, 26.5, 0.1)
# car door slams
for at in (28.95, 58.7):
    place(out, boom(0.4, 90, 1), at, 0.3)
# heartbeat while looking at the photo
for k in range(4):
    at = 51.7 + k * 0.85
    place(out, boom(0.35, 45, 1), at, 0.25); place(out, boom(0.3, 40, 1), at + 0.22, 0.16)
# running footsteps on stairs
for k in range(9):
    place(out, boom(0.12, 120, 1), 60.35 + k * 0.22, 0.12)
# floorboard creak
n = int(0.6 * SR); tt = np.arange(n) / SR
creak = np.sin(2 * np.pi * (300 + 200 * tt) * tt) * (np.sin(2 * np.pi * 30 * tt) > 0) * np.exp(-tt * 3)
place(out, creak, 6.0, 0.05); place(out, creak, 61.3, 0.06)

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
