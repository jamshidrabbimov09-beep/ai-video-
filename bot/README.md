# Instagram izoh boti

Har 30 daqiqada (Toshkent vaqti 07:00-24:00) oxirgi postlardagi yangi izohlarni o'qiydi va kanal egasi nomidan
qisqa javob yozadi. Javob matnini Claude (`ANTHROPIC_API_KEY` bo'lsa, pullik) yoki Gemini (bepul zaxira)
`persona.md` va `videolar/*.md` dagi ko'rsatmalar bo'yicha yozadi. Spam, haqorat
va faqat emojidan iborat izohlar o'tkazib yuboriladi. Javob yozilgan izohga qayta javob yozilmaydi.

## Sozlash (bir marta)

1. **Gemini kaliti:** aistudio.google.com > "Get API key" > "Create API key". Kalitni nusxalang.
2. **Instagram tokeni:** developers.facebook.com > My Apps > Create App > "Instagram API" ishlatiladigan ilova.
   Instagram > "API setup with Instagram login" > "Generate access tokens" > @unutilgan_qissalar bilan kiring >
   tokenni nusxalang. Kerakli ruxsatlar: `instagram_business_basic`, `instagram_business_manage_comments`.
3. **GitHub:** repo > Settings > Secrets and variables > Actions:
   - Secrets: `IG_TOKEN` va `ANTHROPIC_API_KEY` (console.anthropic.com, pullik) yoki `GEMINI_API_KEY`.
   - Variables: `DRY_RUN` = `1` (sinov). Javoblar yaxshi chiqsa, `0` qilinadi va bot haqiqatan yoza boshlaydi.
4. Actions > "Instagram izohlariga javob" > Run workflow. Natija ishga tushirishning Summary sahifasida ko'rinadi.

Jadval bo'yicha ishga tushish faqat `main` branchda ishlaydi.

## Eslatmalar

- Instagram tokeni 60 kun amal qiladi: taxminan har 50 kunda 2-qadamni takrorlab, `IG_TOKEN` ni yangilang.
- Bot uslubini o'zgartirish uchun `persona.md` ni tahrirlang (masalan, yangi qism chiqqanda).
- Sozlamalar: `MAX_REPLIES` (bir ishga tushishda 8 ta javob), `MAX_AGE_DAYS` (7 kundan eski izohlarga javob yo'q).

## Har bir video uchun ma'lumot

`videolar/` papkasiga fayl qo'shiladi. Birinchi qator: `kalit: so'z1, so'z2`. Post matnida shu so'zlardan
biri bo'lsa, fayldagi ma'lumot (variantlar, video mazmuni) o'sha post izohlariga javob yozishda ishlatiladi.
