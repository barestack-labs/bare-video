# Customize

Bare Video is meant to be copied and changed. Make your own copy of this folder (or fork the repo) and edit it freely. Your changes stay in your copy.

## Change the colour

The quickest change is one line in `edit.json`: `"accent": "#e63946"`. Pick a colour from the brand, the car, the dish, the team.

## Make your own look

Looks live in `template/themes.css`. Each is a list of tokens. Copy one block, rename the class (for example `.t-garage`), change the values, then add the name to `THEMES` at the top of `scripts/plan.mjs`.

| Token | What it controls |
| --- | --- |
| `--bg`, `--surface`, `--line` | background, card fill, borders |
| `--ink`, `--muted` | main text, small text |
| `--accent`, `--accent-ink` | the one highlight colour, and text placed on it |
| `--head`, `--head-weight`, `--head-track`, `--head-case` | headline font, weight, letter spacing, uppercase or not |
| `--body`, `--mono` | body and label fonts |
| `--radius`, `--shadow` | card corners and shadow |
| `--cap-font`, `--cap-weight`, `--cap-case`, `--cap-track` | captions |

Fonts must be files in `template/fonts/` with an `@font-face` in `template/bv.css`, so renders look the same everywhere and never need the internet. Use fonts whose license allows it (the bundled ones are SIL Open Font License).

Good looks have one accent colour, one or two fonts, and big text. Gradients, glows and many colours make a video look cheap.

## Add a scene type

1. In `template/bv.js`, add a `case "yourtype":` inside `buildScene` that adds elements to `box`. Use `rich()` for text with `*highlights*`.
2. In the timeline part of `buildScene`, make its parts appear with `appear(node, time, { y: 40 })`.
3. Add CSS for it in `template/bv.css`, using only the theme tokens (no fixed colours).
4. Add the name to `TYPES` in `scripts/plan.mjs`, and any new fields to `KNOWN`.
5. Document it in `docs/edit-json.md` with one example.

Rules that keep renders correct, because the renderer jumps to frames out of order:

- Every animation gets an absolute start time. Use `tl.fromTo` with explicit start values, never `setTimeout`, `requestAnimationFrame`, CSS animations, `Date.now()` or `Math.random()`.
- Hide things with `autoAlpha`, and set the hidden state at time 0 (`appear` does this for you).
- Never create `<video>` or `<audio>` elements from JavaScript. They render silent. `build.mjs` writes them into the HTML.
- Keep text at least 34px on the 1080-wide canvas, or it is unreadable on a phone.
- Keep text out of the top 150px, the bottom 420px and the right 140px below the middle (the app's buttons sit there).

## Share it back

If you made a look or a scene type that works for a whole kind of video, open a pull request on https://github.com/barestack-labs/bare-video with one example `edit.json` and a contact sheet image.
