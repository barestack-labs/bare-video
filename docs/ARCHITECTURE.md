# Architecture

Bare Video separates deterministic media mechanics from creative agent decisions.

```text
raw video
  -> ASR adapter
  -> normalized transcript
  -> gap + semantic candidates
  -> strict source keep map
  -> direct FFmpeg autocut
  -> retimed edited transcript
  -> beat/layout plan
  -> captions + SFX + assets
  -> HyperFrames HTML composition
  -> browser preview
  -> final HyperFrames render
  -> decode / silence / optional final-ASR QA
```

## Core principles

- The transcript schema is provider-independent.
- Mechanical cuts are deterministic and auditable.
- Semantic removal is conservative and reviewable.
- Keep windows are source ordered, non-overlapping, and unique.
- Real media beats generated filler.
- The agent works from compact transcript/reference artifacts instead of repeatedly ingesting entire videos.
- The browser preview is the creative approval surface.
- The core Python package has no mandatory third-party Python dependencies.
- Local faster-whisper is optional; cloud APIs are called without requiring provider SDKs.
- HyperFrames remains an external renderer invoked through its CLI rather than vendored into Bare Video.

## Transcription providers

- Groq Whisper
- Deepgram Nova-3
- faster-whisper local fallback

All adapters normalize to `docs/SCHEMAS.md`.

## Cut engine

The cut engine adapts the strict keep-map strategy used by DeepCut:

- word-gap split candidates
- 0.02 second word-safe boundary padding
- conservative micro-fragment filtering
- semantic interval support
- strict order / duplicate / overlap protection
- one FFmpeg filter graph for the autocut

The edited transcript is then retimed against the retained source windows so downstream captions and visual beats use edited-timeline timestamps.

## Visual planning

`barevideo.planner` turns edited transcript chunks into the seven Bare Video layout states. Agents may edit the generated JSON plan before composition generation.

`barevideo.hyperframes` consumes the edited video, transcript, plan, optional assets, caption chunks, and generated SFX to create a self-contained HyperFrames project.

## Reference workflow

`bare-video reference` creates:

- 4x4 contact sheet
- selected scene frames
- source probe metadata
- reference-packet.json

The agent inspects the contact sheet first and escalates only to useful individual frames.

## QA

Media QA includes:

- ffprobe metadata
- full FFmpeg decode
- >1 second silence scan
- optional final ASR re-transcription
- transcript similarity against the expected edited transcript

External provider and renderer availability are treated as environment boundaries, not silently assumed.
