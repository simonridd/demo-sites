import {mountComposer,mountIntentMenu} from './patterns.mjs';
const composerRoot=document.querySelector('[data-composer]');
const composer=mountComposer(composerRoot),menu=mountIntentMenu(document.querySelector('[data-intent-menu]'));
const abort=new AbortController(),signal=abort.signal;
for(const control of document.querySelectorAll('[data-composer-engine],[data-save],[data-disclosure-motion]'))control.disabled=false;
document.querySelector('[data-composer-engine]').addEventListener('change',e=>composer.setEngine(e.target.value),{signal});
document.querySelector('[data-save]').addEventListener('click',()=>{document.querySelector('[data-save-status]').textContent='Preview only · '+composerRoot.querySelector('textarea').value.length+' characters kept in this field. Nothing sent or stored.';},{signal});
const disclosure=document.querySelector('[data-disclosures]'),check=document.querySelector('[data-disclosure-motion]');
check.addEventListener('change',()=>{
 disclosure.dataset.motion=String(check.checked);
 const supported=CSS.supports('interpolate-size: allow-keywords')&&CSS.supports('selector(details::details-content)');
 document.querySelector('[data-disclosure-status]').textContent=check.checked&&supported?'Optional height transition; reduced motion stays instant.':'Native instant disclosure'+(check.checked?' · height transitions unavailable here.':'.');
},{signal});
window.addEventListener('pagehide',e=>{if(!e.persisted){composer.destroy();menu.destroy();abort.abort();}},{once:true});
