# Bare Video

Bare Video is a skill for agent-led video editing, plus a small static website. There is no custom media engine or Bare Video CLI. The coding agent makes the creative decisions and operates FFmpeg, optional HyperFrames, and the transcription route the user selected.

## Editing a video

Read the Bare Video skill first. Use the user's goal, footage, references, design preferences, and feedback to decide the edit. Transcribe with the selected route before speech-driven planning. If the user wants to plan together, show the plan before the heavy build. Decide whether HyperFrames is useful only after that planning step. If it is useful, missing, and the user approves, add it locally to the video project rather than globally. Do not turn the skill into a rigid recipe or recreate a mechanical planning engine.

- Preserve original footage and write outputs separately.
- Inspect installed tools before proposing downloads. Use native `--help` when command syntax is uncertain.
- Never ask for API keys in chat. If a chosen provider needs credentials, use a local ignored file or that tool's documented configuration. Do not assume a tool automatically reads `.env`.
- Ask before paid services, large model downloads, global installs, or global configuration changes.
- Review speech in context. Silence, repeated words, and short phrases are not automatic deletion rules.
- Use real supporting assets, or stay with the footage. Do not fabricate proof.
- Follow explicit visual building blocks, visual pace, caption style, editing theme, sound level, transcription choice, planning mode, and approval choices. Product Clean, Creator Utility, Data Editorial, Tutorial Steps, and Bare Minimal are starter languages only. The user's real references and direct feedback override them.
- Show a preview before final export unless the user explicitly requests one-shot export.
- Inspect the rendered media, including picture, audio, duration, and synchronization. Never claim an untested boundary works.

For direct tool examples, read `SETUP.md` and `docs/WORKFLOW.md` only when needed. Do not install anything when the user only asks how the project works.

## Working on this repo

Keep it small. The website is plain HTML, CSS, and JavaScript with no build step. The builder produces text for the user's agent; it does not run edits or upload media. Keep copy honest about that boundary.

Prefer removing an unnecessary layer over adding configuration, adapters, wrappers, or a new framework. A helper script needs a demonstrated recurring use, not a hypothetical future feature.

For website changes, serve the files locally and exercise the real page on desktop and mobile. The prompt builder lives on the homepage at #build. Check the scroll-driven phone demo, every builder choice, generated prompt text, and copy flow. For skill changes, exercise the relevant native tool path and keep instructions aligned with current tool help. Update the existing docs when behavior changes.
