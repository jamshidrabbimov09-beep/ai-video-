"""Write a small synthetic hall impulse response (RT60 ~1.4 s, 30 ms pre-delay, darkened tail) used for the narration reverb."""
import sys, wave
import numpy as np
SR = 44100
out = sys.argv[1] if len(sys.argv) > 1 else 'ir.wav'
rng = np.random.default_rng(3)
n = int(1.6 * SR); t = np.arange(n) / SR
ir = rng.standard_normal(n) * np.exp(-6.9 * t / 1.4)
ir[:int(0.03 * SR)] = 0
a = np.exp(-2 * np.pi * 4000 / SR); y = np.zeros(n)
for i in range(1, n):
    y[i] = (1 - a) * ir[i] + a * y[i - 1]
y /= np.max(np.abs(y))
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())
