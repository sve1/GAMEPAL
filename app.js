// ─── GamePal PWA – app.js ─────────────────────────────────────────────────────
// Runs via Babel standalone (no build step). Deploy to GitHub Pages as-is.
// ─────────────────────────────────────────────────────────────────────────────

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STORAGE_KEY   = 'gamepal_library_v1';
const CHAT_KEY      = 'gamepal_chat_v1';
const USER_KEY      = 'gamepal_user_v1';
const SETTINGS_KEY  = 'gamepal_settings_v1';

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
  'indie':'indie',
  'arcade':'arcade',
  'mmorpg':'massively-multiplayer','mmo':'massively-multiplayer',
  'card':'card','board':'board-games',
  'beat em up':'action','hack and slash':'action',
  'metroidvania':'platformer','roguelike':'indie','roguelite':'indie',
};

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
const load  = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save  = (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── RAWG API ─────────────────────────────────────────────────────────────────
async function searchGames({ query, genre, platform, ordering = '-rating', pageSize = 12 }, rawgKey) {
  const url = new URL('https://api.rawg.io/api/games');
  if (query)    url.searchParams.set('search', query);
  if (genre) {
    const slug = GENRE_MAP[genre.toLowerCase()];
    if (slug)   url.searchParams.set('genres', slug);
  }
  if (platform) {
    const slug = PLATFORM_MAP[platform.toLowerCase()];
    if (slug)   url.searchParams.set('platforms', slug);
  }
  url.searchParams.set('ordering', ordering);
  url.searchParams.set('page_size', String(pageSize));
  if (rawgKey)  url.searchParams.set('key', rawgKey);

  const res  = await fetch(url.toString());
  if (!res.ok) throw new Error('RAWG API error ' + res.status);
  const data = await res.json();
  return (data.results || []).map(g => ({
    id:        g.id,
    name:      g.name,
    cover:     g.background_image,
    platforms: (g.platforms || []).map(p => p.platform.name).slice(0, 3).join(', ') || 'N/A',
    rating:    g.rating ? g.rating.toFixed(1) : 'N/A',
    genres:    (g.genres || []).map(x => x.name).slice(0, 2).join(', '),
    released:  g.released ? g.released.slice(0, 4) : '',
    metacritic: g.metacritic || null,
  }));
}

// ─── GEMINI API (free tier) ───────────────────────────────────────────────────
async function callGemini(messages, systemPrompt, geminiKey) {
  if (!geminiKey) throw new Error('Gemini API key not set. Please add it in Settings ⚙️');

  // Convert chat history to Gemini's "contents" format
  // Gemini uses "user" / "model" roles (not "assistant")
  const contents = messages.map(m => ({
    role:  m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  const data = await res.json();

  if (data.error) throw new Error(data.error.message || 'Gemini API error');

  // Extract text from response
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  if (!text) throw new Error('Empty response from Gemini. Please try again.');
  return text;
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are GamePal, an enthusiastic and knowledgeable gaming assistant. Help users discover and organize games.

When the user asks to search, find, recommend, or discover games, respond ONLY with a JSON block:
\`\`\`json
{"action":"search","params":{"query":"...","genre":"...","platform":"...","ordering":"-rating"},"message":"Your friendly intro"}
\`\`\`

JSON field rules:
- "query": specific game title or keyword (omit if not needed)
- "genre": one of: rpg, action, adventure, strategy, sports, racing, fighting, puzzle, simulation, platformer, shooter, indie, arcade, horror, mmorpg (omit if not needed)
- "platform": e.g. "PlayStation 1", "PC", "Switch", "PS4", "Xbox 360" (omit if not needed)
- "ordering": "-rating" (default), "-released" (newest), "-added" (popular), "name"
- "message": short, enthusiastic response (1-2 sentences)

For "games similar to X": use query="X" and ordering="-rating"
For "best games of [year]": use ordering="-rating" and add year to query
For "new releases": use ordering="-released"
For "short games" / "easy games" / "hidden gems": use ordering="-rating" with relevant genre

If user is chatting (not searching), respond ONLY with:
\`\`\`json
{"action":"chat","message":"Your response here"}
\`\`\`

Keep messages concise and enthusiastic. Use gaming references. Always reply in the same language the user writes in.`;

// ─── ICON GENERATOR (Canvas SVG → PNG base64) ────────────────────────────────
function generateIconSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0d0d12"/>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c6aff"/>
      <stop offset="100%" stop-color="#00d4aa"/>
    </linearGradient>
  </defs>
  <text x="50%" y="58%" font-size="${size * 0.52}" text-anchor="middle" dominant-baseline="middle">🎮</text>
</svg>`;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// ── Star Rating ──
function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="star-rating">
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <span
          key={n}
          className={`star ${n <= (hovered ?? value ?? 0) ? 'lit' : ''}`}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(null)}
          onClick={() => !readonly && onChange && onChange(n)}
        >★</span>
      ))}
    </div>
  );
}

// ── Game Card ──
function GameCard({ game, library, onUpdateLibrary }) {
  const entry = library[game.id];
  const [showRating, setShowRating] = useState(false);

  const setStatus = (status) => {
    const now = Date.now();
    const updated = {
      ...library,
      [game.id]: { ...entry, game, status, updatedAt: now, createdAt: entry?.createdAt || now }
    };
    onUpdateLibrary(updated);
    if (status === 'finished') setShowRating(true);
  };

  const setRating = (r) => {
    onUpdateLibrary({ ...library, [game.id]: { ...entry, rating: r, updatedAt: Date.now() } });
    setShowRating(false);
  };

  const removeGame = () => {
    const updated = { ...library };
    delete updated[game.id];
    onUpdateLibrary(updated);
  };

  const STATUS_COLORS = { backlog: '#6c63ff', playing: '#00d4aa', finished: '#f4c430' };
  const STATUS_LABELS = { backlog: '📋 Backlog', playing: '🎮 Playing', finished: '✅ Done' };

  return (
    <div className="game-card">
      <div className="game-cover">
        {game.cover
          ? <img src={game.cover} alt={game.name} loading="lazy" />
          : <div className="no-cover">🎮</div>
        }
        {entry?.status && (
          <div className="status-badge" style={{ background: STATUS_COLORS[entry.status] }}>
            {STATUS_LABELS[entry.status]}
          </div>
        )}
        {game.metacritic && (
          <div className="meta-badge" style={{ background: game.metacritic >= 75 ? '#3cb371' : game.metacritic >= 50 ? '#f4c430' : '#cc3333' }}>
            {game.metacritic}
          </div>
        )}
      </div>
      <div className="game-info">
        <div className="game-name" title={game.name}>{game.name}</div>
        <div className="game-meta">
          {game.genres && <span className="tag">{game.genres}</span>}
          {game.released && <span className="tag year">{game.released}</span>}
          {game.rating !== 'N/A' && <span className="tag rating">⭐ {game.rating}</span>}
        </div>
        <div className="game-plat">{game.platforms}</div>

        {entry?.rating && !showRating && (
          <div className="my-rating">My rating: <span>{entry.rating}/10</span></div>
        )}

        {showRating && (
          <div className="rating-row">
            <span className="rating-label">Rate this game:</span>
            <StarRating value={entry?.rating || 0} onChange={setRating} />
          </div>
        )}

        <div className="card-actions">
          <button
            className={`btn-action ${entry?.status === 'backlog' ? 'active backlog' : ''}`}
            onClick={() => setStatus('backlog')}
            title="Add to Backlog"
          >📋</button>
          <button
            className={`btn-action ${entry?.status === 'playing' ? 'active playing' : ''}`}
            onClick={() => setStatus('playing')}
            title="Mark as Playing"
          >🎮</button>
          <button
            className={`btn-action ${entry?.status === 'finished' ? 'active finished' : ''}`}
            onClick={() => setStatus('finished')}
            title="Mark as Finished"
          >✅</button>
          {entry?.status === 'finished' && (
            <button className="btn-action rate" onClick={() => setShowRating(!showRating)} title="Rate">⭐</button>
          )}
          {entry && (
            <button className="btn-action remove" onClick={removeGame} title="Remove from library">✕</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Library View ──
function LibraryView({ library, onUpdateLibrary }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort]     = useState('recent');

  const counts = useMemo(() => ({
    all:      Object.keys(library).length,
    backlog:  Object.values(library).filter(e => e.status === 'backlog').length,
    playing:  Object.values(library).filter(e => e.status === 'playing').length,
    finished: Object.values(library).filter(e => e.status === 'finished').length,
  }), [library]);

  const avgRating = useMemo(() => {
    const rated = Object.values(library).filter(e => e.rating);
    if (!rated.length) return null;
    return (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1);
  }, [library]);

  const items = useMemo(() => {
    let list = Object.values(library);
    if (filter !== 'all') list = list.filter(e => e.status === filter);
    if (sort === 'recent')  list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    if (sort === 'name')    list.sort((a, b) => a.game.name.localeCompare(b.game.name));
    if (sort === 'rating')  list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [library, filter, sort]);

  return (
    <div className="library-view">
      <div className="lib-header">
        <div className="lib-title-row">
          <h2>My Library</h2>
          {avgRating && <div className="avg-rating">avg ⭐ {avgRating}</div>}
        </div>

        <div className="lib-stats-row">
          {['all','backlog','playing','finished'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🗂 All' : f === 'backlog' ? '📋 Backlog' : f === 'playing' ? '🎮 Playing' : '✅ Finished'}
              <span className="count">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="lib-sort-row">
          <span className="sort-label">Sort:</span>
          {['recent','name','rating'].map(s => (
            <button key={s} className={`sort-btn ${sort === s ? 'active' : ''}`} onClick={() => setSort(s)}>
              {s === 'recent' ? 'Recent' : s === 'name' ? 'A–Z' : 'Rating'}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-lib">
          <div className="empty-icon">🎮</div>
          <p>No games here yet.<br/>Chat with GamePal to discover some!</p>
        </div>
      ) : (
        <div className="games-grid">
          {items.map(entry => (
            <GameCard key={entry.game.id} game={entry.game} library={library} onUpdateLibrary={onUpdateLibrary} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings View ──
function SettingsView({ settings, onSave, user, onLogout }) {
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey || '');
  const [rawgKey,   setRawgKey]   = useState(settings.rawgKey   || '');
  const [saved, setSaved]         = useState(false);

  const handleSave = () => {
    onSave({ ...settings, geminiKey, rawgKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-view">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>👤 Account</h3>
        <div className="settings-card">
          <div className="setting-user">
            <div className="user-avatar-big">{user.name[0].toUpperCase()}</div>
            <div>
              <div className="setting-user-name">{user.name}</div>
              {user.email && <div className="setting-user-email">{user.email}</div>}
            </div>
          </div>
          <button className="btn-danger" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>🔑 API Keys</h3>
        <p className="settings-note">Your keys are stored only on this device (localStorage). Never sent anywhere except the respective APIs.</p>

        <div className="settings-card">
          <label className="setting-label">
            Google Gemini API Key
            <span className="setting-badge required">Required · Free</span>
          </label>
          <p className="setting-desc">
            Powers the AI chat — completely free tier available.<br/>
            Get yours in seconds at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a> → click <strong>"Get API key"</strong>. No credit card needed!
          </p>
          <input
            type="password"
            className="setting-input"
            placeholder="AIza..."
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
          />
          {geminiKey && (
            <div className="key-status ok">✓ Key entered — you're ready to chat!</div>
          )}
        </div>

        <div className="settings-card">
          <label className="setting-label">
            RAWG API Key
            <span className="setting-badge optional">Optional · Free</span>
          </label>
          <p className="setting-desc">Higher rate limits for game search. Get yours free at <a href="https://rawg.io/apidocs" target="_blank" rel="noreferrer">rawg.io/apidocs</a></p>
          <input
            type="password"
            className="setting-input"
            placeholder="4193f734e2f1493cb033d60b1363edfe"
            value={rawgKey}
            onChange={e => setRawgKey(e.target.value)}
          />
        </div>

        <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Keys'}
        </button>
      </div>

      <div className="settings-section">
        <h3>📱 Install as App</h3>
        <div className="settings-card">
          <p className="setting-desc">
            <strong>iOS:</strong> Tap the Share button → "Add to Home Screen"<br/>
            <strong>Android/Chrome:</strong> Tap the menu (⋮) → "Install app" or "Add to Home Screen"<br/>
            <strong>Desktop:</strong> Click the install icon (⊕) in your browser's address bar
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3>🗑 Data</h3>
        <div className="settings-card">
          <p className="setting-desc">Clear all your local data (library, chat history, settings).</p>
          <button className="btn-danger" onClick={() => {
            if (confirm('Delete ALL data? This cannot be undone.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}>Clear All Data</button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Screen ──
function AuthScreen({ onLogin }) {
  const [mode,  setMode]  = useState('login');
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    onLogin({ name: name.trim(), email: email.trim(), id: String(Date.now()) });
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">🎮</div>
        <h1 className="auth-title">GamePal</h1>
        <p className="auth-sub">Your intelligent AI gaming companion</p>

        <div className="auth-tabs">
          <button className={mode === 'login'  ? 'active' : ''} onClick={() => setMode('login')}>Sign In</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        <div className="auth-form">
          <input
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            autoFocus
          />
          {mode === 'signup' && (
            <input
              placeholder="Email (optional)"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          )}
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" onClick={submit}>
            {mode === 'login' ? 'Enter →' : 'Create Account →'}
          </button>
        </div>

        <p className="auth-note">All data stored locally on your device • No account server required</p>
      </div>
    </div>
  );
}

// ── Install Banner ──
function InstallBanner({ onDismiss, onInstall }) {
  return (
    <div className="install-banner">
      <span className="install-icon">📲</span>
      <div className="install-text">
        <strong>Install GamePal</strong>
        <span>Add to home screen for the best experience</span>
      </div>
      <button className="install-btn" onClick={onInstall}>Install</button>
      <button className="install-dismiss" onClick={onDismiss}>✕</button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [user,     setUser]     = useState(() => load(USER_KEY, null));
  const [messages, setMessages] = useState(() => load(CHAT_KEY, []));
  const [library,  setLibrary]  = useState(() => load(STORAGE_KEY, {}));
  const [settings, setSettings] = useState(() => load(SETTINGS_KEY, {}));
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [view,     setView]     = useState(() => window.location.hash === '#library' ? 'library' : 'chat');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [apiError, setApiError] = useState('');

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Persist state
  useEffect(() => { save(CHAT_KEY,     messages.slice(-80)); }, [messages]);
  useEffect(() => { save(STORAGE_KEY,  library);  }, [library]);
  useEffect(() => { save(SETTINGS_KEY, settings); }, [settings]);

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Hash routing
  useEffect(() => {
    const onHash = () => setView(window.location.hash === '#library' ? 'library' : window.location.hash === '#settings' ? 'settings' : 'chat');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstallBanner(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Hide splash
  useEffect(() => { window.__hideSplash?.(); }, []);

  const navigate = (v) => {
    setView(v);
    window.location.hash = v === 'chat' ? '' : v;
  };

  const handleLogin = (u) => { save(USER_KEY, u); setUser(u); };
  const handleLogout = () => { save(USER_KEY, null); setUser(null); };
  const updateLibrary = useCallback((lib) => setLibrary(lib), []);
  const saveSettings  = useCallback((s) => setSettings(s), []);

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
    setInput('');
    setApiError('');

    const userMsg = { role: 'user', content: text, ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(-12).map(m => ({
        role:    m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const raw = await callGemini(history, SYSTEM_PROMPT, settings.geminiKey);

      // Parse JSON action from response
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);
      let action = { action: 'chat', message: raw };
      if (jsonMatch) {
        try { action = JSON.parse(jsonMatch[1]); } catch {}
      }

      let games = [];
      if (action.action === 'search' && action.params) {
        try {
          games = await searchGames(action.params, settings.rawgKey);
        } catch (e) {
          console.warn('RAWG error:', e);
        }
      }

      const assistantMsg = {
        role:    'assistant',
        content: action.message || raw,
        games:   games.length > 0 ? games : null,
        ts:      Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      setApiError(err.message || 'Something went wrong');
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: '⚠️ Error connecting to Gemini. Please check your Google AI API key in Settings ⚙️',
        ts:      Date.now(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    if (confirm('Clear chat history?')) { setMessages([]); }
  };

  const libCount     = Object.keys(library).length;
  const playingCount = Object.values(library).filter(e => e.status === 'playing').length;

  const SUGGESTIONS = [
    'Best RPG games for PS1',
    'Games similar to Dark Souls',
    'Top Nintendo Switch games',
    'Best indie games 2023',
    'Short horror games',
    'Melhores jogos de aventura',
  ];

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      {showInstallBanner && (
        <InstallBanner onDismiss={() => setShowInstallBanner(false)} onInstall={handleInstall} />
      )}

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">🎮 <span>GamePal</span></div>
          <div className="user-pill">
            <div className="user-avatar">{user.name[0].toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-stats">{libCount} games · {playingCount} playing</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'chat',     icon: '💬', label: 'Chat' },
            { id: 'library',  icon: '📚', label: 'Library', badge: libCount },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="stats-grid">
            {[
              { label: 'Backlog',  count: Object.values(library).filter(e => e.status === 'backlog').length },
              { label: 'Playing',  count: playingCount },
              { label: 'Finished', count: Object.values(library).filter(e => e.status === 'finished').length },
            ].map(s => (
              <div key={s.label} className="stat">
                <div className="stat-n">{s.count}</div>
                <div className="stat-l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main">
        {view === 'library'  && <LibraryView  library={library} onUpdateLibrary={updateLibrary} />}
        {view === 'settings' && <SettingsView settings={settings} onSave={saveSettings} user={user} onLogout={handleLogout} />}
        {view === 'chat' && (
          <div className="chat-area">
            {/* Chat header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-avatar">🎮</div>
                <div>
                  <div className="chat-title">GamePal</div>
                  <div className="chat-status">AI Gaming Assistant</div>
                </div>
              </div>
              <button className="btn-clear-chat" onClick={clearChat} title="Clear chat">🗑</button>
            </div>

            {/* Messages */}
            <div className="messages">
              {messages.length === 0 && (
                <div className="welcome">
                  <div className="welcome-icon">🎮</div>
                  <h2>Hey, {user.name}!</h2>
                  <p>Ask me anything about games. I'll help you discover, organize, and track your gaming journey.</p>
                  {!settings.geminiKey && (
                    <div className="api-key-warning">
                      ⚠️ Set your <button className="link-btn" onClick={() => navigate('settings')}>Google Gemini API key</button> in Settings to start chatting. It's free!
                    </div>
                  )}
                  <div className="suggestions">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        className="suggestion"
                        onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                      >{s}</button>
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
                        {msg.games.map(g => (
                          <GameCard key={g.id} game={g} library={library} onUpdateLibrary={updateLibrary} />
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="msg-avatar user">{user.name[0].toUpperCase()}</div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="msg-avatar ai">🎮</div>
                  <div className="msg-bubble">
                    <div className="msg-text typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="input-area">
              {apiError && <div className="api-error-bar">⚠️ {apiError}</div>}
              <div className="input-wrap">
                <input
                  ref={inputRef}
                  className="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about games… e.g. RPG games for PS1"
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  {loading ? '⏳' : '↑'}
                </button>
              </div>
              <div className="input-hint">Enter to send · Powered by Claude AI + RAWG</div>
            </div>
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="bottom-nav">
        {[
          { id: 'chat',     icon: '💬', label: 'Chat' },
          { id: 'library',  icon: '📚', label: 'Library' },
          { id: 'settings', icon: '⚙️', label: 'Settings' },
        ].map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${view === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
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
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #0d0d12;
  --surface:  #13131a;
  --surface2: #1a1a24;
  --surface3: #22222f;
  --border:   rgba(255,255,255,0.07);
  --accent:   #7c6aff;
  --accent2:  #00d4aa;
  --accent3:  #f4c430;
  --danger:   #ff5555;
  --text:     #e8e8f0;
  --text2:    #9090a8;
  --text3:    #5a5a72;
  --radius:   14px;
  --fh:       'Syne', sans-serif;
  --fb:       'DM Sans', sans-serif;
  --bot-nav:  60px;
}

html, body { height: 100%; overflow: hidden; }
body { background: var(--bg); color: var(--text); font-family: var(--fb); -webkit-font-smoothing: antialiased; }
a { color: var(--accent2); }
button { font-family: var(--fb); }

/* ── INSTALL BANNER ── */
.install-banner {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: linear-gradient(135deg, #1a1040, #0d1a24);
  border-bottom: 1px solid var(--border);
  padding: 10px 16px; display: flex; align-items: center; gap: 10px;
}
.install-icon { font-size: 22px; }
.install-text { flex: 1; display: flex; flex-direction: column; font-size: 13px; }
.install-text strong { color: var(--text); }
.install-text span { color: var(--text2); font-size: 11px; }
.install-btn { padding: 7px 14px; background: var(--accent); border: none; border-radius: 8px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
.install-dismiss { background: none; border: none; color: var(--text3); font-size: 16px; cursor: pointer; padding: 4px 8px; }

/* ── APP LAYOUT ── */
.app {
  display: flex; height: 100dvh; overflow: hidden;
  padding-bottom: var(--bot-nav);
}

/* ── AUTH ── */
.auth-screen {
  min-height: 100dvh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 30% 50%, #1a1040 0%, #0d0d12 60%);
  padding: 20px;
}
.auth-box {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 24px; padding: 40px 36px; width: 100%; max-width: 380px;
  text-align: center; box-shadow: 0 40px 80px rgba(0,0,0,0.6);
}
.auth-logo  { font-size: 52px; margin-bottom: 12px; }
.auth-title { font-family: var(--fh); font-size: 30px; font-weight: 800; margin-bottom: 6px; }
.auth-sub   { color: var(--text2); margin-bottom: 28px; font-size: 14px; }
.auth-tabs  { display: flex; background: var(--surface3); border-radius: 10px; padding: 4px; margin-bottom: 20px; }
.auth-tabs button { flex: 1; padding: 8px; border: none; background: none; color: var(--text2); font-size: 14px; border-radius: 8px; cursor: pointer; transition: all .2s; }
.auth-tabs button.active { background: var(--accent); color: white; }
.auth-form  { display: flex; flex-direction: column; gap: 12px; }
.auth-form input { padding: 13px 16px; background: var(--surface3); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 15px; outline: none; transition: border-color .2s; }
.auth-form input:focus { border-color: var(--accent); }
.auth-error  { color: #ff6b6b; font-size: 13px; }
.auth-submit { padding: 14px; background: var(--accent); border: none; border-radius: 10px; color: white; font-family: var(--fh); font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity .2s; margin-top: 4px; }
.auth-submit:hover { opacity: .85; }
.auth-note   { color: var(--text3); font-size: 11px; margin-top: 18px; line-height: 1.5; }

/* ── SIDEBAR ── */
.sidebar {
  width: 230px; min-width: 230px; background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 20px 14px;
}
.sidebar-top   { margin-bottom: 24px; }
.logo          { font-family: var(--fh); font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.user-pill     { display: flex; align-items: center; gap: 10px; background: var(--surface2); border-radius: 12px; padding: 10px; }
.user-avatar   { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: var(--fh); font-weight: 700; font-size: 14px; color: white; flex-shrink: 0; }
.user-name     { font-size: 13px; font-weight: 500; }
.user-stats    { font-size: 11px; color: var(--text3); }
.sidebar-nav   { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.nav-item      { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; background: none; color: var(--text2); font-size: 14px; border-radius: 10px; cursor: pointer; text-align: left; transition: all .15s; position: relative; }
.nav-item:hover  { background: var(--surface2); color: var(--text); }
.nav-item.active { background: rgba(124,106,255,.15); color: var(--accent); }
.nav-icon      { font-size: 16px; }
.nav-badge     { margin-left: auto; background: var(--accent); color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
.sidebar-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border); }
.stats-grid    { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
.stat          { background: var(--surface2); border-radius: 10px; padding: 10px 6px; text-align: center; }
.stat-n        { font-family: var(--fh); font-size: 18px; font-weight: 700; }
.stat-l        { font-size: 10px; color: var(--text3); margin-top: 2px; }

/* ── MAIN ── */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

/* ── CHAT ── */
.chat-area   { display: flex; flex-direction: column; height: 100%; }
.chat-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--surface); flex-shrink: 0; }
.chat-header-left { display: flex; align-items: center; gap: 12px; }
.chat-avatar { font-size: 28px; }
.chat-title  { font-family: var(--fh); font-size: 16px; font-weight: 700; }
.chat-status { font-size: 11px; color: var(--accent2); }
.btn-clear-chat { background: none; border: none; color: var(--text3); font-size: 18px; cursor: pointer; padding: 6px; border-radius: 8px; transition: color .2s; }
.btn-clear-chat:hover { color: var(--danger); }

.messages {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 18px;
  scrollbar-width: thin; scrollbar-color: var(--surface3) transparent;
}

.welcome         { text-align: center; margin: auto; max-width: 480px; padding: 32px 16px; }
.welcome-icon    { font-size: 52px; margin-bottom: 14px; }
.welcome h2      { font-family: var(--fh); font-size: 26px; font-weight: 800; margin-bottom: 10px; }
.welcome p       { color: var(--text2); font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
.api-key-warning { background: rgba(255,85,85,.1); border: 1px solid rgba(255,85,85,.3); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #ff9999; margin-bottom: 16px; }
.link-btn        { background: none; border: none; color: var(--accent2); text-decoration: underline; cursor: pointer; font-size: inherit; padding: 0; }
.suggestions     { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.suggestion      { padding: 8px 14px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; color: var(--text2); font-size: 12px; cursor: pointer; transition: all .2s; }
.suggestion:hover { background: rgba(124,106,255,.15); border-color: var(--accent); color: var(--accent); }

.message         { display: flex; gap: 10px; align-items: flex-start; }
.message.user    { flex-direction: row-reverse; }
.msg-avatar      { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; background: var(--surface2); border: 1px solid var(--border); }
.msg-avatar.ai   { background: linear-gradient(135deg, #2a1a5e, #0d2a2a); border-color: rgba(124,106,255,.3); }
.msg-avatar.user { background: var(--accent); color: white; font-family: var(--fh); font-weight: 700; font-size: 14px; border-color: transparent; }
.msg-bubble      { max-width: 82%; display: flex; flex-direction: column; gap: 10px; }
.message.user .msg-bubble { align-items: flex-end; }
.msg-text        { padding: 11px 15px; background: var(--surface2); border-radius: 14px; font-size: 14px; line-height: 1.6; border: 1px solid var(--border); }
.message.user .msg-text { background: rgba(124,106,255,.2); border-color: rgba(124,106,255,.3); }

.typing-indicator { display: flex; gap: 5px; align-items: center; min-width: 48px; }
.typing-indicator span { width: 7px; height: 7px; background: var(--text3); border-radius: 50%; animation: bounce 1.2s infinite; }
.typing-indicator span:nth-child(2) { animation-delay: .2s; }
.typing-indicator span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce { 0%,80%,100% { transform:scale(.6); opacity:.4; } 40% { transform:scale(1); opacity:1; } }

/* ── INPUT ── */
.input-area    { padding: 12px 16px 14px; border-top: 1px solid var(--border); background: var(--surface); flex-shrink: 0; }
.api-error-bar { background: rgba(255,85,85,.1); border: 1px solid rgba(255,85,85,.3); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #ff9999; margin-bottom: 8px; }
.input-wrap    { display: flex; gap: 8px; background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 5px 5px 5px 14px; transition: border-color .2s; }
.input-wrap:focus-within { border-color: rgba(124,106,255,.5); }
.chat-input    { flex: 1; background: none; border: none; outline: none; color: var(--text); font-size: 14px; min-width: 0; }
.chat-input::placeholder { color: var(--text3); }
.send-btn      { width: 36px; height: 36px; background: var(--accent); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity .2s; flex-shrink: 0; }
.send-btn:disabled { opacity: .4; cursor: default; }
.input-hint    { text-align: center; font-size: 10px; color: var(--text3); margin-top: 6px; }

/* ── GAME CARDS ── */
.games-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px,1fr)); gap: 10px; }
.game-card   { background: var(--surface3); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: transform .2s, border-color .2s; }
.game-card:hover { transform: translateY(-2px); border-color: rgba(124,106,255,.4); }
.game-cover  { position: relative; aspect-ratio: 16/9; overflow: hidden; background: var(--surface2); }
.game-cover img { width: 100%; height: 100%; object-fit: cover; }
.no-cover    { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 34px; }
.status-badge { position: absolute; top: 6px; right: 6px; font-size: 9px; padding: 3px 7px; border-radius: 20px; font-weight: 700; color: #000; }
.meta-badge   { position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 6px; color: white; }
.game-info   { padding: 9px 11px; }
.game-name   { font-family: var(--fh); font-size: 12px; font-weight: 600; margin-bottom: 5px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.game-meta   { display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 4px; }
.tag         { font-size: 9px; padding: 2px 6px; background: var(--surface2); border-radius: 20px; color: var(--text2); }
.tag.year    { color: var(--accent2); }
.tag.rating  { color: var(--accent3); }
.game-plat   { font-size: 9px; color: var(--text3); margin-bottom: 7px; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.my-rating   { font-size: 11px; color: var(--accent3); margin-bottom: 6px; }
.my-rating span { font-weight: 700; }
.rating-row  { margin-bottom: 7px; }
.rating-label { display: block; font-size: 10px; color: var(--text2); margin-bottom: 4px; }
.star-rating { display: flex; gap: 2px; }
.star        { cursor: pointer; font-size: 13px; color: var(--surface2); transition: color .1s; }
.star.lit    { color: var(--accent3); }
.card-actions { display: flex; gap: 4px; }
.btn-action  { flex: 1; padding: 5px 3px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; cursor: pointer; transition: all .2s; }
.btn-action:hover { background: rgba(124,106,255,.2); border-color: var(--accent); }
.btn-action.active.backlog  { background: rgba(124,106,255,.3); border-color: var(--accent); }
.btn-action.active.playing  { background: rgba(0,212,170,.2); border-color: var(--accent2); }
.btn-action.active.finished { background: rgba(244,196,48,.15); border-color: var(--accent3); }
.btn-action.rate   { background: rgba(244,196,48,.1); border-color: rgba(244,196,48,.3); }
.btn-action.remove { flex: none; width: 28px; padding: 5px; background: rgba(255,85,85,.05); border-color: rgba(255,85,85,.2); color: var(--text3); font-size: 11px; }
.btn-action.remove:hover { background: rgba(255,85,85,.2); border-color: var(--danger); color: white; }

/* ── LIBRARY ── */
.library-view    { flex: 1; overflow-y: auto; padding: 20px; }
.lib-title-row   { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.lib-title-row h2 { font-family: var(--fh); font-size: 24px; font-weight: 800; }
.avg-rating      { font-size: 13px; color: var(--accent3); font-weight: 600; }
.lib-stats-row   { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.filter-btn      { padding: 7px 14px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; color: var(--text2); font-size: 12px; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 5px; }
.filter-btn:hover  { border-color: var(--accent); color: var(--text); }
.filter-btn.active { background: rgba(124,106,255,.2); border-color: var(--accent); color: var(--accent); }
.count           { background: var(--surface3); border-radius: 20px; padding: 1px 7px; font-size: 10px; }
.lib-sort-row    { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.sort-label      { font-size: 12px; color: var(--text3); }
.sort-btn        { padding: 4px 12px; background: none; border: 1px solid var(--border); border-radius: 20px; color: var(--text3); font-size: 12px; cursor: pointer; transition: all .2s; }
.sort-btn.active { border-color: var(--accent2); color: var(--accent2); }
.empty-lib       { text-align: center; padding: 60px 20px; color: var(--text2); }
.empty-icon      { font-size: 48px; margin-bottom: 12px; }
.empty-lib p     { line-height: 1.7; }

/* ── SETTINGS ── */
.settings-view    { flex: 1; overflow-y: auto; padding: 24px 20px; }
.settings-view h2 { font-family: var(--fh); font-size: 24px; font-weight: 800; margin-bottom: 24px; }
.settings-section { margin-bottom: 28px; }
.settings-section h3 { font-family: var(--fh); font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--text2); }
.settings-card    { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 10px; }
.settings-note    { font-size: 12px; color: var(--text3); margin-bottom: 12px; line-height: 1.5; }
.setting-label    { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; margin-bottom: 6px; }
.setting-badge    { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
.setting-badge.required { background: rgba(124,106,255,.2); color: var(--accent); }
.setting-badge.optional { background: rgba(0,212,170,.15); color: var(--accent2); }
.setting-desc     { font-size: 12px; color: var(--text3); margin-bottom: 10px; line-height: 1.5; }
.setting-input    { width: 100%; padding: 11px 14px; background: var(--surface3); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 14px; outline: none; transition: border-color .2s; }
.setting-input:focus { border-color: var(--accent); }
.setting-user     { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.user-avatar-big  { width: 48px; height: 48px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: var(--fh); font-weight: 800; font-size: 22px; color: white; flex-shrink: 0; }
.setting-user-name  { font-size: 15px; font-weight: 600; }
.setting-user-email { font-size: 12px; color: var(--text3); margin-top: 2px; }
.key-status     { font-size: 12px; margin-top: 8px; padding: 6px 10px; border-radius: 8px; }
.key-status.ok  { background: rgba(0,212,170,.1); color: var(--accent2); border: 1px solid rgba(0,212,170,.2); }
.btn-save   { width: 100%; padding: 12px; background: var(--accent); border: none; border-radius: 10px; color: white; font-family: var(--fh); font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; margin-top: 4px; }
.btn-save:hover  { opacity: .85; }
.btn-save.saved  { background: var(--accent2); }
.btn-danger { padding: 9px 18px; background: rgba(255,85,85,.1); border: 1px solid rgba(255,85,85,.3); border-radius: 10px; color: #ff9999; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .2s; }
.btn-danger:hover { background: rgba(255,85,85,.25); border-color: var(--danger); color: white; }

/* ── BOTTOM NAV (mobile only) ── */
.bottom-nav {
  display: none;
  position: fixed; bottom: 0; left: 0; right: 0;
  height: var(--bot-nav); background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 100;
}
.bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; background: none; border: none; cursor: pointer; color: var(--text3); transition: color .2s; padding: 8px 0; }
.bottom-nav-item.active { color: var(--accent); }
.bnav-icon  { font-size: 20px; }
.bnav-label { font-size: 10px; font-weight: 500; }

/* ── RESPONSIVE ── */
@media (max-width: 700px) {
  .sidebar { display: none; }
  .app { padding-bottom: var(--bot-nav); }
  .bottom-nav { display: flex; }
  .messages { padding: 14px; }
  .games-grid { grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); }
  .welcome h2 { font-size: 22px; }
  .auth-box { padding: 32px 24px; }
}

@media (min-width: 701px) {
  .app { padding-bottom: 0; }
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }

/* ── SAFE AREA (iPhone notch) ── */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav { padding-bottom: env(safe-area-inset-bottom); height: calc(var(--bot-nav) + env(safe-area-inset-bottom)); }
  .app { padding-bottom: calc(var(--bot-nav) + env(safe-area-inset-bottom)); }
}
`;

// Inject styles & mount
const styleEl = document.createElement('style');
styleEl.textContent = STYLES;
document.head.appendChild(styleEl);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
