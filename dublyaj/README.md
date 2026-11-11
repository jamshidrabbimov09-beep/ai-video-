# Donghua dublyaj (xitoycha → o'zbekcha)

Xitoycha videoni yuklaysiz, ilova aktyorlar ovozini fondan ajratadi, gaplarni tarjima qiladi va o'zbekcha AI ovozni
aynan o'sha joylarga qo'yadi. Musiqa, effektlar, kulgi va qichqiriqlar asl holicha qoladi.

## Windows kompyuterda (eng oddiy)

1. GitHub'dan repozitoriyni ZIP qilib yuklab oling va oching, `dublyaj` papkasiga kiring.
2. `Dublyaj.bat` faylini ikki marta bosing. Birinchi safar o'zi hamma narsani o'rnatadi (15-30 daqiqa, 5 GB atrofida).
3. Brauzerda oyna ochiladi: videoni tanlang, **Dublyaj qilish** ni bosing. Tayyor audio shu oynada va `natija`
   papkasida chiqadi. Keyingi safar faqat `Dublyaj.bat` ni ochasiz.

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

## Natija fayllari

- `dublyaj_toliq.wav`: o'zbekcha ovoz + fon, tayyor.
- `faqat_uzbek_ovoz.wav`: faqat o'zbekcha ovoz, gaplar o'z vaqtida turadi (o'zingiz montaj qilish uchun).
- `fon_va_asl_tovushlar.wav`: musiqa, effektlar, kulgi.
- `uzbekcha.srt`: subtitr. `dublyaj_video.mp4`: dublyajli video.

## Cheklovlar

- O'zbekcha bepul ovoz ikkita (Sardor, Madina); personajlar ohang balandligi bilan farqlanadi.
- Erkak/ayol aniqlash xato qilishi mumkin: jadvalda tuzatiladi.
- `dublyaj.py` o'zgargach `python make_notebook.py` ni ishga tushiring (kod daftar ichiga ko'chirilgan).
