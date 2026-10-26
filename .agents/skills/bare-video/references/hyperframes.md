# Implementing a theme in HyperFrames

Use this after the transcript and the edit direction are clear, and only when a browser composition earns its cost (animated layout, cards over footage, precise captions, a preview the user can react to). For trims, joins, reframes, audio, and simple burns, FFmpeg is cheaper and faster.

## Check before you build

1. Is HyperFrames already in this project? Look for it in `node_modules` or run `command -v hyperframes` / check `package.json` first. Do not run `npx hyperframes` as a probe: `npx` can download the package into its cache when it is absent, which is an install you did not ask for. If it is genuinely missing, ask before adding it locally. Never install globally by default.
2. Confirm Node.js 22 or newer and a Chromium the tool can drive.
3. If the current version's flags or API are unclear, read `npx hyperframes --help` and its own docs. Do not invent commands.

## One sub-composition per scene

A long film does not belong in one file. Put the root timeline in `index.html` and mount each scene as a sub-composition:

```html
<div id="host-s01" data-composition-id="s01" data-composition-src="scenes/s01.html"
     data-start="0" data-duration="5.50"></div>
```

- A scene file has its own `#root`, its own size, its own `data-duration` and its own paused timeline.
- The host div carries the scene window on the root timeline. The scene file's clock starts at 0.
- Timing both a `<video>` and its wrapper is an error: `video_nested_in_timed_element`. Time the video against its own composition and let the host window place the scene.
- Root children with `data-start` are laid out full frame, so a scene host needs no positioning.
- Captions and the mixed bed can stay in `index.html`; they are one continuous layer and must not be split per scene.

## Composition shape

One standalone composition per finished vertical video is the simplest reliable form.

```html
<!doctype html>
<html>
<head><meta charset="utf-8"><style>/* theme tokens and layout */</style></head>
<body>
  <div data-composition-id="bv-edit" data-width="1080" data-height="1920" data-duration="42.5"
       style="position:relative;width:1080px;height:1920px;overflow:hidden">
    <!-- footage, cards, captions -->
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    // build every tween here
    window.__timelines["bv-edit"] = tl;
  </script>
</body>
</html>
```

Rules that bite if ignored:

- The root needs an explicit pixel size. A `100%` child inside an unsized root collapses and all content piles into the corner.
- Register exactly one paused timeline at `window.__timelines["<root data-composition-id>"]`, and register it after the build finishes. If you wait on `document.fonts.ready`, register inside that callback.
- Put the real length on the root `data-duration`. A longer timeline is cut off.
- Give every timed element `class="clip"` plus `data-start` and `data-duration` in seconds.
- `data-track-index` is a display lane in Studio, not a stacking rule. Use `z-index` for layering.

## Wiring the theme

1. Copy the chosen theme's token block from [themes.md](themes.md) into `:root` with the same names (`--bg`, `--ink`, `--accent`, `--radius`, `--head`, `--ui`, `--mono`, `--track`, `--caps`).
2. Build two layers and keep them separate:
   - **Base layer**: background fill, footage, keyed speaker, full-screen media.
   - **Overlay layer**: cards, captions, labels, stat blocks, callouts.
   The base changes rarely. The overlay carries the edit.
3. Style only through the tokens. If a card needs a different radius than the theme, that is a token change: state it, and keep it in one place.
4. Fonts: prefer the theme's system stack. If the project has the `.woff2` files, declare them with `@font-face` pointing at the local file. Do not fetch a font from a CDN without asking.

## Media offsets must share the scene clock

`data-media-start` is the source offset in seconds. It is not a styling detail: if the scene window moves and the offset does not, the picture plays from the wrong second and nothing errors.

- Derive `data-media-start` from the same resolved clock that produced the host window.
- After any re-cut or remap, regenerate every scene file and compare a few offsets against their host starts. They must match.
- When a slot is longer than the source, the last frame holds only inside the scene's own `data-duration`. A longer host slot shows the frame background instead. Pad the bed with a freeze tail rather than leaving a gap.

## Footage and audio

- Use `<video>` with a local `src`, muted, and no `crossorigin` attribute.
- A muted video is a silent edit. Speech comes from an `<audio>` element with its own `id` and `src`, timed to the same window as the picture. Give the audio the same `data-start` as its segment so the two stay locked.
- Source offsets are a framework concern, not a `data-start` value. `data-start` places a clip on the output timeline; it does not choose where in the source file the clip begins. Use the documented source-offset or trim mechanism for the version you have, and confirm it with `--help` or the tool's own docs. If you cannot confirm it, pre-cut the excerpt with FFmpeg and place the file. Do not invent an attribute name.
- Time the wrapper or the video, never both. A `<video data-start>` inside a parent that also has `data-start` is an error and produces wrong frames.
- Keep the original file untouched. Write the composition and renders into `workspace/` and `output/`.

The framework supplies the animation runtime and the timeline registry. Register your timeline under `window.__timelines["<composition-id>"]` as the contract says, and do not add your own GSAP bundle on top of the one the tool provides. If a version behaves differently, read its own docs rather than guessing.

## Captions from real timing

1. Take word timings from the chosen transcription route.
2. Group words into caption chunks of one to four words using speech pauses, not a fixed word count.
3. Render one element per chunk:

```html
<div class="clip bv-cap" data-start="12.42" data-duration="1.08">MAKE IT <mark>CLICK</mark></div>
```

4. Style the chunk from the theme: family from `--head`, weight from `--weight`, case from `--caps`, colour from `--cap-ink`, shadow from `--cap-shadow`. Emphasis follows `--cap-emphasis`: `block` puts `--accent` behind the emphasised word with `--accent-ink` on it, `none` means no block at all, so emphasis comes from scale or placement. Do not paste a block into Bare Minimal.
5. Keep captions inside the safe area: 8 percent from each side, 12 percent from the bottom.
6. Never use `<br>` in body text. Size the block and let it wrap, or split into two clips.

## Caption clips

- Give every caption clip a stable `id`. Lint reports `studio_missing_editable_id` for each clipped element without one.
- Clamp each phrase to the next phrase's start. Two phrases on screen at once reads as a layout bug, and it happens whenever a word is extended at the end of a chunk.
- The last phrase may exceed the 1.6 s chunk rule when it is the closing line, and it must hold through the freeze tail.
- Word states are GSAP `set` calls at absolute times, one for spoken, one for settled. Do not drive them from a CSS animation.

## Motion

- Set animated starting states inside the tween with `gsap.fromTo`, never as a CSS `transform` plus a tween on the same property. Lint rejects the pair.
- Do not tween `display` or raw `visibility` on a clip element. The framework owns clip visibility. Use `autoAlpha` or a zero-duration boundary set.
- No `repeat: -1`. Use a finite count.
- Keep every transform on a block-level element with a resolved size.
- Match the theme's pacing from [themes.md](themes.md): Product Clean is controlled, Creator Utility is snappy, Data Editorial is calm, Tutorial Steps lands on actions, Bare Minimal barely moves.

## Type size at the real canvas

The theme tokens describe a 1080 frame. A skeleton that still holds preview pixels renders 5 px type at 1080 and fails the type floor.

- Run `check` and read `text_below_floor`. It names the string and the rendered size.
- Prefer fixing the skeleton to overriding it in the composition. A per-project pixel override is a second source of truth.
- Micro labels below about 28 px at 1080 are unreadable on a phone.

## Determinism

The frame must be identical for the same timestamp. No `Date.now()`, no unseeded `Math.random()`, no network calls, no input state, no render-time clocks.

## Verify before you claim it works

1. `npx hyperframes check` and get zero findings. A lint error also switches off the layout and contrast audits, so a zero-sample report is not a pass.
2. `npx hyperframes snapshot --at` a few midpoints, then actually look at the frames: captions inside the safe area, cards not covering the face, type at a readable size.
3. `npx hyperframes preview` for the user to review, before any final render.
4. `npx hyperframes render` when the user asked for one pass, or after they approve the preview. A one-pass request is already approval; do not add a second checkpoint.

## The FFmpeg path, for comparison

Do the job without HyperFrames when the edit is cuts, trims, reorders, reframes, audio, fades, or plain burned captions.

- Cuts and joins: `-ss` / `-to` with stream copy when the codec allows, otherwise re-encode with a fixed GOP.
- Reframe to 9:16: `crop` plus `scale`, or `scale` plus `pad`.
- Captions: an `.ass` file with style values from the theme (font, size, colour, outline, margin) burned with the `subtitles` filter. Use `drawtext` only for one or two fixed lines.
- Verify with `ffprobe` plus a frame extract at three timestamps: picture, caption placement, duration, and A/V sync.

If the theme needs cards that react to speech, animated layout, or a browser preview, that is when HyperFrames is the right tool.
