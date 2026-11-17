"""Dublyaj ilovasi serveri. Ishga tushirish: python server.py  ->  http://127.0.0.1:8765"""
import json
import mimetypes
import os
import sys
import threading
import traceback
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import core  # noqa: E402
import eleven  # noqa: E402

STATIC = Path(__file__).resolve().parent / "static"
ISHLAR = {}  # kalit -> {'nom','foiz','xabar','xato','ishlayapti'}


def ish_boshla(kalit, nom, fn, *args):
    """Uzoq ishni fonda bajaradi; holati ISHLAR[kalit] da."""
    if ISHLAR.get(kalit, {}).get("ishlayapti"):
        return False
    h = ISHLAR[kalit] = {"nom": nom, "foiz": 0, "xabar": "Boshlanmoqda", "xato": "", "ishlayapti": True}

    def prog(foiz, xabar=""):
        h["foiz"], h["xabar"] = foiz, xabar or h["xabar"]

    def run():
        try:
            natija = fn(*args, prog)
            h.update(foiz=100, xabar=natija or "Tayyor")
        except Exception as e:  # xato foydalanuvchiga ko'rsatiladi
            traceback.print_exc()
            h["xato"] = str(e)[:300]
        finally:
            h["ishlayapti"] = False

    threading.Thread(target=run, daemon=True).start()
    return True


def yuklangach(aid, qid, prog):
    core.audio_ajrat(aid, qid, prog)
    return "Ovoz ajratildi"


class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    def _json(self, obj, status=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def _fayl(self, path):
        path = Path(path)
        if not path.is_file():
            return self._json({"xato": "topilmadi"}, 404)
        hajm = path.stat().st_size
        a, b, status = 0, hajm - 1, 200
        rng = self.headers.get("Range", "")
        if rng.startswith("bytes="):
            x, _, y = rng[6:].partition("-")
            try:
                a = int(x) if x else max(hajm - int(y), 0)
                b = min(int(y), hajm - 1) if x and y else hajm - 1
                status = 206
            except ValueError:
                a, b, status = 0, hajm - 1, 200
        if a > b:
            a, b, status = 0, hajm - 1, 200
        self.send_response(status)
        self.send_header("Content-Type", mimetypes.guess_type(path.name)[0] or "application/octet-stream")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(b - a + 1))
        if status == 206:
            self.send_header("Content-Range", f"bytes {a}-{b}/{hajm}")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        with open(path, "rb") as f:
            f.seek(a)
            qoldi = b - a + 1
            while qoldi > 0:
                blok = f.read(min(1 << 20, qoldi))
                if not blok:
                    break
                try:
                    self.wfile.write(blok)
                except (BrokenPipeError, ConnectionResetError):
                    return
                qoldi -= len(blok)

    def _tana(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"{}") if n else {}

    def _saqla(self, path):
        """So'rov tanasini (yuklanayotgan fayl) diskka bo'laklab yozadi."""
        qoldi = int(self.headers.get("Content-Length") or 0)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            while qoldi > 0:
                blok = self.rfile.read(min(1 << 20, qoldi))
                if not blok:
                    break
                f.write(blok)
                qoldi -= len(blok)

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        p = [urllib.parse.unquote(x) for x in u.path.strip("/").split("/") if x]
        try:
            if not p:
                return self._fayl(STATIC / "index.html")
            if p[0] == "media":
                f = (core.DATA / "/".join(p[1:])).resolve()
                if core.DATA.resolve() not in f.parents or f.name == "sozlama.json":
                    return self._json({"xato": "ruxsat yo'q"}, 403)
                return self._fayl(f)
            if p == ["api", "animelar"]:
                return self._json([{**a, "muqova": (core.DATA / a["id"] / "muqova.jpg").exists(),
                                    "qism_soni": len(core.anime(a["id"])["qismlar"])} for a in core.animelar()])
            if p[:2] == ["api", "anime"] and len(p) == 3:
                return self._json(core.anime(p[2]))
            if p[:2] == ["api", "qism"] and len(p) == 4:
                aid, qid = p[2], p[3]
                sat = core.satrlar(aid, qid)
                return self._json({"meta": core.meta(aid, qid), "satrlar": sat, "ish": ISHLAR.get(f"{aid}/{qid}"),
                                   "kredit_kerak": core.kerakli_kredit(aid, qid),
                                   "tarjima": sum(1 for s in sat if s.get("uz")),
                                   "personajlar": core.personajlar(aid)["personajlar"]})
            if p == ["api", "eleven"]:
                try:
                    return self._json({"ulangan": True, "obuna": eleven.obuna(core.kalit()), "ovozlar": eleven.ovozlar(core.kalit())})
                except Exception as e:
                    return self._json({"ulangan": False, "xato": str(e)[:200]})
            if p == ["api", "ishlar"]:
                return self._json(ISHLAR)
            return self._json({"xato": "topilmadi"}, 404)
        except KeyError as e:
            self._json({"xato": str(e).strip("'")}, 404)
        except Exception as e:
            traceback.print_exc()
            self._json({"xato": str(e)[:300]}, 500)

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        q = {k: v[0] for k, v in urllib.parse.parse_qs(u.query).items()}
        p = [urllib.parse.unquote(x) for x in u.path.strip("/").split("/") if x]
        try:
            if p == ["api", "animelar"]:
                t = self._tana()
                if not (t.get("nom") or "").strip():
                    return self._json({"xato": "Anime nomini yozing"}, 400)
                return self._json(core.anime_qosh(t["nom"], t.get("izoh", "")))
            if p == ["api", "sozlama"]:
                t = self._tana()
                s = core.oqi(core.DATA / "sozlama.json", {}) or {}
                s.update({k: v for k, v in t.items() if k in core.SOZLAMA})
                core.yoz(core.DATA / "sozlama.json", s)
                return self._json({"ok": True})
            if p[:2] == ["api", "anime"] and len(p) >= 4:
                aid = p[2]
                core.anime(aid)
                if p[3] == "muqova":
                    xom = core.DATA / aid / "muqova.xom"
                    self._saqla(xom)
                    core._ff("-i", xom, "-vf", "scale=600:-2", "-frames:v", "1", core.DATA / aid / "muqova.jpg")
                    xom.unlink(missing_ok=True)
                    return self._json({"ok": True})
                if p[3] == "qism_url":
                    t = self._tana()
                    url = (t.get("url") or "").strip()
                    if not url.startswith(("http://", "https://")):
                        return self._json({"xato": "To'g'ri havola yozing (https://...)"}, 400)
                    return self._json(core.qism_url(aid, t.get("nom") or "Qism", url))
                if p[3] == "qism":
                    m = core.qism_qosh(aid, q.get("nom") or "Qism", q.get("fayl") or "manba.mp4")
                    self._saqla(core.qd(aid, m["id"]) / m["manba"])
                    ish_boshla(f"{aid}/{m['id']}", "Ovoz ajratish", yuklangach, aid, m["id"])
                    return self._json(m)
                if p[3] == "personaj" and len(p) >= 5:
                    pid = p[4]
                    if len(p) == 5:
                        x = core.personajlar(aid)
                        x["personajlar"].setdefault(pid, {"nom": pid, "ovoz_tavsifi": "", "voice_id": ""}).update(self._tana())
                        core.personajlar_yoz(aid, x)
                        return self._json(x["personajlar"][pid])
                    if p[5] == "namuna":
                        self._tana()
                        return self._json({"boshlandi": ish_boshla(f"{aid}/ovoz/{pid}", "Ovoz yaratish", core.ovoz_namuna, aid, pid)})
                    if p[5] == "tanla":
                        t = self._tana()
                        return self._json(core.ovoz_tanla(aid, pid, t.get("generated_voice_id"), t.get("voice_id"), t.get("ovoz_nomi", "")))
            if p[:2] == ["api", "qism"] and len(p) >= 5:
                aid, qid = p[2], p[3]
                kalit = f"{aid}/{qid}"
                if p[4] == "ish" and len(p) == 6 and p[5] in core.BOSQICH:
                    self._tana()
                    return self._json({"boshlandi": ish_boshla(kalit, p[5], core.BOSQICH[p[5]], aid, qid)})
                if p[4] == "satr" and len(p) >= 6:
                    n = int(p[5])
                    if len(p) == 7 and p[6] == "ovoz":
                        self._tana()
                        return self._json({"boshlandi": ish_boshla(kalit, "ovoz", lambda a, b, pr: core.ovoz_yoz(a, b, pr, {n}), aid, qid)})
                    t = self._tana()
                    with core.QULF:
                        sat = core.satrlar(aid, qid)
                        s = next(x for x in sat if x["n"] == n)
                        o = (s.get("uz"), s.get("teg"), s.get("kim"))
                        s.update({k: t[k] for k in ("uz", "teg", "kim") if k in t})
                        if o != (s.get("uz"), s.get("teg"), s.get("kim")) and s.get("holat") == "tayyor":
                            s["holat"] = "o'zgargan"
                        core.satrlar_yoz(aid, qid, sat)
                    return self._json(s)
            return self._json({"xato": "topilmadi"}, 404)
        except (KeyError, StopIteration) as e:
            self._json({"xato": str(e).strip("'") or "topilmadi"}, 404)
        except Exception as e:
            traceback.print_exc()
            self._json({"xato": str(e)[:300]}, 500)


if __name__ == "__main__":
    core.DATA.mkdir(parents=True, exist_ok=True)
    host, port = os.environ.get("DUBLYAJ_HOST", "127.0.0.1"), int(os.environ.get("DUBLYAJ_PORT", "8765"))
    print(f"Dublyaj ilovasi: http://{host}:{port}  (to'xtatish: Ctrl+C)", flush=True)
    ThreadingHTTPServer((host, port), H).serve_forever()
