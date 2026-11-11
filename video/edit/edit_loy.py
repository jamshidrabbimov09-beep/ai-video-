"""Battle breakdown "Loy jangi, 1365": motion-design video made entirely in Remotion (src/LoyJangi.tsx).
Writes src/loy.json (sentence cues + subtitles) and the background textures public/loy/*.jpg.
Until the narration exists, times are ESTIMATED from the text; when edit/transcript_loy.json and src/words_loy.json
exist (same format as Part 3) the real times are used instead, so the animation follows the voice."""
import json, pathlib, re
import numpy as np
from PIL import Image, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
SENT = [
 ("s1", "1365-yil. Amir Temurning kamdan-kam mag'lubiyatlaridan biri: Loy jangi."),
 ("s2", "Unga nima sabab bo'ldi: yomg'irmi yoki o'z ittifoqchisimi?"),
 ("s3", "Bahor. Mo'g'uliston xoni Ilyosxo'ja qo'shin bilan yana Movarounnahrga bostirib keladi."),
 ("s4", "Temur va Amir Husayn unga qarshi chiqadi. Ikki qo'shin Chinoz bilan Toshkent oralig'ida to'qnashadi."),
 ("s5", "O'ng qanotda Husayn. Chap qanotda Temur."),
 ("s6", "Jang boshlanishi bilan kuchli jala quyadi. Maydon loyga aylanadi, otlar joyidan qimirlay olmaydi."),
 ("s7", "Rivoyatga ko'ra, dushman yomg'irni sehrli yada toshi bilan chaqirgan."),
 ("s8", "Shunga qaramay, Temur chap qanotda dushmanni yorib o'tadi. Ilyosxo'ja qocha boshlaydi."),
 ("s9", "Ammo o'ng qanotda Husaynning safi buziladi."),
 ("s10", "Temur o'n yetti qo'shun bilan yordamga tashlanadi va dushmanni chekintiradi."),
 ("s11", "U Husaynga ikki marta chopar yuboradi: birga hujum qilaylik. Yazdiyning yozishicha, Husayn choparlarni urib haydaydi va joyidan qimirlamaydi."),
 ("s12", "Fursat boy beriladi. Dushman bayroq ostida qayta to'planib, hujumga o'tadi."),
 ("s13", "Temur va Husayn qo'shini chekinadi. Ko'p askar loyda qolib ketadi. Yazdiy o'n ming kishi halok bo'lganini yozadi."),
 ("s14", "Shu kundan ikki do'st o'rtasida ishonch yo'qoladi. Besh yildan keyin ular Balxda dushman sifatida uchrashadi."),
]
def chunks(words):  # words: [(t0, t1, text)] -> subtitle chunks of 2-5 words, about 26 characters
    out, cur = [], []
    for w in words:
        cur.append(w)
        n = sum(len(x[2]) for x in cur) + len(cur) - 1
        end = w[2][-1] in '.?!:'
        if end or n >= 22 or len(cur) >= 5:
            out.append(cur); cur = []
    if cur: out.append(cur)
    m = []
    for c in out:  # no one-word leftovers unless the sentence is one word
        if m and len(c) == 1 and m[-1][-1][2][-1] not in '.?!:' : m[-1] += c
        else: m.append(c)
    return m
tw = root / 'src' / 'words_loy.json'
sents, subs = [], []
if tw.exists():
    words = json.loads(tw.read_text()); i = 0
    for sid, text in SENT:
        n = len(text.split()); ws = words[i:i + n]; i += n
        sents.append(dict(id=sid, t0=ws[0]['s'], t1=ws[-1]['e'], text=text))
        toks = [(w['s'], w['e'], t) for w, t in zip(ws, text.split())]
        for c in chunks(toks): subs.append(dict(t0=round(c[0][0] - 0.04, 3), t1=round(c[-1][1] + 0.2, 3), text=' '.join(x[2] for x in c)))
    assert i == len(words), (i, len(words))
    est = False
else:
    t = 0.5
    for sid, text in SENT:
        ws = text.split(); toks = []; tt = t
        for w in ws:
            d = 0.09 + 0.043 * len(w) + (0.30 if w[-1] in '.?!:' else 0.1 if w[-1] == ',' else 0)
            toks.append((tt, tt + d - (0.3 if w[-1] in '.?!:' else 0), w)); tt += d
        sents.append(dict(id=sid, t0=round(t, 3), t1=round(toks[-1][1], 3), text=text))
        for c in chunks(toks): subs.append(dict(t0=round(c[0][0] - 0.04, 3), t1=round(c[-1][1] + 0.2, 3), text=' '.join(x[2] for x in c)))
        t = tt + 0.3
    est = True
for a, b in zip(subs, subs[1:]): a['t1'] = round(min(a['t1'], b['t0'] - 0.05), 3)
end = round(sents[-1]['t1'] + 4.2, 3)
(root / 'src' / 'loy.json').write_text(json.dumps(dict(fps=30, end=end, estimated=est, sents=sents, subs=subs), ensure_ascii=False))

# ---- textures ----
rng = np.random.default_rng(7)
def tex(base, amp, name, blotch=0.0, blotch_col=(0, 0, 0)):
    h, w = 1920, 1080
    def layer(s):
        a = rng.random((h // s + 2, w // s + 2)).astype(np.float32)
        return np.asarray(Image.fromarray((a * 255).astype('uint8')).resize((w, h), Image.BICUBIC), dtype=np.float32) / 255 - 0.5
    n = layer(160) * 0.55 + layer(48) * 0.3 + layer(12) * 0.1 + layer(3) * 0.12
    img = np.array(base, dtype=np.float32)[None, None, :] + n[:, :, None] * amp
    if blotch:
        b = np.clip((layer(90) + 0.08) * 5, 0, 1)[:, :, None] * blotch
        img = img * (1 - b) + np.array(blotch_col, dtype=np.float32)[None, None, :] * b
    yy = np.linspace(-1, 1, h)[:, None]; xx = np.linspace(-1, 1, w)[None, :]
    v = np.clip(1 - 0.38 * (xx ** 2 * 0.8 + yy ** 2), 0, 1)[:, :, None]
    Image.fromarray(np.clip(img * v, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6)).save(root / 'public' / 'loy' / name, quality=90)
tex((104, 112, 66), 46, 'field.jpg', 0.25, (132, 124, 78))
tex((78, 62, 44), 40, 'mud.jpg', 0.5, (52, 44, 38))
tex((46, 38, 28), 30, 'map.jpg', 0.2, (70, 58, 40))
print('end %.1fs, %d subtitles, estimated=%s' % (end, len(subs), est))
print(' '.join('%s:%.1f' % (s['id'], s['t0']) for s in sents))
