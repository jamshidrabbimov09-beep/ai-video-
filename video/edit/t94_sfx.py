"""Toshkent 1994, ep.1: synthesised score + sfx, mixed with the voice -> public/t94/mix.wav"""
import numpy as np, subprocess, os

SR = 44100
DUR = 87.0
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public', 't94')
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

# rain bed
noise = rng.standard_normal(N)
rain = lp(noise, 0.25) * 0.5 + (noise - lp(noise, 0.6)) * 0.25
rain_env = np.ones(N) * 0.045
rain_env[int(70.5 * SR):] = 0.03  # indoors at the end
rain_env[int(16.7 * SR):int(18.95 * SR)] = 0.03  # mother's room
out += rain * lp(rain_env, 0.0005)

# drone score
def drone(f0, g):
    return g * (np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * t + 1)
                + 0.3 * np.sin(2 * np.pi * (f0 * 2.01) * t))

score = drone(55, 1) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
score += drone(41.2, 0.7) * env(36, 83.6, 4, 2)
score *= env(0, 84.5, 3, 1.5)
# tension pulse during the chase
pulse = (np.sin(2 * np.pi * 2.2 * t) > 0.6).astype(float)
pulse = lp(pulse, 0.002)
score += np.sin(2 * np.pi * 65 * t) * pulse * env(42.6, 53.4, 0.3, 1.0) * 1.4
# high eerie tone after the death and the call
score += 0.25 * np.sin(2 * np.pi * 880 * t + 3 * np.sin(2 * np.pi * 0.3 * t)) * env(56, 60.2, 2, 1)
score += 0.3 * np.sin(2 * np.pi * 740 * t + 2 * np.sin(2 * np.pi * 0.2 * t)) * env(75, 83.4, 2, 1)
out += score * 0.03


def boom(dur=2.5, f=48, g=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    fr = f * (1 + 1.5 * np.exp(-tt * 12))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 2.2)
    s += lp(rng.standard_normal(n), 0.03) * np.exp(-tt * 6) * 2
    return s * g


def thunder(dur=5.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = lp(rng.standard_normal(n), 0.02) * (np.exp(-tt * 0.9) * (1 + 0.6 * np.sin(2 * np.pi * 3 * tt)))
    s[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
    return s * 6


for at, g in [(42.6, 0.5), (60.2, 0.35), (78.0, 0.35), (83.6, 0.7)]:
    place(out, boom(), at, g)

# clock ticks
for k in range(4):
    n = int(0.03 * SR)
    tick = np.sin(2 * np.pi * 3200 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 200)
    place(out, tick, 19.2 + k, 0.08)

# engine roar during the chase
eng_f = 70 + 40 * env(46.7, 53.3, 3, 0.3)
eng = np.sign(np.sin(2 * np.pi * np.cumsum(eng_f) / SR)) * 0.5 + lp(rng.standard_normal(N), 0.05)
out += lp(eng, 0.05) * env(46.6, 53.4, 0.5, 0.8) * 0.12
# chase cars behind (whoosh)
out += lp(rng.standard_normal(N), 0.08) * env(42.6, 46.8, 1.0, 0.5) * 0.1

# tyre screech at the stop
n = int(1.1 * SR); tt = np.arange(n) / SR
scr = np.sin(2 * np.pi * (2300 + 300 * np.sin(2 * np.pi * 9 * tt)) * tt) * (1 - tt / 1.1) * 0.6
scr += (rng.standard_normal(n) - lp(rng.standard_normal(n), 0.3)) * 0.3 * (1 - tt / 1.1)
place(out, scr, 52.4, 0.12)

# heartbeat while he looks at the body
for k in range(5):
    at = 56.3 + k * 0.85
    place(out, boom(0.35, 45, 1), at, 0.25)
    place(out, boom(0.3, 40, 1), at + 0.22, 0.16)

# Soviet phone ring (two rings)
def ring(dur=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    am = (np.sin(2 * np.pi * 20 * tt) > 0).astype(float)
    s = (np.sin(2 * np.pi * 1050 * tt) + 0.6 * np.sin(2 * np.pi * 1320 * tt)) * am
    return s * np.minimum(1, tt / 0.01) * np.minimum(1, (dur - tt) / 0.05)

for at in (71.9, 73.3):
    place(out, ring(), at, 0.06)

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
