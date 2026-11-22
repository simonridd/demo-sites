import {effects,researchCount} from './effects-data.mjs';

const cards = document.querySelector('#cards');
const search = document.querySelector('#search');
const verdictFilter = document.querySelector('#verdict');
const familyFilter = document.querySelector('#family');
const stageOnly = document.querySelector('#stage-only');
const resultCount = document.querySelector('#result-count');
const contextNote = document.querySelector('#context-note');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeTimers = new WeakMap();
let audience = 'stage';

const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const button = (label, action, extra = '') => `<button type="button" class="small-action" data-action="${action}" ${extra}>${label}</button>`;
const playButton = id => `<button type="button" class="replay" data-action="replay" aria-label="Play effect ${id} again">↻ Play</button>`;
const digits = '0123456789'.split('').map(d => `<b>${d}</b>`).join('');
function rollHTML(value, prefix = '') {
  const chunks = [...value].map(ch => /^[0-9]$/.test(ch)
    ? `<span class="digit-track" aria-hidden="true"><span style="--digit:${ch}">${digits}</span></span>`
    : `<span aria-hidden="true">${esc(ch)}</span>`).join('');
  return `<div class="roll-panel" role="img" aria-label="${esc(prefix + value)}" data-roll-current="${esc(value)}"><span class="prefix" aria-hidden="true">${esc(prefix)}</span>${chunks}</div>`;
}
function researchPreview(e) {
  const icon = ({translate:'文', 'brand-scrape':'◎','voice-tutorial':'◌','virtual-agent':'◈',
    'shoppable-video':'◫','shoppable-tutorial':'▣','language-font':'字',
    calendar:'▦','calendar-theme':'▦','friends-app':'⌖',payments:'£',
    'payments-tutorial':'£',education:'✳'})[e.preview] || '↗';
  return `<div class="research-scene"><div class="research-symbol" aria-hidden="true">${icon}</div><strong>Research, not a CSS effect</strong><span>${esc(e.note)}</span></div>`;
}
function previewFor(e) {
  if (e.family === 'Research-only') return researchPreview(e);
  const title = esc(e.title);
  const simple = (visual, caption = '') => `${visual}${caption ? `<small class="footnote">${caption}</small>` : ''}`;
  switch(e.preview) {
    case 'checkbox': return `<label class="check-line"><input type="checkbox" checked><span>Keep me updated</span></label><small>Native control, intentional accent</small>`;
    case 'button': case 'button-looks': return simple(`<button type="button" class="demo-button" data-action="replay">See the difference ↗</button>`,'Hover, focus and press');
    case 'highlight': return `<p class="selection-text">Make the <mark>important bit</mark> count.</p>${button('Switch emphasis','highlight')}`;
    case 'layout-shift': case 'layout-shift-2': return `<div class="media-reserve"></div><small>Media space stays reserved</small>${button('Swap illustration','toggle-media')}`;
    case 'hero-candidate': return `<span class="candidate-label">Unverified — exploration</span><div class="visual-hero"><span>Beyond ordinary.</span></div><small>Hover the hero</small>`;
    case 'reduced-motion': return `<div class="motion-orbit"><i></i></div>${button('Calm / animate','toggle-calm','aria-pressed="false"')}`;
    case 'wheel': return `<div class="zoom-target">◇</div>${button('Zoom without stealing scroll','zoom')}`;
    case 'mobile': return `<div class="mock-phone"><i></i><i></i><i></i><i></i><i></i></div><small>Responsive, readable and tappable</small>`;
    case 'palette': return `<div class="palette-row"><i></i><i></i><i></i><i></i></div>${button('Mix another palette','palette')}`;
    case 'css-if': return `<div class="logic-tag">A smarter selector</div><small>Conventional fallback first</small>`;
    case 'focus-within': return `<div class="focus-box"><label for="focus-${e.id}">Your contact email</label><input id="focus-${e.id}" type="email" placeholder="you@example.com"></div>`;
    case 'progress': return `<strong class="progress-value" aria-live="polite" data-progress-value>45%</strong><div class="progress-track"><div class="progress-fill" style="--p:45%"></div></div>${button('Change actual sample value','progress')}`;
    case 'layout-candidate': return `<span class="candidate-label">Unverified — layout trial</span><div class="layout-mini"><i></i><i></i><i></i></div>`;
    case 'typewriter': return `<div class="type-text">A moment of impact.</div><small>Short stage-only title</small>`;
    case 'border': return `<div class="rotate-border">One thing matters.</div><small>Rare spotlight, not default UI</small>`;
    case 'metaball': return `<div class="metaball-wrap" aria-hidden="true"><i></i><i></i></div><small>Creative shape experiment</small>`;
    case 'count-up': return `<strong class="big-number" data-counter data-final="24800">24,800</strong><small>A measured result · example</small>`;
    case 'tv-intro': return `<div class="tv-intro">Next<br>chapter.</div><small>Original typography; no TV branding</small>`;
    case 'stagger': return `<div class="stagger-grid">${['01','02','03','04'].map((n,i)=>`<b style="--i:${i}">${n}</b>`).join('')}</div><small>Content always in the DOM</small>`;
    case 'pixel': return `<div class="pixel-letters">HELLO</div><small>Retro only with a story reason</small>`;
    case 'shimmer': return `<div class="skeleton" aria-label="Illustrative loading placeholders"><i></i><i></i><i></i></div><small>Only during a real pending state</small>`;
    case 'reveal': return `<div class="reveal-copy">Make the point. Then move on.</div>`;
    case 'pulse': return `<span class="live-label"><i></i>Activity · simulated</span><small>Never imply a real connection</small>`;
    case 'marquee': return `<div class="marquee-clip"><div class="marquee-copy">A DIFFERENT KIND OF DEMO · A DIFFERENT KIND OF DEMO · </div></div><small>One pass only, no permanent loop</small>`;
    case 'glass': return `<div class="glass-scene"><div class="glass-card">An optional layer.</div></div>`;
    case 'art-direction': return `<div class="art-direction-mock"><strong>A better <em>idea.</em></strong><span aria-hidden="true">◎</span></div>`;
    case 'squircle': return `<div class="squircle">◉</div><small>Normal radius fallback</small>`;
    case 'voice-orb': return `<div class="voice-orb" aria-hidden="true"></div><small>Sample visual only · no audio source</small>`;
    case 'pattern': return `<div class="pattern-board"><b>Just enough.</b></div>`;
    case 'superellipse': return `<div class="superellipse">SOFT</div><small>Progressive enhancement</small>`;
    case 'video-ratio': return `<span class="candidate-label">Unverified — media trial</span><div class="video-box">16:9</div>${button('Toggle aspect ratio','ratio')}`;
    case 'pill': return `<div class="glide-pills" role="tablist" aria-label="Example sections" style="--selected:0"><button type="button" role="tab" aria-selected="true" tabindex="0" data-action="pill" data-index="0">Discover</button><button type="button" role="tab" aria-selected="false" tabindex="-1" data-action="pill" data-index="1">Show</button><button type="button" role="tab" aria-selected="false" tabindex="-1" data-action="pill" data-index="2">Decide</button></div><small aria-live="polite" data-pill-status>Discover section</small>`;
    case 'price-roll': return `${rollHTML('129.00','£')}${button('Compare £249.00','price')}`;
    case 'transform-candidate': return `<span class="candidate-label">Unverified — transformation</span><div class="visual-hero"><span>Shape shift</span></div>`;
    case 'holo': return `<div class="holo-tick" role="img" aria-label="Decorative check, no task success implied">✓</div><small>Decorative only · not verification</small>`;
    case 'photo-candidate': return `<span class="candidate-label">Unverified — artwork trial</span><div class="visual-hero"><span>Original geometry</span></div>`;
    case 'formats': return `<div class="format-mock"><i>WebP</i><i>AVIF</i></div><small>Compare measured bytes, not labels</small>`;
    case 'vector-logo': return `<div class="vector-logo" aria-label="Original illustrative K mark">k↗</div><small>Use licensed client marks in real work</small>`;
    case 'unknown-shape': return `<span class="candidate-label">Unverified — shape study</span><div class="squircle">◇</div>`;
    case 'shine': return `<div class="shine-card">Premium, not loud.</div><small>Hover the card</small>`;
    case 'music-glow': return `<div class="music-glow" aria-hidden="true">♪</div><small>Abstract colour study, not an app clone</small>`;
    case 'video-controls': return `<span class="candidate-label">Unverified — controller trial</span><div class="video-box">▶</div><small>Real playback needs a real media element</small>`;
    case 'gradient': return `<div class="gradient-board"><strong>Intentional colour.</strong></div>`;
    case 'fab': return `<div class="fab-wrap"><div class="fab-options" hidden><button type="button" aria-label="Note" data-action="fab-choice">✎</button><button type="button" aria-label="Share" data-action="fab-choice">↗</button></div><button class="fab-main" type="button" data-action="fab" aria-expanded="false" aria-label="Open optional tools">＋</button></div><small>Secondary actions only</small>`;
    case 'blur': return `<div class="blur-scene"><div class="blur-pane">A clear overlay.</div></div>`;
    case 'split': return `<div class="split-wrap"><button type="button" data-action="split-primary">Present</button><button type="button" aria-haspopup="menu" aria-expanded="false" data-action="split-menu" aria-label="Presentation options">⌄</button><div class="split-menu-items" role="menu" hidden><button type="button" role="menuitem" data-action="split-choice">Open notes</button><button type="button" role="menuitem" data-action="split-choice">Preview slides</button></div></div><small aria-live="polite" data-feedback>Primary action remains obvious</small>`;
    case 'sparkles': return `<div class="sparkles">One big idea.</div><small>Short theatrical emphasis</small>`;
    case 'css-logo': return `<div class="css-logo" aria-label="Experimental letter C logo">C</div><small>Own artwork, not a client mark</small>`;
    case 'nudge': return `<div class="nudge-message">One new insight for you.</div>${button('Nudge once','replay')}`;
    case 'squeeze': return `<button type="button" class="demo-button" data-action="replay">Press to respond</button><small>Press and release</small>`;
    case 'moving-bg': return `<div class="moving-bg">A new perspective.</div><small>Only when explicitly replayed</small>`;
    case 'thinking': return `<div class="thinking-bar" aria-label="Illustrative pending indicator"><i></i></div><small>Simulated busy · no progress claim</small>`;
    case 'slider': return `<div class="slider-wrap"><output class="slider-value" for="range-${e.id}">50</output><input id="range-${e.id}" type="range" min="0" max="100" value="50" data-range><small>Native slider with live value</small></div>`;
    case 'toggle': return `<label class="switch-line"><input type="checkbox" checked><span>Enabled</span></label><small>Real checkbox state</small>`;
    case 'wavy': return `<div class="wavy-bars" aria-label="Decorative equalizer sample">${[0,1,2,3,4,5].map(i=>`<i style="--i:${i}"></i>`).join('')}</div><small>One short sample, not a fake process</small>`;
    case 'icons': return `<button type="button" class="icon-button" data-action="icon" aria-pressed="false" aria-label="Save favourite"><span>♡</span></button><small>Icon state changes with the action</small>`;
    case 'header': return `<div class="mini-header"><div>Shorter navigation ↗</div><div>Content remains fully visible.</div></div>${button('Collapse / expand','header')}`;
    case 'input': return `<div class="input-demo"><label for="input-${e.id}">What can we help with?</label><input id="input-${e.id}" type="text" placeholder="Start typing…"></div>`;
    case 'carousel': return `<div class="carousel-shell"><div class="carousel-scroller" aria-label="Example gallery"><div tabindex="0">01</div><div tabindex="0">02</div><div tabindex="0">03</div></div><div class="carousel-actions"><button type="button" data-action="previous" aria-label="Previous item">←</button><button type="button" data-action="next" aria-label="Next item">→</button></div></div>`;
    case 'odometer': return `${rollHTML('12,840')}${button('Roll to 24,715','odometer')}`;
    default: return `<div class="research-scene"><div class="research-symbol" aria-hidden="true">?</div><strong>No claimed reproduction</strong><span>Further source inspection required: ${title}</span></div>`;
  }
}
function cardHTML(e) {
 const research = e.family==='Research-only';
 const speculative = e.verdict==='Hold';
 const tagClass = 'verdict-'+e.verdict.replaceAll(' ','-');
 const stageTag = audience==='stage' && e.stage ? '<span class="tag stage-candidate">Stage candidate</span>' : '';
 const source = e.id===75 ? 'Facebook reel' : 'Creator channel';
 return `<article class="card" data-id="${e.id}" data-stage="${audience==='stage'&&e.stage}">
  <div class="card-inner">
    <span class="card-index">STUDY ${String(e.id).padStart(3,'0')} / 075 · ${esc(e.family)}</span>
    <h3 class="card-title">${esc(e.title)}</h3>
    <div class="tags"><span class="tag ${tagClass}">${esc(e.verdict)}</span><span class="tag">${esc(e.priority)}</span>${stageTag}${speculative?'<span class="tag prototype-flag">Hypothesis</span>':''}</div>
  </div>
  <div class="preview" data-effect="${esc(e.preview)}"><div class="demo demo-${esc(e.preview)}">${previewFor(e)}</div></div>
  <div class="card-bottom">
    <p class="card-note">${esc(e.note)}</p>
    <div class="card-foot"><a class="source-link" href="${esc(e.source)}" target="_blank" rel="noopener noreferrer" title="Channel link, not a verified individual Short">${source} ↗</a>
      ${research?' <span class="tag">No CSS trial</span>':playButton(e.id)}
    </div>
  </div>
 </article>`;
}
function render(){
 const q=search.value.trim().toLowerCase(),v=verdictFilter.value,f=familyFilter.value;
 const filtered=effects.filter(e=>
   (v==='all'||e.verdict===v) && (f==='all'||e.family===f) &&
   (!stageOnly.checked||e.stage) &&
   (!q || (e.title+' '+e.note+' '+e.family+' '+e.verdict).toLowerCase().includes(q)));
 cards.innerHTML=filtered.map(cardHTML).join('');
 resultCount.textContent=`${filtered.length} of ${effects.length} studies · ${effects.length-researchCount} interactive/illustrative candidates · ${researchCount} research-only references`;
 document.querySelector('#empty').hidden=filtered.length>0;
}
for(const name of [...new Set(effects.map(e=>e.family))].sort()){
 const opt=document.createElement('option');opt.value=name;opt.textContent=name;familyFilter.append(opt);
}
function replay(preview) {
 if (!preview || motionPreference.matches || document.documentElement.classList.contains('motion-off')) return;
 preview.classList.remove('is-playing');
 // Restart this scoped one-shot only; do not autostart dozens of cards.
 void preview.offsetWidth;
 preview.classList.add('is-playing');
 const previous=activeTimers.get(preview);
 if(previous) clearTimeout(previous);
 activeTimers.set(preview,setTimeout(()=>preview.classList.remove('is-playing'),2700));
}
function changeRoll(preview,target) {
 const roll=preview.querySelector('[data-roll-current]');
 if(!roll) return;
 const old=roll.dataset.rollCurrent;
 const next=old===target?(target==='249.00'?'129.00':'12,840'):target;
 const charPositions=[...next];
 const spans=[...roll.querySelectorAll('.digit-track>span')];
 let i=0;
 charPositions.forEach(ch=>{if(/^\d$/.test(ch)){spans[i]?.style.setProperty('--digit',ch);i++;}});
 roll.dataset.rollCurrent=next;
 const prefix=preview.dataset.effect==='price-roll'?'£':'';
 roll.setAttribute('aria-label',prefix+next);
 const action=preview.querySelector('[data-action="price"],[data-action="odometer"]');
 if(action) action.textContent=preview.dataset.effect==='price-roll'
   ? `Compare £${next==='129.00'?'249.00':'129.00'}`
   : `Roll to ${next==='12,840'?'24,715':'12,840'}`;
}
function doAction(btn,preview){
 const action=btn.dataset.action;
 switch(action){
   case 'replay': replay(preview);break;
   case 'toggle-media':preview.querySelector('.media-reserve')?.classList.toggle('is-alt');break;
   case 'highlight':{const mark=preview.querySelector('mark');mark?.classList.toggle('is-dim');break;}
   case 'toggle-calm':{const calm=preview.classList.toggle('is-calm');btn.setAttribute('aria-pressed',String(calm));btn.textContent=calm?'Restore motion':'Calm scene';break;}
   case 'zoom':{const el=preview.querySelector('.zoom-target');el.style.setProperty('--zoom',Number(el.dataset.zoom||1)>=1.3?1:1.3);el.dataset.zoom=el.dataset.zoom==='1.3'?'1':'1.3';break;}
   case 'palette':preview.querySelector('.palette-row')?.classList.toggle('palette-alt');break;
   case 'progress':{const el=preview.querySelector('.progress-fill'),label=preview.querySelector('[data-progress-value]');const next=label.textContent==='45%'?'80%':'45%';label.textContent=next;el.style.setProperty('--p',next);break;}
   case 'ratio':{const el=preview.querySelector('.video-box');const isSquare=el.classList.toggle('is-square');el.textContent=isSquare?'1:1':'16:9';break;}
   case 'pill':selectPill(btn);break;
   case 'price':changeRoll(preview,'249.00');break;
   case 'odometer':changeRoll(preview,'24,715');break;
   case 'fab':{const menu=preview.querySelector('.fab-options');menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden));btn.textContent=menu.hidden?'＋':'×';break;}
   case 'fab-choice':{preview.querySelector('.fab-options').hidden=true;const main=preview.querySelector('.fab-main');main.setAttribute('aria-expanded','false');main.textContent='＋';break;}
   case 'split-menu':{const menu=preview.querySelector('.split-menu-items');menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden) menu.querySelector('button')?.focus();break;}
   case 'split-choice':{const menu=preview.querySelector('.split-menu-items');menu.hidden=true;const opener=preview.querySelector('[data-action="split-menu"]');opener.setAttribute('aria-expanded','false');opener.focus();preview.querySelector('[data-feedback]').textContent=btn.textContent+' · example only';break;}
   case 'split-primary':preview.querySelector('[data-feedback]').textContent='Present · example only';break;
   case 'icon':{const isSaved=btn.getAttribute('aria-pressed')!=='true';btn.setAttribute('aria-pressed',String(isSaved));btn.setAttribute('aria-label',isSaved?'Remove favourite':'Save favourite');btn.querySelector('span').textContent=isSaved?'♥':'♡';replay(preview);break;}
   case 'header':preview.querySelector('.mini-header')?.classList.toggle('is-condensed');break;
   case 'next':case 'previous':{const strip=preview.querySelector('.carousel-scroller');if(strip)strip.scrollBy({left:(action==='next'?1:-1)*strip.clientWidth*.65,behavior:motionPreference.matches?'instant':'smooth'});break;}
 }
}
function selectPill(btn) {
 const tablist=btn.closest('[role="tablist"]');
 if(!tablist) return;
 for(const tab of tablist.querySelectorAll('[role="tab"]')) {
   const selected=tab===btn;
   tab.setAttribute('aria-selected',String(selected));
   tab.tabIndex=selected?0:-1;
 }
 tablist.style.setProperty('--selected',btn.dataset.index);
 const output=tablist.parentElement.querySelector('[data-pill-status]');
 if(output)output.textContent=btn.textContent+' section';
}
cards.addEventListener('click',event=>{
 const btn=event.target.closest('button');
 if(!btn || !cards.contains(btn)) return;
 const preview=btn.closest('.preview') || btn.closest('.card')?.querySelector('.preview');
 if(preview)doAction(btn,preview);
});
cards.addEventListener('keydown',event=>{
 const tab=event.target.closest('[role="tab"]');
 if(tab && ['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){
   event.preventDefault();
   const tabs=[...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
   const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
     (tabs.indexOf(tab)+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   tabs[next].focus();selectPill(tabs[next]);
 }
 if(event.key==='Escape'){
   const menu=event.target.closest('.split-menu-items');
   if(menu){menu.hidden=true;const p=menu.closest('.preview');const opener=p.querySelector('[data-action="split-menu"]');opener.setAttribute('aria-expanded','false');opener.focus();}
 }
});
cards.addEventListener('input',event=>{
 if(event.target.matches('[data-range]')){
  const output=event.target.closest('.slider-wrap').querySelector('output');
  output.value=event.target.value;
  output.textContent=event.target.value;
 }
});
for(const control of [search,verdictFilter,familyFilter,stageOnly])
 control.addEventListener(control===search?'input':'change',render);
for(const radio of document.querySelectorAll('[name="audience"]')){
 radio.addEventListener('change',()=>{
  if(!radio.checked)return;
  audience=radio.value;
  contextNote.textContent=audience==='stage'
   ? 'For a presentation seen once or twice, a striking 2-second moment can help an idea stick. Theatre is welcome when it serves the story.'
   : 'For repeatedly used applications, clarity, truthfulness, accessibility and quiet interaction feedback matter more than theatrical effects.';
  render();
 });
}
document.querySelector('#reset').addEventListener('click',()=>{
 search.value='';verdictFilter.value='all';familyFilter.value='all';stageOnly.checked=false;render();search.focus();
});
render();
