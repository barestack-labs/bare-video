from __future__ import annotations

from pathlib import Path


def init_project(root: str | Path, *, repo_dir: str = "bare-video") -> Path:
    root=Path(root); root.mkdir(parents=True,exist_ok=True)
    for name in ["input","references","assets","runtime","workspace/transcript","workspace/cut-map","workspace/hyperframes","output/preview","output/final"]:
        (root/name).mkdir(parents=True,exist_ok=True)
    env=root/".env"
    if not env.exists(): env.write_text("GROQ_API_KEY=\nDEEPGRAM_API_KEY=\n",encoding="utf-8")
    gi=root/".gitignore"
    if not gi.exists(): gi.write_text(".env\nruntime/\nworkspace/\noutput/\n",encoding="utf-8")
    return root
