# Bare Video

**Give your coding agent a raw video. Plan the edit, preview it, then export.**

Bare Video is an opinionated, local-first video-editing repo for coding agents. It is being built for people who want a dynamic short-form edit without committing to one expensive agent, one cloud service, or one giant editor installation.

> Current status: **v0.1 design-first scaffold.** The landing page, seven layout prototypes, layout registry, SFX mapping, setup philosophy, and cross-platform machine doctor are implemented. ASR adapters, DeepCut integration, and HyperFrames render orchestration are next.

## Quick start for a beginner

Create one folder for your video project, put this repo inside it, then tell your coding agent:

```text
Set up this Bare Video repo inside this project folder.

My video is:
./input/video.mp4

Use the recommended defaults. Reuse tools already installed on my computer.
Keep new downloads project-local unless I explicitly ask for a global install.
Plan the edit with me unless I explicitly ask for one-shot mode.
Open the preview before final export.
```

If you only want an explanation first:

```text
Read this repo and explain how Bare Video works before installing anything.
```

## Design language

The first visual system is **Bare Default**: warm, minimal, editorial and Apple-inspired without copying Apple's assets or interface. The system uses seven layout states:

1. Face
2. Split
3. Float
4. Proof
5. Editorial
6. UI
7. Collage

Open `index.html` to see the landing page and layout gallery. Each layout is also a standalone file in `templates/`.

## Setup philosophy

Bare Video is not globally installed by default.

- Reuse Node / FFmpeg / Chrome / Python if already present.
- Keep missing tools project-local when practical.
- Ask before credentials, paid services and large downloads.
- Cloud transcription will be preferred when configured.
- Local transcription remains an option for users who do not want cloud setup.

Run the current machine check:

```bash
python scripts/doctor.py
```

## Planned pipeline

```text
raw video
  -> transcription (Groq / Deepgram / local)
  -> normalized word timings
  -> semantic cut planning + strict keep map
  -> cheap visual review packet
  -> beat + layout plan
  -> HyperFrames composition
  -> browser preview
  -> user approval
  -> final render
  -> ASR + media QA
```

## Credits

Created by **Paul Martin Ablaza** under **Bare Stack Labs**.

Bare Video is released under the MIT License. Third-party tools and assets keep their own licenses.
