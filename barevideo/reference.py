from __future__ import annotations

import json
import subprocess
from pathlib import Path

from .media import duration, probe, require


def build_reference_packet(source: str | Path, output_dir: str | Path, *, interval: float | None = None) -> dict:
    require("ffmpeg")
    source=Path(source); root=Path(output_dir); root.mkdir(parents=True,exist_ok=True)
    dur=duration(source)
    if not interval: interval=max(1.0,dur/16.0)
    contact=root/"contact-sheet.jpg"
    vf=f"fps=1/{interval:.3f},scale=320:-1,tile=4x4:padding=4:margin=4"
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(source),"-vf",vf,"-frames:v","1",str(contact)],check=True)
    scenes=root/"selected-frames"; scenes.mkdir(exist_ok=True)
    pattern=scenes/"scene-%03d.jpg"
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(source),"-vf","select='gt(scene,0.35)',scale=640:-1","-fps_mode","vfr","-frames:v","24",str(pattern)],check=True)
    frames=sorted(str(p.relative_to(root)) for p in scenes.glob("*.jpg"))
    packet={"source":str(source),"duration":dur,"probe":probe(source),"sampling_interval":interval,"contact_sheet":contact.name,"selected_frames":frames,"agent_instructions":"Inspect the contact sheet first. Inspect selected frames only as needed. Derive layout frequency, framing, caption treatment, motion cadence, graphic density, SFX density, and pacing. Do not copy protected branding or assets."}
    (root/"reference-packet.json").write_text(json.dumps(packet,indent=2),encoding="utf-8")
    return packet
