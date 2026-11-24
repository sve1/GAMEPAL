const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let hooks=[],cursor=0;
const ctx={console,URL,AbortController,setTimeout,clearTimeout,Intl,React:{useState(init){const i=cursor++;if(!(i in hooks))hooks[i]=typeof init==='function'?init():init;return[hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v]},useRef:()=>({current:null}),useEffect(){},createElement(type,props,...children){return{type,props:props||{},children:children.flat(Infinity)}}},ReactDOM:{createRoot:()=>({render(){}})},document:{getElementById:()=>({})}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('api.js','utf8'),ctx);vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
function all(n){if(!n||typeof n!=='object')return[];return[n,...(n.children||[]).flatMap(all)]}
function render(fn,props){cursor=0;return ctx[fn](props)}
function field(tree,type){return all(tree).find(n=>n.type==='input'&&n.props.type===type)}
function click(tree,label){all(tree).find(n=>n.type==='button'&&n.props['aria-label']===label).props.onClick()}
let props={name:'rating',label:'My rating',kind:'rating',initialValue:null};let tree=render('SliderField',props);assert.equal(field(tree,'hidden').props.value,'');click(tree,'Increase My rating');tree=render('SliderField',props);assert.equal(field(tree,'hidden').props.value,'0.5');field(tree,'range').props.onChange({target:{value:'8.5'}});tree=render('SliderField',props);assert.equal(field(tree,'hidden').props.value,'8.5');click(tree,'Clear My rating');tree=render('SliderField',props);assert.equal(field(tree,'hidden').props.value,'');
hooks=[];props={name:'rating',label:'My rating',kind:'rating',initialValue:0};tree=render('SliderField',props);assert.equal(field(tree,'hidden').props.value,'0');
hooks=[];props={name:'ttb_main',label:'Main story',initialValue:250.3};tree=render('SliderField',props);assert.equal(field(tree,'hidden').props.value,'250.3');assert.ok(field(tree,'range').props.max>=250.3);
hooks=[];props={name:'start',label:'Started on',initialValue:''};tree=render('DateField',props);assert.equal(field(tree,'date').props.value,'');field(tree,'date').props.onChange({target:{value:'2026-11-24'}});tree=render('DateField',props);assert.equal(field(tree,'date').props.value,'2026-11-24');click(tree,'Clear Started on');tree=render('DateField',props);assert.equal(field(tree,'date').props.value,'');
console.log('PASS: unset and zero ratings, slider persistence, clearing values, existing fractional long durations, date selection and clearing');
