// Independently authored review scenes. Native scrolling is the sole clock.
const runtimes=new WeakMap();
const clamp=n=>Math.max(0,Math.min(1,n));
const runtimeUrl=new URL('../../../../assets/vendor/gsap/gsap.min.js',import.meta.url).href;
export function loadRuntime(win,url=runtimeUrl){
 if(win.gsap?.version==='3.15.1')return Promise.resolve(win.gsap);
 if(runtimes.has(win))return runtimes.get(win);
 const promise=new Promise((resolve,reject)=>{
  const script=win.document.createElement('script');script.src=url;script.async=true;
  script.onload=()=>win.gsap?.version==='3.15.1'?resolve(win.gsap):reject(new Error('Expected the pinned GSAP runtime'));
  script.onerror=()=>{script.remove();reject(new Error('Local motion runtime unavailable'));};
  win.document.head.append(script);
 }).catch(error=>{runtimes.delete(win);throw error;});
 runtimes.set(win,promise);return promise;
}
export function mountScene(root,{load=()=>loadRuntime(root.ownerDocument.defaultView),restore=true,peelAngle=-72,peelDistance=115,cardSpacing=10,heroSpread=26}={}){
 const doc=root.ownerDocument,win=doc.defaultView,abort=new win.AbortController(),signal=abort.signal;
 const kind=root.dataset.scene,viewport=root.querySelector('.cg-viewport'),status=root.querySelector('[data-scene-status]');
 if(!['gallery','stack','hero'].includes(kind)||!viewport)throw new TypeError('Expected an authored Codegrid trial scene');
 const media=win.matchMedia('(prefers-reduced-motion:reduce)'),output=root.querySelector('[data-position]'),phase=root.querySelector('[data-phase]');
 const names=[...root.querySelectorAll('.cg-outline h2')].map(e=>e.textContent);
 const bound=(value,min,max,fallback)=>Number.isFinite(+value)?Math.max(min,Math.min(max,+value)):fallback;
 const angle=bound(peelAngle,-85,-30,-72),distance=bound(peelDistance,80,140,115),spacing=bound(cardSpacing,0,16,10),spread=bound(heroSpread,18,30,26);
 let timeline=null,context=null,frame=0,dead=false,version=0,engine=null;
 const reduced=()=>media.matches||doc.documentElement.classList.contains('motion-off');
 root.dataset.mode='static';root.dataset.renderCount='0';root.dataset.engine='static';
 const on=(node,type,fn,options={})=>node.addEventListener(type,fn,{...options,signal});
 const key='motion-atlas:codegrid-review:'+kind;
 function remember(){if(!restore)return;try{win.sessionStorage.setItem(key,JSON.stringify({mode:root.dataset.mode,top:viewport.scrollTop}));}catch{}}
 function clear(){timeline?.kill();timeline=null;context?.revert();context=null;for(const el of root.querySelectorAll('.cg-project-art'))el.style.removeProperty('--cg-inset');}
 function controls(){
  for(const button of root.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===root.dataset.mode));
  for(const button of root.querySelectorAll('[data-checkpoint]'))button.disabled=root.dataset.mode!=='explore';
 }
 function build(){
  clear();if(kind==='gallery')return;
  context=engine.context(()=>{
   timeline=engine.timeline({paused:true,defaults:{ease:'none'}});
   if(kind==='stack'){
    const cards=[...root.querySelectorAll('.cg-story-card')];
    cards.forEach((card,i)=>engine.set(card,{y:i*spacing,scale:1-i*.025,rotationY:0,rotationZ:0,xPercent:0,opacity:1,transformPerspective:1200,force3D:true}));
    cards.slice(0,-1).forEach((card,i)=>{
     timeline.to(card,{rotationY:angle,rotationZ:-9,xPercent:distance,y:-60,duration:.86},i+.1);
     timeline.to(card,{opacity:0,duration:.04},i+.96);
     timeline.to(cards.slice(i+1),{y:j=>j*spacing,scale:j=>1-j*.025,duration:.8},i+.1);
    });
   }else{
    const first=root.querySelector('.cg-hero-first'),second=root.querySelector('.cg-hero-second');
    const words=[...root.querySelectorAll('.cg-hero-word')],line=root.querySelector('.cg-hero-line');
    engine.set(first,{xPercent:0,y:0,scale:.86,rotation:0,opacity:1});engine.set(second,{xPercent:25,y:50,scale:.75,rotation:8,opacity:0});
    engine.set(words,{opacity:0,y:12});engine.set(words[0],{opacity:1,y:0});engine.set(line,{scaleX:0});
    timeline.to(first,{xPercent:-spread,scale:.62,rotation:-7,duration:1},0)
     .to(second,{xPercent:spread,y:0,scale:.62,rotation:7,opacity:1,duration:1},0)
     .to(words[0],{opacity:0,y:-16,duration:.35},.25)
     .to(words[1],{opacity:1,y:0,duration:.35},.6)
     .to(line,{scaleX:1,duration:.6},.4)
     .to(first,{xPercent:-(spread+4),y:-15,scale:.55,rotation:0,duration:1},1)
     .to(second,{xPercent:spread+4,y:-15,scale:.55,rotation:0,duration:1},1)
     .to(words[1],{opacity:0,y:-16,duration:.35},1.15)
     .to(words[2],{opacity:1,y:0,duration:.4},1.55);
   }
  },root);
 }
 function render(){
  frame=0;if(dead)return;
  const max=Math.max(1,viewport.scrollHeight-viewport.clientHeight),p=clamp(viewport.scrollTop/max);
  output.value=Math.round(p*100)+'%';
  if(root.dataset.mode!=='explore'||reduced()||doc.hidden||root.dataset.visible==='false')return;
  root.dataset.renderCount=String(+root.dataset.renderCount+1);
  if(kind==='gallery'){
   const vr=viewport.getBoundingClientRect();
   const updates=[...root.querySelectorAll('.cg-project')].map(card=>{const r=card.getBoundingClientRect();return [card.querySelector('.cg-project-art'),clamp(1-Math.abs((r.top+r.height/2)-(vr.top+vr.height/2))/(vr.height*.85))];});
   for(const [art,near] of updates)art.style.setProperty('--cg-inset',((1-near)*19).toFixed(2)+'%');
   phase.textContent='Illustrations expand · links stay still';
  }else{
   timeline?.progress(p);phase.textContent=names[Math.min(names.length-1,Math.floor(p*(names.length-1)+.001))];
  }
 }
 function refresh(){if(!dead&&!frame)frame=win.requestAnimationFrame(render);}
 function measure(){root.style.setProperty('--cg-height',viewport.clientHeight+'px');refresh();}
 async function setMode(mode,{top}={}){
  if(dead||!['static','explore'].includes(mode))return;
  const token=++version;
  if(mode==='explore'&&reduced())mode='static';
  const previousTop=viewport.scrollTop;
  if(mode==='explore'&&kind!=='gallery'&&!engine){
   status.textContent='Loading the local motion runtime…';
   try{engine=await load();}catch{if(token===version&&!dead){status.textContent='Motion could not load. The complete still view remains available.';}return;}
   if(dead||token!==version)return;
  }
  clear();root.dataset.mode=mode;root.dataset.engine=mode==='static'?'static':kind==='gallery'?'native-events':'gsap-3.15.1';controls();measure();
  if(mode==='explore')build();
  viewport.scrollTop=top??(mode==='static'?0:previousTop);
  if(viewport.contains(doc.activeElement))doc.activeElement.scrollIntoView({block:'nearest',inline:'nearest'});
  status.textContent=reduced()?'Reduced motion · complete still view.':mode==='static'?'Complete still view. Motion is optional.':'Scroll inside the frame, or choose a checkpoint. Scroll back to reverse.';
  refresh();remember();
 }
 function checkpoint(value){
  if(root.dataset.mode!=='explore'||dead)return;
  const p=clamp(Number(value)||0);
  viewport.scrollTo({top:(viewport.scrollHeight-viewport.clientHeight)*p,behavior:'instant'});refresh();
 }
 on(root,'click',e=>{const view=e.target.closest('[data-view]'),point=e.target.closest('[data-checkpoint]');if(view&&root.contains(view))setMode(view.dataset.view);if(point&&root.contains(point))checkpoint(point.dataset.checkpoint);});
 on(viewport,'scroll',()=>{refresh();},{passive:true});
 on(media,'change',()=>{if(reduced())setMode('static');else refresh();});
 const globalMotion=new win.MutationObserver(()=>{if(reduced())setMode('static');});globalMotion.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
 const resize=win.ResizeObserver?new win.ResizeObserver(measure):null;resize?.observe(viewport);if(!resize)on(win,'resize',measure);
 const observer=win.IntersectionObserver?new win.IntersectionObserver(entries=>{root.dataset.visible=String(entries[0].isIntersecting);if(entries[0].isIntersecting)refresh();}):null;observer?.observe(root);
 on(doc,'visibilitychange',()=>{if(!doc.hidden)refresh();});
 on(win,'pagehide',remember);
 for(const button of root.querySelectorAll('[data-view]'))button.disabled=false;
 measure();controls();
 if(restore){try{const saved=JSON.parse(win.sessionStorage.getItem(key));if(saved&&!win.location.hash)setMode(saved.mode,{top:saved.top});}catch{}}
 // Explicit fragment navigation belongs to the browser, never a scroll proxy.
 return {root,setMode,checkpoint,refresh,destroy(){if(dead)return;remember();dead=true;version++;abort.abort();win.cancelAnimationFrame(frame);resize?.disconnect();observer?.disconnect();globalMotion.disconnect();clear();root.dataset.mode='static';root.dataset.engine='static';controls();for(const button of root.querySelectorAll('[data-view]'))button.disabled=true;}};
}
