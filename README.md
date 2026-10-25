# Bare Video

**A video-editing skill for your coding agent.**

Give your agent footage, a goal, and an optional reference. It uses its judgment to make the edit with FFmpeg and HyperFrames, then shows you a preview. Bare Video supplies a reusable editing skill and a prompt builder that tells your coding agent how you want the video handled.

Website: [shorts.paulablaza.com](https://shorts.paulablaza.com/)  
Prompt builder: [create your editing prompt](https://shorts.paulablaza.com/create.html)

## Start here

1. Put your footage in a project folder. Keep the originals.
2. Open that folder in your coding agent.
3. Give it a prompt from the website, or use the short prompt below.

> Use Bare Video to edit `./input/video.mp4`. Read the skill at `.agents/skills/bare-video/SKILL.md` in https://github.com/barestack-labs/bare-video. Inspect my installed tools before downloading anything. Use your judgment for cuts, captions, visuals, and sound. Keep the original footage intact. Show me a preview before final export.

If your agent cannot read GitHub directly, have it clone this repository and read the skill locally. No Python package, server, or global skill install is required. Installing the skill in your agent's supported skill directory is optional.

## What the agent does

- Understands the footage, your goal, and any references.
- Gets a transcript when useful, using an available transcription tool or a provider you approve.
- Decides which takes, pauses, and reactions belong in the edit. A silence threshold is not an editor.
- Uses FFmpeg directly for media work and HyperFrames for compositions, previews, and rendering where appropriate.
- Checks the output and asks for feedback before final export, unless you request one-shot export.

Layouts, captions, pacing, and sound are creative choices, not a fixed checklist. A simple cut can be the right result.

## What is in this repo

- `.agents/skills/bare-video/SKILL.md`: the portable editing skill.
- `AGENTS.md`: instructions for agents working from this checkout.
- `index.html`, `create.html`, and `assets/`: a static website and browser-only prompt builder.
- `SETUP.md` and `docs/WORKFLOW.md`: tool setup and direct command examples.

The prompt builder does not upload or edit media. Your coding agent runs the tools on your machine. Cloud transcription, if you choose it, sends audio to that provider and may have costs or limits.

## Tools

FFmpeg and ffprobe handle media. HyperFrames needs Node.js 22+ and a compatible Chromium browser for preview/render. Transcription depends on the local tool or cloud provider you choose. Reuse existing installations; ask before large downloads, paid calls, or global changes.

See [setup](SETUP.md) and the [editing workflow](docs/WORKFLOW.md).

## Verification

The static pages were exercised on desktop and mobile, including preference generation, clipboard copying, draft restoration, reset, and local navigation.

A direct-tool smoke run on Windows used FFmpeg 9.0.1 to cut a generated clip with speech, then HyperFrames 0.8.195 to check, preview, and render it. The five-second MP4 decoded successfully, displayed the expected picture, and preserved the edited audio. This checks the native tool path that the Bare Video skill asks agents to use.

Live transcription and the creative quality of edits on your own footage still depend on your agent and chosen tools. No cloud transcription was called during that smoke run.

## Project

Created by **Paul Martin Ablaza**, under **Bare Stack Labs**. MIT licensed.

The website's Archivo and Courier Prime fonts retain their SIL Open Font License notices in `assets/fonts/`.
