# "Tasavvur qil" 3-qism: Sen Anqara jangidasan (ElevenLabs matni)

HOLAT: qoralama, foydalanuvchi tasdiqlashi kerak (yozib olishdan OLDIN).
Nom (tavsiya): "Anqara: Temur va Chaqmoq sulton". Muqova: "Tasavvur qil: Temur Yildirim Boyazidga qarshi!"
Ovoz va sozlamalar oldingi qismlardagidek (Eleven v4, Stability past, Speed 1.1). Pauza teglari yo'q. ~170 so'z, 60-65 s.

```
[excited] Tasavvur qil: ming to'rt yuz ikkinchi yil, jazirama yoz. Sen Anqara yonidasan va hozir dunyoning ikki eng kuchli hukmdori to'qnashadi! Bir tomonda Amir Temur. Boshqa tomonda usmonli sulton Yildirim Boyazid. Yildirim degani chaqmoq. U yevropalik ritsarlarni ham yenggan! [serious] Hammasi xatlardan boshlandi. Ikki hukmdor bir-biriga haqoratli xatlar yozdi. Endi gap tugadi. [curious] Lekin Temur jangni boshlanmasdan oldin yutib qo'ygan edi. Qanday qilib? U dushmanni jaziramada uzoq yo'l yurishga majbur qildi. Keyin suvni o'z tomoniga burib oldi. Sultonning askarlari CHANQAGAN va charchagan holda yetib keldi. [excited] Jang boshlandi! Temur qo'shinida Hindistondan keltirilgan fillar bor. Eng qizig'i esa keyin bo'ldi: jang qizigan paytda sulton qo'shinidagi tatarlar Temur tomoniga O'TIB ketdi! [serious] Sulton qochmoqchi bo'ldi, lekin asirga tushdi. Rivoyatga ko'ra, uni temir qafasda olib yurishgan. Natijada usmonlilar o'n yil o'zaro urushga botdi. Konstantinopol esa yana ellik yil yashab qoldi. [curious] Endi sen Temursan. Qo'lingda asir sulton. Nima qilasan? Birinchi: ozod qilaman. Ikkinchi: asirda saqlayman. Uchinchi: o'zimga ittifoqchi qilaman. [excited] Izohda yoz: bir, ikki yoki uch!
```

Ovozga moslash: yillar va sonlar so'z bilan, iqtibos yo'q, "-isan" bilan tugaydigan so'z yo'q, gaplar qisqa va bir-biriga bog'langan
("Hammasi xatlardan boshlandi" -> "Endi gap tugadi" -> "Lekin Temur oldin yutib qo'ygan edi. Qanday qilib?" -> javob -> "Natijada").
KATTA harfli 2 so'z urg'u uchun. Teg o'qib yuborilsa, o'chiring.

## Fakt tekshiruvi
- Anqara jangi 1402-yil yozida (ko'p manbada 28-iyul, ba'zilarida 20-iyul) bo'lgan. Kun aytilmaydi.
- Boyazid I laqabi "Yildirim" (chaqmoq); 1396-yil Nikopolda Yevropa salibchi ritsarlarini yenggan. To'g'ri.
- Temur va Boyazid bir-biriga haqoratli xatlar yozgan (Ibn Arabshoh, Yazdiy). To'g'ri.
- Temur usmonli qo'shinini aylanib o'tib Anqaraga birinchi yetib kelgan, usmonlilar jaziramada orqaga qaytib yurishga majbur bo'lgan,
  Temur suv manbalarini egallagan va soyni (Chubuq) burib yuborgan. Zamonaviy tarixlarda keng aytiladi.
- Temur qo'shinida Hindistondan keltirilgan jangovar fillar bo'lgan. To'g'ri.
- Jang paytida qora tatarlar va Anado'li bekliklari askarlari Temur tomoniga o'tgan (ularning sobiq beklari Temur qarorgohida edi). To'g'ri.
- Boyazid asirga olingan va 1403-yil asirlikda vafot etgan. Temir qafas: RIVOYAT (ekranda shunday belgilanadi).
- Keyin usmonlilarda 1402-1413 yillardagi o'zaro taxt urushi ("o'n yil") bo'lgan. Konstantinopol 1453-yilda olingan ("ellik yil"). To'g'ri.
- Qo'shinlar soni aytilmaydi (manbalardagi raqamlar ishonchsiz).
- Oxiridagi tanlov tomoshabin uchun. Videoda yoki izohga javobda haqiqat aytiladi: Temur sultonni asirda saqlagan, unga hurmat
  ko'rsatgani haqida ham yozilgan.

## Sahna rejasi (TQ3, kodda chizilgan)
1. Hook: Bek jazirama tekislikda, quyosh. Katta so'z "1402".
2. Ikki tomon: chapda Temur (Bek outfit 'temur'), o'ngda Boyazid (yangi kiyim: oq salla, qizil to'n), o'rtada chaqmoq.
3. Xatlar: ikki o'ram xat uchib boradi, qizil "HAQORAT".
4. Xarita (GlobeMap, Anado'li yaqin plan): Temur strelkasi aylanib Anqaraga boradi; usmonli strelkasi uzun yo'l bilan qaytadi; quyosh, terlagan askar.
5. Suv: soy yo'nalishi o'zgaradi, sulton tomonida quruq yer, "CHANQOQ".
6. Jang: fillar oldinga yuradi.
7. Tatarlar tomon o'zgartiradi: bayroqlar rangi Temur rangiga aylanadi, katta so'z "XIYONAT".
8. Asir sulton; "RIVOYAT" belgisi bilan temir qafas.
9. Natija: usmonlilar xaritasi bo'linadi "10 YIL"; Konstantinopol yonib turadi "+50 YIL".
10. Tanlov "1, 2 yoki 3" + FollowButton (~3 s, `common.tsx`, `edit/follow_sfx.py`).
