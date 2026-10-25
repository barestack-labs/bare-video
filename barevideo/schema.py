from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

SCHEMA_VERSION = "1.0"


def _num(value: Any, label: str) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{label} must be numeric") from exc
    if not math.isfinite(result) or result < 0:
        raise ValueError(f"{label} must be finite and non-negative")
    return result


def make_transcript(*, provider: str, model: str, language: str | None,
                    words: list[dict], text: str | None = None,
                    duration: float | None = None, segments: list[dict] | None = None,
                    source: str | None = None) -> dict:
    normalized: list[dict] = []
    previous_start = -1.0
    for index, word in enumerate(words):
        start = _num(word.get("start"), f"word {index} start")
        end = _num(word.get("end"), f"word {index} end")
        if end <= start:
            raise ValueError(f"word {index} must end after it starts")
        if start < previous_start:
            raise ValueError("word timestamps must be source ordered")
        previous_start = start
        token = str(word.get("text", word.get("word", word.get("punctuated_word", "")))).strip()
        if not token:
            continue
        confidence = word.get("confidence")
        normalized.append({
            "text": token,
            "start": round(start, 4),
            "end": round(end, 4),
            "confidence": None if confidence is None else float(confidence),
            "speaker": word.get("speaker"),
        })
    if not normalized:
        raise ValueError("transcript has no timed words")
    final_duration = _num(duration if duration is not None else normalized[-1]["end"], "duration")
    if final_duration < normalized[-1]["end"]:
        final_duration = normalized[-1]["end"]
    clean_segments = []
    for segment in segments or []:
        if "start" not in segment or "end" not in segment:
            continue
        start = _num(segment["start"], "segment start")
        end = _num(segment["end"], "segment end")
        if end <= start:
            continue
        clean_segments.append({"start": round(start, 4), "end": round(end, 4), "text": str(segment.get("text", "")).strip()})
    return {
        "schema_version": SCHEMA_VERSION,
        "provider": provider,
        "model": model,
        "language": language,
        "source": source,
        "duration": round(final_duration, 4),
        "text": text.strip() if isinstance(text, str) else " ".join(w["text"] for w in normalized),
        "words": normalized,
        "segments": clean_segments,
    }


def validate_transcript(data: dict) -> dict:
    required = {"provider", "model", "duration", "words"}
    missing = required - set(data)
    if missing:
        raise ValueError(f"transcript missing fields: {', '.join(sorted(missing))}")
    return make_transcript(
        provider=str(data["provider"]),
        model=str(data["model"]),
        language=data.get("language"),
        source=data.get("source"),
        duration=data.get("duration"),
        text=data.get("text"),
        words=data["words"],
        segments=data.get("segments", []),
    )


def load_transcript(path: str | Path) -> dict:
    return validate_transcript(json.loads(Path(path).read_text(encoding="utf-8")))


def save_transcript(data: dict, path: str | Path) -> Path:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(validate_transcript(data), indent=2, ensure_ascii=False), encoding="utf-8")
    return target
