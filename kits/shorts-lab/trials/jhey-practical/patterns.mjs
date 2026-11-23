// Independently authored native trials. No auto-mount, packages or app changes.
const bounded=(n,min,max,fallback)=>Number.isFinite(+n)?Math.max(min,Math.min(max,+n)):fallback;
export function mountComposer(root,{engine='auto'}={}){
 const win=root.ownerDocument.defaultView,abort=new win.AbortController();
 const field=root.querySelector('textarea'),counter=root.querySelector('[data-count]'),status=root.querySelector('[data-composer-status]');
 let selected=engine,dead=false;
 function measure(){
  if(dead)return;
  const native=selected==='auto'&&win.CSS.supports('field-sizing: content');
  root.dataset.engine=selected==='static'?'static':native?'native':'fallback';
  field.style.removeProperty('height');
  if(root.dataset.engine==='fallback'){
   const css=win.getComputedStyle(field),border=parseFloat(css.borderTopWidth)+parseFloat(css.borderBottomWidth);
   field.style.height='auto';
   field.style.height=Math.min(parseFloat(css.maxHeight)||224,Math.max(parseFloat(css.minHeight)||88,field.scrollHeight+border))+'px';
  }
  counter.value=field.value.length+' / '+field.maxLength;
  status.textContent=({native:'Native CSS field sizing.',fallback:'Measured on input and resize; no animation loop.',static:'Fixed native textarea; resize or scroll within it.'})[root.dataset.engine];
 }
 field.addEventListener('input',measure,{signal:abort.signal});
 const resize=win.ResizeObserver?new win.ResizeObserver(entries=>{if(entries[0].contentRect.width!==width){width=entries[0].contentRect.width;measure();}}):null;
 let width=field.clientWidth;resize?.observe(field);
 if(!resize)win.addEventListener('resize',measure,{signal:abort.signal});
 measure();
 return {setEngine(value){if(!['auto','fallback','static'].includes(value))throw new TypeError('Unknown sizing engine');selected=value;measure();},destroy(){dead=true;abort.abort();resize?.disconnect();root.dataset.engine='static';field.style.removeProperty('height');}};
}
export function mountIntentMenu(root,{openDelay=260,closeDelay=420,safetyDelay=500}={}){
 const doc=root.ownerDocument,win=doc.defaultView,abort=new win.AbortController(),signal=abort.signal;
 const details=[...root.querySelectorAll('details')],fine=win.matchMedia('(hover:hover) and (pointer:fine)');
 let timer=0,closeTimer=0,candidate=null,origin=null,protectedPath=false,dead=false;
 const active=()=>details.find(d=>d.open);
 const cancel=()=>{win.clearTimeout(timer);timer=0;candidate=null;protectedPath=false;};
 const hasFocus=()=>root.contains(doc.activeElement);
 function open(target){if(dead)return;details.forEach(d=>{d.open=d===target;});}
 function triangle(point,from,rect){
  if(!from||rect.left<=from.x||point.x<from.x-8||point.x>rect.left+12)return false;
  const ratio=Math.max(0,Math.min(1,(point.x-from.x)/(rect.left-from.x)));
  return point.y>=from.y+(rect.top-16-from.y)*ratio-8&&point.y<=from.y+(rect.bottom+16-from.y)*ratio+8;
 }
 function schedule(target,delay){
  win.clearTimeout(timer);candidate=target;
  timer=win.setTimeout(()=>{if(!hasFocus())open(target);cancel();},bounded(delay,0,1200,260));
 }
 for(const d of details){
  const summary=d.querySelector('summary'),panel=d.querySelector('.intent-panel');
  summary.addEventListener('pointerenter',e=>{
   win.clearTimeout(closeTimer);
   if(e.pointerType!=='mouse'||!fine.matches||hasFocus()||d.open)return;
   const current=active(),rect=current?.querySelector('.intent-panel').getBoundingClientRect();
   protectedPath=!!current&&triangle(e,origin,rect);
   schedule(d,protectedPath?safetyDelay:openDelay);
  },{signal});
  summary.addEventListener('pointerleave',e=>{if(d.open)origin={x:e.clientX,y:e.clientY};},{signal});
  panel.addEventListener('pointerenter',()=>{cancel();win.clearTimeout(closeTimer);},{signal});
  d.addEventListener('toggle',()=>{if(d.open)details.forEach(other=>{if(other!==d)other.open=false;});},{signal});
 }
 root.addEventListener('pointermove',e=>{
  if(!candidate||!protectedPath)return;
  const rect=active()?.querySelector('.intent-panel').getBoundingClientRect();
  if(!rect||!triangle(e,origin,rect)){protectedPath=false;schedule(candidate,openDelay);}
 },{signal,passive:true});
 root.addEventListener('pointerleave',e=>{
  cancel();if(e.pointerType!=='mouse'||hasFocus())return;
  closeTimer=win.setTimeout(()=>{if(!hasFocus())details.forEach(d=>d.open=false);},bounded(closeDelay,0,1200,420));
 },{signal});
 root.addEventListener('pointerenter',()=>win.clearTimeout(closeTimer),{signal});
 root.addEventListener('focusin',()=>{cancel();win.clearTimeout(closeTimer);},{signal});
 root.addEventListener('click',cancel,{signal});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&active()){e.preventDefault();const d=active();d.open=false;d.querySelector('summary').focus();cancel();}},{signal});
 root.dataset.enhanced='true';
 return {destroy(){dead=true;cancel();win.clearTimeout(closeTimer);abort.abort();root.dataset.enhanced='false';}};
}
