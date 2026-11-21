# "Toshkent. 1994" — 2-qism "Kalit egasi"

Lessons from ep.1 stats (638 views, skip 32%, avg 37 s of 87 s, 29 follows from 473 viewers, likes 11%,
audience 25-54 = 79%): the slow aerial opening lost ~45% in the first 8 s; after 10 s retention is flat.
Ep.2: open on the strongest frame + hook line, title after; end with an on-screen question for comments.
Voice text in LATIN (fix lines in Latin read well); words with "x" avoided (ElevenLabs reads x as "ks").

## ElevenLabs matni (lotin)

```
Meni o'ldirishmadi. Faqat bitta sabab bilan.
O'sha tong uyqum kelmadi.
Sumkani pol taxtasi ostiga yashirdim.
Faqat bir dasta pul oldim. Onamga dori uchun.
Dori sotuvchi pulga qaradi. Keyin menga qaradi. Indamadi.
Peshinda qo'shnim Salim aka keldi.
"Sardor, qora mashinada ikki kishi oq taksini so'rab yurishibdi."
Yuragim muzlab ketdi.
Kechasi uyga qaytayotgandim.
Muyulishda qora mashina yo'limni to'sdi.
Ikki kishi tushdi. Boshimga qop kiygizishdi.
Ko'zimni ochganimda, restoranning orqa tomonida o'tirardim.
Qarshimda bir odam. Sochlari oq. Ko'zlari sovuq.
Hamma uni Hoji aka der edi.
"Rustam mening odamim edi," dedi u sekin.
"Pul menga kerak emas. Kalit qani?"
"Qanday kalit?" dedim.
U jilmaydi. Stolga bitta rasm qo'ydi.
Rasmda onam edi. Bizning uyda. Uxlab yotgan.
"Ertaga soat oltigacha. Kalit menda bo'lsin."
Meni ko'chaga tashlab ketishdi.
Uyga yugurdim. Pol taxtasini ochdim.
Pul joyida edi.
Kalit esa... yo'q edi.
```

On screen only at the end: "KALITNI KIM OLDI? Izohga yozing 👇" + "DAVOMI 3-QISMDA".

## Flow promptlari

STYLE (har promptning oxiriga): `1994 post-Soviet Tashkent, shot on ARRI Alexa, anamorphic lens, 35mm film grain, teal and amber color grade, low-key moody lighting, single frame, photorealistic, vertical 9:16`

Referenslar: Sardor = `public/t94/sardor_portret.jpg` (1-qismdagi portret). Hoji aka portreti avval yasaladi.

0. HOJI AKA portreti (Pro): `Cinematic portrait of Hoji aka, 60-year-old Uzbek crime boss, short white hair, trimmed white beard, cold calm grey eyes, expensive dark cashmere coat over black turtleneck, gold watch, sitting in a dim restaurant back room, cigarette smoke` + STYLE
1. ⭐ Sardor (Pro): `the young man from the reference image tied to a wooden chair in a dark restaurant back room, a single bare light bulb above, harsh light on his bruised face, sweat, darkness around` + STYLE
2. ⭐ Sardor (Pro): `dawn in a modest Soviet apartment, the young man from the reference image kneeling on the floor, lifting a wooden floorboard, hiding a black sports bag underneath, cold blue morning light from the window` + STYLE
3. (Lite): `close-up of a man's hand taking one bundle of US dollars from a black bag, medicine bottles on a wooden table in the background, morning light` + STYLE
4. (Lite): `1990s Soviet pharmacy counter, a suspicious middle-aged pharmacist woman in a white coat holding a 100 dollar bill up to the light, glass shelves with medicine boxes behind her` + STYLE
5. ⭐ (Pro): `courtyard of Soviet apartment blocks in daytime, an elderly Uzbek neighbor in a doppi hat and old jacket whispering worriedly to the young man from the reference image, laundry hanging on balconies` + STYLE
6. (Lite): `a black 1990s Mercedes W124 sedan with tinted windows slowly driving through a Soviet apartment courtyard, two silhouettes inside, overcast sky` + STYLE
7. (Lite): `night street, a black Mercedes W124 blocking a white Lada taxi at a corner, blinding headlights, rain, wet asphalt reflections` + STYLE
8. (Lite): `night, two men in black leather jackets pulling a cloth sack over a young man's head next to a white Lada taxi, motion blur, harsh headlights` + STYLE
9. ⭐ Hoji aka (Pro, Hoji referensi): `the man from the reference image sitting at a table in a dim restaurant back room, tea glasses and an ashtray on the table, smoke, looking directly at the camera with cold calm eyes` + STYLE
10. ⭐ Ikkalasi (Pro, Sardor + Hoji referensi): `the older white-haired man from the second reference image leaning forward across a table, talking quietly, the young man from the first reference image sitting opposite him, frightened, dim restaurant back room, single lamp` + STYLE
11. (Lite): `close-up of an old instant photo lying on a dark wooden table, in the photo an elderly Uzbek woman in a white headscarf sleeping in her bed at night, a man's hand with a gold watch pushing the photo forward` + STYLE
12. ⭐ (Pro): `night, the young man from the reference image thrown out onto a wet empty street from a black car, falling on the asphalt, red tail lights driving away, rain` + STYLE
13. ⭐ (Pro): `the young man from the reference image running up the dark concrete stairs of a Soviet apartment block at night, flickering light bulb, panic on his face` + STYLE
14. (Lite): `top-down view of an open hole under a lifted wooden floorboard, bundles of US dollars inside, an empty dusty outline where a key used to be, a flashlight beam, darkness` + STYLE
