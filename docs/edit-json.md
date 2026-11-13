# edit.json reference

`edit/edit.json` describes the whole edit. `check.mjs` tells you when something is wrong.

## Top level

| Field | Values | Default |
| --- | --- | --- |
| `theme` | `graphite`, `daylight`, `paper`, `loud` | `graphite` |
| `captions` | `bold`, `clean`, `off` | `bold` |
| `accent` | a hex colour like `"#e63946"`, replaces the theme's accent | theme colour |
| `highlight` | `color` (spoken word changes colour) or `block` (spoken word gets a coloured box) | `block` for daylight and loud, `color` otherwise |
| `focus` | `[x, y]` where the face is in the footage, 0 to 1 | `[0.5, 0.4]` |
| `fix` | caption spelling fixes, `{"wrong words": "Right Words"}` | none |
| `scenes` | the list below | required |
| `sfx` | sound effects, see the end of this page | none |
| `music` | `{"src": "assets/music.mp3", "volume": 0.12}` | none |

`focus` matters for the split layout, where only part of the face is shown. If the face sits high in the frame, use `[0.5, 0.3]`. If it sits on the left, use `[0.35, 0.4]`.

`fix` corrects what the transcript misheard, for example `{"bear stack": "Barestack", "polablaza": "paulablaza"}`. The words must match what is in `edit/cut.words.txt`.

## Scenes

A scene starts at `at` and lasts until the next scene starts. The first scene always starts at 0.

| Field | Meaning |
| --- | --- |
| `at` | where the scene starts: exact spoken words from `edit/cut.lines.txt` (`"the engine"`), or seconds (`12.4`). If the words appear more than once, add a time hint: `"the engine@30"` picks the one near 30s. |
| `layout` | `face`, `split` or `full` (see below) |
| `type` | what is on screen (see below). Leave it out to show only the face. |
| `punch` | `true` zooms in on the face for this scene. Use it for a punchline or a strong moment, not every scene. |
| `kicker` | a small label above the graphic, like `"Step 2"` or `"The specs"` |
| `note` | free text for yourself, ignored by the build |

### Layouts

- `face`: the footage fills the screen. A graphic, if any, sits in a card at the top. Use for talking, reactions, and short labels.
- `split`: the graphic fills the top half and the face the bottom half. The best default for anything the viewer needs to read.
- `full`: only the graphic, no face. Use for real images and clips, big moments and the end card. Do not stay here long: people watch people.

If you leave `layout` out: no type means `face`, `label` means `face`, `media` means `full`, everything else means `split`.

## Scene types

Highlight one word or phrase in any text with `*stars*`.

### title

A headline, 2 to 7 words.

```json
{ "at": "this is the fastest", "type": "title", "kicker": "2026 test", "text": "The *fastest* car I own", "sub": "and it is not close" }
```

### label

A small name card. Good for introducing a person, a place, a product, a dish.

```json
{ "at": "this is Maria", "type": "label", "text": "Maria Santos", "sub": "head chef, 12 years" }
```

### list

2 to 5 short items. Each item appears when its first word is spoken, automatically. Give an item its own `at` when the automatic match is wrong.

```json
{ "at": "you need three things", "type": "list", "kicker": "You need", "style": "checks",
  "items": ["Flour", "Butter", { "text": "Cold *water*", "at": "ice cold water" }] }
```

`style`: `dots` (default), `numbers` or `checks`.

### steps

2 to 5 numbered steps with a line between them. Same item rules as list.

```json
{ "at": "first you", "type": "steps", "items": ["Jack up the car", "Loosen the nuts", "Swap the wheel"] }
```

### stat

One big number that counts up. The number must be spoken in the video, or add `source` saying where it comes from.

```json
{ "at": "zero to sixty in", "type": "stat", "value": "3.2s", "text": "0 to 60 mph" }
{ "at": "it costs", "type": "stat", "value": "$45,000", "text": "base price", "source": "maker's price list, 2026" }
```

### compare

Two sides. `win` (1 or 2) outlines the better one.

```json
{ "at": "old versus new", "type": "compare", "win": 2,
  "items": [{ "label": "Before", "text": "40 min" }, { "label": "After", "text": "*12 min*" }] }
```

### quote

A sentence worth reading, with who said it.

```json
{ "at": "my coach told me", "type": "quote", "text": "Slow is smooth, smooth is fast", "sub": "Coach Dan" }
```

### chapter

A section break with a number. Good for longer shorts with parts.

```json
{ "at": "part two", "type": "chapter", "text": "The drive", "number": "02" }
```

### media

A real image or clip from the user's `assets/` folder. Paths are relative to the video folder.

```json
{ "at": "look at this interior", "type": "media", "src": "assets/interior.jpg", "text": "Interior" }
{ "at": "on the track", "type": "media", "src": "assets/track.mp4", "from": 4.5 }
```

- `layout`: `full` (default, fills the screen), `split` (top half, face below) or `face` (a card at the top).
- `fit`: `cover` (default, fills the box) or `contain` (shows the whole image, for screenshots and documents).
- `from`: for clips, the second in the clip to start from. Clips are silent.
- `text`: an optional small label.
- `zoom: false` stops the slow push-in.

### end

The last card.

```json
{ "at": "see you next time", "type": "end", "layout": "full", "text": "Follow for *part 2*", "sub": "@yourhandle" }
```

## Sound effects and music

You need real audio files in `assets/`. Bare Video ships none, so it does not ship anything with an unclear license. Use sounds with a license that allows it (for example CC0) and keep a note of where each came from.

```json
"sfx": [
  { "at": "three things", "src": "assets/sfx/pop.wav", "volume": 0.5 },
  { "at": 12.0, "src": "assets/sfx/whoosh.wav", "volume": 0.4 }
],
"music": { "src": "assets/music/bed.mp3", "volume": 0.1 }
```

Put a sound on a visible change (a card arriving, a list item, a big number), never on every cut. Keep music low (0.08 to 0.15) so the voice stays clear.

## A full example

A 40-second car short:

```json
{
  "theme": "graphite",
  "accent": "#e63946",
  "captions": "bold",
  "focus": [0.5, 0.38],
  "fix": { "porsh": "Porsche" },
  "scenes": [
    { "at": 0, "type": "title", "layout": "split", "text": "Is the *cheap* one faster?" },
    { "at": "so I took both", "layout": "face" },
    { "at": "this one", "type": "media", "src": "assets/car-a.jpg", "text": "Car A" },
    { "at": "and this one", "type": "media", "src": "assets/car-b.jpg", "text": "Car B" },
    { "at": "on paper", "type": "compare", "win": 1, "items": [{ "label": "Car A", "text": "4.1s" }, { "label": "Car B", "text": "4.6s" }] },
    { "at": "but on the road", "layout": "face", "punch": true },
    { "at": "three reasons", "type": "list", "style": "numbers", "items": ["Weight", "Tires", "Gearing"] },
    { "at": "so which one", "layout": "face" },
    { "at": "follow for", "type": "end", "layout": "full", "text": "Part 2: the *track*", "sub": "@yourhandle" }
  ]
}
```
