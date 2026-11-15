"""Part 4 map assets (2026-11-12): a real shaded-relief Earth background and today's borders (faint, for orientation).
Source: basemap-data 2.0.0 (PyPI; shadedrelief.jpg 10800x5400 equirectangular, countries_l.dat). Run once:
  pip download basemap-data --no-deps -d /tmp/bm && unzip the wheel, then: python3 edit/maps_p4.py <basemap_data dir>
Outputs: public/maps/relief_p4.jpg (lon 25..85, lat 14..64), src/borders_p4.json.
The 14th-century ulus borders are drawn by hand in src/p4motion.tsx (approximate; Manz map 3 names the regions but draws no borders)."""
import sys, json, pathlib, numpy as np
from PIL import Image, ImageEnhance
Image.MAX_IMAGE_PIXELS = None
D = pathlib.Path(sys.argv[1]); root = pathlib.Path(__file__).resolve().parent.parent
LO0, LO1, LA0, LA1 = 25, 85, 14, 64
im = Image.open(D / 'shadedrelief.jpg').convert('RGB')
k = im.width / 360
crop = im.crop((int((LO0 + 180) * k), int((90 - LA1) * k), int((LO1 + 180) * k), int((90 - LA0) * k)))
crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
a = np.asarray(crop).astype(np.float32) / 255
water = ((a[..., 2] - a[..., 0]) > 0.1) & (a.mean(axis=2) > 0.74)                 # sea pixels are bluish; the Aral is dry in this data, it is drawn in the scenes
g = a.mean(axis=2, keepdims=True)
a = a * 0.55 + g * 0.45                                  # calmer colours
a = a * np.array([1.06, 0.98, 0.84])                     # warm, old-paper tone
a = np.clip((a - 0.5) * 1.08 + 0.5, 0, 1) * 0.92
a[water] = a[water] * 0.25 + np.array([0.27, 0.42, 0.48]) * 0.75
Image.fromarray((a * 255).astype(np.uint8)).save(root / 'public/maps/relief_p4.jpg', quality=88)
meta = [l.split() for l in open(D / 'countriesmeta_l.dat')]
raw = open(D / 'countries_l.dat', 'rb').read()
lines = []
for m in meta:
    n, off = int(m[2]), int(m[5])
    p = np.frombuffer(raw[off:off + n * 8], '<f4').reshape(-1, 2)
    if p[:, 0].max() < LO0 or p[:, 0].min() > LO1 or p[:, 1].max() < LA0 or p[:, 1].min() > LA1: continue
    p = p[::2] if len(p) > 40 else p
    lines.append([[round(float(x), 2), round(float(y), 2)] for x, y in p])
rmeta = [l.split() for l in open(D / 'riversmeta_l.dat')]
rraw = open(D / 'rivers_l.dat', 'rb').read()
rivers = []
for m in rmeta:
    n, off = int(m[2]), int(m[5])
    if n < 4: continue
    p = np.frombuffer(rraw[off:off + n * 8], '<f4').reshape(-1, 2)
    if p[:, 0].max() < 40 or p[:, 0].min() > 78 or p[:, 1].max() < 34 or p[:, 1].min() > 52: continue
    rivers.append([[round(float(x), 2), round(float(y), 2)] for x, y in p[::2]])
gmeta = [l.split() for l in open(D / 'gshhsmeta_l.dat')]
graw = open(D / 'gshhs_l.dat', 'rb').read()
lakes = []
for m in gmeta:
    n, off = int(m[2]), int(m[5])
    p = np.frombuffer(graw[off:off + n * 8], '<f4').reshape(-1, 2)
    if p[:, 0].min() > 45 and p[:, 0].max() < 56 and p[:, 1].min() > 35 and p[:, 1].max() < 48 and n > 100:   # the Caspian Sea
        lakes.append([[round(float(x), 2), round(float(y), 2)] for x, y in p])
(root / 'src/borders_p4.json').write_text(json.dumps(dict(bounds=[LO0, LO1, LA0, LA1], lines=lines, rivers=rivers, lakes=lakes)))
print(len(lakes), 'lakes', [len(l) for l in lakes])
print(len(rivers), 'rivers')
print(crop.size, len(lines), 'border lines')
