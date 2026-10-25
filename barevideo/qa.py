from __future__ import annotations

import json
import re
import subprocess
from difflib import SequenceMatcher
from pathlib import Path

from .media import probe, require


def qa_video(video: str | Path) -> dict:
    require("ffmpeg"); video=Path(video)
    info=probe(video)
    decode=subprocess.run(["ffmpeg","-v","error","-i",str(video),"-f","null","-"],text=True,capture_output=True)
    silence=subprocess.run(["ffmpeg","-hide_banner","-i",str(video),"-af","silencedetect=noise=-38dB:d=1.0","-f","null","-"],text=True,capture_output=True)
    starts=[float(x) for x in re.findall(r"silence_start: ([0-9.]+)",silence.stderr)]
    ends=[float(x) for x in re.findall(r"silence_end: ([0-9.]+)",silence.stderr)]
    intervals=[]
    for i,s in enumerate(starts): intervals.append({"start":s,"end":ends[i] if i<len(ends) else None})
    return {"video":str(video),"decode_ok":decode.returncode==0,"decode_errors":decode.stderr.strip(),"probe":info,"long_silences":intervals}


def write_qa(video: str | Path, output: str | Path) -> dict:
    result=qa_video(video); Path(output).write_text(json.dumps(result,indent=2),encoding="utf-8"); return result


def transcript_similarity(expected: dict, actual: dict) -> float:
    a=" ".join(w["text"].lower() for w in expected.get("words",[]))
    b=" ".join(w["text"].lower() for w in actual.get("words",[]))
    return round(SequenceMatcher(None,a,b).ratio(),4)
