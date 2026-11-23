import {mountHotspots} from './hotspots.mjs';

if(document.querySelector('[data-hotspot-example]')){
 const instance=mountHotspots(document.querySelector('[data-hotspot-example]'),{
  allowedTargets:['#project-details'],items:[{id:'atlas',label:'Explore this example',x:48,y:55,start:.5,end:2.5,target:'#project-details'}]
 });
 window.addEventListener('pagehide',event=>{if(!event.persisted)instance.destroy();},{once:true});
}
