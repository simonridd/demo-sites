import {mountUtilityDock} from './bubbles.mjs';
const controller=mountUtilityDock(document.querySelector('[data-bubble-demo]'));
window.addEventListener('pagehide',e=>{if(!e.persisted)controller.destroy();},{once:true});
