const STATES = {
  backlog: 'Quero jogar',
  playing: 'Jogando',
  paused: 'Em pausa',
  finished: 'Concluído',
  quit: 'Deixei de jogar'
};
const nowDate = () => new Date().toLocaleDateString('en-CA');
const dateLabel = v => new Date(v).toLocaleDateString('pt-BR', {
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
      name: 'Viajante'
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
      journey: j.title || 'Primeira jornada'
    })))).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const playing = entries.filter(e => e.status === 'playing').sort((a, b) => b.updatedAt - a.updatedAt),
    hero = playing[0] || entries.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
  function persist(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setLibrary(next);
      return true;
    } catch (e) {
      setToast('Não foi possível salvar. Exporte um backup e libere espaço no dispositivo.');
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
      setToast('Jornada atualizada.');
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
    })) setToast('Adicionado à sua biblioteca.');
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
      if (!settings.rawgKey) throw Error('Adicione sua chave RAWG no Perfil para pesquisar o catálogo. Você também pode cadastrar um jogo manualmente.');
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
      if (data.format !== 'journey' || data.version !== 1 || !data.library || typeof data.library !== 'object' || Array.isArray(data.library) || Object.entries(data.library).some(([id, e]) => !e?.game || String(e.game.id) !== id || typeof e.game.name !== 'string' || !STATES[e.status] || e.journeys && !Array.isArray(e.journeys))) throw Error('Arquivo de backup inválido.');
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
    return <div className="empty"><Icon name="explore" /><h2>{title}</h2><p>{desc}</p>{action || <button className="primary" onClick={() => nav('explore')}><Icon name="gamepad" /> Adicionar jogo</button>}</div>;
  }
  const entry = selected && library[selected.id],
    journeys = entry?.journeys || [{
      id: 'original',
      title: 'Primeira jornada',
      sessions: entry?.sessions || []
    }],
    active = journeys.find(j => j.id === entry?.activeJourney) || journeys[0];
  const filtered = entries.filter(e => (filter === 'all' || e.status === filter) && (!platform || e.platform === platform) && (!collection || (e.collections || []).includes(collection)) && e.game.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'name' ? a.game.name.localeCompare(b.game.name) : sort === 'rating' ? (b.rating || 0) - (a.rating || 0) : b.updatedAt - a.updatedAt);
  return <div className="app"><aside><a className="wordmark" href="#home" onClick={() => nav('home')} aria-label="Journey — Início"><img src="icons/icon.svg?v=journey-2" alt="" />journey</a><nav>{[['home', 'Início'], ['library', 'Biblioteca'], ['journal', 'Diário'], ['explore', 'Explorar'], ['profile', 'Perfil']].map(([v, label]) => <button key={v} aria-current={view === v ? 'page' : undefined} className={view === v ? 'active' : ''} onClick={() => nav(v)}><Icon name={v} /><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><button onClick={() => nav('profile')} className="avatar-row"><b>{(user?.name || 'V')[0]}</b><span>{user?.name || 'Viajante'}</span></button></div></aside><main><header className="mobile-brand"><a href="#home" onClick={() => nav('home')}><img src="icons/icon.svg?v=journey-2" alt="" />journey</a></header>
 {view === 'home' && <><div className="page-title home-title"><h1>Seus jogos</h1><button aria-label="Adicionar jogo" className="icon-button" onClick={() => nav('explore')}><Icon name="plus" /></button></div>{hero ? <section className="hero">{hero.game.cover && <img src={hero.game.cover} alt="" />}<div className="hero-content"><small>{STATES[hero.status]}</small><h2>{hero.game.name}</h2><button className="primary game-action" onClick={() => {
              setSelected(hero.game);
              setTab('about');
            }}><Icon name="play" />{hero.status === 'playing' ? 'Continuar jornada' : 'Ver jogo'}</button></div></section> : empty('Sua biblioteca começa aqui', '', <button className="primary game-action" onClick={() => nav('explore')}><Icon name="gamepad" />Adicionar jogo</button>)}{playing.length > 0 && <><div className="section-heading"><h2>Jogando</h2><button aria-label="Ver biblioteca" onClick={() => nav('library')}><Icon name="library" /></button></div><div className="grid">{playing.map(card)}</div></>}{entries.some(e => e.status === 'backlog') && <><div className="section-heading"><h2>Quero jogar</h2></div><div className="grid">{entries.filter(e => e.status === 'backlog').map(card)}</div></>}{entries.some(e => e.status === 'finished') && <><div className="section-heading"><h2>Concluídos</h2></div><div className="grid">{entries.filter(e => e.status === 'finished').slice(0, 6).map(card)}</div></>}</>}
 {view === 'library' && <><div className="page-title"><div><h1>Biblioteca</h1><p>{entries.length} {entries.length === 1 ? 'jogo' : 'jogos'}</p></div><button className="primary" onClick={() => setModal({
            type: 'manual'
          })}><Icon name="plus" />Adicionar jogo</button></div><div className="tabs">{[['all', 'Todos'], ...Object.entries(STATES)].map(([v, l]) => <button className={filter === v ? 'active' : ''} key={v} onClick={() => setFilter(v)}>{l} <small>{v === 'all' ? entries.length : entries.filter(e => e.status === v).length}</small></button>)}</div><div className="toolbar"><input aria-label="Buscar na biblioteca" placeholder="Buscar nos seus jogos…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Plataforma" value={platform} onChange={e => setPlatform(e.target.value)}><option value="">Todas as plataformas</option>{[...new Set(entries.map(e => e.platform).filter(Boolean))].map(p => <option key={p}>{p}</option>)}</select><select aria-label="Ordenação" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Recentes</option><option value="name">Nome A–Z</option><option value="rating">Minha nota</option></select><button aria-pressed={list} onClick={() => setList(!list)}>{list ? 'Grade' : 'Lista'}</button></div><div className="collections"><button className={!collection ? 'active' : ''} onClick={() => setCollection('')}>Todas as coleções</button>{collections.map(c => <button key={c} className={collection === c ? 'active' : ''} onClick={() => setCollection(c)}>{c}</button>)}<button onClick={() => setModal({
            type: 'collection'
          })}>+ Coleção</button></div>{filtered.length ? <div className={'grid ' + (list ? 'list' : '')}>{filtered.map(card)}</div> : empty('Um espaço para suas histórias', 'Adicione seu primeiro jogo ou ajuste os filtros.')}</>}
 {view === 'journal' && <><div className="page-title"><div><h1>Diário<span>.</span></h1></div></div>{sessions.length ? <div className="timeline">{sessions.map((s, i) => <article className="memory" key={s.id + '-' + i}><small>{dateLabel(s.date + 'T12:00:00')} · {s.minutes ? s.minutes + ' min' : 'Sem duração'} · {s.journey}</small><button onClick={() => setSelected(s.game)}><h2>{s.game.name}</h2></button>{s.text && <p>{s.text}</p>}{s.image && <img src={s.image} alt={'Memória de ' + s.game.name} />}</article>)}</div> : empty('Sua história merece ser lembrada', 'Abra um jogo da biblioteca e registre sua primeira sessão.')}</>}
 {view === 'explore' && <><div className="page-title"><div><h1>Explorar<span>.</span></h1></div><button onClick={() => setModal({
            type: 'manual'
          })}>Cadastrar manualmente</button></div><form className="searchbar" onSubmit={search}><Icon name="explore" /><input aria-label="Nome do jogo" placeholder="Busque um jogo, uma nova história…" value={query} onChange={e => setQuery(e.target.value)} /><button className="primary" disabled={busy}>{busy ? 'Buscando…' : 'Buscar'}</button></form>{error && <p className="notice" role="alert">{error}</p>}{results.length ? <div className="grid">{results.map(card)}</div> : !busy && empty('Há um mundo para cada momento', 'Pesquise pelo nome de um jogo ou registre um título manualmente.', <button onClick={() => setModal({
          type: 'manual'
        })}><Icon name="plus" />Cadastrar jogo</button>)}<p className="attribution">Catálogo e imagens: RAWG. Registros pessoais ficam neste dispositivo.</p></>}
 {view === 'profile' && <><div className="page-title"><div><h1>{user?.name || 'Viajante'}<span>.</span></h1></div></div><div className="stats">{[[entries.length, 'na biblioteca'], [entries.filter(e => e.status === 'finished').length, 'concluídos'], [sessions.length, 'memórias'], [(sessions.reduce((n, s) => n + (+s.minutes || 0), 0) / 60).toFixed(1) + 'h', 'registradas']].map(([n, l]) => <div className="panel" key={l}><strong>{n}</strong><p>{l}</p></div>)}</div><div className="two-col"><form className="panel form" onSubmit={e => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const u = {
                ...user,
                name: f.get('name').trim() || 'Viajante'
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
              setToast('Preferências salvas.');
            } catch (e) {
              setToast('Não foi possível salvar as preferências.');
            }
          }}><h2>Seu espaço</h2><label>Como podemos chamar você?<input name="name" defaultValue={user?.name} maxLength="80" /></label><label>Chave RAWG · catálogo<input name="rawg" type="password" autoComplete="off" defaultValue={settings.rawgKey} /></label><p>A chave RAWG fica neste navegador e é usada apenas para consultar o catálogo.</p><button className="primary">Salvar preferências</button></form><div className="panel"><h2>Suas memórias, com você.</h2><p>Exporte um backup antes de trocar de aparelho ou limpar os dados do navegador. O arquivo inclui biblioteca, jornadas, imagens e coleções; não inclui chaves de API.</p><button className="primary" onClick={backup}>Exportar backup</button><button onClick={() => restoreRef.current.click()}>Importar backup</button><input ref={restoreRef} type="file" accept="application/json" hidden onChange={e => restore(e.target.files[0])} /><hr /><h2>Seu ano em jogos</h2><p>{entries.filter(e => e.status === 'finished' && new Date(e.updatedAt).getFullYear() === new Date().getFullYear()).length} jogos concluídos ou atualizados como concluídos neste ano.</p><p>Gêneros na sua biblioteca: {[...new Set(entries.flatMap(e => (e.game.genres || '').split(', ').filter(Boolean)))].slice(0, 6).join(' · ') || 'Suas preferências começam a aparecer conforme você adiciona jogos.'}</p><small>Journey · suas histórias nos jogos</small></div></div></>}
 </main>
 {selected && <div className="backdrop" onClick={e => e.target === e.currentTarget && setSelected(null)}><section className="dialog detail" role="dialog" aria-modal="true" aria-label={selected.name}><button className="close" aria-label="Fechar jogo" onClick={() => setSelected(null)}>×</button><div className="detail-hero">{selected.cover && <img src={selected.cover} alt="" />}<div><small>{entry ? STATES[entry.status] : 'UM NOVO MUNDO'}</small><h1>{selected.name}</h1><p>{selected.genres} · {selected.released}</p></div></div><div className="detail-body"><div className="tabs">{[['about', 'Visão geral'], ...(entry ? [['journey', 'Minha jornada'], ['memories', 'Memórias']] : [])].map(([v, l]) => <button key={v} className={tab === v ? 'active' : ''} onClick={() => setTab(v)}>{l}</button>)}</div>{!entry && <button className="primary game-action add-library" onClick={() => add(selected)}><Icon name="plus" />Adicionar à biblioteca</button>}{<>{tab === 'journey' && <><div className="toolbar"><select aria-label="Status da jornada" value={entry.status} onChange={e => change(selected.id, {
                  status: e.target.value
                })}>{Object.entries(STATES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><button className="primary" onClick={() => setModal({
                  type: 'session',
                  id: selected.id,
                  journey: active.id
                })}><Icon name="play" />Registrar sessão</button></div><form key={selected.id + '-' + entry.updatedAt} className="form" onSubmit={e => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
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
              }}><label>Onde você está jogando?<input name="platform" list="platforms" defaultValue={entry.platform || ''} placeholder="Escolha ou digite sua plataforma" /><datalist id="platforms">{PLATFORMS_LIST.map(p => <option key={p}>{p}</option>)}</datalist></label><div className="two-col"><label>Acesso<select name="access" defaultValue={entry.access || 'Tenho'}>{['Tenho', 'Assinatura', 'Emprestado', 'Desejo comprar'].map(x => <option key={x}>{x}</option>)}</select></label><label>Conclusão<select name="completion" defaultValue={entry.completion || ''}><option value="">Ainda em jornada</option>{['História concluída', '100%', 'Platinado', 'Jogo contínuo'].map(x => <option key={x}>{x}</option>)}</select></label></div><label>Onde parei<textarea name="where" defaultValue={entry.where || ''} placeholder="Deixe uma pista para quando voltar…" maxLength="4000" /></label><div className="two-col"><label>Comecei em<input type="date" name="start" defaultValue={entry.startDate || ''} /></label><label>Terminei em<input type="date" name="end" defaultValue={entry.endDate || ''} /></label></div><label>Minha nota · 0 a 10<input name="rating" type="number" min="0" max="10" step="0.5" defaultValue={entry.rating ?? ''} /></label><label>O que ficou comigo<textarea name="note" defaultValue={entry.note || ''} placeholder="Sua impressão, momento favorito ou vontade de voltar…" maxLength="8000" /></label>{collections.length > 0 && <fieldset><legend>Coleções</legend>{collections.map(c => <label className="check" key={c}><input name="collections" type="checkbox" value={c} defaultChecked={(entry.collections || []).includes(c)} />{c}</label>)}</fieldset>}<button className="primary">Salvar minha jornada</button></form><hr /><div className="toolbar"><select aria-label="Selecionar campanha" value={active.id} onChange={e => change(selected.id, {
                  activeJourney: e.target.value
                })}>{journeys.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}</select><button onClick={() => setModal({
                  type: 'replay',
                  id: selected.id
                })}>+ Nova campanha / replay</button></div></>}{tab === 'about' && <GameOverview key={selected.id} game={selected} rawgKey={settings.rawgKey} />}{tab === 'memories' && (sessions.filter(s => s.game.id === selected.id).length ? sessions.filter(s => s.game.id === selected.id).map((s, i) => <article className="memory" key={i}><small>{dateLabel(s.date + 'T12:00:00')} · {s.journey} · {s.minutes || 0} min</small><p>{s.text}</p>{s.image && <img src={s.image} alt="Memória do jogo" />}<button onClick={() => setModal({
                type: 'session',
                id: selected.id,
                journey: journeys.find(j => (j.sessions || []).some(x => x.id === s.id))?.id || 'original',
                session: s
              })}>Editar registro</button></article>) : <p className="empty">Registre sua primeira sessão para guardar uma memória.</p>)}</>}</div></section></div>}
 {modal && <div className="backdrop top"><section className="dialog compact" role="dialog" aria-modal="true" aria-label="Registrar no Journey"><button className="close" aria-label="Fechar registro" onClick={() => setModal(null)}>×</button>{modal.type === 'restore' ? <><h2>Importar suas jornadas?</h2><p>Os jogos do arquivo serão mesclados com a biblioteca. Em jogos com o mesmo identificador, prevalece o backup. Exporte seus dados atuais antes de continuar.</p><button onClick={backup}>Exportar dados atuais</button><button className="primary" onClick={() => {
            if (persist({
              ...library,
              ...modal.data.library
            })) {
              const c = [...new Set([...collections, ...(modal.data.collections || []).filter(x => typeof x === 'string')])];
              setCollections(c);
              save('journey_collections_v1', c);
              setModal(null);
              setToast('Backup importado.');
            }
          }}>Importar e mesclar</button></> : <form className="form" onSubmit={async e => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
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
              setToast('Não foi possível salvar.');
            }
          }
          if (modal.type === 'replay') {
            const en = library[modal.id],
              js = en.journeys || [{
                id: 'original',
                title: 'Primeira jornada',
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
                setToast('Escolha uma imagem JPG, PNG ou WebP de até 1,5 MB.');
                return;
              }
              image = await new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result);
                r.onerror = reject;
                r.readAsDataURL(file);
              });
            }
            const en = library[modal.id],
              js = en.journeys || [{
                id: 'original',
                title: 'Primeira jornada',
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
              setToast('Memória guardada.');
            }
          }
        }}><h2>{{
              manual: 'Adicionar um mundo',
              collection: 'Nova coleção',
              replay: 'Uma nova jornada',
              session: 'Guardar uma memória'
            }[modal.type]}</h2>{modal.type === 'session' ? <><label>Data<input name="date" type="date" defaultValue={modal.session?.date || nowDate()} required /></label><label>Tempo jogado · minutos<input name="minutes" type="number" min="0" max="1440" defaultValue={modal.session?.minutes || ''} /></label><label>O que aconteceu?<textarea name="text" maxLength="8000" defaultValue={modal.session?.text || ''} placeholder="Uma descoberta, um desafio ou como você se sentiu…" /></label><label>Screenshot · opcional<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" /></label><p>Até 1,5 MB por imagem. Exporte backups para preservar suas memórias.</p></> : <><label>Nome<input name="name" required maxLength="160" autoFocus placeholder={modal.type === 'collection' ? 'Favoritos da vida' : modal.type === 'replay' ? 'Segunda campanha · PC' : 'Nome do jogo'} /></label>{modal.type === 'manual' && <label>Gênero · opcional<input name="genre" maxLength="100" placeholder="RPG, aventura…" /></label>}</>}<button className="primary">{modal.type === 'session' ? 'Guardar memória' : 'Salvar'}</button></form>}</section></div>}
 {toast && <div className="toast" role="status">{toast}{undo && <button onClick={() => {
        if (persist(undo)) {
          setUndo(null);
          setToast('Alteração desfeita.');
        }
      }}>Desfazer</button>}<button aria-label="Dispensar mensagem" onClick={() => setToast('')}>×</button></div>}
 </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<Journey />);
