# Sound design

Sound follows visible actions and important semantic moments.

Do not sprinkle SFX on empty timeline space.

## Plan events first

Use a small event list such as `workspace/sfx-plan.json`.

Each event should contain:

- exact time
- visible target or semantic reason
- sound category
- intensity
- chosen file when known

Useful categories:

- soft whoosh
- fast whoosh
- pop
- click
- tap
- soft impact
- hard impact
- swipe
- digital blip
- success accent
- subtle riser
- transition accent

## Common mappings

- card or item enters: pop, soft whoosh, or no sound
- pointer or UI action: click or tap
- highlight lands: digital blip or soft impact
- major proof reveal: impact or short riser
- scene transition: transition accent or whoosh
- sequential list: vary soft ticks, clicks, or pops, not the same sample every time

## Rules

Speech stays dominant.

Do not use the same whoosh for every transition.

Do not put a sound on every cut.

One persistent scene can contain several micro-beats with separate sounds, but only when the sounds improve the action.

Reuse a small coherent library before searching for more assets. Keep source and license information for downloaded sounds when required.

Measure the final mix after rendering. SFX presence does not prove the mix is good.
