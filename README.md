# Bare Video

**A video-editing skill for your coding agent.**

Bare Video is a small open-source editing guide plus a browser-only prompt builder. Your coding agent does the actual work with the video files and tools in your project.

Website and prompt builder: https://shorts.paulablaza.com/#build

## Start here

1. Create or open one project folder for the video.
2. Put the source MP4 and any references, screenshots, images, logos, or other assets in that folder.
3. Open the folder in your coding agent and point the agent to the exact video file you want edited.
4. Build a prompt on the Bare Video homepage and paste it into the agent.
5. Let the agent read the Bare Video skill before editing.

The website never needs the source video path and never uploads the media. The path belongs in the conversation with your coding agent because that agent is the thing that can actually access the project files.

One folder per video is recommended because temporary assets, transcripts, previews, and renders are then easy to remove together.

## Beginner path

Use the builder on the homepage.

It lets you choose:

- Faster Whisper, Groq, Deepgram, or an existing transcript
- Plan with me or Start editing
- one editing theme
- which visual building blocks are allowed
- visual pace
- cuts: tight, balanced, or loose
- captions
- sound design
- preview-first or one-pass output

Copy the generated prompt, paste it into your coding agent, then point the agent to the exact video file inside the project folder.

## Advanced path

Copy or clone this repo into the video project and let your coding agent read the Bare Video skill directly.

The agent can customize that local project copy if you want to experiment or adapt the boilerplate. Keep private footage paths, credentials, and project-only details out of the public repository.

There is no Bare Video engine, CLI, template runtime, or media backend.

## Editing themes

Bare Video includes five starter editing languages:

- **Product Clean:** premium product-demo language with white, black, soft gray, generous space, clean cards, controlled motion, selective accent color, and polished proof.
- **Creator Utility:** talking head plus real UI, bold captions, quick screen proof, useful labels, practical cards, and faster creator pacing.
- **Data Editorial:** strong information hierarchy with real percentages, progress, charts, counters, data cards, restrained warm or muted accents, and calmer editorial motion.
- **Tutorial Steps:** obvious step labels, screen takeovers, callouts, UI emphasis, high-contrast instructions, and minimal decoration.
- **Bare Minimal:** strong talking-head framing, black-and-white typography, simple proof, purposeful crops or zooms, and almost no decorative motion.

These themes style the same ten components:

- Talking head
- Split screen, in either order (speaker on top, or information on top)
- Full-screen proof
- Floating card
- Big card
- Stat or data card
- Step card
- Screenshot or UI card
- Multiple cards
- Green-screen layout

A theme is not a rigid template. Real reference videos, images, design systems, and direct feedback can override the starter theme.

## What the agent does

- Confirms the exact source video inside the project folder.
- Uses the transcription route you choose.
- Inspects the real footage, transcript, references, and assets.
- Plans with you first when requested, or makes a first draft when requested.
- Uses FFmpeg directly for normal media work.
- Uses HyperFrames only when composition, motion graphics, or browser preview would materially improve the edit.
- Asks before adding HyperFrames locally when it is missing.
- Does not install HyperFrames globally by default.
- Uses real proof and real assets instead of inventing them.
- Shows a preview before final export unless you explicitly request one pass.
- Checks the actual picture, audio, caption timing, duration, and A/V sync before claiming the edit works.

## What is in this repo

- .agents/skills/bare-video/SKILL.md: the portable editing guide
- AGENTS.md: instructions for coding agents working from this checkout
- index.html and assets/: the static website with the prompt builder directly on the homepage
- create.html: compatibility redirect for old builder links
- SETUP.md and docs/WORKFLOW.md: setup boundaries and direct tool examples

## Tools

FFmpeg and ffprobe handle media work.

HyperFrames is optional. It needs Node.js 22+ and a compatible Chromium browser when used for preview or rendering.

Transcription depends on the local tool or cloud provider you choose. Reuse existing installations and credentials. Ask before large downloads, paid calls, cloud uploads of private audio, or global configuration changes.

## Verification

The current homepage was exercised locally in Chromium at 1366x768 and 390x844.

Verified behavior:

- the component showcase renders every one of the ten components in all five styles
- each style has its own palette, type family, card treatment, radius, and accent
- the theme descriptions match what the frame actually shows
- the prompt builder lives directly on the homepage
- no video-path field exists in the builder
- all five editing themes are selectable
- all ten visual components can be enabled or disabled, with at least one kept active
- transcription, planning, visual pace, captions, sound, and first-output selectors update the generated prompt
- selecting Creator Utility updates the prompt with the Creator Utility tokens
- disabling Full-screen proof removes it from the allowed visual section
- the prompt tells the coding agent to fetch the skill from the repo when the file is not in the project
- the 390px mobile layout has no horizontal overflow
- create.html redirects old links to /#build
- the tested flow produced no browser console or page errors

A prior direct-tool smoke run used FFmpeg 9.0.1 and HyperFrames 0.8.195 to cut, preview, render, decode, and inspect a generated clip with speech. Creative quality on real footage still depends on the coding agent, the user's source material, and the chosen tools.

## Project

Created by **Paul Martin Ablaza**, under **Bare Stack Labs**. MIT licensed.
