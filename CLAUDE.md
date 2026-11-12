# Unutilgan Qissalar: project memory

Read this first. It records what was built and agreed with the user in the first working session,
so a new session can continue without that conversation.

The conversations (user messages and Claude's replies, no tool output) are in `suhbat/`: chat 1 (Part 1),
chat 3 (Part 2, `3-chat_amir-temur-2-qism.md`) and chat 4 (Part 3 and the Loy jangi experiment, `4-chat_amir-temur-3-qism.md`). The user plans one chat per part and wants each new chat to know everything
from the previous ones: read this file first. Do not read the conversation log in full (it is about 100k tokens);
search it with grep only when a detail is missing here. The user is short on usage limits: keep replies short, avoid
re-reading large files and images, and do not poll long jobs more often than needed.
At the end of each chat, export its conversation the same way (`video/edit/export_chat.py`) into `suhbat/` and
update this file.

## The project

- "Unutilgan Qissalar": an Uzbek-language history channel (Instagram `@unutilgan_qissalar`, later YouTube Shorts/TikTok).
  Vertical, AI-illustrated narrated videos of about 2 minutes.
- First series: Amir Temur, 8 planned parts (table in `prompts/1-seriya_ssenariy.md`). The channel is not meant to stay
  Temur-only.
- **Part 1 "Cho'loq yigit" was posted as a Reel on 2026-11-10. Part 2 "Do'st va dushman" and Part 3 "Xon emas, hukmdor" are finished
  (2026-11-11); Part 3 was redone as v2 on 2026-11-12 (live voice + motion design).** Next: Part 4 (To'xtamish), same v2 method.

## The user

- Writes informal Uzbek with many typos, mostly from a phone, sometimes a Windows PC. Reply in Uzbek, short, concrete,
  one step at a time. They send screenshots when stuck; they are not technical.
- Wants Claude to do as much as possible. Their own part: recording the narration in ElevenLabs, generating images in
  Google Flow, posting to Instagram.
- Wants free tools; declined buying generation credits. Ask before spending any.
- During long renders they want progress reported (percent done).
- Do not lower quality of deliverables: final video is 1080x1920.

## Video style the user approved (Part 1, version 4)

- Images only, no AI video clips (they tried clips and chose stills). Slow zoom/pan on each image, soft cross-dissolves
  only: whip, zoom-punch, glitch and flash transitions were rejected.
- Pacing: no shot under about 2.3 s, average about 3.8 s. An earlier cut at 2.3 s average was "too fast".
- Full subtitles of what is spoken, 2-5 words per chunk, appearing exactly when spoken, key names and years in gold.
  Keyword-only captions were rejected, and so was text that appears before the voice.
- Accent titles: big gold title/date/name cards at key moments, "RIVOYAT" tag plus sepia grade for legend passages,
  animated schematic map, letterbox bars on dramatic passages.
- No "AI yordamida yaratilgan" text inside the video. (Instagram's own AI label is a separate setting: advise enabling
  it when posting, since the images are AI-generated.)
- Sound: narration on top with a light hall reverb; the music track `video/edit/music.mp3` (80 BPM; the user likes the
  song that enters at 36 s) ducked gently under the voice; only a few soft low booms and heartbeat passages. Noise beds
  and stacked effects were rejected. Sentences are placed on the music's half-beat grid with 0.4-0.8 s pauses.
- Animated "UQ" logo top right in the published file; a logo-free file is kept for other platforms.

## How Part 1 is built

Everything needed is in the repo; `video/edit/build_part1.sh` rebuilds it (stages: `prep`, `audio`, `render`, `final`).
The `prep` and `audio` stages reproduce the published timeline and mix exactly.

1. Narration: six ElevenLabs mp3 blocks `video/public/audio/A..F.mp3`; joined with long pauses trimmed into
   `video/public/voice/all.mp3`.
2. Word timings: `all.mp3` transcribed with the Creative Claw `transcribe` tool (ElevenLabs Scribe, language `uz`),
   saved as `video/edit/transcript.json` (sentences) and `video/src/words.json` (words).
3. `video/edit/edit4.py`: re-times sentences to the beat grid (writes `public/voice/voice4.wav`), defines shots,
   overlays and subtitle chunks (writes `src/edit4.json`), plus the sound accent plan.
4. `video/edit/bake.sh`: bakes colour grades into `public/p1g/` (git-ignored). CSS filters in Remotion made the render
   several times slower, so grades are baked instead.
5. `video/src/Part1V4.tsx`: Remotion composition `Part1V4`, picture only.
6. Audio mix and final encode with ffmpeg, logo overlay from `video/instagram/logo_*.png`.

Older iterations (`Part1Rough`, `Part1V2`, `Part1V3`, `edit.py`, `edit2.py`) are kept for reference only.

For a new part: copy `edit4.py` and `Part1V4.tsx`, keep the same style, and plan about one image per 3.5 s of narration.

## Practical notes

- Setup in a fresh container: `cd video && npm install`. Needs ffmpeg, python3 with numpy and Pillow, Liberation Serif.
  Chromium for Remotion: `/opt/pw-browsers/chromium`.
- A 2-minute render takes about 13 minutes at concurrency 4. Start it detached (`setsid nohup ... &`) and poll the log:
  long foreground commands were cut off by timeouts and worker restarts.
- Delivery: the phone app could not download large files from the chat. Commit the final mp4 to `video/exports/`
  (keep under 100 MB) and give the GitHub link; the user taps "View raw" and saves the video. Do not compress further.
- Uploaded files from the user appear under `/root/.claude/uploads/<session>/`.
- Instagram assets: `video/edit/insta_assets.py` (avatar, cover), captions in `video/instagram/post_part1.md`.

## Tools and accounts

- Creative Claw connector (claude.ai connector, MCP): 29 credits left on 2026-11-10. Observed costs: image 16,
  5 s clip 40-111, Lyria music about 16, transcription 2, short TTS about 5. Its CDN and app hosts plus
  `api.elevenlabs.io` are allowed in the user's Default environment.
- The user records narration themselves in ElevenLabs (no API key was given to the session).
- Google Flow: the user generates images manually (Nano Banana; a Temur portrait is used as the face reference).
  Automating Flow through a third-party `google-flow-mcp` server on the user's PC was tried and abandoned: it kept
  failing on Flow UI changes, and it also strips watermarks and exposes Gmail/Drive tools. Do not go back to it
  unless the user asks.
- The user's PC (GTX-class 6 GB VRAM, 8 GB RAM) cannot run open video models usefully.

## History accuracy

See `prompts/1-seriya_ssenariy.md` for the recorded script and the fact check. Some details in the recorded Part 1
narration were not confirmed by the sources consulted (the arrow, the night battle, the exact year 1363). For later
parts: verify the script before the user records it, say "atrofida" for uncertain dates, label legends as RIVOYAT.
Check generated images for anachronisms (cannons, European manuscript motifs, brimmed hats were found and redone).
**Script wording rule (user's correction, 2026-11-12):** before giving a script to record, read every sentence as a listener
would HEAR it, not as text. (1) No words a listener could take as modern: "o'q" alone sounds like a bullet, "o'q uzildi" like a
gunshot; write "kamon o'qi", "kamondan o'q otildi" (same for weapons, titles, places). (2) Avoid words whose meaning changes
if the voice drops the apostrophe (o'q / oq, so'z / soz, to'r / tor): rephrase. (3) Every sentence must be literally true to the
books (e.g. "to'rt marta yengilib" was wrong: the first flight was not after a defeat). Do this check once, fully, before
sending: the user cannot re-record many times.

## Repository

- Part 1 is in `main` (PR #2, merged). Part 2 work is on branch `claude/ecstatic-hamilton-v1cpx7`, pull request #3 into `main`
  (opened 2026-11-11, the user was asked to merge it). If `main` lacks `video/src/Part2.tsx`, the merge has not happened: base
  the work on that branch instead. (PR #1 belongs to an unrelated earlier chat.)
- This file is the project's memory: it loads automatically in every new chat opened on this repository, so the user does not
  need to upload a knowledge file. (They asked about the third-party claude-mem plugin: not useful in cloud sessions.)
- `suhbat/`: exported conversation logs, one file per chat.
- `prompts/`: script, image prompts, clip prompts for Part 1. `video/`: the Remotion project and all media.
- The Russian files at the repo root (`ИНСТРУКЦИЯ.md`, `СТИЛЬ.md`, `СТРУКТУРА.md`, `ИСТОЧНИКИ.md`,
  `Семейные драмы.txt`) belong to an unrelated earlier project (family-drama stories) and are not used here.

## Part 2 "Do'st va dushman" (finished 2026-11-11, chat 3)

- Files: script `prompts/2-seriya_ssenariy.md` (fact check inside), ElevenLabs text `prompts/2-seriya_elevenlabs.md`, image prompts
  `prompts/2-seriya_rasm_promptlari.md` (38) and `prompts/2-seriya_flow_paketlar.md` (5 per message for the Flow agent), images
  `video/public/p2img/j01..j38.jpg` (768x1376, upscaled in `edit/bake_p2.sh`), narration `video/public/audio2/` and
  `public/voice2/all.mp3`, timeline `edit/edit_p2.py`, composition `src/Part2.tsx`, build `edit/build_part2.sh`
  (prep, audio, render, final), exports `video/exports/part2_dost_va_dushman_1080p*.mp4` (146 s, about 97 MiB each: GitHub accepts
  files under 100 MiB), cover `instagram/cover_part2.png`, captions and comment texts `instagram/post_part2.md`.
- The recorded narration kept two sentences the fact check wanted changed (the user chose not to re-record): "Qarshilik qilish esa
  o'limni anglatardi" (no source) and "U Temurning buyrug'ini ham ado etmay qo'ydi" (Husayn was the senior amir). From Part 3 on,
  get the final text confirmed BEFORE the user records. Part 2 ends on the hook for Part 3: Temur was not a Chingizid and could not
  be khan, so how did he rule?
- Amir Husayn's look is fixed by Part 1: young, lean, short dark beard, dark blue silk robe, grey fur-brimmed felt cap. Reference
  portrait: `video/public/p2img/j04.jpg` (and `public/husayn_ref.jpg`). Temur reference stays `public/p1img/i04.jpg`.
- Flow: several prompts in one message only work with the agent switched on (PC); plain numbered prompts with no shared header,
  both reference images attached. The Nano Banana Pro daily quota ran out; 2.1 was used.
- Changes to the approved style, all asked for or accepted by the user: louder, clearer mix (-14 LUFS, presence lift on the voice,
  less music bass); music extended on the bar grid (song section repeated); subtitles split into balanced 2-5 word chunks with a
  dark outline; a top card never repeats what the subtitle says at the same moment (the user found text at top and bottom
  confusing); opening shot is a face, the voice starts at 0.4 s, short end card.
- Part 1 Reel after one day: 3,249 views, average watch time 53 s of 2:01, about 30% reached the end, likes 9.2%, shares 0.6%,
  1 comment, 89 followers, 99.5% non-followers, 90% from the Reels tab, mostly aged 25-44. Losses: about 30% in the first 3-5 s
  and a drop on the end card; views stopped growing after 6-8 hours. Weak points: comments and shares.
- YouTube channel `@unutilgan_qissalar` opened 2026-11-11 (banner `video/youtube/banner2_cinzel.jpg`, script
  `edit/youtube_banner2.py`); Part 1 uploaded as a Short with the altered-content label on.
- The user cannot use the phone between 18:00 and 22:00: post about 17:15-17:45. Large files do not download from the chat on
  the phone: always deliver through a GitHub link.
- Creative Claw: 27 credits left.

## Open items

- **Part 4 (To'xtamish), the user's two wishes (2026-11-12):** (1) voice intonation: the narration must sound alive, not flat:
  write the ElevenLabs text with delivery in mind (v3-style audio tags such as [whispers], [dramatic], pauses, short punchy
  sentences, questions) and tell the user which settings to try; (2) more motion design INSIDE the part: not only slow zoom on
  stills, but animated maps, moving army markers, counters, animated titles. The tilted battlefield with moving horsemen from
  `src/LoyJangi.tsx` can be reused as short inserts (keep zoom <= 2 and the ground layer small: close-ups made renders time out).
  Script first, checked against Yazdi and Manz, confirmed by the user before recording. Manz pp. 69-71 on To'xtamish are in the notes.
- **Part 3 v2 DONE (2026-11-12), the version to post on Instagram:** expressive re-recorded voice `public/audio3/all_v2_raw.mp3`
  (ElevenLabs v4, Stability "Creative", text with tags `prompts/3-seriya_elevenlabs_v2.md`), used UNCUT; timeline `edit/edit_p3v2.py`,
  composition `src/Part3V2.tsx`, motion scenes `src/p3motion.tsx` (amirs gather at Balx, Chinggisid tree that Temur cannot join,
  puppet khan, Ko'ragon marriage link, road Balx-Kesh-Samarqand with walls rising), soft synthesized SFX `edit/sfx_p3v2.py`,
  build `edit/build_part3v2.sh`, exports `video/exports/part3v2_xon_emas_hukmdor_1080p*.mp4` (117 s). User feedback applied:
  no text in a motion scene that repeats the subtitle, nothing near the subtitle band (y >= 1380), the drawn lone-rider scene looked
  odd (replaced by a still), never leave the last sentence on a black frame (the end card fades in only after the voice).
  Posting plan: Instagram today 17:15-17:45 (user may try the logo-free file; a small own logo does not hurt reach).
- Openverse: search works (api.openverse.org allowed in the `ai-video-` environment), but freesound.org files return 403 to
  downloads and must not be worked around; Wikimedia results are mostly word pronunciations. Earshot / RealSFX are not in the
  connector directory. So sound effects are synthesized in numpy.
- The separate "battle breakdown" format is DROPPED: the user watched Loy jangi v2 and said this work is not needed
  ("bu ish kerak emas ekan"). Files stay in the repo (`LoyJangi.tsx`, `edit_loy.py`, exports) only as a source of techniques.

- Sources: the user distrusts Wikipedia and wants scripts checked against books. They uploaded Yazdi's "Zafar-name" (Russian, 2008) as
  `zafar.pdf` and Manz's "The Rise and Rule of Tamerlane" as `the riser .pdf` (scan, needs OCR) on `main` (not merged into work
  branches). The user's rule from now on: every script is checked against these two books, Manz wins where they differ. Notes with
  page references are in `prompts/manbalar_konspekt.md`: read them first, add to them when reading new chapters.
- Part 3 "Xon emas, hukmdor" (chat 4, 2026-11-11): script confirmed and checked against Yazdi and Manz (`prompts/3-seriya_ssenariy.md`),
  ElevenLabs text, 36 image prompts and Flow packets in `prompts/3-seriya_*`. Narration recorded as one file `public/audio3/all_raw.mp3`;
  block E was re-recorded (`audio3/E_fix.mp3`, "Saroy Mulk xonim" written apart so the k is spoken) and spliced into
  `public/voice3/all.mp3`; word times for E are interpolated (see `edit/transcript3.json` note). 35 images `public/p3img/k01..k36`
  (k09 missing, k07 and k15 unused). Timeline `edit/edit_p3.py`, composition `src/Part3.tsx`, build `edit/build_part3.sh`
  (130 s). Exports `video/exports/part3_xon_emas_hukmdor_1080p*.mp4`.
- New format asked for by the user (chat 4): the parts feel "dry", so between parts make spin-off "battle breakdown" videos tied
  to a part but watchable alone (how the battle went, numbers, details the part skipped), built ENTIRELY by Claude as motion
  design in Remotion (map, moving units, counters; no Flow images); the user only records the voice. First topic proposed:
  Loy jangi 1365 (notes in `prompts/manbalar_konspekt.md`). Use only numbers the books give; army totals are often absent.
  DONE 2026-11-11: "Loy jangi" (81 s): script `prompts/loy_jangi_ssenariy.md`, timing `edit/edit_loy.py` (aligns the script to the
  transcript words, voice is used uncut), composition `src/LoyJangi.tsx` (units as moving soldier icons, rain, arrows, counters),
  build `edit/build_loy.sh`, exports `video/exports/loy_jangi_1080p*.mp4`. Reuse this as the template for the next battle videos.
  Creative Claw: 23 credits left.
- Lessons from Part 3 fixes: never cut the voice where there is no real pause (check added in `edit_p3.py`); name cards must
  appear at the moment the name is spoken, one line only; the end card comes after the last subtitle.
- Compare the Part 2 Reel statistics with Part 1 once the user sends screenshots.
- Offered, not yet decided: a 60-second cut of Part 1; cross-posting the logo-free file to YouTube Shorts and TikTok.
- Instagram: profile set up (avatar, name "Unutilgan Qissalar | Tarix", bio, creator account, category "Образование").
  Part 1 Reel posted with the cover, caption, Samarqand location, AI label and high-quality upload. Suggested pinned
  first comments are in the conversation log.
