const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let calls=0,fail=false;
const ctx={React:{},URL,AbortController,setTimeout,clearTimeout,console,fetch:async url=>{
 calls++;
 if(fail)throw Error('offline');
 if(url==='data/free-games.json')return{ok:true,json:async()=>({games:[{id:1,title:'Free One',thumbnail:'https://example.com/a.jpg',platform:'PC',genre:'RPG',short_description:'Sample',release_date:'2024-01-01',game_url:'https://example.com/game'}]})};
 return {ok:true,json:async()=>({results:[{id:7,name:'Portal',rating:4.8,background_image:'https://example.com/p.jpg',platforms:[],genres:[]}]})};
}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('api.js','utf8'),ctx);
(async()=>{
 const request={query:'Portal',pageSize:24};
 const [a,b]=await Promise.all([ctx.searchGames(request,'test'),ctx.searchGames(request,'test')]);assert.equal(calls,1);assert.equal(a[0].id,7);await ctx.searchGames(request,'test');assert.equal(calls,1);
 await ctx.searchGames(request,'different-key');assert.equal(calls,2);
 fail=true;await assert.rejects(ctx.searchGames({query:'New'},'test'));fail=false;await ctx.searchGames({query:'New'},'test');assert.equal(calls,4,'Failed requests must be retriable');
 const free=await ctx.searchFreeGames('free');assert.equal(free[0].id,'ftg-1');assert.equal(free[0].provider,'freetogame');assert.equal(free[0].description,'Sample');await ctx.searchFreeGames('one');assert.equal(calls,5,'Free searches should use a single catalog download');
 const pool=[{id:1,name:'Owned'},{id:2,name:'Other'},{id:3,name:'Owned'}];const picks=ctx.randomGames(pool,{1:{game:{name:'Owned'}}},6,()=>.5);assert.equal(picks.length,1);assert.equal(picks[0].name,'Other');assert.equal(pool.length,3);
 console.log('PASS: one-request search, shared in-flight requests, cached results, key isolation, failure retry, free catalog and owned-game exclusion');
})().catch(e=>{console.error(e);process.exitCode=1});
