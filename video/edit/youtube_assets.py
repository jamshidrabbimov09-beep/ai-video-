"""YouTube channel banner 2560x1440; everything important sits in the centre safe area 1546x423."""
import math, pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'youtube'; out.mkdir(exist_ok=True)
B = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
I = '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'
GOLD = (212, 175, 55); CREAM = (245, 236, 213)
W, H = 2560, 1440
yy, xx = np.mgrid[0:H, 0:W]
k = np.clip(1 - np.hypot((xx - W / 2) / (W * 0.62), (yy - H / 2) / (H * 0.85)), 0, 1)
bg = np.stack([10 + 40 * k, 8 + 28 * k, 5 + 12 * k], -1).astype('uint8')
img = Image.fromarray(bg).convert('RGBA')
# faint ornamental 8-point stars across the whole banner
orn = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(orn)
def star(d, cx, cy, rad, width, fill):
    for a in (0, 45):
        pts = [(cx + rad * math.cos(math.radians(a + 90 * i + 45)), cy + rad * math.sin(math.radians(a + 90 * i + 45))) for i in range(4)]
        d.polygon(pts, outline=fill, width=width)
for cx in range(-160, W + 320, 320):
    for cy in range(-160, H + 320, 320):
        star(od, cx, cy, 150, 2, GOLD + (26,)); star(od, cx + 160, cy + 160, 60, 2, GOLD + (20,))
img = Image.alpha_composite(img, orn)
# darken the centre band a little so the text reads well
band = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(band)
bd.rectangle((0, H / 2 - 250, W, H / 2 + 250), fill=(8, 6, 4, 150))
img = Image.alpha_composite(img, band.filter(ImageFilter.GaussianBlur(60)))
d = ImageDraw.Draw(img)
cy = H // 2
# logo (left part of safe area)
lr = 125; lx = W // 2 - 773 + 50 + lr
for r, w in ((lr, 5), (lr - 12, 2)):
    d.ellipse((lx - r, cy - r, lx + r, cy + r), outline=GOLD, width=w)
star(d, lx, cy, lr - 22, 3, GOLD); star(d, lx, cy, lr - 45, 2, GOLD)
d.ellipse((lx - 57, cy - 57, lx + 57, cy + 57), fill=(14, 10, 6), outline=GOLD, width=3)
f = ImageFont.truetype(B, 62); w = d.textbbox((0, 0), 'UQ', font=f)[2]
d.text((lx - w / 2, cy - 40), 'UQ', font=f, fill=GOLD)
# title + tagline
tx = lx + lr + 50
avail = (W // 2 + 773 - 50) - tx
fs = 124
while d.textbbox((0, 0), 'UNUTILGAN QISSALAR', font=ImageFont.truetype(B, fs))[2] > avail: fs -= 2
f1 = ImageFont.truetype(B, fs); f2 = ImageFont.truetype(I, 50); f3 = ImageFont.truetype(B, 31)
d.text((tx, cy - 138), 'UNUTILGAN QISSALAR', font=f1, fill=GOLD)
tw = d.textbbox((0, 0), 'UNUTILGAN QISSALAR', font=f1)[2]
d.line((tx, cy + 5, tx + tw, cy + 5), fill=GOLD, width=3)
d.text((tx, cy + 28), 'Tarix kitoblarida yozilmagan qissalar', font=f2, fill=CREAM)
d.text((tx, cy + 100), 'BUYUK SHAXSLAR  •  UNUTILGAN VOQEALAR', font=f3, fill=(200, 185, 150))
print('text right edge', tx + tw, 'safe', W // 2 - 773, W // 2 + 773)
img.convert('RGB').save(out / 'banner_2560x1440.png')
# preview of the mobile-safe crop
img.convert('RGB').crop((W // 2 - 773, cy - 212, W // 2 + 773, cy + 212)).save('/tmp/claude-0/-home-user-ai-video-/5e80663f-e121-54d0-bbe0-4dbc8fde9705/scratchpad/banner_safe.png')
