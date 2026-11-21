"""Paints out the star-and-crescent symbols on three flags in the Flow image p12 (modern Turkish/Pakistani-looking flags are an
anachronism for 1402). Each symbol area is filled with the cloth colour sampled just beside it, then softly blended."""
import sys
from PIL import Image, ImageDraw, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
spots = [  # (centre x, y, radius x, radius y, sample point)
    (700, 303, 34, 30, (668, 318)),   # green flag: crescent + star
    (570, 320, 24, 22, (548, 338)),   # gold flag
    (515, 330, 18, 16, (532, 345)),   # small red flag
]
for cx, cy, rx, ry, sp in spots:
    col = im.getpixel(sp)
    patch = Image.new('RGB', im.size, col)
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(5))
    im = Image.composite(patch, im, m)
im.save(dst, quality=95); print('ok')
