from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path


def require(command: str) -> str:
    path = shutil.which(command)
    if not path:
        raise RuntimeError(f"Required command not found: {command}")
    return path


def run(command: list[str], *, cwd: str | Path | None = None, capture: bool = False) -> subprocess.CompletedProcess:
    return subprocess.run(command, cwd=cwd, text=True, capture_output=capture, check=True)


def probe(path: str | Path) -> dict:
    require("ffprobe")
    result = run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
        "-of", "json", str(path),
    ], capture=True)
    return json.loads(result.stdout)


def duration(path: str | Path) -> float:
    data = probe(path)
    return float(data.get("format", {}).get("duration", 0.0))


def extract_audio(source: str | Path, output: str | Path, *, codec: str = "flac") -> Path:
    require("ffmpeg")
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    if codec == "flac":
        args = ["-ar", "16000", "-ac", "1", "-c:a", "flac"]
    elif codec == "wav":
        args = ["-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le"]
    elif codec == "mp3":
        args = ["-ar", "16000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k"]
    else:
        raise ValueError(f"unsupported audio codec: {codec}")
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source), "-vn", *args, str(output)])
    return output
