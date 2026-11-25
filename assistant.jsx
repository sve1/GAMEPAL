function JourneyAssistant({library,rawgKey,onApply,onUndo,canUndo,open,onOpen,onClose}){
 const [connected,setConnected]=useState(false),[draftKey,setDraftKey]=useState(''),[consent,setConsent]=useState(false),[share,setShare]=useState(false);
 const [messages,setMessages]=useState([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[problem,setProblem]=useState('');
 const keyRef=useRef(''),requestRef=useRef(null),generationRef=useRef(0),dialogRef=useRef(null),logRef=useRef(null),launcherRef=useRef(null),appliedRef=useRef(new Set());
 useEffect(()=>{
  if(!open)return;
  const before=document.activeElement,overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';dialogRef.current?.querySelector('button')?.focus();
  const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onClose();}if(e.key==='Tab'){
   const nodes=Array.from(dialogRef.current?.querySelectorAll('button:not(:disabled),input,textarea,a[href]')||[]).filter(n=>n.getClientRects().length);
   const first=nodes[0],last=nodes[nodes.length-1];if(!first)return;
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }};
  document.addEventListener('keydown',key,true);
  return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key,true);if(before?.isConnected)before.focus();else launcherRef.current?.focus();};
 },[open]);
 useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight},[messages,busy,open]);
 useEffect(()=>()=>{generationRef.current++;requestRef.current?.abort();keyRef.current=''},[]);
 function cancel(){generationRef.current++;requestRef.current?.abort();requestRef.current=null;setBusy(false)}
 function disconnect(){cancel();keyRef.current='';setConnected(false);setMessages([]);setDraftKey('');setConsent(false);setShare(false);setProblem('');appliedRef.current.clear()}
 function connect(e){e.preventDefault();if(!draftKey.trim()||!consent)return;keyRef.current=draftKey.trim();setDraftKey('');setConnected(true);appliedRef.current.clear();setProblem('')}
 async function prepare(action,signal){
  if(['add_game','find_game'].includes(action.type)){
   let candidates=[],catalogError='';
   try{candidates=(rawgKey?await searchGames({query:action.title,pageSize:6},rawgKey):await searchFreeGames(action.title)).slice(0,6)}catch(e){catalogError='Catalog search unavailable. You can retry in Explore or add a manual entry.'}
   if(signal.aborted)throw Error('Request cancelled.');
   return {...action,candidates,catalogError};
  }
  const found=JourneyAI.matches(library,action.title);
  return {...action,targets:found.map(({id,entry})=>({id,title:entry.game.name,expectedUpdatedAt:entry.updatedAt,platform:entry.platform||'',oldStatus:entry.status,oldRating:entry.rating,oldNote:entry.note||''}))};
 }
 async function send(e){
  e?.preventDefault();if(busy||!input.trim()||!connected)return;
  const text=input.trim(),history=messages.filter(m=>!m.failed).map(m=>({role:m.role,text:m.text}));
  const epoch=++generationRef.current,controller=new AbortController();requestRef.current=controller;
  setInput('');setProblem('');setBusy(true);setMessages(ms=>[...ms,{role:'user',text}]);
  try{
   const plan=await JourneyAI.request({key:keyRef.current,input:text,history,library,share,signal:controller.signal});
   const proposals=[];for(const action of plan.actions)proposals.push(await prepare(action,controller.signal));
   if(epoch!==generationRef.current)return;
   setMessages(ms=>[...ms,{role:'model',text:plan.reply,proposals,id:Date.now()+'-'+epoch}]);
  }catch(e){if(epoch===generationRef.current){setProblem(e.message);setInput(text);setMessages(ms=>ms.slice(0,-1))}}
  finally{if(epoch===generationRef.current){setBusy(false);requestRef.current=null}}
 }
 function apply(messageId,index,command){
  const token=messageId+':'+index;
  if(busy||appliedRef.current.has(token))return;
  try{
   onApply(command);appliedRef.current.add(token);
   setMessages(ms=>ms.map(m=>m.id===messageId?{...m,proposals:m.proposals.map((p,i)=>i===index?{...p,applied:true}:p)}:m));setProblem('');
  }catch(e){setProblem(e.message)}
 }
 function proposal(p,m,index){
  return <div className="assistant-proposal" key={index}><div className="assistant-proposal-title">{p.title}<span>{p.applied?'Applied':p.type==='add_note'?'Append comment':p.type==='update_game'?'Review change':'Choose a game'}</span></div>
   {p.applied?<p role="status">Applied to your library.</p>:<>
    {['add_game','find_game'].includes(p.type)?<>
     {p.catalogError&&<p>{p.catalogError}</p>}
     {!rawgKey&&<p className="assistant-meta">Searching FreeToGame · PC / browser free-to-play. Set a RAWG key in Profile for the full catalog.</p>}
     {p.candidates.map(g=><div className="assistant-candidate" key={g.id}>{g.cover&&<img src={g.cover} alt="" loading="lazy"/>}<div><strong>{g.name}</strong><small>{g.platforms||g.genres}</small></div><button type="button" disabled={busy||!!library[g.id]||JourneyAI.matches(library,g.name).length>0} onClick={()=>apply(m.id,index,{type:'add_game',game:g,status:p.status})}>{library[g.id]||JourneyAI.matches(library,g.name).length?'In library':'Add'}</button></div>)}
     {!p.candidates.length&&<><p>No matching catalog result. A manual entry has no catalog artwork or details.</p><button type="button" disabled={busy} onClick={()=>apply(m.id,index,{type:'add_game',game:{id:'manual-'+Date.now(),name:p.title,cover:'',genres:'',platforms:'',released:''},status:p.status})}>Add “{p.title}” manually</button></>}
    </>:<>
     {p.type==='add_note'&&<blockquote>{p.note}</blockquote>}
     {!p.targets.length&&<p>No exact title found in your library. Use its full title or add the game first.</p>}
     {p.targets.length>1&&<p>More than one match: choose which version to update.</p>}
     {p.targets.map(t=><div className="assistant-change" key={t.id}><strong>{t.title}{t.platform?' · '+t.platform:''}</strong>{p.status!==undefined&&<p>Status: {STATES[t.oldStatus]||t.oldStatus} → {STATES[p.status]}</p>}{p.rating!==undefined&&<p>Rating: {t.oldRating??'Not set'} → {p.rating} / 10</p>}{p.type==='add_note'&&<p>Appends to My thoughts. Your existing notes are kept.</p>}<button type="button" className="primary" disabled={busy} onClick={()=>apply(m.id,index,{type:p.type,id:t.id,title:t.title,expectedUpdatedAt:t.expectedUpdatedAt,...(p.status!==undefined?{status:p.status}:{}),...(p.rating!==undefined?{rating:p.rating}:{}),...(p.type==='add_note'?{note:p.note}:{})})}>Apply to this game</button></div>)}
    </>}
   </>}
  </div>;
 }
 return <>
  <button type="button" ref={launcherRef} className="assistant-launcher" aria-label="Open Journey AI" aria-expanded={open} aria-controls="journey-assistant" onClick={onOpen}><CompanionMark/><span>AI</span></button>
  {open&&<div className="assistant-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}><section ref={dialogRef} className="assistant-panel" id="journey-assistant" role="dialog" aria-modal="true" aria-labelledby="assistant-title">
   <header className="assistant-header"><CompanionMark/><div><h2 id="assistant-title">Journey AI</h2><p>{connected?'Your gaming companion':'Connect your companion'}</p></div><CloseButton label="Close assistant" onClick={onClose}/></header>
   {!connected?<form className="assistant-connect" onSubmit={connect}><p>Discover your next game, update your journey and save your thoughts.</p><label>Personal Gemini API key<input type="password" autoComplete="off" spellCheck="false" value={draftKey} onChange={e=>setDraftKey(e.target.value)} required maxLength="256" placeholder="Paste your own API key"/></label><p>Your key stays in memory for this tab and is forgotten when you reload or disconnect. It is sent only to Google, directly from your browser.</p><p>Use a free-tier project without billing for free use. Google sets quotas and eligibility; Journey cannot enforce your Google billing settings.</p><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Get a key in Google AI Studio</a><label className="assistant-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>I agree to send my chat messages to Google. Free-tier content may be used to improve Google's products.</label><button className="primary" disabled={!consent||!draftKey.trim()}>Connect Gemini</button></form>:<>
    <div className="assistant-toolbar"><span>Gemini · personal</span><div>{canUndo&&<button type="button" disabled={busy} onClick={onUndo}>Undo last app change</button>}<button type="button" onClick={disconnect}>Disconnect</button></div></div>
    <div className="assistant-messages" ref={logRef} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
     {!messages.length&&<div className="assistant-welcome"><CompanionMark/><h3>Where will you go next?</h3><p>Ask for recommendations, add a game, rate it, or save a comment. Changes appear here for you to review.</p>{['Recommend a game for tonight','Add a game to my backlog','Help me save a comment'].map(t=><button type="button" key={t} onClick={()=>setInput(t)}>{t}</button>)}</div>}
     {messages.map((m,i)=><article className={'assistant-message '+m.role} key={m.id||i}><small>{m.role==='user'?'You':'Journey AI'}</small><p>{m.text}</p>{m.proposals?.map((p,j)=>proposal(p,m,j))}</article>)}
     {busy&&<p className="assistant-thinking" role="status">Planning your next move… <button type="button" onClick={cancel}>Cancel</button></p>}
    </div>
    {problem&&<p className="assistant-error" role="alert">{problem}</p>}
    <form className="assistant-composer" onSubmit={send}><label className="assistant-check"><input type="checkbox" checked={share} disabled={busy} onChange={e=>setShare(e.target.checked)}/>Include library titles, status, platform and ratings (up to 100 games). Notes and images are never included automatically.</label><label className="sr-only" htmlFor="assistant-message">Message Journey AI</label><div><textarea id="assistant-message" value={input} onChange={e=>setInput(e.target.value)} maxLength="2000" rows="2" placeholder="Ask your companion…" disabled={busy}/><button type="submit" className="primary" aria-label="Send message" disabled={busy||!input.trim()}><Icon name="play"/><span>Send</span></button></div><p>Review before applying · No automatic edits · Chat is not saved</p></form>
   </>}
  </section></div>}
 </>;
}
function CompanionMark(){return <svg className="companion-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3"/><path d="M16 7l2.7 6.3L25 16l-6.3 2.7L16 25l-2.7-6.3L7 16l6.3-2.7z" stroke="currentColor" strokeWidth="1.5"/><circle cx="16" cy="16" r="2" fill="currentColor"/></svg>}
