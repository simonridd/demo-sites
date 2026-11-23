import {mountScrollObject} from './scroll-object.mjs';
import {mountPracticalEffect,practicalKinds} from './practical.mjs';
// No auto-mount, globals, framework or visitor dependencies. One controller owns
// one component. Copy this directory; keep the MIT comparison notice alongside it.
const kinds = new Set(['pattern','marquee','voice-orb','pulse','stagger','pixel','shimmer','reveal','refraction','comparison','aurora-text']);
const clamp = (value,min,max,fallback) => Number.isFinite(Number(value)) ? Math.max(min,Math.min(max,Number(value))) : fallback;
let instanceSequence=0;
export function mountEffect(root,initial={}) {
 if(root&&practicalKinds.includes(root.dataset.atlas))return mountPracticalEffect(root,initial);
 if(!root || !kinds.has(root.dataset.atlas)) throw new TypeError('Expected a supported [data-atlas] element');
 const win=root.ownerDocument.defaultView,doc=root.ownerDocument;
 const abort=new win.AbortController(),signal=abort.signal;
 const media=win.matchMedia('(prefers-reduced-motion: reduce)');
 const kind=root.dataset.atlas;
 let destroyed=false,pending=0,observer=null,resize=null,onceObserver=null,frame=0;
 let duration=4,desired=false,paused=false,seen=false,loadVersion=0,onceAnimation=null;
 const q=selector=>root.querySelector(selector),all=selector=>[...root.querySelectorAll(selector)];
 const scrollObject=kind==='reveal'?mountScrollObject(root,{signal,isReduced:()=>media.matches||doc.documentElement.classList.contains('motion-off')}):null;
 const on=(node,event,fn,options={})=>node.addEventListener(event,fn,{...options,signal});
 const announce=text=>{const el=q('.ma-state span')||q('.ma-state');if(el)el.textContent=text;};
 const setControl=(name,value)=>{const input=q(`[data-option="${name}"]`);if(input)input.value=String(value);};
 // Regenerate SVG fragment identities per mount, so multiple copies can coexist.
 const idMap=new Map(all('svg [id]').map(el=>[el.id,`ma-${++instanceSequence}`]));
 for(const el of all('svg,svg *'))for(const attr of [...el.attributes]){
  let value=attr.value;
  for(const [old,next] of idMap){
   if(attr.name==='id'&&value===old)value=next;
   else value=value.replaceAll(`url(#${old})`,`url(#${next})`).replaceAll(`href="#${old}"`,`href="#${next}"`);
   if((attr.name==='href'||attr.name==='xlink:href')&&value===`#${old}`)value=`#${next}`;
  }
  if(value!==attr.value)el.setAttribute(attr.name,value);
 }
 function sync(){
  const reduced=media.matches||doc.documentElement.classList.contains('motion-off');
  root.dataset.reduced=String(reduced);
  root.dataset.running=String(desired&&!reduced&&root.dataset.mode!=='static');
  root.dataset.suspended=String(paused||doc.hidden||root.dataset.visible==='false');
  scrollObject?.refresh();
 }
 function stop(){desired=false;paused=false;root.dataset.complete='false';sync();}
 function pause(){paused=!paused;sync();q('[data-atlas-action="pause"]')?.setAttribute('aria-pressed',String(paused));}
 function play(){
  if(destroyed)return;
  if(paused&&desired){paused=false;sync();q('[data-atlas-action="pause"]')?.setAttribute('aria-pressed','false');return;}
  paused=false;
  if(kind==='shimmer'){load();return;}
  if(kind==='comparison'){setComparison(50);return;}
  if(kind==='reveal'){scrollObject.checkpoint(.5);return;}
  if(kind==='refraction')return;
  if((kind==='voice-orb'||kind==='pulse')&&['idle','offline',undefined].includes(root.dataset.state))return;
  desired=false;root.dataset.complete='false';sync();void root.offsetWidth;
  desired=true;sync();q('[data-atlas-action="pause"]')?.setAttribute('aria-pressed','false');

 }
 function fillMarquee(){
  const viewport=q('.ma-marquee');if(!viewport)return;
  const tiles=all('.ma-tile'),first=tiles[0];
  const text=({title:'IDEAS · CRAFT · STORIES · ',projects:'WEBSITES · PRESENTATIONS · DEMOS · ',announcement:'A NEW CHAPTER IN THE SHOWCASE · '})[root.dataset.use||'title'];
  first.replaceChildren();
  for(let n=0;n<40;n++){
   const span=doc.createElement('span');span.textContent=text;first.append(span);
   if(first.getBoundingClientRect().width>=viewport.getBoundingClientRect().width+1)break;
  }
  tiles[1].innerHTML=first.innerHTML;
  root.style.setProperty('--ma-distance',first.getBoundingClientRect().width+'px');
  q('.ma-strip-label').textContent=text.replace(/ · $/,'');
 }
 function indexChildren(){
  all('.ma-list li').forEach((el,i)=>el.style.setProperty('--i',String(root.dataset.direction==='reverse'?all('.ma-list li').length-1-i:i)));
 }
 function setComparison(value){
  const input=q('[data-comparison]');if(!input)return;
  const position=clamp(value,0,100,50);
  input.value=String(position);input.setAttribute('aria-valuetext',position+' percent after');
  root.style.setProperty('--ma-position',position+'%');
 }
 function cancelLoad(status='Cancelled'){
  win.clearTimeout(pending);pending=0;loadVersion++;
  if(kind==='shimmer'){
   q('.ma-load-region').setAttribute('aria-busy','false');root.dataset.load='idle';desired=false;sync();
   q('.ma-load-status').textContent='Demo only · '+status;
   q('.ma-load-content').textContent='Ready to load a fictional example.';
  }
 }
 function setLoading(status,content=''){
  if(kind!=='shimmer')throw new TypeError('setLoading belongs to shimmer');
  if(!['pending','loaded','empty','error','idle'].includes(status))throw new TypeError('Unsupported loading state');
  cancelLoad('idle');root.dataset.load=status;
  q('.ma-load-region').setAttribute('aria-busy',String(status==='pending'));
  q('.ma-load-status').textContent=({pending:'Loading content',loaded:'Content loaded',empty:'No results',error:'Could not load content',idle:'Ready'})[status];
  q('.ma-load-content').textContent=String(content);
  if(status==='loaded')q('.ma-result-title').textContent=String(content||'Content loaded');
  desired=status==='pending';sync();
 }
 function load(){
  if(destroyed)return;
  cancelLoad('loading');const version=loadVersion;
  root.dataset.load='pending';q('.ma-load-region').setAttribute('aria-busy','true');
  q('.ma-load-status').textContent='Demo only · loading fictional content';q('.ma-load-content').textContent='';
  desired=true;sync();
  pending=win.setTimeout(()=>{
   if(version!==loadVersion||destroyed)return;
   const result=q('[data-option="outcome"]').value;
   root.dataset.load=result;q('.ma-load-region').setAttribute('aria-busy','false');desired=false;pending=0;sync();
   q('.ma-result-title').textContent='Atlas project';
   q('.ma-load-content').textContent=({loaded:'A fictional project, ready to explore.',empty:'No projects found.',error:'Could not load this fictional example. Retry is available.'})[result];
   q('.ma-load-status').textContent='Demo only · '+({loaded:'loaded',empty:'no results',error:'load failed'})[result];
  },800);
 }
 function onceReveal(){
  const target=q('.ma-scroll-object');if(!target||root.dataset.scrollMode!=='once'||seen||media.matches||doc.documentElement.classList.contains('motion-off'))return;
  seen=true;
  if(!target.contains(doc.activeElement)&&typeof target.animate==='function'){
   onceAnimation=target.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'none'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
  }
 }
 function observeReveal(){
  onceObserver?.disconnect();onceObserver=null;seen=false;
  onceAnimation?.cancel();
  if(kind!=='reveal'||root.dataset.scrollMode!=='once'||media.matches||doc.documentElement.classList.contains('motion-off')||!win.IntersectionObserver)return;
  onceObserver=new win.IntersectionObserver(entries=>{
   if(entries.some(e=>e.isIntersecting)){onceReveal();onceObserver.disconnect();}
  },{root:q('.ma-scroll'),threshold:.12});
  onceObserver.observe(q('.ma-scroll-object'));
 }
 function setState(value,{label=value,simulated=true}={}){
  const allowed=kind==='voice-orb'?['idle','listening','thinking','speaking']:['idle','active','busy','offline'];
  if(!allowed.includes(value))throw new TypeError('Unsupported state '+value);
  stop();root.dataset.state=value;setControl('state',value);announce((simulated?'Simulated · ':'')+String(label));
  // Integration owners can replace the caption and status text with real state.
  if(!['idle','offline'].includes(value))play();
 }
 function update(name,value){
  if(destroyed)return;
  setControl(name,value);
  switch(name){
   case 'state':setState(value);return;
   case 'mode':if(!['once','loop','static'].includes(value))return;stop();root.dataset.mode=value;return;
   case 'duration':duration=clamp(value,.4,30,4);root.style.setProperty('--ma-duration',duration+'s');if(desired)play();return;
   case 'glowRadius':root.style.setProperty('--ma-glow-radius',clamp(value,0,24,12)+'px');return;
   case 'glowIntensity':root.style.setProperty('--ma-glow-intensity',clamp(value,0,1,.5));return;
   case 'textScale':root.style.setProperty('--ma-text-scale',clamp(value,.7,1.4,1));return;
   case 'tile':root.style.setProperty('--ma-tile',clamp(value,16,64,32)+'px');return;
   case 'size':root.style.setProperty('--ma-size',clamp(value,32,200,64)+'px');return;
   case 'gap':root.style.setProperty('--ma-gap',clamp(value,0,64,24)+'px');fillMarquee();return;
   case 'level':root.style.setProperty('--ma-level',clamp(value,0,1,.35));return;
   case 'halo':root.style.setProperty('--ma-halo',clamp(value,4,30,14)+'px');return;
   case 'amplitude':root.style.setProperty('--ma-amplitude',clamp(value,.1,1,.8));return;
   case 'delay':root.style.setProperty('--ma-delay',clamp(value,0,250,80)+'ms');return;
   case 'travel':root.style.setProperty('--ma-travel',clamp(value,0,180,120)+'px');scrollObject?.refresh();return;
   case 'distortion':q('feDisplacementMap')?.setAttribute('scale',String(clamp(value,0,70,36)));return;
   case 'count':{
    const list=q('.ma-list');if(!list)return;
    const count=clamp(value,3,12,4);const labels=['Understand the need','Find the right help','Choose the next step','Keep the outcome clear'];
    list.replaceChildren(...Array.from({length:count},(_,i)=>{const li=doc.createElement('li');li.textContent=labels[i%4];return li;}));indexChildren();return;
   }
   case 'position':setComparison(value);return;
   case 'shape':root.dataset.shape=value;q('.ma-loading-layout')?.setAttribute('data-shape',value);return;
   case 'outcome':return;
   case 'compare':
    root.dataset.compare=value;
    q('.ma-compare-description').textContent=value==='dom'?'Same layout in wireframe and finished CSS. Both copies are illustrative and inert.':'Reveal the same landscape before and after. Both images remain available in side-by-side mode.';
    return;
   case 'scrollMode':
    if(!['scrub','once','entry','exit','static'].includes(value))return;
    root.dataset.scrollMode=value;observeReveal();scrollObject?.refresh();return;
   case 'objectMotion':
    if(!['combined','translate','rotate','scale'].includes(value))return;
    root.dataset.objectMotion=value;scrollObject?.refresh();return;
   default:
    if(!['pattern','direction','intensity','use','index','variant','art','treatment','palette','optics'].includes(name))return;
    root.dataset[name]=String(value);
    if(name==='pattern')q('.ma-pattern')?.setAttribute('data-pattern',value);
    if(name==='use')fillMarquee();
    if(name==='direction')indexChildren();
  }
 }
 const actionHandlers={play,pause,stop,scrollStart:()=>scrollObject?.checkpoint(0),scrollMiddle:()=>scrollObject?.checkpoint(.5),scrollEnd:()=>scrollObject?.checkpoint(1),load,retry:load,cancel:()=>cancelLoad(),before:()=>setComparison(0),after:()=>setComparison(100),reset:()=>setComparison(50),
  theme:()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';q('[data-atlas-action="theme"]').setAttribute('aria-pressed',String(root.dataset.theme==='light'));},
  side:()=>{const side=root.dataset.side!=='true';root.dataset.side=String(side);q('[data-atlas-action="side"]').setAttribute('aria-pressed',String(side));},
  glow:()=>{const glow=root.dataset.glow!=='true';root.dataset.glow=String(glow);q('[data-atlas-action="glow"]').setAttribute('aria-pressed',String(glow));}};
 on(root,'click',event=>{const btn=event.target.closest('[data-atlas-action]');if(btn&&root.contains(btn))actionHandlers[btn.dataset.atlasAction]?.();});
 on(root,'animationend',event=>{
  if(root.dataset.mode==='loop'||!desired)return;
  if((kind==='pixel'&&event.target.matches('.ma-sprite,.ma-pixel'))||kind==='pattern'||kind==='marquee'||kind==='aurora-text'||kind==='pulse'||(kind==='stagger'&&(event.target===q('.ma-list')?.lastElementChild||event.target.matches('.ma-wave i')))){desired=false;root.dataset.complete='true';sync();}
 });
 on(root,'input',event=>{
  if(event.target.matches('[data-comparison]'))setComparison(event.target.value);
  else if(event.target.matches('input[data-option]'))update(event.target.dataset.option,event.target.value);
 });
 on(root,'change',event=>{if(event.target.matches('select[data-option]'))update(event.target.dataset.option,event.target.value);});
 // Native range keyboard semantics + full-region horizontal touch/pointer drag.
 const surface=q('.ma-compare');let dragging=null;
 if(surface){
  const input=q('[data-comparison]');input.disabled=false;
  const move=event=>{const r=surface.getBoundingClientRect();setComparison((event.clientX-r.left)/r.width*100);};
  on(surface,'pointerdown',event=>{
   if(root.dataset.side==='true'||event.button!==0)return;
   event.preventDefault();input.focus({preventScroll:true});dragging=event.pointerId;surface.setPointerCapture(event.pointerId);move(event);
  });
  on(surface,'pointermove',event=>{if(dragging===event.pointerId)move(event);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])on(surface,type,()=>{dragging=null;});
  on(input,'keydown',event=>{
   if(['PageUp','PageDown'].includes(event.key)){event.preventDefault();setComparison(Number(input.value)+(event.key==='PageUp'?10:-10));}
   // Keep presentation-level navigation from consuming range keys.
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key))event.stopPropagation();
  });
  root.dataset.enhanced='true';
 }
 for(const input of all('[data-option]'))update(input.dataset.option,input.value);
 let siblings=null;
 if(kind==='stagger'){indexChildren();siblings=new win.MutationObserver(indexChildren);siblings.observe(q('.ma-list'),{childList:true});}
 if(kind==='marquee'){
  fillMarquee();if(win.ResizeObserver){resize=new win.ResizeObserver(()=>{win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(fillMarquee);});resize.observe(q('.ma-marquee'));}
  doc.fonts?.ready.then(()=>{if(!destroyed)fillMarquee();});
 }
 if(kind==='reveal')observeReveal();
 if(win.IntersectionObserver){observer=new win.IntersectionObserver(entries=>{root.dataset.visible=String(entries[0].isIntersecting);sync();},{threshold:.01});observer.observe(root);}
 on(media,'change',()=>{sync();onceAnimation?.cancel();observeReveal();});
 on(doc,'visibilitychange',()=>{sync();if(doc.hidden)onceAnimation?.cancel();});
 on(root,'focusin',()=>onceAnimation?.cancel());
 const globalMotion=new win.MutationObserver(sync);globalMotion.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
 for(const [name,value] of Object.entries(initial))update(name,value);
 sync();
 return {
  root,play,pause,stop,setState,update,setComparison,setLoading,
  destroy(){
   if(destroyed)return;stop();cancelLoad();destroyed=true;abort.abort();observer?.disconnect();resize?.disconnect();onceObserver?.disconnect();globalMotion.disconnect();siblings?.disconnect();win.cancelAnimationFrame(frame);
   onceAnimation?.cancel();scrollObject?.destroy();
   root.dataset.enhanced='false';q('[data-comparison]')?.setAttribute('disabled','');
  }
 };
}
export function mountEffects(scope=document){
 const controllers=[...scope.querySelectorAll('[data-atlas]')].map(root=>mountEffect(root));
 return {controllers,destroy:()=>controllers.forEach(c=>c.destroy())};
}
