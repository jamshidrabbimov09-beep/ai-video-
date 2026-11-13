#!/usr/bin/env python3
"""Instagram izohlariga avtomatik javob: kanal egasi nomidan, Gemini (bepul) yordamida.

Muhit o'zgaruvchilari:
  IG_TOKEN        Instagram API (Instagram Login) uzoq muddatli tokeni
  GEMINI_API_KEY  Google AI Studio kaliti (bepul)
  GEMINI_MODEL    default: gemini-flash-latest
  DRY_RUN         "1" (default): javobni yozmaydi, faqat ko'rsatadi. "0": haqiqatan joylaydi
  MAX_REPLIES     bir ishga tushishda nechta javob (default 8)
  MEDIA_LIMIT     nechta oxirgi post tekshiriladi (default 6)
  MAX_AGE_DAYS    shundan eski izohlarga javob yozilmaydi (default 7)

Allaqachon javob yozilgan izohlar Instagramning o'zidan aniqlanadi (izoh ostida kanalning javobi bormi),
shuning uchun alohida holat fayli kerak emas.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

IG = "https://graph.instagram.com/v23.0"
HERE = Path(__file__).resolve().parent

TOKEN = os.environ.get("IG_TOKEN", "").strip()
GKEY = os.environ.get("GEMINI_API_KEY", "").strip()
MODEL = os.environ.get("GEMINI_MODEL", "").strip() or "gemini-flash-latest"
DRY = os.environ.get("DRY_RUN", "1").strip() != "0"
MAX_REPLIES = int(os.environ.get("MAX_REPLIES", "8"))
MEDIA_LIMIT = int(os.environ.get("MEDIA_LIMIT", "6"))
MAX_AGE = timedelta(days=int(os.environ.get("MAX_AGE_DAYS", "7")))

summary_lines = []


def out(line=""):
    print(line, flush=True)
    summary_lines.append(line)


def http(method, url, params=None, body=None):
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        msg = e.read().decode(errors="replace")[:500]
        raise RuntimeError(f"HTTP {e.code}: {msg}") from None


def ig_get(path, **params):
    params["access_token"] = TOKEN
    return http("GET", f"{IG}/{path}", params)


def ig_all(path, limit_pages=5, **params):
    res = ig_get(path, **params)
    items = list(res.get("data", []))
    pages = 1
    while res.get("paging", {}).get("next") and pages < limit_pages:
        res = http("GET", res["paging"]["next"])
        items += res.get("data", [])
        pages += 1
    return items


def parse_time(s):
    # Instagram: 2026-11-12T13:05:44+0000
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%S%z")


PERSONA = (HERE / "persona.md").read_text(encoding="utf-8")


def ask_gemini(caption, comment_text, username):
    prompt = (
        f"{PERSONA}\n\n---\n\nPost matni (video tagidagi yozuv):\n{caption[:1500]}\n\n"
        f"@{username} izohi:\n{comment_text}\n\n"
        "Faqat JSON qaytar: {\"action\": \"reply\" yoki \"skip\", \"reply\": \"javob matni\"}. "
        "Javobda @username yozma, Instagram o'zi belgilaydi."
    )
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.8, "responseMimeType": "application/json"},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    for attempt in range(3):
        try:
            res = http("POST", url, {"key": GKEY}, body)
            text = res["candidates"][0]["content"]["parts"][0]["text"]
            ans = json.loads(text)
            if isinstance(ans, list):
                ans = ans[0]
            return ans.get("action", "skip"), (ans.get("reply") or "").strip()
        except RuntimeError as e:
            if "429" in str(e) and attempt < 2:  # bepul limit: biroz kutamiz
                time.sleep(20)
                continue
            raise
        except (KeyError, IndexError, ValueError):
            return "skip", ""
    return "skip", ""


def main():
    if not TOKEN or not GKEY:
        sys.exit("IG_TOKEN va GEMINI_API_KEY kerak (GitHub > Settings > Secrets > Actions).")

    me = ig_get("me", fields="user_id,username")
    my_name = me.get("username", "").lower()
    out(f"Akkaunt: @{my_name}  |  rejim: {'SINOV (joylanmaydi)' if DRY else 'JONLI'}")
    out("")

    now = datetime.now(timezone.utc)
    media = ig_get("me/media", fields="id,caption,timestamp,permalink", limit=MEDIA_LIMIT).get("data", [])
    done = 0
    for m in media:
        caption = m.get("caption") or ""
        comments = ig_all(
            f"{m['id']}/comments",
            fields="id,text,username,timestamp,replies{username}",
            limit=50,
        )
        for c in comments:
            if done >= MAX_REPLIES:
                break
            user = (c.get("username") or "").lower()
            if user == my_name:
                continue
            if now - parse_time(c["timestamp"]) > MAX_AGE:
                continue
            replies = c.get("replies", {}).get("data", [])
            if any((r.get("username") or "").lower() == my_name for r in replies):
                continue
            text = (c.get("text") or "").strip()
            if not text:
                continue
            action, reply = ask_gemini(caption, text, user)
            out(f"- @{user}: {text}")
            if action != "reply" or not reply:
                out("  -> o'tkazib yuborildi")
                continue
            reply = reply[:300]
            out(f"  -> {reply}")
            if not DRY:
                http("POST", f"{IG}/{c['id']}/replies", {"message": reply, "access_token": TOKEN})
                time.sleep(3)
            done += 1
            time.sleep(4)  # Gemini bepul limiti uchun
    out("")
    out(f"Javoblar: {done}")

    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write("\n".join(summary_lines) + "\n")


if __name__ == "__main__":
    main()
