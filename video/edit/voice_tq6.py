# Splice the re-recorded "Boyazidsan" / "Boyazid" (public/tq6/fix_raw.mp3) into the main take -> public/tq6/voice.wav.
# Old (main take) regions are replaced; TQ6.tsx maps real time back to the main-take timebase (toScene).
import numpy as np, subprocess, wave
SR = 48000
def load(p):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(b, np.float32).copy()
m = load('public/tq6/raw.mp3'); f = load('public/tq6/fix_raw.mp3')
S = lambda t: int(round(t * SR))
rms = lambda x: np.sqrt(np.mean(x ** 2))
REG = [((1.85, 2.60), (0.05, 0.90)), ((82.12, 82.53), (1.32, 1.93))]
X = S(0.012)
def xjoin(a, b):
    r = np.linspace(0, 1, X)
    return np.concatenate([a[:-X], a[-X:] * (1 - r) + b[:X] * r, b[X:]])
out = m[:S(REG[0][0][0]) + X]
prev = REG[0][0][0]
for (oa, ob), (fa, fb) in REG:
    if oa != prev:
        out = xjoin(out, m[S(prev) - X:S(oa) + X])
    seg = f[S(fa) - X:S(fb) + X]
    g = rms(m[S(oa):S(ob)]) / max(1e-9, rms(f[S(fa):S(fb)]))
    print('new start', (len(out) - X) / SR)
    out = xjoin(out, seg * g)
    print('new end', (len(out) - X) / SR)
    prev = ob
out = xjoin(out, m[S(prev) - X:])
with wave.open('public/tq6/voice.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print(len(m) / SR, len(out) / SR)
