# Bare Video

A free, open-source skill that lets a coding agent edit a talking-head video into a vertical short: clean cuts, captions timed to every word, simple motion graphics, 1080x1920 export.

Website: https://shorts.paulablaza.com

## Use it

Paste this into Claude Code, Codex, OpenCode, Cursor or any agent that can run commands:

```text
Edit my video with Bare Video.
1. If there is no bare-video folder here, run:
   git clone --depth 1 https://github.com/barestack-labs/bare-video
2. Read bare-video/SKILL.md and follow its steps in order.

My video: path/to/your-video.mp4
```

The agent asks how long the short should be, which look you want and what captions you want, then does the rest. First time? [docs/setup.md](docs/setup.md) lists what to install and the folder layout that keeps disk use low.

## How it works

The agent never writes HTML or FFmpeg commands by hand. It writes two small JSON files, and scripts do the rest:

| Step | The agent | The script |
| --- | --- | --- |
| 1 | runs it | `transcribe.mjs`: speech to timed words (Groq free tier, Deepgram, on-device, or an existing transcript) |
| 2 | writes `cuts.json`: which sentences to keep, by line number | `cut.mjs`: cuts, removes pauses, keeps every word's timing |
| 3 | writes `edit.json`: scenes anchored to spoken words | `check.mjs`: rejects invented numbers, missing files, text that is too long, scenes that are too short |
| 4 | looks at the snapshots, shows you the preview | `build.mjs`: makes a HyperFrames project from the template |
| 5 | renders after you approve | `finish.mjs`: loudness to -14 LUFS, verifies the file. `clean.mjs`: frees the disk space |

This split is what lets smaller, cheaper models do a good edit: the judgment calls are theirs (what to keep, what to show and when), and the error-prone parts are code.

## Looks and scenes

Four starting looks: `graphite` (dark, for cars, tech, gear), `daylight` (bright, for tutorials, products), `paper` (warm serif, for food, travel, stories) and `loud` (black and yellow caps, for fitness, sports, lists). Any of them takes your own accent colour.

Scene types: title, label, list, steps, stat, compare, quote, chapter, media (your images and clips) and end card. Each can sit over the face, on a split screen with the face below, or full screen. The full reference with examples is in [docs/edit-json.md](docs/edit-json.md).

## What is in the repo

```
SKILL.md          the steps the agent follows
docs/             edit.json reference, setup, troubleshooting, customizing
scripts/          the Node scripts (no dependencies, Node 22+)
template/         the HyperFrames template: runtime, CSS, looks, bundled fonts
index.html        the website (assets/ holds its CSS and frames)
```

## Requirements

Node.js 22+, FFmpeg, [HyperFrames](https://www.npmjs.com/package/hyperframes) (installed once per computer), and a transcription route. Everything runs on your machine except the optional cloud transcription, which sends only a compressed audio copy.

## Customize and contribute

Copy the repo and change anything: looks, scene types, rules. [docs/customize.md](docs/customize.md) shows how. If you build a look or scene type that suits a whole kind of video, open a pull request with an example `edit.json` and a contact sheet.

## License

MIT. Fonts in `template/fonts/` are under the SIL Open Font License. Made by Paul Martin Ablaza at [Barestack Labs](https://github.com/barestack-labs).
