# Working on the Bare Video repo

This file is for agents changing the repo itself. If you were asked to edit a video, read `SKILL.md` instead.

## Shape

- `SKILL.md` is the product. Keep it short, numbered and literal, so a small model can follow it without guessing. Detail goes in `docs/`.
- `scripts/` are plain Node ESM with no dependencies. Every failure prints `ERROR:` plus the fix in plain words.
- `template/` is the HyperFrames runtime. `build.mjs` copies it into each video's `work/` folder.
- The website is `index.html` plus `assets/`, static, no build step. Cloudflare Pages deploys `main` from the repo root.

## Rules

- The agent decides what to keep and what to show. Code does timing, layout, cutting and checks. If a step keeps going wrong for models, move it into a script or a check instead of adding more prose.
- Never let the template invent content: no stock images, no placeholder stats, no fake UI.
- Renders must be deterministic: absolute tween times, explicit start values, no timers, random values or JS-created media. See `docs/customize.md`.
- Storage: scripts never copy the source video, write big files only under `work/`, and `clean.mjs` keeps `edit/`.
- When you change a scene type, a field or a look, update `docs/edit-json.md`, `scripts/plan.mjs` (`TYPES`, `KNOWN`, `THEMES`) and the website if it mentions it.

## Test before you push

1. Run the full flow on a real talking-head clip: transcribe, cut, write an edit.json that uses every scene type, check, build, `npx hyperframes lint work`, `npx hyperframes snapshot work --at ...`, and look at the frames.
2. For template changes, render a short range (`npx hyperframes render work --start 0 --end 8`) and confirm sound and A/V sync.
3. For website changes, serve the folder (`python -m http.server`) and check 1440px and 390px widths for overflow.
