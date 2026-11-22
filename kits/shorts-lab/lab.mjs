import {effects,researchCount} from './effects-data.mjs';
import {originalVideoLink,verifiedVideos} from './source-videos.mjs';
import {clips} from './clip-manifest.mjs';

const cards = document.querySelector('#cards');
const search = document.querySelector('#search');
const verdictFilter = document.querySelector('#verdict');
const familyFilter = document.querySelector('#family');
const stageOnly = document.querySelector('#stage-only');
const mediaFilter = document.querySelector('#media-filter');
const resultCount = document.querySelector('#result-count');
const contextNote = document.querySelector('#context-note');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeTimers = new WeakMap();
const activeFrames = new WeakMap();
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
    case 'count-up': return `<strong class="big-number" data-counter data-final="24800" role="img" aria-label="24,800, illustrative result">24,800</strong><small>Illustrative value · not real measurement</small>`;
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
    case 'pill': return `<div class="glide-pills" role="tablist" aria-label="Example sections" style="--selected:0"><button id="pill-${e.id}-0" type="button" role="tab" aria-controls="pill-panel-${e.id}" aria-selected="true" tabindex="0" data-action="pill" data-index="0">Discover</button><button id="pill-${e.id}-1" type="button" role="tab" aria-controls="pill-panel-${e.id}" aria-selected="false" tabindex="-1" data-action="pill" data-index="1">Show</button><button id="pill-${e.id}-2" type="button" role="tab" aria-controls="pill-panel-${e.id}" aria-selected="false" tabindex="-1" data-action="pill" data-index="2">Decide</button></div><small id="pill-panel-${e.id}" role="tabpanel" aria-labelledby="pill-${e.id}-0" aria-live="polite" data-pill-status>Discover section</small>`;
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
    case 'moving-bg': return `<div class="gemini-reveal-study">
 <div class="gemini-reveal" role="img" aria-label="Illustrative once-only blurred gradient reveal with soft rotation; original CSS study">
   <span class="gemini-aura gemini-aura-one" aria-hidden="true"></span>
   <span class="gemini-aura gemini-aura-two" aria-hidden="true"></span>
   <span class="gemini-aura gemini-aura-three" aria-hidden="true"></span>
   <span class="gemini-reveal-content"><span class="gemini-kicker">A NEW MOMENT</span><strong>Something extraordinary.</strong><span class="gemini-accent">✳</span></span>
 </div>
 <small class="footnote">Play once to reveal. The background settles; it never loops.</small>
</div>`;
    case 'thinking': return `<div class="thinking-study">
  <div class="thinking-stage" role="img" aria-label="Illustrative thinking animation; no real system is processing">
    <div class="thinking-mark" aria-hidden="true"><span>✳</span><strong>Thinking</strong></div>
    <div class="thinking-rail" aria-hidden="true"><span class="thinking-light"></span><span class="thinking-grain"></span></div>
  </div>
  <small class="footnote">Illustrative activity only · Play to see the short colour sweep</small>
</div>`;
    case 'slider': return `<div class="slider-wrap material-slider-study">
  <div class="slider-heading">
    <label for="range-${e.id}">Interaction intensity</label>
    <output class="slider-value" for="range-${e.id}">50%</output>
  </div>
  <div class="material-range" style="--position:50%">
    <div class="material-range-rail" aria-hidden="true">
      <span class="material-range-filled"></span>
      <span class="material-range-rest"></span>
      <span class="material-range-thumb"></span>
    </div>
    <input id="range-${e.id}" type="range" min="0" max="100" step="1" value="50" data-range aria-describedby="range-hint-${e.id}">
  </div>
  <div class="slider-extremes" aria-hidden="true"><span>Quiet</span><span>Bold</span></div>
  <small id="range-hint-${e.id}" class="footnote">Drag, tap, or use the arrow keys. The thumb compresses as you press.</small>
</div>`;
    case 'toggle': return `<label class="switch-line squishy-toggle">
  <span class="switch">
    <input type="checkbox" role="switch" aria-label="Live updates" aria-describedby="toggle-hint-${e.id}" aria-checked="false">
    <span class="switch-track" aria-hidden="true"></span>
  </span>
  <span class="switch-copy"><strong>Live updates</strong><span class="switch-status" aria-live="polite">Off</span></span>
</label><small id="toggle-hint-${e.id}" class="footnote">Tap and hold: the thumb squishes, then settles on release.</small>`;
    case 'wavy': return `<div class="wavy-bars" aria-label="Decorative equalizer sample">${[0,1,2,3,4,5].map(i=>`<i style="--i:${i}"></i>`).join('')}</div><small>One short sample, not a fake process</small>`;
    case 'icons': return `<div class="fill-icons" role="group" aria-label="Choose filled icon states">
  ${[
   ['heart','Heart','M12 21s-8.5-5.5-9.6-10.2C1.6 6.7 4.3 3 8.2 3c1.7 0 3.1.8 3.8 2 0.8-1.2 2.1-2 3.8-2 3.9 0 6.6 3.7 5.8 7.8C20.5 15.5 12 21 12 21z'],
   ['star','Star','M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.4 6.3 20.3l1.1-6.3L2.8 9.5l6.4-.9z'],
   ['bookmark','Bookmark','M6 3h12v18l-6-4-6 4z']
  ].map(([kind,label,shape])=>`<div class="icon-choice" data-icon-kind="${kind}">
    <button type="button" class="icon-button fill-icon" data-action="icon" data-kind="${kind}" aria-pressed="false" aria-label="Save ${label.toLowerCase()}">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="icon-fill" d="${shape}"/><path class="icon-outline" d="${shape}"/></svg>
    </button>
    <span class="icon-caption" aria-live="polite">${label} · off</span>
  </div>`).join('')}
</div><small class="footnote">Tap, hover or focus. Fill rises to confirm selection.</small>`;
    case 'header': return `<div class="collapse-study">
  <div class="collapse-viewport" tabindex="0" role="region" aria-label="Scroll within this mobile page to collapse its navigation">
    <div class="collapse-lead" aria-hidden="true"></div>
    <div class="collapse-header-frame">
      <nav class="collapse-nav" aria-label="Sample navigation">
        <a class="collapse-brand" href="#library" aria-label="Motion Atlas">motion<span>·</span></a>
        <span class="collapse-navlinks"><a href="#library">Gallery</a><a href="../">Kits</a></span>
        <span class="collapse-avatar" aria-hidden="true">M</span>
      </nav>
    </div>
    <div class="collapse-page">
      <strong>Scroll to focus.</strong>
      <p>A full-size header makes an entrance. Once you scroll, it gives the story more room.</p>
      <div class="collapse-feature"><span>01</span><b>Less chrome.<br>More content.</b></div>
      <p>Navigation remains visible, readable and usable through the transition.</p>
      <div class="collapse-feature alt"><span>02</span><b>One clear<br>destination.</b></div>
      <p>The compact layout never hides an important action.</p>
    </div>
  </div>
  ${button('Scroll down / return to top','header')}
  <small class="footnote">Scroll inside the panel or use the control.</small>
</div>`;
    case 'input': return `<div class="input-demo material-input-study">
  <div class="md-field">
    <input id="input-${e.id}" type="text" name="question" autocomplete="off" placeholder=" " aria-describedby="input-hint-${e.id}">
    <label for="input-${e.id}">What can we help with?</label>
  </div>
  <small id="input-hint-${e.id}" class="md-hint">Tap the field. Watch the underline wipe in, then type.</small>
</div>`;
    case 'carousel': return `<div class="carousel-shell carousel-focus-study">
  <div class="carousel-scroller" role="region" aria-roledescription="carousel" aria-label="Focus scaling: three original graphic panels" tabindex="0">
    <div class="carousel-item is-centered" tabindex="0" role="group" aria-roledescription="slide" aria-label="1 of 3: Discover"><span class="carousel-number">01</span><strong>Discover</strong><span class="carousel-detail">A better first impression.</span></div>
    <div class="carousel-item" tabindex="0" role="group" aria-roledescription="slide" aria-label="2 of 3: Connect"><span class="carousel-number">02</span><strong>Connect</strong><span class="carousel-detail">Show what changes.</span></div>
    <div class="carousel-item" tabindex="0" role="group" aria-roledescription="slide" aria-label="3 of 3: Deliver"><span class="carousel-number">03</span><strong>Deliver</strong><span class="carousel-detail">Make the moment land.</span></div>
  </div>
  <div class="carousel-actions"><button type="button" data-action="previous" aria-label="Previous carousel slide">←</button><span class="carousel-position" aria-live="polite">1 / 3</span><button type="button" data-action="next" aria-label="Next carousel slide">→</button></div>
  <small class="footnote">Scroll or use arrows. Centred item enlarges.</small>
</div>`;
    case 'odometer': return `${rollHTML('12,840')}${button('Roll to 24,715','odometer')}`;
    default: return `<div class="research-scene"><div class="research-symbol" aria-hidden="true">?</div><strong>No claimed reproduction</strong><span>Further source inspection required: ${title}</span></div>`;
  }
}
function cardHTML(e) {
 const research=e.family==='Research-only';
 const speculative=e.verdict==='Hold';
 const tagClass='verdict-'+e.verdict.replaceAll(' ','-');
 const stageTag=audience==='stage' && e.stage ? '<span class="tag stage-candidate">Stage candidate</span>' : '';
 const source=originalVideoLink(e);
 const sourceHTML=source.status==='verified'
   ? `<a class="source-link source-verified" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer" title="Verified individual video: ${esc(source.evidence)}">↗ Watch original ${esc(source.platform)} video</a>`
   : `<a class="source-link source-unverified" href="${esc(source.searchUrl)}" target="_blank" rel="noopener noreferrer" title="Search link only; exact source has not been verified">⌕ Find this video <span class="source-caveat">(unverified)</span></a>`;
 const clip=clips[String(e.id)];
 const clipHTML=research
   ? '<div class="clip-unavailable"><span aria-hidden="true">◇</span><strong>Not a visual effect</strong><small>No recording required</small></div>'
   : clip
      ? `<video class="clip-player" aria-label="Recorded Motion Atlas implementation for ${esc(e.title)}" controls muted playsinline loop preload="metadata" src="${esc(clip.path)}"></video>`
      : '<div class="clip-unavailable"><span aria-hidden="true">▻</span><strong>Recording pending</strong><small>Local capture not yet published</small></div>';
 return `<article class="card" data-id="${e.id}" data-stage="${audience==='stage'&&e.stage}" data-clip="${Boolean(clip)}" data-source="${source.status}">
  <div class="card-inner">
    <span class="card-index">STUDY ${String(e.id).padStart(3,'0')} / 075 · ${esc(e.family)}</span>
    <h3 class="card-title">${esc(e.title)}</h3>
    <div class="tags"><span class="tag ${tagClass}">${esc(e.verdict)}</span><span class="tag">${esc(e.priority)}</span>${stageTag}${speculative?'<span class="tag prototype-flag">Hypothesis</span>':''}</div>
  </div>
  <div class="comparison-row">
    <section class="comparison-pane" aria-label="Interactive version of ${esc(e.title)}">
      <div class="pane-heading"><strong>LIVE · INTERACTIVE</strong><span>Our implementation</span></div>
      <div class="preview" data-effect="${esc(e.preview)}"><div class="demo demo-${esc(e.preview)}">${previewFor(e)}</div></div>
    </section>
    <section class="comparison-pane recorded-pane" aria-label="Recorded version of ${esc(e.title)}">
      <div class="pane-heading"><strong>RECORDING</strong><span>${clip?'Short MP4 · our version':'Awaiting capture'}</span></div>
      <div class="clip-shell">${clipHTML}</div>
    </section>
  </div>
  <div class="card-bottom">
    <p class="card-note">${esc(e.note)}</p>
    <div class="card-foot">
      <div class="source-area">${sourceHTML}</div>
      ${research?' <span class="tag">No CSS trial</span>':clip?'<button type="button" class="replay compare-play" data-action="pair">▶ Compare both</button>':playButton(e.id)}
    </div>
  </div>
 </article>`;
}
function render(){
 const q=search.value.trim().toLowerCase(),v=verdictFilter.value,f=familyFilter.value,m=mediaFilter.value;
 const filtered=effects.filter(e=>
   (v==='all'||e.verdict===v) && (f==='all'||e.family===f) &&
   (!stageOnly.checked||e.stage) &&
   (m==='all'||(m==='exact'&&Boolean(verifiedVideos[e.id]))||(m==='unverified'&&!verifiedVideos[e.id])||(m==='ready'&&Boolean(clips[String(e.id)]))||(m==='pending'&&!clips[String(e.id)])) &&
   (!q || (e.title+' '+e.note+' '+e.family+' '+e.verdict).toLowerCase().includes(q)));
 cards.innerHTML=filtered.map(cardHTML).join('');
 resultCount.textContent=`${filtered.length} of ${effects.length} studies · ${Object.keys(verifiedVideos).length} verified individual source links · ${Object.keys(clips).length} recorded clips`;
 document.querySelector('#empty').hidden=filtered.length>0;
}
for(const name of [...new Set(effects.map(e=>e.family))].sort()){
 const opt=document.createElement('option');opt.value=name;opt.textContent=name;familyFilter.append(opt);
}
function settleCount(preview){
 const node=preview?.querySelector('[data-counter]');
 if(!node) return;
 const frame=activeFrames.get(preview);
 if(frame && typeof cancelAnimationFrame==='function') cancelAnimationFrame(frame);
 activeFrames.delete(preview);
 node.textContent=Number(node.dataset.final).toLocaleString('en-GB');
}
function animateCount(preview){
 const node=preview.querySelector('[data-counter]');
 if(!node) return;
 settleCount(preview);
 if(typeof requestAnimationFrame!=='function') return;
 const final=Number(node.dataset.final),duration=850;
 node.textContent='0';
 let start;
 const tick=now=>{
  if(motionPreference.matches || document.hidden || !preview.isConnected){settleCount(preview);return;}
  start??=now;
  const t=Math.min((now-start)/duration,1),ease=1-Math.pow(1-t,3);
  node.textContent=Math.round(final*ease).toLocaleString('en-GB');
  if(t<1)activeFrames.set(preview,requestAnimationFrame(tick));else settleCount(preview);
 };
 activeFrames.set(preview,requestAnimationFrame(tick));
}
function replay(preview) {
 if (!preview || motionPreference.matches || document.documentElement.classList.contains('motion-off')) return;
 preview.classList.remove('is-playing');
 // Restart this scoped one-shot only; do not autostart dozens of cards.
 void preview.offsetWidth;
 preview.classList.add('is-playing');
 if(preview.dataset.effect==='count-up')animateCount(preview);
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
   case 'pair':{
     replay(preview);
     // Pair real interaction with the actual MP4, not just decorative playback.
     if(preview.dataset.effect==='icons'){
       preview.querySelector('button[data-action="icon"]')?.click();
     }else if(preview.dataset.effect==='input'){
       const field=preview.querySelector('.md-field input');
       field?.blur();field?.focus();
     }else if(preview.dataset.effect==='toggle'){
       preview.querySelector('.squishy-toggle input')?.click();
     }else if(preview.dataset.effect==='header'){
       preview.querySelector('[data-action="header"]')?.click();
     }else if(preview.dataset.effect==='carousel'){
       const strip=preview.querySelector('.carousel-scroller');
       if(strip){
         const items=[...strip.querySelectorAll('.carousel-item')];
         const next=(nearestCarouselIndex(strip,items)+1)%items.length;
         focusCarouselItem(strip,items[next],!motionPreference.matches);
       }
     }
     const player=preview.closest('.card')?.querySelector('video.clip-player');
     if(player){player.currentTime=0;player.play()?.catch(()=>{});}
     break;
   }
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
   case 'icon':{
     const selected=btn.getAttribute('aria-pressed')!=='true';
     const kind=btn.dataset.kind||'heart';
     const label=kind[0].toUpperCase()+kind.slice(1);
     btn.setAttribute('aria-pressed',String(selected));
     btn.setAttribute('aria-label',selected?`Remove ${kind}`:`Save ${kind}`);
     const caption=btn.closest('.icon-choice')?.querySelector('.icon-caption');
     if(caption)caption.textContent=`${label} · ${selected?'on':'off'}`;
     break;
   }
   case 'header':{
     const viewport=preview.querySelector('.collapse-viewport');
     if(!viewport)break;
     const target=viewport.scrollTop>24?0:Math.min(viewport.scrollHeight-viewport.clientHeight,160);
     viewport.scrollTo({top:target,behavior:motionPreference.matches?'auto':'smooth'});
     break;
   }
   case 'next':case 'previous':{
     const strip=preview.querySelector('.carousel-scroller');
     if(!strip)break;
     const items=[...strip.querySelectorAll('.carousel-item')];
     const current=nearestCarouselIndex(strip,items);
     const next=Math.max(0,Math.min(items.length-1,current+(action==='next'?1:-1)));
     focusCarouselItem(strip,items[next],!motionPreference.matches);
     break;
   }
 }
}
function nearestCarouselIndex(strip,items=[...strip.querySelectorAll('.carousel-item')]) {
 if(!items.length)return 0;
 const centre=strip.getBoundingClientRect().left+strip.clientWidth/2;
 let closest=0, distance=Infinity;
 items.forEach((item,index)=>{
   const box=item.getBoundingClientRect();
   const delta=Math.abs(box.left+box.width/2-centre);
   if(delta<distance){distance=delta;closest=index;}
 });
 return closest;
}
function updateCarouselPosition(strip){
 const items=[...strip.querySelectorAll('.carousel-item')];
 if(!items.length)return;
 const selected=nearestCarouselIndex(strip,items);
 items.forEach((item,index)=>item.classList.toggle('is-centered',index===selected));
 const label=strip.closest('.carousel-shell')?.querySelector('.carousel-position');
 if(label && label.textContent!==`${selected+1} / ${items.length}`)label.textContent=`${selected+1} / ${items.length}`;
}
function focusCarouselItem(strip,item,animate=true){
 if(!item)return;
 const scroller=strip.getBoundingClientRect();
 const box=item.getBoundingClientRect();
 const target=strip.scrollLeft+(box.left+box.width/2)-(scroller.left+scroller.width/2);
 strip.scrollTo({left:target,behavior:animate?'smooth':'auto'});
 if(!animate)updateCarouselPosition(strip);
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
 if(output){output.textContent=btn.textContent+' section';output.setAttribute('aria-labelledby',btn.id);}
}
cards.addEventListener('click',event=>{
 const btn=event.target.closest('button');
 if(!btn || !cards.contains(btn)) return;
 const preview=btn.closest('.preview') || btn.closest('.card')?.querySelector('.preview');
 if(preview)doAction(btn,preview);
});
cards.addEventListener('keydown',event=>{
 const carousel=event.target.closest?.('.carousel-scroller');
 if(carousel && ['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){
   event.preventDefault();
   const items=[...carousel.querySelectorAll('.carousel-item')];
   const selected=nearestCarouselIndex(carousel,items);
   const target=event.key==='Home'?0:event.key==='End'?items.length-1:
     Math.max(0,Math.min(items.length-1,selected+(event.key==='ArrowRight'?1:-1)));
   focusCarouselItem(carousel,items[target],!motionPreference.matches);
 }
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
function updateFallbackNav(viewport){
 const nav=viewport.querySelector('.collapse-nav');
 if(!nav)return;
 // scroll-state containers own the primary implementation where supported;
 // this class is only a fallback for engines without the new CSS query.
 if(typeof CSS==='undefined'||!CSS.supports?.('container-type: scroll-state')){
   nav.classList.toggle('is-condensed',viewport.scrollTop>10);
 }
}
cards.addEventListener('scroll',event=>{
 if(event.target.matches?.('.collapse-viewport')){updateFallbackNav(event.target);return;}
 if(!event.target.matches?.('.carousel-scroller'))return;
 const strip=event.target;
 if(strip.__focusFrame)return;
 strip.__focusFrame=requestAnimationFrame(()=>{
   strip.__focusFrame=0;
   updateCarouselPosition(strip);
 });
},{capture:true,passive:true});
cards.addEventListener('change',event=>{
 const input=event.target;
 if(!input.matches?.('.squishy-toggle input[type="checkbox"]'))return;
 input.setAttribute('aria-checked',String(input.checked));
 const text=input.closest('.squishy-toggle')?.querySelector('.switch-status');
 if(text)text.textContent=input.checked?'On':'Off';
});
cards.addEventListener('input',event=>{
 if(event.target.matches('[data-range]')){
  const slider=event.target.closest('.slider-wrap');
  const output=slider?.querySelector('output');
  const input=event.target;
  const min=Number(input.min), max=Number(input.max);
  const progress=max>min?Math.max(0,Math.min(100,(Number(input.value)-min)/(max-min)*100)):0;
  slider?.querySelector('.material-range')?.style.setProperty('--position',progress+'%');
  if(output){output.value=input.value+'%';output.textContent=input.value+'%';}
 }
});
motionPreference.addEventListener?.('change',()=>{document.querySelectorAll('.preview').forEach(settleCount);});
document.addEventListener('visibilitychange',()=>{if(document.hidden) document.querySelectorAll('.preview').forEach(settleCount);});
for(const control of [search,verdictFilter,familyFilter,mediaFilter,stageOnly])
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
 search.value='';verdictFilter.value='all';familyFilter.value='all';mediaFilter.value='all';stageOnly.checked=false;render();search.focus();
});
render();
