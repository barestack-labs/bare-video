# Beginner onboarding

Bare Video is designed so a beginner can start with one folder, one raw video, and one coding agent.

## Recommended project layout

Use one dedicated folder per video:

```text
my-video/
├── input/
│   └── video.mp4
├── references/
├── assets/
├── bare-video/
├── .env
├── runtime/
├── workspace/
└── output/
```

The Bare Video repo lives at `./bare-video/`.

The project-root `.env` is only needed when cloud transcription is used. It must stay out of Git.

## Public website flow

The public site is `https://shorts.paulablaza.com/`.

The homepage explains the product. The next step is the prompt builder at `https://shorts.paulablaza.com/create.html`.

The prompt builder runs entirely in the browser. It does not upload the user's media, store API keys, or require an account.

It collects setup, edit mode, visual direction, captions, SFX, transcription, finish behavior, and whether the user wants to reuse the Bare Video skill later. It then generates one copy-paste prompt for the coding agent.

## Credentials

Never put API keys into the generated prompt.

When a cloud provider is selected and its key is missing, the agent should create the project-root `.env`, copy the variable names from `bare-video/examples/bare-video.env.example`, confirm `.env` is ignored by Git, open the file in the user's editor, and tell the user which variable to fill.

## Experienced users

Experienced users do not need to follow the parent-folder layout. They may use Bare Video inside an existing workspace, point the agent at the repo directly, keep `.agents/skills/bare-video/SKILL.md` as the repo-local skill, or copy/install that skill into their coding agent's documented user-level skill location for repeated use.

An agent must ask before changing global configuration or installing a user-level skill.
