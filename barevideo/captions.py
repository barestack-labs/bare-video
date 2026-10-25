from __future__ import annotations

import re


def build_captions(transcript: dict, *, max_words: int = 3, max_gap: float = 0.45) -> list[dict]:
    words=transcript["words"]; chunks=[]; current=[]
    for word in words:
        if current:
            gap=word["start"]-current[-1]["end"]
            prior=current[-1]["text"]
            if len(current)>=max_words or gap>max_gap or re.search(r"[.!?]$",prior):
                chunks.append(current); current=[]
        current.append(word)
    if current: chunks.append(current)
    result=[]
    for chunk in chunks:
        texts=[w["text"] for w in chunk]
        candidates=[(len(re.sub(r"\W","",t)),i) for i,t in enumerate(texts)]
        emphasis=max(candidates)[1] if candidates and max(candidates)[0]>=5 else None
        result.append({"start":round(chunk[0]["start"],3),"end":round(chunk[-1]["end"],3),"words":texts,"text":" ".join(texts),"emphasis_index":emphasis})
    return result
