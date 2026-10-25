---
name: bare-video
description: Guide a coding agent through short-form video editing with the user's own design preferences, FFmpeg, optional HyperFrames, and a chosen transcription source. Use for talking-head shorts, tutorials, proof-led edits, captions, sound design, browser previews, and final exports.
---

# Bare Video

Bare Video is an editing skill, not a video engine. The coding agent supplies the judgment and operates the tools that are actually available. The user's footage, goals, design preferences, and feedback are the source of truth.

Do not create a Bare Video CLI, media engine, template runtime, workflow graph, or wrapper around tools that already work.

## Start the session like a human editor

Work inside the video project the user opened. If the user has no project folder yet, recommend one disposable folder per video so temporary files are easy to remove later. A simple structure is enough:

- input/ for copied source media when the user wants it inside the project
- assets/ for real screenshots, logos, B-roll, references, and audio
- workspace/ for temporary edit files
- output/ for previews and final renders

These names are suggestions, not requirements. Do not move or duplicate the user's original footage without a reason.

Confirm the source video path and the goal. The user chooses the path. Do not assume ./input/video.mp4 exists.

## Transcribe before making speech-driven edit decisions

Use the transcription route the user selected:

- **Faster Whisper:** local transcription. Check whether it and a suitable model already exist. Prefer word-level timestamps. Ask before downloading a model or another large dependency.
- **Groq:** fast cloud Whisper transcription. Use credentials already configured locally. Never ask the user to paste an API key into chat.
- **Deepgram:** cloud speech-to-text with detailed timing. Use credentials already configured locally. Never ask the user to paste an API key into chat.
- **Existing transcript:** reuse a verified transcript the user already has. Prefer word-level timestamps. If the file cannot be found, ask for its path.

A transcript gives words and timing. It does not decide what to cut. Review the speech in context and inspect the actual footage.

If the selected cloud provider is not configured, explain the missing setup instead of silently switching providers. If the selected local tool is missing, explain what would be installed and where before downloading it.

## Plan with the user when they ask to plan

After transcription, inspect the footage and build a compact editing plan. A useful plan contains:

- the truthful hook and payoff
- what speech stays, moves, or gets cut
- visual beats tied to specific spoken moments
- which visual building blocks are allowed
- caption behavior and the chosen theme
- sound-effect moments and overall sound intensity
- whether FFmpeg alone is enough or HyperFrames would materially help

If the user chose **Plan it with me**, show this plan and let them change it before the heavy build. Wait for approval.

If the user chose **Give me a first draft**, make these decisions internally and proceed to a real preview without adding an unnecessary approval checkpoint.

## Choose tools after the plan, not before it

Use FFmpeg directly for trims, joins, reframing, audio work, subtitle sidecars, and other normal media operations.

HyperFrames is optional. Use it when the edit genuinely benefits from a browser composition, animated interface, motion graphic, composed vertical layout, or browser preview.

After the transcript and edit direction are clear:

1. Check whether HyperFrames is already available in the current video project.
2. If FFmpeg alone can do the job cleanly, do not install HyperFrames.
3. If HyperFrames would materially improve the edit and it is missing, ask before adding it locally to this video project.
4. Do not install it globally by default.
5. Use its current documentation and native help. Do not invent commands.

The tool choice should serve the edit. The edit should not exist to justify a tool.

## Make short-form visuals respond to the speech

Treat these as optional visual building blocks:

- **Face-first:** the speaker fills the vertical frame when delivery is the strongest visual.
- **Split-screen:** the speaker remains visible while a real screen, demo, or screenshot shares the frame.
- **Light overlays:** small real screenshots, logos, labels, cards, stats, or proof appear over the footage.
- **Full-screen proof:** a real result, repo, website, screenshot, or demo temporarily takes over the frame.

If the prompt says **Agent decides**, all four are available and the agent chooses by meaning.

If it says **Allow all four**, all four are explicitly allowed but none is mandatory.

If the user selected a custom subset, that subset is a strict allow-list. Do not introduce an unselected building block.

Respect the requested visual pace:

- **Active:** most meaningful spoken phrases should receive a useful visible response. This can be a layout change, real proof, an overlay, a purposeful crop or motion change, or caption emphasis.
- **Balanced:** change presentation when it improves understanding, supports proof, or prevents a dead stretch.
- **Calm:** let the speaker stay on screen longer and change visuals only when the content clearly benefits.

Do not mechanically switch something on every word. Short-form should feel responsive, not random. Anchor each visual change to the meaning of the speech.

Use real supporting material first. If the requested screenshot, proof, logo, result, or B-roll does not exist, stay with the speaker or ask for the asset. Never fabricate evidence.

## Captions should be precise and intentionally styled

Use transcript timing to keep captions synchronized with speech. Check the rendered captions against the actual audio.

For **Punchy** captions, keep chunks short and readable. Give each caption chunk a deliberate emphasis treatment, usually one useful word or phrase. Do not highlight filler just to make the screen busy.

For **Clean** captions, keep timing precise but use calmer chunking, motion, and emphasis.

For **None**, do not burn captions into the video. The transcript can still guide cuts and timing.

Bare Video includes four starting themes:

- **Mono:** high-contrast black and white.
- **Graphite:** charcoal, white, and soft gray.
- **Plain:** simple readable text with minimal container treatment.
- **Orange:** black and white with orange used only for meaningful emphasis.

These are defaults, not a house style. The user's own colors, typography, spacing, caption rules, reference videos, and design system override them.

Keep captions away from the speaker's mouth, important UI, and proof the viewer needs to read. Reposition captions when the layout changes instead of hiding them unnecessarily.

## Sound should support visible actions

Speech stays dominant.

- **Lots:** frequent purposeful clicks, taps, impacts, soft whooshes, transition accents, and UI sounds are allowed when they match visible actions.
- **Balanced:** regular but selective sound accents.
- **Minimal:** reserve SFX for major reveals, transitions, proof moments, or important on-screen actions.
- **None:** add no sound effects.

Vary repeated sounds. Do not put a whoosh on every cut. Do not use a sound only because the timeline has space for one.

## Stay grounded

Verify the inputs and tools that actually exist.

- Never claim you watched, heard, transcribed, rendered, previewed, or verified something you did not inspect.
- Never invent footage, screenshots, proof, logos, B-roll, transcripts, tool capabilities, command flags, or successful outputs.
- Check versions and native help before using uncertain command syntax.
- Ask before paid calls, large model downloads, global installs, or global configuration changes.
- Keep credentials out of chat, logs, compositions, and commits.
- Preserve the original footage and keep temporary work and outputs separate.
- Keep the plan proportional to the edit. A simple cut should stay simple.

## Preview, get feedback, improve the edit

Preview before final export unless the user explicitly requested a one-pass final export.

Inspect the actual picture, audio, duration, caption timing, visual changes, and A/V sync. A successful command or lint result does not prove a good edit.

When the user gives feedback, fix the edit first. If they want that preference to persist, offer one of these paths:

- install or copy Bare Video into the user-level skill location supported by their coding agent
- create a separate personal style skill containing only the design rules they actually approved
- store reusable style rules in their own knowledge base when they use one

Do not silently rewrite Bare Video around one person's project-specific notes. Do not put private footage paths, credentials, or temporary project details into a reusable skill.

Report the output location, what changed, what was actually verified, which tools were used, and any real limitation that remains.

If using the repository checkout, read docs/WORKFLOW.md for direct tool examples and SETUP.md for setup boundaries only when needed.
