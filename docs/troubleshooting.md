# Troubleshooting

Every script prints `ERROR:` with the cause when it stops. Fix the cause it names and run it again. These are the cases that come up most.

| What you see | What to do |
| --- | --- |
| `ffmpeg could not start` | FFmpeg is not installed or not on PATH. See setup.md. Restart the terminal after installing. |
| `no transcription key found` | Put `GROQ_API_KEY=...` in a `.env` file in the video folder or a parent folder. The user types the key into the file, never into chat. |
| `groq answered 413` | The audio is too big for the free tier. Cut the video into parts, or use Deepgram. |
| `"L40" is not a line` | You used a line number from the wrong file. Before cutting, use `edit/lines.txt`. After cutting, scenes use `edit/cut.lines.txt`. |
| `could not find the words "..."` | Copy the words exactly from `edit/cut.lines.txt`, including the spelling the transcript used. Use 2 to 5 words. If the transcript misspelled a name, still copy the misspelling for `at`, and fix the caption with `"fix"`. |
| `the number ... is not in what was said` | Do not show it unless it is real. If it was spoken as words or comes from a document the user gave you, add `"source"`. |
| `only 0.6s long` | Two scenes start too close together. Delete one or move it. |
| A short word is missing from the captions | Check `edit/cut.words.txt`. If the word is there, the caption is fine. If the word is missing from the audio too, widen that keep range in `cuts.json`. |
| A pause is still in the cut | `cut.mjs` lists pauses over 1 second it left in. Lower `"pause"` in `cuts.json` (default 0.15) or split the keep range. |
| Text is over the face | Use `"layout": "split"` for that scene, or change `"focus"` so the face moves down into the bottom half. |
| The face is cut off in the split layout | Set `"focus"` to where the face really is, for example `[0.5, 0.3]` when the head is high in the frame. |
| The render has no sound | Run `npx hyperframes lint work`. Do not edit `work/index.html` by hand, it is rebuilt every time. Rebuild with `build.mjs`. |
| The video is sideways | Phones store rotation as a tag. FFmpeg applies it during the cut. If it is still wrong, tell the user, do not guess. |
| The face looks mirrored (text on a shirt is backwards) | Webcams often mirror. Ask the user before flipping. |
| `npx hyperframes` downloads every time | HyperFrames is not installed in the videos folder. Run `npm install hyperframes` there once. |
| Render is very slow | Normal on a laptop: a minute of video can take several minutes. Close other apps. `--quality draft` is faster for a test render. |
