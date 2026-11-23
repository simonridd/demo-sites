import {renderPracticalStudy} from './practical-studies.mjs';
// Independent, portable examples. renderStudy returns null for untouched studies.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options = values => values.map(([value,label]) => `<option value="${value}">${label}</option>`).join('');
const select = (name,label,values) => `<label>${label}<select data-option="${name}">${options(values)}</select></label>`;
const range = (name,label,min,max,value,step=1) => `<label>${label}<input data-option="${name}" type="range" min="${min}" max="${max}" value="${value}" step="${step}"></label>`;
const action = (name,label,extra='') => `<button type="button" data-atlas-action="${name}" ${extra}>${label}</button>`;
const playback = () => `<div class="ma-controls">${action('play','Play')}${action('pause','Pause','aria-pressed="false"')}${action('stop','Stop')}${action('theme','Light / dark','aria-pressed="false"')}</div>`;
const wrap = (kind,id,visual,controls,caption,linkBase) => `<div class="ma-effect" data-atlas="${kind}" data-instance="${id}" data-mode="${kind==='voice-orb'?'loop':'once'}" data-theme="dark"><div class="ma-stage">${visual}</div><div class="ma-options">${controls}</div>${["comparison","refraction","shimmer","reveal"].includes(kind)?`<div class="ma-controls">${action("theme","Light / dark",'aria-pressed="false"')}</div>`:playback()}<p class="ma-caption">${caption}</p><a class="ma-reuse" href="${escape(linkBase)}README.md#${kind}">Use this effect</a></div>`;
const mode = () => select('mode','Playback',[['once','One pass'],['loop','Continuous'],['static','Static']]);
const duration = () => range('duration','Duration (seconds)',1,12,4,.5);
const curveArt = id => `<defs><pattern id="${id}-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#183a47" stroke-width="2"/></pattern><g id="${id}-art"><rect width="400" height="210" fill="#d4f5e7"/><rect width="400" height="210" fill="url(#${id}-grid)"/><circle cx="210" cy="100" r="66" fill="#e87842"/><path d="M-20 175 Q120 -60 270 120 T430 45" stroke="#185f70" stroke-width="16" fill="none"/><path d="M0 180 L400 20" stroke="#f7f8cf" stroke-width="8"/><text x="28" y="65" font-size="30" font-weight="800" fill="#183a47">OPTICS</text></g><filter id="${id}-bend" x="-25%" y="-40%" width="150%" height="180%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .024" numOctaves="1" seed="8" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="36" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="${id}-frost"><feGaussianBlur stdDeviation="5"/></filter><clipPath id="${id}-clip"><rect x="85" y="32" width="230" height="145" rx="26"/></clipPath></defs>`;
export function renderStudy(kind,id,{assetBase='./effects/assets/'}={}) {
 const practical=renderPracticalStudy(kind,id,{assetBase});
 if(practical!==null)return practical;
 id=String(id).replace(/[^a-zA-Z0-9_-]/g,'-');
 let visual,controls,caption;
 switch(kind){
 case 'pattern':
 visual='<div class="ma-pattern" data-pattern="checker" aria-hidden="true"><i></i></div><strong class="ma-stage-title">Space for an idea.</strong>';
 controls=select('pattern','Pattern',[['checker','Checkerboard'],['graph','Graph paper'],['diamond','Diamonds'],['dots','Dot lattice']])+mode()+duration()+range('tile','Tile size',16,64,32)+select('direction','Direction',[['normal','Forward'],['reverse','Reverse']])+select('intensity','Treatment',[['stage','Stage'],['product','Quiet product']]);
 caption='Original tiled backgrounds. Static until played; decorative only.';break;
 case 'marquee':
 visual='<p class="ma-strip-label">Ideas · Craft · Stories</p><div class="ma-marquee" tabindex="0" role="region" aria-label="Visual strip; focus to pause"><div class="ma-track" aria-hidden="true"><div class="ma-tile"><span>IDEAS · CRAFT · STORIES · </span></div><div class="ma-tile" aria-hidden="true"><span>IDEAS · CRAFT · STORIES · </span></div></div></div>';
 controls=mode()+duration()+select('direction','Direction',[['normal','Left'],['reverse','Right']])+range('gap','Spacing',12,48,24)+select('use','Example',[['title','Chapter title'],['projects','Project strip'],['announcement','Nonessential announcement']]);
 caption='One accessible copy; tiled visual copies are hidden. Hover or focus pauses.';break;
 case 'voice-orb':
 visual=`<div class="ma-orb" aria-hidden="true"><i></i><i></i><svg class="ma-orb-lens" viewBox="0 0 400 210">${curveArt('ma-orb-'+id)}<use href="#ma-orb-${id}-art" filter="url(#ma-orb-${id}-bend)"/></svg><b></b></div><p class="ma-state" role="status">Simulated · idle</p>`;
 controls=select('state','Simulated state',[['idle','Idle'],['listening','Listening'],['thinking','Thinking'],['speaking','Speaking']])+duration()+range('size','Size',64,160,112)+range('level','Supplied sample level',0,1,.35,.05)+select('palette','Palette',[['mint','Mint / coral'],['violet','Violet / blue']]);
 caption='Two counter-rotating colour layers; a sharp refractive SVG surface. No microphone access. Sample level is manual.';break;
 case 'pulse':
 visual='<p class="ma-state" role="status"><i class="ma-dot" aria-hidden="true"></i><span>Simulated · idle</span></p>';
 controls=select('state','Simulated state',[['idle','Idle'],['active','Active'],['busy','Busy'],['offline','Offline']])+mode()+range('duration','Pulse (seconds)',1.5,4,1.8,.1)+range('halo','Halo radius',8,24,14);
 caption='A steady dot and fading halo. State stays readable without colour or motion.';break;
 case 'stagger':
 visual='<ol class="ma-list"><li>Understand the need</li><li>Find the right help</li><li>Choose the next step</li><li>Keep the outcome clear</li></ol><div class="ma-wave" aria-hidden="true">'+Array.from({length:36},(_,i)=>`<i style="--i:${i};--hue:${i*8}"></i>`).join('')+'</div>';
 controls=select('index','Index source',[['native','Native CSS (with fallback)'],['fallback','Variable fallback'],['static','Static']])+select('variant','Variant',[['list','Sequential list'],['wave','Travelling wave']])+range('count','List items',3,12,4)+range('delay','Delay (ms)',50,150,80)+range('amplitude','Wave amplitude',.2,1,.8,.1)+duration()+select('direction','Direction',[['normal','Forward'],['reverse','Reverse']]);
 caption='Content order stays fixed. The coloured wave is decorative, not measured audio.';break;
 case 'pixel':
 visual=`<div class="ma-pixel">HELLO</div><div class="ma-sprite" role="img" aria-label="Original geometric mascot waving" style="--ma-sheet:url('${escape(assetBase)}wave-sprite.svg')"></div>`;
 controls=select('variant','Variant',[['sprite','Eight-frame gesture'],['pixel','Original pixel bounce']])+mode()+range('duration','Duration (seconds)',.4,3,.8,.1)+range('size','Size',48,128,64)+select('art','Artwork',[['smooth','Smooth illustration'],['pixel','Pixel rendering']]);
 caption='Original eight-frame SVG sheet; a contextual gesture, never proof of activity.';break;
 case 'shimmer':
 visual='<div class="ma-load-region" aria-busy="false"><div class="ma-loading-layout" data-shape="card"><div class="ma-load-image" aria-hidden="true"><span class="ma-resolved">◇</span></div><div class="ma-load-line"><span class="ma-resolved ma-result-title">Atlas project</span></div><div class="ma-load-line short"><span class="ma-resolved">Illustrative record</span></div><p class="ma-load-content">Ready to load a fictional example.</p></div></div><p class="ma-load-status" role="status">Demo only · idle</p>';
 controls=select('shape','Shape',[['card','Image card'],['rows','List rows'],['message','Avatar / message']])+select('outcome','Next result',[['loaded','Success'],['empty','Empty'],['error','Error']])+select('treatment','Pending appearance',[['shimmer','Shimmer'],['static','Static skeleton'],['progress','Simple indicator']])+action('load','Load content')+action('cancel','Cancel')+action('retry','Retry');
 caption='Simulated delayed data, 800 ms. Pending alone shimmers; cancellation and retry clear obsolete work.';break;
 case 'reveal':
 visual='<div class="ma-scroll" tabindex="0" role="region" aria-label="Scroll to compare entrance and exit"><p class="ma-scroll-intro">Scroll down, then back up.</p><div class="ma-scroll-space"></div><div class="ma-scroll-object">A clearer next step.</div><div class="ma-scroll-space"></div><p>End of the scene.</p></div>';
 controls=select('scrollMode','Reveal',[['once','Co-op once-only entrance'],['entry','Reversible entrance'],['exit','Entrance and exit'],['static','Static']])+select('travel','Travel',[['28','Everyday · 28 px'],['100','Stage · 100 px']]);
 caption='Native view timelines for scroll modes; Co-op’s once-only observer recipe. Unsupported timelines stay visible.';break;
 case 'refraction':{
 const key='ma-optic-'+id;
 visual=`<svg class="ma-optics" viewBox="0 0 400 210" role="img" aria-label="Grid and curved lines displaced inside a glass pane"><title>Optical comparison using an authored scene</title>${curveArt(key)}<use href="#${key}-art"/><g class="ma-lens" clip-path="url(#${key}-clip)"><use class="ma-bent-art" href="#${key}-art" filter="url(#${key}-bend)"/><use class="ma-frost-art" href="#${key}-art" filter="url(#${key}-frost)"/></g><rect x="85" y="32" width="230" height="145" rx="26" fill="#ffffff15" stroke="#ffffff" stroke-width="2"/><text x="107" y="143" fill="#102c38" stroke="#e6fff5" stroke-width="5" paint-order="stroke" font-size="17" font-weight="800">FOREGROUND STAYS SHARP</text></svg>`;
 controls=select('optics','Surface',[['bend','SVG refraction'],['plain','Plain translucent'],['frost','Frosted blur']])+range('distortion','Displacement',0,70,36);
 caption='Actual pixel displacement of the same authored SVG scene, not arbitrary DOM backdrop capture. No blur in refraction mode.';break;}
 case 'comparison':
 visual=`<div class="ma-compare" data-compare="images"><figure class="ma-before"><img src="${escape(assetBase)}before.svg" alt="Before: original geometric landscape in muted colours" width="640" height="400"><figcaption>Before</figcaption></figure><figure class="ma-after"><img src="${escape(assetBase)}after.svg" alt="After: the same landscape with a vivid palette and detailed contours" width="640" height="400"><figcaption>After</figcaption></figure><div class="ma-dom-before" inert aria-hidden="true"><span>PROJECT ATLAS</span><h4>A place for ideas.</h4><p>Original wireframe</p><b>Explore projects</b></div><div class="ma-dom-after" inert aria-hidden="true"><span>PROJECT ATLAS</span><h4>A place for ideas.</h4><p>Finished interface</p><b>Explore projects</b></div><div class="ma-divider" aria-hidden="true"><i>↔</i></div><label class="ma-range-label">Before and after comparison<input type="range" min="0" max="100" value="50" step="1" data-comparison disabled aria-valuetext="50 percent after"></label></div><p class="ma-compare-description">Reveal the same landscape before and after. Both images remain available in side-by-side mode.</p>`;
 controls=select('compare','Content',[['images','Two aligned images'],['dom','Wireframe / live DOM']])+action('before','Before')+action('after','After')+action('reset','Reset 50%')+action('side','Side by side','aria-pressed="false"');
 caption='Reuses the Co-op presentation’s native range and clipping recipe. White divider; no autoplay. DOM copies are inert.';break;
 case 'aurora-text':
 visual='<div class="ma-aurora-stage"><h4 class="ma-aurora"><span class="ma-aurora-glow" aria-hidden="true">Motion Atlas</span><span class="ma-aurora-ink">Motion Atlas</span></h4></div>';
 controls=mode()+duration()+action('glow','Glow','aria-pressed="false"')+select('palette','Palette',[['mint','Mint / coral'],['violet','Violet / blue']])+range('glowRadius','Glow radius',0,24,12)+range('glowIntensity','Glow intensity',0,1,.5,.1)+range('textScale','Text scale',.7,1.4,1,.1);
 caption='Gradient inside glyphs, optional decorative glow. Short headings only; use plain text for forms, navigation and body copy.';break;
 default:return null;
 }
 return wrap(kind,id,visual,controls,caption,assetBase.replace(/assets\/$/,''));
}
