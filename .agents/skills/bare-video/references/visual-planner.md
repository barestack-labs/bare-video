# Visual planner

Create the visual plan before writing HTML or HyperFrames code.

The plan separates a stable scene from timed micro-beats inside that scene.

## Required output

Use `workspace/visual-plan.json` or an equivalent readable file.

Each scene should contain:

- start and end time
- the idea or job of the scene
- the starter component or custom composition
- real assets used
- persistent elements that stay visible
- micro-events anchored to words or verified edit cues
- optional SFX event names

A micro-event should contain:

- trigger word or exact time
- target element
- action such as enter, highlight, move, point, crop, punch-in, count, or exit
- verified text or asset
- optional sound category

## Example

One sentence says Groq, then Deepgram, then Faster Whisper.

Do not build three unrelated scenes by default.

Use one persistent comparison scene:

- scene starts before the first option
- Groq enters or highlights when "Groq" is spoken
- Deepgram enters or highlights when "Deepgram" is spoken
- Faster Whisper enters or highlights when "Faster Whisper" is spoken
- the scene exits when the explanation moves to another idea

This preserves spatial memory while keeping the screen responsive.

## Semantic triggers

When a concrete concept is spoken, choose the strongest truthful visual response available.

| Speech meaning | Preferred visual response |
| --- | --- |
| tool, product, model, brand | real logo, UI, image, or verified labeled component |
| website, repo, app | screenshot, crop, repo tree, code, or real UI proof |
| options, comparison | list, cards, split, or persistent comparison scene |
| process, tutorial | steps with sequential reveals |
| number, result | real stat, counter, chart, or data card |
| UI action | crop plus highlight, pointer, or callout |
| abstract claim | talking head, typography, or diagram |

Text-only pills are a fallback. Do not use them as the automatic response to every named thing.

## Scene versus micro-beat

Change the whole scene when the idea, proof source, or spatial relationship changes.

Use micro-beats when the idea stays the same but new information arrives.

Active pacing can react every 1 to 2 seconds without replacing the whole scene every 1 to 2 seconds.

## Asset rule

Use real project assets first.

Never fabricate a logo, screenshot, repo state, statistic, or UI result. If a useful asset is missing, use a truthful text or diagram treatment instead.
