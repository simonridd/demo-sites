import {mountScene} from './scenes.mjs';
const scene=document.querySelector('[data-scene]');
if(scene){
 const controller=mountScene(scene);
 window.addEventListener('pagehide',event=>{if(!event.persisted)controller.destroy();},{once:true});
}
