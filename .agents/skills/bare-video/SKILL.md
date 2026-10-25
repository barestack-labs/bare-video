---
name: bare-video
description: Edit videos with a coding agent using FFmpeg and HyperFrames. Use for footage cleanup, captions, supporting visuals, reference-led edits, local setup, browser previews, and final exports. The agent supplies the creative judgment; Bare Video supplies guidance.
---

# Bare Video

Turn the user's footage into an edit that serves their intent. This is guidance, not a recipe. Use your judgment, the actual footage, and the user's taste. There is no Bare Video engine or CLI to install.

## Start with what is there

Find the source footage, the desired outcome, and any references. Inspect the media with ffprobe and sample useful frames or sections. Reuse installed FFmpeg, HyperFrames, and transcription tools. Check versions and native command help before inventing syntax or adding dependencies.

If a transcript would help, use an existing transcript, a configured tool, or an approved provider. Do not pretend to understand unheard speech. If transcription needs credentials or a model download, explain that boundary and finish what you can without it.

Use an existing workspace as it is. For a new project, `input/`, `assets/`, `workspace/`, and `output/` are enough; add other folders only when needed. Keep the user's originals separate from outputs.

## Make the edit

- Judge cuts from meaning and delivery. Keep useful pauses, reactions, emphasis, and personality. Short speech and repeated words may be intentional.
- Start with the footage. Add captions, a screenshot, a split view, or a designed scene when it helps. No required layout rotation or caption length.
- Use references for editing language: pacing, framing, motion, density, captions, and sound. Do not copy protected branding or assets without rights.
- Prefer real supporting material. If evidence is missing, stay with the speaker or ask for the asset rather than inventing proof.
- Let sound support the edit without competing with speech. Quiet is a valid choice.
- Respect explicit choices in a website-generated prompt. They are user preferences, not engine flags.

Use FFmpeg directly for trims, joins, reframing, audio, and caption sidecars. Use HyperFrames when a browser composition, animated visuals, or an interactive preview helps. These are tools, not mandatory stages. Use their installed skills and current documentation when available. Do not build a replacement editing framework.

When direction is unclear, show a brief plan. When the user asks for a first draft, make it without an unnecessary planning checkpoint. Inspect the preview and adapt to feedback.

## Protect the work

Preserve original footage. Keep timing and audio synchronized, and avoid accidental duplicated or omitted ranges. Deliberate rearrangements are fine when they serve the requested edit.

Ask before paid calls, global changes, and large downloads. Keep credentials out of chat, logs, compositions, and commits. Use the chosen tool's documented credential setup; a `.env` file is not automatically loaded by every tool. Get approval before sending private footage to a cloud service.

Preview before final export unless the user requests one-shot export. Use HyperFrames check/preview for compositions or a playable draft for direct FFmpeg edits. After rendering, inspect decoded frames, listen to audio, and check duration and synchronization. A successful command alone does not prove a good edit.

Report the output location, what you verified, and any real limitation. Never claim a missing transcription, preview, or export worked.

If using the repository checkout, `docs/WORKFLOW.md` has direct tool examples. This skill also works on its own.
