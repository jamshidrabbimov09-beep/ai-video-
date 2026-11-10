"""YouTube banner, variant 2: cinematic collage of Part 1 stills with the title in the centre safe area (1546x423)."""
import pathlib, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
B = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
I = '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'
GOLD = (222, 184, 70); CREAM = (245, 236, 213)
W, H = 2560, 1440
PW = 1100                      # panel width; panels overlap and cross-fade
panels = [('i12', 0.25), ('i23', 0.42), ('i30', 0.50)]   # image, vertical centre of interest (0..1)
xs = [0, (W - PW) // 2, W - PW]
acc = np.zeros((H, W, 3), 'float32'); wsum = np.zeros((H, W, 1), 'float32')
for (name, focus), x0 in zip(panels, xs):
    im = Image.open(root / f'public/p1img/{name}.jpg').convert('RGB')
    im = im.resize((PW, round(im.height * PW / im.width)), Image.LANCZOS)
    top = int(np.clip(focus * im.height - H / 2, 0, im.height - H))
    a = np.asarray(im.crop((0, top, PW, top + H)), 'float32')
    ramp = np.clip(np.minimum(np.arange(PW), PW - 1 - np.arange(PW)) / 370.0, 0, 1)
    if x0 == 0: ramp[:PW // 2] = 1
    if x0 == W - PW: ramp[PW // 2:] = 1
    w = (ramp ** 1.5)[None, :, None]
    acc[:, x0:x0 + PW] += a * w; wsum[:, x0:x0 + PW] += w
img = acc / np.maximum(wsum, 1e-6)
# warm unifying grade + vignette + dark band behind the text
g = img.mean(-1, keepdims=True)
img = (img * 0.72 + g * 0.28) * np.array([1.06, 0.98, 0.84])
yy, xx = np.mgrid[0:H, 0:W]
vig = 1 - 0.55 * np.clip(np.hypot((xx - W / 2) / (W * 0.62), (yy - H / 2) / (H * 0.75)) - 0.35, 0, 1)
band = 1 - 0.62 * np.exp(-((yy - H / 2) / 230.0) ** 2) * np.exp(-((xx - W / 2) / 900.0) ** 4)
img = np.clip(img * (vig * band)[..., None], 0, 255).astype('uint8')
im = Image.fromarray(img).convert('RGBA')
cy = H // 2
def text_layer(draw_fn):
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(sh), True)
    fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(fg), False)
    return Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)), fg)
f1 = ImageFont.truetype(B, 116); f2 = ImageFont.truetype(I, 56); f3 = ImageFont.truetype(B, 30)
def draw(d, shadow):
    def c(text, font, y, fill, sp=0):
        w = d.textlength(text, font=font) + sp * (len(text) - 1)
        x = (W - w) / 2
        if sp:
            for ch in text:
                d.text((x, y), ch, font=font, fill=(0, 0, 0, 255) if shadow else fill); x += d.textlength(ch, font=font) + sp
        else:
            d.text((x, y), text, font=font, fill=(0, 0, 0, 255) if shadow else fill)
        return w
    c('TARIX  •  QISSALAR  •  SHAXSLAR', f3, cy - 178, (215, 200, 160, 255), sp=7)
    w = c('UNUTILGAN QISSALAR', f1, cy - 118, GOLD + (255,))
    if not shadow:
        d.line(((W - w) / 2, cy + 30, (W - 150) / 2, cy + 30), fill=GOLD + (255,), width=3)
        d.line(((W + 150) / 2, cy + 30, (W + w) / 2, cy + 30), fill=GOLD + (255,), width=3)
        d.regular_polygon((W / 2, cy + 30, 13), 4, rotation=0, outline=GOLD + (255,), width=3)
    c('Tarix kitoblarida yozilmagan qissalar', f2, cy + 62, CREAM + (255,))
im = Image.alpha_composite(im, text_layer(draw))
(root / 'youtube').mkdir(exist_ok=True)
im.convert('RGB').save(root / 'youtube/banner2_2560x1440.jpg', quality=95)
S = sys.argv[1]
im.convert('RGB').crop((W // 2 - 773, cy - 212, W // 2 + 773, cy + 212)).save(S + '/b2_safe.jpg', quality=88)
im.convert('RGB').resize((1280, 720)).save(S + '/b2_full.jpg', quality=85)
