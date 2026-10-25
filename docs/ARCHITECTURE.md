# Architecture

Bare Video separates mechanical media work from creative decisions.

```text
ASR providers
  -> normalized transcript schema
  -> cut candidate generation
  -> agent semantic judgment
  -> strict source keep map
  -> visual sampling / contact sheet
  -> beat plan
  -> layout registry
  -> HyperFrames preview/render
  -> final QA
```

The goal is to let cheap or free vision-capable coding agents work from compact artifacts instead of repeatedly ingesting entire videos.

## Planned transcription providers

- Groq Whisper: preferred cloud route when configured.
- Deepgram Nova: alternative cloud route with rich word metadata.
- faster-whisper: multilingual local fallback.

All adapters should normalize to the same word-timing schema so downstream editing does not care which provider produced the transcript.
