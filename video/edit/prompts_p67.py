"""6- va 7-qism rasm promptlari: prompts/6-seriya_*.md, prompts/7-seriya_* (Flow bittadan, paketlar 5 tadan, KM Studio)."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SUF = ("Cinematic photorealistic, year 1398, Timurid army of Central Asia and the Delhi Sultanate of northern India, historically "
       "accurate clothing, armour and weapons, shallow depth of field, film grain, no text, no modern objects, no cannons or firearms, "
       "no European crowns, no blood or gore, vertical 9:16.")
T = ("the man from the first reference image (Temur, in his early 60s, dark beard heavily streaked with grey, rounded brimless black felt "
     "cap with no brim, dark crimson silk robe with a gold-embroidered collar, leather belt with gold plaques)")
TA = ("the man from the first reference image (Temur, in his early 60s, dark beard heavily streaked with grey, pointed steel helmet with a "
      "mail neck guard, lamellar armour over a dark crimson robe)")
PM = ("a young Timurid prince about 22 years old (Pir Muhammad), short black beard, pointed steel helmet with a gold band, lamellar armour "
      "over a dark blue robe")
PMR = "the young prince from the second reference image (Pir Muhammad, pointed steel helmet with a gold band, lamellar armour over a dark blue robe)"
KS = "a Timurid boy prince about 14 years old (Khalil Sultan), beardless, light helmet, green silk robe over mail"
EL = ("Indian war elephants of the Delhi Sultanate in heavy quilted and plated armour, a wooden tower platform on each back with five or six "
      "archers in it")
INDIAN = "Delhi Sultanate soldiers in white and saffron cotton tunics, turbans, round shields, spears and bows"

P6 = [  # (blok, referens, prompt)
 ("A", "-", f"Low angle: a long line of {EL} emerging from a cloud of dust on a wide dry plain, enormous, menacing, grey December sky."),
 ("A", "-", "Close-up of a young Central Asian soldier of Temur's army in a quilted coat and felt cap, eyes wide in shock, staring up at something huge off-screen, the grey shape of an elephant blurred in the background."),
 ("B", "T", f"{T} rides at the head of his cavalry army through a rocky mountain pass heading south, banners with horse-tail standards, determined, epic wide shot."),
 ("C", "-", "Summer in the high snowy mountains of Afghanistan: horses sunk chest-deep in snow, soldiers on foot pulling them by the reins, felt mats laid on the snow, blinding white peaks."),
 ("C", "-", "Night in the snowy mountains: a long column of soldiers and horses walking on frozen moonlit snow, breath steaming, stars, a narrow trail along a ridge."),
 ("C", "T", f"{T} sits in a wooden litter-chair hanging on long ropes against a sheer snowy cliff, being lowered down, soldiers above holding the ropes, abyss below, calm face."),
 ("C", "-", "Close-up: straining hands of soldiers gripping thick ropes over the edge of a snowy cliff, the ropes running down into the void, effort, snow dust."),
 ("D", "-", "The city of Delhi in December 1398: massive stone walls and gates, domes and minarets of the Delhi Sultanate behind them, morning haze, wide shot."),
 ("D", "-", f"Two Delhi Sultanate rulers on horseback, a young sultan in a jewelled turban and a stern older noble with a grey beard in a white muslin robe, riding out of the city gate at the head of {INDIAN}."),
 ("D", "-", f"A vast army of the Delhi Sultanate on a plain before the city: cavalry, thousands of foot soldiers and a row of {EL}, banners, dust, aerial view."),
 ("D", "-", "Extreme close-up of an armoured war elephant: overlapping armour plates on its head, a steel spike on its tusk, a small eye, a wooden tower above it."),
 ("D", "-", "Looking up from the ground at the wooden tower platform on an armoured war elephant's back, five archers in turbans drawing their bows, sky behind them."),
 ("E", "T", f"Inside a large tent, {T} turns to a small group of elderly scholars in robes and white turbans and asks them a question, a slight smile, lamp light."),
 ("E", "-", "A group of elderly scholars in robes and white turbans, trembling with fear, one stammering and pointing back towards the rear of the camp, comic fright, lamp light."),
 ("E", "T", f"Close-up of {T} laughing heartily, head thrown back a little, eyes creased, warm lamp light."),
 ("F", "-", "Soldiers of Temur's army digging a long deep ditch around a camp and raising a wooden palisade of tree trunks and branches behind it, busy, dust."),
 ("F", "-", "A row of black water buffaloes tied to each other in front of a wooden palisade, the army camp behind it, tense evening light."),
 ("F", "-", "Dawn on 17 December: mist over a wide plain, the long lines of Temur's cavalry stand ready in silence, banners hanging still, cold blue light."),
 ("F", "-", f"{EL} advancing straight towards the camera through the morning mist, the ground shaking, dust rising around their feet."),
 ("G", "-", "Seen from behind: a lone young prince in a pointed helmet stands with a drawn sabre facing a gigantic armoured war elephant that towers over him, dramatic backlight, silhouette."),
 ("cover", "T", f"Cover: close-up portrait of {TA}, fierce determined face, eyes narrowed, behind him blurred huge armoured war elephants in dust, golden backlight, empty space at the top and bottom for a title."),
]

P7 = [
 ("A", "-", f"Portrait of {PM}, sabre raised, fierce face, a huge armoured war elephant behind him, dust and sunlight."),
 ("A", "T", f"{T} on horseback watching as his soldiers lead a long row of captured armoured war elephants towards him, satisfied face, dust, afternoon sun."),
 ("C", "TP", f"{PMR} charges on horseback at an armoured war elephant and strikes it with his sabre, the elephant rears, archers in its tower above, dust."),
 ("C", "-", "Temur's horse archers shoot arrows up at the wooden towers on the war elephants, archers in the towers falling backwards, chaos of battle, no blood."),
 ("C", "-", "Soldiers with sabres surround a rearing armoured war elephant, one slashing at its raised trunk, the elephant trumpeting, dust, no blood."),
 ("C", "-", f"{INDIAN} and their elephants retreating in disorder towards the walls of Delhi, dust clouds, Temur's horsemen chasing them."),
 ("C", "-", f"{KS} cheerfully drives a big armoured war elephant ahead of him with a stick, like a herdsman driving a cow, its riders gone, light-hearted moment on the battlefield."),
 ("C", "T", f"{T} smiling proudly at his young grandson who has brought him an elephant, commanders around them laughing."),
 ("C", "-", "Night: two riders in turbans with a few guards flee through a small city gate of Delhi under the moon, looking back in fear."),
 ("D", "T", f"The gates of Delhi open, nobles, judges and scholars in white robes come out on foot and bow before {T} on horseback, his banners and drums above the gate."),
 ("D", "-", "Night street fighting in Delhi: Timurid soldiers clash with townspeople among narrow streets, torches, the first fires catching on the houses."),
 ("D", "-", "Wide shot of Delhi burning: thick smoke rising over the domes and walls, orange glow, the sky dark with smoke."),
 ("D", "T", f"{T} on horseback outside the city, looking at the smoke over Delhi, his face grim and heavy, lips pressed, not triumphant."),
 ("E", "-", "A long caravan of war elephants without armour, led by mahouts, walking along a mountain road northwards, followed by camels and horsemen, distant snowy peaks."),
 ("E", "-", "Spring 1399: war elephants enter Samarkand through a great city gate decorated with blue tiles, crowds lining the street, blossoming trees."),
 ("E", "-", "Samarkand townspeople, children on their fathers' shoulders, staring in amazement at a huge elephant passing by, open mouths, pointing, spring sunlight."),
 ("F", "T", f"{T} stands on a terrace in Samarkand at sunset, looking towards the west, dark storm clouds gathering on the western horizon."),
 ("F", "-", "Silhouette of an Ottoman sultan in a large white turban and red kaftan on horseback on a hill, a huge army with banners behind him, the west, dramatic, ominous."),
 ("cover", "TP", f"Cover: close-up portrait of {PMR}, battle fury in his face, sabre raised, behind him a burning Delhi skyline in smoke, empty space at the top and bottom for a title."),
]

def write(n, P, letter, notes, first=0):
    md = [f"# {n}-qism: rasm promptlari ({len(P)} ta)\n",
          f"Flow: Nano Banana, 9:16, x1. Fayl nomlari: {letter}01.jpg ... {letter}{len(P):02d}.jpg (oxirgisi muqova).",
          "Referenslar: T = Temur (`video/public/p1img/i04.jpg`)" + notes + "\n"]
    for i, (b, r, p) in enumerate(P, 1):
        md += [f"## {letter}{i:02d} (blok {b}, referens: {r})", "```", f"{p} {SUF}", "```", ""]
    open(os.path.join(ROOT, f'prompts/{n}-seriya_rasm_promptlari.md'), 'w', encoding='utf-8').write("\n".join(md))
    open(os.path.join(ROOT, f'prompts/{n}-seriya_kmstudio.txt'), 'w', encoding='utf-8').write("\n".join(f"{p} {SUF}" for _, _, p in P) + "\n")
    pk = [f"# {n}-qism: Flow uchun, ketma-ket 5 tadan (har prompt to'liq, alohida)\n",
          "Har paketga yozilgan referens rasmlarni biriktiring. T = `i04.jpg` (Temur)" + notes + "\n"]
    starts = ([0] if first else []) + list(range(first, len(P), 5))
    for k, a in enumerate(starts):
        grp = P[a:(starts[k + 1] if k + 1 < len(starts) else len(P))]
        refs = [x for x in ("T", "P") if any(x in g[1] for g in grp)]
        pk += [f"**{a + 1}–{a + len(grp)}** (referens: {', '.join(refs) or '-'})", "```"]
        pk += [f"{a + i}. {p} {SUF}\n" for i, (_, _, p) in enumerate(grp, 1)]
        pk += ["```", ""]
    open(os.path.join(ROOT, f'prompts/{n}-seriya_flow_paketlar.md'), 'w', encoding='utf-8').write("\n".join(pk))

write(6, P6, "n", ". 3-o'rin (\"Oldingi qismda\") uchun 5-qismning m16 rasmi qayta ishlatiladi, yo'l xaritasini Claude o'zi chizadi.")
write(7, P7, "o", ", P = 7-qismning 1-rasmi (Pir Muhammad), u chiqqandan keyin biriktiriladi. Avval T, keyin P. "
      "\"Oldingi qismda\" uchun 6-qismning n01 rasmi qayta ishlatiladi. "
      "1-rasmni ALOHIDA birinchi qiling: u P referensi bo'ladi.", first=1)
print(len(P6), len(P7))
