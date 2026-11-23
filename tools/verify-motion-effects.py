#!/usr/bin/env python3
"""Playwright acceptance for the actual Atlas and portable library.
Serve with: python tools/serve-motion-preview.py --port 56827
Usage: python tools/verify-motion-effects.py --url http://127.0.0.1:56827 --output /absolute/evidence
Authoring-only requirement: pip install playwright; playwright install chromium webkit firefox.
"""
import argparse, json, re, time
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--url',required=True)
parser.add_argument('--output',required=True)
args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
results=[]
unavailable=[]
engines=[]
def check(condition,label):
 if not condition: raise AssertionError(label)
 results.append(label)
def option(root,name,value):
 root.scroll_into_view_if_needed()
 el=root.locator(f'[data-option="{name}"]')
 if el.evaluate('(el)=>el.tagName')=='SELECT':el.select_option(str(value))
 else:el.fill(str(value))
def click(root,action):root.locator(f'[data-atlas-action="{action}"]').click()
def active(root):return root.evaluate("el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length")

with sync_playwright() as pw:
 for engine in ('chromium','webkit','firefox'):
  try: browser=getattr(pw,engine).launch(headless=True)
  except Exception as error:
   unavailable.append({'engine':engine,'reason':str(error).split('Browser logs:')[0].strip()})
   if 'Could not find profile folder' in str(error):unavailable[-1]['diagnostic']='Could not find profile folder'
   print('UNAVAILABLE',engine,unavailable[-1]['reason'],flush=True)
   continue
  engines.append({'name':engine,'version':browser.version})
  context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='no-preference',has_touch=True)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.goto(args.url+'/kits/shorts-lab/effects/');page.wait_for_selector('[data-atlas="comparison"][data-enhanced="true"]')
  effect=lambda name:page.locator(f'[data-atlas="{name}"]')
  check(page.locator('[data-atlas]').count()==23,engine+': all twenty-three effects mount')
  # Every new component starts still (scroll timelines activate only by selection).
  check(page.locator('[data-atlas][data-running="true"]').count()==0,engine+': no automatic motion')
  comparison=effect('comparison');slider=comparison.locator('[data-comparison]')
  slider.focus();slider.press('Home');check(slider.input_value()=='0',engine+': range Home')
  slider.press('End');check(slider.input_value()=='100',engine+': range End')
  slider.press('ArrowLeft');check(slider.input_value()=='99',engine+': range arrow')
  slider.press('PageDown');check(slider.input_value()=='89',engine+': range PageDown')
  for value in (0,25,50,75,100):
   slider.fill(str(value))
   position=comparison.evaluate("el=>el.style.getPropertyValue('--ma-position')")
   check(position==str(value)+'%',engine+': clipping at '+str(value))
  click(comparison,'reset');surface=comparison.locator('.ma-compare');r=surface.bounding_box()
  page.mouse.move(r['x']+r['width']*.2,r['y']+r['height']*.5);page.mouse.down();page.mouse.move(r['x']+r['width']*.8,r['y']+r['height']*.5,steps=5);page.mouse.up()
  check(77<=int(slider.input_value())<=83,engine+': pointer drag')
  option(comparison,'compare','dom')
  check(comparison.locator('[inert]').count()==2,engine+': DOM comparison has no duplicate interactive controls')
  click(comparison,'side');check(comparison.get_attribute('data-side')=='true',engine+': side-by-side alternative')
  click(comparison,'side');option(comparison,'compare','images');click(comparison,'reset')
  check('Before and after comparison' in slider.aria_snapshot(),engine+': comparison has an accessible name')
  comparison.locator('.ma-stage').screenshot(path=str(out/f'{engine}-comparison.png'))
  # State changes, two opposing layers, pause and reduced motion.
  orb=effect('voice-orb');option(orb,'state','listening');page.wait_for_timeout(100)
  directions=orb.locator('.ma-orb>i').evaluate_all("els=>els.map(el=>getComputedStyle(el).animationDirection)")
  check(directions==['normal','reverse'],engine+': opposite orb rotations')
  check(active(orb)==2,engine+': both orb layers animate')
  seam=orb.locator('.ma-orb>i').evaluate_all("""els=>els.map(el=>{const a=el.getAnimations()[0],duration=a.effect.getTiming().duration;a.pause();a.currentTime=duration-.01;const before=new DOMMatrix(getComputedStyle(el).transform);a.currentTime=duration+.01;const after=new DOMMatrix(getComputedStyle(el).transform);return Math.max(Math.abs(before.a-after.a),Math.abs(before.b-after.b));})""")
  check(all(delta<.001 for delta in seam),engine+': both orb layers wrap continuously')
  option(orb,'state','idle');check(active(orb)==0,engine+': idle orb stays still')
  pulse=effect('pulse');option(pulse,'mode','loop');option(pulse,'state','active');page.wait_for_timeout(100)
  check(active(pulse)>0,engine+': active halo animates')
  click(pulse,'pause');check(active(pulse)==0,engine+': pause suspends halo')
  click(pulse,'play');page.wait_for_timeout(50);check(active(pulse)>0,engine+': resume halo')
  option(pulse,'state','offline');check(active(pulse)==0,engine+': offline pulse stops')
  # Exact tile distance; sample computed frames just before/after three wraps.
  marquee=effect('marquee');option(marquee,'mode','loop');option(marquee,'duration','1');click(marquee,'play');page.mouse.move(0,0)
  page.wait_for_timeout(80)
  geometry=marquee.evaluate("el=>({widths:[...el.querySelectorAll('.ma-tile')].map(n=>n.getBoundingClientRect().width),viewport:el.querySelector('.ma-marquee').clientWidth,distance:parseFloat(el.style.getPropertyValue('--ma-distance'))})")
  check(abs(geometry['widths'][0]-geometry['widths'][1])<.1 and geometry['widths'][0]>=geometry['viewport'],engine+': tiled sequence fully covers viewport')
  check(abs(geometry['distance']-geometry['widths'][0])<.1,engine+': translation is exactly one tile')
  for cycle in (1,2,3):
   delta=marquee.evaluate("""(el,cycle)=>{const a=el.querySelector('.ma-track').getAnimations()[0];a.pause();a.currentTime=cycle*1000-.01;const before=new DOMMatrix(getComputedStyle(a.effect.target).transform).m41;a.currentTime=cycle*1000+.01;const after=new DOMMatrix(getComputedStyle(a.effect.target).transform).m41;const width=parseFloat(el.style.getPropertyValue('--ma-distance'));return Math.abs(Math.abs(after-before)-width)}""",cycle)
   check(delta<.2,engine+': seamless wrap '+str(cycle))
  click(marquee,'stop')
  # Real pending lifecycle; all end states stop shimmer, cancel invalidates timer.
  loading=effect('shimmer')
  for shape in ('card','rows','message'):
   option(loading,'shape',shape)
   for result in ('loaded','empty','error'):
    option(loading,'outcome',result);click(loading,'load')
    check(loading.locator('[aria-busy]').get_attribute('aria-busy')=='true',engine+': '+shape+' pending')
    before=loading.locator('.ma-load-region').bounding_box()['height']
    page.wait_for_timeout(850)
    check(loading.get_attribute('data-load')==result and active(loading)==0,engine+': '+shape+' '+result+' stops shimmer')
    check(abs(before-loading.locator('.ma-load-region').bounding_box()['height'])<.1,engine+': reserved loading dimensions')
  click(loading,'load');click(loading,'cancel');page.wait_for_timeout(850)
  check(loading.get_attribute('data-load')=='idle',engine+': stale pending completion cancelled')
  option(loading,'outcome','loaded');click(loading,'retry');page.wait_for_timeout(850)
  check(loading.get_attribute('data-load')=='loaded',engine+': retry succeeds')
  # Sprite samples at exact frame times, original eight cells, no final blank.
  sprite=effect('pixel');option(sprite,'mode','loop');click(sprite,'play');page.wait_for_timeout(50)
  positions=sprite.evaluate("el=>{const target=el.querySelector('.ma-sprite'),a=target.getAnimations()[0];a.pause();return Array.from({length:8},(_,i)=>{a.currentTime=i*100+1;return getComputedStyle(target).backgroundPositionX})}")
  check(len(set(positions))==8,engine+': eight distinct sprite frames')
  click(sprite,'stop');option(sprite,'mode','once');click(sprite,'play');page.wait_for_timeout(950)
  check(sprite.get_attribute('data-complete')=='true',engine+': one-shot sprite settles')
  stagger=effect('stagger');option(stagger,'count','9');option(stagger,'index','fallback')
  stagger.locator('.ma-list').evaluate('(el)=>el.prepend(el.lastElementChild)');page.wait_for_timeout(30)
  indices=stagger.locator('.ma-list li').evaluate_all("els=>els.map(el=>el.style.getPropertyValue('--i'))")
  check(indices==[str(i) for i in range(9)],engine+': fallback reindexes dynamic siblings')
  option(stagger,'variant','wave');click(stagger,'play');page.wait_for_timeout(100)
  check(stagger.locator('.ma-wave i').count()==36 and active(stagger)==36,engine+': travelling wave has 36 animated bars')
  stagger.locator('.ma-stage').screenshot(path=str(out/f'{engine}-wave.png'));click(stagger,'stop')
  # Scrub forward/reverse; assert final geometry, including visible fallback.
  reveal=effect('reveal');option(reveal,'scrollMode','entry');scroll=reveal.locator('.ma-scroll');target=reveal.locator('.ma-scroll-object')
  supported=page.evaluate("CSS.supports('animation-timeline: view()')")
  samples=[]
  for top in (0,150,260,150,0):
   scroll.evaluate('(el,top)=>el.scrollTop=top',top);page.wait_for_timeout(100)
   samples.append(target.evaluate('(el)=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform})'))
  if supported:
   check(samples[0]!=samples[2] and samples[0]==samples[-1],engine+': native entrance reverses with scrolling')
  else:check(all(s['opacity']=='1' for s in samples),engine+': unsupported timeline keeps content visible')
  option(reveal,'scrollMode','exit');scroll.evaluate('(el)=>el.scrollTop=260');page.wait_for_timeout(80)
  reveal.locator('.ma-stage').screenshot(path=str(out/f'{engine}-scroll.png'))
  # SVG refraction differs from plain and frosted, foreground is outside filter.
  optic=effect('refraction');option(optic,'optics','plain');plain=optic.locator('.ma-stage').screenshot()
  option(optic,'optics','bend');bent=optic.locator('.ma-stage').screenshot(path=str(out/f'{engine}-refraction.png'))
  option(optic,'optics','frost');frost=optic.locator('.ma-stage').screenshot()
  check(plain!=bent and bent!=frost,engine+': rendered displacement differs from plain and blur')
  option(optic,'optics','bend')
  # Live preference changes stop every kind; controls continue to work.
  for name in ('pattern','pixel','stagger','aurora-text'):
   click(effect(name),'play')
  page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(80)
  check(page.locator('[data-atlas][data-reduced="false"]').count()==0,engine+': dynamic reduced motion reaches every component')
  check(page.locator('[data-atlas]').evaluate_all("els=>els.every(el=>el.getAnimations({subtree:true}).every(a=>a.playState!=='running'))"),engine+': reduced motion is still')
  click(comparison,'after');check(slider.input_value()=='100',engine+': reduced-motion comparison stays functional')
  # Responsive and enlarged text; screenshots are inspected separately.
  for width,label in ((390,'mobile'),(320,'narrow')):
   page.set_viewport_size({'width':width,'height':844});page.wait_for_timeout(80)
   check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),engine+': '+label+' has no horizontal overflow')
  page.add_style_tag(content='html{font-size:200%}')
  check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),engine+': 200 percent text reflows')
  comparison.scroll_into_view_if_needed();page.screenshot(path=str(out/f'{engine}-mobile-enlarged.png'))
  check(not errors,engine+': no browser runtime errors '+str(errors))
  # Isolated consumers can mount two copies with independent SVG IDs; destroy
  # clears pending completion, observers and animation state.
  page.evaluate("""async()=>{const {mountEffect}=await import('./atlas.mjs');const {renderStudy}=await import('./studies.mjs');const host=document.createElement('div');host.innerHTML=renderStudy('shimmer','consumer');document.body.append(host);const c=mountEffect(host.firstElementChild);c.setLoading('pending');window.consumer=c;}""")
  check(page.locator('[data-instance="consumer"] [aria-busy]').get_attribute('aria-busy')=='true',engine+': external pending adapter')
  page.evaluate("consumer.setLoading('error','Real owner error');consumer.destroy()")
  check(page.locator('[data-instance="consumer"]').get_attribute('data-running')=='false',engine+': teardown stops owned work')
  # Initial reduced motion and independent duplicate SVG filter identities.
  context2=browser.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},has_touch=True)
  mobile=context2.new_page();mobile.goto(args.url+'/kits/shorts-lab/effects/');mobile.wait_for_selector('[data-enhanced="true"]')
  mobile_compare=mobile.locator('[data-atlas="comparison"]');mobile_compare.scroll_into_view_if_needed();rect=mobile_compare.locator('.ma-compare').bounding_box()
  mobile.touchscreen.tap(rect['x']+rect['width']*.75,rect['y']+rect['height']*.5)
  check(70<=int(mobile_compare.locator('[data-comparison]').input_value())<=80,engine+': touch comparison works under initial reduced motion')
  check(mobile.locator('[data-atlas][data-reduced="false"]').count()==0,engine+': initial reduced motion is still')
  if engine=='chromium':
   client=context2.new_cdp_session(mobile)
   for typ,x in [('touchStart',.2),('touchMove',.8),('touchEnd',.8)]:
    points=[] if typ=='touchEnd' else [{'x':rect['x']+rect['width']*x,'y':rect['y']+rect['height']*.5}]
    client.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':points})
   check(75<=int(mobile_compare.locator('[data-comparison]').input_value())<=85,engine+': native horizontal finger drag')
  await_ids=mobile.evaluate("""async()=>{const {renderStudy}=await import('./studies.mjs');const {mountEffect}=await import('./atlas.mjs');for(let n=0;n<2;n++){const host=document.createElement('div');host.innerHTML=renderStudy('refraction','same');document.body.append(host);mountEffect(host.firstElementChild);}return [...document.querySelectorAll('svg [id]')].map(el=>el.id);}""")
  check(len(await_ids)==len(set(await_ids)),engine+': multiple instances have unique SVG fragment IDs')
  context2.close()
  # Optional native image/video hotspots keep fallback links and bounds.
  page.goto(args.url+'/kits/shorts-lab/effects/hotspots.html');page.wait_for_selector('.media-hotspot')
  check(page.locator('.media-hotspot').count()==2,engine+': image and video hotspots mount')
  video=page.locator('video');video.scroll_into_view_if_needed()
  page.wait_for_function("document.querySelector('video').readyState>=1")
  video.evaluate('(el)=>el.currentTime=1')
  page.locator('[data-hotspot-surface="video"] .media-hotspot').wait_for(state='visible')
  check(page.locator('[data-hotspot-surface="video"] .media-hotspot').is_visible(),engine+': timed hotspot appears in its window')
  video.evaluate('(el)=>el.currentTime=0')
  page.locator('[data-hotspot-surface="video"] .media-hotspot').wait_for(state='hidden')
  check(not page.locator('[data-hotspot-surface="video"] .media-hotspot').is_visible(),engine+': timed hotspot hides outside its window')
  check(page.locator('ul a[href="#project-details"]').is_visible(),engine+': permanent media context link remains available')
  rejected=page.evaluate("""async()=>{const {mountHotspots}=await import('./hotspots.mjs');try{mountHotspots(document.querySelector('main'),{items:[{label:'Unsafe',x:50,y:50,start:0,end:1,target:'https://example.com'}],allowedTargets:['https://example.com']});return false;}catch{return true;}}""")
  check(rejected,engine+': media hotspot rejects unapproved external destinations')
  # Main gallery, original cards and filters; existing customer route only read.
  page.goto(args.url+'/kits/shorts-lab/');page.wait_for_selector('.card[data-id="82"]')
  check(page.locator('.card').count()==82,engine+': gallery preserves original 80 plus two additions')
  page.locator('#search').fill('gliding pill');check(page.locator('.card').count()==1,engine+': original gallery search')
  page.locator('#reset').click();page.locator('#screenshots-only').check();check(page.locator('.card').count()==42,engine+': screenshot filter reconciles latest intake')
  page.goto(args.url+'/co-op/');page.wait_for_timeout(100)
  check(page.locator('main').count()>0 and page.locator('[data-atlas]').count()==0,engine+': Co-op remains independent')
  page.goto(args.url+'/kits/shorts-lab/');page.locator('#search').fill('before and after')
  recorded=page.locator('.card[data-id="81"] video');recorded.scroll_into_view_if_needed();recorded.evaluate('(el)=>el.play()');page.wait_for_timeout(250)
  check(recorded.evaluate('(el)=>el.currentTime>0&&!el.error'),engine+': recorded implementation actually plays')
  check(not errors,engine+': gallery and customer route have no runtime errors '+str(errors))
  context.close();browser.close()
 # Static fallback, actual JS disabled and original page with no scripts.
 browser=pw.chromium.launch()
 context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
 page=context.new_page();page.goto(args.url+'/kits/shorts-lab/effects/static-comparison.html')
 check(page.locator('figure').count()==2 and page.locator('img').evaluate_all('els=>els.every(el=>el.complete&&el.naturalWidth>0)'), 'no JavaScript: both original images available')
 page.screenshot(path=str(out/'no-js-comparison.png'));context.close();browser.close()
(out/'results.json').write_text(json.dumps({'checks':len(results),'passed':results,'unavailable':unavailable,'engines':engines},indent=2)+'\n')
print(f'PASS {len(results)} browser assertions; unavailable engines: '+', '.join(x['engine'] for x in unavailable))
