from __future__ import annotations

from .schema import make_transcript


def validate_keeps(keeps: list[dict]) -> None:
    if not keeps:
        raise ValueError("keep map is empty")
    previous_end=-1.0; seen=set()
    for i,k in enumerate(keeps):
        start,end=float(k["start"]),float(k["end"])
        if end <= start: raise ValueError(f"invalid keep segment {i}")
        key=(round(start,4),round(end,4))
        if key in seen: raise ValueError("duplicate source window")
        if start < previous_end: raise ValueError("overlapping or out-of-order keep windows")
        seen.add(key); previous_end=end


def retime_transcript(transcript: dict, keeps: list[dict]) -> dict:
    validate_keeps(keeps)
    words=[]; segments=[]; offset=0.0
    for keep in keeps:
        ks,ke=float(keep["start"]),float(keep["end"])
        start_index=len(words)
        for w in transcript["words"]:
            if w["start"] >= ks and w["end"] <= ke:
                words.append({**w,"start":offset+(w["start"]-ks),"end":offset+(w["end"]-ks)})
        seg_words=words[start_index:]
        if seg_words:
            segments.append({"start":seg_words[0]["start"],"end":seg_words[-1]["end"],"text":" ".join(w["text"] for w in seg_words)})
        offset += ke-ks
    return make_transcript(provider=transcript["provider"],model=transcript["model"],language=transcript.get("language"),source=transcript.get("source"),duration=offset,text=" ".join(w["text"] for w in words),words=words,segments=segments)
