const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let hooks=[],cursor=0,output={reply:'Choose your game.',actions:[{type:'add_game',title:'Warframe'}]},calls=0,applied=0,lib={};
const saved=new Map();
const ctx={console,URL,AbortController,setTimeout,clearTimeout,Intl,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},React:{useState(init){const i=cursor++;if(!(i in hooks))hooks[i]=typeof init==='function'?init():init;return[hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v]},useRef(init){const i=cursor++;if(!(i in hooks))hooks[i]={current:init};return hooks[i]},useEffect(){},createElement(type,props,...children){return{type,props:props||{},children:children.flat(Infinity)}}},ReactDOM:{createRoot:()=>({render(){}})},document:{getElementById:()=>({})},fetch:async()=>{calls++;return{ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(output)}]}}]})}}};
vm.createContext(ctx);for(const f of ['api.js','assistant-core.js','app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
ctx.searchFreeGames=async()=>[{id:'ftg-1',name:'Warframe',cover:'',platforms:'PC'}];
let tree;
const props=()=>({library:lib,open:true,rawgKey:'',onOpen(){},onClose(){},onApply(cmd){applied++;lib=vm.runInContext('JourneyAI',ctx).mutate(lib,cmd)}});
function render(){cursor=0;tree=ctx.JourneyAssistant(props());return tree}
function all(n){if(!n||typeof n!=='object')return[];return[n,...(n.children||[]).flatMap(all)]}
function text(n){return typeof n==='string'?n:(n?.children||[]).map(text).join('')}
function button(label){const n=all(tree).find(n=>n.type==='button'&&text(n)===label);assert.ok(n,'Missing '+label);return n}
function change(type,value){const n=all(tree).find(n=>n.type==='input'&&n.props.type===type);n.props.onChange({target:{value,checked:value}});render()}
(async()=>{
 render();assert.equal(calls,0);change('password','test-only-not-real-key');change('checkbox',true);all(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});render();assert.ok(text(tree).includes('Where will you go next?'));assert.equal(calls,0);assert.ok(all(tree).some(n=>n.type==='button'&&n.props['aria-label']==='Send message'));
 async function ask(input){all(tree).find(n=>n.type==='textarea').props.onChange({target:{value:input}});render();await all(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});render()}
 await ask('Add Warframe');assert.equal(calls,1);assert.equal(applied,0);assert.equal(Object.keys(lib).length,0);
 const add=button('Add');add.props.onClick();add.props.onClick();render();assert.equal(applied,1);assert.equal(lib['ftg-1'].status,'backlog');
 output={reply:'Review your comment.',actions:[{type:'add_note',title:'Warframe',note:'Great combat.'}]};await ask('Comment on Warframe: Great combat.');assert.equal(lib['ftg-1'].note,undefined);button('Apply to this game').props.onClick();render();assert.equal(lib['ftg-1'].note,'Great combat.');
 assert.equal(saved.size,0);button('Disconnect').props.onClick();render();assert.ok(text(tree).includes('Personal Gemini API key'));assert.ok(!text(tree).includes('Great combat.'));assert.equal(calls,2);
 console.log('PASS: assistant UI stays idle until sending, catalog choice required, apply-once behavior, append comment confirmation, disconnect clears conversation, no credential or chat storage');
})().catch(e=>{console.error(e);process.exitCode=1});
