# Setup

Do this once per computer. After that, every new video is just a new folder.

## What you need

| Tool | Why | Check | Get it |
| --- | --- | --- | --- |
| Node.js 22 or newer | runs the scripts and HyperFrames | `node --version` | https://nodejs.org (LTS) |
| FFmpeg | cuts video and audio | `ffmpeg -version` | Windows: `winget install Gyan.FFmpeg`. Mac: `brew install ffmpeg`. Linux: your package manager. |
| HyperFrames | draws the graphics and renders the video | `npx hyperframes --version` | `npm install hyperframes` in your videos folder (below) |
| A transcription key | turns speech into timed words | a `.env` file | free at https://console.groq.com (API Keys) |

## The folder layout that saves space

Make one folder for all your videos and open that folder in your coding agent:

```
videos/
  bare-video/          this skill
  node_modules/        HyperFrames, installed once here, used by every video
  package.json
  .env                 GROQ_API_KEY=your-key   (never paste the key in chat)
  car-review/          one folder per video
    source.mp4
    assets/            your images, clips, logos, sounds
    edit/              small text files the agent writes (keep these)
    work/              big temporary files (deleted after export)
    final.mp4
  pasta-recipe/
    ...
```

Commands:

```
mkdir videos
cd videos
git clone --depth 1 https://github.com/barestack-labs/bare-video
npm install hyperframes
npx hyperframes browser ensure
```

`npm install hyperframes` is about 100 MB and the browser it renders with is about 150 MB more. Installing it once here, instead of in every video folder, is what keeps disk use low. The scripts and `npx` find it from any video folder inside `videos/`.

Do not put `videos/` inside Google Drive, OneDrive or Dropbox. They try to sync thousands of small files from `node_modules` and every temporary render. Keep `videos/` on a normal local drive and back up only `final.mp4` and `edit/` if you want.

If `git` is not installed, download the repo as a ZIP from GitHub and unzip it into `videos/bare-video`.

## Transcription options

- **Groq (recommended, free):** make an account at https://console.groq.com, create an API key, put `GROQ_API_KEY=...` in `videos/.env`. A 5-minute video uploads about 1 MB of compressed audio and takes a few seconds.
- **Deepgram (paid, free credit at signup, very accurate):** `DEEPGRAM_API_KEY=...` in `.env`, then `--engine deepgram`.
- **On your computer:** `--engine local` uses HyperFrames' own transcriber. The first time it needs a speech model download, which is large (hundreds of MB). Only use it if you cannot use a cloud key, and ask first.
- **You already have subtitles or a transcript:** `node bare-video/scripts/transcribe.mjs --import my.srt` (also reads `.vtt` and most transcript JSON). Word times from subtitles are estimates, so captions may drift slightly.

Cloud options send the audio (not the video) to that company. Do not use them for private recordings the user does not want to share.

## Disk use, per video

- `edit/`: under 1 MB. Keep it.
- `work/cut.mp4`: about 0.5 MB per second of the short. Deleted by `clean.mjs`.
- `work/render.mp4` and `final.mp4`: about the same size as the cut.
- HyperFrames frame caches live in the system temp folder. `npx hyperframes clean work` removes leftovers.

The scripts never copy the source video and never keep the original audio track separately. Images and clips from `assets/` are hard-linked into `work/`, so they do not take space twice.
