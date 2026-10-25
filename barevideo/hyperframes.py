from __future__ import annotations

import html
import json
import shutil
import subprocess
from pathlib import Path

from .captions import build_captions
from .sfx import generate_sfx, sfx_for_layout


def _clip_attrs(start: float, end: float, track: int) -> str:
    return f'data-start="{start:.3f}" data-duration="{max(0.01,end-start):.3f}" data-track-index="{track}"'


def _layout_html(beat: dict, copied_assets: dict[str,str]) -> str:
    start,end=float(beat["start"]),float(beat["end"]); layout=beat.get("layout","face"); text=html.escape(beat.get("text","")[:160])
    asset=beat.get("asset"); asset_url=copied_assets.get(str(asset)) if asset else None
    attrs=_clip_attrs(start,end,2)
    if layout=="face": return ""
    if layout=="editorial": return f'<section class="beat editorial" {attrs}><small>BARE VIDEO</small><strong>{text}</strong></section>'
    if layout=="ui": return f'<section class="beat ui" {attrs}><div class="terminal"><span>agent · edit</span><code>&gt; {text}</code></div></section>'
    if layout=="float": return f'<section class="beat float" {attrs}><div class="float-card">{text}</div></section>'
    if layout=="proof":
        if asset_url: return f'<section class="beat proof" {attrs}><img src="{html.escape(asset_url)}"></section>'
        return f'<section class="beat proof placeholder" {attrs}><small>PROOF</small><strong>{text}</strong></section>'
    if layout=="split":
        inner=f'<img src="{html.escape(asset_url)}">' if asset_url else f'<div class="split-copy">{text}</div>'
        return f'<section class="beat split" {attrs}><div class="split-top">{inner}</div></section>'
    if layout=="collage": return f'<section class="beat collage" {attrs}><i></i><i></i><i></i><strong>{text}</strong></section>'
    return ""


def build_project(video: str | Path, transcript: dict, plan: dict, output_dir: str | Path, *, width: int = 1080, height: int = 1920, fps: int = 30, sfx_level: str = "restrained") -> Path:
    video=Path(video); root=Path(output_dir); assets=root/"assets"; assets.mkdir(parents=True,exist_ok=True)
    source=assets/("source"+video.suffix.lower()); shutil.copy2(video,source)
    copied={}
    for beat in plan.get("beats",[]):
        asset=beat.get("asset")
        if asset and Path(asset).is_file():
            src=Path(asset); dest=assets/f"beat-{beat['id']}{src.suffix.lower()}"; shutil.copy2(src,dest); copied[str(asset)]=f"./assets/{dest.name}"
    captions=build_captions(transcript)
    sfx=generate_sfx(assets/"sfx") if sfx_level != "none" else {}
    sfx_html=[]
    for beat in plan.get("beats",[]):
        name=sfx_for_layout(beat.get("layout","face"),sfx_level)
        if name and name in sfx:
            item=sfx[name]
            rel=f"./assets/sfx/{item['path'].name}"
            sfx_html.append(f'<audio src="{rel}" data-start="{float(beat["start"]):.3f}" data-duration="{item["duration"]:.3f}" data-track-index="10" data-volume="0.22"></audio>')
    caption_html=[]
    for c in captions:
        words=[]
        for j,w in enumerate(c["words"]):
            cls=' class="em"' if j==c["emphasis_index"] else ""
            words.append(f"<span{cls}>{html.escape(w)}</span>")
        caption_html.append(f'<div class="caption" {_clip_attrs(c["start"],c["end"],5)}>{" ".join(words)}</div>')
    beat_html="\n".join(_layout_html(b,copied) for b in plan.get("beats",[]))
    duration=float(transcript["duration"])
    doc=f'''<!doctype html><html><head><meta charset="utf-8"><style>
*{{box-sizing:border-box}}html,body{{margin:0;background:#111;font-family:Inter,Arial,sans-serif}}#stage{{position:relative;overflow:hidden;background:#111;color:#fff}}.source{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}.beat{{position:absolute;inset:0;z-index:2}}.editorial{{background:#f3f0e8;color:#111;padding:120px 90px;display:flex;flex-direction:column;justify-content:center}}.editorial small{{font:700 22px monospace;letter-spacing:.12em}}.editorial strong{{font-size:100px;line-height:.9;letter-spacing:-.06em;margin-top:30px}}.ui{{display:flex;align-items:center;justify-content:center;background:#151715}}.terminal{{width:84%;background:#202420;border:2px solid #40443e;padding:55px}}.terminal span{{color:#aaa;font:22px monospace}}.terminal code{{display:block;color:#eee;font:700 35px/1.5 monospace;margin-top:35px}}.float-card{{position:absolute;left:8%;right:8%;top:8%;background:#fff;color:#111;border:2px solid #bbb;padding:38px;font-size:42px;font-weight:800}}.proof{{background:#d8d2c8;display:grid;place-items:center;padding:55px}}.proof img{{max-width:94%;max-height:88%;object-fit:contain;box-shadow:0 25px 70px #0003}}.proof.placeholder{{color:#111;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}}.proof.placeholder small{{font:700 20px monospace}}.proof.placeholder strong{{font-size:80px;line-height:.9;max-width:900px;margin-top:30px}}.split-top{{position:absolute;left:0;right:0;top:0;height:52%;background:#171917;display:grid;place-items:center;overflow:hidden}}.split-top img{{width:100%;height:100%;object-fit:contain}}.split-copy{{padding:60px;font-size:58px;font-weight:850;line-height:.95}}.collage{{background:#d7d0c5}}.collage i{{position:absolute;background:#f7f3e9;border:2px solid #999}}.collage i:nth-child(1){{left:6%;top:8%;width:40%;height:30%}}.collage i:nth-child(2){{right:6%;top:13%;width:40%;height:25%;background:#202220}}.collage i:nth-child(3){{left:13%;bottom:10%;width:74%;height:34%}}.collage strong{{position:absolute;left:8%;right:8%;top:46%;background:#e8d652;color:#111;padding:22px;text-align:center;font-size:52px;z-index:3}}.caption{{position:absolute;z-index:8;left:7%;right:7%;bottom:17%;text-align:center;font-size:58px;line-height:.95;font-weight:950;text-transform:uppercase;text-shadow:0 4px 0 #000,0 0 18px #0008}}.caption .em{{color:#e8d652}}</style></head><body><div id="stage" data-composition-id="bare-video" data-start="0" data-duration="{duration:.3f}" data-width="{width}" data-height="{height}" data-fps="{fps}"><video class="source" src="./assets/{source.name}" {_clip_attrs(0,duration,0)} playsinline></video>{beat_html}{''.join(caption_html)}{''.join(sfx_html)}</div></body></html>'''
    (root/"index.html").write_text(doc,encoding="utf-8")
    (root/"plan.json").write_text(json.dumps(plan,indent=2,ensure_ascii=False),encoding="utf-8")
    (root/"captions.json").write_text(json.dumps(captions,indent=2,ensure_ascii=False),encoding="utf-8")
    return root


def hf(command: str, project: str | Path, extra: list[str] | None = None) -> int:
    args=["npx","--yes","hyperframes",command]
    if str(project) not in {".",""}: args.append(str(project))
    args += extra or []
    return subprocess.run(args).returncode
