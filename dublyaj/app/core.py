"""Dublyaj ilovasi: saqlash va ish bosqichlari.

Tuzilma (dublyaj/data/, git'ga kirmaydi):
  animelar.json                 anime ro'yxati
  <anime>/muqova.jpg            kartochka rasmi
  <anime>/personajlar.json      personajlar, ovozlari, sen/siz jadvali, lug'at (loyiha xotirasi)
  <anime>/<qism>/meta.json      qism holati
  <anime>/<qism>/manba.*        yuklangan fayl
  <anime>/<qism>/audio.mp3      asl ovoz (mono)
  <anime>/<qism>/transkript.json  nutqdan matn (xom javob)
  <anime>/<qism>/satrlar.json   satrlar: vaqt, kim, asl matn, o'zbekcha, ohang
  <anime>/<qism>/kadr/          har gapiruvchidan kadrlar (personajni tanish uchun)
  <anime>/<qism>/tts/<n>.mp3    yozilgan o'zbekcha gaplar
  <anime>/<qism>/natija/        dublyaj.wav, dublyaj.mp3 (faqat ovoz, fonsiz)
"""
import hashlib
import json
import os
import re
import subprocess
import threading
import time
from pathlib import Path

import numpy as np

import eleven

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get("DUBLYAJ_DATA", ROOT / "data"))
SR = 44100
QULF = threading.RLock()

SOZLAMA = {"eleven_key": "", "tts_model": "eleven_v4", "stt_model": "scribe_v3", "ttv_model": "eleven_ttv_v3",
           "barqarorlik": 0.5, "manba_til": "zh", "pauza": 0.6, "max_tezlik": 1.25}


def oqi(path, default=None):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def yoz(path, obj):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(path)


def sozlama():
    return {**SOZLAMA, **(oqi(DATA / "sozlama.json", {}) or {})}


def kalit():
    return os.environ.get("ELEVENLABS_API_KEY") or sozlama().get("eleven_key") or None


def _id(nom, mavjud, old):
    s = re.sub(r"[^a-z0-9]+", "_", nom.lower()).strip("_")[:24] or old
    k, i = s, 2
    while k in mavjud:
        k, i = f"{s}_{i}", i + 1
    return k


# ---------- anime va qismlar ----------

def animelar():
    return oqi(DATA / "animelar.json", []) or []


def anime_qosh(nom, izoh=""):
    with QULF:
        ar = animelar()
        a = {"id": _id(nom, {x["id"] for x in ar}, "anime"), "nom": nom.strip(), "izoh": izoh.strip(), "vaqt": int(time.time())}
        ar.append(a)
        yoz(DATA / "animelar.json", ar)
        (DATA / a["id"]).mkdir(parents=True, exist_ok=True)
        return a


def anime(aid):
    a = next((x for x in animelar() if x["id"] == aid), None)
    if not a:
        raise KeyError("anime topilmadi")
    d = DATA / aid
    qismlar = [oqi(p / "meta.json") for p in sorted(d.iterdir()) if (p / "meta.json").exists()] if d.exists() else []
    qismlar.sort(key=lambda m: m.get("vaqt", 0))
    return {**a, "muqova": (d / "muqova.jpg").exists(), "qismlar": qismlar, "xotira": personajlar(aid)}


def personajlar(aid):
    return oqi(DATA / aid / "personajlar.json", None) or {"personajlar": {}, "munosabat": [], "lugat": {}, "eslatma": ""}


def personajlar_yoz(aid, p):
    yoz(DATA / aid / "personajlar.json", p)


def qism_qosh(aid, nom, fayl_nomi):
    with QULF:
        d = DATA / aid
        mavjud = {p.name for p in d.iterdir() if p.is_dir()} if d.exists() else set()
        qid = _id(nom, mavjud, "qism")
        ext = (Path(fayl_nomi).suffix or ".mp4").lower()
        meta = {"id": qid, "anime": aid, "nom": nom.strip(), "manba": "manba" + ext, "vaqt": int(time.time()), "holat": {}}
        yoz(d / qid / "meta.json", meta)
        return meta


def qism_url(aid, nom, url):
    """Faylsiz qism: nutqni ElevenLabs havoladan (YouTube va h.k.) o'zi oladi."""
    with QULF:
        d = DATA / aid
        mavjud = {p.name for p in d.iterdir() if p.is_dir()} if d.exists() else set()
        qid = _id(nom, mavjud, "qism")
        meta = {"id": qid, "anime": aid, "nom": nom.strip(), "manba": None, "url": url.strip(), "vaqt": int(time.time()),
                "holat": {"audio": True, "video": False}}
        yoz(d / qid / "meta.json", meta)
        return meta


def qd(aid, qid):
    return DATA / aid / qid


def meta(aid, qid):
    m = oqi(qd(aid, qid) / "meta.json")
    if not m:
        raise KeyError("qism topilmadi")
    return m


def meta_yangila(aid, qid, **kw):
    with QULF:
        m = meta(aid, qid)
        m["holat"].update(kw)
        yoz(qd(aid, qid) / "meta.json", m)
        return m


def satrlar(aid, qid):
    return oqi(qd(aid, qid) / "satrlar.json", []) or []


def satrlar_yoz(aid, qid, s):
    yoz(qd(aid, qid) / "satrlar.json", s)


# ---------- ffmpeg yordamchilari ----------

def _ff(*args):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, args)], capture_output=True)
    if r.returncode:
        raise RuntimeError("ffmpeg: " + r.stderr.decode("utf-8", "replace")[-400:])


def _probe(path, entry, stream=None):
    cmd = ["ffprobe", "-v", "error", "-show_entries", entry, "-of", "csv=p=0"]
    if stream:
        cmd += ["-select_streams", stream]
    return subprocess.run(cmd + [str(path)], capture_output=True, text=True).stdout.strip()


def _dekod(path, tezlik=1.0):
    af = ["-af", f"atempo={tezlik:.4f}"] if abs(tezlik - 1) > 0.005 else []
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), *af, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True)
    if r.returncode:
        raise RuntimeError("ffmpeg: " + r.stderr.decode("utf-8", "replace")[-300:])
    a = np.frombuffer(r.stdout, dtype=np.float32)
    if not len(a):
        return a
    # boshi va oxiridagi jimlikni kesish
    thr = max(float(np.abs(a).max()) * 0.02, 1e-4)
    idx = np.nonzero(np.abs(a) > thr)[0]
    if not len(idx):
        return a[:0]
    m = int(0.02 * SR)
    return a[max(idx[0] - m, 0): idx[-1] + m]


# ---------- bosqichlar ----------

def audio_ajrat(aid, qid, prog=lambda *a: None):
    """1-bosqich: yuklangan fayldan asl ovozni ajratish."""
    d, m = qd(aid, qid), meta(aid, qid)
    if m.get("url"):
        return
    prog(10, "Ovoz ajratilmoqda")
    _ff("-i", d / m["manba"], "-vn", "-ac", "1", "-ar", "44100", "-b:a", "96k", d / "audio.mp3")
    dav = float(_probe(d / "audio.mp3", "format=duration") or 0)
    video = bool(_probe(d / m["manba"], "stream=codec_type", "v:0"))
    meta_yangila(aid, qid, audio=True, davomiylik=round(dav, 2), video=video)


def satrlarga_bol(words, pauza=0.6, max_uzun=10.0):
    """So'zlardan satrlar: gapiruvchi almashsa yoki pauza bo'lsa yangi satr."""
    out, cur = [], None
    for w in words:
        tur = w.get("type", "word")
        if tur == "spacing":
            if cur:
                cur["asl"] += w.get("text", " ")
            continue
        st, en = w.get("start"), w.get("end")
        if st is None or en is None:
            continue
        sp = w.get("speaker_id") or "speaker_0"
        gap = st - cur["end"] if cur else 0
        tinish = cur and cur["asl"].rstrip()[-1:] in "。！？.!?…"
        if cur is None or sp != cur["speaker"] or gap >= pauza or (st - cur["start"] > max_uzun and tinish):
            davom = bool(cur and sp == cur["speaker"] and gap < 2.0 and not tinish)
            if cur:
                out.append(cur)
            cur = {"start": st, "end": en, "speaker": sp, "asl": "", "tovush": True, "davom": davom}
        cur["asl"] += w.get("text", "")
        cur["end"] = max(cur["end"], en)
        if tur == "word":
            cur["tovush"] = False
    if cur:
        out.append(cur)
    for i, s in enumerate(out, 1):
        s.update(n=i, start=round(s["start"], 3), end=round(s["end"], 3), asl=s["asl"].strip(), kim="", uz="", teg="")
    return out


def transkript(aid, qid, prog=lambda *a: None):
    """2-bosqich: nutqni matnga (gapiruvchilar va so'z vaqtlari bilan), satrlarga bo'lish, kadrlar."""
    d, s = qd(aid, qid), sozlama()
    url = meta(aid, qid).get("url")
    fayl = None if url else d / "audio.mp3"
    prog(5, "Nutq matnga aylantirilmoqda" + (" (havoladan, bir necha daqiqa)" if url else ""))
    try:
        t = eleven.matnga(kalit(), fayl, s["stt_model"], s["manba_til"] or None, url=url)
    except eleven.ElevenError as e:
        if e.status in (400, 404, 422) and s["stt_model"] != "scribe_v2" and "source" not in str(e).lower():
            t = eleven.matnga(kalit(), fayl, "scribe_v2", s["manba_til"] or None, url=url)
        else:
            raise
    yoz(d / "transkript.json", t)
    sat = satrlarga_bol(t.get("words", []), s["pauza"])
    satrlar_yoz(aid, qid, sat)
    prog(70, "Kadrlar olinmoqda")
    kadrlar(aid, qid, sat)
    dav = t.get("audio_duration_secs") or max((w.get("end") or 0 for w in t.get("words", [])), default=0)
    if url and dav:
        meta_yangila(aid, qid, davomiylik=round(dav, 2))
    meta_yangila(aid, qid, transkript=True, satr_soni=len(sat), gapiruvchilar=sorted({x["speaker"] for x in sat}))


def kadrlar(aid, qid, sat, har=3):
    """Har gapiruvchining eng uzun gaplaridan kadr: Claude personajni ko'rib taniydi."""
    d, m = qd(aid, qid), meta(aid, qid)
    if not m["holat"].get("video") or not m.get("manba"):
        return
    (d / "kadr").mkdir(exist_ok=True)
    guruh = {}
    for s in sat:
        if not s["tovush"]:
            guruh.setdefault(s["speaker"], []).append(s)
    for sp, ls in guruh.items():
        for s in sorted(ls, key=lambda x: x["start"] - x["end"])[:har]:
            try:
                _ff("-ss", f"{(s['start'] + s['end']) / 2:.2f}", "-i", d / m["manba"], "-frames:v", "1", "-vf", "scale=640:-2",
                    "-q:v", "4", d / "kadr" / f"{sp}_satr{s['n']}.jpg")
            except RuntimeError:
                pass


def tts_matn(s):
    return (f"[{s['teg']}] " if s.get("teg") else "") + s["uz"]


def _tts_kalit(s, voice_id, soz):
    return hashlib.sha1(f"{voice_id}|{soz['tts_model']}|{soz['barqarorlik']}|{tts_matn(s)}".encode()).hexdigest()[:16]


def kerakli_kredit(aid, qid):
    """Hali yozilmagan satrlar uchun taxminiy kredit (1 belgi = 1 kredit deb)."""
    p, soz = personajlar(aid)["personajlar"], sozlama()
    jami = 0
    for s in satrlar(aid, qid):
        v = (p.get(s.get("kim")) or {}).get("voice_id")
        if s.get("uz") and v and s.get("tts_kalit") != _tts_kalit(s, v, soz):
            jami += len(tts_matn(s))
    return jami


def moslash(sat, i, dur, jami, max_tezlik=1.25):
    """Yozilgan gapni asl gap o'rniga moslash: keyingi gapgacha bo'sh joy bo'lsa ishlatadi, sig'masa tezlatadi."""
    s = sat[i]
    slot = s["end"] - s["start"]
    keyingi = min((x["start"] for x in sat if x["start"] > s["start"] + 0.05 and x.get("uz")), default=jami)
    joy = max(slot, min(keyingi - s["start"] - 0.08, slot + 1.2))
    tezlik = 1.0 if dur <= joy else min(dur / joy, max_tezlik)
    return {"tts_sek": round(dur, 2), "tezlik": round(tezlik, 3), "uzun": dur / tezlik > joy + 0.15,
            "qisqa": slot > 1.5 and dur < 0.5 * slot}


def ovoz_yoz(aid, qid, prog=lambda *a: None, faqat=None):
    """4-bosqich: har satrni o'z personaji ovozida yozish. O'zgarmagan satr qayta yozilmaydi (kredit tejaladi)."""
    d, soz = qd(aid, qid), sozlama()
    p = personajlar(aid)["personajlar"]
    jami = meta(aid, qid)["holat"].get("davomiylik", 0)
    (d / "tts").mkdir(exist_ok=True)
    sat = satrlar(aid, qid)
    ish = [i for i, s in enumerate(sat) if s.get("uz") and (faqat is None or s["n"] in faqat)]
    yozildi, xabar = 0, ""
    for k, i in enumerate(ish):
        s = sat[i]
        v = (p.get(s.get("kim")) or {}).get("voice_id")
        if not v:
            s["holat"] = "ovoz tanlanmagan"
            continue
        key, f = _tts_kalit(s, v, soz), d / "tts" / f"{s['n']}.mp3"
        if s.get("tts_kalit") != key or not f.exists():
            prog(int(100 * k / max(len(ish), 1)), f"Satr {s['n']} yozilmoqda")
            try:
                f.write_bytes(eleven.nutq(kalit(), v, tts_matn(s), soz["tts_model"], soz["barqarorlik"]))
            except eleven.ElevenError as e:
                s["holat"] = "kredit tugadi" if e.kredit_tugadi else str(e)[:120]
                xabar = f"{s['n']}-satrda to'xtadi: {s['holat']}"
                break
            s["tts_kalit"], yozildi = key, yozildi + 1
        s.update(moslash(sat, i, len(_dekod(f)) / SR, jami, soz["max_tezlik"]), holat="tayyor")
        if yozildi and yozildi % 10 == 0:
            satrlar_yoz(aid, qid, sat)
    satrlar_yoz(aid, qid, sat)
    tayyor = sum(1 for s in sat if s.get("holat") == "tayyor")
    meta_yangila(aid, qid, yozilgan=tayyor, ovoz_xabar=xabar)
    return xabar or f"{tayyor} ta satr tayyor"


def yig(aid, qid, prog=lambda *a: None):
    """5-bosqich: hamma gapni asl joyiga qo'yib, bitta fonsiz ovoz yo'lagini chiqarish."""
    d = qd(aid, qid)
    jami = meta(aid, qid)["holat"].get("davomiylik", 0)
    sat = satrlar(aid, qid)
    buf = np.zeros(int((jami + 2) * SR), dtype=np.float32)
    tayyor = [s for s in sat if s.get("holat") == "tayyor" and (d / "tts" / f"{s['n']}.mp3").exists()]
    for k, s in enumerate(tayyor):
        prog(int(90 * k / max(len(tayyor), 1)), f"Satr {s['n']} joylanmoqda")
        a = _dekod(d / "tts" / f"{s['n']}.mp3", s.get("tezlik", 1.0))
        b = int(s["start"] * SR)
        a = a[: max(len(buf) - b, 0)]
        buf[b: b + len(a)] += a
    buf = buf[: int(jami * SR)] if jami else buf
    cho = float(np.abs(buf).max()) if len(buf) else 0
    if cho > 0.97:
        buf *= 0.97 / cho
    (d / "natija").mkdir(exist_ok=True)
    prog(92, "Fayl yozilmoqda")
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le",
                        str(d / "natija" / "dublyaj.wav")], input=buf.tobytes(), capture_output=True)
    if r.returncode:
        raise RuntimeError("ffmpeg: " + r.stderr.decode("utf-8", "replace")[-300:])
    _ff("-i", d / "natija" / "dublyaj.wav", "-b:a", "192k", d / "natija" / "dublyaj.mp3")
    meta_yangila(aid, qid, yigilgan=len(tayyor), natija_vaqt=int(time.time()))
    return f"{len(tayyor)} ta gap joylandi"


def ovoz_namuna(aid, pid, prog=lambda *a: None):
    """Personaj tavsifidan 3 ta ovoz namunasi yaratish (tanlash uchun)."""
    x = personajlar(aid)
    p = x["personajlar"][pid]
    matn = p.get("namuna_matn") or ("Assalomu alaykum! Meni tanidingizmi? Bugun sizlarga juda qiziq bir voqeani aytib beraman. "
                                    "Lekin avval so'z bering: buni hech kimga aytmaysiz!")
    prog(20, "Ovoz yaratilmoqda")
    nam = eleven.ovoz_loyiha(kalit(), p["ovoz_tavsifi"], matn, sozlama()["ttv_model"])
    d = DATA / aid / "ovoz"
    d.mkdir(exist_ok=True)
    p["namunalar"] = []
    for i, n in enumerate(nam, 1):
        (d / f"{pid}_{i}.mp3").write_bytes(n["audio"])
        p["namunalar"].append({"fayl": f"{pid}_{i}.mp3", "generated_voice_id": n["generated_voice_id"]})
    personajlar_yoz(aid, x)
    return f"{len(nam)} ta namuna tayyor"


def ovoz_tanla(aid, pid, generated_voice_id=None, voice_id=None, ovoz_nomi=""):
    """Namunani ovoz qilib saqlash yoki hisobdagi tayyor ovozni biriktirish."""
    x = personajlar(aid)
    p = x["personajlar"][pid]
    if generated_voice_id:
        nom = f"{anime(aid)['nom']} - {p.get('nom', pid)}"[:60]
        voice_id, ovoz_nomi = eleven.ovoz_saqla(kalit(), nom, p["ovoz_tavsifi"], generated_voice_id), nom
    p["voice_id"], p["ovoz_nomi"] = voice_id or "", ovoz_nomi
    personajlar_yoz(aid, x)
    return p


BOSQICH = {"audio": audio_ajrat, "transkript": transkript, "ovoz": ovoz_yoz, "yig": yig}

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4 or sys.argv[1] not in BOSQICH:
        sys.exit("ishlatish: python core.py <audio|transkript|ovoz|yig> <anime_id> <qism_id>")
    print(BOSQICH[sys.argv[1]](sys.argv[2], sys.argv[3], lambda f, x="": print(f"{f}% {x}", flush=True)) or "tayyor")
