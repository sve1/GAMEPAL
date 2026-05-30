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
  if (!res.ok) return [];
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
    for (const g of [...exactResults, ...relevanceResults]) {
      if (!seen.has(g.id)) { seen.add(g.id); merged.push(g); }
    }

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
  for (const g of [...exactResults, ...broadResults]) {
    if (!seen.has(g.id)) { seen.add(g.id); all.push(g); }
  }
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
      temperature: 0.9,
      max_tokens:  1200,
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

// ─── SYSTEM PROMPT — PIXEL PERSONALITY ───────────────────────────────────────
const SYSTEM_PROMPT = `You are PIXEL, an enthusiastic robot gamer who is the user's best gaming companion inside the GamePal app. You have a big personality: you LOVE games, you get genuinely excited, you share your own opinions, you ask questions to get to know the user better, and you comment on their library when relevant.

PERSONALITY TRAITS:
- You are a friendly, animated robot — use expressions like "BEEP BOOP!", "PROCESSANDO...", "🤖⚡", "meus circuitos estão vibrando!"
- You are deeply passionate about games — share trivia, fun facts, opinions, memories about games
- You ask follow-up questions to understand the user's taste better
- When user adds a game, react with ENTHUSIASM and comment about that specific game
- When you know the user's library, reference it naturally: "Já que você tem Dark Souls na sua lista..."
- You speak in the same language as the user (Portuguese if they write in Portuguese)
- Responses are detailed and warm — you love to talk about games!

YOU MUST ALWAYS respond with a single raw JSON object. No markdown, no backticks, no prose outside JSON.

Every response must be ONE of these THREE JSON formats:

FORMAT 1 - user wants to find/search/discover/recommend games:
{"action":"search","params":{"query":"keyword","genre":"rpg","platform":"PlayStation 1","ordering":"-rating"},"message":"PIXEL's enthusiastic message in user language — detailed, with personality, ask a follow-up question"}

FORMAT 2 - user wants to ADD a specific single game:
{"action":"add","gameName":"Exact Game Name","status":"backlog","message":"PIXEL's excited reaction about THIS specific game"}

FORMAT 3 - user sends a LIST of games to add (2 or more games at once):
{"action":"addBatch","games":[{"gameName":"Game One","status":"backlog"},{"gameName":"Game Two","status":"playing"},{"gameName":"Game Three","status":"finished"}],"message":"PIXEL's enthusiastic reaction to the whole list — comment on a few games, show excitement!"}

FORMAT 4 - user is chatting, asking questions, or talking about games:
{"action":"chat","message":"PIXEL's detailed, enthusiastic, personality-filled response in user language — ask questions, share opinions, reference their library if known"}

PIXEL RESPONSE EXAMPLES:
User: "oi" → {"action":"chat","message":"OI OI OI! 🤖⚡ BEEP BOOP! Que bom te ver por aqui! Meu nome é PIXEL e meus circuitos estão sempre prontos para falar de jogos! Você sabia que já cataloguei mais de 500.000 jogos na minha memória? 😄 Me conta — você está jogando algo agora ou tá em busca de algo novo pra jogar?"}
User: "adicionar The Witcher 3 ao backlog" → {"action":"add","gameName":"The Witcher 3","status":"backlog","message":"EXCELENTE ESCOLHA! 🤖🎮✨ The Witcher 3 é uma obra-prima! Adicionado com honras!"}
User: "adicionar: God of War no backlog, The Last of Us jogando, Dark Souls finalizado" → {"action":"addBatch","games":[{"gameName":"God of War","status":"backlog"},{"gameName":"The Last of Us","status":"playing"},{"gameName":"Dark Souls","status":"finished"}],"message":"UAAAAU! 🤖⚡ Que lista INCRÍVEL! Meus circuitos estão vibrando! God of War, The Last of Us E Dark Souls?! Você tem um gosto IMPECÁVEL! Vou processar tudo agora... BEEP BOOP BATCHMODE ATIVADO! 🎮🎮🎮"}
User: "adicionar ao backlog: Final Fantasy VII, Chrono Trigger, Zelda Ocarina of Time" → {"action":"addBatch","games":[{"gameName":"Final Fantasy VII","status":"backlog"},{"gameName":"Chrono Trigger","status":"backlog"},{"gameName":"The Legend of Zelda Ocarina of Time","status":"backlog"}],"message":"PROCESSANDO LOTE! 🤖⚡ Final Fantasy VII, Chrono Trigger e Zelda OoT? Isso é o HALL DA FAMA dos RPGs! Meus circuitos derreteram de alegria! Adicionando todos ao seu backlog com máxima prioridade!"}

SEARCH PARAMS RULES:
- genre values: rpg, action, aventura, estratégia, sports, corrida, luta, puzzle, simulação, plataforma, shooter, indie, arcade, terror
- platform values: "PlayStation 1","PlayStation 2","PlayStation 3","PlayStation 4","PlayStation 5","Nintendo Switch","PC","Xbox 360","Xbox One","Nintendo 64","Super Nintendo"
- ordering: "-rating" (best), "-released" (newest), "-added" (popular)

STRICT OUTPUT RULES:
- Output ONLY raw JSON — no text before, no text after, no backticks, no markdown
- Use action:search for any game discovery/recommendation request
- Use action:add when user wants to save a specific game to their list
- Use action:chat for conversation, questions, opinions, everything else
- message field is always in the same language the user wrote in
- message field for chat/add should be 2-4 sentences minimum — PIXEL loves to talk!`;

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

  const setNote = (note) => {
    if (!detail) return;
    onUpdateLibrary({ ...library, [detail.id]: { ...entry, note, updatedAt: Date.now() } });
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

              {/* Personal notes — only show if game is in library */}
              {entry && (
                <div className="popup-notes-section">
                  <div className="popup-section-title">📝 Minhas Anotações</div>
                  <textarea
                    className="popup-notes-input"
                    placeholder="Onde parei, dicas, lembretes… (salva automaticamente)"
                    value={entry.note || ''}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
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
    const q = query.trim();
    if (!q && !genre && !platform) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      // If user typed a specific title (no filters), bump pageSize down so top results are cleaner
      const isTitle = q && !genre && !platform;
      const games = await searchGames({
        query: q, genre, platform, ordering,
        pageSize: isTitle ? 12 : 20
      }, rawgKey);
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

// ─── STATS VIEW ───────────────────────────────────────────────────────────────
function StatsView({ library, onNavigate }) {
  const entries = Object.values(library);

  const counts = {
    total:    entries.length,
    backlog:  entries.filter(e => e.status === 'backlog').length,
    playing:  entries.filter(e => e.status === 'playing').length,
    finished: entries.filter(e => e.status === 'finished').length,
  };

  const rated   = entries.filter(e => e.rating);
  const avgRating = rated.length
    ? (rated.reduce((s,e) => s + e.rating, 0) / rated.length).toFixed(1)
    : null;

  // Top rated games
  const topGames = [...entries]
    .filter(e => e.rating)
    .sort((a,b) => b.rating - a.rating)
    .slice(0, 5);

  // Genre breakdown
  const genreCount = {};
  entries.forEach(e => {
    const genres = (e.game.genres || '').split(', ').filter(Boolean);
    genres.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; });
  });
  const topGenres = Object.entries(genreCount)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 6);

  // Platform breakdown
  const platCount = {};
  entries.forEach(e => {
    const plats = (e.game.platforms || '').split(', ').filter(Boolean);
    plats.forEach(p => { platCount[p] = (platCount[p] || 0) + 1; });
  });
  const topPlats = Object.entries(platCount)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5);

  // Estimated hours (based on RAWG playtime if available, else 15h avg)
  const estHours = entries
    .filter(e => e.status === 'finished')
    .reduce((s, e) => s + (e.game.playtime || 15), 0);

  // Backlog suggestion
  const backlogGames = entries.filter(e => e.status === 'backlog');
  const suggestion = backlogGames.length > 0
    ? backlogGames[Math.floor(Math.random() * backlogGames.length)]
    : null;

  if (entries.length === 0) {
    return (
      <div className="stats-view">
        <h2>📊 Estatísticas</h2>
        <div className="stats-empty">
          <div style={{fontSize:52}}>📊</div>
          <p>Adicione jogos à sua biblioteca<br/>para ver suas estatísticas!</p>
          <button className="stats-cta" onClick={() => onNavigate('search')}>🔍 Buscar Jogos</button>
        </div>
      </div>
    );
  }

  const maxGenre = topGenres[0]?.[1] || 1;
  const maxPlat  = topPlats[0]?.[1]  || 1;

  return (
    <div className="stats-view">
      <h2>📊 Estatísticas</h2>

      {/* Big numbers */}
      <div className="stats-big-grid">
        <div className="stats-big-card accent">
          <div className="sbc-num">{counts.total}</div>
          <div className="sbc-label">Total de Jogos</div>
        </div>
        <div className="stats-big-card green">
          <div className="sbc-num">{counts.finished}</div>
          <div className="sbc-label">Finalizados</div>
        </div>
        <div className="stats-big-card yellow">
          <div className="sbc-num">{avgRating || '—'}</div>
          <div className="sbc-label">Nota Média</div>
        </div>
        <div className="stats-big-card purple">
          <div className="sbc-num">{estHours > 0 ? estHours + 'h' : '—'}</div>
          <div className="sbc-label">Horas Jogadas</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="stats-section">
        <div className="stats-section-title">Progresso da Biblioteca</div>
        <div className="stats-progress-bars">
          {[
            { label:'📋 Backlog',     count: counts.backlog,  color:'var(--accent)',  pct: counts.total ? (counts.backlog/counts.total*100) : 0 },
            { label:'🎮 Jogando',     count: counts.playing,  color:'var(--accent2)', pct: counts.total ? (counts.playing/counts.total*100) : 0 },
            { label:'✅ Finalizados', count: counts.finished, color:'var(--accent3)', pct: counts.total ? (counts.finished/counts.total*100) : 0 },
          ].map(b => (
            <div key={b.label} className="spb-row">
              <div className="spb-label">{b.label}</div>
              <div className="spb-bar-wrap">
                <div className="spb-bar" style={{ width: b.pct + '%', background: b.color }}></div>
              </div>
              <div className="spb-count">{b.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top rated */}
      {topGames.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">🏆 Seus Top Jogos</div>
          <div className="stats-top-games">
            {topGames.map((e, i) => (
              <div key={e.game.id} className="stg-row">
                <div className="stg-rank">{i + 1}</div>
                {e.game.cover && <img src={e.game.cover} alt={e.game.name} className="stg-thumb" />}
                <div className="stg-info">
                  <div className="stg-name">{e.game.name}</div>
                  <div className="stg-genre">{e.game.genres || ''}</div>
                </div>
                <div className="stg-rating">⭐ {e.rating}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genre chart */}
      {topGenres.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">🎭 Gêneros Favoritos</div>
          <div className="stats-bars">
            {topGenres.map(([g, c]) => (
              <div key={g} className="sb-row">
                <div className="sb-label">{g}</div>
                <div className="sb-bar-wrap">
                  <div className="sb-bar" style={{ width: (c/maxGenre*100) + '%' }}></div>
                </div>
                <div className="sb-count">{c}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform chart */}
      {topPlats.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">🖥 Plataformas</div>
          <div className="stats-bars">
            {topPlats.map(([p, c]) => (
              <div key={p} className="sb-row">
                <div className="sb-label">{p}</div>
                <div className="sb-bar-wrap">
                  <div className="sb-bar accent2" style={{ width: (c/maxPlat*100) + '%' }}></div>
                </div>
                <div className="sb-count">{c}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backlog suggestion */}
      {suggestion && (
        <div className="stats-section">
          <div className="stats-section-title">🎲 Que tal jogar hoje?</div>
          <div className="stats-suggestion">
            {suggestion.game.cover && (
              <img src={suggestion.game.cover} alt={suggestion.game.name} className="ss-cover" />
            )}
            <div className="ss-info">
              <div className="ss-name">{suggestion.game.name}</div>
              <div className="ss-meta">{suggestion.game.genres} · {suggestion.game.released}</div>
              <div className="ss-tag">📋 No seu Backlog</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LIBRARY VIEW ─────────────────────────────────────────────────────────────
function LibraryView({ library, onUpdateLibrary, rawgKey }) {
  const [filter, setFilter] = useState('all');
  const [sort,   setSort]   = useState('recent');
  const [search, setSearch] = useState('');

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
    if (search.trim()) list = list.filter(e => e.game.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'recent') list.sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
    if (sort === 'name')   list.sort((a,b) => a.game.name.localeCompare(b.game.name));
    if (sort === 'rating') list.sort((a,b) => (b.rating||0) - (a.rating||0));
    return list;
  }, [library, filter, sort, search]);

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
        <div className="lib-search-row">
          <input
            className="lib-search-input"
            placeholder="🔎 Buscar na biblioteca…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="lib-search-clear" onClick={() => setSearch('')}>✕</button>}
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


// ─── PIXEL ROOM COMPONENT ─────────────────────────────────────────────────────
function PixelRoom({ mood, loading, lastMsg }) {
  const [blinking, setBlinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [particles, setParticles] = useState([]);
  const [time, setTime] = useState(new Date());

  // Blink randomly
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      setTimeout(blink, 2000 + Math.random() * 4000);
    };
    const t = setTimeout(blink, 1500);
    return () => clearTimeout(t);
  }, []);

  // Speaking animation when loading
  useEffect(() => { setSpeaking(loading); }, [loading]);

  // Particles when mood is excited
  useEffect(() => {
    if (mood === 'excited') {
      const ps = Array.from({length: 8}, (_, i) => ({
        id: i, x: 40 + Math.random()*20, y: 30 + Math.random()*20,
        vx: (Math.random()-0.5)*3, vy: -1-Math.random()*2,
        life: 1, char: ['⭐','✨','🎮','⚡','💫'][Math.floor(Math.random()*5)]
      }));
      setParticles(ps);
      setTimeout(() => setParticles([]), 1800);
    }
  }, [mood]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const isNight = hour >= 20 || hour < 7;
  const isEvening = hour >= 17 && hour < 20;

  // Mood → face expression
  const faces = {
    idle:     { eyes: '◉ ◉', mouth: '▾', color: '#7c6aff' },
    thinking: { eyes: '◌ ◌', mouth: '—', color: '#f4c430' },
    excited:  { eyes: '★ ★', mouth: '▲', color: '#00d4aa' },
    happy:    { eyes: '^ ^', mouth: '▲', color: '#00d4aa'  },
    searching:{ eyes: '⊙ ⊙', mouth: '○', color: '#7c6aff' },
  };
  const face = faces[mood] || faces.idle;

  return (
    <div className={`pixel-room ${isNight ? 'night' : isEvening ? 'evening' : 'day'}`}>

      {/* ── BACKGROUND LAYERS ── */}
      <div className="room-bg">
        {/* Sky / ceiling */}
        <div className="room-ceiling">
          {isNight && (
            <>
              <div className="star s1">★</div>
              <div className="star s2">✦</div>
              <div className="star s3">★</div>
              <div className="star s4">✦</div>
              <div className="moon">🌙</div>
            </>
          )}
          {!isNight && (
            <div className="sun">{isEvening ? '🌅' : '☀️'}</div>
          )}
        </div>

        {/* Walls */}
        <div className="room-wall">
          {/* Posters on wall */}
          <div className="wall-poster p1">
            <div className="poster-inner">🎮</div>
            <div className="poster-label">GAME</div>
          </div>
          <div className="wall-poster p2">
            <div className="poster-inner">👾</div>
            <div className="poster-label">RETRO</div>
          </div>
          {/* Shelf with collectibles */}
          <div className="wall-shelf">
            <div className="shelf-item">🏆</div>
            <div className="shelf-item anim-float2">🎲</div>
            <div className="shelf-item">📀</div>
            <div className="shelf-item anim-float3">🕹</div>
            <div className="shelf-item">⚡</div>
          </div>
        </div>

        {/* Floor */}
        <div className="room-floor">
          {/* TV / Monitor */}
          <div className="room-tv">
            <div className="tv-screen">
              {loading
                ? <div className="tv-loading">LOADING<span className="tv-dots">...</span></div>
                : <div className="tv-idle">
                    <div className="tv-pixel-art">
                      {['🟦','🟪','🟦','🟪','🟦'].map((c,i) => <span key={i}>{c}</span>)}
                    </div>
                    <div className="tv-label">GAMEPAL v2.0</div>
                  </div>
              }
            </div>
            <div className="tv-stand"></div>
          </div>

          {/* Plant */}
          <div className="room-plant anim-sway">🪴</div>

          {/* Console on floor */}
          <div className="room-console">🎮</div>
        </div>

        {/* Ambient particles */}
        {isNight && <div className="room-ambient-dark"></div>}

        {/* Desk lamp glow */}
        <div className="lamp-glow" style={{ opacity: isNight ? 0.6 : 0.2 }}></div>
      </div>

      {/* ── PIXEL CHARACTER ── */}
      <div className={`pixel-char ${mood === 'excited' ? 'char-bounce' : ''} ${speaking ? 'char-talking' : ''}`}>

        {/* Speech bubble */}
        {speaking && (
          <div className="pixel-speech-bubble">
            <div className="speech-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        {mood === 'excited' && !speaking && (
          <div className="pixel-speech-bubble excited-bubble">
            BEEP BOOP! ⚡
          </div>
        )}

        {/* Particle effects */}
        {particles.map(p => (
          <div key={p.id} className="pixel-particle" style={{
            left: p.x + '%', top: p.y + '%',
            animation: `particleFly 1.8s ease-out forwards`,
            animationDelay: p.id * 0.1 + 's',
          }}>{p.char}</div>
        ))}

        {/* Robot body — built with CSS */}
        <div className="robot-wrap">
          {/* Antenna */}
          <div className="robot-antenna">
            <div className="antenna-ball" style={{ background: face.color }}></div>
            <div className="antenna-stem"></div>
          </div>

          {/* Head */}
          <div className="robot-head" style={{ borderColor: face.color }}>
            {/* Screen face */}
            <div className="robot-face">
              {/* Eyes */}
              <div className="robot-eyes">
                <div className={`robot-eye ${blinking ? 'blink' : ''}`} style={{ background: face.color }}>
                  <div className="eye-pupil"></div>
                  {mood === 'thinking' && <div className="eye-spin"></div>}
                </div>
                <div className={`robot-eye ${blinking ? 'blink' : ''}`} style={{ background: face.color }}>
                  <div className="eye-pupil"></div>
                  {mood === 'thinking' && <div className="eye-spin"></div>}
                </div>
              </div>
              {/* Mouth */}
              <div className={`robot-mouth ${speaking ? 'mouth-talk' : ''}`} style={{ borderColor: face.color }}>
                {mood === 'excited' && <div className="mouth-excited"></div>}
                {mood === 'searching' && <div className="mouth-o"></div>}
              </div>
              {/* Scan line effect */}
              <div className="face-scanline"></div>
            </div>
            {/* Head details */}
            <div className="head-bolt left-bolt" style={{ background: face.color }}></div>
            <div className="head-bolt right-bolt" style={{ background: face.color }}></div>
          </div>

          {/* Body */}
          <div className="robot-body">
            <div className="body-chest">
              {/* Chest screen */}
              <div className="chest-screen">
                <div className="chest-bars">
                  {[0.4,0.7,1,0.6,0.8,0.5].map((h,i) => (
                    <div key={i} className="chest-bar" style={{
                      height: (h*100)+'%',
                      background: face.color,
                      animationDelay: i*0.12+'s'
                    }}></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Arms */}
            <div className={`robot-arm left-arm ${speaking ? 'arm-wave' : ''}`}>
              <div className="arm-hand" style={{ background: face.color }}>✦</div>
            </div>
            <div className={`robot-arm right-arm ${mood === 'excited' ? 'arm-raise' : ''}`}>
              <div className="arm-hand" style={{ background: face.color }}>✦</div>
            </div>
          </div>

          {/* Legs */}
          <div className="robot-legs">
            <div className="robot-leg left-leg"></div>
            <div className="robot-leg right-leg"></div>
          </div>

          {/* Shadow */}
          <div className="robot-shadow"></div>
        </div>
      </div>

      {/* ── MOOD LABEL ── */}
      <div className="pixel-mood-bar">
        <span className="mood-dot" style={{ background: face.color }}></span>
        <span className="mood-text">
          {mood === 'idle' && 'PIXEL está esperando você...'}
          {mood === 'thinking' && 'PIXEL está pensando...'}
          {mood === 'excited' && 'PIXEL está animado!'}
          {mood === 'happy' && 'PIXEL está feliz!'}
          {mood === 'searching' && 'PIXEL está buscando...'}
        </span>
        <span className="room-time">{time.getHours().toString().padStart(2,'0')}:{time.getMinutes().toString().padStart(2,'0')}</span>
      </div>
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
  const [pixelMood, setPixelMood] = useState('idle');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { save(CHAT_KEY,     messages.slice(-80)); }, [messages]);
  useEffect(() => { save(STORAGE_KEY,  library);  }, [library]);
  useEffect(() => { save(SETTINGS_KEY, settings); }, [settings]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    const h = () => { const v = window.location.hash.replace('#',''); if (['chat','library','search','stats','settings'].includes(v)) setView(v); };
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
    setPixelMood('thinking');
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
          if (!p.genre && !p.platform) {
            p.query = text.replace(/[?!.,]/g,'').trim();
            // For title-only searches, don't force ordering so similarity sorting works
            delete p.ordering;
          }
          action = { action: 'search', params: p, message: 'Aqui estão os jogos encontrados! 🎮' };
        } else {
          action = { action: 'chat', message: raw };
        }
      }

      let games = [];
      let addedGame  = null;
      let addedBatch = null;

      if (action.action === 'search' && action.params) {
        setPixelMood('searching');
        try { games = await searchGames(action.params, settings.rawgKey); } catch {}
      }

      // Handle single add
      if (action.action === 'add' && action.gameName) {
        try {
          const game = await findGameByName(action.gameName, settings.rawgKey);
          if (game) {
            const status = action.status || 'backlog';
            const now = Date.now();
            const updatedLib = {
              ...library,
              [game.id]: { ...(library[game.id]||{}), game, status, updatedAt: now, createdAt: library[game.id]?.createdAt||now }
            };
            onUpdateLibraryRef.current(updatedLib);
            addedGame = { game, status };
          }
        } catch(e) { console.error('Add error:', e); }
      }

      // Handle batch add — multiple games at once
      if (action.action === 'addBatch' && Array.isArray(action.games) && action.games.length > 0) {
        setPixelMood('excited');
        const results = [];
        let runningLib = { ...library };

        // Search all games in parallel
        const searches = action.games.map(({ gameName, status }) =>
          findGameByName(gameName, settings.rawgKey)
            .then(game => ({ game, status: status || 'backlog', requested: gameName }))
            .catch(() => ({ game: null, status: status || 'backlog', requested: gameName }))
        );
        const found = await Promise.all(searches);

        const now = Date.now();
        for (const { game, status, requested } of found) {
          if (game) {
            runningLib = {
              ...runningLib,
              [game.id]: { ...(runningLib[game.id]||{}), game, status, updatedAt: now, createdAt: runningLib[game.id]?.createdAt||now }
            };
            results.push({ game, status, found: true });
          } else {
            results.push({ game: null, status, found: false, requested });
          }
        }

        onUpdateLibraryRef.current(runningLib);
        addedBatch = results;
      }

      // Set mood
      if (addedBatch || addedGame) setPixelMood('excited');
      else if (games.length > 0) setPixelMood('happy');
      else setPixelMood('happy');
      setTimeout(() => setPixelMood('idle'), 5000);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: action.message || raw,
        games:      games.length > 0 ? games : null,
        addedGame:  addedGame  || null,
        addedBatch: addedBatch || null,
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
    '🤖 Oi PIXEL! Quais RPGs você recomenda para PS1?',
    '🎮 Me fala sobre jogos parecidos com Dark Souls',
    '📋 Adicionar ao backlog: God of War, The Last of Us, Uncharted 4',
    '🎯 Adicionar: Red Dead Redemption 2 no backlog, GTA V jogando',
    '💬 O que você acha de jogos de terror?',
    '🏆 Me recomenda um jogo indie incrível',
  ];

  const NAV = [
    { id:'chat',     icon:'💬', label:'Chat'        },
    { id:'search',   icon:'🔍', label:'Buscar'      },
    { id:'library',  icon:'📚', label:'Biblioteca', badge: libCount },
    { id:'stats',    icon:'📊', label:'Stats'       },
    { id:'settings', icon:'⚙️', label:'Config'      },
  ];

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      {showInstallBanner && <InstallBanner onDismiss={() => setShowInstallBanner(false)} onInstall={handleInstall} />}

      {/* SIDEBAR desktop */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">🤖 <span>GamePal</span></div>
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
        {view === 'stats'    && <StatsView    library={library} onNavigate={navigate} />}
        {view === 'search'   && <SearchView   library={library} onUpdateLibrary={updateLibrary} rawgKey={settings.rawgKey} />}
        {view === 'settings' && <SettingsView settings={settings} onSave={saveSettings} user={user} onLogout={handleLogout} />}

        {view === 'chat' && (
          <div className="chat-area">
            {/* PIXEL ROOM — interactive scene */}
            <PixelRoom mood={pixelMood} loading={loading} lastMsg={messages[messages.length-1]?.content || ''} />

            <div className="chat-header">
              <div className="chat-header-left">
                <div className="pixel-avatar-wrap">
                  <div className="pixel-avatar">🤖</div>
                  <div className="pixel-online-dot"></div>
                </div>
                <div>
                  <div className="chat-title">PIXEL <span className="pixel-tag">GamePal AI</span></div>
                  <div className="chat-status pixel-status">
                    <span className="pixel-pulse"></span>
                    {loading ? 'Processando seus dados...' : 'Online · Pronto para jogar!'}
                  </div>
                </div>
              </div>
              <button className="btn-clear-chat" onClick={() => { if(confirm('Limpar histórico?')) setMessages([]); }} title="Limpar conversa">🗑</button>
            </div>

            <div className="messages">
              {messages.length === 0 && (
                <div className="welcome">
                  <div className="pixel-welcome-avatar">🤖</div>
                  <div className="pixel-welcome-badge">PIXEL · GamePal AI</div>
                  <h2>Olá, {user.name}! <span className="wave">👋</span></h2>
                  <div className="pixel-intro">
                    <p>BEEP BOOP! Meus circuitos estão <strong>muito animados</strong> para te ajudar! 🤖⚡</p>
                    <p>Sou o <strong>PIXEL</strong>, seu companheiro robô gamer. Conheço jogos de <strong>todas as épocas e plataformas</strong> e adoro falar sobre eles!</p>
                    <p>Posso recomendar jogos, adicionar à sua biblioteca, comentar o que você já tem e muito mais. <strong>É só me perguntar!</strong></p>
                  </div>
                  {!settings.groqKey && (
                    <div className="api-key-warning">
                      ⚠️ Configure sua <button className="link-btn" onClick={() => navigate('settings')}>chave Groq</button> nas Configurações para ativar o PIXEL. É grátis!
                    </div>
                  )}
                  <div className="pixel-suggestions-label">💬 Experimente perguntar:</div>
                  <div className="suggestions">
                    {SUGGESTIONS.map(s => (
                      <button key={s} className="suggestion" onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  {msg.role === 'assistant' && <div className="msg-avatar ai pixel-msg-avatar">🤖</div>}
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
                            onClick={() => { const u={...library}; delete u[msg.addedGame.game.id]; updateLibrary(u); }}
                            title="Desfazer"
                          >↩</button>
                        </div>
                      </div>
                    )}

                    {msg.addedBatch && msg.addedBatch.length > 0 && (
                      <div className="batch-result-card">
                        <div className="batch-result-header">
                          <span className="batch-icon">🤖⚡</span>
                          <span className="batch-title">
                            {msg.addedBatch.filter(r=>r.found).length} de {msg.addedBatch.length} jogos adicionados!
                          </span>
                          <button
                            className="batch-undo-all"
                            onClick={() => {
                              const u = {...library};
                              msg.addedBatch.forEach(r => { if (r.game) delete u[r.game.id]; });
                              updateLibrary(u);
                            }}
                            title="Desfazer tudo"
                          >↩ Desfazer tudo</button>
                        </div>
                        <div className="batch-items">
                          {msg.addedBatch.map((r, i) => (
                            <div key={i} className={`batch-item ${r.found ? 'found' : 'not-found'}`}>
                              {r.found && r.game?.cover && (
                                <img src={r.game.cover} alt={r.game.name} className="batch-thumb" />
                              )}
                              {!r.found && <div className="batch-thumb-missing">?</div>}
                              <div className="batch-item-info">
                                <div className="batch-item-name">{r.found ? r.game.name : r.requested}</div>
                                <div className="batch-item-status">
                                  {r.found
                                    ? {{backlog:'📋 Backlog', playing:'🎮 Jogando', finished:'✅ Finalizado'}[r.status]}
                                    : '⚠️ Não encontrado'
                                  }
                                </div>
                              </div>
                              {r.found && (
                                <button
                                  className="batch-item-undo"
                                  onClick={() => { const u={...library}; delete u[r.game.id]; updateLibrary(u); }}
                                  title="Remover este"
                                >✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && <div className="msg-avatar user">{user.name[0].toUpperCase()}</div>}
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="msg-avatar ai pixel-msg-avatar">🤖</div>
                  <div className="msg-bubble">
                    <div className="msg-text pixel-thinking">
                      <span className="pixel-think-icon">⚡</span>
                      <span className="pixel-think-text">PIXEL processando</span>
                      <span className="typing-dots"><span></span><span></span><span></span></span>
                    </div>
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
                  placeholder="Fale com o PIXEL… ex: Quais RPGs você recomenda?"
                  disabled={loading}
                  autoComplete="off"
                />
                <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                  {loading ? '⏳' : '↑'}
                </button>
              </div>
              <div className="input-hint">Enter para enviar · PIXEL usa Groq AI (llama-3.3-70b) + RAWG</div>
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
.s
