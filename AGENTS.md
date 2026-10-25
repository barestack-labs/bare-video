# Bare Video — agent instructions

Bare Video is an opinionated, local-first video editing repository. It is NOT installed globally by default.

## First principle

Read the user's intent before acting.

- If they ask **how to use the repo**, explain the short workflow first. Do not install anything until they approve setup.
- If they ask to **set it up**, inspect the machine and present one concise setup summary before downloads.
- If they explicitly ask to **one-shot setup + edit**, proceed with recommended project-local defaults, but still ask before credentials, paid services, destructive actions, or unusually large downloads.
- If they ask to **plan with them**, show a beat plan before building the edit.
- Default behavior when intent is ambiguous: plan with the user before editing.

## Local-first setup contract

1. Reuse existing tools first: Node, FFmpeg, Chrome/Chromium, Python.
2. Never silently install global packages.
3. Prefer project-local downloads under `runtime/` when a dependency is missing.
4. Explain what will be downloaded, where it goes, and approximate size before large downloads.
5. Do not expose API keys in chat, logs, screenshots, generated HTML, or commits.
6. Cloud transcription is preferred when configured. Local transcription remains available without a key.

Run:

```bash
python scripts/doctor.py
```

Use its report before proposing setup.

## Editing contract

Bare Video is tight and dynamic by default, but not frantic.

### Cuts

Silence is a candidate, not a verdict.

- Use ASR word timings to locate gaps, false starts and repeat candidates.
- Remove waiting, abandoned takes, obvious mistakes, unnecessary repetition and dead air.
- Keep meaningful thinking, comedic timing, emphasis, reactions, demonstrations and useful pauses.
- When uncertain, keep the material or ask the user during planning.
- Rendering must use source-ordered keep windows. Never duplicate or overlap source ranges.

### Layout selection

Pick layout by meaning, not by rotation:

- `face`: personal thought, reaction, bridge, nothing better to show.
- `split`: tutorial, demo, screen/B-roll with speaker still useful.
- `float`: small card, tool stack, label, quick proof without leaving the face.
- `proof`: real repo, webpage, screen, evidence, result.
- `editorial`: stat, steps, comparison, abstract claim, payoff.
- `ui`: terminal, status, product-interface, AI workflow.
- `collage`: reveal or dense summary. Use sparingly.

Real material beats designed cards. Designed cards beat generic filler.

### Captions

Default: bold, word-synced, short chunks, one emphasized word when useful. Move captions with the layout. Never cover the face/hands or collide with proof.

### SFX

Use `templates/sfx-map.json`. SFX follows visual events rather than requiring the model to invent sound design from scratch. Speech always wins. User requests such as “less SFX” override the default globally.

## References

References are optional.

If `references/` exists, derive a style grammar: layout frequency, caption treatment, motion cadence, graphic density, SFX density and framing. Recreate the general editing language with Bare Video components. Do not copy third-party branding or copyrighted assets into the project unless the user has rights to them.

If there is no reference, use `bare-default` from `templates/registry.json`.

## Preview gate

Do not final-render automatically.

1. Build the edit.
2. Launch the HyperFrames preview when that integration is enabled.
3. Ask the user to review or provide requested changes.
4. Export only after approval, unless the user explicitly asked for one-shot final export.

## Current repository status

v0.1 is design-first. The landing page, layout prototypes, registry, SFX mapping and setup doctor are implemented. ASR adapters, DeepCut integration and HyperFrames rendering are the next engineering phase. Do not claim those are implemented until the code exists.
