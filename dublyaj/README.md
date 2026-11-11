# Donghua dublyaj (xitoycha → o'zbekcha)

Xitoycha videoni yuklaysiz, ilova aktyorlar ovozini fondan ajratadi, gaplarni tarjima qiladi va o'zbekcha AI ovozni
aynan o'sha joylarga qo'yadi. Musiqa, effektlar, kulgi va qichqiriqlar asl holicha qoladi.

## Windows kompyuterda (eng oddiy)

1. `Dublyaj_windows.zip` faylini yuklab oling, oching (Extract All) va ichidagi `dublyaj` papkasiga kiring.
2. `Dublyaj.bat` faylini ikki marta bosing. Birinchi safar o'zi hamma narsani o'rnatadi (15-30 daqiqa, 5 GB atrofida).
3. Brauzerda oyna ochiladi: videoni tanlang, **Dublyaj qilish** ni bosing. Tayyor audio shu oynada va
   `loyihalar/<nom>/natija` papkasida chiqadi. Keyingi safar faqat `Dublyaj.bat` ni ochasiz.

## Telefonda (Google Colab orqali)

Telefonning o'zi bu ishni bajara olmaydi, shuning uchun bepul Google serverida ishlaydi:

1. Oching: https://colab.research.google.com/github/jamshidrabbimov09-beep/ai-video-/blob/main/dublyaj/Donghua_Dublyaj.ipynb
2. Runtime → Change runtime type → **T4 GPU**, keyin Runtime → **Run all**.
3. Pastda chiqqan `gradio.live` havolasini oching, videoni tanlang, **Dublyaj qilish** ni bosing.

Tarjima va ovozlarni tuzatish kerak bo'lsa: oynadagi "Qo'lda tuzatish" bo'limi (E1-E4 erkak, A1-A4 ayol,
ASL = asl ovoz qolsin).

## Tarjima: Claude

Google tarjima ishlatilmaydi. Claude butun qismni o'qib, kontekst bilan tarjima qiladi, keyin muharrir sifatida
qayta tahlil qilib tuzatadi (javob oldingi gapga mos, ismlar bir xil, gap vaqtga sig'adi).

- **Bepul yo'l:** tugmani bosgach "Qo'lda tuzatish" bo'limidan `claude_uchun.txt` faylini yuklab oling, Claude
  chatiga yuboring, javobini "Claude javobi" maydoniga qo'yib, "Tarjimani qo'yib, dublyaj qilish" ni bosing.
- **Bir tugmali avtomatik yo'l (pullik):** Claude API kalitini (console.anthropic.com) maydonga yozing. Bu Claude obunasidan
  alohida hisob; bitta qism taxminan 1 dollar atrofida.

## Rollar, hurmat va his-tuyg'u

Claude tarjima bilan birga har gap uchun kim gapirayotganini, jinsi va yoshini (bola, yosh, katta, qari) hamda
his-tuyg'usini (hurmat, g'azab, baqiriq, uyat, shivirlash, qayg'u, quvonch, qo'rquv) aniqlaydi. Sen/siz munosabatga
qarab tanlanadi: dushmanlar va haqoratda sensirash, ustoz va kattalarga siz.

"Tarjima va tuzatish" bo'limida:
- **Doimiy qoidalar**: bir marta yozasiz, har safar amal qilinadi (ilova eslab qoladi).
- **Xatoni yozing**: oddiy so'z bilan yozasiz, Claude butun ssenariyda tuzatib, qayta dublyaj qiladi (API kalit kerak).
- Jadvalni qo'lda ham tuzatish mumkin.

Klonlangan ovozda his-tuyg'u asl gapdan keladi. Oddiy ovozda esa tezlik, ohang balandligi va ovoz kuchi bilan beriladi.

## Loyihalar va personaj ovozlari

Har bir donghua alohida loyiha: "Dublyaj" bo'limining tepasida nomini yozasiz yoki ro'yxatdan tanlaysiz. Loyiha
personajlarni (ismi, jinsi, yoshi, kim kimga sen yoki siz deydi), ovoz namunalarini, qoidalar va tuzatishlarni eslab
qoladi. Hammasi `loyihalar/<nom>/` papkasida, tayyor qismlar `loyihalar/<nom>/natija/` da.

## Ovoz: OmniVoice bilan klonlash (bepul)

OmniVoice (VoiceStudio ilovasi ham shuni ishlatadi) o'zbekcha gapiradi va qisqa yozuvdan ovozni klonlaydi.

- Har gap xitoycha aktyorning aynan o'sha gapidan klonlanadi: ovoz tembri ham, baqiriq, shivir, his-tuyg'u ham
  o'sha gapdan olinadi. Gap asl gap uzunligiga moslab aytiladi.
- Juda qisqa gaplar uchun personajning saqlangan namunasi ishlatiladi (birinchi uchraganda o'zi yig'iladi,
  "Personajlar va ovozlar" bo'limida eshitish va almashtirish mumkin).
- Klonlash ishlamasa, o'sha gaplar oddiy Microsoft ovozida (Sardor, Madina) yoziladi.
- Xitoycha namunadan klonlanganda o'zbekcha nutqda biroz xitoycha talaffuz qolishi mumkin. Shunday bo'lsa,
  personajga o'zbekcha gapiradigan odamning 3-10 soniyalik yozuvini namuna qilib qo'ying.

## Natija fayllari

- `dublyaj_toliq.wav`: o'zbekcha ovoz + fon, tayyor.
- `faqat_uzbek_ovoz.wav`: faqat o'zbekcha ovoz, gaplar o'z vaqtida turadi (o'zingiz montaj qilish uchun).
- `fon_va_asl_tovushlar.wav`: musiqa, effektlar, kulgi.
- `uzbekcha.srt`: subtitr. `dublyaj_video.mp4`: dublyajli video.

## Cheklovlar

- Klonlash uchun NVIDIA videokarta tavsiya etiladi; usiz juda sekin ishlaydi.
- Ilova har ochilganda GitHub'dan o'zini yangilaydi va yetishmayotgan kutubxonalarni o'rnatadi.
- Erkak/ayol aniqlash xato qilishi mumkin: jadvalda tuzatiladi.
- `dublyaj.py` o'zgargach `python make_notebook.py` ni ishga tushiring (kod daftar ichiga ko'chirilgan).
