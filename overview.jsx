const overviewCache = new Map();
function GameOverview({
  game,
  rawgKey
}) {
  const [info, setInfo] = useState(game),
    [loading, setLoading] = useState(false),
    [problem, setProblem] = useState(''),
    [mediaErrors, setMediaErrors] = useState([]),
    [attempt, setAttempt] = useState(0),
    [shot, setShot] = useState(null),
    [clip, setClip] = useState(0);
  const manual = String(game.id).startsWith('manual-');
  useEffect(() => {
    if (manual || !rawgKey) return;
    const controller = new AbortController();
    let mounted = true;
    const cacheKey = String(game.id);
    const cached = overviewCache.get(cacheKey);
    if (cached && attempt === 0) {
      setInfo(cached.info);
      setMediaErrors(cached.errors);
      return () => controller.abort();
    }
    setLoading(true);
    setProblem('');
    setMediaErrors([]);
    const timer = setTimeout(() => controller.abort(), 20000);
    fetchGameOverview(game.id, rawgKey, controller.signal).then(result => {
      if (!mounted) return;
      const merged = {
        ...game,
        ...result.info
      };
      setInfo(merged);
      setMediaErrors(result.errors);
      if (!result.errors.length) overviewCache.set(cacheKey, {
        info: merged,
        errors: []
      });
    }).catch(e => {
      if (mounted) setProblem(e.name === 'AbortError' ? 'A consulta demorou demais. Tente novamente.' : e.message);
    }).finally(() => {
      clearTimeout(timer);
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [game.id, rawgKey, attempt]);
  const platforms = info.platformDetails || String(info.platforms || '').split(', ').filter(Boolean).map(name => ({
    name
  }));
  const screenshots = (info.screenshots || []).filter(s => safeMediaUrl(s.image));
  const trailers = (info.trailers || []).filter(t => safeMediaUrl(t.data?.max || t.data?.['480']));
  const facts = [['Lançamento', info.releaseDate ? dateLabel(info.releaseDate + 'T12:00:00') : info.released], ['Desenvolvimento', info.developers], ['Publicação', info.publishers], ['Gêneros', info.genres], ['Classificação', info.esrb], ['Metacritic', info.metacritic ? String(info.metacritic) + '/100' : null], ['Nota RAWG', info.rating && info.rating !== 'N/A' ? info.rating + '/5' : null]].filter(([, v]) => v);
  return <div className="overview">
 {loading && <div className="detail-loading" role="status">Carregando informações do jogo…</div>}
 {problem && <div className="notice" role="alert">{problem}<button onClick={() => setAttempt(a => a + 1)}>Tentar novamente</button></div>}
 {!manual && !rawgKey && <p className="media-notice">Configure a chave RAWG no Perfil para carregar sinopse e mídia.</p>}
 <section className="synopsis"><h2>Sinopse</h2><p>{info.description || (loading ? 'Buscando sinopse…' : 'Sinopse não disponível para este jogo.')}</p></section>
 {platforms.length > 0 && <section><h2>Plataformas</h2><div className="platform-chips">{platforms.map(p => <span key={p.name}><Icon name="gamepad" />{p.name}{p.released_at && <small>{p.released_at.slice(0, 4)}</small>}</span>)}</div></section>}
 {facts.length > 0 && <dl className="game-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
 {trailers.length > 0 && <section className="trailer-section"><div className="section-heading"><h2>Trailers</h2><Icon name="play" /></div><video key={trailers[clip]?.id || clip} controls playsInline preload="none" poster={safeMediaUrl(trailers[clip]?.preview)} src={safeMediaUrl(trailers[clip]?.data?.max || trailers[clip]?.data?.['480'])} onError={() => setMediaErrors(a => [...new Set([...a, 'Não foi possível reproduzir este trailer.'])])}>Seu navegador não suporta este vídeo.</video>{trailers.length > 1 && <div className="trailer-picker">{trailers.map((t, i) => <button key={t.id || i} className={i === clip ? 'active' : ''} onClick={() => setClip(i)}><Icon name="play" />{t.name || 'Trailer ' + (i + 1)}</button>)}</div>}</section>}
 {screenshots.length > 0 && <section><h2>Galeria</h2><div className="screenshot-grid">{screenshots.map((s, i) => <button key={s.id || i} aria-label={'Ampliar screenshot ' + (i + 1)} onClick={() => setShot(shot === i ? null : i)} aria-expanded={shot === i}><img src={safeMediaUrl(s.image)} alt={'Screenshot ' + (i + 1) + ' de ' + game.name} loading="lazy" /></button>)}</div>{shot !== null && screenshots[shot] && <div className="expanded-shot"><button onClick={() => setShot(null)} aria-label="Fechar imagem">×</button><img src={safeMediaUrl(screenshots[shot].image)} alt={'Screenshot ampliada de ' + game.name} /></div>}</section>}
 {!loading && !problem && !manual && rawgKey && !trailers.length && <p className="media-notice">{mediaErrors.some(e => e.includes('trailers')) ? 'Trailers indisponíveis nesta consulta.' : 'Nenhum trailer disponível no RAWG para este jogo.'}</p>}
 {!loading && mediaErrors.length > 0 && <div className="media-notice" role="status">Alguns conteúdos não puderam ser carregados. <button onClick={() => setAttempt(a => a + 1)}>Recarregar mídia</button></div>}
 {(info.tags || []).length > 0 && <section><h2>Características</h2><div className="tags">{info.tags.map(t => <span key={t}>{t}</span>)}</div></section>}
 {safeMediaUrl(info.website) && <a className="external-game" href={safeMediaUrl(info.website)} target="_blank" rel="noopener noreferrer"><Icon name="explore" />Site oficial</a>}
 <p className="attribution">Dados e mídia: <a href="https://rawg.io" target="_blank" rel="noopener noreferrer">RAWG</a></p>
 </div>;
}
