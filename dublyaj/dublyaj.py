"""Donghua dublyaj: xitoycha videoni o'zbekcha AI ovozga o'tkazadi.

Bosqichlar:
  1. ffmpeg: videodan tovushni oladi.
  2. Demucs: ovoz (aktyorlar) va fon (musiqa, shovqin, effektlar) ni ajratadi.
  3. faster-whisper: xitoycha gaplarni va ularning vaqtini aniqlaydi.
  4. Ovoz tahlili: har gap erkak yoki ayol ovozi ekanini, kim gapirayotganini taxmin qiladi.
  5. Claude: butun qismni kontekst bilan tarjima qiladi, keyin tarjimani tahlil qilib tuzatadi
     (API kalit bilan avtomatik, kalitsiz: fayl orqali Claude chatida).
  6. edge-tts: o'zbekcha ovoz (Sardor - erkak, Madina - ayol), gap vaqtiga sig'diriladi.
  6b. Ixtiyoriy: `ovozlar` papkasidagi namunalar bo'yicha ovoz klonlash (coqui-tts, OpenVoice v2).
  7. Mix: fon + (kulgi, qichqiriq kabi tarjima qilinmagan asl ovoz) + o'zbekcha ovoz.

Ishga tushirish: Windowsda `Dublyaj.bat`, telefonda Colab daftari `Donghua_Dublyaj.ipynb`, yoki
  python dublyaj.py video.mp4            # hammasi birdan, natija ./dub_out/
"""
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import zlib

import numpy as np
import soundfile as sf

if not shutil.which("ffmpeg"):  # Windows: ffmpeg o'rnatilmagan bo'lsa, pip paketidan olinadi
    try:
        import static_ffmpeg

        static_ffmpeg.add_paths()
    except Exception as e:
        print("ffmpeg topilmadi:", e)

SR = 44100
VOICES = {"E": "uz-UZ-SardorNeural", "A": "uz-UZ-MadinaNeural"}
# Bir xil ikki ovozdan bir nechta personaj chiqarish uchun balandlik variantlari (Hz).
PITCH = {"E": [0, -14, 12, -24], "A": [0, 18, -12, 32]}
KEEP = "ASL"  # shu gap dublyaj qilinmaydi, asl ovoz qoladi
LAUGH = re.compile(r"^[哈呵嘿嘻啊呀哦噢嗯唔哼呜哇欸诶咦唉哎嗨呃额\W\s]+$")
# Yosh: (balandlik Hz, tezlik %). His-tuyg'u: (tezlik %, balandlik Hz, ovoz kuchi).
AGES = {"bola": (38, 4), "yosh": (10, 2), "katta": (0, 0), "qari": (-22, -8)}
MOODS = {"oddiy": (0, 0, 1.0), "hurmat": (-4, 0, 0.95), "gazab": (8, -6, 1.3), "baqiriq": (12, 18, 1.6),
         "uyat": (-8, 8, 0.7), "shivir": (-6, 0, 0.5), "qaygu": (-12, -8, 0.85), "quvonch": (6, 14, 1.1),
         "qorquv": (10, 12, 1.0)}
COLS = ["№", "boshi", "oxiri", "kim", "ovoz", "his", "xitoycha", "o'zbekcha"]


def sh(*args):
    r = subprocess.run([str(a) for a in args], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(f"{args[0]} xato: {r.stderr[-600:]}")


def note(progress, frac, text):
    print(f"[{int(frac * 100):3d}%] {text}", flush=True)
    if progress:
        progress(frac, desc=text)


# ---------------------------------------------------------------- 1-2. tovush va ajratish
def extract_audio(src, wd):
    out = os.path.join(wd, "asl.wav")
    sh("ffmpeg", "-y", "-i", src, "-vn", "-ac", 2, "-ar", SR, "-c:a", "pcm_s16le", out)
    return out


def separate(wav_path, wd, tick=lambda f: None):
    """Demucs bilan ovoz/fon. 5 daqiqalik bo'laklarda ishlaydi (8 GB xotirali kompyuterga ham sig'adi)."""
    import torch
    from demucs.apply import apply_model
    from demucs.pretrained import get_model

    model = get_model("htdemucs")
    model.eval()
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    vi = model.sources.index("vocals")
    n = sf.info(wav_path).frames
    step, over = 300 * SR, 2 * SR
    voc = np.zeros((n, 2), dtype=np.float32)
    with sf.SoundFile(wav_path) as f:
        pos = 0
        while pos < n:
            a, b = max(0, pos - over), min(n, pos + step)
            f.seek(a)
            wav = torch.from_numpy(np.ascontiguousarray(f.read(b - a, dtype="float32", always_2d=True).T))
            ref = wav.mean(0)
            mean, std = ref.mean(), ref.std() + 1e-8
            with torch.no_grad():
                out = apply_model(model, ((wav - mean) / std)[None], device=dev, split=True, overlap=0.25)[0]
            v = (out[vi] * std + mean).numpy().T
            k = pos - a
            if k:  # bo'laklar chegarasida yumshoq o'tish
                ramp = np.linspace(0, 1, k, dtype=np.float32)[:, None]
                voc[a:pos] = voc[a:pos] * (1 - ramp) + v[:k] * ramp
            voc[pos:b] = v[k:]
            pos = b
            tick(pos / n)
    del model
    if dev == "cuda":
        torch.cuda.empty_cache()
    audio, _ = sf.read(wav_path, dtype="float32", always_2d=True)
    sf.write(os.path.join(wd, "ovoz.wav"), voc, SR, subtype="PCM_16")
    sf.write(os.path.join(wd, "fon.wav"), audio - voc, SR, subtype="PCM_16")
    del audio, voc
    sh("ffmpeg", "-y", "-i", os.path.join(wd, "ovoz.wav"), "-ac", 1, "-ar", 16000, os.path.join(wd, "ovoz16k.wav"))


# ---------------------------------------------------------------- 3. xitoycha matn va vaqt
def transcribe(wd, model_name="large-v3"):
    from faster_whisper import WhisperModel

    # Windowsda GPU kutubxonalari (cuDNN) ko'pincha yo'q: u yerda ishonchli CPU rejimi, Colabda GPU.
    use_gpu = os.environ.get("DUB_WHISPER", "gpu" if os.name != "nt" else "cpu") == "gpu"
    try:
        if not use_gpu:
            raise RuntimeError("CPU rejimi tanlangan")
        model = WhisperModel(model_name, device="cuda", compute_type="float16")
    except Exception as e:
        print("Whisper CPU da ishlaydi:", e)
        model = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
    segs, _ = model.transcribe(
        os.path.join(wd, "ovoz16k.wav"), language="zh", word_timestamps=True, vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 300}, condition_on_previous_text=False, beam_size=5,
    )
    words = [(w.start, w.end, w.word.strip()) for s in segs for w in (s.words or []) if w.word.strip()]
    return split_words(words)


def split_words(words, gap=0.45, max_len=9.0):
    """So'zlardan gaplar: pauza, tinish belgisi yoki juda uzun bo'lsa bo'linadi."""
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        dur = w[1] - cur[0][0]
        if (nxt is None or nxt[0] - w[1] > gap or dur > max_len
                or (w[2][-1] in "。！？!?…" and dur > 0.8)):
            text = "".join(x[2] for x in cur)
            if re.search(r"\w", text):
                out.append({"start": round(cur[0][0], 2), "end": round(w[1], 2), "zh": text})
            cur = []
    return out


# ---------------------------------------------------------------- 4. kim gapiryapti
def median_pitch(clip):
    import librosa

    if len(clip) < 2048:
        return 0.0
    f0 = librosa.yin(clip, fmin=70, fmax=450, sr=16000, frame_length=1024, hop_length=256)
    rms = librosa.feature.rms(y=clip, frame_length=1024, hop_length=256)[0]
    n = min(len(f0), len(rms))
    f0, rms = f0[:n], rms[:n]
    loud = f0[rms > 0.5 * rms.max()] if rms.max() > 0 else f0
    return float(np.median(loud)) if len(loud) else 0.0


def assign_voices(wd, segs, split_hz=165.0):
    """Ovozdan dastlabki taxmin: erkak/ayol va kim gapirayotgani. Yakuniy rollarni Claude belgilaydi."""
    v16, _ = sf.read(os.path.join(wd, "ovoz16k.wav"), dtype="float32")
    clips = [v16[int(s["start"] * 16000):int(s["end"] * 16000)] for s in segs]
    pitch = np.array([median_pitch(c) for c in clips])
    labels = np.full(len(segs), -1)
    try:  # ovoz "barmoq izi" bo'yicha personajlarga guruhlash
        from resemblyzer import VoiceEncoder
        from sklearn.cluster import AgglomerativeClustering

        idx = [i for i, c in enumerate(clips) if len(c) >= 16000 * 0.8]
        if len(idx) >= 4:
            enc = VoiceEncoder(verbose=False)
            emb = np.array([enc.embed_utterance(clips[i] / (np.abs(clips[i]).max() + 1e-6)) for i in idx])
            cl = AgglomerativeClustering(n_clusters=None, distance_threshold=0.45, metric="cosine", linkage="average")
            labels[idx] = cl.fit_predict(emb)
    except Exception as e:
        print("Personajlarga guruhlash o'tkazib yuborildi:", e)

    variant = {}
    order = sorted(set(labels[labels >= 0]), key=lambda k: -(labels == k).sum())
    for num, k in enumerate(order, 1):
        ps = pitch[(labels == k) & (pitch > 0)]
        variant[k] = ("erkak-katta" if len(ps) and np.median(ps) < split_hz else "ayol-katta", f"ovoz {num}")
    for i, s in enumerate(segs):
        s["mood"] = "oddiy"
        if LAUGH.match(s["zh"]):
            s["voice"], s["who"] = KEEP, ""
        elif labels[i] >= 0:
            s["voice"], s["who"] = variant[labels[i]]
        else:
            s["voice"], s["who"] = ("erkak-katta" if 0 < pitch[i] < split_hz else "ayol-katta"), ""
    return segs


# ---------------------------------------------------------------- 5. tarjima
CLAUDE_MODEL = "claude-opus-5-5"
TR_SYSTEM = """You are the dubbing translator, script editor and casting director for an Uzbek fan dub of a Chinese
donghua episode.

You receive the episode's dialogue as numbered lines: `number | audio guess | seconds | Chinese text`.
The Chinese text was transcribed automatically from audio, so it contains recognition mistakes (wrong homophones,
broken names, split or merged sentences). The audio guess (erkak = male, ayol = female) comes from voice pitch and is
often wrong, especially for boys, young men and deep-voiced women. `seconds` is how long the original line lasts.

For every line return the Uzbek text plus who says it and how.

Translation (`uz`), natural spoken Uzbek in Latin script, the way a professional dubbing studio would write it:
- Read the whole episode first and work out who is talking to whom and what is going on. Translate the meaning in
  context, not word by word. When the transcript is clearly wrong, translate what the character evidently said.
- The dialogue must hold together: a reply has to answer what the previous speaker actually said, questions and
  answers must match, and jokes, threats and emotions keep their tone.
- Register follows the relationship, because in Uzbek sen/siz carries respect. Enemies, people insulting or
  threatening each other, and anyone speaking with contempt use sen and blunt wording, never polite forms. Elders,
  masters, parents, rulers and strangers being treated politely get siz. Close friends, siblings and adults talking
  to children use sen. Decide the form once for each pair of characters in each direction and keep it, changing it
  only where the story changes the relationship (a betrayal, a reveal, a drop of the mask).
- Keep names, titles, places and special terms (sects, techniques, ranks) identical throughout the episode.
- The line will be spoken in the same time slot. Aim for at most about 14 characters per second of the original
  line; shorten wording rather than dropping meaning.
- Write for the ear: no brackets, notes, Chinese characters or unreadable symbols. Numbers as words.
- If a line is only noise, a sound or meaningless recognition garbage, return an empty `uz` so the original sound
  is kept.

Casting, decided from the story (names, forms of address such as elder brother, grandfather, little girl, master,
what is said about a character), using the audio guess only as a hint:
- `kim`: a short stable label for the speaker, the character's name when known, otherwise a role such as
  "qorovul 1". The same character must carry exactly the same label on every line.
- `jins`: E for male, A for female.
- `yosh`: bola (child), yosh (teen or young adult), katta (adult), qari (elderly).
- `his`: how the line is delivered: oddiy (neutral), hurmat (respectful, deferential), gazab (angry, cold or
  threatening), baqiriq (shouting), uyat (shy, embarrassed), shivir (whisper), qaygu (sad), quvonch (happy, excited),
  qorquv (frightened). Pick what the scene calls for; most lines are oddiy.

Return every line number exactly once and never merge or split lines."""
TR_REVIEW = """Below is the same dialogue with a draft: `=> kim | jins-yosh | his | Uzbek text`. Act as the editor
who signs off the dub script. Check each line against the Chinese and against its neighbours: is the meaning right in
this scene, does each reply fit the line before it, are names and terms identical everywhere, does sen/siz match the
relationship (no polite forms towards enemies or in insults, no sen towards respected elders unless the original is
rude), is each character's label, gender and age the same on all their lines, does the emotion fit, does it sound like
real spoken Uzbek, and does it fit the time slot? Fix whatever fails and return the final version of all lines.
In `izoh`, write a few sentences in Uzbek for the user: the main characters with gender and age, who says sen or siz
to whom, and anything that stayed uncertain."""
TR_FIX = """Below is the current dub script: `=> kim | jins-yosh | his | Uzbek text`. The user reviewed it and wrote
corrections. Apply them. A correction about one line usually states a rule (for example who must say sen or siz to
whom, a character's gender or age, a name's spelling), so apply it to every other line it logically covers too.
Return only the lines you changed, complete, and explain in `izoh` in Uzbek what you changed."""
TR_SCHEMA = {
    "type": "object",
    "properties": {
        "lines": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "n": {"type": "integer"}, "uz": {"type": "string"}, "kim": {"type": "string"},
                "jins": {"type": "string", "enum": ["E", "A"]},
                "yosh": {"type": "string", "enum": list(AGES)},
                "his": {"type": "string", "enum": list(MOODS)}},
            "required": ["n", "uz", "kim", "jins", "yosh", "his"], "additionalProperties": False}},
        "izoh": {"type": "string"},
    },
    "required": ["lines", "izoh"], "additionalProperties": False,
}


def script_line(i, s, draft=False):
    row = f"{i + 1} | {s['voice'].split('-')[0]} | {s['end'] - s['start']:.1f}s | {s['zh']}"
    if draft:
        row += f" => {s.get('who', '')} | {s['voice']} | {s.get('mood', 'oddiy')} | {s.get('uz', '')}"
    return row


def apply_lines(segs, rows):
    n = 0
    for row in rows:
        if 1 <= row["n"] <= len(segs) and segs[row["n"] - 1]["voice"] != KEEP:
            s = segs[row["n"] - 1]
            s["uz"], s["who"], s["mood"] = row["uz"].strip(), row["kim"].strip(), row["his"]
            s["voice"] = ("erkak" if row["jins"] == "E" else "ayol") + "-" + row["yosh"]
            n += 1
    return n


def ask_claude(client, user_text):
    """Bitta so'rov: JSON javob qaytaradi. Rad etilsa, API o'zi zaxira modelga o'tadi (fallbacks)."""
    import anthropic

    args = dict(model=CLAUDE_MODEL, max_tokens=64000, system=TR_SYSTEM,
                messages=[{"role": "user", "content": user_text}],
                output_config={"effort": "high", "format": {"type": "json_schema", "schema": TR_SCHEMA}})
    try:
        with client.beta.messages.stream(betas=["server-side-fallback-2026-07-01"], fallbacks="default",
                                         **args) as stream:
            msg = stream.get_final_message()
    except anthropic.BadRequestError as e:
        print("Zaxira model sozlamasi qabul qilinmadi, oddiy so'rov yuborildi:", e)
        with client.messages.stream(**args) as stream:
            msg = stream.get_final_message()
    if msg.stop_reason == "refusal":
        raise RuntimeError("Claude bu matnni tarjima qilishdan bosh tortdi")
    if msg.stop_reason == "max_tokens":
        raise RuntimeError("Javob juda uzun bo'lib kesildi")
    return json.loads(next(b.text for b in msg.content if b.type == "text"))


def claude_errors(fn):
    def wrapped(*a, **k):
        import anthropic

        try:
            return fn(*a, **k)
        except anthropic.AuthenticationError:
            raise RuntimeError("Claude API kaliti noto'g'ri")
        except anthropic.PermissionDeniedError:
            raise RuntimeError("Bu kalitga ruxsat yo'q (hisobda mablag' yoki model ruxsati yo'q bo'lishi mumkin)")
        except anthropic.RateLimitError:
            raise RuntimeError("Claude limiti tugadi, bir ozdan keyin qayta urining")
        except anthropic.APIStatusError as e:
            raise RuntimeError(f"Claude xatosi {e.status_code}: {e.message}")
        except anthropic.APIConnectionError:
            raise RuntimeError("Claude serveriga ulanib bo'lmadi")
    return wrapped


def rules_block(rules):
    rules = (rules or "").strip()
    return f"The user's standing rules for this dub. They override your own choices:\n{rules}\n\n" if rules else ""


@claude_errors
def claude_translate(segs, api_key, rules="", chunk=200, note_fn=lambda t: None):
    """Ikki bosqich: 1) butun qismni kontekst bilan tarjima va rollarni aniqlash, 2) muharrir tahlili."""
    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    todo = [i for i, s in enumerate(segs) if s["voice"] != KEEP]
    notes = []
    for stage, label in ((0, "tarjima va rollar"), (1, "tahlil va tuzatish")):
        for c in range(0, len(todo), chunk):
            ids = todo[c:c + chunk]
            note_fn(f"Claude: {label} ({c + len(ids)}/{len(todo)} gap)")
            before = "\n".join(script_line(i, segs[i], True) for i in todo[max(0, c - 40):c])
            text = rules_block(rules) + (TR_REVIEW + "\n\n" if stage else "") + (
                f"Earlier lines of this episode, already done (context only, do not return them):\n{before}\n\n"
                if before else "") + "Lines to return:\n" + "\n".join(script_line(i, segs[i], bool(stage)) for i in ids)
            data = ask_claude(client, text)
            apply_lines(segs, data["lines"])
            if stage and data.get("izoh"):
                notes.append(data["izoh"])
    return " ".join(notes)


@claude_errors
def claude_fix(segs, api_key, corrections, rules=""):
    """Foydalanuvchi yozgan tuzatishlarni butun ssenariyga qo'llaydi."""
    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    body = "\n".join(script_line(i, s, True) for i, s in enumerate(segs) if s["voice"] != KEEP)
    data = ask_claude(client, f"{rules_block(rules)}{TR_FIX}\n\nUser's corrections:\n{corrections.strip()}\n\nScript:\n{body}")
    n = apply_lines(segs, data["lines"])
    return f"{n} ta gap o'zgartirildi. {data.get('izoh', '')}"


MANUAL_HEAD = """Quyidagi xitoycha donghua dialogini o'zbekcha dublyaj uchun tarjima qil.
Format: raqam | ovoz taxmini (ko'p xato qiladi) | davomiyligi | xitoycha matn. Matn ovozdan avtomatik yozilgan.

Qoidalar:
- Avval butun qismni o'qib, kim kimga gapirayotganini tushun. So'zma-so'z emas, ma'nosiga qarab tarjima qil.
- Suhbat bog'lansin: javob oldingi gapga mos kelsin. Ismlar va atamalar hamma joyda bir xil bo'lsin.
- Sen/siz munosabatga qarab: dushmanlar, haqorat va tahdidda faqat sensirash, hurmat so'zlarisiz. Ustoz, kattalar,
  ota-onaga siz. Do'stlar, aka-uka, bolalarga sen. Har juftlik uchun bir marta tanla va o'zgartirma.
- Tabiiy og'zaki o'zbek tili (lotin). Gap o'z vaqtiga sig'sin: sekundiga ko'pi bilan taxminan 14 belgi.
- Har gap uchun kim gapirayotganini (bir personajga doim bir xil nom), jinsi va yoshini, his-tuyg'usini aniqla.
- Tarjimadan keyin o'zing muharrir sifatida qayta tekshir va tuzat.
- Javobni faqat shu ko'rinishda ber, har qatorda bitta gap, boshqa hech narsa yozma:
  raqam | kim | jins-yosh | his | o'zbekcha matn
  jins-yosh: erkak yoki ayol, keyin bola, yosh, katta yoki qari (masalan erkak-qari).
  his: oddiy, hurmat, gazab, baqiriq, uyat, shivir, qaygu, quvonch yoki qorquv.
- Faqat shovqin yoki ma'nosiz qator bo'lsa, matnini bo'sh qoldir.

"""


def manual_file(wd, segs, rules=""):
    """API kalitsiz yo'l: shu faylni Claude chatiga yuborib, javobini ilovaga qaytarish."""
    path = os.path.join(wd, "claude_uchun.txt")
    extra = f"Mening doimiy qoidalarim (bularga qat'iy amal qil):\n{rules.strip()}\n\n" if (rules or "").strip() else ""
    body = "\n".join(script_line(i, s) for i, s in enumerate(segs) if s["voice"] != KEEP)
    open(path, "w", encoding="utf-8").write(MANUAL_HEAD + extra + body + "\n")
    return path


def apply_manual(segs, text):
    n = 0
    for line in (text or "").splitlines():
        m = re.match(r"^\W*(\d+)\s*\|(.*)$", line)
        if not m or not 1 <= int(m.group(1)) <= len(segs):
            continue
        s, parts = segs[int(m.group(1)) - 1], [p.strip() for p in m.group(2).split("|")]
        if len(parts) >= 4:
            s["who"], s["mood"], s["uz"] = parts[0], parts[2].lower(), "|".join(parts[3:]).strip()
            if parse_voice(parts[1]) and s["voice"] != KEEP:
                s["voice"] = parts[1].lower()
        else:
            s["uz"] = parts[-1]
        n += 1
    return n


# ---------------------------------------------------------------- 6. o'zbekcha ovoz
def parse_voice(code, who=""):
    """'erkak-qari', 'ayol-bola' (yoki eski 'E1') -> (edge ovozi, balandlik Hz, tezlik %). ASL -> None."""
    code = (code or "").strip().lower()
    if not code or code == KEEP.lower() or code[0] not in "ea":
        return None
    g = code[0].upper()
    if code[1:].isdigit():
        return VOICES[g], PITCH[g][(int(code[1:]) - 1) % 4], 0
    hz, rate = AGES[next((a for a in AGES if a in code), "katta")]
    if who.strip():  # bir xil turdagi personajlar bir-biridan ozgina farq qilsin
        hz += (zlib.crc32(who.strip().lower().encode("utf-8")) % 5 - 2) * 5
    return VOICES[g], hz, rate


async def _tts_all(jobs, tick):
    import edge_tts

    sem = asyncio.Semaphore(6)
    done = 0

    async def one(path, text, voice, hz, rate):
        nonlocal done
        async with sem:
            for attempt in range(4):
                try:
                    await edge_tts.Communicate(text, voice, rate=f"{rate:+d}%", pitch=f"{hz:+d}Hz").save(path)
                    break
                except Exception as e:
                    if attempt == 3:
                        print("TTS xato:", text[:40], e)
                    await asyncio.sleep(1.5 * (attempt + 1))
        done += 1
        tick(done, len(jobs))

    await asyncio.gather(*(one(*j) for j in jobs))


def run_async(coro):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    import threading  # Colab/Gradio ichida allaqachon loop ishlayotgan bo'lsa

    box = {}
    t = threading.Thread(target=lambda: box.setdefault("r", asyncio.run(coro)))
    t.start()
    t.join()
    return box.get("r")


def synth(wd, segs, rate=8, tick=lambda a, b: None):
    """Har gap uchun mp3 yasaydi; allaqachon bor va hech narsasi o'zgarmagan bo'lsa qayta yasamaydi."""
    d = os.path.join(wd, "tts")
    os.makedirs(d, exist_ok=True)
    jobs = []
    for i, s in enumerate(segs):
        s["tts"] = None
        v = parse_voice(s["voice"], s.get("who", ""))
        if not v or not s["uz"].strip():
            continue
        mood = MOODS.get(s.get("mood"), MOODS["oddiy"])
        job = (s["uz"], v[0], int(v[1] + mood[1]), int(rate + v[2] + mood[0]))
        path = os.path.join(d, f"{i:04d}.mp3")
        tag = json.dumps(job, ensure_ascii=False)
        s["tts"] = path
        if os.path.exists(path) and os.path.getsize(path) > 500 and _read(path + ".txt") == tag:
            continue
        open(path + ".txt", "w", encoding="utf-8").write(tag)
        jobs.append((path,) + job)
    if jobs:
        run_async(_tts_all(jobs, tick))
    return segs


def _read(p):
    try:
        return open(p, encoding="utf-8").read()
    except OSError:
        return None


def load_clip(path, speed=1.0):
    """mp3 -> float32 mono, kerak bo'lsa tezlashtirib (ohang o'zgarmaydi)."""
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if speed > 1.01:
        cmd += ["-filter:a", f"atempo={speed:.3f}"]
    cmd += ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    loud = np.flatnonzero(np.abs(a) > 0.01)  # bosh va oxiridagi jimlikni kesish
    return a[max(0, loud[0] - 400):loud[-1] + 2000] if len(loud) else a[:0]


def ramp_gate(n, spans, fade=0.04):
    """spans ichida 0, tashqarida 1 bo'lgan, chekkalari yumshoq niqob."""
    g = np.ones(n, dtype=np.float32)
    f = int(fade * SR)
    for a, b in spans:
        a, b = max(0, int(a * SR)), min(n, int(b * SR))
        if b <= a:
            continue
        g[a:b] = 0
        la = min(f, a)
        g[a - la:a] = np.minimum(g[a - la:a], np.linspace(1, 0, la, dtype=np.float32))
        lb = min(f, n - b)
        g[b:b + lb] = np.minimum(g[b:b + lb], np.linspace(0, 1, lb, dtype=np.float32))
    return g


# ---------------------------------------------------------------- 6b. ovoz klonlash (ixtiyoriy)
VC_MODEL = "voice_conversion_models/multilingual/multi-dataset/openvoice_v2"
AUDIO_EXT = (".wav", ".mp3", ".m4a", ".ogg", ".flac", ".aac")
_vc = {}


def sample_dir():
    base = "/content" if os.path.isdir("/content") else os.path.dirname(os.path.abspath(__file__))
    d = os.path.join(base, "ovozlar")
    os.makedirs(d, exist_ok=True)
    return d


def samples():
    d = sample_dir()
    return {os.path.splitext(f)[0].strip().lower(): os.path.join(d, f)
            for f in sorted(os.listdir(d)) if f.lower().endswith(AUDIO_EXT)}


def find_sample(files, who, voice):
    """Namuna tanlash tartibi: personaj nomi, keyin 'erkak-katta' kabi tur, keyin 'erkak' / 'ayol'."""
    voice = (voice or "").lower()
    for name in ((who or "").strip().lower(), voice, voice.split("-")[0]):
        if name and name in files:
            return files[name]
    return None


def clone_all(wd, segs, tick=lambda a, b: None):
    """`ovozlar` papkasida namuna bo'lsa, yozilgan gaplarni shu ovoz tembriga o'tkazadi.
    Kutubxona o'rnatilmagan yoki xato bo'lsa, oddiy ovoz qoladi."""
    files = samples()
    todo = [(s, find_sample(files, s.get("who"), s["voice"])) for s in segs if s.get("tts")]
    todo = [(s, f) for s, f in todo if f]
    if not todo:
        return ""
    try:
        if "m" not in _vc:
            import torch
            from TTS.api import TTS

            _vc["m"] = TTS(VC_MODEL).to("cuda" if torch.cuda.is_available() else "cpu")
    except Exception as e:
        print("Ovoz klonlash yuklanmadi:", e)
        return "Ovoz klonlash ishlamadi (o'rnatilmagan bo'lishi mumkin), oddiy ovozlar ishlatildi."
    refs, n = {}, 0
    for k, (s, f) in enumerate(todo):
        out = s["tts"][:-4] + ".vc.wav"
        tag = f"{_read(s['tts'] + '.txt')}|{os.path.basename(f)}|{os.path.getmtime(f)}"
        try:
            if not (os.path.exists(out) and _read(out + ".txt") == tag):
                if f not in refs:
                    refs[f] = os.path.join(wd, "tts", f"namuna_{len(refs)}.wav")
                    sh("ffmpeg", "-y", "-i", f, "-ac", 1, "-ar", 22050, "-t", 60, refs[f])
                src = s["tts"][:-4] + ".src.wav"
                sh("ffmpeg", "-y", "-i", s["tts"], "-ac", 1, "-ar", 22050, src)
                _vc["m"].voice_conversion_to_file(source_wav=src, target_wav=refs[f], file_path=out)
                open(out + ".txt", "w", encoding="utf-8").write(tag)
            s["tts"] = out
            n += 1
        except Exception as e:
            print("Klonlash xato:", s["uz"][:40], e)
        tick(k + 1, len(todo))
    return f"{n} ta gap klonlangan ovozda yozildi."


# ---------------------------------------------------------------- 7. mix
def mix(wd, segs, out_dir, src=None, keep_original=True, max_speed=1.6, voice_gain=1.0):
    os.makedirs(out_dir, exist_ok=True)
    fon, _ = sf.read(os.path.join(wd, "fon.wav"), dtype="float32", always_2d=True)
    voc, _ = sf.read(os.path.join(wd, "ovoz.wav"), dtype="float32", always_2d=True)
    n = len(fon)
    dub = np.zeros(n, dtype=np.float32)
    spans, levels = [], []
    live = [s for s in segs if s.get("tts") and os.path.exists(s["tts"])]
    for s in live:
        a, b = int(s["start"] * SR), int(s["end"] * SR)
        seg = voc[a:b]
        if len(seg):
            levels.append(float(np.sqrt((seg ** 2).mean())))
    target = float(np.clip(np.median(levels) if levels else 0.08, 0.05, 0.2)) * voice_gain
    starts = sorted(s["start"] for s in segs)
    for s in live:
        later = [t for t in starts if t > s["start"] + 0.01]
        room = (later[0] if later else n / SR) - s["start"] - 0.06
        allowed = max(0.4, min(room, (s["end"] - s["start"]) + 1.2))
        clip = load_clip(s["tts"])
        if len(clip) / SR > allowed:
            clip = load_clip(s["tts"], min(max_speed, len(clip) / SR / allowed))
        if len(clip) / SR > allowed:  # baribir sig'masa, oxiri yumshoq kesiladi
            clip = clip[:int(allowed * SR)]
            k = min(len(clip), int(0.08 * SR))
            clip[-k:] *= np.linspace(1, 0, k, dtype=np.float32)
        if not len(clip):
            continue
        rms = float(np.sqrt((clip ** 2).mean())) + 1e-6
        clip *= target / rms * MOODS.get(s.get("mood"), MOODS["oddiy"])[2]
        a = int(s["start"] * SR)
        clip = clip[:n - a]
        dub[a:a + len(clip)] += clip
        spans.append((s["start"] - 0.05, max(s["end"], s["start"] + len(clip) / SR) + 0.05))
        s["dub_end"] = round(s["start"] + len(clip) / SR, 2)

    bed = fon + voc * ramp_gate(n, spans)[:, None] if keep_original else fon.copy()
    full = bed + dub[:, None]
    peak = float(np.abs(full).max())
    if peak > 0.98:
        full *= 0.98 / peak
    paths = {
        "toliq": os.path.join(out_dir, "dublyaj_toliq.wav"),
        "ovoz": os.path.join(out_dir, "faqat_uzbek_ovoz.wav"),
        "fon": os.path.join(out_dir, "fon_va_asl_tovushlar.wav"),
        "srt": os.path.join(out_dir, "uzbekcha.srt"),
    }
    sf.write(paths["toliq"], full, SR, subtype="PCM_16")
    sf.write(paths["ovoz"], np.clip(dub, -1, 1), SR, subtype="PCM_16")
    sf.write(paths["fon"], np.clip(bed, -1, 1), SR, subtype="PCM_16")
    write_srt(segs, paths["srt"])
    if src and has_video(src):
        paths["video"] = os.path.join(out_dir, "dublyaj_video.mp4")
        sh("ffmpeg", "-y", "-i", src, "-i", paths["toliq"], "-map", "0:v:0", "-map", "1:a:0",
           "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", paths["video"])
    return paths


def has_video(src):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=codec_type", "-of", "csv=p=0", src], capture_output=True, text=True)
    return "video" in r.stdout


def write_srt(segs, path):
    def ts(t):
        ms = int(round(t * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    rows = [s for s in segs if s["uz"].strip()]
    with open(path, "w", encoding="utf-8") as f:
        for i, s in enumerate(rows, 1):
            f.write(f"{i}\n{ts(s['start'])} --> {ts(s['end'])}\n{s['uz']}\n\n")


# ---------------------------------------------------------------- umumiy bosqichlar
def analyse(src, wd, progress=None, api_key="", rules=""):
    os.makedirs(wd, exist_ok=True)
    note(progress, 0.02, "Videodan tovush olinmoqda")
    wav = extract_audio(src, wd)
    note(progress, 0.08, "Ovoz va fon ajratilmoqda (eng uzun bosqich)")
    separate(wav, wd, lambda f: progress and progress(0.08 + 0.45 * f, desc=f"Ovoz va fon ajratilmoqda {int(f * 100)}%"))
    note(progress, 0.55, "Xitoycha gaplar aniqlanmoqda")
    segs = transcribe(wd)
    note(progress, 0.8, "Ovozlar tahlil qilinmoqda (erkak/ayol, personajlar)")
    assign_voices(wd, segs)
    for s in segs:
        s["uz"] = ""
    info = ""
    api_key = (api_key or os.environ.get("ANTHROPIC_API_KEY", "")).strip()
    if api_key:
        try:
            info = claude_translate(segs, api_key, rules, note_fn=lambda t: note(progress, 0.9, t))
        except RuntimeError as e:
            info = f"Avtomatik tarjima bo'lmadi: {e}. Faylni Claude chatiga yuboring."
    manual_file(wd, segs, rules)
    json.dump({"src": src, "segs": segs}, open(os.path.join(wd, "segs.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    note(progress, 1.0, f"Tayyor: {len(segs)} ta gap")
    return segs, info


def dub(src, wd, segs, out_dir, progress=None, keep_original=True, rate=8, max_speed=1.6, voice_gain=1.0):
    note(progress, 0.02, "O'zbekcha ovozlar yozilmoqda")
    synth(wd, segs, rate, lambda a, b: progress and progress(0.02 + 0.55 * a / b, desc=f"Ovoz {a}/{b}"))
    note(progress, 0.6, "Ovoz namunalari tekshirilmoqda")
    info = clone_all(wd, segs, lambda a, b: progress and progress(0.6 + 0.15 * a / b, desc=f"Ovoz klonlash {a}/{b}"))
    note(progress, 0.75, "Fon bilan birlashtirilmoqda")
    paths = mix(wd, segs, out_dir, src, keep_original, max_speed, voice_gain)
    paths["info"] = info
    note(progress, 1.0, "Tayyor")
    return paths


def to_rows(segs):
    return [[i + 1, s["start"], s["end"], s.get("who", ""), s["voice"], s.get("mood", "oddiy"), s["zh"], s["uz"]]
            for i, s in enumerate(segs)]


def from_rows(rows):
    segs = []
    for r in rows:
        try:
            a, b = float(r[1]), float(r[2])
        except (TypeError, ValueError):
            continue
        if b > a:
            voice = str(r[4] or "").strip()
            segs.append({"start": a, "end": b, "who": str(r[3] or "").strip(),
                         "voice": KEEP if not voice or voice.upper() == KEEP else voice.lower(),
                         "mood": str(r[5] or "oddiy").strip().lower(), "zh": str(r[6] or ""), "uz": str(r[7] or "")})
    return sorted(segs, key=lambda s: s["start"])


# ---------------------------------------------------------------- Gradio oynasi
HELP = """**kim**: personaj nomi (bir personajga bir xil nom, ovozi ham bir xil chiqadi).
**ovoz**: `erkak` yoki `ayol`, keyin `-bola`, `-yosh`, `-katta` yoki `-qari` (masalan `ayol-yosh`); `ASL` = shu joyda
asl ovoz qoladi. **his**: oddiy, hurmat, gazab, baqiriq, uyat, shivir, qaygu, quvonch, qorquv.
Jadvalni qo'lda tuzatib, "Jadval bo'yicha qayta dublyaj" ni bosing: faqat o'zgargan gaplar qayta yoziladi."""
ON_COLAB = os.path.isdir("/content")
KEY_FILE = os.path.join(os.path.expanduser("~"), ".dublyaj_kalit")
RULES_FILE = os.path.join(os.path.expanduser("~"), ".dublyaj_qoidalar.txt")


def remember_key(key):
    key = (key or "").strip()
    if key and not ON_COLAB:
        open(KEY_FILE, "w").write(key)
    return key or (_read(KEY_FILE) or "").strip()


def ui(wd=None, out_dir=None):
    import gradio as gr

    base = "/content" if ON_COLAB else os.path.dirname(os.path.abspath(__file__))
    wd = wd or os.path.join(base, "dub_work")
    out_dir = out_dir or os.path.join(base, "natija")
    need_claude = ("Tarjima uchun: **Qo'shimcha sozlamalar** bo'limidagi `claude_uchun.txt` faylini Claude chatiga yuboring, "
                   "javobini 'Claude javobi' maydoniga qo'ying va 'Tarjimani qo'yib, dublyaj qilish' ni bosing.")

    def outputs(p, rows, msg, tfile):
        return (p.get("toliq"), p.get("toliq"), p.get("ovoz"), p.get("fon"), p.get("srt"), p.get("video"),
                rows, (msg + " " + p.get("info", "")).strip(), tfile)

    def run_dub(segs, keep, rate, speed, gain, progress):
        meta = os.path.join(wd, "segs.json")
        if not os.path.exists(meta):
            raise gr.Error("Avval videoni yuklab, katta tugmani bosing")
        return dub(json.load(open(meta, encoding="utf-8"))["src"], wd, segs, out_dir, progress,
                   keep, int(rate), float(speed), float(gain))

    def do_all(video, path, key, rules, keep, rate, speed, gain, progress=gr.Progress()):
        video = (path or "").strip().strip('"') or video
        if not video or not os.path.exists(video):
            raise gr.Error("Avval video yuklang")
        open(RULES_FILE, "w", encoding="utf-8").write(rules or "")
        segs, info = analyse(video, wd, progress, remember_key(key), rules)
        tfile = os.path.join(wd, "claude_uchun.txt")
        if not any(s["uz"] for s in segs):
            return outputs({}, to_rows(segs), f"{len(segs)} ta gap topildi. {info} {need_claude}", tfile)
        p = run_dub(segs, keep, rate, speed, gain, progress)
        return outputs(p, to_rows(segs), f"Tayyor: {len(segs)} ta gap. Fayllar papkasi: `{out_dir}`. {info}", tfile)

    def do_redub(rows, pasted, keep, rate, speed, gain, progress=gr.Progress()):
        rows = rows.values.tolist() if hasattr(rows, "values") else rows
        segs = from_rows(rows)
        n = apply_manual(segs, pasted)
        p = run_dub(segs, keep, rate, speed, gain, progress)
        msg = f"Tayyor. Fayllar papkasi: `{out_dir}`." + (f" Claude javobidan {n} ta gap olindi." if n else "")
        return outputs(p, to_rows(segs), msg, os.path.join(wd, "claude_uchun.txt"))

    def do_fix(rows, notes, key, rules, keep, rate, speed, gain, progress=gr.Progress()):
        if not (notes or "").strip():
            raise gr.Error("Avval xatoni yozing")
        key = remember_key(key)
        if not key:
            raise gr.Error("Bu tugma Claude API kaliti bilan ishlaydi. Kalitsiz: jadvalni qo'lda tuzating "
                           "yoki tuzatishni Claude chatiga yozing.")
        open(RULES_FILE, "w", encoding="utf-8").write(rules or "")
        rows = rows.values.tolist() if hasattr(rows, "values") else rows
        segs = from_rows(rows)
        try:
            info = claude_fix(segs, key, notes, rules)
        except RuntimeError as e:
            raise gr.Error(str(e))
        p = run_dub(segs, keep, rate, speed, gain, progress)
        return outputs(p, to_rows(segs), info, os.path.join(wd, "claude_uchun.txt"))

    def sample_list():
        names = [os.path.basename(f) for f in samples().values()]
        return "**Saqlangan ovoz namunalari:** " + (", ".join(names) if names else "hali yo'q (oddiy ovozlar ishlatiladi)")

    def add_sample(file, name):
        name = re.sub(r'[\\/:*?"<>|]', "", (name or "").strip())
        if not file or not name:
            raise gr.Error("Ovoz faylini tanlang va kimga ekanini yozing")
        shutil.copy(file, os.path.join(sample_dir(), name + os.path.splitext(file)[1].lower()))
        return sample_list()

    with gr.Blocks(title="Donghua dublyaj") as app:
        gr.Markdown("# Donghua dublyaj: xitoycha → o'zbekcha\nVideoni tanlang va tugmani bosing. Tayyor audio pastda chiqadi.")
        video = gr.File(label="Video yoki audio fayl", type="filepath")
        key = gr.Textbox(label="Claude API kaliti (bir marta yoziladi; bo'lmasa tarjima Claude chati orqali)",
                         type="password", placeholder="sk-ant-...", value="" if ON_COLAB else remember_key(""))
        go = gr.Button("Dublyaj qilish", variant="primary", size="lg")
        status = gr.Markdown()
        player = gr.Audio(label="Tayyor dublyaj", type="filepath", interactive=False)
        o1 = gr.File(label="To'liq dublyaj (ovoz + fon), WAV")
        o2 = gr.File(label="Faqat o'zbekcha ovoz (joyiga qo'yilgan), WAV")
        with gr.Accordion("Qo'shimcha fayllar", open=False):
            o3 = gr.File(label="Fon va asl tovushlar, WAV")
            o4 = gr.File(label="O'zbekcha subtitr, SRT")
            o5 = gr.File(label="Dublyajli video, MP4")
        with gr.Accordion("Qo'shimcha sozlamalar va xatolarni tuzatish", open=False):
            rules = gr.Textbox(
                label="Doimiy qoidalar (har safar Claude shularga amal qiladi; ilova eslab qoladi)", lines=4,
                value=_read(RULES_FILE) or "",
                placeholder="Masalan: Dushmanlar bir-biriga faqat sensirab gapiradi. Ustozga doim siz. Lin Fan - o'g'il bola, 16 yosh.")
            fix = gr.Textbox(label="Xatoni yozing, Claude butun ssenariyda tuzatadi", lines=3,
                             placeholder="Masalan: 45-gapda u dushmaniga sizlab gapiryapti, sensirasin. Syao Yu qiz bola, erkak ovoz qo'yilgan.")
            fixb = gr.Button("Claude tuzatsin va qayta dublyaj qilsin")
            gr.Markdown("**Ovoz klonlash.** 15-30 soniyalik toza ovoz yozuvini yuklang (o'zingizniki yoki roziligi bor "
                        "odamniki). Kimga: personaj nomi (jadvaldagi `kim`), yoki `erkak-katta`, `ayol-yosh` kabi tur, "
                        "yoki shunchaki `erkak` / `ayol`.")
            sfile = gr.File(label="Ovoz namunasi (wav, mp3)", type="filepath")
            sname = gr.Textbox(label="Kimga", placeholder="Lin Fan yoki erkak-qari")
            sbtn = gr.Button("Namunani saqlash")
            slist = gr.Markdown(sample_list())
            sbtn.click(add_sample, [sfile, sname], slist)
            path = gr.Textbox(label="Fayl yo'li (yuklash o'rniga, katta fayllar uchun)")
            tfile = gr.File(label="claude_uchun.txt: API kalit bo'lmasa shu faylni Claude chatiga yuboring")
            pasted = gr.Textbox(label="Claude javobi (raqam | o'zbekcha matn)", lines=5)
            gr.Markdown(HELP)
            table = gr.Dataframe(headers=COLS, datatype=["number", "number", "number", "str", "str", "str", "str", "str"],
                                 interactive=True, wrap=True, row_count=(1, "dynamic"))
            keep = gr.Checkbox(True, label="Kulgi, qichqiriq va tarjima qilinmagan asl ovozlarni qoldirish")
            rate = gr.Slider(-10, 30, 8, step=1, label="Gapirish tezligi, %")
            speed = gr.Slider(1.0, 2.0, 1.6, step=0.05, label="Vaqtga sig'dirish uchun eng ko'p tezlashtirish")
            gain = gr.Slider(0.5, 2.0, 1.0, step=0.05, label="O'zbekcha ovoz balandligi")
            redo = gr.Button("Tarjimani qo'yib, dublyaj qilish / Jadval bo'yicha qayta dublyaj")
        outs = [player, o1, o2, o3, o4, o5, table, status, tfile]
        go.click(do_all, [video, path, key, rules, keep, rate, speed, gain], outs)
        fixb.click(do_fix, [table, fix, key, rules, keep, rate, speed, gain], outs)
        redo.click(do_redub, [table, pasted, keep, rate, speed, gain], outs)
    return app


if __name__ == "__main__":
    if len(sys.argv) > 1:
        source = sys.argv[1]
        work = os.path.abspath("dub_work")
        result = dub(source, work, analyse(source, work)[0], os.path.abspath("natija"))
        print(json.dumps(result, ensure_ascii=False, indent=1))
    else:
        ui().queue().launch(share=ON_COLAB, debug=ON_COLAB, inbrowser=not ON_COLAB)
