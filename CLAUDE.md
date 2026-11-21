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

## Amir Temur series: see `TEMUR.md`

Everything about the Amir Temur series (approved style, how each part is built, history-accuracy and wording rules, Parts 1-5,
open items, what comes next) is in `TEMUR.md` at the repository root. In a Temur chat read that file after this one and keep
Temur notes there; do not mix Temur work into the "Tasavvur qil" sections below, and do not apply Tasavvur rules to Temur.

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

## New page/series "Toshkent. 1994" (started 2026-11-19, chat 8)

- The user wants a NEW Instagram account with a wide audience: a serious, cinematic (not childish) crime/mafia serial, all
  editing in the cloud. Rejected first: "Nima bo'ladi?" science what-ifs, and cartoon life-drama "Bir hikoya".
- Fictional crime drama (no real people), Tashkent 1994, hero Sardor (24, Afghan veteran, taxi driver, sick mother). Season 1 = 6 parts
  (~90 s each, cliffhangers): Bir kecha / Kalit egasi (Hoji aka) / Birinchi ish / Militsioner (old friend) / Xoin / Kalit.
- Style like the Temur series: user makes Flow images (Sardor portrait as face reference) and records the narrator; Claude does script,
  prompts, montage, sfx, music, cover, caption. Files in `serial/toshkent-1994/` (ep.1 script + prompts: `1-qism.md`).
- Chat 8 decisions: images can't be made free in the cloud (Pollinations free tier: 580px + watermark, rejected; Creative Claw 7 credits;
  user declined a Gemini API key; Flow has no API). Code-drawn noir sample `video/exports/toshkent1994_noir_namuna.mp4`
  (`src/serial/NoirTest.tsx`) was made but the user chose: they make images in Flow (Nano Banana, 9:16, Sardor portrait as reference),
  Claude does premium motion (parallax, rain/smoke overlays, flicker, shake in chases, grain, thin letterbox bars inside 9:16, cinema
  subtitles, sfx, bass score). Format stays 9:16 (21:9 hurts Reels reach); a 16:9 season cut for YouTube later.
- Next: user sends Sardor/passenger portraits -> give the 14 shot prompts with the reference -> user records voice -> montage.
- Page opened 2026-11-20: Instagram `@90.yillar`, name "To'qsoninchi yillar" (many name ideas rejected; the user picked it), avatar = Flow logo
  (white "90" on black; code-drawn logos were rejected). Ep.1 posted 2026-11-20 ~17:45 (export `video/exports/toshkent1994_1qism_1080p.mp4`,
  cover `video/instagram/cover_t94_1.png`, caption `video/instagram/post_t94_1.md`). Ep.1 voice = `public/t94/raw.mp3` (take + 4 spliced fix lines;
  ElevenLabs free tier nearly used up and flagged "abuse detection", yet the user still recorded fixes). Mix `edit/t94_sfx.py` (no thunder: user hated it).
- Ep.1 stats after ~1 day: 638 views, skip 32%, avg watch 37 s of 87 s, 29 follows, likes 11%, audience 25-54 = 79% (35-44 biggest).
  Lesson: slow opening lost ~45% in 8 s; ep.2 opens on the strongest frame + hook. Ep.2 "Kalit egasi" plot approved, script + prompts in
  `serial/toshkent-1994/2-qism.md` (voice text in Latin, no "x" words).
- Composio Instagram connector is linked to @unutilgan_qissalar only (linking @90.yillar kept picking the logged-in account); the user
  sends insight screenshots instead. Claude in Chrome is not available in cloud sessions.
- Ep.2 "Kalit egasi" final 2026-11-21: `video/exports/toshkent1994_2qism_1080p.mp4` (70 s, composition `src/serial/T94b.tsx` T94B, frames `public/t94b/`,
  sfx `edit/t94b_sfx.py`), cover `instagram/cover_t94_2.png`, caption `instagram/post_t94_2.md`. User feedback: fast jitter shake and brightness
  flicker looked cheap ("bijir-bijir") -> use only slow smooth drift, no flicker. An "Oldingi qismda" recap (T94Recap) was tried and REJECTED
  (kills interest); no recap and no extra labels. Continuity instead: each next part starts exactly where the previous one ended (ep.3 opens
  on the empty hole under the floorboard / missing key, 6 a.m. deadline).
