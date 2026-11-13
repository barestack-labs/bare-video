# Bare Video

A free, open-source skill that lets a coding agent edit a talking-head video into a vertical short: clean cuts, captions timed to every word, simple motion graphics, 1080x1920 export.

Website: https://shorts.paulablaza.com. New to this? Follow the [beginner tutorial](https://shorts.paulablaza.com/tutorial.html).

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

## Tested models

Same 4-minute recording, same prompt, each agent working on its own (2026-11-13). Time and tokens are what each tool reported for planning and building the edit. Render time is not included.

| Model | Through | Cost | Agent time | Tokens | Result |
| --- | --- | --- | --- | --- | --- |
| Claude Haiku 5.5 | Claude Code | paid plan | 3.2 min | about 91k | 52 s edit, picked the daylight look itself |
| Nemotron 3 Ultra | OpenCode + Kilo Gateway | free | 5.9 min | about 102k plus 728k cached | 59 s edit, misspelled one web address |
| Nemotron 3.5 Super VL | OpenCode + Kilo Gateway | free | 8.5 min | about 227k plus 1.3M cached | 44 s edit, checked its own snapshots |

All three videos play on the website. Groq's free chat models could not run the agent, because their free tier allows fewer tokens per minute than a single agent request.

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
