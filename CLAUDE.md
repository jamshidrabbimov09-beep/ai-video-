# Unutilgan Qissalar: project memory

Read this first. It records what was built and agreed with the user in the first working session,
so a new session can continue without that conversation.

The full text of that first conversation (user messages and Claude's replies, no tool output) is in
`suhbat/1-chat_amir-temur-1-qism.md`. The user plans one chat per part and wants each new chat to know everything
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
- **Part 1 "Cho'loq yigit" is finished and was posted as a Reel on 2026-11-10.** Next: Part 2 (alliance with Amir Husayn,
  1360-1370).

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

## Repository

- Part 1 work was done on branch `claude/busy-hamilton-6qdlnb`; pull request #2 into `main` was opened on 2026-11-10 and
  the user was asked to merge it. If `main` lacks `prompts/` and `video/`, the merge has not happened: base the work on
  that branch instead. (PR #1 belongs to an unrelated earlier chat.)
- `suhbat/`: exported conversation logs, one file per chat.
- `prompts/`: script, image prompts, clip prompts for Part 1. `video/`: the Remotion project and all media.
- The Russian files at the repo root (`ИНСТРУКЦИЯ.md`, `СТИЛЬ.md`, `СТРУКТУРА.md`, `ИСТОЧНИКИ.md`,
  `Семейные драмы.txt`) belong to an unrelated earlier project (family-drama stories) and are not used here.

## Donghua dublyaj tool (separate from the history channel)

- Requested 2026-11-11: the user wants to dub 21-25 minute Chinese donghua episodes into Uzbek with AI voices, keeping
  music, effects and laughter, and to receive WAV files (full mix, and Uzbek voices only, placed at the right times).
- Built in `dublyaj/`: `dublyaj.py` (Demucs separation, faster-whisper zh transcription, pitch plus resemblyzer speaker
  grouping, Claude translation, edge-tts voices `uz-UZ-SardorNeural`/`uz-UZ-MadinaNeural`, mix, Gradio UI) and
  `Donghua_Dublyaj.ipynb`, a self-contained Colab notebook with the code embedded: run `dublyaj/make_notebook.py`
  whenever `dublyaj.py` changes.
- The user then asked for something simpler than Colab steps: open, pick the file, get the audio. The UI is now one
  button ("Dublyaj qilish") with the table and settings under "Qo'lda tuzatish". `dublyaj/Dublyaj.bat` installs and
  runs it locally on Windows (venv, torch cu121, Whisper `medium` on CPU there, Demucs in 5-minute chunks for 8 GB RAM,
  output in `dublyaj/natija/`). The .bat has never been run on Windows. A phone can only use the Colab link.
- Casting and register (requested 2026-11-11): Claude also returns speaker label, gender, age (bola/yosh/katta/qari)
  and emotion per line; sen/siz must follow the relationship (no polite forms towards enemies). Voices are derived
  from gender plus age, emotion only through rate, pitch and gain (the free Uzbek edge-tts voices have no styles).
  The UI has "Doimiy qoidalar" (standing rules, saved) and a free-text correction box that Claude applies to the
  whole script (API key needed). The user wants the tool polished before installing or trying it.
- Projects (requested 2026-11-11): one project per donghua, chosen by name in the UI, stored in
  `dublyaj/loyihalar/<name>/` (`ovozlar/` samples `<who>.wav` + `<who>.txt` transcript, `personajlar.json` cast,
  `xotira.txt` Claude notes, `qoidalar.txt` rules, `ish/` work files of the current episode only, `natija/<episode>/`).
  Cast and notes are fed to Claude in later episodes so labels, gender, age and sen/siz stay fixed.
- Voice (2026-11-12): the user found VoiceStudio (github.com/debpalash/VoiceStudio, AGPL desktop app) and asked to
  clone each character from the Chinese original and speak Uzbek in that voice and tone. Its engine, OmniVoice
  (`pip install omnivoice`, model `k2-fsa/OmniVoice`, Uzbek `uz` with 115 h training data), is now built in
  (`ov_synth`): each line is cloned from the original vocals of that same line (keeps shouting/whisper), with
  `ref_text` = the Chinese transcript and `duration` = the slot length (`slot_of`). Lines shorter than 1.6 s or
  from another voice cluster use the character's saved sample; with no sample, OmniVoice voice design
  (`instruct` "male, elderly" etc.). Failures fall back to edge-tts. coqui-tts and `Ovoz_klonlash.bat` were removed.
  Cross-lingual cloning keeps some Chinese accent (OmniVoice README says so).
- OmniVoice was run for real in the cloud (CPU, venv in the scratchpad): 5 test lines cloned from edge-tts Chinese
  voices took about 3.5 min including model load. Output varies per call and is sometimes unintelligible, so each
  line is checked with faster-whisper `small` (`heard_score`) and regenerated up to 3 times; with that all 5 lines
  scored 0.72-0.89 and fit their slots. Uzbek comes out with an accent. Sample: `dublyaj/namuna_klon.mp3`.
- The user listened to `namuna_klon.mp3` (2026-11-12): timbre good, but the Uzbek sounded Chinese-accented and
  unclear. Tested an alternative in the cloud: edge-tts Uzbek, then Seed-VC v1 (`pip install seed-vc`,
  `SeedVCWrapper().convert_voice(..., stream_output=False)` is a generator whose return value is the audio; its
  bundled BigVGAN needs `proxies`/`resume_download` defaulted for huggingface_hub 2.x). Averages over 5 lines
  (Whisper-small intelligibility / resemblyzer similarity): edge 0.82/0.71, OmniVoice 0.82/0.84, edge+Seed-VC
  0.71/0.86 (one shouted line failed at 0.39). A/B file for the user: `dublyaj/solishtirish.mp3`. Waiting for the
  user's choice; Seed-VC is not in the app yet. resemblyzer's webrtcvad needs `setuptools<81` (pkg_resources).
- av 19 breaks faster-whisper's file decoding (`metadata_errors`): the app now passes numpy arrays, and the .bat pins
  `av<19`.
- UI redesigned (orange theme, tabs: Dublyaj, Personajlar va ovozlar, Tarjima va tuzatish, Sozlamalar).
  `ensure_packages()` pip-installs missing modules on the PC at start, so code changes can add dependencies.
- The cloud session now runs on a personal environment `ai-video-` that also allows speech.platform.bing.com and
  Hugging Face hosts (edge-tts needs `proxy=$HTTPS_PROXY` and `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt` here).
  download.pytorch.org is not allowed: install torch from PyPI in the cloud.
- `make_notebook.py` also builds `dublyaj/Dublyaj_windows.zip` (the small download for the PC): rerun after changes.
- Translation: the user rejected Google translate and wants Claude to translate with context and then review the
  translation (replies must fit each other). Two routes: an optional Anthropic API key (two passes, translate then
  editor review, `claude-opus-5-5`), or free: the app writes `claude_uchun.txt`, the user sends it to a Claude chat and
  pastes back `number | uzbek text` lines. If the user sends that file in a chat, translate it in that format.
- Only segment splitting, the mix, the UI construction and the Claude translation flow against a mock client were tested in the cloud session (TTS,
  Hugging Face and model hosts are blocked there, and there was no API key). The full pipeline has not yet been run on Colab: expect to fix
  dependency or tuning issues from the user's first screenshots (speaker clustering threshold 0.45 is a guess).

## Open items

- Part 2 script, then narration, images, edit.
- Review Part 1 Reel statistics (where viewers drop off) once the user sends a screenshot.
- Offered, not yet decided: a 60-second cut of Part 1; cross-posting the logo-free file to YouTube Shorts and TikTok.
- Instagram: profile set up (avatar, name "Unutilgan Qissalar | Tarix", bio, creator account, category "Образование").
  Part 1 Reel posted with the cover, caption, Samarqand location, AI label and high-quality upload. Suggested pinned
  first comments are in the conversation log.
