// Independent confined utility dock. No physics, body portal or global shortcut.
let sequence=0;
export function mountUtilityDock(root,{count=3,side='right',vertical=.45}={}){
 const doc=root.ownerDocument,win=doc.defaultView,abort=new win.AbortController(),signal=abort.signal;
 const boundary=root.querySelector('[data-bubble-boundary]'),layer=root.querySelector('[data-bubble-layer]'),group=root.querySelector('[data-bubble-group]'),panel=root.querySelector('[data-utility-panel]'),body=root.querySelector('[data-panel-content]'),flag=root.querySelector('[data-bubbles-enable]'),status=root.querySelector('[data-bubble-status]');
 const originals=[...root.querySelectorAll('[data-utility]')].slice(0,3),reduce=win.matchMedia('(prefers-reduced-motion:reduce)');
 const id='hx-dock-'+(++sequence),dismissed=new Set(),buttons=new Map();let enabled=false,active=null,drag=null,frame=0,dead=false,suppress=false,timer=0,x=0,y=0;
 let limit=Math.max(1,Math.min(3,Number(count)||3)),edge=side==='left'?'left':'right',fraction=Math.max(0,Math.min(1,Number(vertical)||0));
 const on=(node,type,fn,options={})=>node.addEventListener(type,fn,{...options,signal});
 const available=()=>originals.slice(0,limit).filter(el=>!dismissed.has(el.dataset.utility));
 const announce=text=>status.textContent=text;
 root.querySelector('[data-bubble-help]').id=id+'-help';
 panel.id=id+'-panel';root.querySelector('[data-panel-title]').id=id+'-title';panel.setAttribute('aria-labelledby',id+'-title');
 for(const original of originals){
  const button=doc.createElement('button');button.type='button';button.className='hx-bubble';button.dataset.bubble=original.dataset.utility;button.textContent=original.dataset.letter;
  button.setAttribute('aria-label',original.dataset.label);button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-expanded','false');button.setAttribute('aria-describedby',id+'-help');button.tabIndex=buttons.size===0?0:-1;group.append(button);buttons.set(original.dataset.utility,button);
 }
 function paint(){frame=0;if(!dead)group.style.transform=`translate3d(${x}px,${y}px,0)`;}
 function move(){if(!frame)frame=win.requestAnimationFrame(paint);}
 function layout(){
  if(dead)return;
  const list=available();buttons.forEach((button,key)=>{button.hidden=!list.some(el=>el.dataset.utility===key);});
  const visible=[...buttons.values()].filter(button=>!button.hidden);if(!visible.some(b=>b.tabIndex===0))visible.forEach((b,i)=>b.tabIndex=i===0?0:-1);
  layer.hidden=!enabled||!list.length;root.dataset.open=String(!!active);group.setAttribute('aria-orientation',active?'horizontal':'vertical');
  root.dataset.edge=edge;
  if(active){x=Math.max(12,(boundary.clientWidth-group.offsetWidth)/2);y=12;}
  else{x=edge==='left'?12:Math.max(12,boundary.clientWidth-group.offsetWidth-12);y=Math.max(12,Math.min(boundary.clientHeight-group.offsetHeight-12,fraction*boundary.clientHeight));}
  paint();root.querySelector('[data-bubbles-restore]').disabled=!dismissed.size;
 }
 function restoreContent(){
  if(!active)return;
  const original=originals.find(el=>el.dataset.utility===active),content=body.firstElementChild;
  if(content)original.append(content);
 }
 function close({focus=true}={}){
  if(!active)return;const previous=active;restoreContent();active=null;panel.hidden=true;buttons.forEach(b=>b.setAttribute('aria-expanded','false'));layout();if(focus&&!buttons.get(previous).hidden&&enabled)buttons.get(previous).focus();
 }
 function open(key){
  if(!enabled||!available().some(el=>el.dataset.utility===key))return;
  if(active===key){close();return;}close({focus:false});
  const original=originals.find(el=>el.dataset.utility===key);original.open=false;active=key;body.append(original.querySelector('[data-utility-content]'));
  root.querySelector('[data-panel-title]').textContent=original.dataset.label;panel.hidden=false;buttons.get(key).setAttribute('aria-expanded','true');layout();
 }
 function setEnabled(value){
  if(dead)return;const focusInside=layer.contains(doc.activeElement);if(!value){close({focus:false});drag=null;root.dataset.dragging='false';win.cancelAnimationFrame(frame);frame=0;}enabled=!!value;flag.checked=enabled;layout();
  for(const b of root.querySelectorAll('[data-dock-side]'))b.disabled=!enabled;
  if(!enabled&&focusInside)flag.focus();announce(enabled?'Utility dock enabled. All tools remain available inline.':'Inline tools are available below. The floating dock is off.');
 }
 function dock(value){if(!['left','right'].includes(value)||dead)return;edge=value;close({focus:false});layout();announce('Utilities docked '+edge+'.');}
 function dismiss(key){
  const list=available(),index=list.findIndex(el=>el.dataset.utility===key);if(index<0)return;
  close({focus:false});dismissed.add(key);layout();const next=available()[Math.min(index,available().length-1)];
  if(next){buttons.forEach((b,k)=>b.tabIndex=k===next.dataset.utility?0:-1);buttons.get(next.dataset.utility).focus();}else root.querySelector('[data-bubbles-restore]').focus();
  announce(originals.find(el=>el.dataset.utility===key).dataset.label+' dismissed from the dock; its inline tool remains available.');
 }
 function restore(){if(dead)return;dismissed.clear();layout();announce('Dismissed utilities restored to the dock.');}
 function configure(value){if(dead)return;const ownedFocus=layer.contains(doc.activeElement);limit=Math.max(1,Math.min(3,Number(value)||3));if(active&&!available().some(el=>el.dataset.utility===active))close({focus:false});layout();if(ownedFocus&&(!layer.contains(doc.activeElement)||doc.activeElement.hidden)){const next=available()[0];if(next)buttons.get(next.dataset.utility).focus();else flag.focus();}}
 function finish(){
  if(!drag)return;const was=drag.moved;drag=null;root.dataset.dragging='false';if(was){edge=x+group.offsetWidth/2<boundary.clientWidth/2?'left':'right';fraction=y/boundary.clientHeight;layout();announce('Utilities docked '+edge+'.');suppress=true;win.clearTimeout(timer);timer=win.setTimeout(()=>suppress=false,0);}else layout();
 }
 on(group,'pointerdown',e=>{
  if(!enabled||active||e.button!==0)return;const button=e.target.closest('[data-bubble]');if(!button)return;
  drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y,moved:false,width:boundary.clientWidth,height:boundary.clientHeight};button.setPointerCapture(e.pointerId);
 });
 on(group,'pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;root.dataset.dragging='true';
  x=Math.max(12,Math.min(drag.width-group.offsetWidth-12,drag.x+dx));y=Math.max(12,Math.min(drag.height-group.offsetHeight-12,drag.y+dy));move();
 },{passive:true});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])on(group,type,finish);
 on(group,'click',e=>{const b=e.target.closest('[data-bubble]');if(!b)return;if(suppress){suppress=false;return;}buttons.forEach(button=>button.tabIndex=button===b?0:-1);open(b.dataset.bubble);});
 on(group,'keydown',e=>{
  const button=e.target.closest('[data-bubble]');if(!button)return;suppress=false;
  const list=available(),index=list.findIndex(el=>el.dataset.utility===button.dataset.bubble);let target;
  if(['ArrowUp','ArrowDown','Home','End'].includes(e.key)){
   target=e.key==='Home'?0:e.key==='End'?list.length-1:(index+(e.key==='ArrowDown'?1:-1)+list.length)%list.length;
   buttons.forEach((b,key)=>b.tabIndex=key===list[target].dataset.utility?0:-1);buttons.get(list[target].dataset.utility).focus();
  }else if(['ArrowLeft','ArrowRight'].includes(e.key))dock(e.key==='ArrowLeft'?'left':'right');
  else if(['Delete','Backspace'].includes(e.key))dismiss(button.dataset.bubble);else if(e.key==='Escape')close();else return;
  e.preventDefault();e.stopPropagation();
 });
 on(panel,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}});
 on(doc,'pointerdown',e=>{if(active&&!panel.contains(e.target)&&!group.contains(e.target))close({focus:false});});
 on(root.querySelector('[data-utility-close]'),'click',()=>close());
 on(root.querySelector('[data-utility-dismiss]'),'click',()=>dismiss(active));
 on(root.querySelector('[data-utility-inline]'),'click',()=>{const key=active;close({focus:false});const original=originals.find(el=>el.dataset.utility===key);original.open=true;original.querySelector('summary').focus();original.scrollIntoView({block:'nearest'});});
 for(const original of originals)on(original.querySelector('summary'),'click',()=>{if(active===original.dataset.utility)close({focus:false});});
 on(flag,'change',()=>setEnabled(flag.checked));on(root.querySelector('[data-bubble-count]'),'change',e=>configure(e.target.value));
 for(const b of root.querySelectorAll('[data-dock-side]'))on(b,'click',()=>dock(b.dataset.dockSide));on(root.querySelector('[data-bubbles-restore]'),'click',restore);
 function sync(){root.dataset.reduced=String(reduce.matches||doc.documentElement.classList.contains('motion-off'));if(drag)finish();}
 on(win,'beforeprint',()=>close({focus:false}));
 on(reduce,'change',sync);const global=new win.MutationObserver(sync);global.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
 const resize=win.ResizeObserver?new win.ResizeObserver(()=>{if(drag)finish();layout();}):null;resize?.observe(boundary);if(!resize)on(win,'resize',layout);
 flag.disabled=false;root.querySelector('[data-bubble-count]').disabled=false;sync();layout();
 return {setEnabled,dock,restore,configure,open,close,dismiss,destroy(){if(dead)return;const inside=layer.contains(doc.activeElement);close({focus:false});enabled=false;flag.checked=false;layer.hidden=true;dead=true;abort.abort();global.disconnect();resize?.disconnect();win.cancelAnimationFrame(frame);win.clearTimeout(timer);group.replaceChildren();flag.disabled=true;root.querySelector('[data-bubble-count]').disabled=true;for(const b of root.querySelectorAll('[data-dock-side],[data-bubbles-restore]'))b.disabled=true;if(inside)originals[0].querySelector('summary').focus();}};
}
