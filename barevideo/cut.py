from __future__ import annotations

import json
import math
import re
from pathlib import Path

DEFAULT_PROTECTED = {"bare", "video", "deepcut", "deepgram", "groq", "hyperframes", "opencode", "claude", "gemini", "github", "youtube"}
FILLERS = {"um", "uh", "erm", "hmm", "ah", "like"}


def _t(value, label="timestamp") -> float:
    result = float(value)
    if not math.isfinite(result) or result < 0:
        raise ValueError(f"{label} must be finite and non-negative")
    return result


def merge_cuts(cuts: list[dict], tolerance: float = 0.02) -> list[dict]:
    merged: list[dict] = []
    for idx, cut in enumerate(sorted(cuts, key=lambda x: (float(x["start"]), float(x["end"])))):
        start, end = _t(cut["start"], f"cut {idx} start"), _t(cut["end"], f"cut {idx} end")
        if end <= start:
            raise ValueError(f"cut {idx} must end after it starts")
        item = {"start": start, "end": end, "type": cut.get("type", "semantic"), "reason": cut.get("reason", "semantic cut"), "confidence": cut.get("confidence"), "auto_apply": bool(cut.get("auto_apply", False))}
        if not merged or start > merged[-1]["end"] + tolerance:
            merged.append(item)
        else:
            merged[-1]["end"] = max(merged[-1]["end"], end)
            merged[-1]["reason"] += " | " + item["reason"]
            merged[-1]["type"] = "merged"
            merged[-1]["auto_apply"] = bool(merged[-1].get("auto_apply")) and bool(item.get("auto_apply"))
    return merged


def propose_semantic_cuts(transcript: dict) -> list[dict]:
    words = transcript["words"]
    candidates: list[dict] = []
    def clean(token: str) -> str:
        return re.sub(r"[^a-z0-9']+", "", token.lower())
    for i in range(1, len(words)):
        prev, cur = words[i-1], words[i]
        a, b = clean(prev["text"]), clean(cur["text"])
        gap = cur["start"] - prev["end"]
        if a and a == b and gap <= 0.65:
            candidates.append({"start": prev["start"], "end": prev["end"], "type": "repeat", "reason": f"Immediate repeated word: {prev['text']}", "confidence": 0.98, "auto_apply": True})
    for i, word in enumerate(words):
        token = clean(word["text"])
        if token not in FILLERS:
            continue
        left_gap = word["start"] - words[i-1]["end"] if i else word["start"]
        right_gap = words[i+1]["start"] - word["end"] if i + 1 < len(words) else transcript["duration"] - word["end"]
        if left_gap >= 0.25 and right_gap >= 0.25 and word["end"] - word["start"] <= 0.8:
            candidates.append({"start": word["start"], "end": word["end"], "type": "filler", "reason": f"Isolated filler: {word['text']}", "confidence": 0.82, "auto_apply": False})
    return merge_cuts(candidates)


def build_cut_map(transcript: dict, semantic_cuts: list[dict] | None = None, *, gap_threshold: float = 0.30,
                  boundary_pad: float = 0.02, min_fragment: float = 1.20, keep_micro_fragments: bool = False,
                  protected_terms: set[str] | None = None) -> dict:
    words = [{"index": i, **w} for i, w in enumerate(transcript["words"])]
    duration = float(transcript["duration"])
    semantic = merge_cuts(semantic_cuts or [])
    def overlaps(w, c): return w["start"] < c["end"] and w["end"] > c["start"]
    retained = [w for w in words if not any(overlaps(w,c) for c in semantic)]
    if not retained:
        raise ValueError("all words were removed")
    runs: list[list[dict]] = []
    for word in retained:
        if not runs:
            runs.append([word]); continue
        prev = runs[-1][-1]
        gap = word["start"] - prev["end"]
        semantic_between = any(c["start"] < word["start"] and c["end"] > prev["end"] for c in semantic)
        if gap > gap_threshold or semantic_between:
            runs.append([word])
        else:
            runs[-1].append(word)
    protected = {x.lower() for x in (protected_terms or DEFAULT_PROTECTED)}
    dropped, kept_runs = [], []
    for run in runs:
        span = run[-1]["end"] - run[0]["start"]
        tokens = {re.sub(r"[^a-z0-9]+", "", w["text"].lower()) for w in run}
        if span < min_fragment and not (tokens & protected) and not keep_micro_fragments:
            dropped.append({"start": run[0]["start"], "end": run[-1]["end"], "duration": round(span,3), "text": " ".join(w["text"] for w in run), "reason": f"micro-fragment under {min_fragment:.2f}s"})
        else:
            kept_runs.append(run)
    if not kept_runs:
        raise ValueError("no renderable speech remains")
    keeps=[]
    for run in kept_runs:
        start=max(0.0, run[0]["start"]-boundary_pad); end=min(duration, run[-1]["end"]+boundary_pad)
        preceding=[c["end"] for c in semantic if c["end"] <= run[0]["start"]]
        following=[c["start"] for c in semantic if c["start"] >= run[-1]["end"]]
        if preceding: start=max(start,max(preceding))
        if following: end=min(end,min(following))
        if keeps and start < keeps[-1]["end"]: start=keeps[-1]["end"]
        if end-start <= .08: continue
        keeps.append({"segment":len(keeps),"start":round(start,3),"end":round(end,3),"duration":round(end-start,3),"word_indices":[w["index"] for w in run],"text":" ".join(w["text"] for w in run)})
    cuts=[]
    cursor=0.0
    for keep in keeps:
        if keep["start"] > cursor: cuts.append({"start":round(cursor,3),"end":keep["start"],"type":"removed"})
        cursor=keep["end"]
    if cursor < duration: cuts.append({"start":round(cursor,3),"end":round(duration,3),"type":"removed"})
    return {"keeps":keeps,"cuts":cuts,"semantic_cuts":semantic,"dropped_fragments":dropped,"planned_duration":round(sum(k["duration"] for k in keeps),3)}


def write_cut_map(result: dict, output_dir: str | Path) -> Path:
    root=Path(output_dir); root.mkdir(parents=True,exist_ok=True)
    names={"keeps":"keeps_final.json","cuts":"cuts_final.json","semantic_cuts":"semantic_cuts_applied.json","dropped_fragments":"dropped_fragments.json"}
    for key,name in names.items(): (root/name).write_text(json.dumps(result[key],indent=2,ensure_ascii=False),encoding="utf-8")
    (root/"cut-map.json").write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf-8")
    return root/"cut-map.json"
