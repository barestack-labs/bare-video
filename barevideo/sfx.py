from __future__ import annotations

import subprocess
from pathlib import Path

from .media import require

SPECS = {
    "whoosh-soft": (0.26, "anoisesrc=color=pink:duration=0.26,highpass=f=600,lowpass=f=5000,afade=t=in:st=0:d=0.05,afade=t=out:st=0.12:d=0.14,volume=0.28"),
    "pop-soft": (0.12, "sine=frequency=720:duration=0.12,afade=t=out:st=0.04:d=0.08,volume=0.24"),
    "click-soft": (0.07, "sine=frequency=1450:duration=0.07,afade=t=out:st=0.02:d=0.05,volume=0.18"),
    "impact-light": (0.22, "sine=frequency=105:duration=0.22,afade=t=out:st=0.04:d=0.18,volume=0.30"),
    "impact-medium": (0.30, "sine=frequency=78:duration=0.30,afade=t=out:st=0.05:d=0.25,volume=0.36"),
    "whoosh-short": (0.18, "anoisesrc=color=pink:duration=0.18,highpass=f=900,lowpass=f=6500,afade=t=in:st=0:d=0.03,afade=t=out:st=0.08:d=0.10,volume=0.24"),
}

LAYOUT_SFX = {"split":"whoosh-soft","float":"pop-soft","proof":"impact-light","editorial":"impact-medium","ui":"click-soft","collage":"whoosh-short"}


def generate_sfx(output_dir: str | Path) -> dict[str, dict]:
    require("ffmpeg")
    root=Path(output_dir); root.mkdir(parents=True,exist_ok=True)
    result={}
    for name,(duration,lavfi) in SPECS.items():
        path=root/f"{name}.wav"
        if not path.exists():
            subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","lavfi","-i",lavfi,"-ar","48000","-ac","2",str(path)],check=True)
        result[name]={"path":path,"duration":duration}
    return result


def sfx_for_layout(layout: str, level: str = "restrained") -> str | None:
    if level == "none": return None
    name=LAYOUT_SFX.get(layout)
    if level == "minimal" and layout not in {"proof","editorial","collage"}: return None
    return name
