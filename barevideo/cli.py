from __future__ import annotations

import argparse
import json
from pathlib import Path

from . import __version__
from .asr import transcribe
from .cut import build_cut_map, propose_semantic_cuts, write_cut_map
from .hyperframes import build_project, hf
from .planner import build_plan
from .project import init_project
from .qa import write_qa, transcript_similarity
from .reference import build_reference_packet
from .render import load_keeps, render_keep_map
from .retime import retime_transcript
from .schema import load_transcript, save_transcript


def dump(data, path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def main(argv=None):
    p = argparse.ArgumentParser(prog="bare-video", description="Bare Video local-first agent video pipeline")
    p.add_argument("--version", action="version", version=__version__)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("init")
    s.add_argument("directory", nargs="?", default=".")

    s = sub.add_parser("transcribe")
    s.add_argument("input")
    s.add_argument("--output", required=True)
    s.add_argument("--provider", choices=["auto", "groq", "deepgram", "local"], default="auto")
    s.add_argument("--language")
    s.add_argument("--model")

    s = sub.add_parser("semantic-candidates")
    s.add_argument("transcript")
    s.add_argument("--output", required=True)

    s = sub.add_parser("cut-map")
    s.add_argument("transcript")
    s.add_argument("--semantic-cuts")
    s.add_argument("--auto-semantic", action="store_true")
    s.add_argument("--output-dir", required=True)
    s.add_argument("--gap-threshold", type=float, default=.30)
    s.add_argument("--keep-micro-fragments", action="store_true")

    s = sub.add_parser("autocut")
    s.add_argument("input")
    s.add_argument("--keeps", required=True)
    s.add_argument("--output", required=True)

    s = sub.add_parser("plan")
    s.add_argument("transcript")
    s.add_argument("--style", default="bare")
    s.add_argument("--assets-dir")
    s.add_argument("--output", required=True)

    s = sub.add_parser("reference")
    s.add_argument("input")
    s.add_argument("--output-dir", required=True)

    s = sub.add_parser("compose")
    s.add_argument("video")
    s.add_argument("--transcript", required=True)
    s.add_argument("--plan", required=True)
    s.add_argument("--output-dir", required=True)
    s.add_argument("--width", type=int, default=1080)
    s.add_argument("--height", type=int, default=1920)
    s.add_argument("--fps", type=int, default=30)
    s.add_argument("--sfx", choices=["restrained", "minimal", "none"], default="restrained")

    s = sub.add_parser("preview")
    s.add_argument("project")

    s = sub.add_parser("hf-check")
    s.add_argument("project")

    s = sub.add_parser("hf-render")
    s.add_argument("project")
    s.add_argument("--output", required=True)
    s.add_argument("--quality", default="looks")

    s = sub.add_parser("qa")
    s.add_argument("video")
    s.add_argument("--output", required=True)
    s.add_argument("--provider", choices=["groq", "deepgram", "local"])
    s.add_argument("--expected-transcript")
    s.add_argument("--transcript-output")

    s = sub.add_parser("run")
    s.add_argument("input")
    s.add_argument("--workspace", default="workspace")
    s.add_argument("--output", default="output/autocut.mp4")
    s.add_argument("--provider", choices=["auto", "groq", "deepgram", "local"], default="auto")
    s.add_argument("--language")
    s.add_argument("--style", default="bare")
    s.add_argument("--auto-semantic", action="store_true")
    s.add_argument("--preview", action="store_true")

    a = p.parse_args(argv)

    if a.cmd == "init":
        print(init_project(a.directory))
        return

    if a.cmd == "transcribe":
        print(save_transcript(transcribe(a.input, a.output, provider=a.provider, language=a.language, model=a.model), a.output))
        return

    if a.cmd == "semantic-candidates":
        dump(propose_semantic_cuts(load_transcript(a.transcript)), a.output)
        print(a.output)
        return

    if a.cmd == "cut-map":
        t = load_transcript(a.transcript)
        cuts = []
        if a.semantic_cuts:
            cuts = json.loads(Path(a.semantic_cuts).read_text(encoding="utf-8"))
        if a.auto_semantic:
            cuts += [c for c in propose_semantic_cuts(t) if c.get("auto_apply")]
        result = build_cut_map(t, cuts, gap_threshold=a.gap_threshold, keep_micro_fragments=a.keep_micro_fragments)
        print(write_cut_map(result, a.output_dir))
        return

    if a.cmd == "autocut":
        print(render_keep_map(a.input, load_keeps(a.keeps), a.output))
        return

    if a.cmd == "plan":
        assets = []
        if a.assets_dir:
            assets = [str(x) for x in sorted(Path(a.assets_dir).glob("*")) if x.is_file()]
        dump(build_plan(load_transcript(a.transcript), style=a.style, assets=assets), a.output)
        print(a.output)
        return

    if a.cmd == "reference":
        build_reference_packet(a.input, a.output_dir)
        print(Path(a.output_dir) / "reference-packet.json")
        return

    if a.cmd == "compose":
        t = load_transcript(a.transcript)
        plan = json.loads(Path(a.plan).read_text(encoding="utf-8"))
        print(build_project(a.video, t, plan, a.output_dir, width=a.width, height=a.height, fps=a.fps, sfx_level=a.sfx))
        return

    if a.cmd == "preview":
        raise SystemExit(hf("preview", a.project))

    if a.cmd == "hf-check":
        code = hf("lint", a.project)
        code = code or hf("check", a.project)
        raise SystemExit(code)

    if a.cmd == "hf-render":
        raise SystemExit(hf("render", a.project, ["--quality", a.quality, "--output", a.output]))

    if a.cmd == "qa":
        result = write_qa(a.video, a.output)
        if a.provider:
            txout = a.transcript_output or str(Path(a.output).with_name("final-transcript.json"))
            final = transcribe(a.video, txout, provider=a.provider)
            result["final_transcript"] = txout
            if a.expected_transcript:
                result["transcript_similarity"] = transcript_similarity(load_transcript(a.expected_transcript), final)
            Path(a.output).write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result, indent=2))
        return

    if a.cmd == "run":
        w = Path(a.workspace)
        (w / "transcript").mkdir(parents=True, exist_ok=True)
        (w / "cut-map").mkdir(parents=True, exist_ok=True)
        raw = w / "transcript" / "raw.json"
        transcribe(a.input, raw, provider=a.provider, language=a.language)
        t = load_transcript(raw)
        candidates = propose_semantic_cuts(t)
        dump(candidates, w / "semantic-candidates.json")
        semantic = [c for c in candidates if c.get("auto_apply")] if a.auto_semantic else []
        cut_map = build_cut_map(t, semantic)
        write_cut_map(cut_map, w / "cut-map")
        render_keep_map(a.input, cut_map["keeps"], a.output)
        retimed = retime_transcript(t, cut_map["keeps"])
        edited_t = w / "transcript" / "edited.json"
        save_transcript(retimed, edited_t)
        plan = build_plan(retimed, style=a.style)
        plan_path = w / "edit-plan.json"
        dump(plan, plan_path)
        project = build_project(a.output, retimed, plan, w / "hyperframes")
        write_qa(a.output, w / "qa-autocut.json")
        print(json.dumps({
            "autocut": a.output,
            "transcript": str(edited_t),
            "plan": str(plan_path),
            "hyperframes": str(project),
            "next": "npx hyperframes preview " + str(project),
        }, indent=2))
        if a.preview:
            raise SystemExit(hf("preview", project))


if __name__ == "__main__":
    main()
