# Donghua dublyaj (xitoycha → o'zbekcha)

Xitoycha videoni yuklaysiz, ilova aktyorlar ovozini fondan ajratadi, gaplarni tarjima qiladi va o'zbekcha AI ovozni
aynan o'sha joylarga qo'yadi. Musiqa, effektlar, kulgi va qichqiriqlar asl holicha qoladi.

## Ishlatish (bepul, Google Colab)

1. Oching: https://colab.research.google.com/github/jamshidrabbimov09-beep/ai-video-/blob/main/dublyaj/Donghua_Dublyaj.ipynb
   (ochilmasa: `Donghua_Dublyaj.ipynb` faylini yuklab oling va colab.research.google.com da "Upload" qiling).
2. Runtime → Change runtime type → **T4 GPU**. Keyin Runtime → **Run all**.
3. Pastda chiqqan `gradio.live` havolasini oching, videoni yuklang, **1. Tahlil qilish** ni bosing.
4. Jadvalda tarjimani va ovozni (E1-E4 erkak, A1-A4 ayol, ASL = asl ovoz qolsin) tuzating.
5. **2. Dublyaj qilish** ni bosing va fayllarni yuklab oling.

## Natija fayllari

- `dublyaj_toliq.wav`: o'zbekcha ovoz + fon, tayyor.
- `faqat_uzbek_ovoz.wav`: faqat o'zbekcha ovoz, gaplar o'z vaqtida turadi (o'zingiz montaj qilish uchun).
- `fon_va_asl_tovushlar.wav`: musiqa, effektlar, kulgi.
- `uzbekcha.srt`: subtitr. `dublyaj_video.mp4`: dublyajli video.

## Cheklovlar

- O'zbekcha bepul ovoz ikkita (Sardor, Madina); personajlar ohang balandligi bilan farqlanadi.
- Avtomatik tarjima (Google) va erkak/ayol aniqlash xato qilishi mumkin: jadvalda tuzatiladi.
- `dublyaj.py` faylini o'zgartirgandan keyin daftarni qayta yig'ish kerak (kod daftar ichiga ko'chirilgan).
