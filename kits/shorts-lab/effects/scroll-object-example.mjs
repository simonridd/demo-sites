import {renderStudy} from './studies.mjs';
import {mountEffect} from './atlas.mjs';
const host=document.querySelector('#scroll-example');
host.innerHTML=renderStudy('reveal','scroll-object-large',{assetBase:'./assets/'});
const controller=mountEffect(host.firstElementChild);
window.addEventListener('pagehide',event=>{if(!event.persisted)controller.destroy();},{once:true});
