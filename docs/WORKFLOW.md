# Editing with your agent

The agent decides the edit. FFmpeg and HyperFrames carry it out. These examples are tools to adapt, not a fixed pipeline or a promise that every machine has the same setup.

## Understand the footage

Use ffprobe to inspect duration, dimensions, streams, and frame rate:

```bash
ffprobe -v error -show_format -show_streams -of json input/video.mp4
```

Watch useful sections and obtain a transcript when speech needs it. HyperFrames can transcribe or import an existing transcript; inspect its current help before choosing a provider or model:

```bash
npx hyperframes transcribe --help
```

Do not trigger model downloads or upload private audio without approval. A transcript supplies timing and context. It does not decide which pauses or lines deserve to stay.

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

## Add what helps

A direct FFmpeg edit may be enough. When the edit benefits from a browser composition, use HyperFrames and its current composition guidance rather than a Bare Video-specific format.

Work in a separate composition directory. Include local assets, correct timing, a sized composition root, identified media, and source audio where needed. Use HyperFrames' installed skills or `npx hyperframes --help` for current authoring commands.

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
