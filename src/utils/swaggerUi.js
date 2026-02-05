import config from '../config/config.js';
import filterOptions from './filter.js';

// Build filter parameters dynamically from filterOptions
const optionEnum = (arr) => (Array.isArray(arr) ? [...new Set([...(arr.map((x) => String(x.value))), ...(arr.map((x) => String(x.key || '')))])].filter(Boolean) : []);
const presentEnum = (arr) => (Array.isArray(arr) ? arr.map((x) => String(x.value)) : []);
const present = (arr) => (Array.isArray(arr) ? arr.map((x) => ({ value: x.value, key: x.key, label: x.label })) : []);

const filterParameters = [
  { name: 'keyword', in: 'query', schema: { type: 'string' } },
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
  {
    name: 'genres',
    in: 'query',
    required: false,
    schema: {
      type: 'string',
      // accepts comma-separated keys (e.g., 'action') or numeric ids (e.g., '1')
      enum: optionEnum(filterOptions.genres),
    },
    description: 'Comma-separated list of genres (either numeric ids or keys).',
  },
  ...['type','status','rated','score','season','language'].map((k) => ({
    name: k,
    in: 'query',
    required: false,
    schema: { type: 'string', enum: optionEnum(filterOptions[k]) },
    description: `Accepts site select values or keys for ${k}.`,
  })),
  // date parts (sy/sm/sd and ey/em/ed)
  { name: 'sy', in: 'query', schema: { type: 'string', enum: presentEnum(filterOptions.sy) }, description: 'Start year (YYYY) - use site select values' },
  { name: 'sm', in: 'query', schema: { type: 'string', enum: presentEnum(filterOptions.sm) }, description: 'Start month (1-12)' },
  { name: 'sd', in: 'query', schema: { type: 'string', enum: presentEnum(filterOptions.sd) }, description: 'Start day (1-31)' },
  { name: 'ey', in: 'query', schema: { type: 'string', enum: presentEnum(filterOptions.ey) }, description: 'End year (YYYY) - use site select values' },
  { name: 'em', in: 'query', schema: { type: 'string', enum: presentEnum(filterOptions.em) }, description: 'End month (1-12)' },
  { name: 'ed', in: 'query', schema: { type: 'string', enum: presentEnum(filterOptions.ed) }, description: 'End day (1-31)' },
  // sort accepts site values and keys
  {
    name: 'sort',
    in: 'query',
    schema: {
      type: 'string',
      enum: optionEnum(filterOptions.sort),
    },
    description: 'Sort by site value or key (e.g., released_date or release_date).',
  },
];

const hianimeApiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'hianime-api',
    version: '2.0.0',
    description: 'API Documentation For HiAnime Content Endpoints',
  },
  servers: [
    {
      url: `${config.baseUrl}/api/${config.apiVersion}`,
    },
  ],
  paths: {
    '/home': {
      get: {
        summary: 'Fetch homepage content',
        description:
          'Includes spotlight, top airing, trending, most popular/favorite, new added, updated, etc.',
        responses: {
          200: {
            description: 'Success',
          },
        },
      },
    },
    '/animes/az-list/{letter}': {
      get: {
        summary: 'A-Z anime list',
        parameters: [
          {
            name: 'letter',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'all',
                'other',
                '0-9',
                'a',
                'b',
                'c',
                'd',
                'e',
                'f',
                'g',
                'h',
                'i',
                'j',
                'k',
                'l',
                'm',
                'n',
                'o',
                'p',
                'q',
                'r',
                's',
                't',
                'u',
                'v',
                'w',
                'x',
                'y',
                'z',
              ],
            },
            description: 'Alphabet letter or special code (0-9, all, other)',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Anime A-Z list',
          },
        },
      },
    },
    '/animes/top-airing': {
      get: {
        summary: 'Top airing anime',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/most-popular': {
      get: {
        summary: 'Most popular anime',
        parameters: [
          { name: 'page', in: 'query', required: true, schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/most-favorite': {
      get: {
        summary: 'Most favorite anime',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/completed': {
      get: {
        summary: 'Completed anime series',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/recently-added': {
      get: {
        summary: 'Recently added anime',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/recently-updated': {
      get: {
        summary: 'Recently updated anime',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/top-upcoming': {
      get: {
        summary: 'Top upcoming anime',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/genre/{genre}': {
      get: {
        summary: 'Anime by genre',
        parameters: [
          {
            name: 'genre',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'action',
                'adventure',
                'cars',
                'comedy',
                'dementia',
                'demons',
                'drama',
                'ecchi',
                'fantasy',
                'game',
                'harem',
                'historical',
                'horror',
                'isekai',
                'josei',
                'kids',
                'magic',
                'martial arts',
                'mecha',
                'military',
                'music',
                'mystery',
                'parody',
                'police',
                'psychological',
                'romance',
                'samurai',
                'school',
                'sci-fi',
                'seinen',
                'shoujo',
                'shoujo ai',
                'shounen',
                'shounen ai',
                'slice of life',
                'space',
                'sports',
                'super power',
                'supernatural',
                'thriller',
                'vampire',
              ],
            },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/subbed-anime': {
      get: {
        summary: 'Subbed anime list',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/dubbed-anime': {
      get: {
        summary: 'Dubbed anime list',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/movie': {
      get: {
        summary: 'Anime movies',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/tv': {
      get: {
        summary: 'Anime TV series',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/ova': {
      get: {
        summary: 'Anime OVAs',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/ona': {
      get: {
        summary: 'Anime ONAs',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/special': {
      get: {
        summary: 'Anime Specials',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/events': {
      get: {
        summary: 'Anime Events',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/anime/{id}': {
      get: {
        summary: 'Anime detail by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/search': {
      get: {
        summary: 'Search anime',
        parameters: [
          { name: 'keyword', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/filter': {
      get: {
        summary: 'Filter anime',
        parameters: filterParameters,
        responses: { 200: { description: 'Success' } },
      },
    },
    '/suggestion': {
      get: {
        summary: 'Search suggestions',
        parameters: [
          { name: 'keyword', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/characters/{id}': {
      get: {
        summary: 'Anime characters by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/character/{id}': {
      get: {
        summary: 'Character or actor detail',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/episodes/{id}': {
      get: {
        summary: 'Episodes by anime ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/servers': {
      get: {
        summary: 'Episode servers',
        parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/stream': {
      get: {
        summary: 'Stream episode',
        parameters: [
          { name: 'id', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', default: 'sub' } },
          { name: 'server', in: 'query', schema: { type: 'string', default: 'hd-2' } },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/schedules': {
      get: {
        summary: 'Get anime schedule',
        description: 'Fetches the schedule of anime releases',
        responses: { 200: { description: 'Success' } },
      },
    },
    '/schedule/next/{id}': {
      get: {
        summary: 'Get next episode schedule',
        description: 'Fetches the next episode schedule for a specific anime',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/filter/options': {
      get: {
        summary: 'Get filter options',
        description: 'Returns available filter options for anime search',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
                example: {
                  type: present(filterOptions.type),
                  status: present(filterOptions.status),
                  rated: present(filterOptions.rated),
                  score: present(filterOptions.score),
                  season: present(filterOptions.season),
                  language: present(filterOptions.language),
                  sort: present(filterOptions.sort),
                  genres: present(filterOptions.genres),
                  dateParts: {
                    sy: { min: 1917, max: new Date().getFullYear() },
                    sm: { min: 1, max: 12 },
                    sd: { min: 1, max: 31 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/genres': {
      get: {
        summary: 'Get all genres',
        description: 'Fetches a list of all available anime genres',
        responses: { 200: { description: 'Success' } },
      },
    },
    '/animes/producer/{producer}': {
      get: {
        summary: 'Anime by producer',
        description: 'Fetches anime filtered by production studio/company',
        parameters: [
          {
            name: 'producer',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Producer/studio name slug',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/news': {
      get: {
        summary: 'Get anime news',
        description: 'Fetches latest anime news articles',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/watch2gether': {
      get: {
        summary: 'Get watch2gether rooms',
        description: 'Fetches active watch party rooms',
        parameters: [
          {
            name: 'room',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'on_air', 'scheduled', 'waiting', 'ended'], default: 'all' },
          },
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/embed/{server}/{id}/{type}': {
      get: {
        summary: 'Embedded video player',
        description: 'Returns an embedded video player for the specified episode',
        parameters: [
          { name: 'server', in: 'path', required: true, schema: { type: 'string', enum: ['hd-1', 'hd-2'], default: 'hd-2' }, description: 'Server ID' },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Episode ID' },
          { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['sub', 'dub'], default: 'sub' }, description: 'Audio type' },
        ],
        responses: { 200: { description: 'HTML video player page' } },
      },
    },
    '/embed': {
      get: {
        summary: 'Embedded video player (query params)',
        description: 'Returns an embedded video player using query parameters',
        parameters: [
          { name: 'id', in: 'query', required: true, schema: { type: 'string' }, description: 'Episode ID' },
          { name: 'server', in: 'query', schema: { type: 'string', enum: ['hd-1', 'hd-2'], default: 'hd-2' }, description: 'Server ID' },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['sub', 'dub'], default: 'sub' }, description: 'Audio type' },
        ],
        responses: { 200: { description: 'HTML video player page' } },
      },
    },
    '/proxy': {
      get: {
        summary: 'Proxy video streams and subtitles',
        description: 'Proxies video streams and subtitles with proper headers to bypass CORS restrictions',
        parameters: [
          { name: 'url', in: 'query', required: true, schema: { type: 'string' }, description: 'URL to proxy (video stream or subtitle file)' },
          { name: 'referer', in: 'query', schema: { type: 'string', default: 'https://megacloud.tv' }, description: 'Referer header value' },
        ],
        responses: {
          200: { description: 'Proxied content (video stream or subtitle file)' },
          400: { description: 'Missing URL parameter' },
          500: { description: 'Proxy error' },
        },
      },
    },
    '/random': {
      get: {
        summary: 'Get random anime',
        description: 'Fetches a random anime ID',
        responses: { 200: { description: 'Success' } },
      },
    },
    '/admin/clear-cache': {
      get: {
        summary: 'Clear Redis cache',
        description: 'Clears all cached data from Redis. Returns the number of keys cleared.',
        responses: {
          200: {
            description: 'Cache cleared successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    keysCleared: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default hianimeApiDocs;
