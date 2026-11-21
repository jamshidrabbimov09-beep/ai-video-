"""8-qism rasm promptlari: prompts/8-seriya_rasm_promptlari.md, _flow_paketlar.md, _kmstudio.txt.
1-rasm (Boyazid portreti) ALOHIDA birinchi qilinadi va keyingilarda B referensi bo'ladi."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SUF = ("Cinematic photorealistic, year 1402, Anatolia, Timurid army of Central Asia and the Ottoman army, historically accurate clothing, "
       "armour and weapons, dramatic but readable lighting (no crushed blacks), shallow depth of field, film grain, no text, no modern objects, "
       "no cannons or firearms, no European crowns, no blood or gore, vertical 9:16.")
T = ("the man from the first reference image (Temur, in his late 60s, beard mostly grey, rounded brimless black felt cap with no brim, "
     "dark crimson silk robe with a gold-embroidered collar, leather belt with gold plaques)")
TA = ("the man from the first reference image (Temur, in his late 60s, beard mostly grey, pointed steel helmet with a mail neck guard, "
      "lamellar armour over a dark crimson robe)")
B0 = ("Ottoman Sultan Bayezid I, about 42 years old, strong proud face, thick dark beard with a few grey hairs, large white turban wrapped "
      "around a tall red cap, rich red and gold brocade kaftan")
B = ("the man from the second reference image (Sultan Bayezid, about 42, thick dark beard, large white turban around a tall red cap, "
     "red and gold brocade kaftan)")
BA = ("the man from the second reference image (Sultan Bayezid, about 42, thick dark beard, Ottoman pointed steel helmet wrapped with a "
      "white turban cloth, mail and plate armour over a red kaftan)")
P = [  # (blok, referens, prompt)
 ("A", "-", f"Portrait of {B0}, looking straight at the camera with fierce pride, inside a rich Ottoman tent, warm light."),
 ("A", "TB", f"Dusk, torchlight: two Timurid guards lead {B} with his hands tied in front of him with rope into a huge felt tent; his face pale, tense, proud; his turban crooked."),
 ("A", "T", f"Inside a great felt tent lit by braziers, {T} sits on a low throne and looks up coldly at someone entering, commanders standing in shadow."),
 ("A", "B", f"Extreme close-up of the face of {B}, humiliated but defiant, sweat and dust on his skin, a tear of anger held back, firelight."),
 ("A", "B", f"{BA} on a rearing white horse in front of a huge Ottoman army on a hill, lightning in a stormy sky behind him, glory and power."),
 ("B", "B", f"{B} on a throne in a palace hall of Bursa with tiled arches, ministers bowing, his face ambitious and arrogant, looking east."),
 ("B", "T", f"{T} dictating a letter to a kneeling scribe who writes on a long paper scroll with a reed pen, a tent interior, serious stern face."),
 ("B", "B", f"{B} reading a letter scroll and laughing with contempt, crumpling it in his fist, his courtiers grinning, palace hall."),
 ("C", "T", f"A council in Temur's tent: grey-bearded Timurid commanders in armour exchange worried, doubtful looks; {T} listens in silence, chin on his fist."),
 ("C", "T", f"{T} rises and points firmly to the west, decision made, commanders bowing, warm light falling on his face."),
 ("C", "-", "A huge Ottoman army camped and waiting in a narrow forested mountain valley, thousands of foot soldiers with spears and bows, tents among dense trees, misty."),
 ("C", "T", f"{TA} riding at the head of a vast cavalry army across a dry yellow Anatolian plateau, dust, harsh summer sun, determined."),
 ("C", "-", "Exhausted Ottoman foot soldiers marching under a burning July sun, sweating, dust, heavy shields and spears, a long column on a dry road."),
 ("D", "-", "Timurid soldiers digging a deep well with shovels on a dry plateau, one soldier lifting a leather bucket of muddy water, horses waiting thirsty."),
 ("D", "-", "The citadel of Ankara on a rocky hill above a small river, Temur's huge army camp of felt tents spread on the plain below, summer haze."),
 ("D", "-", "Timurid soldiers throwing tree trunks and logs into a small spring at the foot of a hill, muddy water, a commander pointing."),
 ("D", "-", "Thirsty Ottoman soldiers in the heat, one squeezing an empty waterskin, cracked dry earth, heat haze over the battle plain."),
 ("E", "-", "Dawn on a wide plain near Ankara: two enormous armies stand in battle lines facing each other, banners, drums, dust in the low sun, epic wide shot."),
 ("E", "-", "Temur's war elephants in steel armour with archers in wooden towers on their backs, standing in the centre of the Timurid battle line, Anatolian plain."),
 ("E", "-", "A line of European knights on armoured horses, in blackened full plate armour from head to toe, closed helmets with narrow eye slits, black banners, menacing."),
 ("E", "-", "Black-armoured European knights clash with Timurid horsemen, swords and lances, dust and chaos, the knights holding their ground stubbornly, no blood."),
 ("E", "-", "Black-armoured knights falling back across the plain, Timurid riders pressing them, a dropped black banner in the dust."),
 ("E", "B", f"{BA} stands on a small hill and looks down in shock at his army scattering in every direction across the plain below, dusty sunset."),
 ("E", "B", f"Evening: {BA} fights on foot on the hilltop with a handful of loyal guards around him, sword raised, red sky, exhaustion."),
 ("E", "B", f"{BA} breaks through on horseback at twilight, galloping away, Timurid riders chasing him, dust."),
 ("E", "B", f"A Timurid rider catches up and grabs the reins of the horse of {BA}, both horses rearing, twilight."),
 ("F", "T", f"Close-up of {T} raising his hand and calmly ordering: untie his hands; his face calm and commanding, tent firelight."),
 ("F", "TB", f"Inside the great tent, {T} and {B} sit facing each other on carpets, Bayezid's hands free, Temur speaking, Bayezid listening with lowered eyes."),
 ("F", "TB", f"{T} places a rich gold-embroidered royal robe on the shoulders of {B}, who bows his head, commanders watching in silence."),
 ("F", "B", f"A young Ottoman prince about 15 years old is brought into the tent and runs to embrace {B}, tears of relief, firelight."),
 ("F", "B", f"Months later: {B} sits alone in a white pavilion, older and sick, staring at nothing, grey light through the cloth walls, guards outside."),
 ("G", "-", "1404: a Castilian ambassador in a black velvet doublet and cloak, short beard, a flat black hat, arrives on horseback with a small retinue before the great tiled gate of Samarkand, wonder on his face."),
 ("cover", "B", f"Cover: close-up portrait of {B}, his hands tied with rope in front of his chest, his face full of shock and humiliated pride, Temur's tent fire glowing behind him, empty space at the top and bottom for a title."),
]
md = [f"# 8-qism: rasm promptlari ({len(P)} ta)\n",
      f"Flow: Nano Banana, 9:16, x1 (iloji bo'lsa 2K). Fayl nomlari: p01.jpg ... p{len(P):02d}.jpg (oxirgisi muqova). Nomlari boshqacha bo'lsa ham bo'ladi.",
      "Referenslar: T = Temur (`video/public/p1img/i04.jpg`), B = 1-rasm (Boyazid portreti): uni ALOHIDA birinchi qiling. Avval T, keyin B.",
      "\"Oldingi qismda\" uchun 7-qismning o15 rasmi (fillar Samarqandga kiradi) qayta ishlatiladi; aylanma yo'l xaritasini Claude o'zi chizadi.\n"]
for i, (b, r, p) in enumerate(P, 1):
    md += [f"## p{i:02d} (blok {b}, referens: {r})", "```", f"{p} {SUF}", "```", ""]
open(os.path.join(ROOT, 'prompts/8-seriya_rasm_promptlari.md'), 'w', encoding='utf-8').write("\n".join(md))
open(os.path.join(ROOT, 'prompts/8-seriya_kmstudio.txt'), 'w', encoding='utf-8').write("\n".join(f"{p} {SUF}" for _, _, p in P) + "\n")
pk = ["# 8-qism: Flow uchun, ketma-ket 5 tadan (har prompt to'liq, alohida)\n",
      "T = `i04.jpg` (Temur), B = 1-rasm (Boyazid). 1-rasmni ALOHIDA birinchi qiling. Har paketga yozilgan referenslarni biriktiring, avval T, keyin B.",
      "Rasmlarni menga ZIP qilib yuboring.\n"]
starts = [0] + list(range(1, len(P), 5))
for k, a in enumerate(starts):
    grp = P[a:(starts[k + 1] if k + 1 < len(starts) else len(P))]
    refs = [x for x in ("T", "B") if any(x in g[1] for g in grp)]
    pk += [f"**{a + 1}–{a + len(grp)}** (referens: {', '.join(refs) or '-'})", "```"]
    pk += [f"{a + i}. {p} {SUF}\n" for i, (_, _, p) in enumerate(grp, 1)]
    pk += ["```", ""]
open(os.path.join(ROOT, 'prompts/8-seriya_flow_paketlar.md'), 'w', encoding='utf-8').write("\n".join(pk))
print(len(P))
