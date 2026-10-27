"""
Chạy website + API trợ lý AI giọng nói.

    cd "D:\\Dự án\\login-form-20"
    pip install -r requirements.txt
    python server.py

Mở trình duyệt: http://127.0.0.1:8765/home.html
Nhấn nút "Trợ lý AI" trên header để nói lệnh.
"""

from __future__ import annotations

import tempfile
import webbrowser
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

import voice_core as vc

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/api/health", methods=["GET", "OPTIONS"])
def health():
    return jsonify({"ok": True, "service": "sonus-ai"})


@app.route("/api/speak", methods=["POST", "OPTIONS"])
def speak_api():
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip()
    if not text:
        return jsonify({"error": "Thiếu nội dung text"}), 400

    audio = vc.synthesize_mp3_bytes(text)
    return jsonify(
        {
            "reply": text,
            "audio_base64": vc.mp3_bytes_to_base64(audio) if audio else "",
        }
    )


@app.route("/api/voice", methods=["POST", "OPTIONS"])
def voice():
    if request.method == "OPTIONS":
        return ("", 204)

    if "audio" not in request.files and not request.is_json:
        return jsonify({"error": "Thiếu file audio"}), 400

    if request.is_json:
        payload = request.get_json(silent=True) or {}
        text = (payload.get("text") or "").strip()
        if not text:
            return jsonify({"error": "Thiếu nội dung text"}), 400
        return jsonify(vc.process_voice_text(text))

    upload = request.files["audio"]
    suffix = Path(upload.filename or "voice.webm").suffix or ".webm"
    temp_path = None

    try:
        temp_file = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
        temp_path = temp_file.name
        temp_file.close()
        upload.save(temp_path)

        heard = vc.transcribe_audio_file(temp_path)
        if not heard:
            reply = "Tôi chưa nghe rõ. Vui lòng nói lại."
            audio = vc.synthesize_mp3_bytes(reply)
            return jsonify(
                {
                    "heard": "",
                    "reply": reply,
                    "action": {"type": "none"},
                    "audio_base64": vc.mp3_bytes_to_base64(audio) if audio else "",
                }
            )

        return jsonify(vc.process_voice_text(heard))
    finally:
        if temp_path:
            try:
                Path(temp_path).unlink(missing_ok=True)
            except OSError:
                pass


@app.route("/")
def root():
    return send_from_directory(BASE_DIR, "home.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)


if __name__ == "__main__":
    url = "http://127.0.0.1:8765/home.html"
    print("Sonus Tactic AI server: http://127.0.0.1:8765")
    print("Nhấn nút Trợ lý AI trên trang chủ để dùng giọng nói.")
    webbrowser.open(url)
    app.run(host="127.0.0.1", port=8765, debug=False)
