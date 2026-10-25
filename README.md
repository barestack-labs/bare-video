# Bare Video

**A video-editing skill for your coding agent.**

Give your agent footage, choose how speech should be transcribed, plan the edit together if you want, and let the agent use FFmpeg plus optional HyperFrames to build a preview. Bare Video supplies a reusable editing skill and a prompt builder that turns your design choices into one clear handoff.

Website: [shorts.paulablaza.com](https://shorts.paulablaza.com/)  
Prompt builder: [create your editing prompt](https://shorts.paulablaza.com/create.html)

## Start here

1. Put your footage in a project folder. Keep the originals.
2. Open that folder in your coding agent.
3. Give it a prompt from the website, or use the short prompt below.

> Use Bare Video to edit the video path I give you. Read the skill in https://github.com/barestack-labs/bare-video. Use my chosen transcription route, then plan the short with me before the heavy build. Inspect installed tools before downloading anything. Use FFmpeg directly, and only ask to add HyperFrames locally to this video project if the plan genuinely needs it. Keep the original footage intact and show me a preview before final export.

If your agent cannot read GitHub directly, have it clone this repository and read the skill locally. No Python package, server, or global skill install is required. Installing the skill in your agent's supported skill directory is optional.

## What the agent does

- Understands the footage, your goal, and any references.
- Uses the transcription route you choose: Faster Whisper, Groq, Deepgram, or an existing verified transcript.
- Decides which takes, pauses, and reactions belong in the edit. A silence threshold is not an editor.
- Uses FFmpeg directly for media work. HyperFrames is optional and is considered after transcription and planning; if it would help and is missing, the agent asks before adding it locally to the video project.
- Checks the output and asks for feedback before final export, unless you request one-shot export.

Layouts, captions, pacing, and sound are creative choices, not a fixed checklist. A simple cut can be the right result.

## Design ownership

Bare Video includes starter choices for visual pace, captions, sound, and four caption/overlay themes: Mono, Graphite, Plain, and Orange. They are defaults, not a house style. Your approved colors, typography, reference videos, pacing, and feedback override them.

For active short-form pacing, the agent tries to give most meaningful phrases a useful visible response without changing something mechanically on every word.

## Inspiration

Bare Video was informed by the agent-guided editing ideas in [Nate Herk's Herk Edit Kit](https://github.com/nateherkai/herk-edit-kit), especially transcript-first editing, planning before heavy composition, preview-and-feedback loops, and preserving reusable editing lessons. Bare Video is an independent skill-first project and does not bundle Herk Edit Kit templates, cards, scripts, or runtime.

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

The static pages were exercised on desktop and mobile. The landing-page phone demo was scrolled through Face-first, Split-screen, Light overlays, and Full-screen proof in order. The six-step builder was checked at 1366×768 and 1440×900 with no page scrolling or nested scroll areas, and at 390×844 with normal vertical scrolling and no horizontal overflow. Path validation, mobile step scroll reset, all four transcription choices, both planning modes, strict visual subsets, all three visual-pacing choices, all four themes, all four sound levels, prompt generation, result display, and reset were exercised without browser console errors.

A direct-tool smoke run on Windows used FFmpeg 9.0.1 to cut a generated clip with speech, then HyperFrames 0.8.195 to check, preview, and render it. The five-second MP4 decoded successfully, displayed the expected picture, and preserved the edited audio. This checks the native tool path that the Bare Video skill asks agents to use.

Live transcription and the creative quality of edits on your own footage still depend on your agent and chosen tools. No cloud transcription was called during that smoke run.

## Project

Created by **Paul Martin Ablaza**, under **Bare Stack Labs**. MIT licensed.

The website's Archivo and Courier Prime fonts retain their SIL Open Font License notices in `assets/fonts/`.
