// Optional native-media extension for research studies 35/37. No ImageKit SDK,
// remote checkout, media upload, tracking or account connection.
export function mountHotspots(root,{items,allowedTargets}){
 const doc=root.ownerDocument,win=doc.defaultView;
 const abort=new win.AbortController();
 const video=root.querySelector('video');
 const nodes=[];
 for(const item of items){
  if(!allowedTargets.includes(item.target)||!/^#[a-zA-Z][\w-]*$/.test(item.target)||!doc.getElementById(item.target.slice(1)))throw new TypeError('Hotspot target must be an allowed local anchor');
  if(![item.x,item.y,item.start,item.end].every(Number.isFinite)||item.x<0||item.x>100||item.y<0||item.y>100||item.start<0||item.end<=item.start)throw new TypeError('Invalid hotspot geometry or time window');
  for(const surface of root.querySelectorAll('[data-hotspot-surface]')){
   const link=doc.createElement('a');link.href=item.target;link.textContent=item.label;link.className='media-hotspot';
   link.style.left=item.x+'%';link.style.top=item.y+'%';surface.append(link);
   link.addEventListener('click',()=>video.pause(),{signal:abort.signal});
   nodes.push({link,item,timed:surface.dataset.hotspotSurface==='video'});
  }
 }
 function update(){
  for(const {link,item,timed} of nodes){
   const shown=!timed||(video.currentTime>=item.start&&video.currentTime<=item.end);
   // Keep an already focused link stable; the permanent list remains available.
   link.hidden=!shown&&doc.activeElement!==link;
  }
 }
 for(const type of ['timeupdate','seeked','loadedmetadata'])video.addEventListener(type,update,{signal:abort.signal});
 root.addEventListener('focusout',update,{signal:abort.signal});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)video.pause();},{signal:abort.signal});
 update();
 return {destroy(){abort.abort();video.pause();nodes.forEach(({link})=>link.remove());}};
}
