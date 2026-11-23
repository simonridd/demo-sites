let frame=0;
function update(){frame=0;const el=document.scrollingElement,max=el.scrollHeight-el.clientHeight;document.documentElement.style.setProperty('--reading-position',max>0?el.scrollTop/max:0);}
const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('pageshow',schedule);
const observer=new ResizeObserver(schedule);observer.observe(document.body);
window.addEventListener('pagehide',event=>{if(!event.persisted){observer.disconnect();cancelAnimationFrame(frame);}},{once:true});update();
