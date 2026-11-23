import {imageFixtures} from './image-fixtures.mjs';
// Backlog refinements retain their original catalogue IDs and static content.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const select=(key,label,values)=>`<label>${label}<select data-option="${key}">${values.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
const range=(key,label,min,max,value,step=1)=>`<label>${label}<input data-option="${key}" type="range" min="${min}" max="${max}" value="${value}" step="${step}"></label>`;
const button=(key,text,extra='')=>`<button type="button" data-atlas-action="${key}" ${extra}>${text}</button>`;
const duration=()=>range('duration','Duration (seconds)',.4,8,2,.1);
const playback=()=>select('mode','Playback',[['once','Once'],['loop','Continuous'],['static','Static']]);
import {practicalKinds} from './practical-kinds.mjs';
export function renderPracticalStudy(kind,id,{assetBase='./effects/assets/'}={}){
 if(!practicalKinds.includes(kind))return null;
 id=String(id).replace(/[^\w-]/g,'-');
 const base=esc(assetBase),relative=esc(assetBase.replace(/assets\/$/,''));
 let visual,controls,caption,animated=false;
 switch(kind){
 case 'tv-intro':
  animated=true;
  visual=`<div class="ma-wipe" data-shape="horizontal"><img src="${base}after.svg" width="640" height="400" alt="An original landscape introduced by a shape-based wipe"><strong class="ma-intro-type">Next<br>chapter.</strong></div>`;
  controls=select('variant','Content',[['image','One-image reveal'],['type','Original typography intro']])+select('shape','Reveal shape',[['horizontal','Centre-out bars'],['diagonal','Diagonal'],['reverse-diagonal','Other diagonal'],['circle','Circular iris'],['diamond','Diamond'],['fade','Simple fade']])+duration()+select('easing','Easing',[['ease-out','Ease out'],['linear','Linear']])+select('ratio','Aspect ratio',[['wide','Wide'],['tall','Tall']])+range('focal','Iris focal point (%)',10,90,50);
  caption='One original image; final content stays visible. Distinct from the two-image comparison. No TV branding.';break;
 case 'count-up':
  animated=true;
  visual='<div class="ma-number" role="img" aria-label="24,800 illustrative result"><span class="ma-number-js" aria-hidden="true">24,800</span><span class="ma-number-css" aria-hidden="true"></span></div><p class="ma-number-note">Illustrative figure · exact final value: <b>24,800</b></p>';
  controls=select('method','Implementation',[['js','Existing JS easing / locale'],['css','CSS registered integer'],['static','Static final number']])+select('target','Range',[['large','0 to 24,800'],['small','0 to 100'],['descending','75 to 20'],['negative','−20 to 50']])+duration();
  caption='CSS uses @property and a counter; JS retains locale grouping. Integer examples only, never a source of factual data.';break;
 case 'typewriter':
  animated=true;
  visual='<div class="ma-type-frame"><p class="ma-type-line"><span>A moment of impact.</span></p></div><p class="ma-type-status">Full text is available immediately.</p>';
  controls=select('text','Short heading',[['original','A moment of impact.'],['chapter','Next chapter'],['terminal','Ready to explore.'],['unicode','Ideas ✨ evolve']])+select('cursor','Cursor',[['bar','Bar'],['block','Block'],['none','None']])+duration()+select('mode','Playback',[['once','Once'],['static','Static']]);
  caption='Measured text width and grapheme-aware steps. Wrapped text stays static and complete. Never substitutes for actual demo or streamed speech.';break;
 case 'border':
  animated=true;
  visual='<div class="ma-border-card"><div class="ma-border-ring" aria-hidden="true"></div><div class="ma-border-content"><strong>One thing matters.</strong><button type="button" class="ma-border-action" data-atlas-action="select-feature" aria-pressed="false">Select feature</button></div></div>';
  controls=select('variant','Treatment',[['thin','Thin travelling highlight'],['bold','Original bold gradient'],['glow','Thin highlight and halo']])+select('method','Mechanism',[['angle','Registered angle'],['rotate','Rotating layer fallback']])+duration()+range('width','Border (px)',1,6,2)+range('radius','Radius (px)',8,40,20)+select('trigger','Trigger',[['manual','Manual'],['focus','Focus / pointer entry']])+playback();
  caption='A bounded focal surface with sharp content and an independent focus ring. Motion is optional.';break;
 case 'metaball':
  animated=true;
  visual='<div class="ma-goo-field"><div class="ma-goo-track" aria-hidden="true">'+Array.from({length:5},(_,i)=>`<i style="--i:${i}"></i>`).join('')+'</div></div><p>Five-dot illustration · no system is loading</p>';
  controls=select('variant','Dots',[['five','Five white dots'],['two','Original two green dots']])+select('filter','Filter',[['goo','Gooey bridge'],['none','No filter']])+range('diameter','Diameter (px)',24,48,40)+range('spacing','Spacing (px)',4,20,10)+range('blur','Blur (px)',2,22,8)+range('contrast','Contrast',4,40,24)+range('travel','Travel (px)',4,22,14)+duration()+playback();
  caption='Small liquid necks between discrete dots, not a lava lamp. Filters remain inside this illustration.';break;
 case 'progress':
  visual='<div class="ma-value-progress"><strong data-sample-value>45%</strong><progress max="100" value="45" aria-label="Illustrative known value"></progress></div><div class="ma-reading" tabindex="0" role="region" aria-label="Fictional reading example"><div class="ma-reading-track" aria-hidden="true"><i></i></div><article><h4>Make the next step clear.</h4>'+Array.from({length:6},(_,i)=>`<section><h5>${['A useful beginning','Understand the situation','Bring the right detail','Give choices a purpose','Leave room for judgement','A clear next step'][i]}</h5><p>A fictional editorial scene for testing scroll position. The indicator follows this page’s geometry; it does not measure reading, understanding, loading or task completion.</p></section>`).join('')+'</article></div><p class="ma-progress-note">Illustrative known-value sample.</p>';
  controls=select('variant','Progress source',[['value','Original known value'],['scroll','Contained scroll position']])+button('sample-value','Change sample value')+select('method','Scroll implementation',[['native','CSS scroll timeline / fallback'],['fallback','Measured fallback']])+`<a href="${relative}reading.html" target="_blank" rel="noopener">Open document-scroll example</a>`;
  caption='A position indicator, not loading or proof of comprehension. Normal content and keyboard scrolling remain available.';break;
 case 'focus-within':
  visual=`<div class="ma-focus-panels"><div class="ma-focus-group ma-focus-basic"><label for="email-${id}">Your contact email</label><input id="email-${id}" type="email" placeholder="you@example.com"></div><div class="ma-focus-group ma-focus-search"><label for="search-${id}">Find an example</label><div><span aria-hidden="true">⌕</span><input id="search-${id}" type="search" placeholder="Project or technique"><button type="button" data-atlas-action="clear">Clear</button></div></div><fieldset class="ma-focus-group ma-focus-fields"><legend>Contact details</legend><label>Name<input name="sample-name" autocomplete="off"></label><label>Email<input name="sample-email" type="email" aria-describedby="focus-help-${id}"></label><p id="focus-help-${id}">Example fields only. Nothing is submitted.</p></fieldset><fieldset class="ma-focus-group ma-focus-toolbar"><legend>Project filters</legend><label>Find<input type="search"></label><label>Type<select><option>All projects</option><option>Websites</option></select></label><label><input type="checkbox"> Featured</label></fieldset></div>`;
  controls=select('variant','Group',[['basic','Original simple field'],['search','Search and clear'],['fields','Multiple fields'],['toolbar','Desktop toolbar']]);
  caption='Container :focus-within complements each control’s own focus-visible ring. Focus never means validation or success.';break;
 case 'palette':
  visual='<div class="ma-token-samples"><section class="ma-token-card"><strong>One source. Useful tokens.</strong><p>Subtle surface and derived border.</p><button type="button" class="ma-token-button">Primary action example</button><label>Example field<input value="A readable example"></label><span class="ma-token-badge">Quiet badge</span></section><div class="ma-mix-swatch" aria-label="Mixed colour sample"></div></div><table class="ma-contrast"><caption>Rendered text contrast · 4.5:1 normal-text check</caption><thead><tr><th>Pair</th><th>Ratio</th><th>Result</th></tr></thead><tbody></tbody></table>';
  controls='<label>Brand<input type="color" data-option="brand" value="#2563eb"></label><label>Second colour<input type="color" data-option="other" value="#f59e0b"></label>'+select('space','Colour space',[['srgb','sRGB'],['oklch','OKLCH'],['oklab','Oklab']])+range('mix','Brand share (%)',0,100,50)+select('surface','Surface',[['light','Light'],['dark','Dark']])+select('alpha','Second source',[['opaque','Opaque colour'],['transparent','Transparent']])+button('snippet','Select CSS')+'<label class="ma-code-label">Derived token CSS<textarea class="ma-token-code" rows="7" readonly spellcheck="false"></textarea></label>';
  caption='Reuse approved brand tokens. Colour mixing is not a guarantee of contrast or brand approval; failing pairs are shown explicitly.';break;
 case 'layout-shift-2':
  visual='<div class="ma-media-stability"><div class="media-reserve" aria-hidden="true"></div><p>Media dimensions stay reserved.</p></div><div class="ma-gutters">'+[['auto','Auto'],['stable','Stable'],['both','Both edges']].map(([key,title])=>`<section><h4>${title}</h4><div class="ma-gutter-panel" data-gutter="${key}" tabindex="0" aria-label="${title} scrollbar example"><div class="ma-gutter-copy"><p>Centred content.</p><div class="ma-gutter-extra">${'<p>Additional example content for real vertical overflow.</p>'.repeat(7)}</div></div></div></section>`).join('')+'</div><p class="ma-gutter-measure" role="status">Measurements pending.</p>';
  controls=select('variant','Comparison',[['gutters','Scrollbar gutters'],['media','Original media reservation']])+button('overflow','Toggle long content','aria-pressed="false"')+select('scrollbars','Scrollbar request',[['native','Native platform'],['classic','Classic-width CSS (where supported)']])+select('direction','Direction',[['ltr','Left to right'],['rtl','Right to left']])+select('overflow','Overflow',[['auto','Auto'],['hidden','Hidden']])+button('swap-media','Swap original illustration');
  caption='Real native scrollbar measurements. Overlay scrollbars may reserve 0 px; no fake padding is inserted.';break;
 case 'mobile':
  visual=`<iframe class="ma-viewport-frame" title="Viewport-unit layout comparison" loading="lazy" src="${relative}viewport.html?unit=dvh&amp;sizing=fixed"></iframe><p class="ma-viewport-note">This frame has its own viewport. Open full size to test real browser controls.</p>`;
  controls=select('unit','Height unit',[['dvh','100dvh'],['svh','100svh'],['vh','100vh']])+select('sizing','Layout',[['fixed','Fixed app shell'],['min','Min-height / document flow']])+select('orientation','Frame',[['portrait','Portrait'],['landscape','Landscape']])+`<a class="ma-viewport-link" href="${relative}viewport.html?unit=dvh&amp;sizing=fixed" target="_blank" rel="noopener">Open full viewport comparison</a>`;
  caption='Reuses Co-op’s vh → dvh fallback and safe-area footer. Desktop frames do not simulate a phone’s browser chrome or virtual keyboard.';break;
 case 'reduced-motion':
  animated=true;
  visual='<div class="ma-motion-audit"><div class="ma-audit-arrival">The whole message stays readable.</div><div class="ma-audit-orbit" aria-hidden="true"><i></i></div><div class="ma-audit-scroll" tabindex="0" role="region" aria-label="Scroll-linked motion sample"><p>Scroll the example.</p><div></div><strong>A complete static outcome.</strong><div></div></div></div><p class="ma-motion-state" role="status">System preference applies.</p>';
  controls=select('preference','Local comparison',[['normal','Follow system'],['reduce','Reduced motion'],['paused','Manually paused']])+playback()+duration();
  caption='Local choices never override a system reduction. The message, state and controls stay complete when animation is removed.';break;
 case 'formats':
  visual=`<div class="ma-delivery-example"><strong>Hero first. Other images when needed.</strong><img src="${base}after.svg" alt="Original landscape with reserved dimensions" width="640" height="400"><p>The real comparison uses native picture/srcset, one eager hero and a gallery well below the fold.</p><table class="ma-contrast"><caption>Original fixture sizes in bytes; inspect quality separately</caption><thead><tr><th>Width</th><th>WebP</th><th>AVIF</th><th>JPEG</th></tr></thead><tbody>${imageFixtures.map(row=>`<tr><th>${row.width}px</th><td>${row.webp}</td><td>${row.avif}</td><td>${row.jpg}</td></tr>`).join('')}</tbody></table></div>`;
  controls=`<a href="${relative}image-delivery.html" target="_blank" rel="noopener">Selective loading example</a><a href="${relative}image-delivery-eager.html" target="_blank" rel="noopener">All-eager baseline</a>`;
  caption='Priority is a hint, loading controls eligibility. Compare measured requests, bytes and LCP; no universal speed-up is claimed.';break;
 }
 return `<div class="ma-effect ma-practical" data-atlas="${kind}" data-instance="${id}" data-mode="once" data-theme="dark"><div class="ma-stage">${visual}</div><div class="ma-options">${controls}</div><div class="ma-controls">${animated?button('play','Play')+button('pause','Pause','aria-pressed="false"')+button('stop','Stop'):''}${button('theme','Light / dark','aria-pressed="false"')}</div><p class="ma-caption">${caption}</p><a class="ma-reuse" href="${relative}README.md#${kind}">Use this study</a></div>`;
}
