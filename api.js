// ─── Journey PWA – api.js ─────────────────────────────────────────────────────
// Journey — RAWG catalog and media
// ─────────────────────────────────────────────────────────────────────────────

var useState    = React.useState;
var useEffect   = React.useEffect;
var useRef      = React.useRef;
var useCallback = React.useCallback;
var useMemo     = React.useMemo;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STORAGE_KEY  = 'gamepal_library_v1';
const USER_KEY     = 'gamepal_user_v1';
const SETTINGS_KEY = 'gamepal_settings_v1';

const PLATFORM_MAP = {
  'playstation 1':'playstation','ps1':'playstation',
  'playstation 2':'playstation2','ps2':'playstation2',
  'playstation 3':'playstation3','ps3':'playstation3',
  'playstation 4':'playstation4','ps4':'playstation4',
  'playstation 5':'playstation5','ps5':'playstation5',
  'nintendo 64':'nintendo-64','n64':'nintendo-64',
  'super nintendo':'snes','snes':'snes','nes':'nes',
  'game boy':'gameboy','game boy advance':'gameboy-advance','gba':'gameboy-advance',
  'xbox':'xbox','xbox 360':'xbox360','xbox one':'xbox-one','xbox series':'xbox-series-x',
  'pc':'pc','mac':'macos','linux':'linux',
  'switch':'nintendo-switch','nintendo switch':'nintendo-switch',
  'wii':'wii','wii u':'wii-u',
  'android':'android','ios':'ios','mobile':'android',
  'genesis':'sega-genesis','mega drive':'sega-genesis','sega':'sega-genesis',
  'dreamcast':'dreamcast','saturn':'sega-saturn',
  '3ds':'nintendo-3ds','ds':'nintendo-ds','psp':'psp','vita':'playstation-vita',
  'atari':'atari',
};

const GENRE_MAP = {
  'rpg':'role-playing-games-rpg','role playing':'role-playing-games-rpg',
  'jrpg':'role-playing-games-rpg','action rpg':'role-playing-games-rpg',
  'ação':'action','action':'action',
  'aventura':'adventure','adventure':'adventure',
  'terror':'action','horror':'action','survival horror':'action',
  'estratégia':'strategy','strategy':'strategy','rts':'strategy','turn-based':'strategy',
  'esporte':'sports','sports':'sports','futebol':'sports','football':'sports',
  'corrida':'racing','racing':'racing',
  'luta':'fighting','fighting':'fighting',
  'puzzle':'puzzle','quebra-cabeça':'puzzle',
  'simulação':'simulation','simulation':'simulation','sim':'simulation',
  'plataforma':'platformer','platformer':'platformer','platform':'platformer',
  'shooter':'shooter','fps':'shooter','tps':'shooter','third person shooter':'shooter',
  'indie':'indie','arcade':'arcade',
  'mmorpg':'massively-multiplayer','mmo':'massively-multiplayer',
  'card':'card','board':'board-games',
  'beat em up':'action','hack and slash':'action',
  'metroidvania':'platformer','roguelike':'indie','roguelite':'indie',
};

const GENRES_LIST = [
  { label: 'Action',     value: 'action'    },
  { label: 'RPG',        value: 'rpg'       },
  { label: 'Adventure',  value: 'aventura'  },
  { label: 'Strategy',   value: 'estratégia'},
  { label: 'Shooter',    value: 'shooter'   },
  { label: 'Platformer', value: 'plataforma'},
  { label: 'Fighting',   value: 'luta'      },
  { label: 'Sports',     value: 'esporte'   },
  { label: 'Racing',     value: 'corrida'   },
  { label: 'Horror',     value: 'terror'    },
  { label: 'Puzzle',     value: 'puzzle'    },
  { label: 'Indie',      value: 'indie'     },
  { label: 'Simulation', value: 'simulação' },
  { label: 'Arcade',     value: 'arcade'    },
];

const PLATFORMS_LIST = [
  'PC','PlayStation 5','PlayStation 4','PlayStation 3',
  'PlayStation 2','PlayStation 1','Xbox Series','Xbox One',
  'Xbox 360','Nintendo Switch','Wii U','Wii','Nintendo 64',
  'Super Nintendo','NES','Game Boy Advance','Game Boy',
  'PSP','PS Vita','Dreamcast','Sega Genesis','Android','iOS',
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const load = (k, fb) => { try { var v = JSON.parse(localStorage.getItem(k)); return v !== null && v !== undefined ? v : fb; } catch(e) { return fb; } };
const save = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

// ─── RAWG API ─────────────────────────────────────────────────────────────────

// Similarity score between two strings (0–1)
function nameSimilarity(a, b) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const na = norm(a), nb = norm(b);
  if (na === nb) return 1;
  if (na.startsWith(nb) || nb.startsWith(na)) return 0.95;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  // Word overlap score
  const wa = new Set(na.split(' ').filter(Boolean));
  const wb = new Set(nb.split(' ').filter(Boolean));
  const inter = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union > 0 ? inter / union : 0;
}

// Fetch raw RAWG results with given params
async function rawgFetch(params, rawgKey) {
  const url = new URL('https://api.rawg.io/api/games');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  if (rawgKey) url.searchParams.set('key', rawgKey);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'Invalid RAWG key or access denied. Check Profile.' : 'Catalog unavailable. Please try again.');
  const data = await res.json();
  return data.results || [];
}

async function searchGames({ query, genre, platform, ordering = '-rating', pageSize = 20 }, rawgKey) {
  // If it's a pure title search (no genre/platform filters), use smart matching
  const isDirectTitleSearch = query && !genre && !platform;

  if (isDirectTitleSearch) {
    // Run two parallel searches: exact flag + relevance order
    const [exactResults, relevanceResults] = await Promise.all([
      rawgFetch({ search: query, search_exact: 'true', page_size: 10 }, rawgKey),
      rawgFetch({ search: query, page_size: 20 }, rawgKey),
    ]);

    // Merge deduped results, exact first
    const seen = new Set();
    const merged = [];
    exactResults.concat(relevanceResults).forEach(function(g) {
      if (!seen.has(g.id)) { seen.add(g.id); merged.push(g); }
    });

    // Score each result by name similarity + rating weight
    const scored = merged.map(g => ({
      g,
      score: nameSimilarity(g.name, query) * 0.8 + Math.min((g.rating || 0) / 5, 1) * 0.2,
    }));

    // Sort by score desc, return top pageSize
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, pageSize).map(s => mapGame(s.g));
  }

  // Genre/platform search — use ordering as normal but still apply name sort if query present
  const params = { page_size: pageSize, ordering };
  if (query)    params.search = query;
  if (genre)  { const s = GENRE_MAP[genre.toLowerCase()];       if (s) params.genres    = s; }
  if (platform){ const s = PLATFORM_MAP[platform.toLowerCase()]; if (s) params.platforms = s; }

  const results = await rawgFetch(params, rawgKey);

  // If there was also a query, re-sort by name similarity
  if (query && results.length > 0) {
    const scored = results.map(g => ({
      g,
      score: nameSimilarity(g.name, query) * 0.6 + Math.min((g.rating || 0) / 5, 1) * 0.4,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => mapGame(s.g));
  }

  return results.map(mapGame);
}

async function fetchGameDetail(id, rawgKey) {
  const url = new URL(`https://api.rawg.io/api/games/${id}`);
  if (rawgKey) url.searchParams.set('key', rawgKey);
  const res  = await fetch(url.toString());
  if (!res.ok) throw new Error('RAWG detail error');
  const g = await res.json();
  return {
    ...mapGame(g),
    description:    g.description_raw || '',
    website:        g.website || '',
    developers:     (g.developers  || []).map(d => d.name).join(', '),
    publishers:     (g.publishers  || []).map(p => p.name).join(', '),
    tags:           (g.tags        || []).slice(0,8).map(t => t.name),
    esrb:           (g.esrb_rating && g.esrb_rating.name) || '',
    playtime:       g.playtime || 0,
    ratingsCount:   g.ratings_count || 0,
    screenshots:    [],
  };
}

function mapGame(g) {
  return {
    id:         g.id,
    name:       g.name,
    cover:      g.background_image,
    platforms:  (g.platforms || []).map(p => p.platform.name).slice(0,4).join(', ') || 'N/A',
    rating:     g.rating     ? g.rating.toFixed(1) : 'N/A',
    genres:     (g.genres    || []).map(x => x.name).slice(0,3).join(', '),
    released:   g.released   ? g.released.slice(0,4) : '',
    metacritic: g.metacritic || null,
  };
}

// ─── FIND EXACT GAME BY NAME ─────────────────────────────────────────────────
// Used for add-to-library: returns the single best match for a game title
async function findGameByName(gameName, rawgKey) {
  // Run exact + broad searches in parallel
  const [exactResults, broadResults] = await Promise.all([
    rawgFetch({ search: gameName, search_exact: 'true', page_size: 8 }, rawgKey),
    rawgFetch({ search: gameName, page_size: 16 }, rawgKey),
  ]);

  // Merge deduped
  const seen = new Set();
  const all = [];
  var _combined2 = exactResults.concat(broadResults);
  _combined2.forEach(function(g) {
    if (!seen.has(g.id)) { seen.add(g.id); all.push(g); }
  });
  if (all.length === 0) return null;

  // Score: name similarity (heavily weighted) + small rating bonus
  const scored = all.map(g => ({
    g,
    score: nameSimilarity(g.name, gameName) * 0.9 + Math.min((g.rating || 0) / 5, 1) * 0.1,
  }));
  scored.sort((a, b) => b.score - a.score);

  // Only return if similarity is reasonable (> 0.3 to avoid totally wrong matches)
  return scored[0].score > 0.3 ? mapGame(scored[0].g) : null;
}

// RAWG game pages: core metadata and optional media fail independently.
function safeMediaUrl(value) {
  if(typeof value !== 'string') return undefined;
  try { const url=new URL(value); return url.protocol==='https:'?url.href:undefined; } catch(e) { return undefined; }
}
async function fetchGameOverview(id,key,signal) {
  async function request(suffix='') {
    const url=new URL('https://api.rawg.io/api/games/'+encodeURIComponent(id)+suffix);
    url.searchParams.set('key',key);
    const res=await fetch(url.toString(),{signal});
    if(!res.ok)throw Error(res.status===401||res.status===403?'Check your RAWG key in Profile.':'Unable to reach RAWG. Please try again.');
    return res.json();
  }
  const [core,shots,movies]=await Promise.allSettled([request(),request('/screenshots'),request('/movies')]);
  if(core.status==='rejected')throw core.reason;
  const g=core.value;
  return {info:{...mapGame(g),description:g.description_raw||'',releaseDate:g.released||'',developers:(g.developers||[]).map(d=>d.name).join(', '),publishers:(g.publishers||[]).map(p=>p.name).join(', '),platformDetails:(g.platforms||[]).map(p=>({name:p.platform.name,released_at:p.released_at})),website:g.website||'',esrb:g.esrb_rating?.name||'',tags:(g.tags||[]).filter(t=>!t.language||t.language==='eng').slice(0,16).map(t=>t.name),screenshots:shots.status==='fulfilled'?(shots.value.results||[]):[],trailers:movies.status==='fulfilled'?(movies.value.results||[]):[]},errors:[...(shots.status==='rejected'?['screenshots']:[]),...(movies.status==='rejected'?['trailers']:[])]};
}
