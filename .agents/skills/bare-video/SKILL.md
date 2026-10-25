---
name: bare-video
description: Build or modify Bare Video's agent-directed short-form editing workflow. Use when implementing transcription, cut planning, layout selection, HyperFrames preview/rendering, captions, SFX, setup, QA, or the Bare Video website and templates.
---

# Bare Video

Read `AGENTS.md` first. It is the repository-wide policy.

Use this skill for substantive Bare Video implementation work. Keep the product simple enough that a beginner can put a raw video in a folder and ask a coding agent to edit it.

## Product contract

Bare Video is an open-source, local-first toolkit for agent-directed short-form video editing.

Default user flow:

1. Inspect the project and machine.
2. Reuse installed tools before downloading anything.
3. Transcribe the source video.
4. Build cut candidates from timestamps and context.
5. Let semantic judgment decide what should actually be removed.
6. Build a beat plan.
7. Choose layouts by meaning.
8. Build/open the browser preview.
9. Apply user feedback.
10. Final-render only after approval unless the user explicitly requested one-shot export.

Do not silently install global dependencies, expose secrets, pay for services, or download large models.

## Engineering priorities

Work in this order unless the task says otherwise:

1. Stable normalized transcript schema.
2. ASR adapters: Groq, Deepgram, then faster-whisper fallback.
3. Deterministic cut/keep-map mechanics.
4. Semantic cut review.
5. Layout plan schema using the seven layouts in `templates/registry.json`.
6. HyperFrames composition + browser preview.
7. Captions and SFX.
8. Final render and QA.
9. Reference-video analysis.

Read the relevant docs only when needed:

- `docs/ARCHITECTURE.md`
- `docs/WORKFLOW.md`
- `docs/REFERENCE-GRAMMAR.md`
- `docs/ROADMAP.md`
- `templates/registry.json`
- `templates/sfx-map.json`

## Visual rules

The website and video system should not look like generic AI-generated UI.

Prefer:

- direct language
- simple hierarchy
- useful whitespace
- square or lightly rounded geometry
- real screenshots and footage
- fewer containers
- fewer pills
- fewer decorative labels
- restrained motion
- one clear accent

Avoid:

- cards nested inside cards
- giant vague manifesto copy
- gradient-heavy hero sections
- fake dashboards used only as decoration
- random floating badges
- excessive border radii
- constant hover lifting
- unnecessary serif-italic flourishes
- explaining the design system more than showing the product

For video layouts, real material beats designed cards. Show the person until there is something better to show.

## Verification

For code changes:

- run the smallest relevant tests first
- run `python scripts/doctor.py` when setup/runtime detection changes
- inspect generated JSON for schema changes
- verify source ranges stay ordered and non-overlapping for cut logic
- preview visual changes in-browser when practical
- do not claim a backend integration exists until code and verification exist

When finishing a substantive task, summarize what changed, what was verified, and what remains.


## Website-generated handoffs

The public prompt builder may hand you explicit choices for setup, edit mode, visual direction, captions, SFX, transcription, and finish behavior. Treat those choices as user instructions and apply them over defaults in this skill.

For beginner projects, keep the Bare Video repo at `./bare-video/` and use sibling project folders such as `./input/`, `./references/`, `./assets/`, `./runtime/`, `./workspace/`, and `./output/`.

When a cloud key is missing, create/open the project-root `.env` using variable names from `bare-video/examples/bare-video.env.example`. Never ask the user to paste secrets into chat.

If the user asks to reuse Bare Video permanently, you may offer to copy/install this skill into the coding agent's documented user-level skill location, but you must ask before modifying global configuration.
