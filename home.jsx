function HomeDiscovery({library,rawgKey,renderGame}) {
 const [pool,setPool]=useState([]),[source,setSource]=useState(''),[loading,setLoading]=useState(true),[gameError,setGameError]=useState(''),[seed,setSeed]=useState(()=>Date.now()>>>0);
 const [news,setNews]=useState(null),[newsError,setNewsError]=useState(''),[newsLoading,setNewsLoading]=useState(true),[newsAttempt,setNewsAttempt]=useState(0);
 useEffect(()=>{
  let cancelled=false;
  setLoading(true);setGameError('');
  async function discover(){
   if(rawgKey){
    try{
     let cached=load('journey_discovery_v1',null);
     if(!cached||Date.now()-cached.at>86400000||!Array.isArray(cached.games)) {
      const games=await searchGames({ordering:'-added',pageSize:40,page:1+Math.floor(Math.random()*5)},rawgKey);
      if(!games.length)throw Error('No suggestions available.');
      cached={at:Date.now(),games};save('journey_discovery_v1',cached);
     }
     if(!cancelled){setPool(cached.games);setSource('RAWG');}return;
    }catch(error){/* Free catalog is independent from the RAWG service. */}
   }
   const games=await getFreeCatalog();
   if(!cancelled){setPool(games);setSource('FreeToGame · free-to-play');}
  }
  discover().catch(()=>{if(!cancelled)setGameError('Suggestions unavailable. Your library is ready to use.');}).finally(()=>{if(!cancelled)setLoading(false)});
  return()=>{cancelled=true};
 },[rawgKey]);
 useEffect(()=>{
  let cancelled=false;setNewsLoading(true);setNewsError('');
  fetchJsonWithTimeout('data/news.json'+(newsAttempt?'?refresh='+newsAttempt:''),8000).then(data=>{
   if(!Array.isArray(data.articles))throw Error('Invalid news feed');
   const articles=data.articles.filter(a=>typeof a.title==='string'&&typeof a.source==='string'&&safeMediaUrl(a.url)&&!Number.isNaN(Date.parse(a.publishedAt))).slice(0,9);
   if(!articles.length)throw Error('No news available');
   if(!cancelled)setNews({...data,articles});
  }).catch(()=>{if(!cancelled)setNewsError('Headlines are temporarily unavailable.');}).finally(()=>{if(!cancelled)setNewsLoading(false)});
  return()=>{cancelled=true};
 },[newsAttempt]);
 let state=seed||1;const rng=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296};
 const picks=randomGames(pool,library,6,rng);
 return <div className="home-discovery">
 <section aria-label="Random game suggestions"><div className="section-heading"><h2>Random picks</h2><button onClick={()=>setSeed(s=>(s+1)>>>0)} disabled={loading||!picks.length} aria-label="Shuffle game suggestions"><Icon name="gamepad"/>Shuffle</button></div>
 {loading?<div className="home-loading" role="status">Finding your next game…</div>:gameError?<p className="media-notice" role="status">{gameError}</p>:picks.length?<><div className="grid">{picks.map(renderGame)}</div><p className="attribution"><a href={source==='RAWG'?'https://rawg.io':'https://www.freetogame.com'} target="_blank" rel="noopener noreferrer">{source}</a></p></>:<p className="media-notice">All available picks are already in your library.</p>}
 </section>
 <section aria-label="Gaming news"><div className="section-heading"><h2>Gaming news</h2><button onClick={()=>setNewsAttempt(a=>a+1)} disabled={newsLoading} aria-label="Reload news headlines"><Icon name="journal"/>Refresh</button></div>
 {newsLoading&&!news?<div className="home-loading" role="status">Loading headlines…</div>:null}
 {newsError&&<p className="media-notice" role="status">{newsError}</p>}
 {news&&<><div className="news-grid">{news.articles.map(article=><a key={article.url} className="news-card" href={safeMediaUrl(article.url)} target="_blank" rel="noopener noreferrer">{safeMediaUrl(article.image)&&<img src={safeMediaUrl(article.image)} alt="" loading="lazy" onError={e=>e.currentTarget.style.display='none'}/>}<div><small>{article.source} · <time dateTime={article.publishedAt}>{dateLabel(article.publishedAt)}</time></small><h3>{article.title}</h3><span>Read article <Icon name="chevron"/></span></div></a>)}</div><p className="attribution">Public RSS headlines · feed updated {Number.isNaN(Date.parse(news.updatedAt))?'date unavailable':new Date(news.updatedAt).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'})}{Date.now()-Date.parse(news.updatedAt)>36*3600000?' · Saved feed; updates may be delayed.':''}</p></>}
 </section>
 </div>
}
