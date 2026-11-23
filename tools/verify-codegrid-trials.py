#!/usr/bin/env python3
"""Issue 99 acceptance. Isolated local routes; no creator footage downloaded.
Requires authoring-only Python Playwright. Serve with serve-motion-preview.py.
"""
import argparse,json,math
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',required=True);parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
args.output.mkdir(parents=True,exist_ok=True);checks=[];metrics=[]
route=args.url.rstrip('/')+'/kits/shorts-lab/trials/codegrid/'
def check(ok,label):
 if not ok:raise AssertionError(label)
 checks.append(label)
def jump(page,viewport,ratio):
 viewport.evaluate('(e,r)=>e.scrollTop=(e.scrollHeight-e.clientHeight)*r',ratio);page.wait_for_timeout(100)
def visual(root):
 return root.locator('.cg-story-card,.cg-hero-art figure,.cg-hero-word,.cg-project-art').evaluate_all('(es)=>es.map(e=>({transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity,clip:getComputedStyle(e).clipPath}))')
perf_init="""window.qaPerf={lcp:0,cls:0,allShift:0,longTasks:[],shifts:[],supported:PerformanceObserver.supportedEntryTypes};try{new PerformanceObserver(l=>l.getEntries().forEach(e=>qaPerf.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true})}catch{}try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{qaPerf.allShift+=e.value;qaPerf.shifts.push({value:e.value,recent:e.hadRecentInput,t:e.startTime,sources:e.sources.map(s=>({node:s.node?.className,previous:s.previousRect,current:s.currentRect}))});if(!e.hadRecentInput)qaPerf.cls+=e.value})).observe({type:'layout-shift',buffered:true})}catch{}try{new PerformanceObserver(l=>l.getEntries().forEach(e=>qaPerf.longTasks.push(e.duration))).observe({type:'longtask',buffered:true})}catch{}"""
with sync_playwright() as pw:
 for name in ('chromium','webkit'):
  browser=getattr(pw,name).launch(headless=True)
  for kind in ('gallery','stack','hero'):
   prefix=name+' '+kind;ctx=browser.new_context(viewport={'width':1280,'height':1100},reduced_motion='no-preference');ctx.add_init_script(perf_init)
   page=ctx.new_page();errors=[];bad=[];requests=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url));page.on('response',lambda r:bad.append({'url':r.url,'status':r.status}) if r.url.startswith(args.url) and r.status>=400 else None)
   page.goto(route+kind+'.html');root=page.locator('[data-scene]');v=root.locator('.cg-viewport');page.wait_for_timeout(250)
   check(root.get_attribute('data-mode')=='static',prefix+': complete static default')
   check(not any('gsap.min.js' in r for r in requests),prefix+': no initial GSAP request')
   initial=page.evaluate("({bytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.encodedBodySize,0)+performance.getEntriesByType('navigation')[0].encodedBodySize,perf:qaPerf})")
   check(1000<initial['bytes']<55000,prefix+': cold initial uncompressed bytes <55 KB')
   check(initial['perf']['cls']<.01,prefix+': initial CLS <.01')
   if name=='chromium':check(0<initial['perf']['lcp']<1500,prefix+': localhost LCP <1500 ms')
   outer_height=v.bounding_box()['height'];root.locator('[data-view=explore]').click();page.wait_for_selector('[data-mode=explore]');v.scroll_into_view_if_needed();page.wait_for_timeout(100)
   check(abs(v.bounding_box()['height']-outer_height)<1,prefix+': stable frame geometry on activation')
   check(root.get_attribute('data-engine')==('native-events' if kind=='gallery' else 'gsap-3.15.1'),prefix+': expected engine')
   check(sum('gsap.min.js' in r for r in requests)==(0 if kind=='gallery' else 1),prefix+': scoped runtime load')
   # Actual local 60-frame scroll sample: interval budget, long tasks and bytes.
   page.set_viewport_size({'width':1280,'height':1100});root.locator('[data-view=explore]').click();v.scroll_into_view_if_needed()
   frame_stats=v.evaluate("""async e=>{const intervals=[];let last=performance.now();for(let i=0;i<60;i++){await new Promise(requestAnimationFrame);const now=performance.now();intervals.push(now-last);last=now;e.scrollTop=(e.scrollHeight-e.clientHeight)*i/59}intervals.sort((a,b)=>a-b);return {p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),frames:intervals.length}}""")
   check(frame_stats['p95']<40,prefix+': local scroll frame p95 <40 ms')
   final=page.evaluate("({bytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.encodedBodySize,0)+performance.getEntriesByType('navigation')[0].encodedBodySize,perf:qaPerf})")
   check(final['bytes']<135000,prefix+': activated route transfer <135 KB')
   check(final['perf']['cls']<.01,prefix+': CLS <.01 through activation and scroll')
   metrics.append({'engine':name,'version':browser.version,'kind':kind,'initial':initial,'activated':final,'frames':frame_stats})
   jump(page,v,0);start=visual(root);jump(page,v,.5);mid=visual(root);jump(page,v,1);end=visual(root);jump(page,v,.5);reverse=visual(root)
   check(start!=mid and mid!=end,prefix+': real intermediate visual change')
   check(reverse==mid,prefix+': deterministic reverse mapping')
   count=root.get_attribute('data-render-count');page.wait_for_timeout(250)
   check(root.get_attribute('data-render-count')==count and visual(root)==reverse,prefix+': no idle scroll loop or time drift')
   sticky=root.locator('.cg-sticky')
   if kind!='gallery':
    check(sticky.bounding_box()['height']<=v.bounding_box()['height'],prefix+': sticky scene fits frame, not the tall track')
   if kind=='stack':
    jump(page,v,1);check(root.locator('.cg-story-card').last.evaluate("(e)=>getComputedStyle(e).opacity==='1'&&Math.abs(e.getBoundingClientRect().top-e.closest('.cg-viewport').getBoundingClientRect().top)<80"),prefix+': final card visible within frame')
    check(root.locator('.cg-outline li').count()==4,prefix+': singular complete reading sequence')
   if kind=='hero':
    jump(page,v,1);check(root.locator('.cg-word-three').evaluate("(e)=>getComputedStyle(e).opacity==='1'"),prefix+': final hero phase visible')
    check(page.locator('.cg-primary').is_visible() and root.locator('.cg-outline li').count()==3,prefix+': action and reading content independent of scene')
   for label,ratio in [('start',0),('middle',.5),('end',1)]:
    jump(page,v,ratio);v.screenshot(path=str(args.output/f'{name}-{kind}-{label}.png'))
   # Checkpoints change the real native scroller, preserving the initiating focus.
   for index,ratio in enumerate((0,1)):
    button=root.locator('[data-checkpoint]').nth(0 if index==0 else -1);button.focus();button.press('Enter');page.wait_for_timeout(100)
    check(root.locator('[data-position]').text_content()==str(int(ratio*100))+'%' and button.evaluate('(e)=>e===document.activeElement'),prefix+': keyboard checkpoint '+str(ratio))
   v.focus();v.press('Home');v.press('ArrowDown');page.wait_for_timeout(150);check(v.evaluate('(e)=>e.scrollTop')>0,prefix+': native arrow scrolling')
   # The component must not consume presenter keys or install a second player.
   page.evaluate("window.qaKeys=[];document.addEventListener('keydown',e=>qaKeys.push({key:e.key,prevented:e.defaultPrevented}),{once:true})")
   v.press('ArrowRight');check(page.evaluate("qaKeys[0].key==='ArrowRight'&&!qaKeys[0].prevented"),prefix+': presenter ArrowRight remains unhandled')
   if kind=='gallery':
    link=root.locator('.cg-project a').nth(2);link.focus();link.scroll_into_view_if_needed();page.wait_for_timeout(100);old_top=v.evaluate('(e)=>e.scrollTop');link.click();check(page.url.endswith('project.html#chapter-studio'),prefix+': real project deep link')
    page.go_back();page.wait_for_selector('[data-mode=explore]');root=page.locator('[data-scene]');v=root.locator('.cg-viewport');page.wait_for_timeout(100)
    check(abs(v.evaluate('(e)=>e.scrollTop')-old_top)<3,prefix+': browser Back restores viewing mode and position')
    # Focused project links remain visible when changed reduced motion settles.
    root.locator('.cg-project a').last.focus()
   page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(120)
   check(root.get_attribute('data-mode')=='static',prefix+': changed reduction restores complete still composition')
   check(all(s['transform']=='none' and s['clip']=='none' for s in visual(root)),prefix+': reduction clears GSAP and native styles')
   if kind=='gallery':
    focused=page.evaluate('document.activeElement.getBoundingClientRect().toJSON()');bounds=v.bounding_box();check(focused['top']>=bounds['y']-1 and focused['bottom']<=bounds['y']+bounds['height']+1,prefix+': focused link remains in view')
   root.locator('[data-view=explore]').click();page.wait_for_timeout(80);check(root.get_attribute('data-mode')=='static',prefix+': reduction cannot accidentally enable motion')
   page.emulate_media(reduced_motion='no-preference');root.locator('[data-view=explore]').click();page.wait_for_selector('[data-mode=explore]');v.scroll_into_view_if_needed()
   page.evaluate("document.documentElement.classList.add('motion-off')");page.wait_for_timeout(80);check(root.get_attribute('data-mode')=='static',prefix+': global reduction settles')
   page.evaluate("document.documentElement.classList.remove('motion-off')")
   # Rapid activation/settle does not leave stale contexts or timers.
   for _ in range(3):
    root.locator('[data-view=explore]').click();root.locator('[data-view=static]').click()
   page.wait_for_timeout(80);check(root.get_attribute('data-mode')=='static' and all(s['transform']=='none' for s in visual(root)),prefix+': rapid mode changes settle cleanly')
   for width in (390,320,640):
    page.set_viewport_size({'width':width,'height':1000})
    if width==640:page.add_style_tag(content='html{font-size:200%}')
    root.locator('[data-view=explore]').click();page.wait_for_selector('[data-mode=explore]');v.scroll_into_view_if_needed();jump(page,v,.5)
    check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),prefix+': reflow '+str(width))
    if kind!='gallery':check(sticky.bounding_box()['height']<=v.bounding_box()['height'],prefix+': bounded enlarged scene '+str(width))
    root.locator('[data-view=static]').click()
   page.screenshot(path=str(args.output/f'{name}-{kind}-enlarged.png'),full_page=True)
   # Optional recordings are actual playable media, excluded from the cold budget.
   page.locator('.cg-recording summary').click();video=page.locator('video')
   video.evaluate('async e=>{e.muted=true;await e.play()}');page.wait_for_timeout(180)
   check(video.evaluate('(e)=>e.readyState>=2&&e.currentTime>0&&Math.abs(e.duration-4)<.01'),prefix+': actual recorded media plays')
   video.evaluate('(e)=>e.pause()')
   check(video.evaluate('(e)=>e.paused'),prefix+': native media pause retained')
   page.emulate_media(media='print')
   check(v.evaluate('(e)=>getComputedStyle(e).overflow==="visible"'),prefix+': print removes bounded scrolling')
   if kind!='gallery':check(sticky.evaluate('(e)=>getComputedStyle(e).position')=='relative',prefix+': print removes pinning')
   page.emulate_media(media='screen')
   check(not errors and not bad,prefix+': no runtime or failed same-origin resources '+str(errors+bad))
   # Independently mounted duplicate and teardown: no imported auto-mount.
   page.evaluate("""async()=>{const {mountScene}=await import('./scenes.mjs');const el=document.querySelector('[data-scene]').cloneNode(true);el.querySelectorAll('[style]').forEach(e=>{if(!e.matches('.cg-story-card'))e.removeAttribute('style')});document.querySelector('main').append(el);window.qaScene=mountScene(el,{restore:false});window.qaRoot=el;await qaScene.setMode('explore');qaScene.destroy();}""")
   check(page.evaluate("qaRoot.dataset.mode==='static'&&qaRoot.dataset.engine==='static'"),prefix+': explicit teardown restores still view')
   before=page.evaluate('qaRoot.dataset.renderCount');page.evaluate("qaRoot.querySelector('.cg-viewport').scrollTop=100");page.wait_for_timeout(100)
   check(page.evaluate('qaRoot.dataset.renderCount')==before,prefix+': teardown cancels scroll listener/frame')
   ctx.close()
   # Mobile/touch and initial reduction, independent from existing session state.
   mobile=browser.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce');q=mobile.new_page();q.goto(route+kind+'.html');q.wait_for_timeout(100)
   check(q.locator('[data-scene]').get_attribute('data-mode')=='static',prefix+': initial reduction')
   q.locator('[data-view=explore]').tap();check(q.locator('[data-scene]').get_attribute('data-mode')=='static',prefix+': touch obeys initial reduction')
   q.emulate_media(reduced_motion='no-preference');q.locator('[data-view=explore]').tap();q.wait_for_selector('[data-mode=explore]');q.locator('[data-checkpoint]').last.tap();q.wait_for_timeout(100)
   check(q.locator('[data-position]').text_content()=='100%',prefix+': touch checkpoint')
   q.locator('.cg-viewport').screenshot(path=str(args.output/f'{name}-{kind}-mobile.png'));mobile.close()
   nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844});q=nojs.new_page();q.goto(route+kind+'.html')
   check(q.locator('[data-view=explore]').is_disabled(),prefix+': no-script controls honest')
   if kind=='gallery':check(q.locator('.cg-project a').count()==4,prefix+': no-script complete project links')
   else:check(q.locator('.cg-outline li').count()==(4 if kind=='stack' else 3),prefix+': no-script complete reading composition')
   nojs.close()
   if kind!='gallery':
    blocked=browser.new_context();q=blocked.new_page();q.route('**/gsap.min.js',lambda r:r.abort());q.goto(route+kind+'.html');q.locator('[data-view=explore]').click();q.wait_for_function("document.querySelector('[data-scene-status]').textContent.includes('could not load')")
    check(q.locator('[data-scene]').get_attribute('data-mode')=='static',prefix+': runtime failure retains still view');blocked.close()
  browser.close()
(args.output/'results.json').write_text(json.dumps({'checks':checks,'metrics':metrics},indent=2));print(str(len(checks))+' Codegrid trial assertions passed')
