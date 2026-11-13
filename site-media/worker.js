// Serves the static video files with byte-range support, which Safari and iPhones need to play MP4.
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
    const headers = new Headers(res.headers);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Access-Control-Allow-Origin", "*");
    if (new URL(request.url).pathname.endsWith(".mp4")) headers.set("Cache-Control", "public, max-age=604800");
    const range = request.headers.get("Range");
    if (!res.ok || !range) return new Response(request.method === "HEAD" ? null : res.body, { status: res.status, headers });
    const buf = await res.arrayBuffer();
    const size = buf.byteLength;
    const m = range.match(/bytes=(\d*)-(\d*)/);
    let start = m && m[1] ? +m[1] : 0, end = m && m[2] ? +m[2] : size - 1;
    if (m && !m[1] && m[2]) { start = Math.max(0, size - +m[2]); end = size - 1; }
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    end = Math.min(end, size - 1);
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(request.method === "HEAD" ? null : buf.slice(start, end + 1), { status: 206, headers });
  },
};
