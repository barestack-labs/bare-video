# Site media

The website's videos are not in git, so cloning Bare Video stays small. They are served by a tiny Cloudflare Worker (`worker.js`) that adds the byte-range support Safari and iPhones need to play MP4.

- Live at https://bare-video-media.ablazapaulmartin.workers.dev
- The MP4 files are kept in `agent-folder/bare-video/site-media/` on Paul's machine. To redeploy, copy them into `site-media/files/` (ignored by git), run `npx wrangler deploy` from this folder, then delete `files/` again.
- Keep each file under 25 MB. Encode with: `ffmpeg -i in.mp4 -vf scale=720:-2 -c:v libx264 -preset slow -crf 28 -c:a aac -b:a 96k -movflags +faststart out.mp4`
