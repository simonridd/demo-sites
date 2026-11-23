import {renderStudy} from './effects/studies.mjs';
import {mountEffects} from './effects/atlas.mjs';

import {effects,researchCount} from './effects-data.mjs';
import {originalVideoLink,verifiedVideos} from './source-videos.mjs';
import {clips} from './clip-manifest.mjs';
import {imagekitAvatarVariants,publicDemoPortrait} from './imagekit-avatar.mjs';

const cards = document.querySelector('#cards');
const search = document.querySelector('#search');
const verdictFilter = document.querySelector('#verdict');
const familyFilter = document.querySelector('#family');
const stageOnly = document.querySelector('#stage-only');
const screenshotsOnly = document.querySelector('#screenshots-only');
const mediaFilter = document.querySelector('#media-filter');
const resultCount = document.querySelector('#result-count');
const contextNote = document.querySelector('#context-note');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeTimers = new WeakMap();
const activeFrames = new WeakMap();
let audience = 'stage';
let atlasMount=null;
const ambientReturnTimers=new WeakMap();
let activeAmbientButton=null;
function setAmbientPressed(button,pressed,immediate=false){
 const stage=button?.closest?.('.gemini-reveal.is-ambient');
 if(!stage)return;
 const previous=ambientReturnTimers.get(stage);
 if(previous)clearTimeout(previous);
 ambientReturnTimers.delete(stage);
 if(pressed){stage.classList.add('is-fast');return;}
 if(immediate){stage.classList.remove('is-fast');return;}
 ambientReturnTimers.set(stage,setTimeout(()=>{
  stage.classList.remove('is-fast');
  ambientReturnTimers.delete(stage);
 },2000));
}
function releaseAmbient(immediate=false){
 if(!activeAmbientButton)return;
 setAmbientPressed(activeAmbientButton,false,immediate);
 activeAmbientButton=null;
}

let ambientObserver=null;
function observeAmbient(){
 ambientObserver?.disconnect();
 ambientObserver=null;
 const stage=cards.querySelector('.gemini-reveal.is-ambient');
 if(!stage)return;
 if(typeof IntersectionObserver!=='function')return;
 ambientObserver=new IntersectionObserver(entries=>{
   for(const entry of entries)entry.target.classList.toggle('is-offscreen',!entry.isIntersecting);
 },{threshold:0.08});
 ambientObserver.observe(stage);
}

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
  return `<div class="research-scene"><div class="research-symbol" aria-hidden="true">${icon}</div><strong>Research, not a CSS effect</strong><span>${esc(e.note)}</span>${[35,37].includes(e.id)?'<a href="./effects/hotspots.html">Try the native media-hotspot prototype</a>':''}</div>`;
}
function previewFor(e) {
  const upgraded=renderStudy(e.preview,e.id);
  if(upgraded!==null)return upgraded;
  if (e.family === 'Research-only') return researchPreview(e);
  const title = esc(e.title);
  const simple = (visual, caption = '') => `${visual}${caption ? `<small class="footnote">${caption}</small>` : ''}`;
  switch(e.preview) {
    case 'checkbox': return `<label class="check-line"><input type="checkbox" checked><span>Keep me updated</span></label><small>Native control, intentional accent</small>`;
    case 'button': return simple(`<button type="button" class="demo-button" data-action="replay">See the difference ↗</button>`,'Hover, focus and press');
    case 'button-looks': return `<div class="premium-button-study">
      <button type="button" class="premium-action" data-action="premium-button" aria-pressed="false" aria-label="Toggle the premium button selection">
        <span class="premium-action-copy">Make an impression</span><span class="premium-action-icon" aria-hidden="true">↗</span>
      </button>
      <small class="footnote premium-status" aria-live="polite">Tap the button · watch its layered light and pressed state</small>
    </div>`;
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
    case 'superellipse': return `<div class="superellipse-study">
  <div class="superellipse-comparison">
    <div class="superellipse-cell">
      <div class="superellipse-app-icon superellipse-round" aria-hidden="true"><span>✳</span></div>
      <span class="superellipse-caption">border-radius</span>
    </div>
    <div class="superellipse-cell">
      <div class="superellipse-app-icon superellipse-continuous" data-superellipse-tile style="--icon-curvature:2" aria-hidden="true"><span>✳</span></div>
      <span class="superellipse-caption">superellipse()</span>
    </div>
  </div>
  <div class="superellipse-curve">
    <label for="superellipse-range-${e.id}">Corner curvature <output for="superellipse-range-${e.id}" data-superellipse-value>2.00</output></label>
    <input id="superellipse-range-${e.id}" type="range" min="1" max="4" step=".25" value="2" data-superellipse-range aria-describedby="superellipse-hint-${e.id}">
  </div>
  <small id="superellipse-hint-${e.id}" class="footnote">Adjust the icon curvature. Older browsers use a computed shape fallback.</small>
</div>`;
    case 'video-ratio': return `<span class="candidate-label">Unverified — media trial</span><div class="video-box">16:9</div>${button('Toggle aspect ratio','ratio')}`;
    case 'pill': return `<div class="glide-pills" role="tablist" aria-label="Example sections" style="--selected:0"><button id="pill-${e.id}-0" type="button" role="tab" aria-controls="pill-panel-${e.id}" aria-selected="true" tabindex="0" data-action="pill" data-index="0">Discover</button><button id="pill-${e.id}-1" type="button" role="tab" aria-controls="pill-panel-${e.id}" aria-selected="false" tabindex="-1" data-action="pill" data-index="1">Show</button><button id="pill-${e.id}-2" type="button" role="tab" aria-controls="pill-panel-${e.id}" aria-selected="false" tabindex="-1" data-action="pill" data-index="2">Decide</button></div><small id="pill-panel-${e.id}" role="tabpanel" aria-labelledby="pill-${e.id}-0" aria-live="polite" data-pill-status>Discover section</small>`;
    case 'price-roll': return `${rollHTML('129.00','£')}${button('Compare £249.00','price')}`;
    case 'transform-candidate': return `<span class="candidate-label">Unverified — transformation</span><div class="visual-hero"><span>Shape shift</span></div>`;
    case 'holo': return `<div class="holo-tick" role="img" aria-label="Decorative check, no task success implied">✓</div><small>Decorative only · not verification</small>`;
    case 'photo-candidate': return `<span class="candidate-label">Unverified — artwork trial</span><div class="visual-hero"><span>Original geometry</span></div>`;
    case 'formats': return `<div class="format-mock"><i>WebP</i><i>AVIF</i></div><small>Compare measured bytes, not labels</small>`;
    case 'vector-logo': return `<div class="vector-logo" aria-label="Original illustrative K mark">k↗</div><small>Use licensed client marks in real work</small>`;
    case 'unknown-shape': return `<span class="candidate-label">Unverified — shape study</span><div class="squircle">◇</div>`;
    case 'shine': return `<div class="shine-study">
  <button class="shine-card shine-card-premium" type="button" data-action="shine-play" aria-label="Replay premium card light sweep">
    <span class="shine-corner" aria-hidden="true">ATLAS / 050</span>
    <span class="shine-graphic" aria-hidden="true"><span class="shine-orb"></span><span class="shine-orbit"></span></span>
    <span class="shine-copy"><span>THE ART OF THE REVEAL</span><strong>Make it<br>memorable.</strong></span>
    <span class="shine-icon" aria-hidden="true">↗</span>
  </button>
  <small class="footnote">Hover, focus or tap to replay one soft light sweep.</small>
</div>`;
    case 'music-glow': return `<div class="music-glow" aria-hidden="true">♪</div><small>Abstract colour study, not an app clone</small>`;
    case 'video-controls': return `<span class="candidate-label">Unverified — controller trial</span><div class="video-box">▶</div><small>Real playback needs a real media element</small>`;
    case 'gradient': return `<div class="gradient-grain-study">
  <div class="gradient-grain-samples">
    <div class="grain-swatch"><strong>Flat</strong><small>smooth interpolation</small></div>
    <div class="grain-swatch with-grain is-textured" data-grain="true"><strong>Textured</strong><small>same gradient + grain</small></div>
  </div>
  <button type="button" class="small-action" data-action="grain" aria-pressed="true">Grain on · compare</button>
  <small class="footnote">The subtle noise layer uses SVG feTurbulence, mixed at 15% opacity.</small>
</div>`;
    case 'fab': return `<div class="fab-wrap"><div class="fab-options" hidden><button type="button" aria-label="Note" data-action="fab-choice">✎</button><button type="button" aria-label="Share" data-action="fab-choice">↗</button></div><button class="fab-main" type="button" data-action="fab" aria-expanded="false" aria-label="Open optional tools">＋</button></div><small>Secondary actions only</small>`;
    case 'blur': return `<div class="blur-comparison-study" data-material="android">
   <div class="blur-choice" role="group" aria-label="Compare translucent surface treatments">
     <button type="button" data-action="blur-mode" data-mode="android" aria-pressed="true">Android blur</button>
     <button type="button" data-action="blur-mode" data-mode="liquid" aria-pressed="false">Liquid Glass-inspired</button>
   </div>
   <div class="blur-example">
      <div class="blur-art" aria-hidden="true"><span class="blur-sphere"></span><span class="blur-stripe"></span><span class="blur-spot"></span></div>
      <div class="blur-pane material-glass" aria-hidden="true"><span class="material-glyph">✦</span><span class="material-title">A little clarity.</span><span class="material-description">One clear moment.</span></div>
   </div>
   <small class="footnote" data-blur-caption>Android-style soft backdrop. Contrast is preserved.</small>
 </div>${renderStudy("refraction",e.id)}`;
    case 'split': return `<div class="split-popover-study">
   <div class="split-wrap">
     <button class="split-primary" type="button" data-action="split-primary">Present <span aria-hidden="true">↗</span></button>
     <button class="split-chevron" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="split-options-${e.id}" data-action="split-menu" aria-label="More presentation actions">⌄</button>
     <div id="split-options-${e.id}" class="split-menu-items" popover="auto" role="menu" hidden aria-label="Presentation alternatives">
       <button type="button" role="menuitem" data-action="split-choice"><span aria-hidden="true">✎</span> Open notes</button>
       <button type="button" role="menuitem" data-action="split-choice"><span aria-hidden="true">◫</span> Preview slides</button>
       <button type="button" role="menuitem" data-action="split-choice"><span aria-hidden="true">▣</span> Export summary</button>
     </div>
   </div>
   <small aria-live="polite" data-feedback>One primary action. Options stay secondary.</small>
 </div>`;
    case 'sparkles': return `<div class="sparkles">One big idea.</div><small>Short theatrical emphasis</small>`;
    case 'css-logo': return `<div class="css-logo" aria-label="Experimental letter C logo">C</div><small>Own artwork, not a client mark</small>`;
    case 'nudge': return `<div class="nudge-message">One new insight for you.</div>${button('Nudge once','replay')}`;
    case 'squeeze': return `<div class="pixel-squeeze-study">
   <div class="pixel-squeeze-canvas" aria-label="Original experimental pixel-style squeeze, no application action" role="img">
     <span class="pixel-grid" aria-hidden="true"></span><span class="pixel-squeeze-label">MAKE IT<br>MOVE.</span><span class="pixel-glitch" aria-hidden="true"></span>
   </div>
   <button class="demo-button" data-action="replay" type="button">▶ Squeeze once</button>
   <small class="footnote">Experimental stage transition · original CSS, not recovered creator source.</small>
 </div>`;
    case 'moving-bg': return `<div class="gemini-reveal-study">
 <div class="gemini-reveal is-ambient" role="group" aria-label="Continuous ambient blurred-gradient demonstration">
   <span class="gemini-aura gemini-aura-one" aria-hidden="true"></span>
   <span class="gemini-aura gemini-aura-two" aria-hidden="true"></span>
   <span class="gemini-aura gemini-aura-three" aria-hidden="true"></span>
   <span class="gemini-reveal-content"><span class="gemini-kicker">ALWAYS IN MOTION</span><strong>A living backdrop.</strong><span class="gemini-accent">✳</span></span>
   <div class="gemini-motion-controls">
     <button type="button" data-action="ambient-toggle" aria-pressed="false" aria-label="Pause ambient background movement">Pause</button>
     <button type="button" class="gemini-activity" aria-describedby="gemini-hint-${e.id}">Hold to accelerate</button>
   </div>
 </div>
 <small id="gemini-hint-${e.id}" class="footnote">Continuous 9-second drift. Hold to speed up to 2 seconds; release to return after a 2-second delay. Reduced motion stays static.</small>
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
    case 'chips': return `<div class="chips-study">
  <div class="chips-strip" role="group" aria-label="Filter example showcases">
    ${['All','Retail','Finance','Travel','Support'].map((v,i)=>`<button type="button" data-action="filter-chip" data-chip="${v.toLowerCase()}" aria-pressed="${i===0}" class="filter-chip">${v}</button>`).join('')}
  </div>
  <div class="chips-results" aria-live="polite" aria-atomic="true">
    <div data-sample="retail"><b>01</b><strong>Retail journeys</strong></div>
    <div data-sample="finance"><b>02</b><strong>Financial services</strong></div>
    <div data-sample="travel"><b>03</b><strong>Travel experiences</strong></div>
    <div data-sample="support"><b>04</b><strong>Customer support</strong></div>
  </div>
  <small class="chips-caption">All categories · 4 results</small>
</div>`;
    case 'image-glow': return `<div class="image-glow-study">
   <div class="image-glow-stage is-glowing" data-glow="true">
     <img class="image-glow-halo" src="./assets/077-glow-bloom.svg" alt="" aria-hidden="true" decoding="async">
     <img class="image-glow-image" src="./assets/077-glow-bloom.svg" alt="Original iridescent geometric bloom" decoding="async">
   </div>
   <button type="button" class="small-action" data-action="image-glow" aria-pressed="true">Glow on · compare</button>
   <small class="footnote">A blurred copy of the same transparent artwork creates the coloured halo.</small>
</div>`;

    case 'neon-text': return `<div class="neon-text-study">
  <div class="neon-sign" data-lit="false" role="group" aria-label="Illustrative neon sign">
    <span class="neon-sign-frame" aria-hidden="true"></span>
    <strong class="neon-sign-words">AFTER <em>DARK</em></strong>
    <span class="neon-sign-caption">IDEAS THAT STAY WITH YOU</span>
  </div>
  <button type="button" class="neon-switch" data-action="neon-toggle" aria-pressed="false" aria-label="Turn neon sign on">Light the sign <span aria-hidden="true">✦</span></button>
  <small class="footnote neon-status" aria-live="polite">Neon off · type remains readable</small>
</div>`;
    case 'holo-ticket': return `<div class="holo-ticket-study">
  <div class="holo-ticket" data-tilted="false" role="group" aria-label="Original holographic conference invitation concept; not a valid event admission">
    <div class="holo-ticket-foil" aria-hidden="true"></div>
    <div class="holo-ticket-details">
      <div class="holo-ticket-top"><span>ATLAS / FUTURES</span><span>CONCEPT PASS · 001</span></div>
      <div class="holo-ticket-center"><span>DESIGN SYSTEMS · EXPERIENCE</span><strong>THE NEXT<br>CHAPTER.</strong><span>EXPLORING WHAT'S POSSIBLE</span></div>
      <div class="holo-ticket-bottom"><span>EXPERIMENTAL ADMISSION</span><span>NOT VALID FOR ENTRY</span></div>
    </div>
    <div class="holo-ticket-rim" aria-hidden="true"></div>
  </div>
  <button type="button" class="holo-ticket-toggle" data-action="ticket-tilt" aria-pressed="false" aria-label="Tilt holographic ticket to change its light angle">Tilt for the light ↗</button>
  <small class="footnote">Fictional event pass. Tilt and foil are visual experiments, not a real ticket.</small>
</div>`;
    case 'face-crop': return `<div class="face-crop-study">
  <div class="avatar-crop-comparison">
    <figure class="avatar-crop-before">
      <img src="https://ik.imagekit.io/ikmedia/docs_images/examples/example_portrait_1.jpg" alt="ImageKit public demonstration portrait before processing" loading="lazy" width="280" height="160">
      <figcaption>Original image</figcaption>
    </figure>
    <figure class="avatar-crop-after">
      <img class="face-crop-result" data-crop="face" src="https://ik.imagekit.io/ikmedia/docs_images/examples/example_portrait_1.jpg?tr=w-224,h-224,fo-face" alt="ImageKit face-aware square crop of the public demonstration portrait" loading="lazy" width="150" height="150">
      <figcaption class="face-crop-caption">Face-aware</figcaption>
    </figure>
  </div>
  <div class="avatar-mode-options" role="group" aria-label="Compare avatar crop modes">
    <button type="button" data-action="avatar-mode" data-crop-mode="center" aria-pressed="false">Centre</button>
    <button type="button" data-action="avatar-mode" data-crop-mode="face" aria-pressed="true">Face-aware</button>
    <button type="button" data-action="avatar-mode" data-crop-mode="circle" aria-pressed="false">Circle</button>
  </div>
  <label class="avatar-public-label" for="avatar-url-${e.id}">Try a public ImageKit portrait URL</label>
  <div class="avatar-try-url">
    <input id="avatar-url-${e.id}" type="url" data-avatar-url value="https://ik.imagekit.io/ikmedia/docs_images/examples/example_portrait_1.jpg" autocomplete="off" spellcheck="false" aria-describedby="avatar-url-hint-${e.id}">
    <button type="button" data-action="avatar-load">Preview</button>
  </div>
  <small class="avatar-load-status" role="status" aria-live="polite" id="avatar-url-hint-${e.id}">Using ImageKit's public documentation portrait; no account connection or uploads.</small>
  <details class="avatar-video-example">
    <summary>Try face-tracked video (public demo)</summary>
    <video controls playsinline preload="none" aria-label="ImageKit public example of face-tracked portrait video" width="200" height="260">
      <source src="https://ik.imagekit.io/demo/speak-phone.mp4?tr=fo-face,ar-9_16" type="video/mp4">
      Your browser cannot play this example video.
    </video>
    <small>ImageKit processes the face tracking remotely when requested. No autoplay or private content.</small>
    <a href="https://imagekit.io/docs/video-resize-and-crop" target="_blank" rel="noopener noreferrer">ImageKit video face-crop documentation</a>
  </details>
  <small class="footnote">These are real ImageKit URL transformations, not simulated face detection. Use only public images you have permission to process.</small>
</div>`;
    default: return `<div class="research-scene"><div class="research-symbol" aria-hidden="true">?</div><strong>No claimed reproduction</strong><span>Further source inspection required: ${title}</span></div>`;
  }
}
function cardHTML(e) {
 const research=e.family==='Research-only';
 const speculative=e.verdict==='Hold';
 const tagClass='verdict-'+e.verdict.replaceAll(' ','-');
 const stageTag=audience==='stage' && e.stage ? '<span class="tag stage-candidate">Stage candidate</span>' : '';
 const suppliedTag=e.screenshotProvided?'<span class="tag screenshot-supplied">Screenshot supplied</span>':'';
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
    <span class="card-index">STUDY ${String(e.id).padStart(3,'0')} / ${String(effects.length).padStart(3,'0')} · ${esc(e.family)}</span>
    <h3 class="card-title">${esc(e.title)}</h3>
    <div class="tags"><span class="tag ${tagClass}">${esc(e.verdict)}</span><span class="tag">${esc(e.priority)}</span>${stageTag}${suppliedTag}${speculative?'<span class="tag prototype-flag">Hypothesis</span>':''}</div>
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
   (!screenshotsOnly.checked||e.screenshotProvided) &&
   (m==='all'||(m==='exact'&&Boolean(verifiedVideos[e.id]))||(m==='unverified'&&!verifiedVideos[e.id])||(m==='ready'&&Boolean(clips[String(e.id)]))||(m==='pending'&&!clips[String(e.id)])) &&
   (!q || (e.title+' '+e.note+' '+e.family+' '+e.verdict).toLowerCase().includes(q)));
 releaseAmbient(true);
 atlasMount?.destroy();
 cards.innerHTML=filtered.map(cardHTML).join('');
 atlasMount=mountEffects(cards);
 for(const tile of cards.querySelectorAll?.('[data-superellipse-tile]')||[])applySuperellipseFallback(tile,Number(tile.style.getPropertyValue('--icon-curvature'))||2);
 observeAmbient();
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
 const portable=atlasMount?.controllers.find(effect=>preview?.contains(effect.root));
 if(portable){portable.play();return;}
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
function closeSplitMenu(preview,focus=false){
 const menu=preview?.querySelector('.split-menu-items');
 const trigger=preview?.querySelector('[data-action="split-menu"]');
 if(!menu||!trigger)return;
 if(typeof menu.hidePopover==='function'){
   try{if(menu.matches(':popover-open'))menu.hidePopover();}catch{ /* older CSS selector fallback */ }
 }
 menu.hidden=true;menu.dataset.open='false';
 trigger.setAttribute('aria-expanded','false');
 if(focus)trigger.focus();
}
function toggleSplitMenu(preview){
 const menu=preview.querySelector('.split-menu-items');
 const trigger=preview.querySelector('[data-action="split-menu"]');
 if(!menu||!trigger)return;
 if(menu.dataset.open==='true'){closeSplitMenu(preview,true);return;}
 const rect=trigger.getBoundingClientRect();
 menu.hidden=false;
 if(typeof menu.showPopover==='function'){
   try{
     menu.showPopover();
     // Top-layer popovers are positioned near their own trigger, even when
     // the gallery is clipped or scrolled.
     menu.style.position='fixed';
     menu.style.top=Math.min(window.innerHeight-160,rect.bottom+7)+'px';
     menu.style.left=Math.max(8,Math.min(window.innerWidth-188,rect.right-182))+'px';
   }catch{menu.removeAttribute('popover');menu.hidden=false;}
 }
 menu.dataset.open='true';trigger.setAttribute('aria-expanded','true');
 menu.querySelector('[role="menuitem"]')?.focus();
}
function doAction(btn,preview){
 const action=btn.dataset.action;
 switch(action){
   case 'replay': replay(preview);break;
   case 'pair':{
     replay(preview);
     // Pair real interaction with the actual MP4, not just decorative playback.
     if(preview.dataset.effect==='face-crop'){
       const chosen=preview.querySelector('[data-action="avatar-mode"][data-crop-mode="circle"]');
       chosen?.click();
     }else if(preview.dataset.effect==='holo-ticket'){
       preview.querySelector('[data-action="ticket-tilt"]')?.click();
     }else if(preview.dataset.effect==='neon-text'){
       const toggle=preview.querySelector('[data-action="neon-toggle"]');
       if(toggle?.getAttribute('aria-pressed')!=='true')toggle?.click();
     }else if(preview.dataset.effect==='shine'){
       preview.querySelector('[data-action="shine-play"]')?.focus();
     }else if(preview.dataset.effect==='moving-bg'){
       const stage=preview.querySelector('.gemini-reveal');
       if(stage?.classList.contains('is-paused'))preview.querySelector('[data-action="ambient-toggle"]')?.click();
     }else if(preview.dataset.effect==='gradient'){
       preview.querySelector('[data-action="grain"]')?.click();
     }else if(preview.dataset.effect==='image-glow'){
       preview.querySelector('[data-action="image-glow"]')?.click();
     }else if(preview.dataset.effect==='chips'){
       preview.querySelector('.filter-chip[data-chip="retail"]')?.click();
     }else if(preview.dataset.effect==='icons'){
       preview.querySelector('button[data-action="icon"]')?.click();
     }else if(preview.dataset.effect==='input'){
       const field=preview.querySelector('.md-field input');
       field?.blur();field?.focus();
     }else if(preview.dataset.effect==='button-looks'){
       preview.querySelector('[data-action="premium-button"]')?.click();
     }else if(preview.dataset.effect==='toggle'){
       preview.querySelector('.squishy-toggle input')?.click();
     }else if(preview.dataset.effect==='blur'){
       preview.querySelector('[data-action="blur-mode"][data-mode="liquid"]')?.click();
     }else if(preview.dataset.effect==='split'){
       toggleSplitMenu(preview);
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
     if(player){player.currentTime=0;if(!motionPreference.matches)player.play()?.catch(()=>{});}
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
   case 'avatar-mode':{
     const study=preview.querySelector('.face-crop-study');
     const result=study?.querySelector('.face-crop-result');
     const input=study?.querySelector('[data-avatar-url]');
     if(!result||!input)break;
     const mode=btn.dataset.cropMode;
     if(!['center','face','circle'].includes(mode))break;
     try{
       const variants=imagekitAvatarVariants(input.value,224);
       for(const option of study.querySelectorAll('[data-action="avatar-mode"]'))option.setAttribute('aria-pressed',String(option===btn));
       result.src=variants[mode];
       result.dataset.crop=mode;
       result.alt=mode==='center'?'Centre-cropped public demonstration portrait':mode==='circle'?'Face-aware circular portrait crop':'Face-aware square portrait crop';
       study.querySelector('.face-crop-caption').textContent=mode==='circle'?'Circular face crop':mode==='center'?'Centre crop':'Face-aware';
       study.querySelector('.avatar-load-status').textContent='Selected '+(mode==='center'?'centre crop':mode==='circle'?'circular face crop':'face-aware crop')+' · real ImageKit transformation';
     }catch(error){
       study.querySelector('.avatar-load-status').textContent=error.message;
     }
     break;
   }
   case 'avatar-load':{
     const study=preview.querySelector('.face-crop-study');
     const input=study?.querySelector('[data-avatar-url]');
     if(!input)break;
     try{
       const variants=imagekitAvatarVariants(input.value,224);
       study.querySelector('.avatar-crop-before img').src=variants.original;
       const selected=study.querySelector('[data-action="avatar-mode"][aria-pressed="true"]');
       const mode=selected?.dataset.cropMode||'face';
       study.querySelector('.face-crop-result').src=variants[mode];
       study.querySelector('.face-crop-result').dataset.crop=mode;
       study.querySelector('.avatar-load-status').textContent='Previewing the selected public ImageKit image URL';
     }catch(error){
       study.querySelector('.avatar-load-status').textContent=error.message;
     }
     break;
   }
   case 'ticket-tilt':{
     const ticket=preview.querySelector('.holo-ticket');
     if(!ticket)break;
     const tilted=btn.getAttribute('aria-pressed')!=='true';
     btn.setAttribute('aria-pressed',String(tilted));
     ticket.dataset.tilted=String(tilted);
     btn.textContent=tilted?'Return to front':'Tilt for the light ↗';
     break;
   }
   case 'neon-toggle':{
     const study=preview.querySelector('.neon-text-study');
     const sign=study?.querySelector('.neon-sign');
     if(!sign)break;
     const lit=btn.getAttribute('aria-pressed')!=='true';
     sign.dataset.lit=String(lit);
     btn.setAttribute('aria-pressed',String(lit));
     btn.setAttribute('aria-label',lit?'Turn neon sign off':'Turn neon sign on');
     btn.innerHTML=lit?'Switch off <span aria-hidden="true">✦</span>':'Light the sign <span aria-hidden="true">✦</span>';
     const status=study.querySelector('.neon-status');
     if(status)status.textContent=lit?'Neon on · decorative effect':'Neon off · type remains readable';
     sign.classList.remove('is-igniting');
     if(lit&&!motionPreference.matches&&!document.documentElement.classList.contains('motion-off')){
       void sign.offsetWidth;
       sign.classList.add('is-igniting');
     }
     break;
   }
   case 'shine-play': replay(preview);break;
   case 'ambient-toggle':{
     const stage=preview.querySelector('.gemini-reveal');
     if(!stage)break;
     const paused=stage.classList.toggle('is-paused');
     btn.setAttribute('aria-pressed',String(paused));
     btn.setAttribute('aria-label',paused?'Resume ambient background movement':'Pause ambient background movement');
     btn.textContent=paused?'Resume':'Pause';
     break;
   }
   case 'premium-button':{
     const selected=btn.getAttribute('aria-pressed')!=='true';
     btn.setAttribute('aria-pressed',String(selected));
     const status=btn.closest('.premium-button-study')?.querySelector('.premium-status');
     if(status)status.textContent=selected?'Selected · tap again to clear':'Not selected · ready to explore';
     break;
   }
   case 'grain':{
     const textured=btn.closest('.gradient-grain-study')?.querySelector('.with-grain');
     const enabled=btn.getAttribute('aria-pressed')!=='true';
     btn.setAttribute('aria-pressed',String(enabled));
     if(textured){textured.classList.toggle('is-textured',enabled);textured.dataset.grain=String(enabled);}
     btn.textContent=enabled?'Grain on · compare':'Grain off · compare';
     break;
   }
   case 'filter-chip':{
     const study=btn.closest('.chips-study');
     const value=btn.dataset.chip||'all';
     for(const chip of study.querySelectorAll('[data-action="filter-chip"]'))chip.setAttribute('aria-pressed',String(chip===btn));
     let count=0;
     for(const item of study.querySelectorAll('[data-sample]')){
       item.hidden=value!=='all'&&item.dataset.sample!==value;
       if(!item.hidden)count++;
     }
     const caption=study.querySelector('.chips-caption');
     if(caption)caption.textContent=(value==='all'?'All categories':btn.textContent)+' · '+count+' '+(count===1?'result':'results');
     break;
   }
   case 'image-glow':{
     const study=btn.closest('.image-glow-study');
     const stage=study?.querySelector('.image-glow-stage');
     const enabled=btn.getAttribute('aria-pressed')!=='true';
     btn.setAttribute('aria-pressed',String(enabled));
     if(stage){stage.classList.toggle('is-glowing',enabled);stage.dataset.glow=String(enabled);}
     btn.textContent=enabled?'Glow on · compare':'Glow off · compare';
     break;
   }
   case 'split-menu':toggleSplitMenu(preview);break;
   case 'split-choice':{
      const selected=btn.textContent.trim();
      closeSplitMenu(preview,true);
      preview.querySelector('[data-feedback]').textContent=selected+' · example only';
      break;
   }
   case 'split-primary':{
      closeSplitMenu(preview);
      preview.querySelector('[data-feedback]').textContent='Present · example only';
      break;
   }
   case 'blur-mode':{
      const example=preview.querySelector('.blur-comparison-study');
      if(!example)break;
      const mode=btn.dataset.mode==='liquid'?'liquid':'android';
      example.dataset.material=mode;
      for(const choice of example.querySelectorAll('[data-action="blur-mode"]'))choice.setAttribute('aria-pressed',String(choice===btn));
      const caption=example.querySelector('[data-blur-caption]');
      if(caption)caption.textContent=mode==='liquid'?'Liquid Glass-inspired: brighter highlights and a soft refractive illusion.':'Android-style soft backdrop. Contrast is preserved.';
      break;
   }
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
cards.addEventListener('toggle',event=>{
 const menu=event.target;
 if(!menu.matches?.('.split-menu-items'))return;
 const trigger=menu.closest('.preview')?.querySelector('[data-action="split-menu"]');
 const open=event.newState==='open';
 menu.dataset.open=String(open);
 if(!open)menu.hidden=true;
 trigger?.setAttribute('aria-expanded',String(open));
},{capture:true});
document.addEventListener('pointerdown',event=>{
 for(const menu of cards.querySelectorAll('.split-menu-items[data-open="true"]')){
   if(typeof menu.showPopover==='function')continue; // native light-dismiss
   const wrapper=menu.closest('.split-wrap');
   if(wrapper && !wrapper.contains(event.target))closeSplitMenu(wrapper.closest('.preview'));
 }
});
cards.addEventListener('error',event=>{
 const img=event.target;
 if(!img.matches?.('.face-crop-study img'))return;
 const status=img.closest('.face-crop-study')?.querySelector('.avatar-load-status');
 if(status)status.textContent='The remote ImageKit image could not be loaded. Try a different public URL.';
},true);
cards.addEventListener('pointerdown',event=>{
 const btn=event.target.closest?.('.gemini-activity');
 if(!btn)return;
 if(activeAmbientButton&&activeAmbientButton!==btn)releaseAmbient(true);
 activeAmbientButton=btn;
 setAmbientPressed(btn,true);
});
document.addEventListener('pointerup',()=>releaseAmbient());
document.addEventListener('pointercancel',()=>releaseAmbient());
cards.addEventListener('keydown',event=>{
 const btn=event.target.closest?.('.gemini-activity');
 if(!btn||![' ','Enter','Space'].includes(event.key)||event.repeat)return;
 activeAmbientButton=btn;
 setAmbientPressed(btn,true);
});
cards.addEventListener('keyup',event=>{
 const btn=event.target.closest?.('.gemini-activity');
 if(btn&&[' ','Enter','Space'].includes(event.key))releaseAmbient();
});
document.addEventListener('focusout',event=>{
 if(event.target===activeAmbientButton)releaseAmbient(true);
},true);
cards.addEventListener('click',event=>{
 const btn=event.target.closest('button');
 if(!btn || !cards.contains(btn)) return;
 const preview=btn.closest('.preview') || btn.closest('.card')?.querySelector('.preview');
 if(preview)doAction(btn,preview);
});
cards.addEventListener('keydown',event=>{
 const chip=event.target.closest?.('.chips-strip .filter-chip');
 if(chip&&['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){
   event.preventDefault();
   const strip=chip.closest('.chips-strip');
   const tabs=[...strip.querySelectorAll('.filter-chip')];
   const index=tabs.indexOf(chip);
   const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
     (index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   tabs[next].focus();
   tabs[next].click();
   tabs[next].scrollIntoView?.({block:'nearest',inline:'nearest'});
 }
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
 const menu=event.target.closest?.('.split-menu-items');
 if(menu&&['Escape','ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();
   const preview=menu.closest('.preview');
   if(event.key==='Escape'){closeSplitMenu(preview,true);}
   else{
     const items=[...menu.querySelectorAll('[role="menuitem"]')];
     const index=items.indexOf(document.activeElement);
     const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
     items[next]?.focus();
   }
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
function applySuperellipseFallback(tile,curve){
 // CSS corner-shape is not universally supported; polygon approximates the
 // same continuously curved boundary. Use 96 points for a smooth mobile edge.
 if(!tile)return;
 const native=typeof CSS!=='undefined' && CSS.supports?.('corner-shape','superellipse(2)');
 if(native){tile.style.clipPath='';return;}
 const exponent=2**curve,points=[];
 for(let index=0;index<96;index++){
   const angle=2*Math.PI*index/96;
   const x=Math.cos(angle),y=Math.sin(angle);
   const xx=50+50*Math.sign(x)*Math.abs(x)**(2/exponent);
   const yy=50+50*Math.sign(y)*Math.abs(y)**(2/exponent);
   points.push(xx.toFixed(2)+'% '+yy.toFixed(2)+'%');
 }
 tile.style.clipPath='polygon('+points.join(',')+')';
}
cards.addEventListener('input',event=>{
 if(event.target.matches('[data-superellipse-range]')){
  const study=event.target.closest('.superellipse-study');
  const value=Math.max(1,Math.min(4,Number(event.target.value)||2));
  const tile=study?.querySelector('[data-superellipse-tile]');
  if(tile){
   tile.style.setProperty('--icon-curvature',String(value));
   applySuperellipseFallback(tile,value);
  }
  const output=study?.querySelector('[data-superellipse-value]');
  if(output){output.value=value.toFixed(2);output.textContent=value.toFixed(2);}
 }
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
motionPreference.addEventListener?.('change',()=>{
 document.querySelectorAll('.preview').forEach(settleCount);
 if(motionPreference.matches){releaseAmbient(true);document.querySelectorAll('video').forEach(video=>video.pause());}
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){releaseAmbient(true);document.querySelectorAll('.preview').forEach(settleCount);}
 document.querySelectorAll('.gemini-reveal.is-ambient').forEach(stage=>stage.classList.toggle('is-tab-hidden',document.hidden));
});
for(const control of [search,verdictFilter,familyFilter,mediaFilter,stageOnly,screenshotsOnly])
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
 search.value='';verdictFilter.value='all';familyFilter.value='all';mediaFilter.value='all';stageOnly.checked=false;screenshotsOnly.checked=false;render();search.focus();
});
render();
