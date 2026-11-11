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
:run
echo Ilova ochilmoqda. Brauzerda oyna chiqadi. Bu qora oynani yopmang.
venv\Scripts\python dublyaj.py
pause
