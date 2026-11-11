"""dublyaj.py o'zgargach ishga tushiring: kodni Colab daftari ichiga qayta joylaydi."""
import json
import os

here = os.path.dirname(os.path.abspath(__file__))
code_text = open(os.path.join(here, "dublyaj.py"), encoding="utf-8").read()


def md(t):
    return {"cell_type": "markdown", "metadata": {}, "source": t.splitlines(True)}


def code(t):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": t.splitlines(True)}


cells = [
    md("""# Donghua dublyaj: xitoycha → o'zbekcha

1. Yuqoridagi menyu: **Runtime → Change runtime type → T4 GPU** ni tanlang.
2. **Runtime → Run all** ni bosing (3-5 daqiqa o'rnatiladi).
3. Eng pastda `https://....gradio.live` havolasi chiqadi: uni oching, videoni yuklang.

Tarjimani Claude qiladi: API kalit bo'lsa avtomatik, bo'lmasa `claude_uchun.txt` faylini Claude chatiga yuborasiz."""),
    code("""# 1. O'rnatish
!pip install -q demucs faster-whisper edge-tts anthropic gradio soundfile webrtcvad-wheels
!pip install -q --no-deps resemblyzer
!apt-get -qq install -y ffmpeg > /dev/null"""),
    code("""# (ixtiyoriy) Google Drive'ni ulash: katta videoni Drive'dan olish va natijani saqlash uchun
# from google.colab import drive; drive.mount('/content/drive')"""),
    code("%%writefile /content/dublyaj.py\n" + code_text),
    code("""# 3. Ishga tushirish: chiqqan gradio.live havolasini oching
import glob, os
libs = glob.glob("/usr/local/lib/python3*/dist-packages/nvidia/*/lib")
os.environ["LD_LIBRARY_PATH"] = ":".join(libs + [os.environ.get("LD_LIBRARY_PATH", "")])
!python /content/dublyaj.py"""),
]
nb = {"cells": cells, "nbformat": 4, "nbformat_minor": 0,
      "metadata": {"accelerator": "GPU", "colab": {"provenance": [], "gpuType": "T4"},
                   "kernelspec": {"display_name": "Python 3", "name": "python3"}, "language_info": {"name": "python"}}}
json.dump(nb, open(os.path.join(here, "Donghua_Dublyaj.ipynb"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("daftar yangilandi")
