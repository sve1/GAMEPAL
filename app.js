// ─── GamePal PWA – app.js ─────────────────────────────────────────────────────
// v4 — Groq AI (llama-3.3-70b), Game Detail Popup, Search + Library
// ─────────────────────────────────────────────────────────────────────────────

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STORAGE_KEY  = 'gamepal_library_v1';
const CHAT_KEY     = 'gamepal_chat_v1';
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
const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const save = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── RAWG API ─────────────────────────────────────────────────────────────────
async function searchGames({ query, genre, platform, ordering = '-rating', pageSize = 20 }, rawgKey) {
  const url = new URL('https://api.rawg.io/api/games');
  if (query)    url.searchParams.set('search', query);
  if (genre)  { const s = GENRE_MAP[genre.toLowerCase()];    if (s) url.searchParams.set('genres',    s); }
  if (platform){ const s = PLATFORM_MAP[platform.toLowerCase()]; if (s) url.searchParams.set('platforms', s); }
  url.searchParams.set('ordering',   ordering);
  url.searchParams.set('page_size',  String(pageSize));
  if (rawgKey) url.searchParams.set('key', rawgKey);
  const res  = await fetch(url.toString());
  if (!res.ok) throw new Error('RAWG API error ' + res.status);
  const data = await res.json();
  return (data.results || []).map(mapGame);
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
    esrb:           g.esrb_rating?.name || '',
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
// Dedicated function for add-to-library: uses search_exact + name similarity
async function findGameByName(gameName, rawgKey) {
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(gameName);

  // Try 3 strategies to find the most accurate match

  // Strategy A: search_exact=true — RAWG's strict name match
  const urlA = new URL('https://api.rawg.io/api/games');
  urlA.searchParams.set('search', gameName);
  urlA.searchParams.set('search_exact', 'true');
  urlA.searchParams.set('page_size', '5');
  if (rawgKey) urlA.searchParams.set('key', rawgKey);

  try {
    const resA = await fetch(urlA.toString());
    const dataA = await resA.json();
    if (dataA.results && dataA.results.length > 0) {
      // Pick best match by name similarity
      const sorted = dataA.results.sort((a, b) => {
        const simA = normalize(a.name) === target ? 1 : normalize(a.name).includes(target) ? 0.8 : 0;
        const simB = normalize(b.name) === target ? 1 : normalize(b.name).includes(target) ? 0.8 : 0;
        return simB - simA;
      });
      return mapGame(sorted[0]);
    }
  } catch {}

  // Strategy B: regular search ordered by relevance (no ordering param = RAWG relevance)
  const urlB = new URL('https://api.rawg.io/api/games');
  urlB.searchParams.set('search', gameName);
  urlB.searchParams.set('page_size', '10');
  if (rawgKey) urlB.searchParams.set('key', rawgKey);

  try {
    const resB = await fetch(urlB.toString());
    const dataB = await resB.json();
    if (dataB.results && dataB.results.length > 0) {
      // Find best name match
      const results = dataB.results;
      // Exact match first
      const exact = results.find(g => normalize(g.name) === target);
      if (exact) return mapGame(exact);
      // Contains match
      const contains = results.find(g => normalize(g.name).includes(target) || target.includes(normalize(g.name)));
      if (contains) return mapGame(contains);
      // Fallback: first result
      return mapGame(results[0]);
    }
  } catch {}

  return null;
}

// ─── GROQ API ─────────────────────────────────────────────────────────────────
async function callGroq(messages, systemPrompt, groqKey) {
  if (!groqKey) throw new Error('Chave Groq não configurada. Vá em Configurações ⚙️');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',   // melhor modelo Groq — gratuito
      temperature: 0.7,
      max_tokens:  1000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      ],
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Groq API error');
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('Resposta vazia do Groq. Tente novamente.');
  return text;
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are GamePal, a gaming assistant. You MUST ALWAYS respond with a single raw JSON object. No markdown, no backticks, no prose outside JSON.

Every response must be ONE of these THREE JSON formats:

FORMAT 1 - user wants to find/search/discover/recommend games:
{"action":"search","params":{"query":"keyword","genre":"rpg","platform":"PlayStation 1","ordering":"-rating"},"message":"Short reply in user language"}

FORMAT 2 - user wants to ADD a specific game to their library (backlog/playing/finished):
{"action":"add","gameName":"Exact Game Name","status":"backlog","message":"Short confirmation in user language"}

FORMAT 3 - user is just chatting:
{"action":"chat","message":"Reply in user language"}

SEARCH EXAMPLES:
"rpgs de ps1" → {"action":"search","params":{"genre":"rpg","platform":"PlayStation 1","ordering":"-rating"},"message":"Os melhores RPGs do PS1!"}
"jogos de terror" → {"action":"search","params":{"genre":"terror","ordering":"-rating"},"message":"Jogos de terror para você!"}
"melhores jogos switch" → {"action":"search","params":{"platform":"Nintendo Switch","ordering":"-rating"},"message":"Os melhores do Switch!"}

ADD EXAMPLES:
"adicionar Final Fantasy VII ao backlog" → {"action":"add","gameName":"Final Fantasy VII","status":"backlog","message":"Final Fantasy VII adicionado ao backlog! 📋"}
"quero jogar God of War" → {"action":"add","gameName":"God of War","status":"playing","message":"God of War marcado como jogando! 🎮"}
"add Zelda to backlog" → {"action":"add","gameName":"The Legend of Zelda","status":"backlog","message":"Zelda added to backlog! 📋"}
"terminei de jogar The Last of Us" → {"action":"add","gameName":"The Last of Us","status":"finished","message":"The Last of Us marcado como finalizado! ✅"}
"marcar Dark Souls como finalizado" → {"action":"add","gameName":"Dark Souls","status":"finished","message":"Dark Souls marcado como finalizado! ✅"}

STATUS VALUES: "backlog", "playing", "finished"
GENRE VALUES: rpg, action, aventura, estratégia, sports, corrida, luta, puzzle, simulação, plataforma, shooter, indie, arcade, terror
PLATFORM VALUES: "PlayStation 1","PlayStation 2","PlayStation 3","PlayStation 4","PlayStation 5","Nintendo Switch","PC","Xbox 360","Xbox One","Nintendo 64","Super Nintendo"
ORDERING: "-rating" (best), "-released" (newest), "-added" (popular)

STRICT RULES:
- Output ONLY raw JSON — no text before or after, no markdown, no backticks
- Use action:add when user wants to save/add/mark/register a specific game to their list
- Use action:search when user asks for recommendations, lists, or discovery
- message must always be in the same language the user used`;

// ─── GAME DETAIL POPUP ────────────────────────────────────────────────────────
function GameDetailPopup({ gameId, rawgKey, library, onUpdateLibrary, onClose }) {
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    fetchGameDetail(gameId, rawgKey)
      .then(d => { setDetail(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [gameId]);

  // Close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const entry = detail ? library[detail.id] : null;
  const SC = { backlog:'#6c63ff', playing:'#00d4aa', finished:'#f4c430' };
  const SL = { backlog:'📋 Backlog', playing:'🎮 Jogando', finished:'✅ Finalizado' };

  const setStatus = (status) => {
    if (!detail) return;
    const now = Date.now();
    onUpdateLibrary({ ...library, [detail.id]: { ...entry, game: detail, status, updatedAt: now, createdAt: entry?.createdAt || now } });
  };

  const setRating = (r) => {
    if (!detail) return;
    onUpdateLibrary({ ...library, [detail.id]: { ...entry, rating: r, updatedAt: Date.now() } });
  };

  const removeGame = () => {
    if (!detail) return;
    const updated = { ...library };
    delete updated[detail.id];
    onUpdateLibrary(updated);
  };

  return (
    <div className="popup-backdrop" onClick={onBackdrop}>
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>✕</button>

        {loading && (
          <div className="popup-loading">
            <div className="loading-dots"><span></span><span></span><span></span></div>
            <p>Carregando detalhes…</p>
          </div>
        )}

        {error && <div className="popup-error">⚠️ Erro ao carregar detalhes.</div>}

        {detail && !loading && (
          <>
            {/* Hero */}
            <div className="popup-hero">
              {detail.cover
                ? <img src={detail.cover} alt={detail.name} className="popup-hero-img" />
                : <div className="popup-hero-placeholder">🎮</div>
              }
              <div className="popup-hero-overlay">
                {detail.metacritic && (
                  <div className="popup-metacritic" style={{ background: detail.metacritic >= 75 ? '#3cb371' : detail.metacritic >= 50 ? '#f4c430' : '#cc3333' }}>
                    {detail.metacritic}
                  </div>
                )}
                {entry?.status && (
                  <div className="popup-status-badge" style={{ background: SC[entry.status] }}>
                    {SL[entry.status]}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="popup-content">
              <h2 className="popup-title">{detail.name}</h2>

              {/* Quick stats */}
              <div className="popup-stats">
                {detail.rating !== 'N/A' && (
                  <div className="popup-stat"><span className="ps-icon">⭐</span><span>{detail.rating}/5</span></div>
                )}
                {detail.released && (
                  <div className="popup-stat"><span className="ps-icon">📅</span><span>{detail.released}</span></div>
                )}
                {detail.playtime > 0 && (
                  <div className="popup-stat"><span className="ps-icon">⏱</span><span>~{detail.playtime}h</span></div>
                )}
                {detail.esrb && (
                  <div className="popup-stat"><span className="ps-icon">🔞</span><span>{detail.esrb}</span></div>
                )}
              </div>

              {/* Info rows */}
              <div className="popup-info-grid">
                {detail.genres && (
                  <div className="popup-info-row">
                    <span className="pi-label">Gênero</span>
                    <span className="pi-value">{detail.genres}</span>
                  </div>
                )}
                {detail.platforms && (
                  <div className="popup-info-row">
                    <span className="pi-label">Plataformas</span>
                    <span className="pi-value">{detail.platforms}</span>
                  </div>
                )}
                {detail.developers && (
                  <div className="popup-info-row">
                    <span className="pi-label">Desenvolvedora</span>
                    <span className="pi-value">{detail.developers}</span>
                  </div>
                )}
                {detail.publishers && (
                  <div className="popup-info-row">
                    <span className="pi-label">Publicadora</span>
                    <span className="pi-value">{detail.publishers}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {detail.description && (
                <div className="popup-desc-section">
                  <div className="popup-section-title">Sobre o jogo</div>
                  <p className="popup-desc">{detail.description.slice(0, 400)}{detail.description.length > 400 ? '…' : ''}</p>
                </div>
              )}

              {/* Tags */}
              {detail.tags && detail.tags.length > 0 && (
                <div className="popup-tags-section">
                  <div className="popup-section-title">Tags</div>
                  <div className="popup-tags">
                    {detail.tags.map(t => <span key={t} className="popup-tag">{t}</span>)}
                  </div>
                </div>
              )}

              {/* My rating */}
              {entry?.rating && (
                <div className="popup-my-rating">
                  <div className="popup-section-title">Minha Avaliação</div>
                  <div className="popup-rating-display">
                    <StarRating value={entry.rating} onChange={setRating} />
                    <span className="popup-rating-num">{entry.rating}/10</span>
                  </div>
                </div>
              )}
              {entry?.status === 'finished' && !entry?.rating && (
                <div className="popup-my-rating">
                  <div className="popup-section-title">Avaliar</div>
                  <StarRating value={0} onChange={setRating} />
                </div>
              )}

              {/* Actions */}
              <div className="popup-actions">
                <button className={`popup-action-btn ${entry?.status === 'backlog'  ? 'active-backlog'  : ''}`} onClick={() => setStatus('backlog')}>
                  📋 Backlog
                </button>
                <button className={`popup-action-btn ${entry?.status === 'playing'  ? 'active-playing'  : ''}`} onClick={() => setStatus('playing')}>
                  🎮 Jogando
                </button>
                <button className={`popup-action-btn ${entry?.status === 'finished' ? 'active-finished' : ''}`} onClick={() => setStatus('finished')}>
                  ✅ Finalizado
                </button>
                {entry && (
                  <button className="popup-action-btn danger" onClick={removeGame}>🗑 Remover</button>
                )}
              </div>

              {detail.website && (
                <a href={detail.website} target="_blank" rel="noreferrer" className="popup-website">
                  🌐 Site oficial
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="star-rating">
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <span key={n}
          className={`star ${n <= (hovered ?? value ?? 0) ? 'lit' : ''}`}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(null)}
          onClick={() => !readonly && onChange && onChange(n)}
        >★</span>
      ))}
    </div>
  );
}

// ─── GAME CARD ────────────────────────────────────────────────────────────────
function GameCard({ game, library, onUpdateLibrary, rawgKey }) {
  const entry = library[game.id];
  const [showRating,  setShowRating]  = useState(false);
  const [showPopup,   setShowPopup]   = useState(false);

  const setStatus = (status) => {
    const now = Date.now();
    onUpdateLibrary({ ...library, [game.id]: { ...entry, game, status, updatedAt: now, createdAt: entry?.createdAt || now } });
    if (status === 'finished') setShowRating(true);
  };
  const setRating = (r) => {
    onUpdateLibrary({ ...library, [game.id]: { ...entry, rating: r, updatedAt: Date.now() } });
    setShowRating(false);
  };
  const removeGame = () => {
    const u = { ...library }; delete u[game.id]; onUpdateLibrary(u);
  };

  const SC = { backlog:'#6c63ff', playing:'#00d4aa', finished:'#f4c430' };
  const SL = { backlog:'📋 Backlog', playing:'🎮 Playing', finished:'✅ Done' };

  return (
    <>
      <div className="game-card">
        {/* Clickable cover → popup */}
        <div className="game-cover" onClick={() => setShowPopup(true)}>
          {game.cover ? <img src={game.cover} alt={game.name} loading="lazy" /> : <div className="no-cover">🎮</div>}
          {entry?.status && <div className="status-badge" style={{ background: SC[entry.status] }}>{SL[entry.status]}</div>}
          {game.metacritic && (
            <div className="meta-badge" style={{ background: game.metacritic >= 75 ? '#3cb371' : game.metacritic >= 50 ? '#f4c430' : '#cc3333' }}>
              {game.metacritic}
            </div>
          )}
          <div className="cover-hover-hint">👁 Ver detalhes</div>
        </div>

        <div className="game-info">
          <div className="game-name" title={game.name} onClick={() => setShowPopup(true)}>{game.name}</div>
          <div className="game-meta">
            {game.genres   && <span className="tag">{game.genres}</span>}
            {game.released && <span className="tag year">{game.released}</span>}
            {game.rating !== 'N/A' && <span className="tag rating">⭐ {game.rating}</span>}
          </div>
          <div className="game-plat">{game.platforms}</div>

          {entry?.rating && !showRating && <div className="my-rating">Nota: <span>{entry.rating}/10</span></div>}
          {showRating && (
            <div className="rating-row">
              <span className="rating-label">Avaliar:</span>
              <StarRating value={entry?.rating || 0} onChange={setRating} />
            </div>
          )}

          <div className="card-actions">
            <button className={`btn-action ${entry?.status === 'backlog'  ? 'active backlog'  : ''}`} onClick={() => setStatus('backlog')}  title="Backlog">📋</button>
            <button className={`btn-action ${entry?.status === 'playing'  ? 'active playing'  : ''}`} onClick={() => setStatus('playing')}  title="Jogando">🎮</button>
            <button className={`btn-action ${entry?.status === 'finished' ? 'active finished' : ''}`} onClick={() => setStatus('finished')} title="Finalizado">✅</button>
            {entry?.status === 'finished' && (
              <button className="btn-action rate" onClick={() => setShowRating(!showRating)} title="Avaliar">⭐</button>
            )}
            {entry && <button className="btn-action remove" onClick={removeGame} title="Remover">✕</button>}
          </div>
        </div>
      </div>

      {showPopup && (
        <GameDetailPopup
          gameId={game.id}
          rawgKey={rawgKey}
          library={library}
          onUpdateLibrary={onUpdateLibrary}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
}

// ─── SEARCH VIEW ──────────────────────────────────────────────────────────────
function SearchView({ library, onUpdateLibrary, rawgKey }) {
  const [query,    setQuery]    = useState('');
  const [genre,    setGenre]    = useState('');
  const [platform, setPlatform] = useState('');
  const [ordering, setOrdering] = useState('-rating');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState('');

  const doSearch = async () => {
    if (!query.trim() && !genre && !platform) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const games = await searchGames({ query: query.trim(), genre, platform, ordering, pageSize: 20 }, rawgKey);
      setResults(games);
    } catch(e) {
      setError('Erro ao buscar jogos. Tente novamente.'); setResults([]);
    } finally { setLoading(false); }
  };

  return (
    <div className="search-view">
      <div className="search-header">
        <h2>🔍 Buscar Jogos</h2>
        <p className="search-sub">Pesquise e adicione jogos à sua biblioteca. Clique na capa para ver detalhes!</p>
      </div>

      <div className="search-form">
        <div className="search-input-row">
          <input
            className="search-text-input"
            placeholder="Nome do jogo… ex: Final Fantasy, Zelda"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          <button className="search-go-btn" onClick={doSearch} disabled={loading}>
            {loading ? '⏳' : '🔍'}
          </button>
        </div>

        <div className="search-filters">
          <select className="search-select" value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">🎭 Todos os Gêneros</option>
            {GENRES_LIST.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <select className="search-select" value={platform} onChange={e => setPlatform(e.target.value)}>
            <option value="">🖥 Todas as Plataformas</option>
            {PLATFORMS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="search-select" value={ordering} onChange={e => setOrdering(e.target.value)}>
            <option value="-rating">⭐ Melhor avaliados</option>
            <option value="-released">🆕 Mais recentes</option>
            <option value="-added">🔥 Mais populares</option>
            <option value="name">🔤 A–Z</option>
          </select>
        </div>

        <div className="genre-pills">
          {GENRES_LIST.slice(0,8).map(g => (
            <button
              key={g.value}
              className={`genre-pill ${genre === g.value ? 'active' : ''}`}
              onClick={() => setGenre(genre === g.value ? '' : g.value)}
            >{g.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="search-error">{error}</div>}

      {loading && (
        <div className="search-loading">
          <div className="loading-dots"><span></span><span></span><span></span></div>
          <p>Buscando jogos…</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="empty-lib"><div className="empty-icon">🕹</div><p>Nenhum jogo encontrado.<br/>Tente outros termos.</p></div>
      )}

      {!loading && !searched && (
        <div className="search-placeholder">
          <div style={{fontSize:56}}>🎮</div>
          <p>Use os filtros acima para encontrar jogos.<br/><strong>Clique na capa</strong> para ver detalhes completos!</p>
        </div>
      )}

      {results.length > 0 && !loading && (
        <>
          <div className="search-results-header">{results.length} jogos encontrados</div>
          <div className="games-grid">
            {results.map(g => (
              <GameCard key={g.id} game={g} library={library} onUpdateLibrary={onUpdateLibrary} rawgKey={rawgKey} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── LIBRARY VIEW ─────────────────────────────────────────────────────────────
function LibraryView({ library, onUpdateLibrary, rawgKey }) {
  const [filter, setFilter] = useState('all');
  const [sort,   setSort]   = useState('recent');

  const counts = useMemo(() => ({
    all:      Object.keys(library).length,
    backlog:  Object.values(library).filter(e => e.status === 'backlog').length,
    playing:  Object.values(library).filter(e => e.status === 'playing').length,
    finished: Object.values(library).filter(e => e.status === 'finished').length,
  }), [library]);

  const avgRating = useMemo(() => {
    const rated = Object.values(library).filter(e => e.rating);
    if (!rated.length) return null;
    return (rated.reduce((s,e) => s + e.rating, 0) / rated.length).toFixed(1);
  }, [library]);

  const items = useMemo(() => {
    let list = Object.values(library);
    if (filter !== 'all') list = list.filter(e => e.status === filter);
    if (sort === 'recent') list.sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
    if (sort === 'name')   list.sort((a,b) => a.game.name.localeCompare(b.game.name));
    if (sort === 'rating') list.sort((a,b) => (b.rating||0) - (a.rating||0));
    return list;
  }, [library, filter, sort]);

  return (
    <div className="library-view">
      <div className="lib-header">
        <div className="lib-title-row">
          <h2>Minha Biblioteca</h2>
          {avgRating && <div className="avg-rating">média ⭐ {avgRating}</div>}
        </div>
        <div className="lib-stats-row">
          {['all','backlog','playing','finished'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? '🗂 Todos' : f === 'backlog' ? '📋 Backlog' : f === 'playing' ? '🎮 Jogando' : '✅ Finalizados'}
              <span className="count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="lib-sort-row">
          <span className="sort-label">Ordenar:</span>
          {['recent','name','rating'].map(s => (
            <button key={s} className={`sort-btn ${sort === s ? 'active' : ''}`} onClick={() => setSort(s)}>
              {s === 'recent' ? 'Recente' : s === 'name' ? 'A–Z' : 'Nota'}
            </button>
          ))}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="empty-lib">
          <div className="empty-icon">🎮</div>
          <p>Nenhum jogo ainda.<br/>Use o Chat ou Buscar para adicionar!</p>
        </div>
      ) : (
        <div className="games-grid">
          {items.map(entry => (
            <GameCard key={entry.game.id} game={entry.game} library={library} onUpdateLibrary={onUpdateLibrary} rawgKey={rawgKey} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS VIEW ────────────────────────────────────────────────────────────
function SettingsView({ settings, onSave, user, onLogout }) {
  const [groqKey, setGroqKey] = useState(settings.groqKey || '');
  const [rawgKey, setRawgKey] = useState(settings.rawgKey || '');
  const [saved,   setSaved]   = useState(false);

  const handleSave = () => {
    onSave({ ...settings, groqKey, rawgKey });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-view">
      <h2>Configurações</h2>

      <div className="settings-section">
        <h3>👤 Conta</h3>
        <div className="settings-card">
          <div className="setting-user">
            <div className="user-avatar-big">{user.name[0].toUpperCase()}</div>
            <div>
              <div className="setting-user-name">{user.name}</div>
              {user.email && <div className="setting-user-email">{user.email}</div>}
            </div>
          </div>
          <button className="btn-danger" onClick={onLogout}>Sair</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>🔑 Chaves de API</h3>
        <p className="settings-note">Suas chaves ficam salvas apenas no seu dispositivo. Nunca enviadas a nenhum servidor nosso.</p>

        <div className="settings-card">
          <label className="setting-label">
            Groq API Key
            <span className="setting-badge required">Obrigatório · Grátis</span>
          </label>
          <p className="setting-desc">
            Alimenta o chat com IA ultra-rápida e gratuita.<br/>
            Obtenha em <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com/keys</a> → clique em <strong>"Create API Key"</strong>. Sem cartão de crédito!
          </p>
          <input type="password" className="setting-input" placeholder="gsk_..." value={groqKey} onChange={e => setGroqKey(e.target.value)} />
          {groqKey && <div className="key-status ok">✓ Chave inserida — pronto para usar o chat!</div>}
        </div>

        <div className="settings-card">
          <label className="setting-label">
            RAWG API Key
            <span className="setting-badge optional">Opcional · Grátis</span>
          </label>
          <p className="setting-desc">Aumenta os limites de busca e habilita detalhes completos dos jogos. Obtenha grátis em <a href="https://rawg.io/apidocs" target="_blank" rel="noreferrer">rawg.io/apidocs</a></p>
          <input type="password" className="setting-input" placeholder="Sua chave RAWG..." value={rawgKey} onChange={e => setRawgKey(e.target.value)} />
        </div>

        <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
          {saved ? '✓ Salvo!' : 'Salvar Chaves'}
        </button>
      </div>

      <div className="settings-section">
        <h3>📱 Instalar como App</h3>
        <div className="settings-card">
          <p className="setting-desc">
            <strong>Android (Chrome):</strong> Menu ⋮ → "Adicionar à tela inicial"<br/>
            <strong>iPhone (Safari):</strong> Compartilhar → "Adicionar à tela de início"<br/>
            <strong>PC:</strong> Ícone ⊕ na barra de endereços
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3>🗑 Dados</h3>
        <div className="settings-card">
          <p className="setting-desc">Apagar todos os dados locais (biblioteca, histórico, configurações).</p>
          <button className="btn-danger" onClick={() => {
            if (confirm('Apagar TODOS os dados? Isso não pode ser desfeito.')) {
              localStorage.clear(); window.location.reload();
            }
          }}>Limpar Tudo</button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode,  setMode]  = useState('login');
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Por favor, insira seu nome'); return; }
    onLogin({ name: name.trim(), email: email.trim(), id: String(Date.now()) });
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">🎮</div>
        <h1 className="auth-title">GamePal</h1>
        <p className="auth-sub">Seu assistente inteligente de jogos</p>
        <div className="auth-tabs">
          <button className={mode === 'login'  ? 'active' : ''} onClick={() => setMode('login')}>Entrar</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Criar conta</button>
        </div>
        <div className="auth-form">
          <input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
          {mode === 'signup' && <input placeholder="Email (opcional)" type="email" value={email} onChange={e => setEmail(e.target.value)} />}
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" onClick={submit}>{mode === 'login' ? 'Entrar →' : 'Criar Conta →'}</button>
        </div>
        <p className="auth-note">Dados salvos apenas no seu dispositivo • Sem servidor necessário</p>
      </div>
    </div>
  );
}

function InstallBanner({ onDismiss, onInstall }) {
  return (
    <div className="install-banner">
      <span className="install-icon">📲</span>
      <div className="install-text"><strong>Instalar GamePal</strong><span>Adicione à tela inicial</span></div>
      <button className="install-btn" onClick={onInstall}>Instalar</button>
      <button className="install-dismiss" onClick={onDismiss}>✕</button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [user,     setUser]     = useState(() => load(USER_KEY,     null));
  const [messages, setMessages] = useState(() => load(CHAT_KEY,     []));
  const [library,  setLibrary]  = useState(() => load(STORAGE_KEY,  {}));
  const [settings, setSettings] = useState(() => load(SETTINGS_KEY, {}));
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [view,     setView]     = useState('chat');
  const [installPrompt,     setInstallPrompt]     = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [apiError, setApiError] = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { save(CHAT_KEY,     messages.slice(-80)); }, [messages]);
  useEffect(() => { save(STORAGE_KEY,  library);  }, [library]);
  useEffect(() => { save(SETTINGS_KEY, settings); }, [settings]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    const h = () => { const v = window.location.hash.replace('#',''); if (['chat','library','search','settings'].includes(v)) setView(v); };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstallBanner(true); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  useEffect(() => { window.__hideSplash?.(); }, []);

  const navigate      = (v) => { setView(v); window.location.hash = v; };
  const handleLogin   = (u) => { save(USER_KEY, u); setUser(u); };
  const handleLogout  = ()  => { save(USER_KEY, null); setUser(null); };
  const updateLibrary = useCallback((lib) => setLibrary(lib), []);
  // Ref so sendMessage closure always has fresh updateLibrary
  const onUpdateLibraryRef = useRef(updateLibrary);
  useEffect(() => { onUpdateLibraryRef.current = updateLibrary; }, [updateLibrary]);
  const saveSettings  = useCallback((s)   => setSettings(s),  []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBanner(false);
    setInstallPrompt(null);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(''); setApiError('');
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(-12);
      const raw = await callGroq(history, SYSTEM_PROMPT, settings.groqKey);

      // ── Robust parser: tries 4 strategies to extract JSON ──
      let action = null;

      // Strategy 1: raw JSON (Groq/Llama usually returns this cleanly)
      try { action = JSON.parse(raw.trim()); } catch {}

      // Strategy 2: JSON inside ```json ``` fences
      if (!action) {
        const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (m) { try { action = JSON.parse(m[1].trim()); } catch {} }
      }

      // Strategy 3: first {...} object found anywhere in text
      if (!action) {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) { try { action = JSON.parse(m[0]); } catch {} }
      }

      // Strategy 4: smart fallback — detect intent from user message directly
      if (!action || !action.action) {
        const userLow = text.toLowerCase();
        const SEARCH_TRIGGERS = ['rpg','action','ação','aventura','adventure','terror','horror',
          'estratégia','strategy','puzzle','plataforma','platform','shooter','fps','indie',
          'corrida','racing','luta','fighting','sports','esporte','arcade','mmorpg',
          'playstation','nintendo','switch','xbox',' ps1',' ps2',' ps3',' ps4',' ps5',
          'melhores','indique','recomende','recomend','suggest','busca','find','show','list',
          'top ','best ','jogos de','games de','games like','parecidos','similar'];
        const isSearch = SEARCH_TRIGGERS.some(k => userLow.includes(k));

        if (isSearch) {
          const p = { ordering: '-rating' };
          // Detect platform
          if      (userLow.includes('ps1') || userLow.includes('playstation 1')) p.platform = 'PlayStation 1';
          else if (userLow.includes('ps2') || userLow.includes('playstation 2')) p.platform = 'PlayStation 2';
          else if (userLow.includes('ps3') || userLow.includes('playstation 3')) p.platform = 'PlayStation 3';
          else if (userLow.includes('ps4') || userLow.includes('playstation 4')) p.platform = 'PlayStation 4';
          else if (userLow.includes('ps5') || userLow.includes('playstation 5')) p.platform = 'PlayStation 5';
          else if (userLow.includes('switch'))                                    p.platform = 'Nintendo Switch';
          else if (userLow.includes('xbox 360'))                                  p.platform = 'Xbox 360';
          else if (userLow.includes('xbox'))                                      p.platform = 'Xbox One';
          else if (userLow.match(/\bpc\b/))                                      p.platform = 'PC';
          else if (userLow.includes('n64') || userLow.includes('nintendo 64'))    p.platform = 'Nintendo 64';
          else if (userLow.includes('snes') || userLow.includes('super nintendo'))p.platform = 'Super Nintendo';
          // Detect genre
          if      (userLow.includes('rpg'))                                        p.genre = 'rpg';
          else if (userLow.includes('terror') || userLow.includes('horror'))       p.genre = 'terror';
          else if (userLow.includes('ação')   || userLow.includes('action'))       p.genre = 'action';
          else if (userLow.includes('aventura')|| userLow.includes('adventure'))   p.genre = 'aventura';
          else if (userLow.includes('estratégia')||userLow.includes('strategy'))   p.genre = 'estratégia';
          else if (userLow.includes('indie'))                                       p.genre = 'indie';
          else if (userLow.includes('puzzle'))                                      p.genre = 'puzzle';
          else if (userLow.includes('corrida') || userLow.includes('racing'))      p.genre = 'corrida';
          else if (userLow.includes('luta')    || userLow.includes('fighting'))    p.genre = 'luta';
          else if (userLow.includes('shooter') || userLow.includes('fps'))         p.genre = 'shooter';
          else if (userLow.includes('plataforma')||userLow.includes('platform'))   p.genre = 'plataforma';
          else if (userLow.includes('arcade'))                                      p.genre = 'arcade';
          // If no genre/platform detected, use whole message as query
          if (!p.genre && !p.platform) p.query = text.replace(/[?!.,]/g,'').trim();
          action = { action: 'search', params: p, message: 'Aqui estão os jogos encontrados! 🎮' };
        } else {
          action = { action: 'chat', message: raw };
        }
      }

      let games = [];
      let addedGame = null;

      if (action.action === 'search' && action.params) {
        try { games = await searchGames(action.params, settings.rawgKey); } catch {}
      }

      // Handle add-to-library action — uses precise name matching
      if (action.action === 'add' && action.gameName) {
        try {
          const game = await findGameByName(action.gameName, settings.rawgKey);
          if (game) {
            const status = action.status || 'backlog';
            const now = Date.now();
            const currentLib = library;
            const updatedLib = {
              ...currentLib,
              [game.id]: {
                ...(currentLib[game.id] || {}),
                game, status, updatedAt: now,
                createdAt: currentLib[game.id]?.createdAt || now,
              }
            };
            onUpdateLibraryRef.current(updatedLib);
            addedGame = { game, status };
          }
        } catch(e) { console.error('Add game error:', e); }
      }

      const statusLabel = { backlog: '📋 Backlog', playing: '🎮 Jogando', finished: '✅ Finalizado' };
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: action.message || raw,
        games: games.length > 0 ? games : null,
        addedGame: addedGame || null,
        ts: Date.now(),
      }]);
    } catch (err) {
      setApiError(err.message || 'Algo deu errado');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Erro ao conectar ao Groq. Verifique sua chave em Configurações ⚙️',
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const libCount     = Object.keys(library).length;
  const playingCount = Object.values(library).filter(e => e.status === 'playing').length;

  const SUGGESTIONS = [
    'Melhores RPGs para PS1',
    'Jogos parecidos com Dark Souls',
    'Top jogos Nintendo Switch',
    'Adicionar Final Fantasy VII ao backlog',
    'Quero jogar God of War',
    'Terminei de jogar The Last of Us',
  ];

  const NAV = [
    { id:'chat',     icon:'💬', label:'Chat'       },
    { id:'search',   icon:'🔍', label:'Buscar'     },
    { id:'library',  icon:'📚', label:'Biblioteca', badge: libCount },
    { id:'settings', icon:'⚙️', label:'Config'     },
  ];

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      {showInstallBanner && <InstallBanner onDismiss={() => setShowInstallBanner(false)} onInstall={handleInstall} />}

      {/* SIDEBAR desktop */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">🎮 <span>GamePal</span></div>
          <div className="user-pill">
            <div className="user-avatar">{user.name[0].toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-stats">{libCount} jogos · {playingCount} jogando</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="stats-grid">
            {[
              { label:'Backlog',     count: Object.values(library).filter(e=>e.status==='backlog').length },
              { label:'Jogando',     count: playingCount },
              { label:'Finalizados', count: Object.values(library).filter(e=>e.status==='finished').length },
            ].map(s => (
              <div key={s.label} className="stat">
                <div className="stat-n">{s.count}</div>
                <div className="stat-l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {view === 'library'  && <LibraryView  library={library} onUpdateLibrary={updateLibrary} rawgKey={settings.rawgKey} />}
        {view === 'search'   && <SearchView   library={library} onUpdateLibrary={updateLibrary} rawgKey={settings.rawgKey} />}
        {view === 'settings' && <SettingsView settings={settings} onSave={saveSettings} user={user} onLogout={handleLogout} />}

        {view === 'chat' && (
          <div className="chat-area">
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-avatar">🎮</div>
                <div>
                  <div className="chat-title">GamePal</div>
                  <div className="chat-status">Assistente de Jogos · Groq AI</div>
                </div>
              </div>
              <button className="btn-clear-chat" onClick={() => { if(confirm('Limpar histórico?')) setMessages([]); }}>🗑</button>
            </div>

            <div className="messages">
              {messages.length === 0 && (
                <div className="welcome">
                  <div className="welcome-icon">🎮</div>
                  <h2>Olá, {user.name}!</h2>
                  <p>Pergunte qualquer coisa sobre jogos. Posso recomendar, buscar e te ajudar a organizar sua biblioteca.</p>
                  {!settings.groqKey && (
                    <div className="api-key-warning">
                      ⚠️ Configure sua <button className="link-btn" onClick={() => navigate('settings')}>chave Groq</button> nas Configurações para começar. É grátis e rápido!
                    </div>
                  )}
                  <div className="suggestions">
                    {SUGGESTIONS.map(s => (
                      <button key={s} className="suggestion" onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  {msg.role === 'assistant' && <div className="msg-avatar ai">🎮</div>}
                  <div className="msg-bubble">
                    <div className="msg-text">{msg.content}</div>
                    {msg.games && (
                      <div className="games-grid">
                        {msg.games.map(g => <GameCard key={g.id} game={g} library={library} onUpdateLibrary={updateLibrary} rawgKey={settings.rawgKey} />)}
                      </div>
                    )}
                    {msg.addedGame && (
                      <div className="added-game-card">
                        <div className="added-game-inner">
                          {msg.addedGame.game.cover && (
                            <img src={msg.addedGame.game.cover} alt={msg.addedGame.game.name} className="added-game-thumb" />
                          )}
                          <div className="added-game-info">
                            <div className="added-game-name">{msg.addedGame.game.name}</div>
                            <div className="added-game-status">
                              {{backlog:'📋 Adicionado ao Backlog', playing:'🎮 Marcado como Jogando', finished:'✅ Marcado como Finalizado'}[msg.addedGame.status]}
                            </div>
                            {msg.addedGame.game.released && <div className="added-game-year">{msg.addedGame.game.released}</div>}
                          </div>
                          <button
                            className="added-game-undo"
                            onClick={() => {
                              const u = {...library};
                              delete u[msg.addedGame.game.id];
                              updateLibrary(u);
                            }}
                            title="Desfazer"
                          >↩</button>
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && <div className="msg-avatar user">{user.name[0].toUpperCase()}</div>}
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="msg-avatar ai">🎮</div>
                  <div className="msg-bubble">
                    <div className="msg-text typing-indicator"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="input-area">
              {apiError && <div className="api-error-bar">⚠️ {apiError}</div>}
              <div className="input-wrap">
                <input
                  ref={inputRef}
                  className="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Pergunte sobre jogos… ex: RPG para PS1"
                  disabled={loading}
                  autoComplete="off"
                />
                <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                  {loading ? '⏳' : '↑'}
                </button>
              </div>
              <div className="input-hint">Enter para enviar · Groq AI (llama-3.3-70b) + RAWG</div>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV mobile */}
      <nav className="bottom-nav">
        {NAV.map(item => (
          <button key={item.id} className={`bottom-nav-item ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
            <span className="bnav-icon">{item.icon}</span>
            <span className="bnav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0d12;--surface:#13131a;--surface2:#1a1a24;--surface3:#22222f;
  --border:rgba(255,255,255,0.07);--accent:#7c6aff;--accent2:#00d4aa;
  --accent3:#f4c430;--danger:#ff5555;--text:#e8e8f0;--text2:#9090a8;
  --text3:#5a5a72;--radius:14px;--fh:'Syne',sans-serif;--fb:'DM Sans',sans-serif;
  --bot-nav:64px;
}
html,body{height:100%;overflow:hidden}
body{background:var(--bg);color:var(--text);font-family:var(--fb);-webkit-font-smoothing:antialiased}
a{color:var(--accent2)}button{font-family:var(--fb)}

/* INSTALL BANNER */
.install-banner{position:fixed;top:0;left:0;right:0;z-index:1000;background:linear-gradient(135deg,#1a1040,#0d1a24);border-bottom:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;gap:10px}
.install-icon{font-size:22px}.install-text{flex:1;display:flex;flex-direction:column;font-size:13px}
.install-text strong{color:var(--text)}.install-text span{color:var(--text2);font-size:11px}
.install-btn{padding:7px 14px;background:var(--accent);border:none;border-radius:8px;color:white;font-size:13px;font-weight:600;cursor:pointer}
.install-dismiss{background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:4px 8px}

/* APP */
.app{display:flex;height:100dvh;overflow:hidden;padding-bottom:var(--bot-nav)}

/* AUTH */
.auth-screen{min-height:100dvh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 30% 50%,#1a1040 0%,#0d0d12 60%);padding:20px}
.auth-box{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:40px 36px;width:100%;max-width:380px;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,.6)}
.auth-logo{font-size:52px;margin-bottom:12px}.auth-title{font-family:var(--fh);font-size:30px;font-weight:800;margin-bottom:6px}
.auth-sub{color:var(--text2);margin-bottom:28px;font-size:14px}
.auth-tabs{display:flex;background:var(--surface3);border-radius:10px;padding:4px;margin-bottom:20px}
.auth-tabs button{flex:1;padding:8px;border:none;background:none;color:var(--text2);font-size:14px;border-radius:8px;cursor:pointer;transition:all .2s}
.auth-tabs button.active{background:var(--accent);color:white}
.auth-form{display:flex;flex-direction:column;gap:12px}
.auth-form input{padding:13px 16px;background:var(--surface3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:15px;outline:none;transition:border-color .2s}
.auth-form input:focus{border-color:var(--accent)}.auth-error{color:#ff6b6b;font-size:13px}
.auth-submit{padding:14px;background:var(--accent);border:none;border-radius:10px;color:white;font-family:var(--fh);font-size:15px;font-weight:700;cursor:pointer;transition:opacity .2s;margin-top:4px}
.auth-submit:hover{opacity:.85}.auth-note{color:var(--text3);font-size:11px;margin-top:18px;line-height:1.5}

/* SIDEBAR */
.sidebar{width:230px;min-width:230px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:20px 14px}
.sidebar-top{margin-bottom:24px}
.logo{font-family:var(--fh);font-size:20px;font-weight:800;display:flex;align-items:center;gap:8px;margin-bottom:14px}
.user-pill{display:flex;align-items:center;gap:10px;background:var(--surface2);border-radius:12px;padding:10px}
.user-avatar{width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:700;font-size:14px;color:white;flex-shrink:0}
.user-name{font-size:13px;font-weight:500}.user-stats{font-size:11px;color:var(--text3)}
.sidebar-nav{flex:1;display:flex;flex-direction:column;gap:3px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:none;color:var(--text2);font-size:14px;border-radius:10px;cursor:pointer;text-align:left;transition:all .15s;position:relative}
.nav-item:hover{background:var(--surface2);color:var(--text)}.nav-item.active{background:rgba(124,106,255,.15);color:var(--accent)}
.nav-icon{font-size:16px}.nav-badge{margin-left:auto;background:var(--accent);color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px}
.sidebar-footer{margin-top:auto;padding-top:16px;border-top:1px solid var(--border)}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.stat{background:var(--surface2);border-radius:10px;padding:10px 6px;text-align:center}
.stat-n{font-family:var(--fh);font-size:18px;font-weight:700}.stat-l{font-size:9px;color:var(--text3);margin-top:2px}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

/* CHAT */
.chat-area{display:flex;flex-direction:column;height:100%}
.chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0}
.chat-header-left{display:flex;align-items:center;gap:12px}
.chat-avatar{font-size:28px}.chat-title{font-family:var(--fh);font-size:16px;font-weight:700}
.chat-status{font-size:11px;color:var(--accent2)}
.btn-clear-chat{background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:6px;border-radius:8px;transition:color .2s}
.btn-clear-chat:hover{color:var(--danger)}
.messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin;scrollbar-color:var(--surface3) transparent}
.welcome{text-align:center;margin:auto;max-width:480px;padding:32px 16px}
.welcome-icon{font-size:52px;margin-bottom:14px}
.welcome h2{font-family:var(--fh);font-size:26px;font-weight:800;margin-bottom:10px}
.welcome p{color:var(--text2);font-size:14px;line-height:1.6;margin-bottom:20px}
.api-key-warning{background:rgba(255,85,85,.1);border:1px solid rgba(255,85,85,.3);border-radius:10px;padding:12px 16px;font-size:13px;color:#ff9999;margin-bottom:16px}
.link-btn{background:none;border:none;color:var(--accent2);text-decoration:underline;cursor:pointer;font-size:inherit;padding:0}
.suggestions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.suggestion{padding:8px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:20px;color:var(--text2);font-size:12px;cursor:pointer;transition:all .2s}
.suggestion:hover{background:rgba(124,106,255,.15);border-color:var(--accent);color:var(--accent)}
.message{display:flex;gap:10px;align-items:flex-start}.message.user{flex-direction:row-reverse}
.msg-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;background:var(--surface2);border:1px solid var(--border)}
.msg-avatar.ai{background:linear-gradient(135deg,#2a1a5e,#0d2a2a);border-color:rgba(124,106,255,.3)}
.msg-avatar.user{background:var(--accent);color:white;font-family:var(--fh);font-weight:700;font-size:14px;border-color:transparent}
.msg-bubble{max-width:82%;display:flex;flex-direction:column;gap:10px}
.message.user .msg-bubble{align-items:flex-end}
.msg-text{padding:11px 15px;background:var(--surface2);border-radius:14px;font-size:14px;line-height:1.6;border:1px solid var(--border)}
.message.user .msg-text{background:rgba(124,106,255,.2);border-color:rgba(124,106,255,.3)}
.typing-indicator{display:flex;gap:5px;align-items:center;min-width:48px}
.typing-indicator span{width:7px;height:7px;background:var(--text3);border-radius:50%;animation:bounce 1.2s infinite}
.typing-indicator span:nth-child(2){animation-delay:.2s}.typing-indicator span:nth-child(3){animation-delay:.4s}
@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}

/* INPUT */
.input-area{padding:12px 16px 14px;border-top:1px solid var(--border);background:var(--surface);flex-shrink:0}
.api-error-bar{background:rgba(255,85,85,.1);border:1px solid rgba(255,85,85,.3);border-radius:8px;padding:8px 12px;font-size:12px;color:#ff9999;margin-bottom:8px}
.input-wrap{display:flex;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:5px 5px 5px 14px;transition:border-color .2s}
.input-wrap:focus-within{border-color:rgba(124,106,255,.5)}
.chat-input{flex:1;background:none;border:none;outline:none;color:var(--text);font-size:14px;min-width:0}
.chat-input::placeholder{color:var(--text3)}
.send-btn{width:36px;height:36px;background:var(--accent);border:none;border-radius:10px;color:white;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s;flex-shrink:0}
.send-btn:disabled{opacity:.4;cursor:default}
.input-hint{text-align:center;font-size:10px;color:var(--text3);margin-top:6px}

/* GAME CARDS */
.games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px}
.game-card{background:var(--surface3);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,border-color .2s}
.game-card:hover{transform:translateY(-2px);border-color:rgba(124,106,255,.4)}
.game-cover{position:relative;aspect-ratio:16/9;overflow:hidden;background:var(--surface2);cursor:pointer}
.game-cover img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.game-cover:hover img{transform:scale(1.05)}
.no-cover{display:flex;align-items:center;justify-content:center;height:100%;font-size:34px}
.cover-hover-hint{position:absolute;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font-size:12px;color:white;opacity:0;transition:opacity .2s;font-weight:600}
.game-cover:hover .cover-hover-hint{opacity:1}
.status-badge{position:absolute;top:6px;right:6px;font-size:9px;padding:3px 7px;border-radius:20px;font-weight:700;color:#000}
.meta-badge{position:absolute;top:6px;left:6px;font-size:10px;font-weight:700;padding:3px 7px;border-radius:6px;color:white}
.game-info{padding:9px 11px}
.game-name{font-family:var(--fh);font-size:12px;font-weight:600;margin-bottom:5px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.game-name:hover{color:var(--accent)}
.game-meta{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px}
.tag{font-size:9px;padding:2px 6px;background:var(--surface2);border-radius:20px;color:var(--text2)}
.tag.year{color:var(--accent2)}.tag.rating{color:var(--accent3)}
.game-plat{font-size:9px;color:var(--text3);margin-bottom:7px;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.my-rating{font-size:11px;color:var(--accent3);margin-bottom:6px}.my-rating span{font-weight:700}
.rating-row{margin-bottom:7px}.rating-label{display:block;font-size:10px;color:var(--text2);margin-bottom:4px}
.star-rating{display:flex;gap:2px}.star{cursor:pointer;font-size:13px;color:var(--surface2);transition:color .1s}.star.lit{color:var(--accent3)}
.card-actions{display:flex;gap:4px}
.btn-action{flex:1;padding:5px 3px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;font-size:13px;cursor:pointer;transition:all .2s}
.btn-action:hover{background:rgba(124,106,255,.2);border-color:var(--accent)}
.btn-action.active.backlog{background:rgba(124,106,255,.3);border-color:var(--accent)}
.btn-action.active.playing{background:rgba(0,212,170,.2);border-color:var(--accent2)}
.btn-action.active.finished{background:rgba(244,196,48,.15);border-color:var(--accent3)}
.btn-action.rate{background:rgba(244,196,48,.1);border-color:rgba(244,196,48,.3)}
.btn-action.remove{flex:none;width:28px;padding:5px;background:rgba(255,85,85,.05);border-color:rgba(255,85,85,.2);color:var(--text3);font-size:11px}
.btn-action.remove:hover{background:rgba(255,85,85,.2);border-color:var(--danger);color:white}

/* POPUP */
.popup-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:500;display:flex;align-items:flex-end;justify-content:center;padding:0;backdrop-filter:blur(4px)}
.popup-box{background:var(--surface);width:100%;max-width:560px;max-height:92dvh;border-radius:24px 24px 0 0;overflow-y:auto;position:relative;animation:slideUp .3s ease;scrollbar-width:thin;scrollbar-color:var(--surface3) transparent}
@media(min-width:600px){
  .popup-backdrop{align-items:center;padding:20px}
  .popup-box{border-radius:24px;max-height:88dvh}
}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
.popup-close{position:absolute;top:14px;right:14px;z-index:10;width:32px;height:32px;background:rgba(0,0,0,.5);border:none;border-radius:50%;color:white;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.popup-close:hover{background:var(--danger)}
.popup-loading{padding:60px 20px;text-align:center;color:var(--text2)}
.popup-loading p{margin-top:16px;font-size:14px}
.popup-error{padding:40px;text-align:center;color:#ff9999;font-size:14px}
.popup-hero{position:relative;aspect-ratio:16/7;overflow:hidden;background:var(--surface3)}
.popup-hero-img{width:100%;height:100%;object-fit:cover}
.popup-hero-placeholder{display:flex;align-items:center;justify-content:center;height:100%;font-size:64px}
.popup-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);display:flex;align-items:flex-end;justify-content:space-between;padding:12px}
.popup-metacritic{font-size:14px;font-weight:800;padding:5px 10px;border-radius:8px;color:white}
.popup-status-badge{font-size:10px;padding:4px 10px;border-radius:20px;font-weight:700;color:#000}
.popup-content{padding:20px}
.popup-title{font-family:var(--fh);font-size:22px;font-weight:800;margin-bottom:14px;line-height:1.2}
.popup-stats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.popup-stat{display:flex;align-items:center;gap:5px;background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:5px 12px;font-size:13px}
.ps-icon{font-size:14px}
.popup-info-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.popup-info-row{display:flex;gap:10px;font-size:13px}
.pi-label{color:var(--text3);min-width:96px;flex-shrink:0}
.pi-value{color:var(--text);line-height:1.4}
.popup-section-title{font-family:var(--fh);font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
.popup-desc-section{margin-bottom:16px}
.popup-desc{font-size:13px;color:var(--text2);line-height:1.7}
.popup-tags-section{margin-bottom:16px}
.popup-tags{display:flex;flex-wrap:wrap;gap:6px}
.popup-tag{font-size:11px;padding:3px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:20px;color:var(--text2)}
.popup-my-rating{margin-bottom:16px}
.popup-rating-display{display:flex;align-items:center;gap:10px}
.popup-rating-num{font-family:var(--fh);font-size:18px;font-weight:700;color:var(--accent3)}
.popup-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.popup-action-btn{padding:11px 8px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--text2);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;text-align:center}
.popup-action-btn:hover{border-color:var(--accent);color:var(--accent)}
.popup-action-btn.active-backlog{background:rgba(124,106,255,.25);border-color:var(--accent);color:var(--accent)}
.popup-action-btn.active-playing{background:rgba(0,212,170,.2);border-color:var(--accent2);color:var(--accent2)}
.popup-action-btn.active-finished{background:rgba(244,196,48,.15);border-color:var(--accent3);color:var(--accent3)}
.popup-action-btn.danger{background:rgba(255,85,85,.08);border-color:rgba(255,85,85,.25);color:#ff9999}
.popup-action-btn.danger:hover{background:rgba(255,85,85,.2);border-color:var(--danger);color:white}
.popup-website{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--accent2);font-size:13px;text-decoration:none;transition:all .2s;margin-bottom:8px}
.popup-website:hover{border-color:var(--accent2);background:rgba(0,212,170,.1)}

/* ADDED GAME CARD */
.added-game-card{margin-top:4px;background:rgba(0,212,170,.08);border:1px solid rgba(0,212,170,.25);border-radius:12px;overflow:hidden;max-width:340px}
.added-game-inner{display:flex;align-items:center;gap:10px;padding:10px}
.added-game-thumb{width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0}
.added-game-info{flex:1;min-width:0}
.added-game-name{font-family:var(--fh);font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.added-game-status{font-size:11px;color:var(--accent2);margin-top:3px;font-weight:500}
.added-game-year{font-size:10px;color:var(--text3);margin-top:2px}
.added-game-undo{background:none;border:1px solid var(--border);border-radius:8px;color:var(--text3);font-size:14px;cursor:pointer;padding:4px 8px;flex-shrink:0;transition:all .2s}
.added-game-undo:hover{border-color:var(--danger);color:var(--danger)}

/* SEARCH */
.search-view{flex:1;overflow-y:auto;padding:20px}
.search-header{margin-bottom:20px}
.search-header h2{font-family:var(--fh);font-size:24px;font-weight:800;margin-bottom:4px}
.search-sub{color:var(--text2);font-size:13px}
.search-form{background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:20px;display:flex;flex-direction:column;gap:12px}
.search-input-row{display:flex;gap:8px}
.search-text-input{flex:1;padding:11px 14px;background:var(--surface3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:14px;outline:none;transition:border-color .2s}
.search-text-input:focus{border-color:var(--accent)}
.search-text-input::placeholder{color:var(--text3)}
.search-go-btn{width:44px;height:44px;background:var(--accent);border:none;border-radius:10px;font-size:18px;cursor:pointer;flex-shrink:0;transition:opacity .2s}
.search-go-btn:disabled{opacity:.4}
.search-filters{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.search-select{padding:9px 10px;background:var(--surface3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:12px;outline:none;cursor:pointer;width:100%}
.genre-pills{display:flex;flex-wrap:wrap;gap:6px}
.genre-pill{padding:6px 12px;background:var(--surface3);border:1px solid var(--border);border-radius:20px;color:var(--text2);font-size:12px;cursor:pointer;transition:all .2s}
.genre-pill:hover{border-color:var(--accent);color:var(--accent)}
.genre-pill.active{background:rgba(124,106,255,.2);border-color:var(--accent);color:var(--accent)}
.search-error{background:rgba(255,85,85,.1);border:1px solid rgba(255,85,85,.3);border-radius:10px;padding:12px;font-size:13px;color:#ff9999;margin-bottom:16px}
.search-loading{text-align:center;padding:40px;color:var(--text2)}
.search-loading p{margin-top:12px;font-size:14px}
.loading-dots{display:flex;gap:6px;justify-content:center}
.loading-dots span{width:10px;height:10px;background:var(--accent);border-radius:50%;animation:bounce 1.2s infinite}
.loading-dots span:nth-child(2){animation-delay:.2s}.loading-dots span:nth-child(3){animation-delay:.4s}
.search-placeholder{text-align:center;padding:60px 20px;color:var(--text2)}
.search-placeholder p{margin-top:12px;line-height:1.7;font-size:14px}
.search-results-header{font-size:12px;color:var(--text3);margin-bottom:12px}

/* LIBRARY */
.library-view{flex:1;overflow-y:auto;padding:20px}
.lib-title-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.lib-title-row h2{font-family:var(--fh);font-size:24px;font-weight:800}
.avg-rating{font-size:13px;color:var(--accent3);font-weight:600}
.lib-stats-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.filter-btn{padding:7px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:20px;color:var(--text2);font-size:12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px}
.filter-btn:hover{border-color:var(--accent);color:var(--text)}
.filter-btn.active{background:rgba(124,106,255,.2);border-color:var(--accent);color:var(--accent)}
.count{background:var(--surface3);border-radius:20px;padding:1px 7px;font-size:10px}
.lib-sort-row{display:flex;align-items:center;gap:6px;margin-bottom:16px}
.sort-label{font-size:12px;color:var(--text3)}
.sort-btn{padding:4px 12px;background:none;border:1px solid var(--border);border-radius:20px;color:var(--text3);font-size:12px;cursor:pointer;transition:all .2s}
.sort-btn.active{border-color:var(--accent2);color:var(--accent2)}
.empty-lib{text-align:center;padding:60px 20px;color:var(--text2)}
.empty-icon{font-size:48px;margin-bottom:12px}.empty-lib p{line-height:1.7}

/* SETTINGS */
.settings-view{flex:1;overflow-y:auto;padding:24px 20px}
.settings-view h2{font-family:var(--fh);font-size:24px;font-weight:800;margin-bottom:24px}
.settings-section{margin-bottom:28px}
.settings-section h3{font-family:var(--fh);font-size:15px;font-weight:700;margin-bottom:12px;color:var(--text2)}
.settings-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:10px}
.settings-note{font-size:12px;color:var(--text3);margin-bottom:12px;line-height:1.5}
.setting-label{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;margin-bottom:6px}
.setting-badge{font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600}
.setting-badge.required{background:rgba(124,106,255,.2);color:var(--accent)}
.setting-badge.optional{background:rgba(0,212,170,.15);color:var(--accent2)}
.setting-desc{font-size:12px;color:var(--text3);margin-bottom:10px;line-height:1.5}
.setting-input{width:100%;padding:11px 14px;background:var(--surface3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:14px;outline:none;transition:border-color .2s}
.setting-input:focus{border-color:var(--accent)}
.setting-user{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.user-avatar-big{width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:22px;color:white;flex-shrink:0}
.setting-user-name{font-size:15px;font-weight:600}.setting-user-email{font-size:12px;color:var(--text3);margin-top:2px}
.key-status{font-size:12px;margin-top:8px;padding:6px 10px;border-radius:8px}
.key-status.ok{background:rgba(0,212,170,.1);color:var(--accent2);border:1px solid rgba(0,212,170,.2)}
.btn-save{width:100%;padding:12px;background:var(--accent);border:none;border-radius:10px;color:white;font-family:var(--fh);font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:4px}
.btn-save:hover{opacity:.85}.btn-save.saved{background:var(--accent2)}
.btn-danger{padding:9px 18px;background:rgba(255,85,85,.1);border:1px solid rgba(255,85,85,.3);border-radius:10px;color:#ff9999;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(255,85,85,.25);border-color:var(--danger);color:white}

/* BOTTOM NAV */
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;height:var(--bot-nav);background:var(--surface);border-top:1px solid var(--border);z-index:100}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:none;border:none;cursor:pointer;color:var(--text3);transition:color .2s;padding:6px 0}
.bottom-nav-item.active{color:var(--accent)}.bnav-icon{font-size:20px}.bnav-label{font-size:9px;font-weight:500}

/* RESPONSIVE */
@media(max-width:700px){
  .sidebar{display:none}.app{padding-bottom:var(--bot-nav)}.bottom-nav{display:flex}
  .messages{padding:14px}.games-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
  .welcome h2{font-size:22px}.auth-box{padding:32px 24px}
  .search-filters{grid-template-columns:1fr}
  .popup-actions{grid-template-columns:repeat(2,1fr)}
}
@media(min-width:701px){.app{padding-bottom:0}}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:3px}
@supports(padding-bottom:env(safe-area-inset-bottom)){
  .bottom-nav{padding-bottom:env(safe-area-inset-bottom);height:calc(var(--bot-nav) + env(safe-area-inset-bottom))}
  .app{padding-bottom:calc(var(--bot-nav) + env(safe-area-inset-bottom))}
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = STYLES;
document.head.appendChild(styleEl);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
