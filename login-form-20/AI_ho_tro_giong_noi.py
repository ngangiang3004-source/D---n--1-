"""
Trợ lý giọng nói Sonus Tactic — dành cho người khiếm thị.
Thu âm lệnh thoại tiếng Việt và mở/truy cập các trang trên website.

Cách chạy (kết nối với trang web):
    pip install -r requirements.txt
    python server.py

Cách chạy riêng trên máy (không cần trình duyệt):
    python AI_ho_tro_giong_noi.py

Phím tắt khi đang chạy: Ctrl+C để thoát.
"""

from __future__ import annotations

import asyncio
import os
import re
import sys
import tempfile
import unicodedata
import webbrowser
from pathlib import Path

try:
    import certifi

    os.environ["SSL_CERT_FILE"] = certifi.where()
    os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
except ImportError:
    certifi = None

try:
    import speech_recognition as sr
except ImportError:
    print("Thiếu thư viện. Chạy: pip install -r requirements.txt")
    sys.exit(1)

try:
    import numpy as np
    import sounddevice as sd
except ImportError:
    np = None
    sd = None

try:
    import edge_tts
except ImportError:
    edge_tts = None

try:
    from gtts import gTTS
except ImportError:
    gTTS = None

BASE_DIR = Path(__file__).resolve().parent
LANG = "vi-VN"
TTS_VOICE = "vi-VN-HoaiMyNeural"
EDGE_TTS_ENABLED = True
SPEECH_SPEED = 1.35
EDGE_TTS_RATE = "+35%"
PYTTSX3_RATE = 220

COMMANDS = [
    {
        "keywords": ["trang chu", "ve trang chu", "mo trang chu"],
        "reply": "Đang mở trang chủ.",
        "url": "home.html",
        "anchor": "",
    },
    {
        "keywords": ["bai hoc", "mo bai hoc", "hoc bai", "vao bai hoc"],
        "reply": "Đang mở phần bài học.",
        "url": "home.html",
        "anchor": "bai-hoc",
    },
    {
        "keywords": ["bai nhac", "tim bai nhac", "cac bai nhac", "nhac nen thu"],
        "reply": "Đang mở các bài nhạc nên thử.",
        "url": "home.html",
        "anchor": "bai-nhac",
    },
    {
        "keywords": ["ve chung toi", "gioi thieu"],
        "reply": "Đang mở phần về chúng tôi.",
        "url": "home.html",
        "anchor": "ve-chung-toi",
    },
    {
        "keywords": ["lien lac", "ho tro", "lien he"],
        "reply": "Đang mở phần liên lạc.",
        "url": "home.html",
        "anchor": "lien-lac",
    },
    {
        "keywords": ["dang nhap", "tai khoan", "mo dang nhap"],
        "reply": "Đang mở trang đăng nhập.",
        "url": "index.html",
        "anchor": "",
    },
    {
        "keywords": ["huong dan", "giup toi", "tro giup", "lenh"],
        "reply": (
            "Bạn có thể nói: trang chủ, bài học, bài nhạc, "
            "về chúng tôi, liên lạc, hoặc đăng nhập."
        ),
        "url": "",
        "anchor": "",
    },
    {
        "keywords": ["tam biet", "thoat", "dung lai"],
        "reply": "Tạm biệt. Hẹn gặp lại bạn.",
        "url": "",
        "anchor": "",
        "exit": True,
    },
]


def normalize(text: str) -> str:
    text = text.strip().lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def build_url(page: str, anchor: str = "") -> str:
    target = BASE_DIR / page
    url = target.as_uri()
    if anchor:
        url = f"{url}#{anchor}"
    return url


def match_command(text: str) -> dict | None:
    normalized = normalize(text)
    if not normalized:
        return None

    for command in COMMANDS:
        for keyword in command["keywords"]:
            if keyword in normalized or normalized in keyword:
                return command
    return None


def play_audio_file(temp_path: str) -> None:
    if sys.platform == "win32":
        try:
            from playsound import playsound

            playsound(temp_path)
            return
        except Exception:
            os.startfile(temp_path)
            return

    webbrowser.open(temp_path)


def accelerate_audio(src_path: str, speed: float = SPEECH_SPEED) -> str:
    if speed <= 1.0:
        return src_path

    dst_path = src_path.replace(".mp3", "_fast.mp3")
    ffmpeg_exe = None

    try:
        import imageio_ffmpeg

        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        import shutil

        ffmpeg_exe = shutil.which("ffmpeg")

    if not ffmpeg_exe:
        return src_path

    import subprocess

    tempo = min(max(speed, 0.5), 2.0)
    result = subprocess.run(
        [
            ffmpeg_exe,
            "-y",
            "-i",
            src_path,
            "-filter:a",
            f"atempo={tempo}",
            "-vn",
            dst_path,
        ],
        capture_output=True,
    )

    if result.returncode == 0 and Path(dst_path).exists():
        return dst_path

    return src_path


def find_vietnamese_voice(engine) -> str | None:
    for voice in engine.getProperty("voices"):
        voice_id = voice.id.lower()
        voice_name = voice.name.lower()
        if any(tag in voice_id or tag in voice_name for tag in ("vi-vn", "vietnam", "viet nam", "vietnamese")):
            return voice.id
    return None


def speak_with_pyttsx3(text: str) -> bool:
    try:
        import pyttsx3

        engine = pyttsx3.init()
        vietnamese_voice = find_vietnamese_voice(engine)
        if not vietnamese_voice:
            engine.stop()
            return False

        engine.setProperty("voice", vietnamese_voice)
        engine.setProperty("rate", PYTTSX3_RATE)
        engine.say(text)
        engine.runAndWait()
        engine.stop()
        return True
    except Exception:
        return False


def speak_with_gtts(text: str) -> bool:
    if gTTS is None:
        return False

    temp_path = None
    fast_path = None
    try:
        temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        temp_path = temp_file.name
        temp_file.close()

        gTTS(text=text, lang="vi").save(temp_path)
        fast_path = accelerate_audio(temp_path)
        play_audio_file(fast_path)
        return True
    except Exception as exc:
        print(f"[gTTS lỗi]: {exc}")
        return False
    finally:
        for path in {temp_path, fast_path}:
            if path:
                try:
                    Path(path).unlink(missing_ok=True)
                except OSError:
                    pass


async def speak_with_edge_tts(text: str) -> bool:
    global EDGE_TTS_ENABLED

    if not EDGE_TTS_ENABLED or edge_tts is None:
        return False

    temp_path = None
    fast_path = None
    try:
        temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        temp_path = temp_file.name
        temp_file.close()

        communicate = edge_tts.Communicate(text, TTS_VOICE, rate=EDGE_TTS_RATE)
        await communicate.save(temp_path)
        fast_path = accelerate_audio(temp_path)
        play_audio_file(fast_path)
        return True
    except Exception:
        EDGE_TTS_ENABLED = False
        return False
    finally:
        for path in {temp_path, fast_path}:
            if path:
                try:
                    Path(path).unlink(missing_ok=True)
                except OSError:
                    pass


async def speak(text: str) -> None:
    print(f"[Trợ lý]: {text}")

    if speak_with_gtts(text):
        return

    if speak_with_pyttsx3(text):
        return

    if await speak_with_edge_tts(text):
        return

    print("[Chỉ hiển thị chữ — chưa phát được giọng tiếng Việt. Kiểm tra kết nối internet.]")


def listen(recognizer: sr.Recognizer) -> str | None:
    if sd is None or np is None:
        print("Thiếu sounddevice hoặc numpy. Chạy: pip install -r requirements.txt")
        return None

    sample_rate = 16000
    duration = 8

    print("\n[Đang lắng nghe... Hãy nói lệnh của bạn]")
    try:
        recording = sd.rec(
            int(duration * sample_rate),
            samplerate=sample_rate,
            channels=1,
            dtype="int16",
        )
        sd.wait()
    except Exception as exc:
        print(f"[Không thể dùng micro]: {exc}")
        return None

    audio = sr.AudioData(recording.tobytes(), sample_rate, 2)

    try:
        text = recognizer.recognize_google(audio, language=LANG)
        print(f"[Bạn nói]: {text}")
        return text
    except sr.UnknownValueError:
        print("[Không nhận diện được — vui lòng nói lại]")
        return None
    except sr.RequestError as exc:
        print(f"[Lỗi dịch vụ nhận dạng giọng nói]: {exc}")
        return None


async def handle_command(command: dict) -> bool:
    await speak(command["reply"])

    if command.get("exit"):
        return False

    if command.get("url"):
        webbrowser.open(build_url(command["url"], command.get("anchor", "")))

    return True


async def main() -> None:
    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True

    await speak(
        "Xin chào. Tôi là trợ lý giọng nói Sonus Tactic. "
        "Bạn có thể nói trang chủ, bài học, bài nhạc, liên lạc hoặc đăng nhập."
    )

    try:
        sd.query_devices(kind="input")
    except Exception:
        print("Không tìm thấy micro. Hãy kiểm tra thiết bị âm thanh.")
        return

    running = True
    while running:
        heard = listen(recognizer)
        if not heard:
            continue

        command = match_command(heard)
        if command is None:
            await speak("Tôi chưa hiểu lệnh này. Hãy nói hướng dẫn để nghe các lệnh.")
            continue

        running = await handle_command(command)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nĐã dừng trợ lý giọng nói.")
