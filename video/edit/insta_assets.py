"""Instagram assets: profile picture (1080x1080) and Reel cover for part 1 (1080x1920)."""
import math, pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'instagram'; out.mkdir(exist_ok=True)
B = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
I = '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'
GOLD = (212, 175, 55); CREAM = (245, 236, 213)

# ---- avatar ----
S = 1080
img = Image.new('RGB', (S, S))
px = img.load()
for y in range(S):
    for x in range(S):
        d = math.hypot(x - S / 2, y - S / 2) / (S * 0.72)
        k = max(0.0, 1 - d)
        px[x, y] = (int(10 + 34 * k), int(8 + 24 * k), int(5 + 10 * k))
dr = ImageDraw.Draw(img)
c = S // 2
for r, w in ((470, 6), (448, 2)):
    dr.ellipse((c - r, c - r, c + r, c + r), outline=GOLD, width=w)
def star(rad, rot, width):  # 8-point star from two squares
    for a in (0, 45):
        pts = [(c + rad * math.cos(math.radians(a + rot + 90 * i + 45)), c + rad * math.sin(math.radians(a + rot + 90 * i + 45))) for i in range(4)]
        dr.polygon(pts, outline=GOLD, width=width)
star(400, 0, 5); star(330, 0, 3)
dr.ellipse((c - 210, c - 210, c + 210, c + 210), fill=(14, 10, 6), outline=GOLD, width=5)
f = ImageFont.truetype(B, 230)
w, h = dr.textbbox((0, 0), 'UQ', font=f)[2:]
dr.text((c - w / 2, c - h / 2 - 25), 'UQ', font=f, fill=GOLD)
img.save(out / 'avatar_1080.png')

# ---- reel cover (grid shows the centre 3:4 band, so everything important stays between y=300 and y=1640) ----
base = Image.open(root / 'public/p1img/i04.jpg').convert('RGB')
bw, bh = base.size
sc = max(1080 / bw, 1920 / bh)
base = base.resize((int(bw * sc), int(bh * sc)), Image.LANCZOS)
left, top = (base.width - 1080) // 2, (base.height - 1920) // 2
base = base.crop((left, top, left + 1080, top + 1920))
ov = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
for y in range(1000, 1920):
    od.line((0, y, 1080, y), fill=(0, 0, 0, int(215 * (y - 1000) / 920)))
cov = Image.alpha_composite(base.convert('RGBA'), ov)
d = ImageDraw.Draw(cov)
def centered(text, font, y, fill):
    w = d.textbbox((0, 0), text, font=font)[2]; d.text(((1080 - w) / 2, y), text, font=font, fill=fill)
centered('1-QISM', ImageFont.truetype(B, 44), 1190, CREAM)
centered('AMIR TEMUR', ImageFont.truetype(B, 138), 1250, GOLD)
d.line((300, 1430, 780, 1430), fill=GOLD, width=3)
centered("Cho'loq yigit", ImageFont.truetype(I, 72), 1455, CREAM)
cov.convert('RGB').save(out / 'cover_part1.png')
print('ok')
