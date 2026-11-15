"""5-qism rasm va video promptlarini bitta ro'yxatdan yozadi:
prompts/5-seriya_rasm_promptlari.md (Flow, bittadan) va prompts/5-seriya_kmstudio.txt (KM Studio, bir qatorda bitta prompt)."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SUF = ("Cinematic photorealistic, 14th-century Central Asia, historically accurate clothing and weapons, shallow depth of field, "
       "film grain, no text, no modern objects, no cannons or firearms, no European crowns, vertical 9:16.")
T = ("the man from the first reference image (Temur, in his mid 50s, dark beard streaked with grey, rounded brimless black felt cap with no brim, "
     "dark crimson silk robe with a gold-embroidered collar, leather belt with gold plaques)")
TA = ("the man from the first reference image (Temur, in his mid 50s, dark beard streaked with grey, pointed steel helmet "
      "with a mail neck guard, lamellar armour over a dark crimson robe)")
X = ("the man from the second reference image (Tokhtamysh as khan, around 40, smooth skin, jet-black hair, no grey, sharp "
     "cheekbones, thin moustache, long braided hair, rich golden brocade robe, tall fur-trimmed hat)")

P = [  # (blok, referens, prompt)
 ("A", "T", f"Extreme close-up of the face of {T}, sunburnt skin, dust in his beard, narrowed eyes staring straight into the camera, hot steppe wind, harsh low sun."),
 ("A", "-", "Endless flat green-yellow steppe to the horizon, a long thin column of horsemen and pack camels crossing it, tiny in the frame, heat haze, huge empty sky."),
 ("A", "-", "Close-up of a soldier's cracked hands squeezing an empty leather waterskin over dry cracked earth, not a drop comes out, dust."),
 ("A", "-", "The northern steppe at midnight in early summer: the sky on the horizon is still bright pale gold and blue twilight, a military camp of felt tents with small fires below, white night, eerie calm."),
 ("A", "T", f"{T} riding at the head of a vast cavalry army northwards across the steppe, banners with horse-tail standards behind him, low angle, determined."),
 ("B", "T", f"A winter military camp of felt tents on the steppe at the start of spring, patches of snow, {T} stands at the entrance of his great white tent as a small group of foreign envoys in fur coats rides in, leading nine fine horses on ropes."),
 ("B", "T", f"Close-up: a hunting falcon with a leather hood perched on the gloved hand of {T}, he glances at it coolly, without interest, warm tent light."),
 ("B", "-", "Inside a large felt tent lit by braziers, a steppe envoy in a fur-trimmed coat kneels on a carpet, palms open, speaking humbly, a row of Temur's commanders watching him, Temur's figure seen from behind in the foreground."),
 ("B", "X", f"Portrait of {X} on a throne in a rich tent of the Golden Horde, looking sideways with a cunning, calculating smile, golden light."),
 ("B", "T", f"Close-up of {T} in his tent, his face cold and hard, eyes unforgiving, slowly shaking his head, braziers glowing behind him."),
 ("C", "-", "Exhausted horses walking with heads hanging low across a parched steppe, ribs showing, riders on foot leading them, cracked ground, merciless sun."),
 ("C", "-", "Famine in a military camp: a soldier holds up a single ram's head, around him men offer handfuls of silver coins, hungry gaunt faces, dusk."),
 ("C", "-", "Soldiers in worn quilted coats kneel in the tall steppe grass gathering wild bird eggs into a cloth and pulling up wild herbs and roots, weary."),
 ("C", "-", "A great steppe hunt: a huge ring of horsemen stretching to the horizon drives herds of deer and saiga antelope towards the centre, dust clouds, dramatic aerial view."),
 ("C", "-", "Night in the camp: soldiers roast game meat on spits over many fires, faces lit orange, relief and laughter after hunger."),
 ("D", "T", f"{T} stands alone on the summit of a high rocky hill, seen from behind, looking out over an endless lush green steppe below, wind in his robe, clouds."),
 ("D", "-", "A long chain of soldiers carries heavy stones up a rocky hill slope, passing them hand to hand, master builders stacking them at the top, sunset."),
 ("D", "T", f"A tall tower of stacked stones stands on a hilltop against a golden sunset sky, {T} small at its foot looking up at it, a monument in the empty steppe."),
 ("E", "-", "Dawn over a wide steppe valley with a small river: two enormous armies face each other at a distance, banners and horse-tail standards, mist, tense silence, wide shot."),
 ("E", "-", "The enormous army of the Golden Horde fills the horizon, thousands of steppe horsemen with lances and horse-tail standards, the khan's golden banner in the centre, overwhelming numbers."),
 ("E", "T", f"{TA} on horseback on a low rise, pointing with his hand, commanders around him spreading the army into separate divisions across the plain, a battle plan in motion."),
 ("E", "-", "In front of a huge enemy army, Temur's soldiers calmly dismount and pitch felt tents and unload pack camels as if making an ordinary camp, horses grazing, defiant calm."),
 ("E", "X", f"{X} on horseback in front of his army, staring across the plain in disbelief and confusion, frowning, his commanders exchanging looks."),
 ("F", "-", "The battle begins: two masses of steppe cavalry crash into each other, lances, sabres and bows, dust and churned grass, chaos, motion blur."),
 ("F", "-", "Aerial view of a battle on the steppe: a large wing of enemy horsemen sweeps round in a wide arc towards the rear of Temur's army and its tent camp, dust trails."),
 ("F", "T", f"{TA} charges forward at full gallop at the head of his guard, sabre raised, his banner behind him, fierce face, dust and sunlight."),
 ("F", "X", f"{X} pulls his horse round and flees from the battlefield with a few guards, looking back in fear, his golden banner left behind falling in the dust."),
 ("G", "-", "A wide grey river (the Volga) in the north, fleeing Golden Horde horsemen driven into the reeds and the water by pursuing riders, splashing, panic, overcast sky."),
 ("G", "-", "An abandoned Golden Horde camp after the rout: empty yurts, overturned carts, scattered weapons and a trampled golden banner in the mud, smoke drifting."),
 ("H", "X", f"{X} rides at the head of his army through high snowy Caucasus mountain passes, grim and determined, a long line of horsemen behind him."),
 ("H", "T", f"Night: {TA} leads his army fording a fast mountain river (the Terek) at a hidden shallow crossing, horses chest-deep in the water, torchlight, steep banks."),
 ("H", "X", f"{X} alone on foot in a ruined, smoking camp after defeat, his tall fur-trimmed hat lying in the mud at his feet, broken, staring at nothing."),
 ("H", "T", f"{T} stands alone at sunset on the steppe, older and weary, looking down at a single folded old blue coat with a torn fur collar in his hands, deep thought, bitter."),
 ("I", "T", f"{T} stands over a large hand-drawn parchment map on a low table in a tent, his finger moving south towards the mountains of Iran and India, candlelight, ambition."),
 ("I", "-", "Indian war elephants in heavy armour with riders and wooden towers on their backs, lined up on a dusty plain under a hot sky, menacing, low angle, 14th century."),
]

VIDEO = [  # (rasm raqami, prompt)
 (22, "The soldiers keep calmly pitching tents and unloading camels, a tent rises in the foreground, horses graze, in the far background the huge enemy army waits motionless. Slow push-in camera, natural movement, no text."),
 (26, "Temur and his guard gallop straight towards the camera at full speed, sabres raised, banner flapping, dust flying, camera tracks backwards in front of them. No text."),
 (28, "Fleeing horsemen plunge into the river and the reeds, water splashing, pursuing riders arrive behind them on the bank, slow camera pan along the river. No text."),
]

md = ["# 5-qism: rasm promptlari (%d ta) va video promptlar (%d ta)\n" % (len(P), len(VIDEO)),
      "Flow: Nano Banana, 9:16, x1. Fayl nomlari: m01.jpg ... m%02d.jpg (yoki KM Studio nomlari: 1-IMAGE-..., men o'zim moslayman)." % len(P),
      "Referenslar: T = Temur (`video/public/p1img/i04.jpg`), X = To'xtamish (`video/public/p3img/k34.jpg`).",
      "X kerak bo'lgan rasmda ham T ni birinchi, X ni ikkinchi biriktiring (promptlar \"first\" = Temur, \"second\" = To'xtamish deydi).",
      "Rasmsiz joylar (Claude o'zi harakatli qiladi): Sig'noq - Sariq O'zan - Ulug' tog' - Qunduzcha yo'li (kun hisoblagichi), Qunduzcha",
      "jangi sxemasi (yetti qism, orqaga aylanish), Itilgacha quvish, 1395 Terek, janubga strelka (ilgak). Oxirgi gapda 4-qismdagi yarador",
      "To'xtamish rasmi (l03) eslatma sifatida qayta ishlatiladi.",
      "KM Studio uchun xuddi shu promptlar `5-seriya_kmstudio.txt` da (bir qatorda bitta, tartib raqami = rasm raqami).\n"]
for i, (b, r, p) in enumerate(P, 1):
    md += [f"## {i:02d} (blok {b}, referens: {r})", "```", f"{p} {SUF}", "```", ""]
md += ["## Video promptlar (Flow, rasmdan video, har biri kredit oladi: kuniga 50)",
       "Boshlang'ich kadr sifatida ko'rsatilgan rasmni qo'ying. 8 s, 9:16.\n"]
for n, p in VIDEO:
    md += [f"### V{n:02d} (boshlang'ich kadr: {n:02d})", "```", p, "```", ""]
open(os.path.join(ROOT, 'prompts/5-seriya_rasm_promptlari.md'), 'w', encoding='utf-8').write("\n".join(md))
open(os.path.join(ROOT, 'prompts/5-seriya_kmstudio.txt'), 'w', encoding='utf-8').write(
    "\n".join(f"{p} {SUF}" for _, _, p in P) + "\n")
pk = ["# 5-qism: Flow uchun, ketma-ket 5 tadan (har prompt to'liq, alohida)\n",
      "Har paketga yozilgan referens rasmlarni biriktiring: T = `i04.jpg` (Temur), X = `k34.jpg` (To'xtamish). Doim shu tartibda:",
      "avval T, keyin X (promptlar \"first\" = Temur, \"second\" = To'xtamish deydi).\n"]
for a in range(0, len(P), 5):
    grp = P[a:a + 5]
    refs = [r for r in ("T", "X") if any(r in g[1] for g in grp)]
    if "X" in refs and "T" not in refs:
        refs = ["T", "X"]
    pk += [f"**{a + 1}–{a + len(grp)}** (referens: {', '.join(refs) or '-'})", "```"]
    pk += [f"{a + i}. {p} {SUF}\n" for i, (_, _, p) in enumerate(grp, 1)]
    pk += ["```", ""]
open(os.path.join(ROOT, 'prompts/5-seriya_flow_paketlar.md'), 'w', encoding='utf-8').write("\n".join(pk))
print(len(P), "rasm,", len(VIDEO), "video")
