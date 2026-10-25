# Setup philosophy

Bare Video should feel disposable for beginners and reusable for power users.

## Default: project-local

A beginner can keep the repo, optional runtimes, references, work files and outputs in one project folder. Deleting that folder should remove Bare Video's project-specific additions.

Bare Video should **reuse** installed system tools before suggesting downloads.

### Reuse order

1. Existing Node 22+
2. Existing FFmpeg / ffprobe
3. Existing Chrome / Chromium
4. Existing Python
5. Existing configured Groq / Deepgram keys
6. Optional local ASR runtime/model

## Global install is opt-in

If the user expects to use Bare Video across many projects, the agent may offer a system/global install for FFmpeg or other reusable tools. Do not make this the beginner default.

## Credentials

Create a local `.env` only when the user chooses cloud transcription. The agent may open it with Notepad, TextEdit or the configured Linux editor. Never request that the user paste secrets into chat.

See `examples/bare-video.env.example`.
