---
name: bare-video
description: Guide a coding agent through short-form video editing with the user's own design preferences, FFmpeg, optional HyperFrames, and a chosen transcription source. Use for talking-head shorts, tutorials, proof-led edits, captions, sound design, browser previews, and final exports.
---

# Bare Video

Bare Video is an editing skill, not a video engine. The coding agent supplies the judgment and operates the tools that are actually available. The user's footage, goals, design preferences, and feedback are the source of truth.

Do not create a Bare Video CLI, media engine, template runtime, workflow graph, or wrapper around tools that already work.

## How this skill is organised

- This file holds the judgment: what to inspect, what to decide, and what never to fake.
- [references/themes.md](references/themes.md) holds the tokens: palette, type family, weight, tracking, radius, caption rules, motion timing. Use those numbers instead of reinterpreting a theme name.
- [templates/themes.css](templates/themes.css) and [templates/components.css](templates/components.css) are the five token sets and the fourteen skeletons as real CSS. Use them instead of rebuilding the same layouts in project HTML.
- [references/visual-planner.md](references/visual-planner.md) defines the required scene and micro-beat plan that exists before HTML or HyperFrames code.
- [references/caption-qa.md](references/caption-qa.md) defines transcript cleanup, proper-noun checks, URL checks, and when to use a second ASR pass.
- [references/sound-design.md](references/sound-design.md) defines the SFX event plan and how sounds attach to visible actions.
- [references/hyperframes.md](references/hyperframes.md) holds the build contract for HyperFrames: composition shape, timeline registration, clip timing, caption markup from word timings, the motion rules lint rejects, and the verification order.
- A component is a parameterised skeleton, not a picture. Split screen has two orders, speaker on top with the information below, or the information above with the speaker below. A theme restyles the skeleton through tokens. Anything not named here can still be composed when the footage calls for it, as long as it stays inside the theme's tokens.

## Start the session like a human editor

Work inside the video project the user opened. If the user has no project folder yet, recommend one disposable folder per video so temporary files are easy to remove later. A simple structure is enough:

- input/ for copied source media when the user wants it inside the project
- assets/ for real screenshots, logos, B-roll, references, and audio
- workspace/ for temporary edit files
- output/ for previews and final renders

These names are suggestions, not requirements. Do not move or duplicate the user's original footage without a reason.

Before media work, identify the source video from the user's project or instructions. If there is more than one plausible source and the choice is genuinely ambiguous, ask which one to edit. Do not assume a particular filename or folder structure.

## Transcribe before making speech-driven edit decisions

Use the transcription route the user selected:

- **Faster Whisper:** local transcription. Check whether it and a suitable model already exist. Prefer word-level timestamps. Ask before downloading a model or another large dependency.
- **Groq:** fast cloud Whisper transcription. Check `GROQ_API_KEY` in the project `.env` and current environment first. If it is missing, create the project `.env` if needed and open that file in the user's normal text editor. On Windows, use Notepad. Add an empty `GROQ_API_KEY=` line and ask the user to save the key in the file, never in chat. Continue after the user saves it. Prefer detailed word timing when supported.
- **Deepgram:** cloud speech-to-text with detailed timing. Check `DEEPGRAM_API_KEY` in the project `.env` and current environment first. If it is missing, create the project `.env` if needed and open that file in the user's normal text editor. On Windows, use Notepad. Add an empty `DEEPGRAM_API_KEY=` line and ask the user to save the key in the file, never in chat. Continue after the user saves it. Preserve detailed word timing when available.
- **Existing transcript:** reuse a verified transcript the user already has. Prefer word-level timestamps. If the file cannot be found, ask for its path.

A transcript gives words and timing. It is also draft text, not unquestionable truth. Before captions or visual triggers use it, run the checks in [references/caption-qa.md](references/caption-qa.md). Proper nouns, domains, product names, model names, versions, and low-confidence words must be checked against the user's real assets or a second ASR source when available.

A transcript does not decide what to cut. Review the speech in context and inspect the actual footage.

If the selected cloud provider is not configured, handle the project-local `.env` setup above instead of claiming credentials already exist. Keep `.env` out of Git. If the user does not want to configure cloud transcription, offer Faster Whisper as the no-key fallback. Do not silently switch providers. If the selected local tool is missing, explain what would be installed and where before downloading it.

## Plan with the user when they ask to plan

After transcription, inspect the footage and build a compact editing plan. A useful plan contains:

- the truthful hook and payoff
- what speech stays, moves, or gets cut
- visual scenes tied to idea changes
- micro-beats tied to exact spoken words inside those scenes
- which visual building blocks are allowed
- caption behavior and the chosen theme
- sound-effect events tied to visible actions
- whether FFmpeg alone is enough or HyperFrames would materially help

Before writing HTML, create the visual plan described in [references/visual-planner.md](references/visual-planner.md). A scene is a stable composition for one idea. A micro-beat is an entry, highlight, movement, pointer, crop, punch-in, or emphasis inside that scene. Do not force a new scene just because another noun was spoken.

If the user chose **Plan it with me**, show this plan and let them change it before the heavy build. Wait for approval.

If the user chose **Give me a first draft**, make these decisions internally and proceed to a real preview without adding an unnecessary approval checkpoint.

## Build the visual plan before HTML

Do not jump from transcript directly to `index.html`.

Create `workspace/visual-plan.json` or an equivalent readable plan first. Each scene must state its purpose, component, real assets, start and end, and its micro-events. Each micro-event must be anchored to a real word timestamp or a verified edit cue.

Example: if one sentence lists Groq, Deepgram, and Faster Whisper, keep one comparison/list scene on screen. Reveal or highlight Groq when "Groq" is spoken, Deepgram when "Deepgram" is spoken, and Faster Whisper when "Faster Whisper" is spoken. That is one scene with three timed micro-beats, not three unrelated cards.

When speech introduces a concrete thing, respond visually when useful:

- tool, product, model, person, or brand: real logo, UI, image, or a labeled component using verified text
- website or repo: real screenshot, crop, code, file tree, or repo proof
- options or comparison: list, multiple cards, split, or one persistent comparison scene with timed highlights
- process or instructions: steps with sequential reveals
- number or measurable result: real stat or data component
- UI action: crop plus pointer, highlight, or callout
- abstract claim with no proof asset: typography, diagram, or talking head, not fabricated evidence

Text-only pills are the fallback, not the default response to a named concept.

## Choose tools after the plan, not before it

Use FFmpeg directly for trims, joins, reframing, audio work, subtitle sidecars, and other normal media operations.

HyperFrames is optional. Use it when the edit genuinely benefits from a browser composition, animated interface, motion graphic, composed vertical layout, or browser preview.

After the transcript and edit direction are clear:

1. Check whether HyperFrames is already available in the current video project.
2. If FFmpeg alone can do the job cleanly, do not install HyperFrames.
3. If HyperFrames would materially improve the edit and it is missing, ask before adding it locally to this video project.
4. Do not install it globally by default.
5. Use its current documentation and native help. Do not invent commands.

The tool choice should serve the edit. The edit should not exist to justify a tool.

Read [references/hyperframes.md](references/hyperframes.md) before writing a HyperFrames composition. It covers the composition shape, the paused timeline registration, the clip timing attributes, the theme token wiring, caption markup from real word timings, the motion rules that lint rejects, and the verification sequence. It also gives the FFmpeg comparison so you can tell when HyperFrames is not worth it.

## Build compositions from a flexible starter kit

Start from `templates/components.css`. Each component is one skeleton that reads only from the theme tokens; add `data-comp` to the frame and fill the slots.

For a HyperFrames or HTML composition, this is the default contract:

- import both `templates/themes.css` and `templates/components.css`
- use `.bv-frame` plus a theme class and `data-comp` for starter layouts
- do not copy theme tokens into `index.html`
- do not re-create starter component CSS inside `index.html`
- extend a starter component when possible before inventing a parallel card, split, stat, popup, or callout implementation
- custom geometry is allowed when the plan genuinely needs a composition the library does not cover, but it must still consume the theme tokens

A generated composition that imports only `themes.css` while hand-writing its own copies of cards, splits, stats, popups, or callouts has failed this contract.

Bare Video includes reusable composition ingredients. They are not a finite template library and they are not a strict allow-list unless the user explicitly asks for that restriction.

Starter components include:

- **Talking head:** let the speaker own the frame when delivery is the strongest visual.
- **Split screen:** combine the speaker with a real screen, screenshot, demo, image, or other useful visual. Two orders are equally valid: speaker on top with the information below, or the information on top with the speaker below. Pick the order that serves the sentence, the way the face sits in frame, and whether the viewer must read or watch first. Do not ask about it unless both orders are genuinely equal.
- **Full-screen media:** let real proof, UI, a website, screenshot, image, or demo take over when it deserves the frame.
- **Floating card:** place a compact card over footage for a label, quote, proof point, image, UI detail, or short piece of information.
- **Big card:** use an oversized card as a major composition for proof, a statement, UI, or another focal visual.
- **Stat / data card:** present real numbers, percentages, progress, charts, or comparisons with clear hierarchy. Never invent data.
- **Step card:** show a numbered action, instruction, or stage with enough room for the viewer to understand what happens next.
- **Screenshot / UI card:** frame real interface proof clearly as a card, crop, device-like frame, or focused screen region.
- **Multiple cards:** arrange several useful cards around or beside the subject for comparison, accumulation, options, or spatial storytelling.
- **Green-screen layout:** place a keyed or isolated speaker over real supporting media or a designed composition when the footage and tools support it.

Treat the user's selected components as useful starting ingredients. Unless the user disables improvisation or explicitly gives a strict constraint, you may resize, reposition, repeat, combine, restyle, or create a new composition when the footage, reference, or direct instruction calls for it. A request such as "make the card huge," "put several cards around me," or "use this reference layout" should change the composition rather than be rejected because the exact arrangement is not named above.

Do not rotate through components mechanically. Choose them by meaning and let strong footage stay simple when it works.

Respect the requested visual pace:

- **Active:** most meaningful spoken phrases can receive a useful visible response when it helps. This can be a composition change, real proof, a card, purposeful crop or motion change, or caption emphasis.
- **Balanced:** change presentation when it improves understanding, supports proof, or prevents a dead stretch.
- **Calm:** let the speaker or proof stay on screen longer and change visuals only when the content clearly benefits.

Anchor visual changes to the meaning of the speech. Use real supporting material first. If requested proof, logos, screenshots, results, or B-roll do not exist, stay with available material or ask for the asset. Never fabricate evidence.

## Apply one editing theme across the allowed building blocks

The selected theme is a starting visual skin. It controls the default typography, color, background treatment, cards, proof presentation, caption styling, spacing, and motion. It does not lock composition or limit what the agent can build.

Read [references/themes.md](references/themes.md) for the exact token values: palette hexes, type stacks, weights, letter spacing, card radius, shadow, caption rules, and motion timing for each of the five themes. Use those values instead of inventing an interpretation of the theme name. If the user's reference or brand forces a change, change the named token and say so.

The five Bare Video starter themes are:

- **Product Clean:** premium product-demo language. Use white, black, and soft gray as the base, generous negative space, clean product or UI cards, controlled motion, selective accent color, and occasional editorial type contrast. Speaker backgrounds can use a tasteful real image, gradient, or product visual when it supports the footage.
- **Creator Utility:** practical creator editing. Keep the speaker present, use bold readable captions, bring in screen recordings and UI proof quickly, use useful labels or cards, selective keyword color, and faster transitions that prioritize clarity.
- **Data Editorial:** information-led editorial design. Use strong hierarchy, real percentages, progress bars, charts, counters, and data cards when the source contains real data. Use restrained warm or muted accents and calmer motion. Editorial type contrast is allowed.
- **Tutorial Steps:** instructional clarity. Use obvious step labels, screen takeovers, callouts, cursor or UI emphasis, high-contrast captions, and minimal decoration. The viewer should always know what to click, read, or do next.
- **Bare Minimal:** stripped-back short-form editing. Favor strong talking-head framing, clean black-and-white typography, simple proof, purposeful crops or zooms, and very little decorative motion.

These are starting languages, not rigid templates. Any starter component can be resized, combined, repeated, or composed differently under each theme. The user's direct instruction can also change an individual card, layout, color, scale, or motion treatment without requiring a new named theme.

### A theme has to be visibly executed

A scene fails review if you cannot name which theme token it visibly uses. Every scene must show at least two of: type family, tracking or caps, card treatment, accent use.

- Type family and tracking come from `--head`, `--track`, `--caps`, `--weight`.
- Card treatment comes from `--card`, `--radius`, and the theme's shadow.
- Accent comes from `--accent` and `--accent-ink`, used on one thing per scene.
- Motion comes from `--motion-in` to `--motion-out`. Product Clean 300 to 420ms, Creator 180 to 300, Data 400 to 600, Tutorial 200 to 320, Bare Minimal 250 to 400.

A white card with black text under every theme means the theme is not executing, whatever the tokens say.

Popup language per theme, so two themes cannot render the same popup:

| Theme | Popup treatment |
| --- | --- |
| Product Clean | white card, soft shadow, tight tracking, one black block, 14px radius |
| Creator Utility | near-black card, wide caps, lime block, 8px radius |
| Data Editorial | paper card, serif numerals, rust rule, 2px radius, hairline only |
| Tutorial Steps | white card, blue step number, arrow callout, 12px radius |
| Bare Minimal | no fill, white hairline box, emphasis by scale, no block |

If the user provides a reference video, image, or design system, study the real reference and let it override theme and composition defaults where appropriate. Recreate the useful visual logic with the user's real assets rather than treating the starter kit as a ceiling. Do not copy protected branding or fabricate missing assets.

## Cut with intent

Speech-driven edits use two sources:

1. **Semantic source:** word-timed transcript for repeated takes, false starts, filler, sentence meaning, and exact word boundaries.
2. **Acoustic source:** FFmpeg `silencedetect` for pauses the transcript may not represent reliably.

Neither source cuts by itself. Merge them into cut candidates, then let the editor decide from context.

### Silence scan

Run a non-destructive FFmpeg silence scan before building the final EDL. A practical starting point for talking-head audio is about `noise=-40dB` and `d=0.5`. Adjust the noise threshold when the recording's noise floor clearly needs it.

Write the detected intervals to a small machine-readable file such as `workspace/silence-candidates.json`. Do not use `silenceremove` as the editor and do not auto-delete every detected pause.

Use the duration as review pressure, not truth:

- roughly 0.5 to 0.8s: review only
- roughly 0.8 to 1.5s: likely trim unless the sentence needs the pause
- above roughly 1.5s: strong cut candidate unless it is a deliberate beat

### The cut contract

Word timings decide safe speech boundaries. Silence detection supplies independent acoustic evidence.

Given words `w[0..n]` with `start` and `end` in seconds, and handle `h`:

- Gap: `g = w[i+1].start - w[i].end`
- Default `h = 0.015` (15ms). Allowed range 0.010 to 0.030.
- Never remove any part of a word's own `w.start` to `w.end` span.
- If a silence candidate overlaps a word, the word wins. Do not cut through it.
- Leading and trailing silence may be shortened after checking the opening and closing delivery.
- Overlapping word timings are a transcript warning. Keep them until reviewed.

The chosen cut intensity controls how aggressively candidates are accepted. It does not change the requirement to inspect meaning.

Repeated takes and filler come primarily from transcript reasoning. Long pauses come from both transcript gaps and FFmpeg silence detection. Listen around uncertain joins before deleting.

If the transcript has no word timings, silence detection may still identify pauses, but do not present those cuts as speech-aligned. Prefer getting word timings before a tight talking-head edit.

### Write the decision list before rendering

Cuts without a decision list drift the moment you revise. Build it first:

```
source_in, source_out, output_in, output_out, note
12.480,  18.204,   0.000,   5.724,  hook
22.900,  31.150,   5.724,  13.974,  setup
```

- `duration = source_out - source_in`
- `output_in` = previous `output_out`, starting at 0
- `output_out = output_in + duration`

Map every downstream cue through the list: `out_t = output_in + (src_t - source_in)` for the segment that contains `src_t`. If a cue crosses a removed interval, split it at the seam. Every renderer, FFmpeg or HyperFrames, consumes the same list.

Do not stream-copy across word boundaries. Frame accuracy at an arbitrary point needs a re-encode, or a verified keyframe-aligned copy. Check the join after rendering, not before.

## Captions should be precise and intentionally styled

Captions are word-level, not phrase-level. Every word carries its own start and end from the transcript, and the word being spoken is visibly lit while the rest of the line sits back. Chunking phrase-by-phrase without per-word timing reads dead on camera.

- One phrase element on screen, 1 to 3 words, 1.6 seconds maximum.
- Each word is a span with its own start and duration.
- The spoken word runs at full `--cap-ink` and carries the emphasis block. Words already spoken drop to about 0.85, words not yet spoken sit at about 0.62.
- Put a plate behind the caption (flat black at 40 to 45 percent, 12px radius) or the contrast audit fails on bright frames and dimmed words become unreadable.
- Captions are never hidden because a card arrived. Move the card, keep the caption. When a card occupies the lower third, lift the caption above it.
- Emphasis is one word per phrase. `--cap-emphasis: none` disables the block entirely, which Bare Minimal requires.

Before captions are final, run [references/caption-qa.md](references/caption-qa.md). The transcript text must be checked for proper nouns, URLs, domains, model names, versions, acronyms, and suspicious low-confidence words. Copy verified names from real project sources. Never "correct" an unknown term by guessing.

Use transcript timing to keep captions synchronized with speech. A text correction normally keeps the original word timing unless a second ASR pass proves the alignment is wrong. Check the rendered captions against the actual audio.

For **Punchy** captions, keep chunks short and readable. Give each caption chunk a deliberate emphasis treatment, usually one useful word or phrase. Do not highlight filler just to make the screen busy.

For **Clean** captions, keep timing precise but use calmer chunking, motion, and emphasis.

For **None**, do not burn captions into the video. The transcript can still guide cuts and timing.

The selected editing theme controls the caption and overlay treatment. The user's direct feedback and real references override the starter theme.

Keep captions away from the speaker's mouth, important UI, and proof the viewer needs to read. Reposition captions when the layout changes instead of hiding them unnecessarily.

## Scene density and rhythm

Separate **scene changes** from **micro-motion**.

- A scene can stay on screen for one complete idea, comparison, list, or explanation.
- Inside that scene, meaningful words can trigger entries, highlights, pointers, punch-ins, crop moves, counters, or emphasis.
- Active short-form pacing should rarely feel visually frozen for more than about 1 to 2 seconds, but that does not mean replacing the whole composition every 1 to 2 seconds.
- Change the full scene when the idea, proof source, or spatial relationship changes.
- Keep micro-beats anchored to real spoken words. Do not add random motion just to satisfy a timer.
- A persistent scene can accumulate information. For example, Groq, Deepgram, and Faster Whisper can enter one comparison layout one by one as each name is spoken.
- Use retention punch-ins and pull-backs as micro-beats. They may happen even when the composition stays the same.
- Prefer roughly 1.04 to 1.12 scale for normal punch-ins, with occasional slightly stronger emphasis when the framing tolerates it.
- Let them feel irregular rather than metronomic: use stressed words, sentence turns, small visual dead zones, or delivery changes as triggers. Avoid a fixed interval and avoid constant breathing zoom.
- A punch-in can later return to 1.0 or step to a different crop so the talking head does not feel mechanically locked.
- Every visual response must name, prove, contrast, point, clarify, or improve retention without obscuring meaning. Decorative pills that only repeat a word are usually noise.

## Proof should be cropped, not framed

Full-page screenshots prove nothing at 9:16. The viewer cannot read them and learns nothing.

- Crop to the exact region being described and scale that crop to fill the frame width. A 1200px-wide crop of the transcription row is readable at 720p. A whole page is not.
- One reveal at a time does not require one scene at a time. A single comparison scene may stay visible while Deepgram, Groq, and Faster Whisper enter or highlight at their exact spoken words. Use separate full scenes only when the underlying proof or idea changes.
- When a screenshot goes full-frame, fit the whole thing (contain) rather than filling the frame (cover). Cropping the sides of a page deletes the text you are pointing at.
- Label every proof beat with its real source in mono type.
- Check each crop actually contains the text it claims before it enters the timeline.

## Sound should support visible actions

Speech stays dominant.

- **Lots:** frequent purposeful clicks, taps, impacts, soft whooshes, transition accents, and UI sounds are allowed when they match visible actions.
- **Balanced:** regular but selective sound accents.
- **Minimal:** reserve SFX for major reveals, transitions, proof moments, or important on-screen actions.
- **None:** add no sound effects.

Before composition audio is final, write an SFX event plan using [references/sound-design.md](references/sound-design.md). Each sound needs a visible or semantic reason, such as an item entering, a UI click, a highlight landing, a major reveal, or a transition.

Vary repeated sounds. Do not put a whoosh on every cut. Do not use a sound only because the timeline has space for one.

## Stay grounded

Verify the inputs and tools that actually exist.

- Never claim you watched, heard, transcribed, rendered, previewed, or verified something you did not inspect.
- Never invent footage, screenshots, proof, logos, B-roll, transcripts, tool capabilities, command flags, or successful outputs.
- Check versions and native help before using uncertain command syntax.
- Ask before paid calls, large model downloads, global installs, or global configuration changes.
- Keep credentials out of chat, logs, compositions, and commits.
- Preserve the original footage and keep temporary work and outputs separate.
- Keep the plan proportional to the edit. A simple cut should stay simple.

## Preview, get feedback, improve the edit

Preview before final export unless the user explicitly requested a one-pass final export.

Inspect the actual picture, audio, duration, caption timing, visual changes, and A/V sync. A successful command or lint result does not prove a good edit.

When the user gives feedback, fix the edit first. The active project can evolve during the session.

Advanced users may copy or clone the Bare Video repo into their own video project and let their coding agent customize that local project copy. Keep project-specific footage paths, credentials, and private temporary details out of the public Bare Video repo.

Report the output location, what changed, what was actually verified, which tools were used, and any real limitation that remains.

## Deliver something playable

Defaults for a 9:16 short unless the user asks otherwise:

- 1080x1920, 30fps, H.264 high, `yuv420p`, faststart, CRF 18 to 20.
- Audio: AAC, 48kHz, stereo or mono as the source allows, 192kbps.
- Loudness: -14 LUFS integrated, true peak at or below -1 dBTP. Speech sits on top; music ducks under it.
- **Check what the renderer actually produced.** HyperFrames output measured -27 LUFS on the first real test. Normalise as a separate pass and measure again; do not assume the renderer normalises for you.
- **Preview first unless the user asked for one pass.** Confirm which one, in words, before encoding anything. A render costs 8 minutes for 2 minutes of 720p30 on a laptop, and a misread instruction costs four renders.
- VFR phone footage: normalise to a constant frame rate before cutting, or the word timings will drift against the picture.
- Rotation metadata: read it and apply it. Do not ignore it and then wonder why the frame is sideways.
- **Check whether the source is mirrored.** Phone and webcam recordings often are. A shirt with backwards text is the tell. Ask before flipping; it changes the framing.
- Before delivery: decode the whole file once, confirm the audio stream exists, and check three frames plus the first and last second.

Keep the decision list, the word-timed transcript, the theme overrides, and the render command with the project. A revision should reuse them, not rebuild the edit from scratch.

## Before you deliver

Run this list and answer each one honestly. Any no is unfinished work, not a limitation.

- Cut analysis: transcript candidates and FFmpeg silence candidates were both reviewed before the final EDL.
- Visual plan: scenes and word-anchored micro-beats exist before composition code.
- Composition contract: `index.html` imports both theme and component CSS and does not duplicate starter component implementations.
- Captions: every phrase has word-level timings, no caption was hidden for a card, and caption QA checked names, domains, versions, and suspicious words.
- Caption coverage: the percentage of spoken time that carries a caption. Under 95 percent is a defect.
- Rhythm: full-scene changes follow idea changes; micro-beats keep active scenes responsive without arbitrary motion.
- Theme: for each scene you can name two theme tokens it visibly uses.
- Proof: every screenshot was cropped to the point being made and its text was read back before use.
- Contrast: the tool's contrast audit passes, and no white caption sits on a bright frame without a plate.
- Audio: measured LUFS after the render, not assumed.
- Source: mirrored or not, and the user knows which.
- Preview: the user watched it, or explicitly asked for one pass.

Use the repository files that actually exist. Do not cite or depend on setup documentation that is not present in the checkout.
