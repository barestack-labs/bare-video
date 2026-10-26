# Templates: the ten components as code

Two files, so a coding agent can copy instead of interpret.

- `themes.css`: five token sets. One class per theme on the frame wrapper.
- `components.css`: fourteen skeletons. Each reads only from the theme tokens.

## The fourteen

Layouts: talking head, split screen (speaker top or info top), full-screen proof, floating card, big card, multiple cards, green screen.

Content: stat card, step card, screenshot or UI.

Motion beat: popup, callout, highlight box, list reveal.

The last four were added after the first real edit, because without them every scene collapsed into the same white card and the theme had nothing to express.

## Use

```html
<link rel="stylesheet" href="templates/themes.css">
<link rel="stylesheet" href="templates/components.css">

<div class="bv-frame t-product" data-comp="split" data-order="speaker-top"
     data-emphasis="block" style="width:1080px;aspect-ratio:9/16">
  <div class="bv-stage">
    <div class="bv-foot"><video src="workspace/bed.mp4" muted playsinline></video></div>
    <div class="bv-cap">SHOW THE <mark>REAL</mark> THING</div>
    <div class="bv-doc">
      <div class="bv-bar"><b></b><b></b><b></b></div>
      <div class="bv-docbody">
        <span class="bv-doc-title">open the file</span>
        <div class="bv-lines"><i style="width:84%"></i><i style="width:58%"></i></div>
      </div>
    </div>
  </div>
</div>
```

## Rules the files already enforce

- A theme sets tokens. A component sets geometry. No component writes a hex value, no theme writes a layout.
- Sizes are in `cqw`, so one file works from a 78px preview to a 1080px render. That includes micro type: the badge, kicker and card label used to be preview pixels, which rendered at 5 px on a 1080 frame and failed the type floor.
- `data-comp` picks the skeleton. `data-order="info-top"` reverses split screen. `data-emphasis="none"` turns off the caption block, which Bare Minimal requires.
- Bare Minimal's card fill is `transparent`, so a card is a hairline, not a black box.
- Multiple cards use `data-slot="1|2|3"`. `nth-of-type` is kept as a fallback but breaks as soon as any sibling element is added.
- Stat, cards, screenshot and big-card hide the footage by default. `data-foot="show"` puts the speaker back, which is the usual choice for a short.

## Known limits

- A scene is a sub-composition in HyperFrames. The skeletons describe the inside of one scene, not the root timeline. Mount each scene with `data-composition-src`.
- The information band is a percentage of the frame, not of its content. A two-line doc in a 36 percent band leaves visible white space, so set the band per scene.

## What is still on the agent

- Choosing which component serves which sentence.
- Cutting, from word timestamps.
- Caption chunking, from real word timings.
- Motion: set resting states inside the tween, never as a CSS transform on the same property.

## Extending

Add a component by adding one `[data-comp="name"]` block to `components.css`. It may move captions and cards, and it may not add colour or type of its own. That rule is what keeps five themes working with one skeleton set.
