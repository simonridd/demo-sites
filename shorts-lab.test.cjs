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
 const keys=['#cards','#search','#verdict','#family','#media-filter','#stage-only','#screenshots-only','#result-count','#context-note','#empty','#reset'];
 const nodes=Object.fromEntries(keys.map(k=>[k,fakeNode()]));
 nodes['#search'].value='';nodes['#media-filter'].value='all';nodes['#stage-only'].checked=false;nodes['#screenshots-only'].checked=false;
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

test('all 77 source references remain distinct and their review decisions are explicit',async()=>{
 const effects=await getEffects();
 assert.equal(effects.length,77);
 assert.equal(new Set(effects.map(e=>e.id)).size,77);
 assert.equal(new Set(effects.map(e=>e.preview)).size,77);
 assert.equal(effects.filter(e=>e.family==='Research-only').length,13);
 assert.equal(effects.filter(e=>e.verdict==='Hold').length,7);
 assert.equal(effects.filter(e=>e.stage).length>35,true);
 for(const e of effects){
  assert.ok(e.title && e.note && e.priority && e.source && e.family && e.verdict);
  assert.match(e.source,/^https:\/\/(?:www\.youtube\.com|www\.facebook\.com)\//);
 }
});
test('full gallery renders exactly 77 labelled cards with real previews or truthful research markers',async()=>{
 const {nodes,effects}=await start();
 const html=nodes['#cards'].innerHTML;
 assert.equal((html.match(/<article class="card"/g)||[]).length,77);
 assert.equal((html.match(/class="preview"/g)||[]).length,77);
 assert.equal((html.match(/No CSS trial/g)||[]).length,13);
 assert.equal((html.match(/class="replay" data-action="replay"/g)||[]).length,64);
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
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,77);
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
 assert.equal((html.match(/data-source="unverified"/g)||[]).length,74);
 assert.equal((html.match(/class="source-link source-verified"/g)||[]).length,3);
 assert.equal((html.match(/class="clip-unavailable"/g)||[]).length,77);
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
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,74);
 nodes['#media-filter'].value='ready';nodes['#media-filter'].handlers.change();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,0);
});

test('screenshot-led carousel focuses the centred slide with a safe CSS/JS fallback',async()=>{
 const {nodes,effects}=await start();
 const item=effects.find(x=>x.id===74);
 assert.equal(item.preview,'carousel');
 assert.match(item.evidence,/user-supplied (?:screenshot|reference)/);
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="carousel-shell carousel-focus-study"/);
 assert.match(html,/aria-roledescription="carousel"/);
 assert.match(html,/aria-roledescription="slide"/);
 assert.match(html,/Previous carousel slide/);
 assert.match(html,/Next carousel slide/);
 const js=read('kits/shorts-lab/lab.mjs');
 const css=read('kits/shorts-lab/lab.css');
 assert.match(js,/nearestCarouselIndex/);
 assert.match(js,/focusCarouselItem/);
 assert.match(css,/scroll-snap-align:center/);
 assert.match(css,/aspect-ratio:3\s*\/\s*4/);
 assert.match(css,/animation-timeline:view\(inline\)/);
 assert.match(css,/@supports\(animation-timeline:view\(inline\)\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('Material-inspired input has persistent semantic label and focus underline',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(x=>x.id===73).preview,'input');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="input-demo material-input-study"/);
 assert.match(html,/class="md-field"/);
 assert.match(html,/aria-describedby="input-hint-73"/);
 assert.match(html,/for="input-73"/);
 const css=read('kits/shorts-lab/lab.css');
 assert.match(css,/\.md-field:focus-within::after/);
 assert.match(css,/input:not\(:placeholder-shown\)\+label/);
 assert.match(css, /user-invalid/);
});
test('scroll-state mobile navigation retains links and provides older browser fallback',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(x=>x.id===72).preview,'header');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="collapse-viewport"/);
 assert.match(html,/aria-label="Sample navigation"/);
 const css=read('kits/shorts-lab/lab.css');
 const js=read('kits/shorts-lab/lab.mjs');
 assert.match(css,/container-type:scroll-state/);
 assert.match(css,/@container atlas-sticky-nav scroll-state\(stuck: top\)/);
 assert.match(js,/updateFallbackNav/);
 assert.match(js,/scrollTop>10/);
});
test('icon choices have real reversible toggle state with animated fill',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(x=>x.id===71).preview,'icons');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/aria-label="Choose filled icon states"/);
 for(const kind of ['heart','star','bookmark'])assert.ok(html.includes('data-kind="'+kind+'"'));
 assert.match(html,/aria-pressed="false"/);
 const js=read('kits/shorts-lab/lab.mjs');
 const css=read('kits/shorts-lab/lab.css');
 assert.match(js,/case 'icon'/);
 assert.match(js,/btn\.setAttribute\('aria-pressed',String\(selected\)\)/);
 assert.match(css,/\.icon-fill\{fill:var\(--icon-accent\);clip-path:inset\(100%/);
 assert.match(css,/\.fill-icon\[aria-pressed="true"\] \.icon-fill/);
});

test('unpressed icon fill is always empty even while hovering or focused',()=>{
 const css=read('kits/shorts-lab/lab.css');
 assert.match(css,/\.fill-icons \.icon-fill\{[^}]*clip-path:inset\(100% 0 0 0\);transition:none/);
 assert.match(css,/\.fill-icons \.fill-icon\[aria-pressed="true"\] \.icon-fill\{[^}]*clip-path:inset\(0 0 0 0\);transition:clip-path/);
 assert.doesNotMatch(css,/\.fill-icon:(?:hover|focus-visible):not\(\[aria-pressed="true"\]\) \.icon-fill/);
 assert.match(css,/@media\(hover:hover\) and \(pointer:fine\)/);
});

test('Google-inspired range control keeps native semantics while decorating the rail',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(e=>e.id===68).preview,'slider');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="slider-wrap material-slider-study"/);
 assert.match(html,/type="range" min="0" max="100" step="1" value="50"/);
 assert.match(html,/aria-describedby="range-hint-68"/);
 assert.match(html,/class="material-range-rail"/);
 assert.match(html,/class="material-range-thumb"/);
 const css=read('kits/shorts-lab/lab.css');
 const js=read('kits/shorts-lab/lab.mjs');
 assert.match(css,/\.material-range:active \.material-range-thumb/);
 assert.match(css,/\.material-range:focus-within/);
 assert.match(js,/--position/);
 assert.match(js,/output.textContent=input.value\+'%'/);
});
test('squishy switch is a real labelled checkbox whose visual position follows checked state',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(e=>e.id===69).preview,'toggle');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="switch-line squishy-toggle"/);
 assert.match(html,/type="checkbox" role="switch"/);
 assert.match(html,/aria-label="Live updates"/);
 assert.match(html,/aria-checked="false"/);
 const css=read('kits/shorts-lab/lab.css');
 const js=read('kits/shorts-lab/lab.mjs');
 assert.match(css,/\.switch:has\(input:checked\) \.switch-track::after/);
 assert.match(css,/\.switch:active \.switch-track::after/);
 assert.match(css,/\.switch:focus-within \.switch-track/);
 assert.match(js,/setAttribute\('aria-checked',String\(input.checked\)\)/);
});
test('thinking bar is one-shot visual example, not simulated completion',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(e=>e.id===67).preview,'thinking');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="thinking-stage" role="img"/);
 assert.match(html,/no real system is processing/);
 assert.match(html,/Illustrative activity only/);
 const css=read('kits/shorts-lab/lab.css');
 assert.match(css,/\.preview.is-playing \.demo-thinking \.thinking-light/);
 assert.match(css,/@keyframes atlas-thinking-sweep/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const capture=read('tools/capture-motion-atlas.py');
 assert.match(capture,/page\.mouse\.down\(\)/);
 assert.match(capture,/page\.mouse\.up\(\)/);
 assert.match(capture,/el\.dispatchEvent\(new Event\('input'/);
});

test('Gemini ambient study remains alive until paused and accelerates only on active press',async()=>{
 const {nodes,effects}=await start();
 const study=effects.find(e=>e.id===66);
 assert.equal(study.preview,'moving-bg');
 assert.equal(study.verdict,'Adapt');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="gemini-reveal is-ambient"/);
 assert.match(html,/aria-label="Continuous ambient blurred-gradient demonstration"/);
 assert.match(html,/data-action="ambient-toggle" aria-pressed="false"/);
 assert.match(html,/class="gemini-activity"/);
 assert.match(html,/Continuous 9-second drift/);
 assert.match(html,/release to return after a 2-second delay/);
 const css=read('kits/shorts-lab/lab.css');
 assert.match(css,/@property --atlas-ambient-fast/);
 assert.match(css,/transition:--atlas-ambient-fast 0s 2s/);
 assert.match(css,/:has\(\.gemini-activity:active\)/);
 assert.match(css,/--atlas-ambient-fast:1/);
 assert.match(css,/calc\(9s - 7s \* var\(--atlas-ambient-fast\)\)/);
 assert.match(css,/infinite alternate/);
 assert.match(css,/\.is-paused \.gemini-aura\{animation-play-state:paused\}/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(css,/atlas-gemini-reveal/);
 const js=read('kits/shorts-lab/lab.mjs');
 assert.match(js,/case 'ambient-toggle'/);
});

test('Android frosted blur and Liquid Glass-inspired surface remain explicit alternatives',async()=>{
 const {nodes,effects}=await start();
 const record=effects.find(e=>e.id===60);
 assert.equal(record.preview,'blur');
 assert.match(record.evidence,/user-supplied screenshot/);
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="blur-comparison-study" data-material="android"/);
 assert.match(html,/data-action="blur-mode" data-mode="android" aria-pressed="true"/);
 assert.match(html,/data-action="blur-mode" data-mode="liquid" aria-pressed="false"/);
 assert.match(html,/Liquid Glass-inspired/);
 const css=read('kits/shorts-lab/lab.css');
 const js=read('kits/shorts-lab/lab.mjs');
 assert.match(css,/backdrop-filter:blur\(17px\) saturate\(1\.3\)/);
 assert.match(css,/backdrop-filter:blur\(9px\) saturate\(1\.9\) contrast\(1\.12\)/);
 assert.match(css,/@supports not \(\(backdrop-filter:blur\(1px\)\)/);
 assert.match(js,/case 'blur-mode'/);
 assert.match(js,/choice\.setAttribute\('aria-pressed',String\(choice===btn\)\)/);
});
test('split button uses accessible popover or fallback and exposes distinct actions',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(e=>e.id===61).preview,'split');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="split-popover-study"/);
 assert.match(html,/aria-controls="split-options-61"/);
 assert.match(html,/popover="auto" role="menu" hidden/);
 assert.match(html,/role="menuitem"/);
 const js=read('kits/shorts-lab/lab.mjs');
 const css=read('kits/shorts-lab/lab.css');
 assert.match(js,/function closeSplitMenu/);
 assert.match(js,/function toggleSplitMenu/);
 assert.match(js,/showPopover/);
 assert.match(js,/ArrowDown.*ArrowUp.*Home.*End/);
 assert.match(js,/event\.key==='Escape'/);
 assert.match(css,/\.split-menu-items:popover-open/);
});
test('pixel squeeze only animates a stage study on explicit replay',async()=>{
 const {nodes,effects}=await start();
 const record=effects.find(e=>e.id===65);
 assert.equal(record.verdict,'Prototype');
 assert.equal(record.preview,'squeeze');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="pixel-squeeze-study"/);
 assert.match(html,/class="pixel-grid"/);
 assert.match(html,/data-action="replay" type="button">▶ Squeeze once/);
 const css=read('kits/shorts-lab/lab.css');
 assert.match(css,/@keyframes atlas-pixel-squeeze/);
 assert.match(css,/\.preview\.is-playing \.pixel-squeeze-label/);
 assert.doesNotMatch(css,/atlas-pixel-squeeze [^;\n}]*infinite/);
 assert.match(css,/\.pixel-squeeze-label,\.pixel-glitch\{animation:none!important/);
});

test('screenshots supplied filter selects only user-provided screenshot references',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.length,77);
 const screenshotIds=[52,57,60,61,65,66,67,68,69,71,72,73,74,76,77];
 assert.deepEqual(effects.filter(e=>e.screenshotProvided).map(e=>e.id),screenshotIds);
 nodes['#screenshots-only'].checked=true;
 nodes['#screenshots-only'].handlers.change();
 const gallery=nodes['#cards'].innerHTML;
 assert.equal((gallery.match(/<article class="card"/g)||[]).length,screenshotIds.length);
 for(const id of screenshotIds) assert.ok(gallery.includes('data-id="'+id+'"'),'Screenshot '+id);
 assert.ok(!gallery.includes('data-id="75"'),'Facebook reel without screenshot should not be tagged');
 nodes['#search'].value='glowing';
 nodes['#search'].handlers.input();
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,1);
 assert.match(nodes['#cards'].innerHTML,/data-id="77"/);
 nodes['#reset'].handlers.click();
 assert.equal(nodes['#screenshots-only'].checked,false);
 assert.equal((nodes['#cards'].innerHTML.match(/<article class="card"/g)||[]).length,77);
});
test('filter chips are real, single-selection content filters, not decorative pills',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(e=>e.id===76).preview,'chips');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="chips-strip" role="group"/);
 assert.match(html,/data-action="filter-chip"/);
 assert.match(html,/data-sample="travel"/);
 assert.match(html,/aria-pressed="true" class="filter-chip"/);
 const js=read('kits/shorts-lab/lab.mjs');
 assert.match(js,/case 'filter-chip'/);
 assert.match(js,/item.hidden=value!=='all'/);
 assert.match(js,/ArrowRight.*ArrowLeft.*Home.*End/);
});
test('image glow duplicates original transparent image without affecting the sharp source',async()=>{
 const {nodes,effects}=await start();
 assert.equal(effects.find(e=>e.id===77).preview,'image-glow');
 const html=nodes['#cards'].innerHTML;
 assert.match(html,/class="image-glow-stage is-glowing"/);
 assert.match(html,/class="image-glow-halo"/);
 assert.match(html,/class="image-glow-image"/);
 assert.match(html,/data-action="image-glow" aria-pressed="true"/);
 assert.match(html,/077-glow-bloom.svg/);
 const css=read('kits/shorts-lab/lab.css');
 assert.match(css,/filter:blur\(22px\) saturate\(1\.7\)/);
 assert.match(css,/\.image-glow-stage\.is-glowing \.image-glow-halo/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 const art=read('kits/shorts-lab/assets/077-glow-bloom.svg');
 assert.match(art,/<svg/);
});
