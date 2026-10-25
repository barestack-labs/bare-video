# Editing workflow

## Planning default

Unless the user explicitly requests one-shot editing, show a concise beat plan before building the composition.

Example:

```text
0–3s   FACE       hook, captions only
3–7s   SPLIT      show the tool above the speaker
7–11s  EDITORIAL  three-item tool stack
11–15s FACE       return to speaker
15–20s PROOF      show the actual repo
20–24s EDITORIAL  payoff
```

The user can respond naturally: “more minimal”, “more full-screen graphics”, “use less SFX”, “looks good”.

## One-shot

If the user explicitly asks for one-shot mode, the agent may plan and build without a planning checkpoint. Preview remains the default gate before final export unless the user explicitly asks for final export too.
