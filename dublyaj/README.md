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

"Qo'shimcha sozlamalar va xatolarni tuzatish" bo'limida:
- **Doimiy qoidalar**: bir marta yozasiz, har safar amal qilinadi (ilova eslab qoladi).
- **Xatoni yozing**: oddiy so'z bilan yozasiz, Claude butun ssenariyda tuzatib, qayta dublyaj qiladi (API kalit kerak).
- Jadvalni qo'lda ham tuzatish mumkin.

Bepul o'zbekcha ovozlarda tayyor "hissiyot" yo'q: his-tuyg'u tezlik, ohang balandligi va ovoz kuchi bilan beriladi.

## Loyihalar va personaj ovozlari

Har bir donghua alohida loyiha: oynaning tepasida nomini yozasiz yoki ro'yxatdan tanlaysiz. Loyiha eslab qoladi:

- personajlar (ismi, jinsi, yoshi, kim kimga sen yoki siz deydi) va Claude'ning eslatmalari;
- har personajning ovoz namunasi: birinchi uchraganda asl ovozidan o'zi yig'iladi (`ovozlar` papkasi), keyingi
  qismlarda o'sha namuna ishlatiladi, shuning uchun ovoz qismdan qismga o'zgarmaydi. Yangi personaj qo'shilsa, u ham
  saqlanadi. Namunani o'zingiz almashtirishingiz mumkin ("Ovozni almashtirish");
- loyihaning doimiy qoidalari va siz yozgan tuzatishlar.

Hammasi `loyihalar/<nom>/` papkasida, tayyor qismlar `loyihalar/<nom>/natija/` da.

Klonlash ovoz tembrini o'tkazadi. Baqiriq va his-tuyg'u tezlik, ohang va ovoz kuchi bilan beriladi; kulgi va
qichqiriqlar asl ovozdan qoladi. Klonlash ishlamasa (`Ovoz_klonlash.bat` bilan qayta o'rnatib ko'ring), oddiy
ovozlar ishlatiladi.

## Natija fayllari

- `dublyaj_toliq.wav`: o'zbekcha ovoz + fon, tayyor.
- `faqat_uzbek_ovoz.wav`: faqat o'zbekcha ovoz, gaplar o'z vaqtida turadi (o'zingiz montaj qilish uchun).
- `fon_va_asl_tovushlar.wav`: musiqa, effektlar, kulgi.
- `uzbekcha.srt`: subtitr. `dublyaj_video.mp4`: dublyajli video.

## Cheklovlar

- O'zbekcha bepul ovoz ikkita (Sardor, Madina); personajlar ohang balandligi bilan farqlanadi.
- Erkak/ayol aniqlash xato qilishi mumkin: jadvalda tuzatiladi.
- `dublyaj.py` o'zgargach `python make_notebook.py` ni ishga tushiring (kod daftar ichiga ko'chirilgan).
