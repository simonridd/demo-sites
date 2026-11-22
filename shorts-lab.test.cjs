const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = relative => fs.readFileSync(require('node:path').join(__dirname,relative),'utf8');

async function getEffects(){
 const { pathToFileURL } = require('node:url');
 const { join } = require('node:path');
 return (await import(pathToFileURL(join(__dirname,'kits/shorts-lab/effects-data.mjs')))).effects;
}
function fakeNode(){
 const handlers={};const cls=new Set();
 return {
  value:'all',checked:false,hidden:false,innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},
  classList:{add:x=>cls.add(x),remove:x=>cls.delete(x),contains:x=>cls.has(x),toggle(x){if(cls.has(x)){cls.delete(x);return false;}cls.add(x);return true;}},
  addEventListener:(event,callback)=>{handlers[event]=callback;},
  append(){},focus(){},contains(){return true;},handlers
 };
}
async function start(){
 const effects=await getEffects();
 const keys=['#cards','#search','#verdict','#family','#media-filter','#stage-only','#result-count','#context-note','#empty','#reset'];
 const nodes=Object.fromEntries(keys.map(k=>[k,fakeNode()]));
 nodes['#search'].value='';nodes['#media-filter'].value='all';nodes['#stage-only'].checked=false;
 const doc={querySelector:s=>nodes[s],querySelectorAll:()=>[],createElement:()=>fakeNode(),addEventListener(){},documentElement:fakeNode()};
 const win={matchMedia:()=>({matches:false})};
 const script=read('kits/shorts-lab/lab.mjs').replace(/^import [^\n]+\n/gm,'');
 const verifiedVideos={68:{url:'https://www.youtube.com/watch?v=rtaqbWsttLI',platform:'YouTube',evidence:'test'},69:{url:'https://www.youtube.com/watch?v=aaoYm6wkjTU',platform:'YouTube',evidence:'test'},75:{url:'https://www.facebook.com/reel/2025089661358011',platform:'Facebook',evidence:'test'}};
 const originalVideoLink=e=>verifiedVideos[e.id]?{...verifiedVideos[e.id],status:'verified'}:{status:'unverified',searchUrl:'https://www.youtube.com/results?search_query='+encodeURIComponent(e.title)};
 const clips={};
 const context=vm.createContext({document:doc,window:win,effects,researchCount:effects.filter(e=>e.family==='Research-only').length,verifiedVideos,originalVideoLink,clips,
  console,clearTimeout,setTimeout:()=>1});
 vm.runInContext(script,context,{timeout:3000,filename:'lab.mjs'});
 return {nodes,effects,context};
}

test('all 75 source references remain distinct and their review decisions are explicit',async()=>{
 const effects=await getEffects();
 assert.equal(effects.length,75);
 assert.equal(new Set(effects.map(e=>e.id)).size,75);
 assert.equal(new Set(effects.map(e=>e.preview)).size,75);
 assert.equal(effects.filter(e=>e.family==='Research-only').length,13);
 assert.equal(effects.filter(e=>e.verdict==='Hold').length,7);
 assert.equal(effects.filter(e=>e.stage).length>35,true);
 for(const e of effects){
  assert.ok(e.title && e.note && e.priority && e.source && e.family && e.verdict);
  assert.match(e.source,/^https:\/\/(?:www\.youtube\.com|www\.facebook\.com)\//);
 }
});
test('full gallery renders exactly 75 labelled cards with real previews or truthful research markers',async()=>{
 const {nodes,effects}=await start();
 const html=nodes['#cards'].innerHTML;
 assert.equal((html.match(/<article class="card"/g)||[]).length,75);
 assert.equal((html.match(/class="preview"/g)||[]).length,75);
 assert.equal((html.match(/No CSS trial/g)||[]).length,13);
 assert.equal((html.match(/class="replay" data-action="replay"/g)||[]).length,62);
 for(const e of effects)assert.ok(html.includes('data-id="'+e.id+'"'),e.title);
 assert.ok(!html.includes('undefined'));
});
test('search, verdict and stage filters are functional and independent',async()=>{
 const {nodes}=await start();
 nodes['#search'].value='gliding pill';
 nodes['#search'].handlers.input();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,1);
 nodes['#search'].value='';
 nodes['#verdict'].value='Hold';
 nodes['#verdict'].handlers.change();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,7);
 nodes['#verdict'].value='all';
 nodes['#stage-only'].checked=true;
 nodes['#stage-only'].handlers.change();
 assert.ok((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length>35);
 nodes['#reset'].handlers.click();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,75);
});
test('replay in card footer reaches the actual corresponding preview',async()=>{
 const {nodes}=await start();
 let replayed=false;
 const preview=fakeNode();
 preview.offsetWidth=200;
 preview.classList.add=function(x){if(x==='is-playing')replayed=true;};
 const card={querySelector:s=>s==='.preview'?preview:null};
 const button={dataset:{action:'replay'},closest:s=>s==='.preview'?null:s==='.card'?card:null};
 nodes['#cards'].handlers.click({target:{closest:s=>s==='button'?button:null}});
 assert.equal(replayed,true);
});
test('native controls, keyboard patterns, motion fallback and existing app isolation are documented',()=>{
 const html=read('kits/shorts-lab/index.html');
 const js=read('kits/shorts-lab/lab.mjs');
 const css=read('kits/shorts-lab/lab.css');
 const readme=read('kits/shorts-lab/README.md');
 assert.match(html,/Skip to the effects/);
 assert.match(html,/One-off presentation/);
 assert.match(html,/Everyday product/);
 assert.match(js,/case 'split-menu'/);
 assert.match(js,/event\.key==='Escape'/);
 assert.match(js,/case 'slider'/);
 assert.match(js,/case 'odometer'/);
 assert.match(js,/event\.key==='ArrowRight'/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/scroll-snap-type:x mandatory/);
 assert.match(readme,/a faithful source-code archive/i);
 assert.doesNotMatch(html,/messenger-config|sdk\/web|genesys/i);
});

test('source links do not masquerade as exact video URLs and clips require real files',async()=>{
 const {nodes}=await start();
 const html=nodes['#cards'].innerHTML;
 assert.equal((html.match(/data-source="verified"/g)||[]).length,3);
 assert.equal((html.match(/data-source="unverified"/g)||[]).length,72);
 assert.equal((html.match(/class="source-link source-verified"/g)||[]).length,3);
 assert.equal((html.match(/class="clip-unavailable"/g)||[]).length,75);
 assert.ok(!html.includes('Creator channel ↗'));
 assert.ok(!html.includes('class="clip-player"'));
 assert.match(html,/Watch original Facebook video/);
 assert.match(html,/watch\?v=rtaqbWsttLI/);
 assert.match(html,/watch\?v=aaoYm6wkjTU/);
});
test('capture workflow supplies concrete browser previews and a strict manifest',()=>{
 const python=read('tools/capture-motion-atlas.py');
 const links=read('tools/resolve-motion-videos.py');
 const data=read('kits/shorts-lab/source-videos.mjs');
 assert.match(python,/preview\.screenshot/);
 assert.match(python,/ffprobe/);
 assert.match(python,/write_manifest/);
 assert.match(links,/CHANNEL_ID = "UC5DNytAJ6_FISueUfzZCVsw"/);
 assert.match(links,/is_right_creator/);
 assert.match(data,/import \{resolvedVideos\}/);
});

test('media evidence filters distinguish exact source matches from title-only searches',async()=>{
 const {nodes}=await start();
 nodes['#media-filter'].value='exact';nodes['#media-filter'].handlers.change();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,3);
 nodes['#media-filter'].value='unverified';nodes['#media-filter'].handlers.change();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,72);
 nodes['#media-filter'].value='ready';nodes['#media-filter'].handlers.change();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,0);
});
