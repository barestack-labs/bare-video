# Bare Video

**An open-source toolkit for agent-directed short-form video editing.**

Website: **https://shorts.paulablaza.com**

Bare Video is being built around a simple workflow: give a coding agent a raw video, let it transcribe and plan the edit, build the visual beats, preview the result in a browser, then export after approval.

> Current status: **early build.** The landing page, seven layout prototypes, layout registry, SFX mapping, setup rules, and machine doctor are implemented. ASR adapters, cut planning, DeepCut integration, and HyperFrames render orchestration are next.

## Quick start

Put this repo inside a video project and tell your coding agent:

```text
Set up this Bare Video repo inside this project folder.

My video is:
./input/video.mp4

Reuse tools already installed on my computer.
Keep new downloads project-local unless I explicitly ask for a global install.
Plan the edit with me unless I explicitly ask for one-shot mode.
Open the preview before final export.
```

## Layouts

Bare Video currently defines seven reusable layout states:

1. Face
2. Split
3. Float
4. Proof
5. Editorial
6. UI
7. Collage

The agent should choose layouts by meaning, not rotate them for variety.

## Setup

Run:

```bash
python scripts/doctor.py
```

Bare Video should reuse existing Node, FFmpeg, Chrome/Chromium, and Python before downloading anything. Cloud transcription will be preferred when configured; faster-whisper is planned as the local fallback.

## Planned pipeline

```text
raw video
  -> transcription
  -> cut candidates
  -> semantic cut plan
  -> layout plan
  -> HyperFrames preview
  -> user approval
  -> final render
  -> QA
```

## Project

Created by **Paul Martin Ablaza**.

A **Bare Stack Labs** project, released under the MIT License.
