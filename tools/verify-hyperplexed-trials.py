#!/usr/bin/env python3
"""Issue 101 acceptance for independent spotlight and confined utility dock."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
checks=[];metrics=[];unavailable=[];base=a.url.rstrip('/')+'/kits/shorts-lab/trials/hyperplexed/'
def check(ok,label):
 if not ok:raise AssertionError(label)
 checks.append(label)
def position(page,grid,x=.4,y=.4):
 grid.scroll_into_view_if_needed();r=grid.bounding_box();page.mouse.move(r['x']+r['width']*x,r['y']+r['height']*y);page.wait_for_timeout(80)
def no_overlap(first,second):return first['x']+first['width']<=second['x'] or second['x']+second['width']<=first['x'] or first['y']+first['height']<=second['y'] or second['y']+second['height']<=first['y']
with sync_playwright() as pw:
 for engine in ('chromium','webkit','firefox'):
  try:b=getattr(pw,engine).launch(headless=True)
  except Exception as e:
   unavailable.append({'engine':engine,'error':str(e).split('Browser logs:')[0]});print('UNAVAILABLE',engine,flush=True);continue
  ctx=b.new_context(viewport={'width':1280,'height':1100},reduced_motion='no-preference');page=ctx.new_page();errors=[];bad=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append(r.url) if r.url.startswith(a.url) and r.status>=400 else None)
  page.add_init_script("window.qaCLS=0;try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)qaCLS+=e.value})).observe({type:'layout-shift',buffered:true})}catch{}")
  page.goto(base+'spotlight.html');root=page.locator('[data-spotlight]');grid=root.locator('[data-spot-grid]');page.wait_for_timeout(100)
  check(root.get_attribute('data-effective')=='static',engine+': spotlight static default')
  spotCost=page.evaluate("({bytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.encodedBodySize,0)+performance.getEntriesByType('navigation')[0].encodedBodySize,cls:qaCLS})")
  check(1000<spotCost['bytes']<55000 and spotCost['cls']<.01,engine+': spotlight bounded cold bytes and layout stability')
  for mode in ('border','face'):
   root.locator('[value='+mode+']').check();position(page,grid)
   check(root.get_attribute('data-active')=='true',engine+': active pointer light '+mode)
   before=root.get_attribute('data-geometry-reads');r=grid.bounding_box()
   for i in range(12):page.mouse.move(r['x']+r['width']*(.25+i*.02),r['y']+120)
   page.wait_for_timeout(80);check(root.get_attribute('data-geometry-reads')==before,engine+': geometry cached across pointer moves '+mode)
   shared=root.locator('.hx-spot-card').evaluate_all("es=>es.map(e=>({left:parseFloat(e.style.getPropertyValue('--hx-left')),x:parseFloat(getComputedStyle(e).getPropertyValue('--hx-x')),after:getComputedStyle(e,'::after').opacity,before:getComputedStyle(e,'::before').opacity}))")
   check(len({v['x'] for v in shared})==1 and len({v['left'] for v in shared})==3,engine+': one global light maps to distinct card positions '+mode)
   check(all(v['after']=='1' and v['before']==('1' if mode=='face' else '0') for v in shared),engine+': face/border separation '+mode)
   count=root.get_attribute('data-render-count');page.wait_for_timeout(180);check(root.get_attribute('data-render-count')==count,engine+': no idle spotlight frame loop '+mode)
   grid.screenshot(path=str(a.output/f'{engine}-spotlight-{mode}.png'))
   page.mouse.move(0,0);check(root.get_attribute('data-active')=='false',engine+': pointer leave resets '+mode)
  link=grid.locator('a').nth(1);link.focus();check(link.evaluate("e=>getComputedStyle(e.closest('.hx-spot-card')).outlineWidth==='3px'"),engine+': equally prominent keyboard card focus')
  link.press('Enter');check(page.url.endswith('#evidence'),engine+': actual card link')
  for theme in ('light','dark'):
   root.locator('[data-theme-toggle]').click();check(root.get_attribute('data-theme')==theme,engine+': '+theme+' theme')
   position(page,grid);grid.screenshot(path=str(a.output/f'{engine}-spotlight-{theme}.png'))
  # Cached coordinates invalidate after scroll/resize, rather than measuring every frame.
  previous=int(root.get_attribute('data-geometry-reads'));page.evaluate('scrollBy(0,-80)');page.wait_for_timeout(80);position(page,grid)
  check(int(root.get_attribute('data-geometry-reads'))>previous,engine+': page scroll invalidates geometry')
  page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(80);position(page,grid)
  check(root.get_attribute('data-effective')=='static' and root.get_attribute('data-active')=='false',engine+': changed reduction removes pointer light')
  page.emulate_media(reduced_motion='no-preference');page.evaluate("document.documentElement.classList.add('motion-off')");page.wait_for_timeout(50)
  check(root.get_attribute('data-effective')=='static',engine+': shared reduction')
  page.evaluate("document.documentElement.classList.remove('motion-off')")
  for width in (390,320,640):
   page.set_viewport_size({'width':width,'height':1000})
   if width==640:page.add_style_tag(content='html{font-size:200%}')
   check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),engine+': spotlight reflow '+str(width))
  grid.screenshot(path=str(a.output/f'{engine}-spotlight-enlarged.png'))
  # A duplicate helper has no imported auto-mount and aborts queued work on teardown.
  page.evaluate("""async()=>{const {mountSpotlight}=await import('./spotlight.mjs');const el=document.querySelector('[data-spotlight]').cloneNode(true);document.querySelector('main').append(el);window.qaSpotRoot=el;window.qaSpot=mountSpotlight(el);qaSpot.update('face');qaSpot.destroy();}""")
  before=page.evaluate('qaSpotRoot.dataset.renderCount');page.locator('[data-spotlight]').last.locator('[data-spot-grid]').hover();page.wait_for_timeout(80)
  check(page.evaluate("qaSpotRoot.dataset.effective==='static'&&qaSpotRoot.dataset.renderCount==='"+before+"'"),engine+': spotlight teardown stops light and listeners')
  # Fresh HTTP cache/context for the dock's genuinely cold route measurement.
  ctx.close();ctx=b.new_context(viewport={'width':1280,'height':1100},reduced_motion='no-preference');page=ctx.new_page()
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append(r.url) if r.url.startswith(a.url) and r.status>=400 else None)
  page.add_init_script("window.qaCLS=0;try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)qaCLS+=e.value})).observe({type:'layout-shift',buffered:true})}catch{}")
  page.goto(base+'bubbles.html');root=page.locator('[data-bubble-demo]');flag=root.locator('[data-bubbles-enable]');layer=root.locator('[data-bubble-layer]');panel=root.locator('[data-utility-panel]');boundary=root.locator('[data-bubble-boundary]')
  page.wait_for_timeout(100)
  check(not layer.is_visible() and not flag.is_checked(),engine+': dock feature flag off by default')
  check(root.locator('[data-utility-content]').count()==3,engine+': complete inline baseline')
  initial=page.evaluate("({bytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.encodedBodySize,0)+performance.getEntriesByType('navigation')[0].encodedBodySize,cls:qaCLS})")
  check(1000<initial['bytes']<55000 and initial['cls']<.01,engine+': bounded cold bytes and layout stability')
  page.set_viewport_size({'width':1280,'height':1100});flag.check();boundary.scroll_into_view_if_needed();page.wait_for_timeout(220)
  check(layer.is_visible() and root.locator('[data-bubble]:visible').count()==3,engine+': three optional utilities')
  check(root.locator('[data-bubble][tabindex="0"]').count()==1,engine+': dock single roving tab stop')
  notes=root.locator('[data-bubble=notes]');notes.focus();notes.press('Enter');page.wait_for_timeout(80)
  check(panel.is_visible() and notes.get_attribute('aria-expanded')=='true',engine+': native keyboard open with ARIA state')
  check(panel.get_attribute('role')=='region' and panel.get_attribute('aria-modal') is None,engine+': nonmodal region does not claim a focus trap')
  check(root.locator('[data-utility=notes] [data-utility-content]').count()==0,engine+': same actual content moved without duplicate input')
  field=panel.locator('textarea');field.fill('A kept workshop note.');field.press('Escape');page.wait_for_timeout(220)
  check(not panel.is_visible() and notes.evaluate('(e)=>e===document.activeElement'),engine+': Escape returns focus')
  check(root.locator('[data-utility=notes] textarea').input_value()=='A kept workshop note.',engine+': note state restored inline')
  notes.press('ArrowDown');check(root.locator('[data-bubble=evidence]').evaluate('(e)=>e===document.activeElement'),engine+': roving arrow navigation')
  root.locator('[data-bubble=evidence]').press('ArrowLeft');page.wait_for_timeout(220);check(root.get_attribute('data-edge')=='left',engine+': keyboard dock alternative')
  root.locator('[data-bubble=evidence]').press('Enter');page.wait_for_timeout(50)
  # Nonmodal content can be left without consuming an actual underlying action.
  primary=root.locator('.hx-primary');primary.click();check(page.url.endswith('#required-guidance') and not panel.is_visible(),engine+': outside real action works and closes panel')
  notes.click();page.wait_for_timeout(50);panel.locator('[data-utility-inline]').click();check(root.locator('[data-utility=notes]').get_attribute('open') is not None,engine+': explicit inline alternative')
  notes.click();panel.locator('[data-utility-dismiss]').click();page.wait_for_timeout(220)
  check(root.locator('[data-bubble]:visible').count()==2 and not panel.is_visible(),engine+': dismiss retains other utilities')
  check(root.locator('[data-utility=notes] textarea').input_value()=='A kept workshop note.',engine+': dismissal never destroys inline content')
  root.locator('[data-bubbles-restore]').click();check(root.locator('[data-bubble]:visible').count()==3,engine+': restore dismissed utilities')
  for value in ('1','2','3'):
   root.locator('[data-bubble-count]').select_option(value);check(root.locator('[data-bubble]:visible').count()==int(value),engine+': configurable utility count '+value)
  boundary.scroll_into_view_if_needed();page.wait_for_timeout(220);notes=root.locator('[data-bubble=notes]');r=notes.bounding_box();bounds=boundary.bounding_box()
  # Genuine pointer drag, then nearest-edge docking. Gesture is confined to handles.
  page.mouse.move(r['x']+25,r['y']+25);page.mouse.down();page.mouse.move(bounds['x']+bounds['width']-45,bounds['y']+90,steps=14);page.mouse.up();page.wait_for_timeout(250)
  check(root.get_attribute('data-edge')=='right' and not panel.is_visible(),engine+': actual pointer drag snaps without opening')
  for button in root.locator('[data-bubble]:visible').all():
   r=button.bounding_box();check(r['x']>=bounds['x'] and r['y']>=bounds['y'] and r['x']+r['width']<=bounds['x']+bounds['width'] and r['y']+r['height']<=bounds['y']+bounds['height'],engine+': bubbles remain inside boundary')
   check(no_overlap(r,primary.bounding_box()),engine+': dock cannot cover primary action')
  root.locator('.hx-workbench').screenshot(path=str(a.output/f'{engine}-dock-closed.png'))
  notes.click();page.wait_for_timeout(80);check(no_overlap(panel.bounding_box(),primary.bounding_box()),engine+': panel cannot cover primary action')
  check(panel.bounding_box()['y']>=boundary.bounding_box()['y'],engine+': panel stays inside workspace')
  root.locator('.hx-workbench').screenshot(path=str(a.output/f'{engine}-dock-open.png'))
  page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(80)
  check(root.get_attribute('data-reduced')=='true' and root.locator('[data-bubble-group]').evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s',engine+': changed reduction removes docking transition')
  check(field.input_value()=='A kept workshop note.',engine+': reduction retains current note and functional panel')
  panel.locator('[data-utility-close]').click();page.wait_for_timeout(80);scroll=root.locator('.hx-workspace-scroll');before=scroll.evaluate('(e)=>e.scrollTop');r=scroll.bounding_box();page.mouse.move(r['x']+30,r['y']+150);page.mouse.wheel(0,200);page.wait_for_timeout(100)
  check(scroll.evaluate('(e)=>e.scrollTop')>before,engine+': page scroll remains available behind dock')
  flag.uncheck();check(not layer.is_visible() and root.locator('[data-utility-content]').count()==3,engine+': feature off restores complete inline tools')
  for width in (390,320,640):
   page.set_viewport_size({'width':width,'height':1000})
   if width==640:page.add_style_tag(content='html{font-size:200%}')
   flag.check();notes.click();page.wait_for_timeout(80)
   check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),engine+': dock reflow '+str(width))
   br=boundary.bounding_box();pr=panel.bounding_box();check(pr['x']>=br['x'] and pr['x']+pr['width']<=br['x']+br['width']+1,engine+': panel width bounded '+str(width))
   check(no_overlap(pr,primary.bounding_box()),engine+': enlarged primary action unobstructed '+str(width))
   flag.uncheck()
  # Independent fresh helper can be destroyed mid-drag/open without losing content.
  page.goto(base+'bubbles.html');page.wait_for_timeout(80)
  page.evaluate("""async()=>{const {mountUtilityDock}=await import('./bubbles.mjs');const host=document.querySelector('[data-bubble-demo]').cloneNode(true);host.querySelector('[data-bubble-group]').replaceChildren();document.querySelector('main').append(host);window.qaRoot=host;window.qaDock=mountUtilityDock(host);qaDock.setEnabled(true);qaDock.open('agenda');qaRoot.querySelector('[data-panel-content] a').focus();qaDock.configure(1);window.qaFocusRestored=document.activeElement===qaRoot.querySelector('[data-bubble=notes]');qaDock.destroy();}""")
  check(page.evaluate('qaFocusRestored'),engine+': reconfiguration restores focus from a removed utility')
  check(page.evaluate("qaRoot.querySelector('[data-bubble-layer]').hidden&&qaRoot.querySelectorAll('[data-utility-content]').length===3&&qaRoot.querySelectorAll('[data-bubble]').length===0"),engine+': destroy restores original nodes and removes overlay controls')
  page.evaluate('dispatchEvent(new Event("beforeprint"))');page.emulate_media(media='print')
  check(page.evaluate("qaRoot.querySelectorAll('[data-utility-content]').length===3"),engine+': print retains complete inline utility content')
  page.emulate_media(media='screen')
  page.locator('.hx-recording summary').click();video=page.locator('video');video.evaluate('async e=>{e.muted=true;await e.play()}');page.wait_for_timeout(120)
  check(video.evaluate('(e)=>e.readyState>=2&&e.currentTime>0&&Math.abs(e.duration-8)<.01'),engine+': original browser capture plays')
  video.evaluate('(e)=>e.pause()');check(video.evaluate('(e)=>e.paused'),engine+': native media pause')
  check(not errors and not bad,engine+': no runtime or failed same-origin resources '+str(errors+bad));metrics.append({'engine':engine,'version':b.version,'dockInitial':initial,'spotlightInitial':spotCost});ctx.close()
  # Touch and initial reduction in isolated mobile session.
  ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=engine!='firefox',reduced_motion='reduce');q=ctx.new_page();q.goto(base+'spotlight.html');q.locator('[value=face]').check();check(q.locator('[data-spotlight]').get_attribute('data-effective')=='static',engine+': mobile/initial reduction keeps spotlight still')
  q.goto(base+'bubbles.html');q.locator('[data-bubbles-enable]').tap();q.locator('[data-bubble=notes]').tap();check(q.locator('[data-utility-panel]').is_visible(),engine+': touch panel works under initial reduction');q.locator('[data-panel-content] textarea').fill('Touch note.');q.locator('.hx-workbench').screenshot(path=str(a.output/f'{engine}-dock-mobile-open.png'));q.locator('[data-utility-close]').tap();check(q.locator('[data-utility=notes] textarea').input_value()=='Touch note.',engine+': touch content persists inline');q.locator('.hx-workbench').screenshot(path=str(a.output/f'{engine}-dock-mobile.png'));ctx.close()
  ctx=b.new_context(java_script_enabled=False,viewport={'width':390,'height':844});q=ctx.new_page();q.goto(base+'spotlight.html');check(q.locator('.hx-spot-card a').count()==3 and q.locator('[value=face]').is_disabled(),engine+': no-script cards and honest controls');q.goto(base+'bubbles.html');check(q.locator('[data-bubbles-enable]').is_disabled() and q.locator('[data-utility-content]').count()==3,engine+': no-script complete inline tools');q.locator('textarea').fill('No script note.');check(q.locator('textarea').input_value()=='No script note.',engine+': no-script editing works');ctx.close();b.close()
(a.output/'results.json').write_text(json.dumps({'checks':checks,'metrics':metrics,'unavailable':unavailable},indent=2));print(str(len(checks))+' Hyperplexed pilot assertions passed')
