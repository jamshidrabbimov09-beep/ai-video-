"""ElevenLabs API mijozi (faqat standart kutubxona).

Kalit berilmasa sarlavha yuborilmaydi (bulutli sessiyada uni proksi qo'shadi).
DUBLYAJ_MOCK=1 bo'lsa hech qanday so'rov ketmaydi: soxta javoblar, sinov uchun.
"""
import base64
import json
import os
import subprocess
import urllib.error
import urllib.parse
import urllib.request
import uuid

BASE = "https://api.elevenlabs.io"
MOCK = os.environ.get("DUBLYAJ_MOCK") == "1"
_mock_sarf = 0


class ElevenError(Exception):
    def __init__(self, status, body):
        self.status, self.code, msg = status, None, body[:300]
        try:
            d = json.loads(body).get("detail")
            if isinstance(d, dict):
                self.code, msg = d.get("status"), d.get("message", msg)
            elif d:
                msg = str(d)
        except Exception:
            pass
        super().__init__(f"ElevenLabs {status}: {msg}")

    @property
    def kredit_tugadi(self):
        return self.code == "quota_exceeded" or "quota" in str(self).lower()


def _req(method, path, key, query=None, body=None, data=None, ctype=None, timeout=900):
    url = BASE + path + ("?" + urllib.parse.urlencode(query) if query else "")
    headers = {"Accept": "*/*"}
    if key:
        headers["xi-api-key"] = key
    if body is not None:
        data, ctype = json.dumps(body).encode(), "application/json"
    if ctype:
        headers["Content-Type"] = ctype
    r = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        raise ElevenError(e.code, e.read().decode("utf-8", "replace")) from None


def _ton(sek, path, hz=220):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"sine=frequency={hz}:duration={max(sek, 0.2):.2f}",
                    "-b:a", "64k", str(path)], check=True)
    return open(path, "rb").read()


def obuna(key):
    """Kredit holati: {'ishlatilgan', 'limit', 'tarif', 'ovoz_orni', 'ovoz_limit'}."""
    if MOCK:
        return {"ishlatilgan": _mock_sarf, "limit": 10000, "tarif": "sinov", "ovoz_orni": 0, "ovoz_limit": 3}
    d = json.loads(_req("GET", "/v1/user/subscription", key, timeout=60))
    return {"ishlatilgan": d.get("character_count", 0), "limit": d.get("character_limit", 0), "tarif": d.get("tier", ""),
            "ovoz_orni": d.get("voice_slots_used", 0), "ovoz_limit": d.get("voice_limit", 0)}


def ovozlar(key):
    """Hisobdagi ovozlar ro'yxati: [{'voice_id', 'nom', 'tur', 'tavsif', 'namuna'}]."""
    if MOCK:
        return [{"voice_id": f"mock{i}", "nom": f"Sinov ovozi {i}", "tur": "premade", "tavsif": "", "namuna": ""} for i in (1, 2, 3)]
    out, token = [], None
    for _ in range(5):
        q = {"page_size": 100}
        if token:
            q["next_page_token"] = token
        d = json.loads(_req("GET", "/v2/voices", key, query=q, timeout=60))
        for v in d.get("voices", []):
            lab = v.get("labels") or {}
            out.append({"voice_id": v["voice_id"], "nom": v.get("name", ""), "tur": v.get("category", ""),
                        "tavsif": " ".join(str(x) for x in (lab.get("gender"), lab.get("age"), lab.get("accent")) if x),
                        "namuna": v.get("preview_url") or ""})
        token = d.get("next_page_token")
        if not d.get("has_more") or not token:
            break
    return out


def matnga(key, fayl, model="scribe_v3", til=None, gapiruvchilar=None):
    """Nutqni matnga: so'zlar ro'yxati [{'text','start','end','type','speaker_id'}]."""
    if MOCK:
        m = str(fayl) + ".mock.json"
        if os.path.exists(m):
            return json.load(open(m, encoding="utf-8"))
        w, t = [], 1.0
        for i in range(6):
            for k in range(4):
                w.append({"text": f"字{i}{k}", "start": t, "end": t + 0.3, "type": "word", "speaker_id": f"speaker_{i % 2}"})
                t += 0.35
            t += 1.0
        return {"language_code": "zh", "words": w}
    maydon = {"model_id": model, "diarize": "true", "timestamps_granularity": "word", "tag_audio_events": "true"}
    if til:
        maydon["language_code"] = til
    if gapiruvchilar:
        maydon["num_speakers"] = str(gapiruvchilar)
    chegara = "----dublyaj" + uuid.uuid4().hex
    qism = []
    for k, v in maydon.items():
        qism.append(f'--{chegara}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    qism.append(f'--{chegara}\r\nContent-Disposition: form-data; name="file"; filename="audio.mp3"\r\n'
                f"Content-Type: audio/mpeg\r\n\r\n".encode() + open(fayl, "rb").read() + b"\r\n")
    qism.append(f"--{chegara}--\r\n".encode())
    raw = _req("POST", "/v1/speech-to-text", key, data=b"".join(qism), ctype=f"multipart/form-data; boundary={chegara}", timeout=1800)
    return json.loads(raw)


def ovoz_loyiha(key, tavsif, matn, model="eleven_ttv_v3"):
    """Tavsifdan ovoz namunalari: [{'generated_voice_id', 'audio' (bytes)}]."""
    if MOCK:
        return [{"generated_voice_id": f"gen{i}", "audio": _ton(2, f"/tmp/_mock_prev{i}.mp3", 200 + 60 * i)} for i in range(3)]
    d = json.loads(_req("POST", "/v1/text-to-voice/design", key, query={"output_format": "mp3_44100_128"},
                        body={"voice_description": tavsif, "model_id": model, "text": matn}))
    return [{"generated_voice_id": p["generated_voice_id"], "audio": base64.b64decode(p["audio_base_64"])} for p in d.get("previews", [])]


def ovoz_saqla(key, nom, tavsif, generated_voice_id):
    """Tanlangan namunani hisobga ovoz qilib saqlaydi, voice_id qaytaradi."""
    if MOCK:
        return "mock_" + generated_voice_id
    d = json.loads(_req("POST", "/v1/text-to-voice", key, body={"voice_name": nom, "voice_description": tavsif,
                                                                 "generated_voice_id": generated_voice_id}))
    return d["voice_id"]


def nutq(key, voice_id, matn, model="eleven_v4", barqarorlik=0.5, til=None):
    """Matndan nutq (mp3 bayt)."""
    global _mock_sarf
    if MOCK:
        _mock_sarf += len(matn)
        if _mock_sarf > 10000:
            raise ElevenError(401, json.dumps({"detail": {"status": "quota_exceeded", "message": "sinov limiti tugadi"}}))
        return _ton(len(matn) / 14.0, f"/tmp/_mock_tts_{uuid.uuid4().hex}.mp3", 180 + (hash(voice_id) % 200))
    body = {"text": matn, "model_id": model, "voice_settings": {"stability": barqarorlik}}
    if til:
        body["language_code"] = til
    return _req("POST", f"/v1/text-to-speech/{voice_id}", key, query={"output_format": "mp3_44100_128"}, body=body)
