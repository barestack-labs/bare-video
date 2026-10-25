# Roadmap

## v0.1 - Product and design foundation
- [x] Public Apple-inspired landing page
- [x] Guided prompt builder
- [x] Beginner onboarding flow
- [x] Seven layout prototypes
- [x] Layout registry
- [x] SFX event mapping
- [x] Repo-local agent skill
- [x] Cross-platform machine doctor

## v0.2 - Transcription adapters
- [x] Groq Whisper adapter
- [x] Deepgram Nova-3 adapter
- [x] faster-whisper local adapter
- [x] normalized word-timestamp schema
- [x] project-root .env onboarding

## v0.3 - Cut engine
- [x] DeepCut-style strict keep-map logic
- [x] word-gap candidate generation
- [x] conservative semantic candidate format
- [x] source-order / overlap / duplicate protections
- [x] direct FFmpeg timeline render
- [x] transcript retiming after hard cuts
- [x] decode / silence QA
- [x] optional final ASR re-scan hook

## v0.4 - HyperFrames orchestration
- [x] beat plan -> composition generator
- [x] semantic layout planner
- [x] caption component/data
- [x] generated synthetic SFX resolver
- [x] preview/check/render CLI orchestration
- [x] 1080x1920 default composition
- [ ] live HyperFrames CLI validation on a network-enabled user machine

## v0.5 - Reference analyzer
- [x] contact-sheet generation
- [x] selected scene-frame generation
- [x] reference packet / style-grammar instructions
- [x] cheap visual escalation workflow

## Next validation work
- [ ] live Groq transcription with a user-owned API key
- [ ] live Deepgram transcription with a user-owned API key
- [ ] live HyperFrames lint/check/preview/render
- [ ] end-to-end edit on a real user recording with visual feedback
- [ ] tune semantic cut heuristics from real projects
- [ ] tune layout selection and motion from real projects
