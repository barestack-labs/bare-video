# Editing with your agent

The agent decides the edit. FFmpeg and HyperFrames carry it out. These examples are tools to adapt, not a fixed pipeline or a promise that every machine has the same setup.

## Understand the footage

Use ffprobe to inspect duration, dimensions, streams, and frame rate:

```bash
ffprobe -v error -show_format -show_streams -of json input/video.mp4
```

Watch useful sections and obtain a transcript before making speech-driven cut and caption decisions. Use the route the user selected: Faster Whisper, Groq, Deepgram, or an existing verified transcript. Prefer word-level timestamps.

Inspect the selected tool's current help or documentation before using provider-specific commands. Do not silently switch providers. Do not trigger model downloads without approval. A transcript supplies timing and context. It does not decide which pauses or lines deserve to stay.

After transcription, either plan with the user or make an internal plan for a first-draft request. Map the hook, retained speech, visual beats, captions, and sound cues to the actual transcript before the heavy build.

## Make deliberate cuts

For a single excerpt, this re-encodes a three-second range starting at one second, keeping the original intact:

```bash
ffmpeg -i input/video.mp4 -ss 1 -t 3 -c:v libx264 -crf 20 -c:a aac output/excerpt.mp4
```

Create the output directory first. For multiple ranges, build a trim/atrim and concat filter graph from the agent's selected intervals. Reset both video and audio timestamps for each range. Keep deliberate source order unless the edit calls for rearrangement.

For a long graph, save it to a file. Current FFmpeg supports reading the filter graph directly from that file:

```bash
ffmpeg -i input/video.mp4 -/filter_complex workspace/edit.filter -map "[vout]" -map "[aout]" -c:v libx264 -c:a aac output/draft.mp4
```

This file-input syntax was verified with FFmpeg 9.0.1. Check `ffmpeg -h full` on other versions; `-filter_complex "<graph>"` is the direct inline form. Do not use the removed `-filter_complex_script` flag on FFmpeg 9. The graph must match the actual input streams; do not assume every video has audio.

## Plan visual response

For active short-form pacing, most meaningful spoken phrases should have a useful visible response. That response can be a relevant screen, split-screen, proof, overlay, crop or motion change, or caption emphasis. Do not rotate layouts mechanically and do not add motion to filler words.

Use only the visual building blocks the user allowed. Caption and overlay themes are starting points. The user's own colors, type, references, and confirmed design rules override them. Sound effects should follow visible actions and meaningful transitions instead of every cut.

## Add what helps

A direct FFmpeg edit may be enough. Decide that after the transcript and edit direction are clear. When the edit genuinely benefits from a browser composition, animated interface, motion graphic, composed vertical layout, or browser preview, use HyperFrames and its current composition guidance rather than a Bare Video-specific format.

Check whether HyperFrames is already available in the current video project. If it is missing and would materially help, ask before adding it locally to that project. Do not install it globally by default. If FFmpeg alone is enough, skip HyperFrames.

Work in a separate composition directory when HyperFrames is used. Include local assets, correct timing, a sized composition root, identified media, and source audio where needed. Use HyperFrames' installed skills or current native help for authoring commands.

```bash
npx hyperframes check workspace/composition --json
npx hyperframes preview workspace/composition --background
```

Inspect the preview and ask for feedback. A first-draft request skips planning approval, not final-export approval. An explicit one-shot final-export request can skip both.

After approval:

```bash
npx hyperframes render workspace/composition --quality delivery --output output/final.mp4
```

The renderer and any optional model are external tools, not bundled with Bare Video.

## Check the actual result

```bash
ffprobe -v error -show_format -show_streams -of json output/final.mp4
ffmpeg -v error -i output/final.mp4 -f null -
```

Inspect frames at cuts and visual changes. Listen to the audio, check speech and captions remain synchronized, and confirm the output length matches the intended edit. Give the user the playable output or a working preview URL, plus any limitation that remains.
