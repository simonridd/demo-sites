// Independent shared-grid light; coordinates are cached until geometry changes.
export function mountSpotlight(root,{radius=270,faceAlpha=.075}={}){
 const win=root.ownerDocument.defaultView,doc=root.ownerDocument,abort=new win.AbortController(),signal=abort.signal;
 const grid=root.querySelector('[data-spot-grid]'),cards=[...grid.querySelectorAll('.hx-spot-card')];
 const reduce=win.matchMedia('(prefers-reduced-motion:reduce)'),fine=win.matchMedia('(hover:hover) and (pointer:fine)');
 let mode='static',cache=null,point=null,frame=0,dead=false;
 const bounded=(value,min,max,fallback)=>Number.isFinite(+value)?Math.min(max,Math.max(min,+value)):fallback;
 root.style.setProperty('--hx-radius',bounded(radius,120,420,270)+'px');root.style.setProperty('--hx-face-alpha',bounded(faceAlpha,0,.1,.075));
 root.dataset.geometryReads='0';root.dataset.renderCount='0';
 const on=(node,type,fn,options={})=>node.addEventListener(type,fn,{...options,signal});
 const reduced=()=>reduce.matches||doc.documentElement.classList.contains('motion-off');
 function reset(){point=null;root.dataset.active='false';win.cancelAnimationFrame(frame);frame=0;}
 function sync(){root.dataset.effective=reduced()||!fine.matches?'static':mode;root.dataset.reduced=String(reduced());reset();root.querySelector('[data-spot-status]').textContent=reduced()?'Reduced motion · static cards and visible focus.':!fine.matches?'Touch / non-hover view · static cards and visible focus.':mode==='static'?'Static cards. Choose a light treatment to compare.':'Pointer light is decorative. Keyboard focus remains equally clear.';}
 function measure(){
  const rect=grid.getBoundingClientRect();
  cache={rect,cards:cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.left-rect.left,y:r.top-rect.top};})};
  cards.forEach((card,i)=>{card.style.setProperty('--hx-left',cache.cards[i].x+'px');card.style.setProperty('--hx-top',cache.cards[i].y+'px');});
  root.dataset.geometryReads=String(+root.dataset.geometryReads+1);
 }
 function render(){frame=0;if(dead||!point||root.dataset.effective==='static'||doc.hidden)return;if(!cache)measure();if(point.x<cache.rect.left||point.x>cache.rect.right||point.y<cache.rect.top||point.y>cache.rect.bottom){reset();return;}root.style.setProperty('--hx-x',point.x-cache.rect.left+'px');root.style.setProperty('--hx-y',point.y-cache.rect.top+'px');root.dataset.active='true';root.dataset.renderCount=String(+root.dataset.renderCount+1);}
 function schedule(){if(!frame)frame=win.requestAnimationFrame(render);}
 function invalidate(){cache=null;if(point)schedule();}
 on(grid,'pointermove',e=>{if(e.pointerType!=='mouse'||root.dataset.effective==='static')return;point={x:e.clientX,y:e.clientY};schedule();},{passive:true});
 on(grid,'pointerleave',reset);on(win,'scroll',invalidate,{capture:true,passive:true});on(win,'resize',invalidate);
 on(doc,'visibilitychange',()=>{reset();cache=null;});on(reduce,'change',sync);on(fine,'change',sync);
 const observer=new win.MutationObserver(sync);observer.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
 const resize=win.ResizeObserver?new win.ResizeObserver(invalidate):null;resize?.observe(grid);cards.forEach(card=>resize?.observe(card));
 for(const radio of root.querySelectorAll('[name=spot-mode]'))on(radio,'change',()=>update(radio.value));
 on(root.querySelector('[data-theme-toggle]'),'click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';root.querySelector('[data-theme-toggle]').textContent=root.dataset.theme==='dark'?'Use light theme':'Use dark theme';invalidate();});
 root.querySelector('[data-spot-options]').disabled=false;root.querySelector('[data-theme-toggle]').disabled=false;sync();
 function update(value){if(dead)return;if(!['static','border','face'].includes(value))throw new TypeError('Unknown light treatment');mode=value;root.querySelector(`[value="${mode}"]`).checked=true;sync();}
 return {update,reset,destroy(){if(dead)return;dead=true;reset();abort.abort();observer.disconnect();resize?.disconnect();root.dataset.effective='static';root.querySelector('[data-spot-options]').disabled=true;root.querySelector('[data-theme-toggle]').disabled=true;}};
}
