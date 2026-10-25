# Bare Video engine

Bare Video is a small orchestration layer around FFmpeg, speech-to-text providers, and HyperFrames. It intentionally keeps the core Python package dependency-free. Local transcription is an optional dependency.

## End-to-end flow

```text
source video
  -> normalized word-level transcript
  -> semantic candidates + word-gap cut map
  -> direct FFmpeg hard-cut render
  -> retimed transcript
  -> semantic beat/layout plan
  -> captions + synthetic SFX
  -> HyperFrames HTML project
  -> browser preview
  -> HyperFrames render
  -> decode/silence/final-ASR QA
```

## One-command preparation

From the Bare Video repo:

```bash
python scripts/bare_video.py run ../input/video.mp4 \
  --workspace ../workspace \
  --output ../output/autocut.mp4 \
  --provider auto \
  --style bare
```

`--provider auto` uses Groq when `GROQ_API_KEY` exists, then Deepgram when `DEEPGRAM_API_KEY` exists. If neither key exists, it stops instead of silently downloading a local model. Choose `--provider local` only after approving the faster-whisper install/model download.

The command creates the transcript, semantic candidate list, cut map, autocut MP4, retimed transcript, edit plan, HyperFrames project, and first media QA report. It prints the exact preview command at the end.

## Preview and final render

```bash
python scripts/bare_video.py hf-check ../workspace/hyperframes
python scripts/bare_video.py preview ../workspace/hyperframes

# after approval
python scripts/bare_video.py hf-render ../workspace/hyperframes \
  --quality delivery \
  --output ../output/final/bare-video-final.mp4
```

HyperFrames is invoked through `npx hyperframes`; Bare Video does not vendor its renderer.

## Final QA

Basic decode/silence QA:

```bash
python scripts/bare_video.py qa ../output/final/bare-video-final.mp4 \
  --output ../workspace/qa-final.json
```

Optional final ASR re-scan and comparison to the expected edited transcript:

```bash
python scripts/bare_video.py qa ../output/final/bare-video-final.mp4 \
  --output ../workspace/qa-final.json \
  --provider deepgram \
  --expected-transcript ../workspace/transcript/edited.json \
  --transcript-output ../workspace/transcript/final.json
```

## Individual commands

- `init`: create the recommended project folders and `.env` placeholder.
- `transcribe`: Groq, Deepgram Nova-3, or faster-whisper -> normalized JSON.
- `semantic-candidates`: propose conservative duplicate/filler review candidates.
- `cut-map`: create strict source-ordered keep/cut maps.
- `autocut`: render the keep map in one FFmpeg filter graph.
- `plan`: choose Bare Video layouts from transcript meaning; optionally attach files from an assets directory.
- `reference`: make a contact sheet and selected-frame packet for agent style analysis.
- `compose`: build a 9:16 HyperFrames project with captions and synthetic SFX.
- `preview`: open HyperFrames preview.
- `hf-check`: run HyperFrames lint + browser checks.
- `hf-render`: final HyperFrames render.
- `qa`: media decode/silence QA, with optional ASR re-scan.

## Conservative automation boundary

Bare Video can auto-apply exact immediate repeated-word cuts when `--auto-semantic` is explicitly enabled. Other semantic candidates are review material by default. This is deliberate: a generic heuristic should not erase personality, comedic timing, or a useful repeated phrase merely because it resembles a mistake.
