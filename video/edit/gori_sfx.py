# Sound for the "Eskizdan 3D'ga: Go'ri Amir" short (15 s): pencil scratching while the sketch draws,
# whoosh when the card flies away, thuds as the building parts land, a soft chime on the title.
import numpy as np, subprocess, sys
SR = 48000; N = SR * 15
out = np.zeros(N)
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)
def add(s, t, g):
    i = int(t * SR); s = s[: max(0, N - i)]; out[i:i + len(s)] += s * g
rng = np.random.default_rng(3)
# pencil: band-limited noise in short strokes (one per sketch stroke, 9 frames each from frame 8)
for k in range(11):
    t0 = (8 + k * 9) / 30; n = int(SR * 0.36); t = np.arange(n) / SR
    noise = np.convolve(rng.standard_normal(n), np.ones(6) / 6, 'same') - np.convolve(rng.standard_normal(n), np.ones(40) / 40, 'same')
    env = np.sin(np.pi * t / t[-1]) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t) ** 2)
    add(noise * env, t0, 0.5)
add(load('public/audio/whoosh.mp3'), 3.55, 0.8)
thud = load('public/audio/thud.mp3')
for fr, g in [(108, .7), (128, .55), (150, .8), (172, .6), (194, .5), (214, .45)]:
    add(thud, fr / 30 + 0.12, g)
# chime on the title (frame 330)
n = int(SR * 2.5); t = np.arange(n) / SR
ch = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(1046, 1, .9), (1568, .6, .7), (2093, .35, .5)])
add(ch * np.minimum(t / 0.003, 1), 11.0, 0.18)
# music bed, fades in after the sketch, out at the end
bed = load('public/audio/bed.mp3')[: N]; tt = np.arange(len(bed)) / SR
bed = bed * np.clip((tt - 2.5) / 1.5, 0.15, 1) * np.clip((15 - tt) / 1.2, 0, 1)
add(bed, 0, 0.6)
out /= max(1e-9, np.abs(out).max()) / 0.9
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-',
  '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '48000', sys.argv[1]], input=out.tobytes())
