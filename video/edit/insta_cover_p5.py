"""Instagram Reel cover for Part 5 (python3 edit/insta_cover_p5.py m16|m05) (1080x1920). The grid shows the centre 3:4 band, so text stays between y=300 and y=1640."""
import pathlib, sys
from PIL import ImageFilter
from PIL import Image, ImageDraw, ImageFont
root = pathlib.Path(__file__).resolve().parent.parent
B = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
I = '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'
GOLD = (212, 175, 55); CREAM = (245, 236, 213)
base = Image.open(root / ('public/p5img/' + (sys.argv[1] if len(sys.argv) > 1 else 'm16') + '.jpg')).convert('RGB')
base = base.resize((base.width * 2, base.height * 2), Image.LANCZOS).filter(ImageFilter.SMOOTH_MORE).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=1))
sc = max(1080 / base.width, 1920 / base.height)
base = base.resize((round(base.width * sc), round(base.height * sc)), Image.LANCZOS)
l, t = (base.width - 1080) // 2, (base.height - 1920) // 2
base = base.crop((l, t, l + 1080, t + 1920))
from PIL import ImageFilter, ImageEnhance
base = base.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=1)).filter(ImageFilter.UnsharpMask(radius=3.0, percent=35, threshold=2))
base = ImageEnhance.Contrast(base).enhance(1.06)
ov = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
for y in range(950, 1920):
    od.line((0, y, 1080, y), fill=(0, 0, 0, int(225 * min(1, (y - 950) / 600))))
cov = Image.alpha_composite(base.convert('RGBA'), ov); d = ImageDraw.Draw(cov)
def centered(text, font, y, fill):
    w = d.textbbox((0, 0), text, font=font)[2]; d.text(((1080 - w) / 2, y), text, font=font, fill=fill, stroke_width=2, stroke_fill=(0, 0, 0))
centered('5-QISM', ImageFont.truetype(B, 44), 1210, CREAM)
centered("DASHT YURISHI", ImageFont.truetype(B, 92), 1262, GOLD)
d.line((300, 1410, 780, 1410), fill=GOLD, width=3)
centered("Amir Temur va To'xtamish, 1391", ImageFont.truetype(I, 62), 1432, CREAM)
cov.convert('RGB').save(root / ('instagram/cover_part5' + ('' if len(sys.argv) < 2 or sys.argv[1] == 'm16' else '_' + sys.argv[1]) + '.png'))
print('ok')
