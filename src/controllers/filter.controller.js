import filterOptions from '../utils/filter.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { validationError } from '../utils/errors.js';
import { extractListPage } from '../extractor/extractListpage.js';

const filterController = async (c) => {
  const {
    // will receive string and send as a string
    keyword = null,
   

    // will recieve an array as string will "," saparated and send as "," saparated string
   

    // will recieve as string and send as index of that string "see filterOptions"
    type = null,
    status = null,
    rated = null,
    score = null,
    season = null,
    language = null,
    sort = null,
    genres = null,

    // date parts (start/end) - sy/sm/sd and ey/em/ed
    sy = null,
    sm = null,
    sd = null,
    ey = null,
    em = null,
    ed = null,

    // also accept direct start_date and end_date (YYYY-MM-DD)
    start_date = null,
    end_date = null,

    page = 1,
  } = c.req.query();

  const pageNum = Number(page);

  // compute start/end dates from parts if necessary (for validation and building)
  const pad = (n) => String(n).padStart(2, '0');
  const computedStartDate = start_date || (sy ? `${sy}-${pad(sm || '1')}-${pad(sd || '1')}` : null);
  const computedEndDate = end_date || (ey ? `${ey}-${pad(em || '1')}-${pad(ed || '1')}` : null);

  // Validate incoming query params and return helpful messages for invalid ones
  const isValidDateString = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

  const raw = { type, status, rated, score, season, language, sort, genres };

  // Validate option keys — prefer site 'value' strings but accept 'key' names too (we map both to select.value)
  const optionKeys = ['type', 'status', 'rated', 'score', 'season', 'language'];
  for (const k of optionKeys) {
    const v = raw[k];
    if (v == null) continue;
    const s = String(v).trim();

    // find select array for this key (use `filterOptions[k]` when it's an array of objects)
    const selectArr = Array.isArray(filterOptions[k]) && filterOptions[k].length && typeof filterOptions[k][0] === 'object'
      ? filterOptions[k]
      : null;

    if (selectArr) {
      const values = selectArr.map((x) => x.value);
      const keys = selectArr.map((x) => x.key);
      const normalized = s.toLowerCase().replace(/[-\s]/g, '_');
      const ok = values.includes(s) || keys.includes(normalized);
      if (!ok) throw new validationError(`Invalid '${k}' value. Expected one of: ${values.join(', ')} or keys: ${keys.join(', ')}`);
    } else {
      // fallback to legacy behavior (string arrays)
      if (/^\d+$/.test(s)) {
        const num = Number(s);
        if (num < 0 || num >= filterOptions[k].length) {
          throw new validationError(`Invalid '${k}' numeric value. Expected 0-${filterOptions[k].length - 1}`);
        }
      } else {
        const normalized = s.toLowerCase().replace(/[-\s]/g, '_');
        if (filterOptions[k].indexOf(normalized) === -1) {
          throw new validationError(`Invalid '${k}' value. Expected one of: ${filterOptions[k].join(', ')}`);
        }
      }
    }
  }

  // Validate sort — accept site select values or site keys (and legacy normalized values)
  if (sort) {
    const rawSort = String(sort).trim();
    const sortValues = Array.isArray(filterOptions.sort) && filterOptions.sort.length && typeof filterOptions.sort[0] === 'object'
      ? filterOptions.sort.map((x) => x.value)
      : [];
    const sortKeys = Array.isArray(filterOptions.sort) && filterOptions.sort.length && typeof filterOptions.sort[0] === 'object'
      ? filterOptions.sort.map((x) => x.key)
      : [];
    const legacySortValues = Array.isArray(filterOptions.sort) && typeof filterOptions.sort[0] === 'string' ? filterOptions.sort : [];

    const normalized = rawSort.toLowerCase().replace(/[-\s]/g, '_');
    const ok = sortValues.includes(rawSort) || sortKeys.includes(normalized) || (legacySortValues.length && legacySortValues.includes(normalized));
    if (!ok) {
      throw new validationError(`Invalid 'sort' value. Expected values: ${sortValues.join(', ')} or keys: ${sortKeys.join(', ')}${legacySortValues.length ? ` or legacy: ${legacySortValues.join(', ')}` : ''}`);
    }
  }

  // Validate genres (accept site numeric ids or names)
  if (genres) {
    const parts = String(genres).split(',').map((g) => g.trim()).filter(Boolean);
    const genresArr = filterOptions.genres || [];
    const idSet = new Set((genresArr || []).map((x) => x.value));
    const keySet = new Set((genresArr || []).map((x) => x.key));
    for (const g of parts) {
      if (/^\d+$/.test(g)) {
        if (!idSet.has(g)) throw new validationError(`Invalid 'genres' numeric value: ${g}`);
      } else {
        const normalized = g.toLowerCase().replace(/[-\s]/g, '_');
        if (!keySet.has(normalized)) throw new validationError(`Invalid 'genres' value: ${g}`);
      }
    }
  }

  // Validate date part selects (sy/sm/sd and ey/em/ed) against filterOptions
  const validateSelectValue = (arr, name, val) => {
    if (!arr || val == null || String(val).trim() === '') return;
    const values = (arr || []).map((x) => String(x.value));
    if (!values.includes(String(val))) {
      throw new validationError(`Invalid '${name}' value. Expected one of: ${values.join(', ')}`);
    }
  };

  validateSelectValue(filterOptions.sy, 'sy', sy);
  validateSelectValue(filterOptions.sm, 'sm', sm);
  validateSelectValue(filterOptions.sd, 'sd', sd);
  validateSelectValue(filterOptions.ey, 'ey', ey);
  validateSelectValue(filterOptions.em, 'em', em);
  validateSelectValue(filterOptions.ed, 'ed', ed);

  // Validate dates
  if (computedStartDate && !isValidDateString(computedStartDate)) {
    throw new validationError("Invalid 'start_date'. Use YYYY-MM-DD");
  }
  if (computedEndDate && !isValidDateString(computedEndDate)) {
    throw new validationError("Invalid 'end_date'. Use YYYY-MM-DD");
  }
  if (computedStartDate && computedEndDate) {
    if (new Date(computedStartDate) > new Date(computedEndDate)) {
      throw new validationError('start_date must be before or equal to end_date');
    }
  }

  const queryArr = [
    { title: 'keyword', val: keyword },
    { title: 'type', val: type },
    { title: 'status', val: status },
    { title: 'rated', val: rated },
    { title: 'score', val: score },
    { title: 'season', val: season },
    { title: 'language', val: language },
    // pass date parts directly (site expects sy, sm, sd, ey, em, ed as separate params) - placed before sort
    { title: 'sy', val: sy },
    { title: 'sm', val: sm },
    { title: 'sd', val: sd },
    { title: 'ey', val: ey },
    { title: 'em', val: em },
    { title: 'ed', val: ed },
    { title: 'sort', val: sort },
    { title: 'genres', val: genres },
  ];

  const params = new URLSearchParams();

  queryArr.forEach((v) => {
    if (v.val) {
      switch (v.title) {
        case 'keyword':
          params.set('keyword', formatKeyword(v.val));
          break;
        case 'genres':
          params.set('genres', formatGenres(v.val));
          break;
        case 'sort': {
          const formattedSort = formatSort(v.val);
          if (formattedSort) params.set('sort', formattedSort);
          break;
        }
        case 'sy':
        case 'sm':
        case 'sd':
        case 'ey':
        case 'em':
        case 'ed': {
          if (v.val != null) params.set(v.title, String(v.val));
          break;
        }
        default: {
          const formattedOption = formatOption(v.title, v.val);
          if (formattedOption) params.set(v.title, formattedOption);
        }
      }
    }
  });

  // Always send page (server expects explicit page param)
  params.set('page', String(pageNum));

  // Note: we now pass date parts (sy/sm/sd and ey/em/ed) directly to the upstream endpoint, so we no longer set 'start_date'/'end_date' here.

  const endpoint = keyword ? '/search' : '/filter';
  const queryString = params.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  // log the actual outbound URL to help users debug formatting issues
  console.log('Fetching:', url);

  const result = await axiosInstance(url);

  console.log(result.message || 'no message from source');

  if (!result.success) {
    // include remote message if available for clarity
    const remoteMsg = result.message ? `: ${result.message}` : '';
    throw new validationError(`something went wrong with queries${remoteMsg}`);
  }
  const response = extractListPage(result.data);
  return response;
};

const formatKeyword = (v) => v.toLowerCase();

const formatSort = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  const sortArr = Array.isArray(filterOptions.sort) && filterOptions.sort.length && typeof filterOptions.sort[0] === 'object'
    ? filterOptions.sort
    : [];

  // If the client passed a site 'value', return it unchanged
  if (sortArr.some((x) => x.value === s)) return s;

  // If the client passed a site 'key' (e.g., 'release_date'), map it to its 'value' (e.g., 'released_date')
  const normalized = s.toLowerCase().replace(/[-\s]/g, '_');
  const found = sortArr.find((x) => x.key === normalized);
  if (found) return found.value;

  // fallback: legacy normalized string array
  if (filterOptions.sort && Array.isArray(filterOptions.sort) && typeof filterOptions.sort[0] === 'string') {
    const norm = normalized;
    if (filterOptions.sort.indexOf(norm) !== -1) return norm;
  }
  return null;
};

const formatGenres = (v) => {
  const parts = String(v)
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  const genresArr = filterOptions.genres || [];
  const idSet = new Set((genresArr || []).map((g) => g.value));
  const keyToId = new Map((genresArr || []).map((g) => [g.key, g.value]));

  const ids = parts
    .map((genre) => {
      if (/^\d+$/.test(genre)) {
        // numeric id provided by UI
        return idSet.has(genre) ? genre : null;
      }
      const normalized = genre.toLowerCase().replace(/[-\s]/g, '_');
      if (keyToId.has(normalized)) return keyToId.get(normalized);
      // attempt to match legacy names if present
      if (Array.isArray(filterOptions.genres)) {
        const idx = filterOptions.genres.indexOf(normalized);
        if (idx !== -1) {
          const candidate = String(idx + 1);
          if (idSet.has(candidate)) return candidate;
        }
      }
      return null;
    })
    .filter(Boolean);

  return ids.length > 0 ? ids.join(',') : '';
};

const formatOption = (k, v) => {
  if (v == null) return null;
  const s = String(v).trim();

  // If we have an explicit select array of objects, prefer that and return its 'value'
  const selectArr = Array.isArray(filterOptions[k]) && filterOptions[k].length && typeof filterOptions[k][0] === 'object'
    ? filterOptions[k]
    : null;

  if (selectArr) {
    // if v matches a value already, return it
    if (selectArr.some((x) => x.value === s)) return s;
    // if v matches a key/name, map to its value
    const normalized = s.toLowerCase().replace(/[-\s]/g, '_');
    const found = selectArr.find((x) => x.key === normalized);
    if (found) return found.value;
    return null;
  }

  // fallback to legacy arrays (string lists)
  if (/^\d+$/.test(s)) {
    const num = Number(s);
    if (num >= 0 && num < filterOptions[k].length) return String(num);
    return null;
  }

  const normalized = s.toLowerCase().replace(/[-\s]/g, '_');
  const index = filterOptions[k].indexOf(normalized);
  if (index === -1) return null;
  return String(index);
};
export default filterController;
