# Setup

Bare Video is an instruction skill, not an application to install. Your coding agent runs existing tools directly. The website needs no setup or account.

## Check before installing

Ask your agent to inspect what is already available:

```text
ffmpeg -version
ffprobe -version
node --version
```

FFmpeg and ffprobe cover basic media editing. Node.js 22+ is needed if the edit uses HyperFrames. Check `npx hyperframes --help` for its current commands. The first npx use may download the package; a local renderer also needs Chromium. Reuse an existing supported browser before proposing a download.

No Python package or Bare Video CLI is required. Do not install tools globally by default. Explain missing requirements, download sizes, and destinations before a large installation.

## Use the skill

Open a video-project folder in your coding agent and ask it to read `.agents/skills/bare-video/SKILL.md` from this repo. It can clone the repo inside that project if needed. You can also copy the skill into the user-level skill location documented by your agent, but that is optional and should be your choice.

A simple project:

```text
my-video/
  input/video.mp4
  assets/
  workspace/
  output/
```

These folder names are suggestions. Existing workspaces do not need to be reorganized.

## Transcription and privacy

Use an existing transcript, an installed local transcriber, or a cloud provider you approve. Local models can be large. Cloud services receive your audio and may have fees, quotas, or file-size limits. The agent should explain those choices before uploading or downloading anything.

Keep credentials in the chosen tool's documented local configuration, never in the prompt or chat. An ignored `.env` can be useful, but the agent must load it or configure the tool explicitly; FFmpeg and HyperFrames do not universally read it on your behalf.

## Website development

Serve the checkout with any static server. For example, if Python is already installed:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Python is only an optional development server here, not a video-editing dependency. There is no npm install or build step.
