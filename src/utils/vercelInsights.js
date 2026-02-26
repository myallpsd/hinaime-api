const ANALYTICS_SCRIPT_SRC = '/_vercel/insights/script.js';
const SPEED_INSIGHTS_SCRIPT_SRC = '/_vercel/speed-insights/script.js';

const buildVercelScripts = ({ analyticsEnabled, speedInsightsEnabled }) => {
  const parts = [];

  if (analyticsEnabled) {
    parts.push(
      "<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>"
    );
    parts.push(`<script defer src="${ANALYTICS_SCRIPT_SRC}"></script>`);
  }

  if (speedInsightsEnabled) {
    parts.push(
      "<script>window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};</script>"
    );
    parts.push(`<script defer src="${SPEED_INSIGHTS_SCRIPT_SRC}"></script>`);
  }

  return parts.join('');
};

const injectVercelScripts = (html, options) => {
  if (!html) return html;

  const hasAnalytics = html.includes(ANALYTICS_SCRIPT_SRC);
  const hasSpeed = html.includes(SPEED_INSIGHTS_SCRIPT_SRC);
  if (hasAnalytics || hasSpeed) return html;

  const scripts = buildVercelScripts(options);
  if (!scripts) return html;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${scripts}</body>`);
  }
  if (html.includes('</head>')) {
    return html.replace('</head>', `${scripts}</head>`);
  }
  return html + scripts;
};

export { buildVercelScripts, injectVercelScripts };
