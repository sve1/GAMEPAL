const STATES = {
  backlog: 'Backlog',
  playing: 'Playing',
  paused: 'Paused',
  finished: 'Completed',
  quit: 'Stopped'
};
const nowDate = () => new Date().toLocaleDateString('en-CA');
const dateLabel = v => new Date(v).toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
function Icon({
  name
}) {
  const paths = {
    home: 'M3 10l9-7 9 7v11h-6v-7H9v7H3z',
    library: 'M4 3v18M9 3v18M14 3v18M18 4l4 16',
    journal: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
    explore: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M16 8l-3 5-5 3 3-5z',
    profile: 'M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0M4 21v-2a8 8 0 0 1 16 0v2',
    play: 'M9 5l11 7-11 7z',
    gamepad: 'M7 7h10a4 4 0 0 1 4 4l1 7c0 3-4 3-6-1H8c-2 4-6 4-6 1l1-7a4 4 0 0 1 4-4M6 12h6M9 9v6M16 11h.01M19 14h.01',
    plus: 'M12 5v14M5 12h14',
    chevron: 'M9 5l7 7-7 7',
    search: 'M20 20l-5-5M17 10a7 7 0 1 0-14 0 7 7 0 0 0 14 0',
    spark: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z'
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={paths[name] || paths.spark} /></svg>;
}
function Journey() {
  const [library, setLibrary] = useState(() => load(STORAGE_KEY, {})),
    [settings, setSettings] = useState(() => load(SETTINGS_KEY, {})),
    [user, setUser] = useState(() => load(USER_KEY, {
      name: 'Player'
    }));
  const [view, setView] = useState('home'),
    [selected, setSelected] = useState(null),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('all'),
    [platform, setPlatform] = useState(''),
    [sort, setSort] = useState('recent'),
    [list, setList] = useState(false),
    [results, setResults] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [toast, setToast] = useState(''),
    [undo, setUndo] = useState(null),
    [collection, setCollection] = useState(''),
    [collections, setCollections] = useState(() => load('journey_collections_v1', []));
  const [modal, setModal] = useState(null),
    [tab, setTab] = useState('about');
  const fileRef = useRef(),
    restoreRef = useRef(),
    previousFocus = useRef();
  const entries = Object.values(library).filter(e => e && e.game),
    sessions = entries.flatMap(e => (e.journeys || [{
      id: 'original',
      sessions: e.sessions || []
    }]).flatMap(j => (j.sessions || []).map(s => ({
      ...s,
      game: e.game,
      journey: j.title || 'First playthrough'
    })))).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const playing = entries.filter(e => e.status === 'playing').sort((a, b) => b.updatedAt - a.updatedAt),
    hero = playing[0] || entries.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
  function persist(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setLibrary(next);
      return true;
    } catch (e) {
      setToast('Unable to save. Export a backup and free up device storage.');
      return false;
    }
  }
  function change(id, patch) {
    const old = library;
    const e = old[id];
    if (!e) return;
    if (persist({
      ...old,
      [id]: {
        ...e,
        ...patch,
        updatedAt: Date.now()
      }
    })) {
      setUndo(old);
      setToast('Journey updated.');
    }
  }
  function add(game) {
    if (library[game.id]) {
      setSelected(game);
      return;
    }
    const t = Date.now();
    if (persist({
      ...library,
      [game.id]: {
        game,
        status: 'backlog',
        createdAt: t,
        updatedAt: t
      }
    })) setToast('Added to your library.');
    setSelected(game);
  }
  useEffect(() => {
    window.__hideSplash?.();
    const hash = () => {
      const v = location.hash.slice(1);
      if (['home', 'library', 'journal', 'explore', 'profile'].includes(v)) setView(v);
    };
    hash();
    window.addEventListener('hashchange', hash);
    return () => window.removeEventListener('hashchange', hash);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 7000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!selected && !modal) return;
    previousFocus.current = document.activeElement;
    const key = e => {
      if (e.key === 'Escape') {
        setSelected(null);
        setModal(null);
      }
      if (e.key === 'Tab') {
        const box = Array.from(document.querySelectorAll('[role="dialog"]')).pop();
        const focus = box?.querySelectorAll('button,input,select,textarea,a[href]');
        if (!focus?.length) return;
        const first = focus[0],
          last = focus[focus.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    Array.from(document.querySelectorAll('[role="dialog"]')).pop()?.querySelector('button')?.focus();
    return () => {
      document.removeEventListener('keydown', key);
      previousFocus.current?.focus();
    };
  }, [!!selected, !!modal]);
  function nav(v) {
    setView(v);
    location.hash = v;
    setQuery('');
    setCollection('');
    window.scrollTo(0, 0);
  }
  async function search(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setError('');
    setBusy(true);
    try {
      if (!settings.rawgKey) throw Error('Set your RAWG key in Profile to search the catalog, or add a game manually.');
      setResults(await searchGames({
        query: query.trim(),
        pageSize: 24
      }, settings.rawgKey));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function backup() {
    const data = {
      format: 'journey',
      version: 1,
      exportedAt: new Date().toISOString(),
      library,
      collections,
      user
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journey-backup-' + nowDate() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function restore(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.format !== 'journey' || data.version !== 1 || !data.library || typeof data.library !== 'object' || Array.isArray(data.library) || Object.entries(data.library).some(([id, e]) => !e?.game || String(e.game.id) !== id || typeof e.game.name !== 'string' || !STATES[e.status] || e.journeys && !Array.isArray(e.journeys))) throw Error('Invalid backup file.');
      setModal({
        type: 'restore',
        data
      });
    } catch (e) {
      setToast(e.message);
    }
    restoreRef.current.value = '';
  }
  function card(e) {
    const g = e.game || e;
    return <button className="game" key={g.id} onClick={() => {
      setSelected(g);
      setTab('about');
    }}><div className="cover">{g.cover ? <img src={g.cover} alt="" loading="lazy" onError={e => e.currentTarget.style.display = 'none'} /> : <span>J</span>}{e.status && <span className={'badge ' + e.status}>{STATES[e.status]}</span>}</div><div className="game-info"><h3>{g.name}</h3><p>{e.platform || g.developers || g.released || ''}</p></div></button>;
  }
  function empty(title, desc, action) {
    return <div className="empty"><Icon name="explore" /><h2>{title}</h2><p>{desc}</p>{action || <button className="primary" onClick={() => nav('explore')}><Icon name="gamepad" /> Add game</button>}</div>;
  }
  const entry = selected && library[selected.id],
    journeys = entry?.journeys || [{
      id: 'original',
      title: 'First playthrough',
      sessions: entry?.sessions || []
    }],
    active = journeys.find(j => j.id === entry?.activeJourney) || journeys[0];
  const filtered = entries.filter(e => (filter === 'all' || e.status === filter) && (!platform || e.platform === platform) && (!collection || (e.collections || []).includes(collection)) && e.game.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'name' ? a.game.name.localeCompare(b.game.name) : sort === 'rating' ? (b.rating || 0) - (a.rating || 0) : b.updatedAt - a.updatedAt);
  return <div className="app"><aside><a className="wordmark" href="#home" onClick={() => nav('home')} aria-label="Journey — Home"><img src="icons/icon.svg?v=journey-3" alt="" />journey</a><nav>{[['home', 'Home'], ['library', 'Library'], ['journal', 'Journal'], ['explore', 'Explore'], ['profile', 'Profile']].map(([v, label]) => <button key={v} aria-current={view === v ? 'page' : undefined} className={view === v ? 'active' : ''} onClick={() => nav(v)}><Icon name={v} /><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><button onClick={() => nav('profile')} className="avatar-row"><b>{(user?.name || 'V')[0]}</b><span>{user?.name || 'Player'}</span></button></div></aside><main><header className="mobile-brand"><a href="#home" onClick={() => nav('home')}><img src="icons/icon.svg?v=journey-3" alt="" />journey</a></header>
 {view === 'home' && <><div className="page-title home-title"><h1>Your games</h1><button aria-label="Add game" className="icon-button" onClick={() => nav('explore')}><Icon name="plus" /></button></div>{hero ? <section className="hero">{hero.game.cover && <img src={hero.game.cover} alt="" />}<div className="hero-content"><small>{STATES[hero.status]}</small><h2>{hero.game.name}</h2><button className="primary game-action" onClick={() => {
              setSelected(hero.game);
              setTab('about');
            }}><Icon name="play" />{hero.status === 'playing' ? 'Continue journey' : 'View game'}</button></div></section> : empty('Your library starts here', '', <button className="primary game-action" onClick={() => nav('explore')}><Icon name="gamepad" />Add game</button>)}{playing.length > 0 && <><div className="section-heading"><h2>Playing</h2><button aria-label="Ver biblioteca" onClick={() => nav('library')}><Icon name="library" /></button></div><div className="grid">{playing.map(card)}</div></>}{entries.some(e => e.status === 'backlog') && <><div className="section-heading"><h2>Backlog</h2></div><div className="grid">{entries.filter(e => e.status === 'backlog').map(card)}</div></>}{entries.some(e => e.status === 'finished') && <><div className="section-heading"><h2>Completed</h2></div><div className="grid">{entries.filter(e => e.status === 'finished').slice(0, 6).map(card)}</div></>}</>}
 {view === 'library' && <><div className="page-title"><div><h1>Library</h1><p>{entries.length} {entries.length === 1 ? 'game' : 'games'}</p></div><button className="primary" onClick={() => setModal({
            type: 'manual'
          })}><Icon name="plus" />Add game</button></div><div className="tabs">{[['all', 'All'], ...Object.entries(STATES)].map(([v, l]) => <button className={filter === v ? 'active' : ''} key={v} onClick={() => setFilter(v)}>{l} <small>{v === 'all' ? entries.length : entries.filter(e => e.status === v).length}</small></button>)}</div><div className="toolbar"><input aria-label="Search library" placeholder="Search your games…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Platform" value={platform} onChange={e => setPlatform(e.target.value)}><option value="">All platforms</option>{[...new Set(entries.map(e => e.platform).filter(Boolean))].map(p => <option key={p}>{p}</option>)}</select><select aria-label="Sort by" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Recently updated</option><option value="name">Name A–Z</option><option value="rating">My rating</option></select><button aria-pressed={list} onClick={() => setList(!list)}>{list ? 'Grid' : 'List'}</button></div><div className="collections"><button className={!collection ? 'active' : ''} onClick={() => setCollection('')}>All collections</button>{collections.map(c => <button key={c} className={collection === c ? 'active' : ''} onClick={() => setCollection(c)}>{c}</button>)}<button onClick={() => setModal({
            type: 'collection'
          })}>+ Collection</button></div>{filtered.length ? <div className={'grid ' + (list ? 'list' : '')}>{filtered.map(card)}</div> : empty('A space for your games', 'Add a game or adjust your filters.')}</>}
 {view === 'journal' && <><div className="page-title"><div><h1>Journal<span>.</span></h1></div></div>{sessions.length ? <div className="timeline">{sessions.map((s, i) => <article className="memory" key={s.id + '-' + i}><small>{dateLabel(s.date + 'T12:00:00')} · {s.minutes ? s.minutes + ' min' : 'No duration'} · {s.journey}</small><button onClick={() => setSelected(s.game)}><h2>{s.game.name}</h2></button>{s.text && <p>{s.text}</p>}{s.image && <img src={s.image} alt={'Memory of ' + s.game.name} />}</article>)}</div> : empty('Your story starts here', 'Open a game to log your first session.')}</>}
 {view === 'explore' && <><div className="page-title"><div><h1>Explore<span>.</span></h1></div><button onClick={() => setModal({
            type: 'manual'
          })}>Add manually</button></div><form className="searchbar" onSubmit={search}><Icon name="explore" /><input aria-label="Game title" placeholder="Search for a game…" value={query} onChange={e => setQuery(e.target.value)} /><button className="primary" disabled={busy}>{busy ? 'Searching…' : 'Search'}</button></form>{error && <p className="notice" role="alert">{error}</p>}{results.length ? <div className="grid">{results.map(card)}</div> : !busy && empty('Find your next game', 'Search by title or add a game manually.', <button onClick={() => setModal({
          type: 'manual'
        })}><Icon name="plus" />Add game</button>)}<p className="attribution">Catalog and images: RAWG. Your entries stay on this device.</p></>}
 {view === 'profile' && <><div className="page-title"><div><h1>{user?.name || 'Player'}<span>.</span></h1></div></div><div className="stats">{[[entries.length, 'in library'], [entries.filter(e => e.status === 'finished').length, 'completed'], [sessions.length, 'memories'], [(sessions.reduce((n, s) => n + (+s.minutes || 0), 0) / 60).toFixed(1) + 'h', 'logged']].map(([n, l]) => <div className="panel" key={l}><strong>{n}</strong><p>{l}</p></div>)}</div><div className="two-col"><form className="panel form" onSubmit={e => {
            e.preventDefault();
            const f = new FormDate(e.currentTarget);
            const u = {
                ...user,
                name: f.get('name').trim() || 'Player'
              },
              s = {
                ...settings,
                rawgKey: f.get('rawg').trim()
              };
            delete s.groqKey;
            delete s.spoilers;
            try {
              localStorage.setItem(USER_KEY, JSON.stringify(u));
              localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
              setUser(u);
              setSettings(s);
              setToast('Settings saved.');
            } catch (e) {
              setToast('Unable to save settings.');
            }
          }}><h2>Settings</h2><label>Display name<input name="name" defaultValue={user?.name} maxLength="80" /></label><label>RAWG API key<input name="rawg" type="password" autoComplete="off" defaultValue={settings.rawgKey} /></label><p>Your RAWG key stays in this browser and is used only for catalog requests.</p><button className="primary">Save settings</button></form><div className="panel"><h2>Your memories, backed up.</h2><p>Export a backup before switching devices or clearing browser data. Includes games, playthroughs, images and collections. API keys are excluded.</p><button className="primary" onClick={backup}>Export backup</button><button onClick={() => restoreRef.current.click()}>Import backup</button><input ref={restoreRef} type="file" accept="application/json" hidden onChange={e => restore(e.target.files[0])} /><hr /><h2>Your year in games</h2><p>{entries.filter(e => e.status === 'finished' && new Date(e.updatedAt).getFullYear() === new Date().getFullYear()).length} games marked or updated as completed this year.</p><p>Library genres: {[...new Set(entries.flatMap(e => (e.game.genres || '').split(', ').filter(Boolean)))].slice(0, 6).join(' · ') || 'Add games to discover your favorite genres.'}</p><small>Journey · your stories in games</small></div></div></>}
 </main>
 {selected && !modal && <div className="backdrop" onClick={e => e.target === e.currentTarget && setSelected(null)}><section className="dialog detail" role="dialog" aria-modal="true" aria-label={selected.name}><button className="close" aria-label="Close game" onClick={() => setSelected(null)}>×</button><div className="detail-hero">{selected.cover && <img src={selected.cover} alt="" />}<div><small>{entry ? STATES[entry.status] : 'UM NOVO MUNDO'}</small><h1>{selected.name}</h1><p>{selected.genres} · {selected.released}</p></div></div><div className="detail-body"><div className="tabs">{[['about', 'Overview'], ...(entry ? [['journey', 'My journey'], ['memories', 'Memories']] : [])].map(([v, l]) => <button key={v} className={tab === v ? 'active' : ''} onClick={() => setTab(v)}>{l}</button>)}</div>{!entry && <button className="primary game-action add-library" onClick={() => add(selected)}><Icon name="plus" />Add to library</button>}{<>{tab === 'journey' && <><div className="toolbar"><select aria-label="Play status" value={entry.status} onChange={e => change(selected.id, {
                  status: e.target.value
                })}>{Object.entries(STATES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><button className="primary" onClick={() => setModal({
                  type: 'session',
                  id: selected.id,
                  journey: active.id
                })}><Icon name="play" />Log session</button></div><form key={selected.id + '-' + entry.updatedAt} className="form" onSubmit={e => {
                e.preventDefault();
                const f = new FormDate(e.currentTarget);
                change(selected.id, {
                  platform: f.get('platform'),
                  access: f.get('access'),
                  completion: f.get('completion'),
                  where: f.get('where'),
                  note: f.get('note'),
                  rating: f.get('rating') ? +f.get('rating') : null,
                  startDate: f.get('start'),
                  endDate: f.get('end'),
                  collections: f.getAll('collections')
                });
              }}><label>Your platform<input name="platform" list="platforms" defaultValue={entry.platform || ''} placeholder="Choose or enter a platform" /><datalist id="platforms">{PLATFORMS_LIST.map(p => <option key={p}>{p}</option>)}</datalist></label><div className="two-col"><label>Access<select name="access" defaultValue={entry.access || 'Owned'}>{['Owned', 'Subscription', 'Borrowed', 'Want to buy'].map(x => <option key={x}>{x}</option>)}</select></label><label>Completion<select name="completion" defaultValue={entry.completion || ''}><option value="">In progress</option>{['Story completed', '100%', 'Platinum', 'Ongoing game'].map(x => <option key={x}>{x}</option>)}</select></label></div><label>Where I left off<textarea name="where" defaultValue={entry.where || ''} placeholder="Leave a note for next time…" maxLength="4000" /></label><div className="two-col"><label>Started on<input type="date" name="start" defaultValue={entry.startDate || ''} /></label><label>Finished on<input type="date" name="end" defaultValue={entry.endDate || ''} /></label></div><label>My rating · 0 a 10<input name="rating" type="number" min="0" max="10" step="0.5" defaultValue={entry.rating ?? ''} /></label><label>My thoughts<textarea name="note" defaultValue={entry.note || ''} placeholder="Your thoughts, favorite moment, or reason to return…" maxLength="8000" /></label>{collections.length > 0 && <fieldset><legend>Collections</legend>{collections.map(c => <label className="check" key={c}><input name="collections" type="checkbox" value={c} defaultChecked={(entry.collections || []).includes(c)} />{c}</label>)}</fieldset>}<button className="primary">Save journey</button></form><hr /><div className="toolbar"><select aria-label="Select playthrough" value={active.id} onChange={e => change(selected.id, {
                  activeJourney: e.target.value
                })}>{journeys.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}</select><button onClick={() => setModal({
                  type: 'replay',
                  id: selected.id
                })}>+ New playthrough</button></div></>}{tab === 'about' && <GameOverview key={selected.id} game={selected} rawgKey={settings.rawgKey} />}{tab === 'memories' && (sessions.filter(s => s.game.id === selected.id).length ? sessions.filter(s => s.game.id === selected.id).map((s, i) => <article className="memory" key={i}><small>{dateLabel(s.date + 'T12:00:00')} · {s.journey} · {s.minutes || 0} min</small><p>{s.text}</p>{s.image && <img src={s.image} alt="Game memory" />}<button onClick={() => setModal({
                type: 'session',
                id: selected.id,
                journey: journeys.find(j => (j.sessions || []).some(x => x.id === s.id))?.id || 'original',
                session: s
              })}>Edit entry</button></article>) : <p className="empty">Log your first session to save a memory.</p>)}</>}</div></section></div>}
 {modal && <div className="backdrop top"><section className="dialog compact" role="dialog" aria-modal="true" aria-label="Save to Journey"><button className="close" aria-label="Close form" onClick={() => setModal(null)}>×</button>{modal.type === 'restore' ? <><h2>Import your journeys?</h2><p>Games will be merged into your library. For matching IDs, the backup takes priority. Export your current data first.</p><button onClick={backup}>Export current data</button><button className="primary" onClick={() => {
            if (persist({
              ...library,
              ...modal.data.library
            })) {
              const c = [...new Set([...collections, ...(modal.data.collections || []).filter(x => typeof x === 'string')])];
              setCollections(c);
              save('journey_collections_v1', c);
              setModal(null);
              setToast('Backup imported.');
            }
          }}>Import and merge</button></> : <form className="form" onSubmit={async e => {
          e.preventDefault();
          const f = new FormDate(e.currentTarget);
          if (modal.type === 'manual') {
            const name = f.get('name').trim();
            if (!name) return;
            add({
              id: 'manual-' + Date.now(),
              name,
              cover: '',
              genres: f.get('genre'),
              released: '',
              platforms: ''
            });
            setModal(null);
          }
          if (modal.type === 'collection') {
            const name = f.get('name').trim();
            if (!name) return;
            const next = [...new Set([...collections, name])];
            try {
              localStorage.setItem('journey_collections_v1', JSON.stringify(next));
              setCollections(next);
              setModal(null);
            } catch (e) {
              setToast('Unable to save.');
            }
          }
          if (modal.type === 'replay') {
            const en = library[modal.id],
              js = en.journeys || [{
                id: 'original',
                title: 'First playthrough',
                sessions: en.sessions || []
              }],
              j = {
                id: String(Date.now()),
                title: f.get('name').trim() || 'Replay',
                sessions: []
              };
            change(modal.id, {
              journeys: [...js, j],
              activeJourney: j.id
            });
            setModal(null);
          }
          if (modal.type === 'session') {
            let image = modal.session?.image || '';
            const file = fileRef.current?.files[0];
            if (file) {
              if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1500000) {
                setToast('Choose a JPG, PNG or WebP image up to 1.5 MB.');
                return;
              }
              image = await new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result);
                r.onerror = reject;
                r.readAsDateURL(file);
              });
            }
            const en = library[modal.id],
              js = en.journeys || [{
                id: 'original',
                title: 'First playthrough',
                sessions: en.sessions || []
              }];
            const session = {
              id: modal.session?.id || Date.now(),
              date: f.get('date'),
              minutes: +f.get('minutes') || 0,
              text: f.get('text').trim(),
              image
            };
            if (persist({
              ...library,
              [modal.id]: {
                ...en,
                updatedAt: Date.now(),
                journeys: js.map(j => j.id === modal.journey ? {
                  ...j,
                  sessions: [...(j.sessions || []).filter(s => s.id !== session.id), session]
                } : j)
              }
            })) {
              setModal(null);
              setToast('Memory saved.');
            }
          }
        }}><h2>{{
              manual: 'Add a game',
              collection: 'New collection',
              replay: 'New playthrough',
              session: 'Log a session'
            }[modal.type]}</h2>{modal.type === 'session' ? <><label>Date<input name="date" type="date" defaultValue={modal.session?.date || nowDate()} required /></label><label>Time played · minutes<input name="minutes" type="number" min="0" max="1440" defaultValue={modal.session?.minutes || ''} /></label><label>What happened?<textarea name="text" maxLength="8000" defaultValue={modal.session?.text || ''} placeholder="A discovery, a challenge, or how you felt…" /></label><label>Screenshot · optional<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" /></label><p>Up to 1.5 MB per image. Export backups to preserve your memories.</p></> : <><label>Name<input name="name" required maxLength="160" autoFocus placeholder={modal.type === 'collection' ? 'Favoritos da vida' : modal.type === 'replay' ? 'Segunda campanha · PC' : 'Game title'} /></label>{modal.type === 'manual' && <label>Genre · optional<input name="genre" maxLength="100" placeholder="RPG, aventura…" /></label>}</>}<button className="primary">{modal.type === 'session' ? 'Save memory' : 'Save'}</button></form>}</section></div>}
 {toast && <div className="toast" role="status">{toast}{undo && <button onClick={() => {
        if (persist(undo)) {
          setUndo(null);
          setToast('Change undone.');
        }
      }}>Undo</button>}<button aria-label="Dismiss message" onClick={() => setToast('')}>×</button></div>}
 </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<Journey />);
