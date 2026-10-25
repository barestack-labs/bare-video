# Data schemas

## Normalized transcript

Every ASR provider emits the same shape:

```json
{
  "schema_version": "1.0",
  "provider": "groq",
  "model": "whisper-large-v3-turbo",
  "language": "en",
  "source": "input/video.mp4",
  "duration": 12.34,
  "text": "...",
  "words": [
    {"text":"Hello","start":0.12,"end":0.44,"confidence":0.98,"speaker":null}
  ],
  "segments": [
    {"start":0.12,"end":2.10,"text":"Hello ..."}
  ]
}
```

## Cut map

`workspace/cut-map/cut-map.json` contains:

- `keeps`: strict, source-ordered non-overlapping windows.
- `cuts`: removed source intervals.
- `semantic_cuts`: reviewed/applied semantic intervals.
- `dropped_fragments`: micro-fragments removed by policy.
- `planned_duration`: expected hard-cut timeline length.

## Edit plan

```json
{
  "version":"1.0",
  "style":"bare",
  "duration":42.0,
  "beats":[
    {
      "id":0,
      "start":0.0,
      "end":4.2,
      "duration":4.2,
      "text":"Go to this GitHub repo.",
      "layout":"proof",
      "asset":"assets/repo.png",
      "notes":null
    }
  ]
}
```

`asset` is optional. An agent can edit the plan before composition generation.

## Reference packet

`reference-packet.json` records source metadata plus the generated `contact-sheet.jpg` and selected scene frames. The agent should inspect the contact sheet first and escalate to individual frames only when useful.
