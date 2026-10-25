# Themes: the five starter styles, as copyable tokens

A theme is a set of decisions, not a mood. This file gives the values as real CSS so two agents, or the same agent on two videos, produce the same look.

## How to use this file

1. Pick one theme. Do not mix two.
2. Copy its CSS block into the composition `:root` unchanged.
3. Set the caption size and card padding in composition units with the scale rule below.
4. Change a token only when the user's reference, brand, or footage requires it. Then say which token changed and why.

The website renders the same values with a `--cs-` prefix in `assets/showcase.css`. Prefix aside, a token here and a token there are the same number, on purpose.

## Shared token schema

| Token | Meaning |
| --- | --- |
| `--bg` | background fill |
| `--ink` | primary text |
| `--sub` | secondary text and labels |
| `--line` | hairlines, dividers, chart bars |
| `--card` | card fill, `transparent` means hairline only |
| `--card-ink` | text on cards |
| `--accent` | the one emphasis colour |
| `--accent-ink` | text on an accent block |
| `--cap-ink` | caption text colour |
| `--cap-shadow` | caption shadow, `none` allowed |
| `--cap-emphasis` | `block` or `none`, how an emphasis word is marked |
| `--radius` | card corner radius |
| `--weight` | headline and caption weight |
| `--track` | headline letter spacing |
| `--caps` | headline `text-transform` |
| `--head` | headline and caption family |
| `--ui` | label and body family |
| `--mono` | numeric and micro-label family |
| `--motion-in` | shortest change, ms |
| `--motion-out` | longest change, ms |

## Scale rule

Website previews are 78 to 186px wide. Video is 1080px wide. Convert by proportion, not by copying pixels:

- Caption size: `8.4cqw` of frame width becomes 91px at 1080. That is the default for a 9:16 short.
- Radius: scale by frame width, so a 14px radius on a 186px preview is about 81px at 1080. Clamp it: radius never exceeds 6 percent of frame width on 9:16, because past that the card stops reading as a card.
- Padding: 4 to 6 percent of frame width for content cards.
- Hairlines: 1.5px at 1080 minimum, or they vanish after encoding.

## Product Clean

```css
:root{
  --bg:#ffffff; --ink:#0b0b0c; --sub:#8a8a90; --line:#e4e4e8;
  --card:#ffffff; --card-ink:#0b0b0c;
  --accent:#0b0b0c; --accent-ink:#ffffff;
  --cap-ink:#ffffff; --cap-shadow:0 1px 6px rgba(0,0,0,.55); --cap-emphasis:block;
  --radius:14px; --weight:800; --track:-0.05em; --caps:none;
  --head:Inter,ui-sans-serif,system-ui,sans-serif;
  --ui:Inter,ui-sans-serif,system-ui,sans-serif;
  --mono:"Courier Prime",ui-monospace,monospace;
  --motion-in:300ms; --motion-out:420ms;
}
```

- Captions: white, weight 800, shadow above, bottom 15 percent.
- Accent: black on white. One accent word per caption at most. No second colour anywhere.
- Cards: filled white, soft shadow `0 10px 24px rgba(0,0,0,.18)`.
- Avoid: gradients as personality, glassmorphism, three or more colours.

## Creator Utility

```css
:root{
  --bg:#0d0d0f; --ink:#ffffff; --sub:#9a9aa2; --line:#2c2c32;
  --card:#f2f2f4; --card-ink:#0b0b0c;
  --accent:#d8ff3e; --accent-ink:#0b0b0c;
  --cap-ink:#ffffff; --cap-shadow:0 2px 10px rgba(0,0,0,.85); --cap-emphasis:block;
  --radius:8px; --weight:850; --track:-0.02em; --caps:uppercase;
  --head:"Archivo Exp",Inter,sans-serif;
  --ui:Inter,ui-sans-serif,system-ui,sans-serif;
  --mono:"Courier Prime",ui-monospace,monospace;
  --motion-in:180ms; --motion-out:300ms;
}
```

- Captions: white, uppercase, thick, emphasis word on a solid lime block.
- Accent: lime for the emphasis block and the active data bar. Not for body text.
- Cards: light filled cards against the near-black field, shadow `0 12px 26px rgba(0,0,0,.55)`.
- Avoid: pastel palettes, serif type, soft shadows.

## Data Editorial

```css
:root{
  --bg:#f2ede3; --ink:#1a1714; --sub:#8b8377; --line:#d9d0c1;
  --card:#fbf8f2; --card-ink:#1a1714;
  --accent:#b4451f; --accent-ink:#fff8f2;
  --cap-ink:#1a1714; --cap-shadow:none; --cap-emphasis:block;
  --radius:2px; --weight:800; --track:-0.02em; --caps:none;
  --head:Georgia,"Times New Roman",serif;
  --ui:Inter,ui-sans-serif,system-ui,sans-serif;
  --mono:"Courier Prime",ui-monospace,monospace;
  --motion-in:400ms; --motion-out:600ms;
}
```

- Captions: dark ink on paper, serif, no shadow.
- Accent: rust for the one number that matters and the active chart bar.
- Data rule: only real numbers from the footage, transcript, or a supplied asset. If the video has no numbers, do not force a stat card.
- Avoid: gradients, drop shadows past 8 percent opacity, more than two type sizes in one card.

## Tutorial Steps

```css
:root{
  --bg:#eef2f8; --ink:#0f1620; --sub:#7c8794; --line:#cdd7e4;
  --card:#ffffff; --card-ink:#0f1620;
  --accent:#2f6bff; --accent-ink:#ffffff;
  --cap-ink:#0f1620; --cap-shadow:none; --cap-emphasis:block;
  --radius:12px; --weight:800; --track:-0.04em; --caps:none;
  --head:Inter,ui-sans-serif,system-ui,sans-serif;
  --ui:Inter,ui-sans-serif,system-ui,sans-serif;
  --mono:"Courier Prime",ui-monospace,monospace;
  --motion-in:200ms; --motion-out:320ms;
}
```

- Captions: dark ink, no shadow, bottom 12 percent, never over the thing being clicked.
- Accent: blue for the step badge, the callout arrow, and the active element.
- Cards: white, one action per card.
- Avoid: decorative cards that do not name an action.

## Bare Minimal

```css
:root{
  --bg:#0a0a0a; --ink:#ffffff; --sub:#8d8d8d; --line:#2b2b2b;
  --card:transparent; --card-ink:#ffffff;
  --accent:#ffffff; --accent-ink:#0a0a0a;
  --cap-ink:#ffffff; --cap-shadow:none; --cap-emphasis:none;
  --radius:0; --weight:850; --track:-0.03em; --caps:uppercase;
  --head:"Archivo Exp",Inter,sans-serif;
  --ui:Inter,ui-sans-serif,system-ui,sans-serif;
  --mono:"Courier Prime",ui-monospace,monospace;
  --motion-in:250ms; --motion-out:400ms;
}
```

- Captions: white, uppercase, centred or left, no shadow, `--cap-emphasis:none`, so no highlight block. Emphasis comes from scale and placement.
- Cards: no fill. A 1px `--line` hairline and nothing else. Not a black fill that pretends to be a card.
- Accent: white only.
- Avoid: coloured accents, shadows, more than one type size for the message.

## Caption rules for every theme

- One to four words per line on 9:16. Never a sentence block.
- Safe area: 8 percent from each side, 12 percent from the bottom, clear of the platform UI.
- One emphasis word or phrase per chunk, never the whole line.
- Captions follow speech timing from the transcript, not fixed durations.
- A component may move a caption to avoid covering the subject. A component never restyles a caption: colour, weight, shadow, and emphasis belong to the theme.

## Component overrides that are allowed

| Component | Allowed change | Not allowed |
| --- | --- | --- |
| Split screen, either order | caption moves to the free half | caption colour or weight |
| Step card | caption sits below the card | caption colour or weight |
| Green screen | caption sits on the accent field, using `--accent-ink` | caption colour outside the accent field |
| Big card, Stat, Screenshot, Multiple cards | caption may be dropped when the card is the message | dropping captions when the user asked for them |

## Quick compare

| Theme | Background | Headline | Accent | Radius | Weight |
| --- | --- | --- | --- | --- | --- |
| Product Clean | white | tight sans, no caps | black | 14px | 800 |
| Creator Utility | near-black | wide caps | lime | 8px | 850 |
| Data Editorial | warm paper | serif | rust | 2px | 800 |
| Tutorial Steps | cool grey | sans | blue | 12px | 800 |
| Bare Minimal | black | wide caps | white | 0 | 850 |
