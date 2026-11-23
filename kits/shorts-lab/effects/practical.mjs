import {practicalKinds} from './practical-kinds.mjs';
export {practicalKinds};
const bounded=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
export function mountPracticalEffect(root,initial={}){
 const win=root.ownerDocument.defaultView,doc=root.ownerDocument,kind=root.dataset.atlas;
 const events=new win.AbortController(),signal=events.signal;
 const media=win.matchMedia('(prefers-reduced-motion: reduce)');
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
 const on=(el,event,fn,options={})=>el?.addEventListener(event,fn,{...options,signal});
 let desired=false,paused=false,destroyed=false,frame=0,scrollFrame=0,resizeFrame=0,resize=null,observer=null,start=0,end=24800,duration=2,gutterBaseline=null;
 const format=n=>Math.round(n).toLocaleString('en-GB');
 const reduced=()=>media.matches||doc.documentElement.classList.contains('motion-off')||root.dataset.preference==='reduce';
 function settleCount(){
  win.cancelAnimationFrame(frame);frame=0;
  if(kind==='count-up'){
   q('.ma-number-js').textContent=format(end);root.style.setProperty('--ma-number',end);
  }
 }
 function sync(){
  root.dataset.reduced=String(reduced());
  root.dataset.running=String(desired&&!reduced()&&root.dataset.mode!=='static');
  root.dataset.suspended=String(paused||root.dataset.preference==='paused'||doc.hidden||root.dataset.visible==='false');
  if(reduced()||doc.hidden||root.dataset.visible==='false')settleCount();
  if(kind==='reduced-motion')q('.ma-motion-state').textContent=`System: ${media.matches?'reduced motion':'no reduction requested'} · local: ${root.dataset.preference||'normal'}`;
 }
 function stop(){desired=false;paused=false;settleCount();sync();}
 function pause(){paused=!paused;if(kind==='count-up'&&root.dataset.method==='js'){stop();return;}sync();q('[data-atlas-action="pause"]')?.setAttribute('aria-pressed',String(paused));}
 function count(){
  settleCount();
  q('.ma-number').setAttribute('aria-label',format(end)+' illustrative result');q('.ma-number-note b').textContent=format(end);
  if(reduced()||root.dataset.method==='static')return;
  if(root.dataset.method==='css')return;
  q('.ma-number-js').textContent=format(start);let begun;
  const tick=now=>{
   if(destroyed||reduced()||doc.hidden||root.dataset.visible==='false'){settleCount();return;}
   begun??=now;const t=Math.min((now-begun)/(duration*1000),1),ease=1-(1-t)**3;
   q('.ma-number-js').textContent=format(start+(end-start)*ease);
   if(t<1)frame=win.requestAnimationFrame(tick);else{desired=false;settleCount();sync();}
  };
  frame=win.requestAnimationFrame(tick);
 }
 function play(){
  if(destroyed)return;
  if(kind==='palette'){update('space',root.dataset.space==='srgb'?'oklch':'srgb');return;}
  if(kind==='focus-within'){all('.ma-focus-panels input').find(el=>el.offsetParent!==null)?.focus();return;}
  if(kind==='layout-shift-2'){handlers.overflow();return;}
  if(kind==='progress'){if(root.dataset.variant==='scroll')q('.ma-reading').scrollTop=220;else handlers['sample-value']();return;}
  if(kind==='mobile'||kind==='formats')return;
  if(paused&&desired){paused=false;sync();return;}
  stop();
  if(kind==='count-up'&&root.dataset.method==='static')return;
  desired=true;sync();void root.offsetWidth;
  if(kind==='count-up')count();
 }
 function measureType(){
  if(kind!=='typewriter')return;
  const text=q('.ma-type-line span'),style=win.getComputedStyle(text),canvas=doc.createElement('canvas'),ctx=canvas.getContext('2d');
  ctx.font=style.font;const width=ctx.measureText(text.textContent).width;
  const segments=win.Intl?.Segmenter?[...new win.Intl.Segmenter('en',{granularity:'grapheme'}).segment(text.textContent)]:[...text.textContent];
  root.style.setProperty('--ma-characters',segments.length);root.style.setProperty('--ma-type-width',width+'px');
  root.dataset.typeWrap=String(width>q('.ma-type-frame').clientWidth-12);
  q('.ma-type-status').textContent=root.dataset.typeWrap==='true'?'Text wraps at this size; the complete static heading is shown.':`${segments.length} graphemes · full text is available immediately.`;
 }
 function progress(){
  if(kind!=='progress')return;
  const scroller=q('.ma-reading'),max=scroller.scrollHeight-scroller.clientHeight;
  const ratio=max>0?Math.max(0,Math.min(1,scroller.scrollTop/max)):0;
  root.style.setProperty('--ma-scroll-progress',ratio);
  root.dataset.progressNative=String(root.dataset.method!=='fallback'&&win.CSS.supports('animation-timeline: scroll()')&&!reduced());
  q('.ma-progress-note').textContent=root.dataset.variant==='scroll'?`${Math.round(ratio*100)}% scroll position · not completion`:'Illustrative known-value sample.';
 }
 function gutters(){
  if(kind!=='layout-shift-2')return;
  const values=all('.ma-gutter-panel').map(el=>{
   const style=win.getComputedStyle(el),border=parseFloat(style.borderLeftWidth)+parseFloat(style.borderRightWidth);
   return {mode:el.dataset.gutter,width:el.clientWidth,gutter:Math.max(0,el.offsetWidth-el.clientWidth-border),center:el.querySelector('.ma-gutter-copy').getBoundingClientRect().x-el.getBoundingClientRect().x};
  });
  root.dataset.measurements=JSON.stringify(values);
  const signature=[root.clientWidth,root.dataset.scrollbars,root.dataset.overflow,root.dataset.direction].join(':');
  if(root.dataset.long!=='true')gutterBaseline={signature,values};
  const comparable=root.dataset.long==='true'&&gutterBaseline?.signature===signature;
  const stable=comparable?values.slice(1).every((v,i)=>v.width===gutterBaseline.values[i+1].width):null;
  root.dataset.stableObservation=stable===null?'unmeasured':String(stable);
  q('.ma-gutter-measure').textContent=values.map(v=>`${v.mode}: ${v.width}px client / ${v.gutter}px native gutter`).join(' · ')+(values.every(v=>v.gutter===0)?' · Overlay/no classic gutter observed.':'')+(stable===false?' · This engine did not reserve a stable gutter in the classic-width CSS test; qualify its native scrollbar policy before reuse.':'');
 }
 function tokens(){
  if(kind!=='palette')return;
  const brand=q('[data-option="brand"]').value,other=q('[data-option="other"]').value,space=root.dataset.space||'srgb',mix=Number(q('[data-option="mix"]').value),surface=root.dataset.surface==='dark'?'#14232b':'#f7faf8';
  root.style.setProperty('--ma-brand',brand);root.style.setProperty('--ma-other',root.dataset.alpha==='transparent'?'transparent':other);
  root.style.setProperty('--ma-space',space);root.style.setProperty('--ma-mix',mix+'%');root.style.setProperty('--ma-token-surface',surface);root.style.setProperty('--ma-token-ink',root.dataset.surface==='dark'?'#f2faf5':'#16352d');
  const ctx=doc.createElement('canvas').getContext('2d',{willReadFrequently:true});
  const rgba=layers=>{ctx.clearRect(0,0,1,1);for(const color of layers){ctx.fillStyle=color;ctx.fillRect(0,0,1,1);}return [...ctx.getImageData(0,0,1,1).data].slice(0,3);};
  const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const pairs=[['Card','.ma-token-card'],['Button','.ma-token-button'],['Field','.ma-token-card input'],['Badge','.ma-token-badge']];
  const card=win.getComputedStyle(q('.ma-token-card')).backgroundColor;
  const data=pairs.map(([label,selector])=>{
   const style=win.getComputedStyle(q(selector));const bg=rgba([surface,card,style.backgroundColor]),fg=rgba([surface,card,style.backgroundColor,style.color]);
   const a=lum(bg),b=lum(fg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   return {label,ratio:Math.round(ratio*100)/100,pass:ratio>=4.5};
  });
  root.dataset.contrast=JSON.stringify(data);
  q('.ma-contrast tbody').innerHTML=data.map(x=>`<tr><th>${x.label}</th><td>${x.ratio.toFixed(2)}:1</td><td>${x.pass?'Pass':'Fail — adjust token'}</td></tr>`).join('');
  q('.ma-token-code').value=`--brand: ${brand};\n--surface: ${surface};\n--brand-subtle: color-mix(in ${space}, var(--brand) 12%, var(--surface));\n--brand-border: color-mix(in ${space}, var(--brand) 35%, var(--surface));\n--brand-badge: color-mix(in ${space}, var(--brand) 22%, var(--surface));\nbackground: color-mix(in ${space}, ${brand} ${mix}%, ${root.dataset.alpha==='transparent'?'transparent':other});\n/* Check actual composite text/background contrast. */`;
 }
 function viewport(){
  if(kind!=='mobile')return;
  const url=new win.URL(q('.ma-viewport-frame').getAttribute('src'),doc.baseURI);
  url.searchParams.set('unit',root.dataset.unit||'dvh');url.searchParams.set('sizing',root.dataset.sizing||'fixed');
  q('.ma-viewport-frame').src=url.href;q('.ma-viewport-link').href=url.href;
 }
 function update(name,value){
  if(destroyed)return;
  const input=q(`[data-option="${name}"]`);if(input)input.value=String(value);
  const numeric={duration:[.4,20,2,'s'],width:[1,8,2,'px'],radius:[4,48,20,'px'],diameter:[16,48,40,'px'],spacing:[4,20,10,'px'],blur:[2,22,8,'px'],contrast:[4,40,24,''],travel:[4,22,14,'px'],focal:[10,90,50,'%']};
  if(name in numeric){const [min,max,fallback,unit]=numeric[name],v=bounded(value,min,max,fallback);root.style.setProperty('--ma-'+name,v+unit);if(name==='duration')duration=v;return;}
  if(name==='target'){
   [start,end]=({large:[0,24800],small:[0,100],descending:[75,20],negative:[-20,50]})[value]||[0,24800];
   root.style.setProperty('--ma-start',start);root.style.setProperty('--ma-end',end);stop();q('.ma-number').setAttribute('aria-label',format(end)+' illustrative result');q('.ma-number-note b').textContent=format(end);return;
  }
  if(name==='text'){
   q('.ma-type-line span').textContent=({original:'A moment of impact.',chapter:'Next chapter',terminal:'Ready to explore.',unicode:'Ideas ✨ evolve'})[value]||'A moment of impact.';stop();measureType();return;
  }
  if(['brand','other','mix'].includes(name)){tokens();return;}
  if(!['mode','variant','method','shape','easing','ratio','cursor','trigger','filter','preference','space','surface','alpha','scrollbars','direction','overflow','unit','sizing','orientation'].includes(name))return;
  root.dataset[name]=String(value);
  if(['variant','method','mode'].includes(name))stop();
  if(kind==='count-up'){root.dataset.cssCounter=String(typeof win.CSS.registerProperty==='function');settleCount();}
  if(kind==='progress')progress();
  if(kind==='palette')tokens();
  if(kind==='layout-shift-2'){
   for(const el of all('.ma-gutter-panel'))el.style.overflowY=root.dataset.overflow||'auto';
   q('.ma-gutters').dir=root.dataset.direction||'ltr';gutters();
  }
  if(kind==='mobile'&&['unit','sizing'].includes(name))viewport();
  sync();
 }
 const handlers={play,pause,stop,
  theme(){root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';q('[data-atlas-action="theme"]').setAttribute('aria-pressed',String(root.dataset.theme==='light'));},
  'select-feature'(){const b=q('.ma-border-action');b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));},
  'sample-value'(){const label=q('[data-sample-value]'),value=label.textContent==='45%'?80:45;label.textContent=value+'%';q('progress').value=value;},
  clear(){q('.ma-focus-search input').value='';q('.ma-focus-search input').focus();},
  snippet(){q('.ma-token-code').focus();q('.ma-token-code').select();},
  overflow(){root.dataset.long=String(root.dataset.long!=='true');q('[data-atlas-action="overflow"]').setAttribute('aria-pressed',root.dataset.long);gutters();},
  'swap-media'(){q('.media-reserve').classList.toggle('is-alt');}
 };
 on(root,'click',event=>{const b=event.target.closest('[data-atlas-action]');if(b&&root.contains(b))handlers[b.dataset.atlasAction]?.();});
 on(root,'input',event=>{if(event.target.matches('input[data-option]'))update(event.target.dataset.option,event.target.value);});
 on(root,'change',event=>{if(event.target.matches('select[data-option]'))update(event.target.dataset.option,event.target.value);});
 on(root,'animationend',event=>{
  if(root.dataset.mode==='loop')return;
  if(['ma-wipe','ma-wipe-circle','ma-wipe-polygon','ma-wipe-fade','ma-wipe-diamond','ma-audit-drift','ma-intro-type','ma-numeric','ma-typing','ma-border-angle','ma-border-turn'].includes(event.animationName)||(event.animationName==='ma-dot-dance'&&event.target.style.getPropertyValue('--i')==='0'))stop();
 });
 on(q('.ma-border-action'),'focus',()=>{if(root.dataset.trigger==='focus')play();});
 on(q('.ma-border-card'),'pointerenter',()=>{if(root.dataset.trigger==='focus')play();});
 on(q('.ma-reading'),'scroll',()=>{if(scrollFrame)return;scrollFrame=win.requestAnimationFrame(()=>{scrollFrame=0;progress();});},{passive:true});
 if(win.ResizeObserver){resize=new win.ResizeObserver(()=>{if(!resizeFrame)resizeFrame=win.requestAnimationFrame(()=>{resizeFrame=0;measureType();gutters();progress();});});resize.observe(root);if(q('.ma-reading article'))resize.observe(q('.ma-reading article'));for(const panel of all('.ma-gutter-panel'))resize.observe(panel);}
 if(win.IntersectionObserver){observer=new win.IntersectionObserver(entries=>{root.dataset.visible=String(entries[0].isIntersecting);sync();},{threshold:.01});observer.observe(root);}
 on(media,'change',()=>{sync();progress();});on(doc,'visibilitychange',sync);
 const globalMotion=new win.MutationObserver(sync);globalMotion.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
 for(const el of all('[data-option]'))update(el.dataset.option,el.value);
 for(const [key,value] of Object.entries(initial))update(key,value);
 sync();measureType();progress();gutters();
 return {root,play,pause,stop,update,destroy(){if(destroyed)return;stop();destroyed=true;events.abort();resize?.disconnect();observer?.disconnect();globalMotion.disconnect();win.cancelAnimationFrame(frame);win.cancelAnimationFrame(scrollFrame);win.cancelAnimationFrame(resizeFrame);}};
}
