"""Logic dùng chung cho trợ lý giọng nói Sonus Tactic."""

from __future__ import annotations

import base64
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
import webbrowser
from io import BytesIO
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
    sr = None

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
        "keywords": ["giao dien toi", "dark mode", "bat toi"],
        "reply": "Đã bật giao diện tối.",
        "theme": "dark",
    },
    {
        "keywords": ["giao dien sang", "light mode", "bat sang"],
        "reply": "Đã bật giao diện sáng.",
        "theme": "light",
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


def match_command(text: str) -> dict | None:
    normalized = normalize(text)
    if not normalized:
        return None

    for command in COMMANDS:
        for keyword in command["keywords"]:
            if keyword in normalized or normalized in keyword:
                return command
    return None


def command_to_action(command: dict) -> dict:
    if command.get("theme"):
        return {"type": "theme", "value": command["theme"]}

    if command.get("url"):
        target = command["url"]
        if command.get("anchor"):
            target = f"{target}#{command['anchor']}"
        return {"type": "navigate", "target": target}

    return {"type": "none"}


def build_url(page: str, anchor: str = "") -> str:
    target = BASE_DIR / page
    url = target.as_uri()
    if anchor:
        url = f"{url}#{anchor}"
    return url


def get_ffmpeg_exe() -> str | None:
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return shutil.which("ffmpeg")


def accelerate_audio(src_path: str, speed: float = SPEECH_SPEED) -> str:
    if speed <= 1.0:
        return src_path

    dst_path = src_path.replace(".mp3", "_fast.mp3")
    ffmpeg_exe = get_ffmpeg_exe()
    if not ffmpeg_exe:
        return src_path

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


def synthesize_mp3_bytes(text: str) -> bytes | None:
    if gTTS is None:
        return None

    temp_path = None
    fast_path = None
    try:
        temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        temp_path = temp_file.name
        temp_file.close()

        gTTS(text=text, lang="vi").save(temp_path)
        fast_path = accelerate_audio(temp_path)
        return Path(fast_path).read_bytes()
    except Exception:
        return None
    finally:
        for path in {temp_path, fast_path}:
            if path:
                try:
                    Path(path).unlink(missing_ok=True)
                except OSError:
                    pass


def mp3_bytes_to_base64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def convert_to_wav(source_path: str) -> str | None:
    ffmpeg_exe = get_ffmpeg_exe()
    if not ffmpeg_exe:
        return None

    wav_path = source_path.rsplit(".", 1)[0] + ".wav"
    result = subprocess.run(
        [ffmpeg_exe, "-y", "-i", source_path, "-ar", "16000", "-ac", "1", wav_path],
        capture_output=True,
    )
    if result.returncode == 0 and Path(wav_path).exists():
        return wav_path
    return None


def transcribe_audio_file(source_path: str) -> str | None:
    if sr is None:
        return None

    wav_path = source_path
    created_wav = False
    if not source_path.lower().endswith(".wav"):
        converted = convert_to_wav(source_path)
        if not converted:
            return None
        wav_path = converted
        created_wav = True

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(wav_path) as source:
            audio = recognizer.record(source)
        return recognizer.recognize_google(audio, language=LANG)
    except (sr.UnknownValueError, sr.RequestError):
        return None
    finally:
        if created_wav:
            try:
                Path(wav_path).unlink(missing_ok=True)
            except OSError:
                pass


def process_voice_text(text: str) -> dict:
    command = match_command(text)
    if command is None:
        reply = "Tôi chưa hiểu lệnh này. Hãy nói hướng dẫn để nghe các lệnh."
        audio = synthesize_mp3_bytes(reply)
        return {
            "heard": text,
            "reply": reply,
            "action": {"type": "none"},
            "audio_base64": mp3_bytes_to_base64(audio) if audio else "",
        }

    reply = command["reply"]
    audio = synthesize_mp3_bytes(reply)
    return {
        "heard": text,
        "reply": reply,
        "action": command_to_action(command),
        "audio_base64": mp3_bytes_to_base64(audio) if audio else "",
    }


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
