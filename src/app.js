import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { rateLimiter } from 'hono-rate-limiter';
import { swaggerUI } from '@hono/swagger-ui';
import hiAnimeRoutes from './routes/routes.js';
import { AppError } from './utils/errors.js';
import { fail } from './utils/response.js';
import hianimeApiDocs from './utils/swaggerUi.js';
import { logger } from 'hono/logger';
import config from './config/config.js';
import { injectVercelScripts } from './utils/vercelInsights.js';
import { track } from '@vercel/analytics/server';

const app = new Hono();
const origins = config.origin.includes(',')
  ? config.origin.split(',').map(o => o.trim())
  : (config.origin === '*' ? '*' : [config.origin]);

app.use(
  '*',
  cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range', 'Accept', 'Accept-Encoding'],
    exposeHeaders: ['Content-Length', 'X-Request-Id', 'Content-Range', 'Accept-Ranges', 'Cache-Control'],
    maxAge: 600,
    credentials: true,
  })
);

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();

  const isVercelEnabled = config.vercel.enabled;
  const analyticsEnabled = config.vercel.analytics.enabled;
  const speedInsightsEnabled = config.vercel.speedInsights.enabled;
  const shouldInject = isVercelEnabled && (analyticsEnabled || speedInsightsEnabled);

  const contentType = c.res.headers.get('content-type') || '';
  if (shouldInject && contentType.includes('text/html')) {
    const html = await c.res.text();
    const injected = injectVercelScripts(html, {
      analyticsEnabled,
      speedInsightsEnabled,
    });
    const headers = new Headers(c.res.headers);
    headers.delete('content-length');
    c.res = new Response(injected, {
      status: c.res.status,
      statusText: c.res.statusText,
      headers,
    });
  }

  if (isVercelEnabled && config.vercel.analytics.serverEvents && c.req.path.startsWith('/api')) {
    if (typeof c.executionCtx?.waitUntil !== 'function') {
      return;
    }
    try {
      const durationMs = Date.now() - start;
      const payload = {
        method: c.req.method,
        path: c.req.path,
        status: c.res?.status ?? 0,
        duration_ms: durationMs,
      };
      const work = track('api_request', payload);
      c.executionCtx.waitUntil(work);
    } catch (err) {
      console.error('Vercel analytics track failed:', err?.message || err);
    }
  }
});

if (config.rateLimit.enabled && !config.isCloudflare) {
  app.use(
    '*',
    rateLimiter(
      {
        windowMs: config.rateLimit.windowMs,
        limit: config.rateLimit.limit,
        standardHeaders: 'draft-6',
        keyGenerator: (c) => {
          const cfConnectingIp = c.req.header('cf-connecting-ip');
          const realIp = c.req.header('x-real-ip');
          const forwarded = c.req.header('x-forwarded-for');

          return cfConnectingIp || realIp || forwarded?.split(',')[0].trim() || 'unknown';
        },
        skip: (c) => {
          const path = c.req.path;
          return path.includes('/proxy') || path.includes('/embed');
        },
      }
    )
  );
}

if (!config.isProduction || config.enableLogging) {
  app.use('/api/v1/*', logger());
}

app.get('/ui', (c) => {
  c.status(200);
  return c.json({
    message: 'Welcome to HiAnime API, Crafted by RY4N',
    documentation: '/api/v1',
    swagger: '/',
    docs: '/docs',
    health: '/ping',
    version: '1.0.0',
    environment: 'cloudflare-workers',
    redis: config.redis.enabled ? 'enabled' : 'disabled',
  });
});

app.get('/ping', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'cloudflare-workers',
  });
});

app.route('/api/v1', hiAnimeRoutes);
app.get('/api', (c) => {
  return c.redirect('/');
});
app.get('/docs', (c) => c.json(hianimeApiDocs));
app.get('/', swaggerUI({ url: '/docs' }));
app.onError((err, c) => {
  if (err instanceof AppError) {
    return fail(c, err.message, err.statusCode, err.details);
  }

  console.error('Unexpected Error:', err.message);
  if (!config.isProduction) {
    console.error('Stack:', err.stack);
  }

  return fail(c, 'Internal server error', 500);
});

app.notFound((c) => {
  return fail(c, 'Route not found', 404);
});

export default app;
