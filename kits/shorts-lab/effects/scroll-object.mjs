// Scroll position is the only clock. Native timelines own transforms where
// available; the fallback writes one transform per scroll/resize frame.
export function mountScrollObject(root,{signal,isReduced}){
 const win=root.ownerDocument.defaultView;
 const scroll=root.querySelector('.ma-scroll'),scene=root.querySelector('.ma-scroll-scene');
 const object=root.querySelector('.ma-scroll-object'),output=root.querySelector('[data-scroll-position]');
 const engine=root.querySelector('.ma-scroll-engine');
 const native=win.CSS?.supports('animation-timeline: scroll(nearest block)');
 root.dataset.scrollEngine=native?'native':'fallback';
 let frame=0,destroyed=false,path=0;
 function render(){
  frame=0;if(destroyed)return;
  const progress=scroll.scrollTop/Math.max(1,scroll.scrollHeight-scroll.clientHeight);
  output.value=Math.round(progress*100)+'%';
  const scrub=root.dataset.scrollMode==='scrub',reduced=isReduced();
  engine.textContent=reduced?'Reduced motion · still':!scrub?'Entrance / static mode':native?'CSS scroll timeline':'Scroll-event fallback';
  if(scrub&&!native&&!reduced&&root.dataset.suspended==='true')return;
  object.style.removeProperty('transform');
  if(!scrub||reduced||native)return;
  const mode=root.dataset.objectMotion||'combined';
  const move=mode==='combined'||mode==='translate',turn=mode==='combined'||mode==='rotate',scale=mode==='combined'||mode==='scale';
  const travel=parseFloat(win.getComputedStyle(root).getPropertyValue('--ma-travel'))||0;
  const x=move?(progress-.5)*path:0;
  const y=move?Math.abs(progress-.5)*travel-travel/4:0;
  const size=scale?.7+(1-Math.abs(progress*2-1))*.5:1;
  object.style.transform=`translate(${x}px,${y}px) rotate(${turn?progress*270:0}deg) scale(${size})`;
 }
 function refresh(){if(!destroyed&&!frame)frame=win.requestAnimationFrame(render);}
 function measure(){
  // Allow the largest rotated cube to fit even in narrow/zoomed layouts.
  path=Math.max(0,scene.clientWidth-object.offsetWidth*1.65-32);
  root.style.setProperty('--ma-path',path+'px');refresh();
 }
 scroll.addEventListener('scroll',refresh,{passive:true,signal});
 const resize=win.ResizeObserver?new win.ResizeObserver(measure):null;
 resize?.observe(scene);
 if(!resize)win.addEventListener('resize',measure,{signal});
 measure();
 return {refresh,checkpoint(fraction){
  scroll.scrollTo({top:(scroll.scrollHeight-scroll.clientHeight)*fraction,behavior:'instant'});
  refresh();
 },destroy(){destroyed=true;root.dataset.scrollMode='static';resize?.disconnect();win.cancelAnimationFrame(frame);object.style.removeProperty('transform');root.dataset.scrollEngine='static';}};
}
