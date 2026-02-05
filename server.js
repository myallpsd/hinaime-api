import http from 'http';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  try {
    const headers = {};
    for (const [k, v] of Object.entries(req.headers || {})) headers[k] = v;
    const url = new URL(req.url, `http://${req.headers.host}`);

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks);

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: raw.length ? raw : undefined,
    });

    const response = await app.fetch(request);

    res.writeHead(response.status, Object.fromEntries(response.headers));
    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Local server error:', err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Local Node server running on http://0.0.0.0:${PORT}`);
});