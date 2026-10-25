from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlencode

from .media import duration as media_duration, extract_audio, require
from .schema import make_transcript, save_transcript


def _curl_json(args: list[str]) -> dict:
    require("curl")
    proc = subprocess.run(["curl", "-sS", "--fail-with-body", *args], text=True, capture_output=True)
    if proc.returncode:
        message = proc.stderr.strip() or proc.stdout.strip() or f"curl failed with exit {proc.returncode}"
        raise RuntimeError(message)
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"ASR returned invalid JSON: {proc.stdout[:500]}") from exc


def transcribe_groq(source: str | Path, *, api_key: str | None = None,
                    model: str = "whisper-large-v3-turbo", language: str | None = None) -> dict:
    key = api_key or os.environ.get("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    source = Path(source)
    args = [
        "-X", "POST", "https://api.groq.com/openai/v1/audio/transcriptions",
        "-H", f"Authorization: Bearer {key}",
        "-F", f"file=@{source}",
        "-F", f"model={model}",
        "-F", "response_format=verbose_json",
        "-F", "timestamp_granularities[]=word",
        "-F", "timestamp_granularities[]=segment",
        "-F", "temperature=0",
    ]
    if language:
        args += ["-F", f"language={language}"]
    raw = _curl_json(args)
    words = [{"text": w.get("word", ""), "start": w.get("start"), "end": w.get("end"), "confidence": w.get("confidence")} for w in raw.get("words", [])]
    segments = [{"text": s.get("text", ""), "start": s.get("start"), "end": s.get("end")} for s in raw.get("segments", [])]
    return make_transcript(provider="groq", model=model, language=raw.get("language", language), source=str(source), duration=raw.get("duration", media_duration(source)), text=raw.get("text"), words=words, segments=segments)


def transcribe_deepgram(source: str | Path, *, api_key: str | None = None,
                        model: str = "nova-3", language: str | None = None) -> dict:
    key = api_key or os.environ.get("DEEPGRAM_API_KEY")
    if not key:
        raise RuntimeError("DEEPGRAM_API_KEY is not configured")
    source = Path(source)
    mime = "audio/flac" if source.suffix.lower() == ".flac" else "audio/wav" if source.suffix.lower() == ".wav" else "audio/mpeg" if source.suffix.lower() == ".mp3" else "application/octet-stream"
    query = {"model": model, "smart_format": "true", "punctuate": "true", "utterances": "true", "filler_words": "true"}
    query["language"] = language or "multi"
    url = "https://api.deepgram.com/v1/listen?" + urlencode(query)
    require("curl")
    proc = subprocess.run([
        "curl", "-sS", "--fail-with-body", "-X", "POST", url,
        "-H", f"Authorization: Token {key}",
        "-H", f"Content-Type: {mime}",
        "--data-binary", f"@{source}",
    ], text=True, capture_output=True)
    if proc.returncode:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip())
    raw = json.loads(proc.stdout)
    alt = raw.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0]
    words = [{
        "text": w.get("punctuated_word") or w.get("word", ""),
        "start": w.get("start"), "end": w.get("end"), "confidence": w.get("confidence"), "speaker": w.get("speaker"),
    } for w in alt.get("words", [])]
    segments = [{"text": u.get("transcript", ""), "start": u.get("start"), "end": u.get("end")} for u in raw.get("results", {}).get("utterances", [])]
    return make_transcript(provider="deepgram", model=model, language=language, source=str(source), duration=raw.get("metadata", {}).get("duration", media_duration(source)), text=alt.get("transcript"), words=words, segments=segments)


def transcribe_local(source: str | Path, *, model: str = "small", language: str | None = None,
                     device: str = "cpu", compute_type: str = "int8") -> dict:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError("Local transcription requires faster-whisper. Install it in the project environment first.") from exc
    source = Path(source)
    whisper = WhisperModel(model, device=device, compute_type=compute_type)
    segments_iter, info = whisper.transcribe(str(source), language=language, word_timestamps=True, vad_filter=True)
    words: list[dict] = []
    segments: list[dict] = []
    for segment in segments_iter:
        segments.append({"start": segment.start, "end": segment.end, "text": segment.text})
        for word in segment.words or []:
            words.append({"text": word.word.strip(), "start": word.start, "end": word.end, "confidence": getattr(word, "probability", None)})
    return make_transcript(provider="faster-whisper", model=model, language=getattr(info, "language", language), source=str(source), duration=media_duration(source), text=" ".join(s["text"].strip() for s in segments), words=words, segments=segments)


def choose_provider(requested: str = "auto") -> str:
    if requested != "auto":
        return requested
    if os.environ.get("GROQ_API_KEY"):
        return "groq"
    if os.environ.get("DEEPGRAM_API_KEY"):
        return "deepgram"
    raise RuntimeError("No cloud transcription key is configured. Add GROQ_API_KEY or DEEPGRAM_API_KEY, or explicitly choose --provider local after approving the local model download.")


def transcribe(source: str | Path, output: str | Path, *, provider: str = "auto",
               language: str | None = None, model: str | None = None) -> dict:
    provider = choose_provider(provider)
    source = Path(source)
    with tempfile.TemporaryDirectory(prefix="bare-video-asr-") as temp:
        temp_path = Path(temp)
        if provider in {"groq", "deepgram"}:
            audio = extract_audio(source, temp_path / "audio.mp3", codec="mp3")
        else:
            audio = source
        if provider == "groq":
            result = transcribe_groq(audio, model=model or "whisper-large-v3-turbo", language=language)
        elif provider == "deepgram":
            result = transcribe_deepgram(audio, model=model or "nova-3", language=language)
        elif provider == "local":
            result = transcribe_local(audio, model=model or "small", language=language)
        else:
            raise ValueError(f"unknown provider: {provider}")
    result["source"] = str(source)
    save_transcript(result, output)
    return result
