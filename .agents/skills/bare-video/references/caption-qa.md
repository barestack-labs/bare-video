# Caption QA

Treat ASR text as a draft.

Word timings are useful even when the recognized spelling is wrong.

## Build a project glossary

Before final captions, collect verified names from real project sources:

- user instructions and brief
- filenames
- website and repo names
- visible UI text
- product and model names
- URLs and domains
- supplied logos, screenshots, and documents

Store the useful terms in a small project file when repeated corrections are likely.

## Always review these

- proper nouns
- URLs and domains
- product names
- model names
- version strings
- acronyms
- mixed letters and numbers
- words with low confidence when the provider exposes confidence
- words that disagree between two available transcripts

A domain must match a real source exactly. Never guess a URL from phonetics.

## Correction order

1. Check the real project source.
2. Check visible text in the supplied asset or UI.
3. Compare a second ASR result when one is already available or the span is important enough to justify it.
4. Listen to the local span.
5. If still uncertain, keep the safest literal form or flag it. Do not invent a correction.

## Timing rule

A spelling correction normally keeps the original word timing.

If the second ASR or audio shows that the word boundary itself is wrong, re-transcribe or realign only the affected span instead of shifting unrelated captions.

## Before burn-in

Create a short QA report or machine-readable list containing:

- original token
- corrected token
- reason or source
- timing changed: yes or no

The final caption text should come from the corrected transcript, not directly from raw ASR output.
