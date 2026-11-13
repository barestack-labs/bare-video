---
name: bare-video
description: Edit a talking-head video into a vertical short (1080x1920) with clean cuts, word-timed captions and simple motion graphics. Use when the user wants a video edited, cut, captioned, or turned into a TikTok, Reel or YouTube Short. Works for any topic (cars, food, fitness, tech, tutorials). Uses FFmpeg, HyperFrames and small Node scripts, so even a small model can do it by following the steps.
---

# Bare Video

You edit by writing two small JSON files. The scripts do the hard parts (cutting, timing, captions, layout, rendering checks). Do not write HTML or FFmpeg filter graphs yourself.

In this file `BV` means the folder this SKILL.md is in, and `source.mp4` means the user's video: replace it with the real path (any format FFmpeg reads, such as .mp4, .mov or .mkv). Run every command from inside the video's own folder, for example `node ../bare-video/scripts/transcribe.mjs source.mp4`.

Read the files in `BV/docs/` only when a step tells you to.

## Step 0. First time only: check the tools

Run `node --version` (needs 22 or newer), `ffmpeg -version` and `npx hyperframes --version`.

- If something is missing, read `BV/docs/setup.md` and tell the user exactly what to install. Ask before installing anything. HyperFrames is about 100 MB plus a browser, installed once and shared by every video.
- Never install anything globally unless the user asks.

## Step 1. Ask the user, in one message

Skip any question the user already answered.

1. Which video file? (the exact path)
2. What is it about, and how long should the short be? (default: as short as it can be while keeping the point, usually 30 to 75 seconds)
3. Which look: `graphite` (dark, cars/tech/gear), `daylight` (bright, tutorials/products), `paper` (warm serif, food/travel/stories), `loud` (black and yellow caps, fitness/sports/hype), or "you pick".
4. Captions: `bold` (big, word by word), `clean` (smaller, calmer) or `off`.
5. Any images, clips, logos or a reference video to use? They go in an `assets/` folder next to the video.

Then work without more questions until Step 9, unless something is truly blocked.

## Step 2. Set up the folder

The video should sit in its own folder, for example `videos/car-review/source.mp4`. If it is somewhere else, do not copy it (that doubles the disk space): just use its full path in the commands. Everything the scripts make goes into `edit/` (small text files) and `work/` (big files, deleted at the end).

## Step 3. Transcribe

```
node BV/scripts/transcribe.mjs source.mp4 --terms "Brand Name,Model X,Person Name"
```

- `--terms` is a comma list of names and words that are easy to mishear. Take them from the user's message and file names.
- It uses Groq (free API key) or Deepgram, reading the key from a `.env` file in the video folder or any folder above it (usually `videos/.env`). If no key exists, the script says what to do. Create the `.env` file with an empty `GROQ_API_KEY=` line, open it in the user's editor, and ask them to paste the key there and save. Never ask for the key in chat.
- Names, websites and model numbers are often misheard. Do not fix them now. Note the right spelling and fix the captions in Step 6 with `"fix"`.
- Never guess how a name or website is spelled. Use the spelling from the user's message, their files or their assets. If you cannot find it, ask the user, or leave it off the screen. A wrong web address on screen is worse than none.
- Output: `edit/lines.txt` (one sentence per line, numbered L1, L2...) and `edit/words.txt` (every word with its time).

## Step 4. Choose what to keep

Read `edit/lines.txt`. Write `edit/cuts.json`:

```json
{ "keep": ["L1", "L3-L5", "L8", "L10-L12"] }
```

- Keep the hook first: the most interesting true sentence. It can come from the middle of the video.
- When a sentence was said twice, keep the last clean take and drop the others.
- Drop false starts, "um so yeah", off-topic parts and "let me explain" filler.
- Never change the meaning. Never join half-sentences into a claim the speaker did not make.
- To keep part of a line, use word numbers from `edit/words.txt`, like `"120-164"`.

## Step 5. Cut

```
node BV/scripts/cut.mjs source.mp4
```

It removes pauses automatically and writes `work/cut.mp4` and `edit/cut.lines.txt`. From now on use `edit/cut.lines.txt` and `edit/cut.words.txt`: their numbers and times are for the cut video, not the original. Read `edit/cut.lines.txt` from top to bottom: every sentence must be complete and make sense. Read every `CHECK:` line the script prints. A part that starts or stops mid-sentence is usually a mistake. Fix `edit/cuts.json` and run it again.

## Step 6. Plan the visuals

Read `BV/docs/edit-json.md` now. It lists every scene type with examples. Then write `edit/edit.json`:

```json
{
  "theme": "graphite",
  "captions": "bold",
  "scenes": [
    { "at": 0, "layout": "face" },
    { "at": "zero to sixty", "type": "stat", "value": "3.2s", "text": "0 to 60" },
    { "at": "three things", "type": "list", "items": ["Brakes", "Tires", "Weight"] },
    { "at": "but here's the catch", "layout": "face", "punch": true }
  ]
}
```

Rules that make it look good:

- `at` is the exact words from `edit/cut.lines.txt` where the scene starts. Copy them, do not paraphrase. Numbers (seconds) also work.
- A new scene every 3 to 6 seconds. Go back to the face (`"layout": "face"` with no type) between graphics, so the viewer sees the person.
- The first 2 seconds should show the hook: a `title` with the main promise, or the face with a `punch`.
- Only show a graphic when it adds something: a name, a number, a list, a step, a comparison, a real image. Do not put the same words the person is saying on screen just to fill time.
- On-screen text is 2 to 7 words, list and step items under 24 characters. Highlight one word with `*stars*`.
- Graphics should be on screen about 40 to 70 percent of the time. `check.mjs` reports the number.
- Fix misheard names in the captions with `"fix": {"wrong words": "Right Words"}` (copy the wrong words from `edit/cut.words.txt`).
- Numbers must be real: said in the video, or from a real document the user gave (then add `"source"`). Never invent stats, prices, specs, logos, screenshots or quotes.
- Use the user's real images and clips with `"type": "media"`. If there are none, do not pretend there are.
- Last scene: an `end` card, or the face.

## Step 7. Check

```
node BV/scripts/check.mjs
```

Fix every PROBLEM and run it again until it says OK. Read the warnings and fix the real ones.

## Step 8. Build and look

```
node BV/scripts/build.mjs
```

It prints a `npx hyperframes snapshot` command with times in the middle of your graphic scenes. Run that command, open the `contact-sheet.jpg` it prints, and actually look at it. On split screens the caption sits on the line between the two halves on purpose. Real problems are: text cut off, text over the face, an empty screen, or something unreadable. If you cannot view images, say so to the user instead of claiming it looks right.

## Step 9. Show the user

```
npx hyperframes preview work
```

Give the user the preview link and ask what to change. Make each change in `edit/edit.json` or `edit/cuts.json`, then repeat Steps 5 or 7 to 8. Change only what they asked for.

## Step 10. Export, only after the user says it is good

```
npx hyperframes render work --output work/render.mp4
node BV/scripts/finish.mjs work/render.mp4
```

`finish.mjs` sets the loudness, makes `final.mp4`, and checks the file. Then ask the user: "Delete the work folder to free space?" If yes:

```
node BV/scripts/clean.mjs --yes
```

This keeps `final.mp4`, the source video and `edit/` (enough to re-make the edit later).

## Always

- Never claim you watched, listened to, rendered or checked something you did not.
- Never edit the user's original video file. Never delete anything outside `work/` without asking.
- Keep API keys out of chat, code and commits.
- If a script prints an ERROR, read it, fix the cause it names, and run it again. Read `BV/docs/troubleshooting.md` if you are stuck.
- When you finish, tell the user: where `final.mp4` is, how long it is, what you cut, and anything you could not check.

To change the look or add a new scene type, read `BV/docs/customize.md`.
