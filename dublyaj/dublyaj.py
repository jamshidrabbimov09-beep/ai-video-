"""Donghua dublyaj: xitoycha videoni o'zbekcha AI ovozga o'tkazadi.

Bosqichlar:
  1. ffmpeg: videodan tovushni oladi.
  2. Demucs: ovoz (aktyorlar) va fon (musiqa, shovqin, effektlar) ni ajratadi.
  3. faster-whisper: xitoycha gaplarni va ularning vaqtini aniqlaydi.
  4. Ovoz tahlili: har gap erkak yoki ayol ovozi ekanini, kim gapirayotganini taxmin qiladi.
  5. Claude: butun qismni kontekst bilan tarjima qiladi, keyin tarjimani tahlil qilib tuzatadi
     (API kalit bilan avtomatik, kalitsiz: fayl orqali Claude chatida).
  6. edge-tts: o'zbekcha ovoz (Sardor - erkak, Madina - ayol), gap vaqtiga sig'diriladi.
  6b. OmniVoice: har gap xitoycha aktyorning o'sha gapidan klonlanib, o'zbekcha aytiladi (oddiy ovoz zaxira).
  7. Mix: fon + (kulgi, qichqiriq kabi tarjima qilinmagan asl ovoz) + o'zbekcha ovoz.

Ishga tushirish: Windowsda `Dublyaj.bat`, telefonda Colab daftari `Donghua_Dublyaj.ipynb`, yoki
  python dublyaj.py <loyiha nomi> video.mp4      # natija loyihalar/<loyiha>/natija/
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
    r = subprocess.run([str(a) for a in args], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        raise RuntimeError(f"{args[0]} xato: {r.stderr[-600:]}")


def note(progress, frac, text):
    print(f"[{int(frac * 100):3d}%] {text}", flush=True)
    if progress:
        progress(frac, desc=text)


# ---------------------------------------------------------------- loyihalar (har donghua uchun alohida xotira)
ON_COLAB = os.path.isdir("/content")
BASE = "/content" if ON_COLAB else os.path.dirname(os.path.abspath(__file__))
PROJ = {"dir": None, "wd": None, "out": None}


def clean_name(name):
    return re.sub(r'[\\/:*?"<>|]', "", str(name or "")).strip().strip(".")


def projects():
    d = os.path.join(BASE, "loyihalar")
    return sorted(x for x in os.listdir(d) if os.path.isdir(os.path.join(d, x))) if os.path.isdir(d) else []


def open_project(name):
    """Loyiha papkasi: ovozlar/ (personaj ovoz namunalari), personajlar.json, xotira.txt, qoidalar.txt,
    ish/ (vaqtinchalik fayllar), natija/ (tayyor qismlar)."""
    d = os.path.join(BASE, "loyihalar", clean_name(name) or "umumiy")
    for sub in ("ovozlar", "ish", "natija"):
        os.makedirs(os.path.join(d, sub), exist_ok=True)
    PROJ.update(dir=d, wd=None, out=None)
    done = [x for x in os.listdir(os.path.join(d, "ish")) if os.path.exists(os.path.join(d, "ish", x, "segs.json"))]
    if done:  # oxirgi ishlangan qismni davom ettirish mumkin bo'lsin
        last = max(done, key=lambda x: os.path.getmtime(os.path.join(d, "ish", x, "segs.json")))
        PROJ.update(wd=os.path.join(d, "ish", last), out=os.path.join(d, "natija", last))
    return d


def start_episode(src):
    """Yangi qism uchun ish papkasi. Oldingi qismlarning katta vaqtinchalik fayllari o'chiriladi (natijalar qoladi)."""
    if not PROJ["dir"]:
        open_project("umumiy")
    name = clean_name(os.path.splitext(os.path.basename(src))[0]) or "qism"
    ish = os.path.join(PROJ["dir"], "ish")
    for other in os.listdir(ish):
        if other != name:
            shutil.rmtree(os.path.join(ish, other), ignore_errors=True)
    PROJ.update(wd=os.path.join(ish, name), out=os.path.join(PROJ["dir"], "natija", name))
    os.makedirs(PROJ["wd"], exist_ok=True)
    return PROJ["wd"], PROJ["out"]


def local_copy(src, wd):
    """Asl faylni oddiy nom bilan ish papkasiga ko'chiradi (xitoycha nomlar va vaqtinchalik papkalar muammo bermasin)."""
    dst = os.path.join(wd, "asl" + os.path.splitext(src)[1].lower())
    if os.path.abspath(src) != os.path.abspath(dst):
        if not (os.path.exists(dst) and os.path.getsize(dst) == os.path.getsize(src)):
            shutil.copyfile(src, dst)
    return dst


def proj_file(name):
    return os.path.join(PROJ["dir"] or open_project("umumiy"), name)


def cast_load():
    try:
        return json.load(open(proj_file("personajlar.json"), encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def cast_merge(rows):
    cast = cast_load()
    for r in rows or []:
        if str(r.get("kim", "")).strip():
            cast[r["kim"].strip()] = {"jins": r.get("jins", ""), "yosh": r.get("yosh", ""), "tavsif": r.get("tavsif", "")}
    json.dump(cast, open(proj_file("personajlar.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def memory_add(text):
    if (text or "").strip():
        old = _read(proj_file("xotira.txt")) or ""
        open(proj_file("xotira.txt"), "w", encoding="utf-8").write((old + "\n" + text.strip())[-6000:])


def memory_block():
    """Shu donghuaning oldingi qismlaridan ma'lum bo'lgan personajlar va eslatmalar (Claude uchun)."""
    out = ""
    cast = cast_load()
    if cast:
        rows = "\n".join(f"- {k} | {'male' if v.get('jins') == 'E' else 'female'} | {v.get('yosh')} | {v.get('tavsif')}"
                         for k, v in cast.items())
        out += ("Known cast of this series from earlier episodes. When one of them speaks, use exactly the same label, "
                f"gender and age, and keep their established sen/siz relations:\n{rows}\n\n")
    notes = (_read(proj_file("xotira.txt")) or "").strip()
    if notes:
        out += f"Editor's notes from earlier episodes (names, terms, relations):\n{notes}\n\n"
    return out


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
    # Tovush o'zimiz o'qib beriladi: faster-whisper ning fayl o'qishi `av` ning yangi versiyalarida buziladi.
    audio16, _ = sf.read(os.path.join(wd, "ovoz16k.wav"), dtype="float32")
    segs, _ = model.transcribe(
        audio16, language="zh", word_timestamps=True, vad_filter=True,
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
        s["mood"], s["cl"] = "oddiy", int(labels[i])
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
often wrong, especially for boys, young men and deep-voiced women. It may be followed by `ovoz N`, an automatic
grouping of similar-sounding voices: lines with the same number were probably, not certainly, spoken by one person. `seconds` is how long the original line lasts.

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

Also return `personajlar`: every character who speaks in the lines you return, with gender, age and `tavsif`, one
sentence in Uzbek saying who they are and whom they address with sen or siz. This list is remembered for the next
episodes of the series, so when a known cast is given, reuse its labels exactly for returning characters.

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
        "personajlar": {"type": "array", "items": {
            "type": "object",
            "properties": {"kim": {"type": "string"}, "jins": {"type": "string", "enum": ["E", "A"]},
                           "yosh": {"type": "string", "enum": list(AGES)}, "tavsif": {"type": "string"}},
            "required": ["kim", "jins", "yosh", "tavsif"], "additionalProperties": False}},
        "izoh": {"type": "string"},
    },
    "required": ["lines", "personajlar", "izoh"], "additionalProperties": False,
}


def script_line(i, s, draft=False):
    hint = s["voice"].split("-")[0] + (f", ovoz {s['cl'] + 1}" if s.get("cl", -1) >= 0 else "")
    row = f"{i + 1} | {hint} | {s['end'] - s['start']:.1f}s | {s['zh']}"
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
    data = json.loads(next(b.text for b in msg.content if b.type == "text"))
    cast_merge(data.get("personajlar"))
    return data


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
    return memory_block() + (
        f"The user's standing rules for this dub. They override your own choices:\n{rules}\n\n" if rules else "")


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
    memory_add(" ".join(notes))
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
                    await edge_tts.Communicate(text, voice, rate=f"{rate:+d}%", pitch=f"{hz:+d}Hz",
                                               proxy=os.environ.get("HTTPS_PROXY") or None).save(path)
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
        if s.get("ov") and s.get("tts"):
            continue  # klonlangan ovozda yozilgan
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


# ---------------------------------------------------------------- 6b. ovoz klonlash (OmniVoice)
# OmniVoice (k2-fsa/OmniVoice, VoiceStudio ham shuni ishlatadi): 600+ til, o'zbekcha ham bor. Qisqa yozuvdan
# ovozni klonlaydi va gapni aniq berilgan uzunlikda aytadi. Har gap uchun xitoycha aktyorning aynan o'sha gapi
# namuna qilinadi: ovoz ham, ohang (baqiriq, shivir, yig'i) ham o'sha gapdan olinadi.
AUDIO_EXT = (".wav", ".mp3", ".m4a", ".ogg", ".flac", ".aac")
OV_AGE = {"bola": "child", "yosh": "young adult", "katta": "middle-aged", "qari": "elderly"}
_ov = {}


def sample_dir():
    return proj_file("ovozlar")


def samples():
    d = sample_dir()
    return {os.path.splitext(f)[0].strip().lower(): os.path.join(d, f)
            for f in sorted(os.listdir(d)) if f.lower().endswith(AUDIO_EXT)}


def find_sample(files, who, voice):
    """Namuna tanlash tartibi: personaj nomi, keyin 'erkak-katta' kabi tur, keyin 'erkak' / 'ayol'."""
    voice = (voice or "").lower()
    for name in (clean_name(who).lower(), voice, voice.split("-")[0]):
        if name and name in files:
            return files[name]
    return None


def sample_text(path):
    """Namunadagi gap matni (klonlash aniqroq bo'ladi). Bo'lmasa, Whisper bilan bir marta yozib olinadi."""
    txt = os.path.splitext(path)[0] + ".txt"
    if os.path.exists(txt):
        return _read(txt).strip() or None
    try:
        from faster_whisper import WhisperModel

        tmp = os.path.splitext(path)[0] + ".16k.wav"
        sh("ffmpeg", "-y", "-i", path, "-ac", 1, "-ar", 16000, tmp)
        audio16, _ = sf.read(tmp, dtype="float32")
        os.remove(tmp)
        segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio16, vad_filter=True)
        text = "".join(s.text for s in segs).strip()
    except Exception as e:
        print("Namuna matnini aniqlab bo'lmadi:", e)
        text = ""
    open(txt, "w", encoding="utf-8").write(text)
    return text or None


def main_cluster(segs):
    """Har personajning eng ko'p uchragan ovoz guruhi (boshqa odam ovozi aralashmasin)."""
    out = {}
    for s in segs:
        if s.get("cl", -1) >= 0 and clean_name(s.get("who")):
            out.setdefault(clean_name(s["who"]), []).append(s["cl"])
    return {k: max(set(v), key=v.count) for k, v in out.items()}


def own_voice(s, mains):
    m = mains.get(clean_name(s.get("who")))
    return m is None or s.get("cl", -1) in (-1, m)


def build_samples(wd, segs, min_sec=3.0, want_sec=9.0):
    """Har yangi personaj uchun asl (xitoycha) ovozidan 3-10 soniyalik namuna va uning matnini saqlaydi.
    Namunasi bor personajga tegilmaydi: keyingi qismlarda ham ovozi o'sha-o'sha qoladi."""
    files, groups, made, mains = samples(), {}, [], main_cluster(segs)
    for s in segs:
        if s["voice"] != KEEP and clean_name(s.get("who")) and own_voice(s, mains):
            groups.setdefault(clean_name(s["who"]), []).append(s)
    path = os.path.join(wd, "ovoz.wav")
    if not groups or not os.path.exists(path):
        return made
    with sf.SoundFile(path) as f:
        for who, ss in groups.items():
            if who.lower() in files:
                continue
            ss = sorted(ss, key=lambda s: (s.get("mood") not in ("oddiy", "hurmat"), s["start"] - s["end"]))
            parts, texts, total = [], [], 0.0
            for s in ss:
                if total >= want_sec:
                    break
                f.seek(int(s["start"] * SR))
                parts.append(f.read(int((s["end"] - s["start"]) * SR), dtype="float32", always_2d=True).mean(1))
                parts.append(np.zeros(int(0.2 * SR), dtype=np.float32))
                texts.append(s["zh"])
                total += s["end"] - s["start"]
            if total < min_sec:
                continue  # juda kam gapirgan: keyingi qismlarda yig'iladi
            sf.write(os.path.join(sample_dir(), who + ".wav"), np.concatenate(parts), SR, subtype="PCM_16")
            open(os.path.join(sample_dir(), who + ".txt"), "w", encoding="utf-8").write("".join(texts))
            made.append(who)
    return made


def ov_model():
    if "m" not in _ov:
        import torch
        from omnivoice import OmniVoice

        gpu = torch.cuda.is_available()
        _ov["m"] = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cuda:0" if gpu else "cpu",
                                             dtype=torch.float16 if gpu else torch.float32)
    return _ov["m"]


def ov_free():
    _ov.pop("w", None)
    if _ov.pop("m", None) is not None:
        try:
            import torch

            torch.cuda.empty_cache()
        except Exception:
            pass


def slot_of(s, segs, total):
    """Gap qancha vaqtga sig'ishi kerak: asl gap uzunligi, kerak bo'lsa keyingi gapgacha bo'lgan pauza ham."""
    later = [x["start"] for x in segs if x["start"] > s["start"] + 0.01]
    room = (min(later) if later else total) - s["start"] - 0.06
    slot = s["end"] - s["start"]
    allowed = max(0.5, min(room, slot + 1.2))
    natural = len(s["uz"]) / 13.0  # o'zbekcha tabiiy tezlik: sekundiga ~13 belgi
    return round(float(min(allowed, max(slot * 0.9, natural, 0.5))), 2)


CYR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюяўқғҳ",
               ["a", "b", "v", "g", "d", "e", "yo", "j", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t",
                "u", "f", "x", "ts", "ch", "sh", "sh", "", "i", "", "e", "yu", "ya", "o", "q", "g", "h"]))


def norm_uz(text):
    text = "".join(CYR.get(c, c) for c in (text or "").lower())
    return re.sub(r"[^a-z]", "", text)


def checker():
    """Yozilgan gapni eshitib tekshirish uchun kichik Whisper (CPU)."""
    if "w" not in _ov:
        from faster_whisper import WhisperModel

        _ov["w"] = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
    return _ov["w"]


def heard_score(audio, sr, text):
    """0..1: Whisper eshitgan matn yozilishi kerak bo'lgan matnga qanchalik o'xshaydi."""
    import difflib

    n = int(len(audio) * 16000 / sr)
    a16 = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype(np.float32)
    segs, _ = checker().transcribe(a16, language="uz", beam_size=1)
    got = norm_uz("".join(x.text for x in segs))
    return difflib.SequenceMatcher(None, got, norm_uz(text)).ratio()


def ov_synth(wd, segs, per_line=True, tick=lambda a, b: None, tries=3):
    """Klonlangan o'zbekcha ovoz. Muvaffaqiyatli gaplarga s['tts'] qo'yiladi, qolganlari oddiy ovozda yoziladi."""
    todo = [(i, s) for i, s in enumerate(segs) if s["voice"] != KEEP and s["uz"].strip()]
    if not todo:
        return ""
    try:
        model = ov_model()
    except Exception as e:
        print("OmniVoice yuklanmadi:", e)
        return f"Klonlash ishlamadi ({type(e).__name__}: {str(e)[:200]}), oddiy ovozlar ishlatildi."
    d = os.path.join(wd, "tts")
    os.makedirs(d, exist_ok=True)
    files, mains = samples(), main_cluster(segs)
    total = sf.info(os.path.join(wd, "ovoz.wav")).duration
    vf = sf.SoundFile(os.path.join(wd, "ovoz.wav"))
    n = 0
    for k, (i, s) in enumerate(todo):
        out = os.path.join(d, f"{i:04d}.ov.wav")
        dur = slot_of(s, segs, total)
        ref = ref_text = instruct = None
        if per_line and s["end"] - s["start"] >= 1.6 and own_voice(s, mains):
            ref, ref_text = os.path.join(d, f"{i:04d}.ref.wav"), s["zh"]
            mode = f"line|{s['start']}|{s['end']}"
        else:
            ref = find_sample(files, s.get("who"), s["voice"])
            if ref:
                ref_text, mode = sample_text(ref), f"sample|{os.path.basename(ref)}|{os.path.getmtime(ref)}"
            else:
                g = "male" if s["voice"].startswith("e") else "female"
                age = OV_AGE[next((a for a in OV_AGE if a in s["voice"]), "katta")]
                instruct = f"{g}, {age}" + (", whisper" if s.get("mood") == "shivir" else "")
                mode = "design|" + instruct
        tag = json.dumps([s["uz"], dur, mode], ensure_ascii=False)
        try:
            if not (os.path.exists(out) and _read(out + ".txt") == tag):
                if mode.startswith("line"):
                    a = max(0, int((s["start"] - 0.05) * SR))
                    vf.seek(a)
                    clip = vf.read(int((s["end"] - s["start"] + 0.1) * SR), dtype="float32", always_2d=True).mean(1)
                    sf.write(ref, clip, SR, subtype="PCM_16")
                kw = dict(text=s["uz"], language="uz", duration=dur)
                if instruct:
                    kw["instruct"] = instruct
                else:
                    kw.update(ref_audio=ref, ref_text=ref_text or None)
                best, best_score = None, -1.0
                for _ in range(max(1, tries)):  # model har safar biroz boshqacha aytadi: eng tushunarlisini olamiz
                    audio = model.generate(**kw)[0]
                    try:
                        score = heard_score(audio, model.sampling_rate, s["uz"]) if tries > 1 else 1.0
                    except Exception as e:
                        print("Tekshiruv ishlamadi:", e)
                        score, tries = 1.0, 1
                    if score > best_score:
                        best, best_score = audio, score
                    if score >= 0.6:
                        break
                s["score"] = round(best_score, 2)
                sf.write(out, best, model.sampling_rate, subtype="PCM_16")
                open(out + ".txt", "w", encoding="utf-8").write(tag)
            s["tts"], s["ov"] = out, True
            n += 1
        except Exception as e:
            print("Klonlash xato:", s["uz"][:40], e)
        tick(k + 1, len(todo))
    vf.close()
    weak = [str(i + 1) for i, s in todo if s.get("score", 1) < 0.5]
    return f"{n} ta gap klonlangan ovozda yozildi." + (
        f" Tushunarsizroq chiqqan bo'lishi mumkin: {', '.join(weak)}-gaplar (jadvalda matnini biroz o'zgartirib, "
        "qayta dublyaj qilsangiz qayta yoziladi)." if weak else "")


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
        # Klonlangan gapda ovoz kuchi asl gapdan keladi; oddiy ovozda his-tuyg'u kuchi qo'shiladi.
        loud = float(np.sqrt((voc[int(s["start"] * SR):int(s["end"] * SR)] ** 2).mean() + 1e-9)) if s.get("ov") else 0
        clip *= (float(np.clip(loud / (target / voice_gain), 0.6, 1.8)) * target if loud else
                 target * MOODS.get(s.get("mood"), MOODS["oddiy"])[2]) / rms
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
                        "stream=codec_type", "-of", "csv=p=0", src], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
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


def dub(src, wd, segs, out_dir, progress=None, keep_original=True, rate=8, max_speed=1.6, voice_gain=1.0,
        clone=True, per_line=True):
    info = ""
    for s in segs:
        s.pop("ov", None)
        s["tts"] = None
    if clone:
        note(progress, 0.02, "Personaj ovozlari tayyorlanmoqda")
        made = build_samples(wd, segs)
        if made:
            info = f"Yangi personaj ovozlari saqlandi: {', '.join(made)}. "
        note(progress, 0.05, "Klonlangan o'zbekcha ovozlar yozilmoqda (birinchi safar model yuklanadi)")
        info += ov_synth(wd, segs, per_line, lambda a, b: progress and progress(
            0.05 + 0.65 * a / b, desc=f"Klonlangan ovoz {a}/{b}"))
        ov_free()
    note(progress, 0.72, "Oddiy ovozlar yozilmoqda")
    synth(wd, segs, rate, lambda a, b: progress and progress(0.72 + 0.1 * a / b, desc=f"Ovoz {a}/{b}"))
    lost = [s for s in segs if s["voice"] != KEEP and s["uz"].strip()
            and not (s.get("tts") and os.path.exists(s["tts"]) and os.path.getsize(s["tts"]) > 500)]
    if lost:
        info += f" Diqqat: {len(lost)} ta gap ovozga aylanmadi (internetni tekshirib, qayta bosing)."
    note(progress, 0.85, "Fon bilan birlashtirilmoqda")
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
KEY_FILE = os.path.join(os.path.expanduser("~"), ".dublyaj_kalit")


def remember_key(key):
    key = (key or "").strip()
    if key and not ON_COLAB:
        open(KEY_FILE, "w").write(key)
    return key or (_read(KEY_FILE) or "").strip()


def ui():
    import functools
    import traceback

    import gradio as gr

    need_claude = ("Tarjima uchun **Tarjima va tuzatish** bo'limidagi `claude_uchun.txt` faylini Claude chatiga "
                   "yuboring, javobini o'sha yerga qo'yib, **Tarjimani qo'yib, dublyaj qilish** ni bosing.")

    def cast_rows():
        cast, files = cast_load(), samples()
        rows = [[k, "erkak" if v.get("jins") == "E" else "ayol", v.get("yosh", ""),
                 "bor" if k.lower() in files else "yo'q", v.get("tavsif", "")] for k, v in cast.items()]
        return rows or [["", "", "", "", ""]]

    def project_info():
        cast, n = cast_load(), len(samples())
        return (f"<div class='pinfo'><b>{os.path.basename(PROJ['dir'])}</b> · personajlar: <b>{len(cast)}</b> · "
                f"ovoz namunalari: <b>{n}</b></div>")

    def use_project(name):
        if not clean_name(name):
            raise gr.Error("Avval loyiha nomini yozing yoki tanlang (masalan donghua nomi)")
        if PROJ["dir"] != os.path.join(BASE, "loyihalar", clean_name(name)):
            open_project(name)

    def pick_project(name):
        if not clean_name(name):
            return "", "", cast_rows() if PROJ["dir"] else [["", "", "", "", ""]]
        use_project(name)
        return project_info(), _read(proj_file("qoidalar.txt")) or "", cast_rows()

    def save_rules(rules):
        open(proj_file("qoidalar.txt"), "w", encoding="utf-8").write(rules or "")

    def outputs(p, rows, msg):
        tfile = os.path.join(PROJ["wd"], "claude_uchun.txt") if PROJ["wd"] else None
        info = (msg + " " + p.get("info", "")).strip()
        return (p.get("toliq"), p.get("toliq"), p.get("ovoz"), p.get("fon"), p.get("srt"), p.get("video"),
                rows, info, tfile, project_info(), cast_rows())

    def run_dub(segs, opts, progress):
        keep, rate, speed, gain, engine, per_line = opts
        meta = os.path.join(PROJ["wd"] or "", "segs.json")
        if not os.path.exists(meta):
            raise gr.Error("Avval videoni yuklab, katta tugmani bosing")
        saved = json.load(open(meta, encoding="utf-8"))
        if len(saved["segs"]) == len(segs):  # jadvalda yo'q ichki ma'lumot (ovoz guruhi) qaytariladi
            for s, old in zip(segs, saved["segs"]):
                s["cl"] = old.get("cl", -1)
        return dub(saved["src"], PROJ["wd"], segs, PROJ["out"], progress, keep, int(rate), float(speed),
                   float(gain), engine.startswith("Klon"), bool(per_line))

    def do_all(project, video, path, key, rules, *opts, progress=gr.Progress()):
        use_project(project)
        video = (path or "").strip().strip('"') or video
        if not video or not os.path.exists(video):
            raise gr.Error("Avval qism faylini tanlang")
        save_rules(rules)
        wd, out = start_episode(video)
        video = local_copy(video, wd)
        segs, info = analyse(video, wd, progress, remember_key(key), rules)
        if not any(s["uz"] for s in segs):
            return outputs({}, to_rows(segs), f"{len(segs)} ta gap topildi. {info} {need_claude}")
        p = run_dub(segs, opts, progress)
        return outputs(p, to_rows(segs), f"Tayyor: {len(segs)} ta gap. Papka: `{out}`. {info}")

    def do_redub(project, rows, pasted, *opts, progress=gr.Progress()):
        use_project(project)
        rows = rows.values.tolist() if hasattr(rows, "values") else rows
        segs = from_rows(rows)
        n = apply_manual(segs, pasted)
        p = run_dub(segs, opts, progress)
        msg = f"Tayyor. Papka: `{PROJ['out']}`." + (f" Claude javobidan {n} ta gap olindi." if n else "")
        return outputs(p, to_rows(segs), msg)

    def do_fix(project, rows, notes, key, rules, *opts, progress=gr.Progress()):
        use_project(project)
        if not (notes or "").strip():
            raise gr.Error("Avval xatoni yozing")
        key = remember_key(key)
        if not key:
            raise gr.Error("Bu tugma Claude API kaliti bilan ishlaydi. Kalitsiz: jadvalni qo'lda tuzating "
                           "yoki tuzatishni Claude chatiga yozing.")
        save_rules(rules)
        rows = rows.values.tolist() if hasattr(rows, "values") else rows
        segs = from_rows(rows)
        try:
            info = claude_fix(segs, key, notes, rules)
        except RuntimeError as e:
            raise gr.Error(str(e))
        memory_add("Foydalanuvchi tuzatishi: " + notes.strip())
        return outputs(run_dub(segs, opts, progress), to_rows(segs), info)

    def add_sample(project, file, name):
        use_project(project)
        name = clean_name(name)
        if not file or not name:
            raise gr.Error("Ovoz faylini tanlang va kimga ekanini yozing")
        for k, f in list(samples().items()):
            if k == name.lower():
                os.remove(f)
                if os.path.exists(os.path.splitext(f)[0] + ".txt"):
                    os.remove(os.path.splitext(f)[0] + ".txt")
        dst = os.path.join(sample_dir(), name + ".wav")
        sh("ffmpeg", "-y", "-i", file, "-ac", 1, "-ar", 24000, "-t", 10, dst)  # klonlash uchun 3-10 soniya eng yaxshi
        sample_text(dst)
        return project_info(), cast_rows()

    def play_sample(project, name):
        use_project(project)
        f = find_sample(samples(), name, "")
        if not f:
            raise gr.Error("Bu personajning ovoz namunasi hali yo'q")
        return f

    def shown(fn):
        """Har qanday xato ekranda o'qiladigan matn bo'lib chiqsin va xatolar.txt ga yozilsin."""
        @functools.wraps(fn)
        def run(*a, **k):
            try:
                return fn(*a, **k)
            except gr.Error:
                raise
            except Exception as e:
                tb = traceback.format_exc()
                print(tb, flush=True)
                try:
                    open(os.path.join(BASE, "xatolar.txt"), "a", encoding="utf-8").write(tb + "\n")
                except OSError:
                    pass
                raise gr.Error(f"{type(e).__name__}: {str(e)[-700:]}")
        return run

    css = """
    .gradio-container {max-width: 1100px !important; margin: auto}
    #hero {padding: 22px 26px; border-radius: 16px; margin-bottom: 6px;
           background: linear-gradient(135deg, #7c2d12 0%, #c2410c 55%, #f59e0b 100%); color: #fff}
    #hero h1 {margin: 0; font-size: 28px; color: #fff}
    #hero p {margin: 6px 0 0; opacity: .92; color: #fff}
    .pinfo {padding: 8px 12px; border-radius: 10px; background: rgba(245,158,11,.12)}
    #go {height: 56px; font-size: 18px}
    .step {font-weight: 600; opacity: .8; margin: 4px 0 -4px}
    """
    theme = gr.themes.Soft(primary_hue="orange", secondary_hue="amber", neutral_hue="stone",
                           font=[gr.themes.GoogleFont("Inter"), "sans-serif"])
    new_gradio = int(gr.__version__.split(".")[0]) >= 6  # Gradio 6 da ko'rinish launch() ga beriladi
    with gr.Blocks(title="Donghua dublyaj", **({} if new_gradio else dict(theme=theme, css=css))) as app:
        gr.HTML("<div id='hero'><h1>🎬 Donghua dublyaj</h1><p>Xitoycha qism → o'zbekcha dublyaj. Personajlar o'z "
                "ovozida, musiqa va effektlar joyida.</p></div>")
        with gr.Tabs():
            with gr.Tab("🎙️ Dublyaj"):
                with gr.Row(equal_height=False):
                    with gr.Column(scale=5):
                        gr.Markdown("<p class='step'>1. Loyiha (donghua nomi)</p>")
                        project = gr.Dropdown(projects(), allow_custom_value=True, value=None, show_label=False,
                                              info="Har donghua alohida loyiha: personajlar va ovozlar eslab qolinadi.")
                        pinfo = gr.HTML()
                        gr.Markdown("<p class='step'>2. Qism fayli</p>")
                        video = gr.File(show_label=False, type="filepath", height=120)
                        go = gr.Button("▶  Dublyaj qilish", variant="primary", elem_id="go")
                        status = gr.Markdown()
                    with gr.Column(scale=6):
                        gr.Markdown("<p class='step'>3. Natija</p>")
                        player = gr.Audio(label="Tayyor dublyaj", type="filepath", interactive=False)
                        o1 = gr.File(label="To'liq dublyaj (ovoz + fon), WAV", height=90)
                        o2 = gr.File(label="Faqat o'zbekcha ovoz (joyiga qo'yilgan), WAV", height=90)
                        with gr.Accordion("Boshqa fayllar", open=False):
                            o3 = gr.File(label="Fon va asl tovushlar, WAV")
                            o4 = gr.File(label="O'zbekcha subtitr, SRT")
                            o5 = gr.File(label="Dublyajli video, MP4")
            with gr.Tab("👥 Personajlar va ovozlar"):
                gr.Markdown("Personajlar va ularning ovoz namunalari birinchi uchraganda o'zi saqlanadi va keyingi "
                            "qismlarda o'zgarmaydi. Namuna yoqmasa, boshqasini yuklang.")
                cast = gr.Dataframe(headers=["personaj", "jinsi", "yoshi", "ovoz namunasi", "kim u"],
                                    interactive=False, wrap=True)
                with gr.Row():
                    pname = gr.Textbox(label="Personaj nomi", scale=3)
                    pplay = gr.Button("Namunani eshitish", scale=1)
                paudio = gr.Audio(label="Namuna", type="filepath", interactive=False)
                with gr.Accordion("Ovozni almashtirish", open=False):
                    gr.Markdown("3-10 soniyalik toza yozuv. Kimga: personaj nomi, yoki `erkak-katta` kabi tur, yoki "
                                "`erkak` / `ayol` (namunasi yo'q hamma personajlar uchun).")
                    sfile = gr.File(label="Ovoz namunasi (wav, mp3)", type="filepath")
                    sname = gr.Textbox(label="Kimga")
                    sbtn = gr.Button("Namunani saqlash")
            with gr.Tab("✍️ Tarjima va tuzatish"):
                key = gr.Textbox(label="Claude API kaliti (bir marta yoziladi; bo'lmasa tarjima Claude chati orqali)",
                                 type="password", placeholder="sk-ant-...", value="" if ON_COLAB else remember_key(""))
                rules = gr.Textbox(label="Shu loyihaning doimiy qoidalari (Claude har safar amal qiladi)", lines=3,
                                   placeholder="Masalan: Dushmanlar bir-biriga faqat sensirab gapiradi. Ustozga doim siz.")
                fix = gr.Textbox(label="Xatoni yozing: Claude butun qismda tuzatadi va eslab qoladi", lines=3,
                                 placeholder="Masalan: 45-gapda dushmaniga sizlab gapiryapti, sensirasin.")
                fixb = gr.Button("Claude tuzatsin va qayta dublyaj qilsin", variant="primary")
                with gr.Accordion("Kalitsiz tarjima: Claude chati orqali", open=False):
                    tfile = gr.File(label="claude_uchun.txt: shu faylni Claude chatiga yuboring")
                    pasted = gr.Textbox(label="Claude javobi (raqam | kim | jins-yosh | his | o'zbekcha matn)", lines=5)
                gr.Markdown(HELP)
                table = gr.Dataframe(headers=COLS, interactive=True, wrap=True, row_count=(1, "dynamic"),
                                     datatype=["number", "number", "number", "str", "str", "str", "str", "str"])
                redo = gr.Button("Tarjimani qo'yib, dublyaj qilish / Jadval bo'yicha qayta dublyaj")
            with gr.Tab("⚙️ Sozlamalar"):
                engine = gr.Radio(["Klonlangan ovoz (OmniVoice)", "Oddiy ovoz (Microsoft Sardor/Madina)"],
                                  value="Klonlangan ovoz (OmniVoice)", label="Ovoz turi")
                per_line = gr.Checkbox(True, label="Har gapni xitoycha aktyorning aynan o'sha gapidan klonlash "
                                                   "(baqiriq, shivir, his-tuyg'u saqlanadi)")
                keep = gr.Checkbox(True, label="Kulgi, qichqiriq va tarjima qilinmagan asl ovozlarni qoldirish")
                gain = gr.Slider(0.5, 2.0, 1.0, step=0.05, label="O'zbekcha ovoz balandligi")
                speed = gr.Slider(1.0, 2.0, 1.6, step=0.05, label="Vaqtga sig'dirish uchun eng ko'p tezlashtirish")
                rate = gr.Slider(-10, 30, 8, step=1, label="Oddiy ovoz tezligi, %")
                path = gr.Textbox(label="Fayl yo'li (yuklash o'rniga, juda katta fayllar uchun)")
        outs = [player, o1, o2, o3, o4, o5, table, status, tfile, pinfo, cast]
        opts = [keep, rate, speed, gain, engine, per_line]
        project.change(shown(pick_project), project, [pinfo, rules, cast])
        go.click(shown(do_all), [project, video, path, key, rules] + opts, outs)
        redo.click(shown(do_redub), [project, table, pasted] + opts, outs)
        fixb.click(shown(do_fix), [project, table, fix, key, rules] + opts, outs)
        sbtn.click(shown(add_sample), [project, sfile, sname], [pinfo, cast])
        pplay.click(shown(play_sample), [project, pname], paudio)
    app.look = dict(theme=theme, css=css) if new_gradio else {}
    return app


PIP_NEEDS = {"omnivoice": "omnivoice", "faster_whisper": "faster-whisper", "demucs": "demucs",
             "edge_tts": "edge-tts", "anthropic": "anthropic", "librosa": "librosa", "sklearn": "scikit-learn"}


def ensure_packages():
    """Kompyuterda: yangi versiyaga kerakli kutubxona yo'q bo'lsa, o'zi o'rnatadi (bir marta)."""
    import importlib.util

    missing = [pkg for mod, pkg in PIP_NEEDS.items() if importlib.util.find_spec(mod) is None]
    if importlib.util.find_spec("pkg_resources") is None:  # webrtcvad (resemblyzer) shuni talab qiladi
        missing.append("setuptools<81")
    if missing and not ON_COLAB:
        print("Yangi kutubxonalar o'rnatilmoqda:", ", ".join(missing), "(bir necha daqiqa)", flush=True)
        subprocess.call([sys.executable, "-m", "pip", "install", *missing])


UPDATE_URL = ("https://raw.githubusercontent.com/jamshidrabbimov09-beep/ai-video-/"
              "claude/uzbek-dubbing-chinese-anime-as1zei/dublyaj/dublyaj.py")


def self_update():
    """Kompyuterda: GitHub'da yangi versiya bo'lsa, shu faylni almashtirib, ilovani qayta ishga tushiradi."""
    if ON_COLAB or os.environ.get("DUB_NO_UPDATE"):
        return
    try:
        import urllib.request

        new = urllib.request.urlopen(UPDATE_URL, timeout=15).read()
        me = os.path.abspath(__file__)
        if new.strip() and b"def ui(" in new and new != open(me, "rb").read():
            compile(new, me, "exec")  # buzilgan fayl bilan almashtirmaslik uchun
            open(me, "wb").write(new)
            print("Ilova yangilandi, qayta ishga tushirilmoqda...", flush=True)
            os.environ["DUB_NO_UPDATE"] = "1"
            sys.exit(subprocess.call([sys.executable, me] + sys.argv[1:]))
    except SystemExit:
        raise
    except Exception as e:
        print("Yangilanishni tekshirib bo'lmadi:", e)


if __name__ == "__main__":
    if len(sys.argv) > 2:  # python dublyaj.py <loyiha nomi> <video>
        open_project(sys.argv[1])
        work, out_path = start_episode(sys.argv[2])
        result = dub(sys.argv[2], work, analyse(sys.argv[2], work)[0], out_path)
        print(json.dumps(result, ensure_ascii=False, indent=1))
    else:
        self_update()
        ensure_packages()
        app = ui()
        app.queue().launch(share=ON_COLAB, debug=ON_COLAB, inbrowser=not ON_COLAB, show_error=True, **app.look)
