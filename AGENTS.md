# Bare Video - agent instructions

Bare Video is a local-first video editing toolkit for coding agents. It is NOT installed globally by default.

## First principle

Read the user's intent before acting.

- If they ask **how to use the repo**, explain the short workflow first. Do not install anything until they approve setup.
- If they ask to **set it up**, inspect the machine and present one concise setup summary before downloads.
- If they explicitly ask to **one-shot setup + edit**, proceed with recommended project-local defaults, but still ask before credentials, paid services, destructive actions, global configuration changes, or unusually large downloads.
- If they ask to **plan with them**, show a beat plan before building the visual edit.
- Default behavior when intent is ambiguous: plan with the user before final visual composition.

## Local-first setup contract

1. Reuse existing tools first: Node, FFmpeg, Chrome/Chromium, Python.
2. Never silently install global packages.
3. Prefer project-local downloads under `runtime/` when a dependency is missing.
4. Explain what will be downloaded, where it goes, and approximate size before large downloads.
5. Do not expose API keys in chat, logs, screenshots, generated HTML, or commits.
6. Cloud transcription is preferred when configured. Local faster-whisper is opt-in because it may download a model.

Run:

```bash
python scripts/doctor.py
```

Use its report before proposing setup.

For the full engine commands, read `docs/ENGINE.md`.

## Editing contract

Bare Video is tight and dynamic by default, but not frantic.

### Cuts

Silence is a candidate, not a verdict.

- Use ASR word timings to locate gaps, false starts and repeat candidates.
- Remove waiting, abandoned takes, obvious mistakes, unnecessary repetition and dead air.
- Keep meaningful thinking, comedic timing, emphasis, reactions, demonstrations and useful pauses.
- When uncertain, keep the material or ask the user during planning.
- Rendering must use source-ordered keep windows. Never duplicate or overlap source ranges.
- Use `bare-video semantic-candidates` and `bare-video cut-map` rather than inventing an unrelated cut format.
- Auto-apply only high-confidence candidates when the user explicitly permits semantic automation.

### Layout selection

Pick layout by meaning, not by rotation:

- `face`: personal thought, reaction, bridge, nothing better to show.
- `split`: tutorial, demo, screen/B-roll with speaker still useful.
- `float`: small card, tool stack, label, quick proof without leaving the face.
- `proof`: real repo, webpage, screen, evidence, result.
- `editorial`: stat, steps, comparison, abstract claim, payoff.
- `ui`: terminal, status, product-interface, AI workflow.
- `collage`: reveal or dense summary. Use sparingly.

Real material beats designed cards. Designed scenes beat generic filler.

### Captions

Default: word-synced, short chunks, restrained emphasis. Move captions with the layout. Never cover the face/hands or collide with proof.

### SFX

Use the Bare Video SFX mapping. The engine can synthesize its own small SFX set locally, avoiding third-party audio licensing for the defaults. Speech always wins. User requests such as "less SFX" override the default globally.

## References

References are optional.

Use `bare-video reference` to create a compact contact sheet and selected-frame packet before asking a vision model to inspect individual frames.

Derive layout frequency, caption treatment, motion cadence, graphic density, SFX density and framing. Recreate the general editing language with Bare Video components. Do not copy third-party branding or copyrighted assets unless the user has rights to them.

If there is no reference, use `bare-default`.

## Preview gate

Unless the user explicitly requests one-shot final export:

1. Build the mechanical autocut.
2. Create/edit the beat plan.
3. Generate the HyperFrames project.
4. Run HyperFrames lint/check where available.
5. Open the preview.
6. Wait for user feedback.
7. Render final only after approval.
8. Run final media QA and optional final ASR re-scan.

## Current repository status

The v0.5 engine path is implemented: ASR adapters, normalized transcript schema, conservative semantic cut candidates, DeepCut-style keep maps, direct FFmpeg autocut, transcript retiming, semantic layout planning, captions, synthetic SFX, reference packets, HyperFrames project generation, CLI orchestration, and media QA.

Do not overclaim external validation. Cloud provider calls require user-owned keys, and HyperFrames CLI execution still needs a live package-network-enabled environment.
