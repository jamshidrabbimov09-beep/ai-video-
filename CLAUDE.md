# Unutilgan Qissalar: project memory

Read this first. It records what was built and agreed with the user in the first working session,
so a new session can continue without that conversation.

**All work is in `main`** (PR #7, 2026-11-17: Temur Parts 1-4 + "Tasavvur qil" ep.1-4; PR #6: Temur Part 5 complete).

The conversations (user messages and Claude's replies, no tool output) are in `suhbat/`: chat 1 (Part 1),
chat 3 (Part 2, `3-chat_amir-temur-2-qism.md`) and chat 4 (Part 3 and the Loy jangi experiment, `4-chat_amir-temur-3-qism.md`), chat 5 (Part 4 and the Part 5 script, `5-chat_amir-temur-4-qism.md`); Tasavvur qil chats: `4-chat_tasavvur-qil-1-qism.md`, `5-chat_tasavvur-qil-3-qism.md`, `6-chat_tasavvur-qil-4-qism.md`; Temur chat 7 (Part 5 build, render, fixes, cover, posting): `7-chat_amir-temur-5-qism-render.md` (Temur chat 6, Part 5 voice/images/montage, ran on the user's PC and was not exported). The user plans one chat per part and wants each new chat to know everything
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
  (2026-11-11); Part 3 was redone as v2 on 2026-11-12 (live voice + motion design).** Part 4 "O'zi qutqargan dushman" finished and posted on Instagram 2026-11-14 (chat 5). Part 5 "Dasht yurishi": rendered 2026-11-15 (chat 7), exports `video/exports/part5_dasht_yurishi_1080p*.mp4` on branch `claude/build-script-render-g8mkm7`; v3 posted on Instagram 2026-11-16 (the 3 voice fixes were not done).

## The user

- Writes informal Uzbek with many typos, mostly from a phone, sometimes a Windows PC. Reply in Uzbek, short, concrete,
  one step at a time. They send screenshots when stuck; they are not technical.
- Wants Claude to do as much as possible. Their own part: recording the narration in ElevenLabs, generating images in
  Google Flow, posting to Instagram.
- Wants free tools; declined buying generation credits. Ask before spending any.
- During long renders they want progress reported (percent done). Never start a full render without asking first (user, 2026-11-14): show still previews or variants, wait for the choice, then ask before rendering.
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
(4) Pronunciation check for ElevenLabs, ALWAYS (user, 2026-11-15): before sending any voice text, rewrite words the voice may
misread: split long agglutinative or compound words ("yenga olmay", "Saroy Mulk xonim"), prefer the simpler verb form, numbers as
words, and list the hard names for the user to listen for.

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

## Part 4 "O'zi qutqargan dushman" (chat 5, 2026-11-12, branch `claude/wizardly-ritchie-icpsyq`)

- Script checked against Yazdi (71a-74a, 94a, 97b-98b, 105a-106a) and Manz (69-71), confirmed by the user: `prompts/4-seriya_ssenariy.md`;
  ElevenLabs text (one block, tags) `prompts/4-seriya_elevenlabs.md`; 37 image prompts and Flow packets `prompts/4-seriya_rasm_promptlari.md`,
  `4-seriya_flow_paketlar.md`. Covers 1376-1387 (rescue to the 1387 invasion); the 1391/1395 steppe battles are left for the next part
  (proposed Part 5 "Dasht yurishi", series table not yet changed).
- Voice: `public/audio4/all_raw.mp3` (ElevenLabs v4, Stability Robust, one take, used uncut, 146.6 s), transcript `edit/transcript4*.json`,
  words `src/words4.json`. Images `public/p4img/l01..l37.jpg` (refs: Temur `p1img/i04.jpg`, To'xtamish `p3img/k34.jpg`; Flow kept
  making the khan To'xtamish old: say "at age 35, smooth skin, jet-black hair, no grey").
- Timeline `edit/edit_p4.py`, composition `src/Part4.tsx`, motion scenes `src/p4motion.tsx` (Chinggis line, O'tror/Sig'noq lands,
  "4 marta" counter, Jo'chi ulus spread, line callback, Darband-Tabriz, invasion of Movarounnahr), SFX `edit/sfx_p4.py`, build
  `edit/build_part4.sh`, exports `video/exports/part4_ozi_qutqargan_dushman_1080p*.mp4` (148 s, ~96 MiB).
- Maps (user's wish): a REAL Earth map, with 14th-century uluses instead of today's states, so viewers see Temur's lands.
  `edit/maps_p4.py` builds `public/maps/relief_p4.jpg` + `src/borders_p4.json` (today's borders faint, real rivers, Caspian) from
  the PyPI package basemap-data; ulus polygons are hand-drawn after the books in `p4motion.tsx` (aourednik historical-basemaps
  put Sig'noq in the Chagatai khanate and Balx in the Ilkhanate for 1300: wrong for the 1370s, not used). Reuse for later parts.
- Creative Claw: 19 credits left.

## Chat 5 additions (2026-11-13/14), read before Part 5

- **Outro for every part from now on (user's wish):** after the last sentence the user records one engagement question in ElevenLabs
  (Part 4: `public/audio4/ask_raw.mp3`, "Siz-chi? Temurning o'rnida bo'lganingizda... To'xtamishni yana kechirarmidingiz? Javobingizni
  izohda yozing."), then a subscribe card. Code: `src/p4outro.tsx` (QuestionCard variant **C** = dark glass bar with gold frame, HA | YO'Q,
  just above the subtitles; SubscribeEnd = round channel avatar `public/maps/uq_avatar_c.png`, "UNUTILGAN QISSALAR", a hand taps the gold
  "OBUNA BO'LING" button -> grey "OBUNA BO'LINDI" with tick, bell rings; synthesized click + bell in `edit/sfx_p4.py`). `edit/edit_p4.py`
  appends the question audio after the last sentence and splits its subtitles at pauses; `edit/build_part4.sh` fades the corner logo out
  0.9 s before the subscribe card. Design notes from the user: no title above the HA/YO'Q card (it repeated the subtitle), no extra ring
  around the avatar (the avatar has its own), YouTube logo/sounds not used. Instagram poll sticker: the user does not want it.
- Part 4 final: 158 s, exports ~95 MiB (encode maxrate 5000k: the 5500k file was 103 MB and GitHub refused it). For a small late change,
  render only the changed frames (`--frames=a-b`) and splice into `out/video_p4_raw.mp4`, then run `final` (minutes, not 15).
- Cover `instagram/cover_part4.png` (`edit/insta_cover_p4.py`; use the high-resolution 1116x2000 image the user sent in chat, the zip copy
  was 768x1376 and looked blurry), captions `instagram/post_part4.md`. Part 4 posted 2026-11-14 ~13:15 with location Buxoro, AI label,
  highest quality, Trial off.
- Instagram: the user's other format "Tasavvur qil" (part 2) reached 67.5k views, 55k viewers, 41 s average watch, 59 follows, skip rate
  19.9% within ~19 h and was still growing: a big success; learn from it (direct "imagine" address to the viewer, question). Pin a comment
  there pointing to the Temur series. Posting several reels a day apart does not hurt each other.
- **Google Flow account: 50 free credits per day** (refresh 11:39). Images cost nothing; a video costs credits, so a fully video part is not
  possible in one day. Agreed plan for Part 5: stills + Claude's motion design (maps etc.) + 2-4 Flow image-to-video clips at key moments.
- **KM Studio Pro** (`kmstudiopro.pages.dev`, Chrome extension by Olimov Behzod, Chrome Web Store id pgfmoapcmhbpfigcgfplkhldopdfdlmp):
  checked 2026-11-14. It does NOT generate anything itself; it automates Google Flow in the user's own account and credits: queue of
  100+ prompts from a .md/.txt/.csv/.xlsx file, 6 modes (text->image, character->image, image->image, text->video, image->video,
  character), files saved as `1-IMAGE-...jpeg`, start frame by number (`7.jpg` -> prompt 7), Flow characters attached by `refs:` ID.
  Free tier: unlimited prompts, 1K images, 720p video; Pro 29 000 so'm/month (2K/4K images, parallel, ZIP, auto-retry), 3-day free Pro on
  first Google login, no card, no auto-renew; asks Google only for openid/email/profile. PC Chrome only. Useful for batch images; offered
  to the user as optional. The host was added to the `ai-video-` environment allowlist.
- Never start a full render without asking (see "The user"). Show stills/variants first.
- Creative Claw: 19 credits left.

## Working on the user's Windows PC (from Part 5 on, the user's wish)

- From Part 5 the user works in Claude Code on their own PC, in a local clone of this repository, not in a cloud session. Everything a new
  chat needs is in the repo: this file plus the conversation logs of every Temur chat in `suhbat/` (1, 3, 4, 5; chat 2 was unrelated).
- PC: Windows, GTX-class 6 GB VRAM, 8 GB RAM. Cloud-only details in this file do not apply there: no `/opt/pw-browsers/chromium`
  (let Remotion fetch its own browser: `npx remotion browser ensure`, and drop `--browser-executable` from the build scripts), no agent
  proxy, no scratchpad path, files the user sends are plain paths on the PC. Needed: Git, Node.js LTS, ffmpeg (`winget install ffmpeg`),
  Python 3 with numpy and Pillow, the Liberation Serif font (or change `font` in the .tsx files). Renders are slower with 8 GB RAM:
  use `--concurrency=2`. The `.sh` build scripts need Git Bash. Ask the user before installing anything.
- Image prompts: ALWAYS also give the Flow packet file (5 prompts per packet, refs per packet, `N-seriya_flow_paketlar.md`), unasked.
- Every part ends with a teaser for the next part ("... Keyingi qismda.") before the outro question: put it in the script yourself,
  the user should not have to remind (user, 2026-11-15).
- Never open a Temur part with "Tasavvur qiling" / "Tasavvur qil" (user, 2026-11-16: that phrase belongs to their separate
  "Tasavvur qil" format). Open with the event itself, a date, a striking fact or a question.
- Every part from now on: a hook that holds the viewer in the first 3 seconds (Part 1 lost ~30% there), and the Part 4 style outro
  (recorded question + HA/YO'Q card C + subscribe card).

## Part 5 "Dasht yurishi" (script proposed 2026-11-14, chat 5)

- `prompts/5-seriya_ssenariy.md`: 1391 campaign against To'xtamish (envoys with 9 horses and a falcon and Temur's answer, 3 weeks without
  water, famine: a ram's head 500 tanga, the great hunt, stone tower on Ulug' tog', 18 June 1391 Qunduzcha: seven divisions, the army
  dismounts and pitches tents, To'xtamish goes round to the rear, flees on seeing Temur; pursuit to the Itil/Volga) and a short 1395 Terek
  epilogue (Golden Horde never recovered, Manz 72). Fact table inside (Yazdi 118b-127b, Manz 71-72). Waiting for the user's confirmation;
  then: ElevenLabs text with tags in ONE copyable block, the outro question line, image prompts (+ KM Studio file format), 2-4 video
  prompts for Flow image-to-video, maps (route with a day counter, battle scheme, pursuit, Terek), outro as in Part 4.
- The Temur series table should change: Part 5 = steppe campaign (1391-1395); Iran/India moves later.
- Part 2 Reel after ~15 h: 2,126 views, 1,735 reached, average watch 54 s of 2:26, skip rate 30.9% (above average), likes 6.5%,
  shares 11, saves 7, 2 comments, 32 follows. Retention falls to about 40% in the first 15 s; views stopped growing after ~6 h.

## Part 5 status (chat 6, 2026-11-15, on the user's PC; the user then went back to cloud sessions)

- Script confirmed with edits (`prompts/5-seriya_ssenariy.md`), checked again in Yazdi (envoy quote, tower quote, "deyarli" for the
  short nights). Voice text `prompts/5-seriya_elevenlabs.md`; ends with a teaser for Part 6 (Iran/India, war elephants) and the question
  "Olti oy suvsiz dashtda Temurning ortidan borarmidingiz?".
- Voice: `public/audio5/all_raw.mp3` (main, 136 s) + `extra_raw.mp3` (re-recorded "cho'chimaydimi" sentence, teaser, question).
  `edit/voice5.py` splices the fix into `public/voice5/all.wav` and cuts `hook.wav`, `ask.wav`; words `src/words5*.json`
  (Scribe, `edit/transcript5_*.json`). Creative Claw: 14 credits left. On the PC, curl to R2/CDN needed `--ssl-no-revoke`.
- Images `public/p5img/m01..m35.jpg` (Flow, 768x1376), `m40.jpg` = Part 4 l03 (callback). Prompts `prompts/5-seriya_rasm_promptlari.md`,
  packets `5-seriya_flow_paketlar.md`, KM Studio `5-seriya_kmstudio.txt` (generator `edit/prompts_p5.py`). Unused: m03, m24, m25.
  Flow image-to-video clips were NOT made (user: Claude makes the video); Temur prompts now say "rounded brimless black felt cap".
- Montage: `edit/edit_p5.py` (voice uncut + teaser + question, 41 shots; v3 2026-11-16: "Tasavvur qiling" cut, voice starts on "Olti oy", 158 s; a cold open with the ram sentence was tried and rejected, COLD flag) -> `src/edit_p5.json`, `public/voice5/voice_p5.wav`,
  `edit/music_p5.wav`, `edit/sfx_plan_p5.json`; `edit/sfx_p5.py`; `edit/bake_p5.sh` (grades into git-ignored `public/p5g/`);
  composition `src/Part5.tsx` (registered in Root.tsx), motion scenes `src/p5motion.tsx` (route 21 kun, full march 117 kun to Qunduzcha,
  flank scheme, pursuit to the Itil, Terek 1395, Golden Horde cracks, south to Iran/India; helpers now exported from p4motion.tsx).
- DONE (chat 7): `edit/build_part5.sh`; day counter of route6 moved to the top right (it covered Samarqand). Final encode uses
  `-preset slow -maxrate 5000k` (the user asked not to lower quality; medium preset gave 101 MB): ~95.7 MiB each, 160 s.
  v2 the same day after the user's review: captions without punctuation (. , : ; ? ! and quotes dropped, apostrophes kept as letters),
  subscribe card centred (`SubscribeEnd centered`, button + bell row compact, clear of the Reels icons), per-shot `LIFT` in Part5.tsx
  (zoom 2L, move up L) for shots whose key detail sat under the subtitle band (m12 coins, m13, m27 banner, m32, m33 cap, m34 map, m40),
  pursuit map tighter (arrows from Qunduzcha to the Itil, label below the node), OLTIN O'RDA label on a dark plate.
  Design rule from this: check every still for key details in the subtitle band (y 1395-1560) before rendering.
  Cover: `instagram/cover_part5.png` (m16, Temur on the hill over the steppe; the user chose A), alternative
  `cover_part5_m05.png`; script `edit/insta_cover_p5.py` (uses `public/p5img/m16_x4.jpg`: Real-ESRGAN x4plus 4x upscale run with onnxruntime on CPU, ONNX model from the Hugging Face repo OwlMaster/AllFilesRope, tiles of 192 px, about 2.5 min; reuse this for every cover: the user found the plain upscale blurry).
  Voice fixes pending: the user will re-record 0:22 "lochin olib kelishgan", 0:33 "Uni yarador holda olib kelishdi. Men uni
  o'g'limdek qabul qildim." and 0:58 "Ulug' tog'" (said as "to'g'"); then splice, render only the changed frames, run `final`.
  Captions done: `instagram/post_part5.md` (fixed: "Oltin O'rdaga berilgan eng og'ir zarba", not "qulashi"; Qunduzcha = river in
  Samara oblast near the Volga). Part 5 v3 POSTED on Instagram 2026-11-16 with the old voice (the 3 voice fixes were never recorded;
  drop them unless the user asks).
- NEXT (chat 8): Part 6 (teaser promised Iran and India, war elephants). Start with the script, checked against Yazdi and Manz,
  confirmed before recording; no "Tasavvur qiling" opening; teaser + question + subscribe outro; Flow packets of 5; covers via
  `edit/upscale_onnx.py` (Real-ESRGAN). Ask for Part 5 Instagram stats after a day and compare with Parts 1 and 4.
- Rules from this chat (also above): pronunciation check for ElevenLabs; always a next-part teaser; always Flow packets of 5.

## Open items

- **Part 4 (To'xtamish), the user's two wishes (2026-11-12):** (1) voice intonation: the narration must sound alive, not flat:
  write the ElevenLabs text with delivery in mind (v3-style audio tags such as [whispers], [dramatic], pauses, short punchy
  sentences, questions) and tell the user which settings to try; (2) more motion design INSIDE the part: not only slow zoom on
  stills, but animated maps, moving army markers, counters, animated titles. The tilted battlefield with moving horsemen from
  `src/LoyJangi.tsx` can be reused as short inserts (keep zoom <= 2 and the ground layer small: close-ups made renders time out).
  Script first, checked against Yazdi and Manz, confirmed by the user before recording. Manz pp. 69-71 on To'xtamish are in the notes.
- **Part 3 v2 DONE (2026-11-12), the version to post on Instagram:** expressive re-recorded voice `public/audio3/all_v2_raw.mp3`
  (ElevenLabs v4, Stability "Robust": the user always uses Robust, Creative/Natural did not suit them; text with tags `prompts/3-seriya_elevenlabs_v2.md`), used UNCUT; timeline `edit/edit_p3v2.py`,
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

## New series "Tasavvur qil" (started 2026-11-11, chat 4)

- Inspired by the viral Uzbek cartoon page `egrivoy` (code-drawn flat 2D, recurring mascot, "what if" hooks, choice questions
  for comments). Do not copy its mascot; ours is **Bek**: a modern teen (mustard hoodie) who lands in a different era each episode.
- Character drawn in code: `video/src/tasavvur/Bek.tsx` (outfits modern/soldier, moods, blink, look, arm swing); sheet
  composition `BekSheet`, preview `video/tasavvur/bek_qahramon.png`. No Flow images needed for this series.
- Episode 1 "Sen Temurning askarisan: 1 kun": final text `prompts/tasavvur-1_elevenlabs.md` (fast, no pauses, emotion tags,
  "Tasavvur qil" opens, ends on "Sen nima qilarding? Izohda yoz!", no source names or next-episode talk in the voice).
  Voice `video/public/tq1/raw.mp3` (61 s), word timings `src/tasavvur/tq1_words.json` (Scribe, 3 credits; 22 left),
  composition `src/tasavvur/TQ1.tsx` (11 SVG scenes, one big Oswald word at the top, red key words, "1-KUN" day clock),
  sound `edit/tq1_sfx.py` (synthesised accents) + ffmpeg mix (music from 36 s, ducked, -16 LUFS: the user worried about
  loudness), export `video/exports/tasavvur1_temur_askari_1080p.mp4` (62 s, 23 MB). Render ~4 min at concurrency 4.
- Ep.1 posted on Instagram 2026-11-12 about 09:40 (caption `video/instagram/post_tasavvur1.md`, cover `instagram/cover_tasavvur1.png`,
  AI label on, location Samarqand). Known flaw left in on purpose: the voice says "askariysan" at 0:02 (ElevenLabs kept it).
  Reply-to-comments templates were given in chat 4 (end every reply with a question).
- Next: analyse ep.1 statistics (2026-11-13), then ep.2 "Temurga zamonaviy qurollar chizmasi" (text confirmed,
  `prompts/tasavvur-2_elevenlabs.md`) with a code-drawn globe map; ideas list `prompts/tasavvur_goyalar.md`.
- Ep.1 stats after ~15 h: 9,273 views (Temur Part 1: 3.4k, Part 2: 2.1k), skip rate 25.1% (below average, good), avg watch 37 s
  of 62 s, ~55% still watching at 1:00, comments 40 (0.6%, above average), likes 5.7%, shares 35 (0.5%), saves 22,
  profile visits 107 but only 6 follows. Audience much younger: 13-17 23.5%, 18-24 39.1%, 25-34 25%.
  Lessons for ep.2: the format and hook work; follows are the weak point (the profile grid is mostly the cinematic Temur
  videos, and the video gives no reason to follow): add an on-screen series/follow card at the end (no extra voiced ask),
  pin the Tasavvur reel. Write narration in simple, TTS-friendly words (avoid rare words and "-isan" endings).
- Ep.2 "Temurga zamonaviy qurollar chizmasi" built 2026-11-12: voice `video/public/tq2/raw.mp3` (61 s), words `src/tasavvur/tq2_words.json`
  (Scribe; Creative Claw 17 credits left), composition `src/tasavvur/TQ2.tsx` (helpers in `common.tsx`; Temur drawn as Bek outfit
  'temur'), globe `GlobeMap.tsx` (d3-geo + world-atlas 50m, empire outline `timurid.ts`, variants V1/V2/V3 as whole modern countries,
  flag with three rings), sfx `edit/tq2_sfx.py`, export `video/exports/tasavvur2_temur_qurollar_1080p.mp4` (64 s). Ends on a vote
  "1, 2 yoki 3" plus an on-screen-only follow card. Render ~6 min at concurrency 3 (4 parallel stills ran out of memory).
- Ep.2 posted on Instagram 2026-11-13 about 17:40 (cover `instagram/cover_tasavvur2.png` "Tasavvur qil: Temurda avtomat chizmasi!",
  caption `instagram/post_tasavvur2.md`). Another video had been posted at 10:00 that day; rule given: at least 6 h between posts.
- Strategy agreed in chat 4: keep the history niche, focus on "Tasavvur qil" (3-5 videos a week, wider Uzbek-history and "what if"
  topics, shareable national/map themes), Temur cinematic series slower (every 1-2 weeks), cross-post to YouTube Shorts and TikTok.
  Topic ideas offered: 1000 yil oldin Samarqandda, Ibn Sino dars beryapti, O'zbekistonda dengiz bo'lsa (map), Ipak yo'li karvonchisi,
  Bobur Hindistonga ketmaganda. The user has not picked the next one yet.

## State at the end of chat 6 (2026-11-17) — read this first in chat 7

- Chat 6 ran in the cloud (log `suhbat/6-chat_tasavvur-qil-4-qism.md`). All work was on branch `claude/tasavvur-qil-part-4-idea-ecif9s`, merged into `main` (PR #7)
  (it merges `main` and `claude/zen-curie-3dlfy5`; not yet merged into `main`). Temur Part 5 lives on `claude/part5-dasht-yurishi`.
- **Ep.3 "Qanotli askarlar" error:** the script called Alexander "Iskandar Zulqarnayn"; viewers objected (Zulqarnayn = Alexander is
  disputed). The Instagram post was KEPT (it was spreading: 4.5k views in 2 h); caption fixed and a short pinned note ("biz Aleksandr
  Makedonskiyni nazarda tutganmiz"). The export was re-made anyway: the user recorded "Iskandar Makedonskiy" (`public/tq3/makedonskiy_raw.mp3`),
  the word was spliced into the voice (old voice `tq3/raw_zulqarnayn.mp3`), the mix was rebuilt by subtracting the old voice with a fitted
  FIR filter and adding the new one (no stems exist), and only frames 255-329 were re-rendered and spliced. Technique reusable for one-word fixes.
- **User's rules from chat 6:** (1) only facts stated plainly in the sources and not contradicted by other sources; drop anything disputed
  (e.g. Zulqarnayn, Jamuxa's last talk with Chingiz, "1 kun" when events are years apart). (2) Every "Tasavvur qil" opens with the words
  "Tasavvur qil" and a hook in the first 3 s, plus an open question that keeps people to the end. (3) Never put religious identifications in.
  (4) Captions and pinned comments must NOT retell the story or give away the answer. (5) The user sometimes doubts a format choice: "Tasavvur
  qil" = viewer placed inside REAL history (70/30 rule), which they accepted.
- **ElevenLabs reading issues (Uzbek):** in Cyrillic the lone word "ўз" was read as "uz", "ғ" came out wrong ("тоғ", "боғлаб" -> "bo'rlab"),
  "отини отган" was garbled. Latin worked for the fix lines ("tog'", "bog'lab"). Test a short line with variants before a full take;
  avoid lone "ўз", "-isan" endings, and word pairs like "otini otgan". Similarity about 75%, Stability Robust, v4.
- **Ep.4 "Chingizxonning o'ng qo'li" FINISHED:** script `prompts/tasavvur-4_chingiz_elevenlabs.md` (Secret History §147 Jebe, §200 Jamuxa's
  betrayers; hook: forgave the enemy, executed the men who brought his enemy: why?), voice `public/tq4/raw.mp3` (take 1 `raw_v1.mp3` +
  3 re-recorded sentences `fix_raw.mp3`, Jamuxa sentence 1.4 s longer: `toScene()` in `TQ4.tsx` maps real time to the first-take timebase,
  `edit/tq4_sfx.py` shifts the same way), words `src/tasavvur/tq4_words.json`, composition `src/tasavvur/TQ4.tsx` (15 scenes), new Bek outfits
  chingiz/mongol/jebe/jamuxa/navkar in `Bek.tsx`, export `video/exports/tasavvur4_chingizxon_ong_qoli_1080p.mp4` (83 s). Cover
  `instagram/cover_tasavvur4.png` (TQ4CoverC, rendered at --scale=2 = 2160x3840 because 1080 looked blurry to the user: always send covers
  at 2x), text "TASAVVUR QIL: / SEN CHINGIZXONNING / O'NG QO'LISAN!" over Chingizxon + Bek. Caption/comment `instagram/post_tasavvur4.md`.
  The user is posting it on 2026-11-17. Next: ask for its stats.
- Rejected next idea (user's): "Chingizxon catches a spy, choose the torture" (top-3 brutal methods, molten silver). Declined: graphic
  torture vote for a 13-17 audience (Instagram policy) and the famous torture stories are late/disputed. Offered instead: a spy story
  from the sources with Chingizxon's real decision, no torture.
- Creative Claw: 7 credits left (transcription 2-3 each).

## State at the end of chat 5 (2026-11-15) — read this first in chat 6

- Chat 5 ran in Claude Code on the user's Windows PC (log `suhbat/5-chat_tasavvur-qil-3-qism.md`). The user now moves to the CLOUD
  (works from the phone too). This branch holds everything from chat 5.
- "Tasavvur qil" ep.3 "Qanotli askarlar" is FINISHED: `video/exports/tasavvur3_qanotli_askarlar_1080p.mp4` (80.6 s), cover
  `video/instagram/cover_tasavvur3.png` (video frame + "QANOTLI ASKARLAR", no "TASAVVUR QIL" label: the user asked to drop it),
  caption `video/instagram/post_tasavvur3.md`. Plan: posted 2026-11-15 at 17:30; the user also posts Temur series part 5
  (made in another chat/branch; keep at least 6 h between posts, Instagram "Schedule" when the user is busy 18:00-22:00).
  Next: ask for ep.3 statistics and compare with ep.2.
- Spare scripts for next episodes: Anqara 1402 (`prompts/tasavvur-3_anqara_elevenlabs.md`), Ipak yo'li karvon (recorded once but the
  user found it pointless: it needs a real story arc), Jaloliddin (recorded, topic rejected). Always give the TTS text in Uzbek
  CYRILLIC. The user prefers ONE proposal at a time (answers yes/no) and wants hooks as strong as ep.2; battles are fine.
- Claude usage: the user's weekly limit was at 97% on 2026-11-15 (resets Tuesday 17:00). Keep replies and tool use lean.
- In the cloud: Remotion's own Chromium path is `/opt/pw-browsers/chromium`; the TQ3 pipeline is described in the chat 5 notes
  below (bundle once, stills, `edit/tq3_sfx.py`, ffmpeg mix, render `--muted`, mux).

## State at the end of chat 4 (2026-11-14) — read this first in chat 5

- The user moves to a new chat (on the PC) and wants it to know everything from chat 4. Main focus now: "Tasavvur qil".
- Ep.2 was a hit: about 7.6k views and 60 comments in the first 1.5 h (still growing). Followers remain the weak point.
- Animated follow button for all later episodes: `FollowButton` in `src/tasavvur/common.tsx` (pops in, wiggles, a hand taps it,
  turns grey "OBUNA BO'LDING", bell rings) with sound `edit/follow_sfx.py` (`add_follow(add, SR, t0)`: click t0+1.0 s, "ching" t0+1.25 s).
  Give it about 3 s at the end of the video. Preview `video/exports/obuna_tugma_namuna.mp4`.
- Comment replies: thanks + teaser of the next part + follow ask, varied wording, follow ask in only every 3rd-4th reply.
  Profile tips given: pin the Tasavvur reels, bio line "🎮 "Tasavvur qil" — har hafta yangi zamonga sayohat", share to Stories with a poll.
- Content rule agreed: about 70% real history, 30% imagination. Rotate formats: "1 kun" POV (ep.1), "Kim kuchli?" comparisons,
  "Agar... bo'lsa?" (ep.2 style) only occasionally, so the page does not look silly.
- NEXT EPISODE (user's own idea, accepted): "Agar Alouddin Muhammad Xorazmshoh va onasi Turkon xotun kelishib, qo'shinni shaharlarga
  tarqatmasdan Jaloliddin aytgandek bir joyda jang qilganida-chi?" Real basis: in 1219-1220 Muhammad II split his large army into city
  garrisons (Otrar, Bukhara, Samarqand) instead of meeting the Mongols in the field; Jaloliddin argued for concentrating the forces
  (Nasawi, Juvayni); Turkon xotun and her Qipchoq emirs fed the court conflict. Write the script (fast TTS style, simple words, fact check,
  label legends, "taxmin" for the what-if part, map of the Khwarazmian state vs the Mongol advance, vote "1, 2 yoki 3"), get it confirmed
  BEFORE the user records. Chat 5 (2026-11-14): draft text, fact check and scene plan written in
  `prompts/tasavvur-3_elevenlabs.md`; version 2 (4 fact fixes, TTS-friendly) CONFIRMED by the user, title "Agar Jaloliddin
  qo'mondon bo'lganida". The user recorded it (Downloads, "Davronbek - Journalist" voice) but then disliked the topic itself;
  after many rejected ideas (non-war science/forgotten stories were "known" or not liked) they picked "Sen Anqara jangidasan" (Temur vs
  Bayezid 1402) and "Sen Ipak yo'lida karvonchisan: 1 kun". The user then chose the caravan FIRST: ep.3 = "Ipak yo'lida 1 kun",
  draft `prompts/tasavvur-3_karvon_elevenlabs.md`. They recorded it and found it pointless (a list of facts, no story). Lesson: every
  episode needs a hook as strong as "Temur + modern weapons" and a real story arc (goal, danger, twist), not a fact list; avoid
  repeating ep.2's shape (Temur + map + 3 map variants). FINAL CHOICE for ep.3: "Qanotli askarlar" (Alexander and the Sogdian Rock,
  327 BC, Arrian IV.18-19, twist: Roxana/Ravshanak), `prompts/tasavvur-3_qoya_elevenlabs.md`. ElevenLabs mispronounces Latin Uzbek
  (x -> "ks", o'/g'): give the TTS text in Uzbek CYRILLIC from now on. Voice recorded: `video/public/tq3/take1.mp3` (old ending
  cut at 63.95 s) + `take2.mp3` (new ending, -1.7 dB) spliced into `public/tq3/raw.mp3` (77.5 s); word timings
  `src/tasavvur/tq3_words.json` (Scribe, 2 credits; Creative Claw 16 left). On this PC curl needs `--ssl-no-revoke`.
- TQ3 montage IN PROGRESS (stopped 2026-11-14, user's internet went down): new Bek outfits 'sogd', 'iskandar', 'ravshanak' in
  `Bek.tsx`; composition `src/tasavvur/TQ3.tsx` written (11 scenes: hook = zoom-out from Bek's face to the rock and army, army +
  Iskandar, "?", envoy + laughing So'g'ds + wings, angry Iskandar + coins, night climb with ropes/pegs and one fall, dawn + white
  cloths on the peak, "winged soldiers" shout, panic + white flag, Ravshanak twist + heart, vote 1/2/3 + FollowButton at 77.4 s;
  80.6 s total) and registered in `Root.tsx`. NOT yet checked visually (no stills reviewed). Setup on the PC done: `npm install`,
  numpy. The first `remotion still` ran >6 min and wrote NO image, with no error in the log (only "Node.js v26.13.0"):
  Cause: it was silently downloading Remotion's 131 MB headless shell. FIX on this PC: pass
  `--browser-executable="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"` (a still takes ~4 s). Stills reviewed and
  fixed (wings icon moved off the envoy, RAVSHANAK plate moved up out of the Instagram caption zone, crown above her head).
  Sound: `edit/tq3_sfx.py` -> `public/tq3/sfx.wav`; mix `out/audio_tq3.m4a` (music.mp3 from 31.4 s so the song entry lands at
  ~4.6 s, ducked, -16.1 LUFS). Render: `npx remotion render <bundle> TQ3 out/tq3_raw.mp4 --browser-executable=<edge>
  --concurrency=2 --crf=16 --muted` (took ~4 min), then muxed: DONE 2026-11-14 `video/exports/tasavvur3_qanotli_askarlar_1080p.mp4`
  (80.6 s, 1080x1920, 32 MB). The user asked for a re-montage (captions sat on the fortress; black stick-figure climbers looked
  cheap): v2 adds a top caption shade band (0-470 px), keeps cameras so the fortress sits below the caption zone, draws climbers as
  Greek soldiers in Bek's style (outfit 'yunon', arms raised), rock with facets/cracks/snow ledges, gradient skies, moon, dawn sun,
  stone lines on the fortress. Same export path. The user liked v2. Two drawn covers were rejected; the cover is now a real
  video frame (45.6 s, winged soldiers + Iskandar) under the episode title "QANOTLI ASKARLAR" (`TQ3Cover` variants A/B/C,
  `TQ3` takes an `at` frame prop and then hides its caption) -> `instagram/cover_tasavvur3.png`. Lesson: covers from real
  video frames + the episode title work better for this user than separately drawn ones. caption + pinned comment + posting settings `instagram/post_tasavvur3.md`.
  Next: the user posts it; then ask for its stats. Spare drafts for ep.4+: Anqara, caravan. Next: bundle once
  (`npx remotion bundle src/index.ts --out-dir <tmp>`), render stills of each scene and fix layout, write `edit/tq3_sfx.py`
  (copy tq2_sfx.py + follow_sfx), mix like ep.2 (music from 36 s, ducked, -16 LUFS), render with `--concurrency=2`,
  export `video/exports/tasavvur3_qanotli_askarlar_1080p.mp4`. Anqara and caravan drafts are kept as spares. The user prefers ONE option at a time (answers yes/no), likes ep.1/ep.2 style, battles are fine. Then: Jaloliddin at the Sind river (1221) as a "1 kun"/POV episode; "Temur va Chingizxon: kim kuchli?".
- Paid tools: no free trial for Google AI plans (checked 2026-11-13): AI Plus $4.99 (200 Flow credits/month), AI Pro $19.99 (1,000),
  Ultra $99.99/$199.99 (10k/25k); Flow video model is "Gemini Omni Flash". Decision: buy nothing for now. The user liked a cinematic
  AI-video page (@historyofuzb, Veo-like clips); possible later test: AI Plus for one month for a few moving shots in the Temur series.
  Warned against "free via Claude" GitHub tools (account bans, credential theft).
- Creative Claw: 17 credits (transcription costs 2-3 per episode). Firecrawl web search hit its keyless daily limit once.
- Chat 5 may run in Claude Code on the user's Windows PC (GTX 6 GB, 8 GB RAM) in a local copy of this repository (ZIP of branch
  `claude/zen-curie-3dlfy5`, possibly without git). There: install Node.js LTS, ffmpeg and Python 3 (numpy, Pillow) if missing, run
  `npm install` in `video/`, let Remotion use its own downloaded browser (the `/opt/pw-browsers/chromium` path is only for cloud
  sessions), render with `--concurrency=2`, and deliver files from the local `video/exports/` folder (no GitHub link needed).
