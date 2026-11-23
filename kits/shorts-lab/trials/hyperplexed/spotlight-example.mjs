import {mountSpotlight} from './spotlight.mjs';
const controller=mountSpotlight(document.querySelector('[data-spotlight]'));
window.addEventListener('pagehide',e=>{if(!e.persisted)controller.destroy();},{once:true});
