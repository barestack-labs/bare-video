# Bare Video

**An open-source toolkit for agent-directed short-form video editing.**

Website: **https://shorts.paulablaza.com**

Bare Video gives a coding agent a practical video-editing workflow: transcribe the footage, build conservative hard cuts, choose visual layouts from the meaning of each beat, generate a browser-previewable composition, then render after approval.

> Current status: **v0.5 engine build.** The prompt builder, project setup, Groq / Deepgram / faster-whisper adapters, normalized transcript schema, DeepCut-style keep-map engine, direct FFmpeg autocut renderer, layout planner, captions, synthetic SFX, reference packets, HyperFrames project generation, CLI, and media QA are implemented.

## Beginner path

The easiest starting point is the website prompt builder:

**https://shorts.paulablaza.com/create.html**

It walks through project setup, edit mode, visual style, captions, SFX, transcription, and preview/export behavior, then produces one copy-paste prompt for your coding agent.

Recommended project structure:

```text
my-video/
├── input/
│   └── video.mp4
├── references/
├── assets/
├── bare-video/
├── .env
├── runtime/
├── workspace/
└── output/
```

Keep API keys in the project-root `.env`, never in agent chat.

## Quick machine check

```bash
python scripts/doctor.py
```

Bare Video reuses existing Node, FFmpeg, Chrome/Chromium, and Python before suggesting downloads.

## Run the engine

From the Bare Video repo:

```bash
python scripts/bare_video.py run ../input/video.mp4 \
  --workspace ../workspace \
  --output ../output/autocut.mp4 \
  --provider auto \
  --style bare
```

The run command creates:

- normalized word-level transcript
- semantic cut candidates
- strict source-ordered cut map
- FFmpeg autocut
- retimed edited transcript
- beat/layout plan
- HyperFrames project
- first QA report

Then preview:

```bash
python scripts/bare_video.py hf-check ../workspace/hyperframes
python scripts/bare_video.py preview ../workspace/hyperframes
```

After approval:

```bash
python scripts/bare_video.py hf-render ../workspace/hyperframes \
  --quality delivery \
  --output ../output/final/bare-video-final.mp4
```

See `docs/ENGINE.md` and `docs/SCHEMAS.md` for the full command surface and data formats.

## Transcription

Supported adapters:

- **Groq Whisper** for fast cloud transcription.
- **Deepgram Nova-3** for cloud transcription with rich word timing.
- **faster-whisper** as an optional local fallback.

All providers normalize into the same transcript schema.

`--provider auto` uses an already-configured Groq key first, then Deepgram. It deliberately stops if neither exists rather than silently downloading a local model.

## Cuts

Bare Video borrows the strict keep-map mechanics from DeepCut:

- word gaps are cut candidates, not semantic verdicts
- default gap threshold: 0.30 s
- word-safe boundary padding: 0.02 s
- source windows must stay ordered
- no overlap or duplicate windows
- tiny fragments are filtered conservatively
- direct FFmpeg timeline rendering avoids hundreds of intermediate MP4 joins

Exact immediate repeated-word candidates may be auto-applied only when `--auto-semantic` is explicitly enabled. Other semantic candidates remain review material by default.

## Visual system

Seven layout states:

1. Face
2. Split
3. Float
4. Proof
5. Editorial
6. UI
7. Collage

The planner chooses layouts from meaning, not rotation. Real screenshots, demos, repos, and results beat decorative cards.

## References

```bash
python scripts/bare_video.py reference reference.mp4 \
  --output-dir ../workspace/reference
```

This creates a compact 4x4 contact sheet, selected scene frames, media metadata, and a reference packet so an agent can study editing grammar without repeatedly ingesting the entire video.

## Verification status

The deterministic engine has been exercised with unit tests and a real MP4 integration pass covering hard cuts, transcript retiming, layout planning, reference sampling, synthetic SFX generation, composition generation, and media decode/silence QA.

Two external boundaries still require user-environment verification:

- Cloud Groq / Deepgram calls require the user's own API key and therefore were not live-called during repository construction.
- HyperFrames project generation is implemented against the current CLI contract, but the HyperFrames package could not be fetched in the build container, so `lint/check/preview/render` still need one live run in an environment with package-network access.

## Project

Created by **Paul Martin Ablaza**.

A **Bare Stack Labs** project, released under the MIT License.
