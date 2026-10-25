from __future__ import annotations

import re


def _chunks(transcript: dict, target_seconds: float = 5.5) -> list[dict]:
    if transcript.get("segments"):
        return [s for s in transcript["segments"] if s.get("text")]
    result=[]; bucket=[]; start=None
    for w in transcript["words"]:
        if start is None: start=w["start"]
        bucket.append(w)
        if w["end"]-start >= target_seconds or re.search(r"[.!?]$",w["text"]):
            result.append({"start":start,"end":w["end"],"text":" ".join(x["text"] for x in bucket)}); bucket=[]; start=None
    if bucket: result.append({"start":start,"end":bucket[-1]["end"],"text":" ".join(x["text"] for x in bucket)})
    return result


def choose_layout(text: str, *, style: str = "bare") -> str:
    t=text.lower()
    if style in {"captions","face"}: return "face"
    if style == "tutorial":
        if any(k in t for k in ["github","repo","website","screen","click","open","go to","here is","look at","result"]): return "proof"
        return "split"
    if any(k in t for k in ["terminal","command","prompt","install","npm","python","ffmpeg","api","env","code"]): return "ui"
    if any(k in t for k in ["github","repo","website","screen","screenshot","demo","here is","look at","result","proof"]): return "proof"
    if re.search(r"\b(first|second|third|three|four|steps?|percent|\$\d|free|cost|price)\b",t): return "editorial"
    if any(k in t for k in ["i think","i feel","honestly","for me","i was","my ","personally"]): return "face"
    if any(k in t for k in ["show","use","tool","app","this is","you can"]): return "split"
    return "face"


def build_plan(transcript: dict, *, style: str = "bare", assets: list[str] | None = None) -> dict:
    beats=[]
    asset_queue=list(assets or [])
    for i,seg in enumerate(_chunks(transcript)):
        layout=choose_layout(seg["text"],style=style)
        asset=asset_queue.pop(0) if asset_queue and layout in {"proof","split","float","collage"} else None
        beats.append({"id":i,"start":round(float(seg["start"]),3),"end":round(float(seg["end"]),3),"duration":round(float(seg["end"])-float(seg["start"]),3),"text":seg["text"].strip(),"layout":layout,"asset":asset,"notes":None})
    return {"version":"1.0","style":style,"duration":round(float(transcript["duration"]),3),"beats":beats}
