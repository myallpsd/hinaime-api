import app from '../src/app.js';

// Vercel serverless handler: adapts Node's req/res to Web Fetch API
export default async function handler(req, res) {
  try {
    const headers = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (v !== undefined) headers[k] = v;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Collect body (if any)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks);

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: raw.length ? raw : undefined,
    });

    // Forward to Hono app which exposes fetch(request)
    const response = await app.fetch(request);

    // Copy status and headers
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream body
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.end(buffer);
  } catch (err) {
    console.error('Vercel handler error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}