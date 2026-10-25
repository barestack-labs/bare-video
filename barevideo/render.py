from __future__ import annotations

import json
import subprocess
from pathlib import Path

from .media import require
from .retime import validate_keeps


def render_keep_map(source: str | Path, keeps: list[dict], output: str | Path, *, crf: int = 21, preset: str = "veryfast") -> Path:
    require("ffmpeg"); validate_keeps(keeps)
    source=Path(source); output=Path(output); output.parent.mkdir(parents=True,exist_ok=True)
    filter_path=output.with_suffix(".filter.txt")
    lines=[]; vs=[]; aas=[]
    for i,k in enumerate(keeps):
        start,end=float(k["start"]),float(k["end"])
        lines.append(f"[0:v]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS[v{i}]")
        lines.append(f"[0:a]atrim=start={start:.3f}:end={end:.3f},asetpts=PTS-STARTPTS[a{i}]")
        vs.append(f"[v{i}]"); aas.append(f"[a{i}]")
    lines.append("".join(vs)+f"concat=n={len(keeps)}:v=1:a=0[vout]")
    lines.append("".join(aas)+f"concat=n={len(keeps)}:v=0:a=1[aout]")
    filter_path.write_text(";\n".join(lines)+"\n",encoding="utf-8")
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(source),"-filter_complex_script",str(filter_path),"-map","[vout]","-map","[aout]","-c:v","libx264","-crf",str(crf),"-preset",preset,"-pix_fmt","yuv420p","-c:a","aac","-b:a","160k","-movflags","+faststart",str(output)]
    subprocess.run(cmd,check=True)
    return output


def load_keeps(path: str | Path) -> list[dict]:
    data=json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data,dict): data=data.get("keeps",[])
    if not isinstance(data,list): raise ValueError("keep map must be an array or cut-map object")
    validate_keeps(data); return data
