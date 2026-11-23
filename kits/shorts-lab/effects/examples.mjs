import {renderStudy} from './studies.mjs';
import {mountEffects} from './atlas.mjs';
const studies=[['pattern',34,'Patterned backgrounds'],['voice-orb',32,'Counter-rotating orb'],['refraction',60,'Refraction: bend versus blur'],['marquee',27,'Seamless marquee'],['pulse',26,'State-driven pulse'],['reveal',25,'Scroll-driven objects'],['shimmer',24,'Loading lifecycle'],['pixel',23,'Animated sprites'],['stagger',22,'Stagger and travelling wave'],['comparison',81,'Before and after'],['aurora-text',82,'Aurora inside text']];
document.querySelector('#examples').innerHTML=studies.map(([kind,id,title])=>`<section class="example" id="${kind}"><h2>${title}</h2>${renderStudy(kind,'portable-'+id,{assetBase:'./assets/'})}</section>`).join('');
const mounted=mountEffects(document.querySelector('#examples'));
window.addEventListener('pagehide',event=>{if(!event.persisted)mounted.destroy();},{once:true});
