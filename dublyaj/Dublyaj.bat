@echo off
title Donghua dublyaj
cd /d "%~dp0"
if exist venv\Scripts\python.exe goto run
echo Birinchi marta: dasturlar ornatilmoqda (15-30 daqiqa, 5 GB atrofida). Kuting...
py -3.11 --version >nul 2>nul || winget install -e --id Python.Python.3.11 --accept-source-agreements --accept-package-agreements
py -3.11 -m venv venv || python -m venv venv
if not exist venv\Scripts\python.exe (echo Python topilmadi. Kompyuterni qayta yoqib, shu faylni yana oching. & pause & exit /b 1)
venv\Scripts\python -m pip install --upgrade pip
venv\Scripts\python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
venv\Scripts\python -m pip install demucs faster-whisper edge-tts anthropic gradio soundfile librosa scikit-learn static-ffmpeg webrtcvad-wheels
venv\Scripts\python -m pip install --no-deps resemblyzer
venv\Scripts\python -m pip install omnivoice
venv\Scripts\python -m pip install "av<19"
:run
echo Yangilanish tekshirilmoqda...
curl -fsSL -o dublyaj_yangi.py https://raw.githubusercontent.com/jamshidrabbimov09-beep/ai-video-/claude/uzbek-dubbing-chinese-anime-as1zei/dublyaj/dublyaj.py && move /y dublyaj_yangi.py dublyaj.py >nul
if exist dublyaj_yangi.py del dublyaj_yangi.py
echo Ilova ochilmoqda. Brauzerda oyna chiqadi. Bu qora oynani yopmang.
venv\Scripts\python dublyaj.py
pause
