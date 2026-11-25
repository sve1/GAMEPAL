// All dismiss controls share one geometry, independent of fonts and flex baselines.
function CloseButton({label,onClick,className=''}) {
 return <button type="button" className={'dismiss-control '+className} aria-label={label} onClick={onClick}><svg className="dismiss-symbol" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18"/></svg></button>;
}
function SliderField({name,label,initialValue,kind='hours'}) {
 const rating=kind==='rating';
 const valid=initialValue!==null&&initialValue!==undefined&&initialValue!==''&&Number.isFinite(Number(initialValue));
 const initial=valid?Number(initialValue):null;
 const [value,setValue]=useState(initial);
 const [limit,setLimit]=useState(rating?10:Math.max(200,Math.ceil((initial||0)/100)*100));
 const step=rating?0.5:0.5;
 const id='journey-field-'+name;
 const numeric=value===null?0:value;
 const update=next=>setValue(Math.min(limit,Math.max(0,Math.round(next*10)/10)));
 return <div className="slider-field">
  <div className="slider-heading"><label htmlFor={id}>{label}</label><output htmlFor={id} aria-live="polite">{value===null?'Not set':new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(value)+(rating?' / 10':' h')}</output></div>
  <input type="hidden" name={name} value={value===null?'':String(value)}/>
  <div className="slider-row"><button type="button" className="step-control" aria-label={'Decrease '+label} disabled={value!==null&&value<=0} onClick={()=>update(numeric-step)}><Icon name="minus"/></button>
   <input id={id} type="range" min="0" max={limit} step={step} value={numeric} aria-valuetext={value===null?'Not set':String(value)+(rating?' out of 10':' hours')} onChange={e=>update(Number(e.target.value))} style={{'--range-progress':(numeric/limit*100)+'%'}}/>
   <button type="button" className="step-control" aria-label={'Increase '+label} disabled={value!==null&&value>=limit} onClick={()=>update(numeric+step)}><Icon name="plus"/></button>
  </div>
  <div className="slider-footer"><span>0{rating?'':' h'}</span><div>{!rating&&limit<10000&&<button type="button" onClick={()=>setLimit(n=>Math.min(10000,n+100))} aria-label={'Extend range for '+label}>More hours</button>}<button type="button" onClick={()=>setValue(null)} disabled={value===null} aria-label={'Clear '+label}>Clear</button></div><span>{limit}{rating?'':' h'}</span></div>
 </div>;
}
function DateField({name,label,initialValue='',required=false}) {
 const [value,setValue]=useState(initialValue||'');
 const inputRef=useRef(null);
 const id='journey-date-'+name;
 function openCalendar(){
  const input=inputRef.current;
  if(!input)return;
  try{if(typeof input.showPicker==='function')input.showPicker();else input.focus();}catch(error){input.focus();}
 }
 return <div className="date-field"><label htmlFor={id}>{label}</label><div className={'date-control '+(!value?'is-empty':'')}>
  <input id={id} ref={inputRef} name={name} type="date" value={value} required={required} onChange={e=>setValue(e.target.value)} onClick={openCalendar}/>
  {!value&&<span className="date-placeholder" aria-hidden="true">Choose date</span>}
  <button type="button" className="calendar-button" aria-label={'Open calendar for '+label} onClick={openCalendar}><Icon name="calendar"/></button>
 </div>{value&&!required&&<button type="button" className="date-clear" aria-label={'Clear '+label} onClick={()=>setValue('')}>Clear date</button>}</div>;
}
