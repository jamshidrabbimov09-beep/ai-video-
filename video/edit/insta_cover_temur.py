"""One cover template for every Temur part (user's rule, 2026-11-18): cinematic image of one person with a strong emotion,
small "N-QISM" badge at the top, big gold event title (3-4 words) low in the frame, same font/colour/places in every part.
The profile grid shows the centre 3:4 band (y 240-1680), so everything stays inside it.
Usage: python3 edit/insta_cover_temur.py <image> <part number> "<TITLE>" <out.png> [focus_y 0..1]"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
B = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
GOLD = (222, 184, 64); CREAM = (245, 236, 213)
src, num, title, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
fy = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5
W, H = 2160, 3840   # 2x for a sharp cover
base = Image.open(src).convert('RGB')
sc = max(W / base.width, H / base.height)
base = base.resize((round(base.width * sc), round(base.height * sc)), Image.LANCZOS)
l = (base.width - W) // 2; t = int((base.height - H) * fy)
base = base.crop((l, t, l + W, t + H)).filter(ImageFilter.UnsharpMask(radius=2, percent=50, threshold=2))
base = ImageEnhance.Contrast(base).enhance(1.06)
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
for y in range(1900, H): od.line((0, y, W, y), fill=(0, 0, 0, int(235 * min(1, (y - 1900) / 1100))))
for y in range(0, 900): od.line((0, y, W, y), fill=(0, 0, 0, int(150 * (1 - y / 900))))
cov = Image.alpha_composite(base.convert('RGBA'), ov); d = ImageDraw.Draw(cov)
# badge
bf = ImageFont.truetype(B, 92); bt = f'{num}-QISM'; bw = d.textbbox((0, 0), bt, font=bf)[2]
x0 = (W - bw) / 2 - 56; y0 = 560
d.rounded_rectangle((x0, y0, x0 + bw + 112, y0 + 150), radius=18, fill=(0, 0, 0, 150), outline=GOLD, width=6)
d.text(((W - bw) / 2, y0 + 22), bt, font=bf, fill=GOLD)
# title: up to 2 lines, as big as fits
words = title.split(); lines = [title] if len(title) <= 9 else [' '.join(words[:(len(words) + 1) // 2]), ' '.join(words[(len(words) + 1) // 2:])]
size = 330
while max(d.textbbox((0, 0), ln, font=ImageFont.truetype(B, size))[2] for ln in lines) > W - 200: size -= 10
tf = ImageFont.truetype(B, size); lh = int(size * 1.05)
y = 3330 - lh * len(lines)
for ln in lines:
    w = d.textbbox((0, 0), ln, font=tf)[2]
    d.text(((W - w) / 2, y), ln, font=tf, fill=GOLD, stroke_width=10, stroke_fill=(0, 0, 0))
    y += lh
sf = ImageFont.truetype(B, 84); st = 'AMIR TEMUR'; sw = d.textbbox((0, 0), st, font=sf)[2]
d.text(((W - sw) / 2, 3330 - lh * len(lines) - 130), st, font=sf, fill=CREAM, stroke_width=4, stroke_fill=(0, 0, 0))
cov.convert('RGB').save(out); print('ok', size)
