@echo off
title Ovoz klonlashni ornatish
cd /d "%~dp0"
if not exist venv\Scripts\python.exe (echo Avval Dublyaj.bat ni ishga tushiring. & pause & exit /b 1)
echo Ovoz klonlash ornatilmoqda (10 daqiqa atrofida)...
venv\Scripts\python -m pip install coqui-tts
echo Tayyor. Endi Dublyaj.bat ni oching.
pause
