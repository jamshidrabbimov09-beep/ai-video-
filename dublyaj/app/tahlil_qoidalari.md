# Tahlil va tarjima bosqichi (3-bosqich): Claude uchun qoidalar

Bu bosqichni Claude bajaradi (Claude Code suhbatida yoki keyinchalik API orqali). Kirish: `data/<anime>/<qism>/satrlar.json`,
`kadr/` dagi rasmlar va loyiha xotirasi `data/<anime>/personajlar.json`. Chiqish: o'sha ikki fayl to'ldiriladi.

## 1. Avval butun qismni o'qing
- Hamma satrni boshidan oxirigacha o'qing, voqeani va kim kimga gapirayotganini tushuning. Satrma-satr tarjima qilmang.
- `speaker` (speaker_0, ...) avtomatik aniqlangan va xato bo'lishi mumkin. `kadr/<speaker>_satrN.jpg` rasmlariga qarab va
  matn mazmuniga tayanib har satrga `kim` (personaj identifikatori) qo'ying. Bir speaker ikki personaj bo'lib chiqsa, satrlarni ajrating.
- Loyiha xotirasida personaj allaqachon bo'lsa, o'shani ishlating: ovozi va murojaat shakli saqlanib qolishi shart.

## 2. `personajlar.json`
```json
{"personajlar": {"lin_feng": {"nom": "Lin Feng", "jins": "erkak", "yosh": "17", "xarakter": "o'jar, hazilkash",
   "ovoz_tavsifi": "A 17-year-old boy, bright energetic voice, slightly raspy, confident, fast speaker", "voice_id": ""}},
 "munosabat": [{"kim": "lin_feng", "kimga": "ustoz", "murojaat": "siz", "izoh": "shogird ustozga"}],
 "lugat": {"宗门": "mazhab"}, "eslatma": "qismlar bo'yicha qisqa syujet xotirasi"}
```
- `ovoz_tavsifi` inglizcha yoziladi (ElevenLabs ovoz yaratish uchun): yoshi, jinsi, tembri, xarakteri, gapirish tezligi.
  Hech qachon real odam yoki aktyor nomini yozmang.
- `munosabat`: har juftlik uchun sen yoki siz. Kattaga, ustozga, notanishga siz; yaqin do'st, uka-singil, dushmanga sen.
  Munosabat o'zgarsa (masalan, do'stlashib ketishsa) `izoh` bilan yangilang. Keyingi qismlarda shu jadvalga qat'iy amal qiling.
- `lugat`: ismlar, unvonlar, texnika va joy nomlari har qismda bir xil tarjima qilinishi uchun.

## 3. Har satr uchun `uz` va `teg`
- Ma'no bo'yicha tarjima: bir xil so'z vaziyatga qarab boshqacha tarjima qilinadi. Jonli og'zaki o'zbek tili, kitobiy emas.
- Uzunlik: satr davomiyligi (`end - start`) sekundiga taxminan 13-15 belgi. Sig'masa ma'noni saqlab qisqartiring.
  Ilova `uzun` deb belgilagan satrni qisqartiring, `qisqa` deganini biroz cho'zing.
- `davom: true` satr oldingi satrning pauzadan keyingi davomi: gapni shu pauza joyida bo'lib tarjima qiling, har bo'lak o'z vaqtida aytiladi.
- `tovush: true` satrda so'z yo'q (kulgi, xo'rsinish, qichqiriq): `uz` ga mos tovush yozing ("Ha-ha-ha!", "Oh...") yoki bo'sh qoldiring.
- `teg`: ohang, inglizcha, qavssiz, masalan `angry, shouting`, `whispers`, `crying, voice breaking`, `laughs`, `cold, threatening`,
  `tired, sighs`, `excited`. Oddiy gapda bo'sh qoldiring. Asl ijroga (matn, undov, kadr) qarab qo'ying.
- Har satr o'zi to'liq ibora bo'lsin: gapni "Buning uchun", "hozircha" kabi chala so'z bilan tugatmang (ovoz oxirida g'alati tovush
  chiqaradi). Bo'lingan gapni har bo'lak mustaqil ma'noli bo'ladigan qilib qayta tuzing.
- Faqat bitta tovushdan iborat satr yozmang ("A?!", "Hm?", "Sen..."): ovoz uni harflab o'qiydi. O'rniga haqiqiy so'z ("Nima?!",
  "Iye?") yozing yoki qo'shni satr bilan birlashtiring (qisqasini bo'sh qoldirib, matnni keyingisiga qo'shing).
- `teg` uchun faqat ishonchli belgilar: angry, shouting, furious, whispers, sad, crying, laughs, sighs, calm, cold, warm, gentle,
  serious, worried, excited, surprised, threatening, mocking, proud. "sputtering", "stutter", "gasp" kabilarni ishlatmang
  (harflab o'qishga olib keldi). Bir satrga ko'pi bilan ikkita belgi.
- Ovoz tanlash: o'zbek tilidagi kutubxona ovozlari (egalari ulashgan, `eleven.kutubxona`) inglizcha tayyor ovozlardan tabiiyroq
  o'qiydi; ayol ovozi kutubxonada yo'q (2026-11-17).
- Eshitilishini tekshiring: zamonaviy yoki ikki ma'noli eshitiladigan so'zlardan qoching, raqamlarni so'z bilan yozing.

## 4. Tugagach
- Har personajga ovoz biriktirilganini tekshiring (ilovadagi "Personajlar va ovozlar"). Yangi personajga tavsif yozing.
- Foydalanuvchiga qisqa hisobot: nechta satr, nechta personaj, qaysi satrlarda ishonchingiz komil emas.
