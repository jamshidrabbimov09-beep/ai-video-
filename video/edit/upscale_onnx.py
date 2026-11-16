"""Tile-based 4x upscale with an ONNX ESRGAN model. usage: up.py model.onnx in.jpg out.png"""
import sys, numpy as np, onnxruntime as ort
from PIL import Image
m, src, dst = sys.argv[1:4]
s = ort.InferenceSession(m, providers=['CPUExecutionProvider']); name = s.get_inputs()[0].name
img = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
H, W, _ = img.shape; T, P, S = 192, 16, 4
out = np.zeros((H * S, W * S, 3), np.float32)
for y in range(0, H, T):
    for x in range(0, W, T):
        y0, x0, y1, x1 = max(0, y - P), max(0, x - P), min(H, y + T + P), min(W, x + T + P)
        t = img[y0:y1, x0:x1].transpose(2, 0, 1)[None]
        r = s.run(None, {name: t})[0][0].transpose(1, 2, 0)
        oy, ox = (y - y0) * S, (x - x0) * S
        h, w = min(T, H - y) * S, min(T, W - x) * S
        out[y * S:y * S + h, x * S:x * S + w] = r[oy:oy + h, ox:ox + w]
    print(f'{min(100, (y + T) * 100 // H)}%', flush=True)
Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst)
