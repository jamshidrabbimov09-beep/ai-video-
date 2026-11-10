"""Part 1 edit decision list. All times are seconds on the master voice track (public/voice/all.mp3).
Run: python3 edit/edit.py  ->  writes src/edit.json (used by Remotion) and edit/sfx_plan.json (used by the audio mixer).
"""
import json, pathlib

END = 114.6
shots = []
def S(t0, t1, img, mv='in', tr='cut', grade='warm', **kw):
    shots.append(dict(t0=t0, t1=t1, img=img, mv=mv, tr=tr, grade=grade, **kw))

# ---- hook / intro ----
S(0.00, 1.60, '01', 'inslow', 'dip')
S(1.60, 2.60, '02', 'punch', 'whip')
S(2.60, 5.30, '03', 'in')
S(5.30, 6.90, '21', 'panR', 'zoom')
S(6.90, 9.00, '22', 'punch', 'flash', shake=1.2)
S(9.00, 11.90, '04', 'in2')
S(11.90, 13.65, '05', 'punch', 'whip')
# ---- Seiston ----
S(13.65, 15.90, '06', 'panL', 'flash', shake=0.8)
S(15.90, 18.30, '10', 'out', 'fade', grade='cold')
S(18.30, 19.50, '06', 'detailR', 'flash', grade='cold', shake=1.4)
S(19.50, 20.80, '07', 'in', 'whip', grade='cold')
S(20.80, 21.75, '08', 'panL', 'whip', grade='cold')
S(21.75, 22.45, '09', 'punch', 'glitch', grade='cold')
S(22.45, 24.45, '05', 'inslow', 'fade', grade='cold')
S(24.45, 29.30, '11', 'in', 'flash')
S(29.30, 31.70, '10', 'out', 'fade', grade='cold')
S(31.70, 34.20, '30', 'up', 'zoom')
# ---- birth ----
S(34.20, 36.20, None, 'none', 'dip')
S(36.20, 38.90, '12', 'in', 'dip')
S(38.90, 40.90, '13', 'panL', 'whip')
S(40.90, 42.30, '14', 'out', 'cut')
S(42.30, 45.70, '15', 'inslow', 'fade')
S(45.70, 48.00, '16', 'in', 'fade')
S(48.00, 51.60, '19', 'blur', 'fade')
# ---- legend (sepia) ----
S(51.60, 54.00, '17', 'in', 'flash', grade='sepia')
S(54.00, 56.60, '18', 'in', 'whip', grade='sepia')
S(56.60, 58.70, '28', 'panR', 'cut', grade='sepia')
S(58.70, 61.30, '28', 'detailL', 'cut', grade='sepia')
S(61.30, 63.80, '19', 'blur', 'fade', grade='sepia')
# ---- politics ----
S(63.80, 66.80, '20', 'map', 'dip')
S(66.80, 68.90, '21', 'in', 'whip')
S(68.90, 70.90, '22', 'punch', 'flash', shake=1.2)
S(70.90, 73.70, '23', 'in', 'whip')
S(73.70, 76.60, '24', 'in')
S(76.60, 78.90, '25', 'in', 'flash')
S(78.90, 80.90, '26', 'in', 'fade')
S(80.90, 83.00, '26', 'faceR', 'cut')
S(83.00, 85.40, '31', 'out', 'fade')
S(85.40, 88.60, '27', 'in', 'zoom')
S(88.60, 91.00, '28', 'panL', 'whip')
S(91.00, 93.80, '13', 'in', 'cut')
# ---- wound / hook for part 2 ----
S(93.80, 95.80, '06', 'punch', 'flash', grade='cold', shake=1.2)
S(95.80, 99.20, '29', 'in', 'whip', grade='cold')
S(99.20, 102.40, '30', 'in', 'fade')
S(102.40, 105.00, '33', 'out', 'dip')
S(105.00, 106.90, '27', 'punch', 'zoom', grade='cold')
S(106.90, 109.20, '32', 'inslow', 'glitch')
S(109.20, 112.00, '32', 'faceL', 'cut', grade='cold')
S(112.00, END, None, 'none', 'dip')

# overlays: k = kin(kinetic text) | big | date | tag | map | end | bars | label
over = [
    dict(k='label', t0=0.3, t1=3.8, text="Dramatizatsiya · AI yordamida yaratilgan tasvirlar"),
    dict(k='kin', t0=2.86, t1=3.75, text="NA XON", top=260, size=96),
    dict(k='kin', t0=3.96, t1=5.25, text="NA CHINGIZ AVLODI", top=260, size=72),
    dict(k='title', t0=9.96, t1=11.90, text="AMIR TEMUR"),
    dict(k='kin', t0=12.22, t1=13.60, text="BIR O'QDAN TUG'ILGAN", top=260, size=62),
    dict(k='date', t0=14.60, t1=17.70, text="1363"),
    dict(k='kin', t0=16.02, t1=17.70, text="SEISTON", top=470, size=64),
    dict(k='kin', t0=22.72, t1=24.20, text="UMRBOD CHO'LOQ", top=260, size=78),
    dict(k='big', t0=25.58, t1=27.85, text="TEMUR-I LANG"),
    dict(k='big', t0=27.90, t1=29.35, text="CHO'LOQ TEMUR"),
    dict(k='kin', t0=32.52, t1=34.00, text="TIZ CHO'KISHNI BILMAYDI", top=260, size=60),
    dict(k='big', t0=34.30, t1=36.00, text="BOSHIDAN BOSHLAYMIZ"),
    dict(k='date', t0=36.94, t1=38.90, text="1336"),
    dict(k='kin', t0=38.36, t1=38.90, text="KESH", top=470, size=64),
    dict(k='kin', t0=39.46, t1=40.85, text="SHAHRISABZ", top=260, size=72),
    dict(k='kin', t0=40.94, t1=42.25, text="BARLOS QABILASI", top=260, size=66),
    dict(k='kin', t0=44.06, t1=45.65, text="KICHIK AMIR TARAG'AY", top=260, size=56),
    dict(k='kin', t0=46.12, t1=47.95, text="SANA - MANBALARDA HAR XIL", top=260, size=54),
    dict(k='big', t0=48.10, t1=51.45, text="AYNAN SHU KUNI - DEMAYMIZ", size=70),
    dict(k='tag', t0=52.02, t1=63.15, text="RIVOYAT"),
    dict(k='big', t0=61.44, t1=63.50, text="RIVOYAT HALI TARIX EMAS", size=70),
    dict(k='map', t0=63.80, t1=66.80),
    dict(k='kin', t0=64.72, t1=66.75, text="MOVAROUNNAHR", top=260, size=70),
    dict(k='kin', t0=66.90, t1=68.80, text="MO'G'UL XONLARI", top=260, size=64),
    dict(k='kin', t0=68.20, t1=69.20, text="URUSHAR", top=420, size=70),
    dict(k='kin', t0=69.92, t1=70.85, text="O'Z MANFAATI", top=260, size=70),
    dict(k='date', t0=72.40, t1=74.30, text="1360"),
    dict(k='kin', t0=74.36, t1=76.30, text="TUG'LUQ TEMUR", top=260, size=70),
    dict(k='kin', t0=76.70, t1=78.50, text="YOSH TEMUR", top=260, size=78),
    dict(k='kin', t0=80.04, t1=81.30, text="XIYONAT?", top=260, size=88),
    dict(k='kin', t0=82.06, t1=82.95, text="AQL?", top=260, size=88),
    dict(k='kin', t0=83.96, t1=85.30, text="YO'LINI O'ZGARTIRDI", top=260, size=60),
    dict(k='kin', t0=86.58, t1=88.50, text="AMIR HUSAYN", top=260, size=78),
    dict(k='kin', t0=92.98, t1=93.75, text="TO'XTAMADI", top=260, size=78),
    dict(k='kin', t0=95.90, t1=97.40, text="SEISTON", top=260, size=78),
    dict(k='kin', t0=101.28, t1=102.40, text="TARK ETMADI", top=260, size=74),
    dict(k='kin', t0=103.02, t1=104.90, text="HECH KIM TANIMASDI", top=260, size=60),
    dict(k='kin', t0=105.06, t1=106.85, text="BU ITTIFOQ", top=260, size=84),
    dict(k='kin', t0=107.06, t1=109.15, text="ENG KATTA XAVF", top=260, size=76),
    dict(k='kin2', t0=109.34, t1=111.95, text="DO'ST DUSHMANGA AYLANGANDA NIMA BO'LADI?", top=250, size=58),
    dict(k='end', t0=112.02, t1=END, text="KEYINGI QISMDA", sub="@unutilgan_qissalar"),
    dict(k='bars', t0=18.30, t1=24.45),
    dict(k='bars', t0=93.80, t1=99.20),
    dict(k='bars', t0=109.20, t1=112.00),
]

out = dict(fps=30, end=END, shots=shots, over=over)
root = pathlib.Path(__file__).resolve().parent.parent
(root / 'src' / 'edit.json').write_text(json.dumps(out, ensure_ascii=False))

# SFX plan for the mixer
sfx = []
for s in shots[1:]:
    if s['tr'] == 'whip':   sfx.append(dict(k='whoosh', t=s['t0'] - 0.12))
    elif s['tr'] == 'zoom': sfx.append(dict(k='whoosh_soft', t=s['t0'] - 0.15))
    elif s['tr'] == 'flash': sfx.append(dict(k='hit', t=s['t0']))
    elif s['tr'] == 'glitch': sfx.append(dict(k='glitch', t=s['t0']))
for o in over:
    if o['k'] in ('title', 'big', 'date', 'end'): sfx.append(dict(k='hit_soft', t=o['t0']))
sfx += [dict(k='riser', t=7.9, dur=2.0), dict(k='riser', t=106.2, dur=3.0),
        dict(k='heart', t=18.3, dur=6.2), dict(k='heart', t=94.0, dur=5.4)]
(root / 'edit' / 'sfx_plan.json').write_text(json.dumps(sfx))
print(len(shots), 'shots;', len(over), 'overlays;', len(sfx), 'sfx;', 'avg shot %.2fs' % ((END) / len(shots)))
