#!/usr/bin/env python3
"""Actual scroll-to-object acceptance. No downloaded creator code or assets.
Run against tools/serve-motion-preview.py; authoring-only Playwright dependency.
"""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--output',required=True);a=p.parse_args()
out=Path(a.output);out.mkdir(parents=True,exist_ok=True);checks=[];samples=[]
def check(ok,label):
 if not ok:raise AssertionError(label)
 checks.append(label)
def state(target):
 return target.evaluate("e=>{const m=new DOMMatrix(getComputedStyle(e).transform),r=e.getBoundingClientRect();return {x:m.e,y:m.f,a:m.a,b:m.b,scale:Math.hypot(m.a,m.b),box:r.toJSON(),transform:getComputedStyle(e).transform}}")
def jump(page,root,ratio):
 root.locator('.ma-scroll').evaluate('(e,r)=>e.scrollTop=(e.scrollHeight-e.clientHeight)*r',ratio);page.wait_for_timeout(100)
 return state(root.locator('.ma-scroll-object'))
with sync_playwright() as pw:
 for engine in ('chromium','webkit'):
  browser=getattr(pw,engine).launch(headless=True)
  for fallback in (False,True):
   context=browser.new_context(viewport={'width':1280,'height':1100},reduced_motion='no-preference')
   if fallback:context.add_init_script("const original=CSS.supports.bind(CSS);CSS.supports=(...args)=>args[0]==='animation-timeline: scroll(nearest block)'?false:original(...args)")
   page=context.new_page();errors=[];failed=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('response',lambda r:failed.append(r.url) if r.url.startswith(a.url) and r.status>=400 else None)
   page.goto(a.url+'/kits/shorts-lab/effects/scroll-object.html');root=page.locator('[data-atlas=reveal]');root.wait_for();root.scroll_into_view_if_needed();page.wait_for_timeout(100)
   prefix=engine+(' fallback' if fallback else ' native')
   check(root.get_attribute('data-scroll-engine')==('fallback' if fallback else 'native'),prefix+': expected engine')
   first=jump(page,root,0);middle=jump(page,root,.5);last=jump(page,root,1);reverse=jump(page,root,.5)
   check(last['x']-first['x']>500,prefix+': substantial visible horizontal path')
   check(middle['scale']>first['scale']*1.6,prefix+': distinct size change')
   check(abs(middle['b'])>.5 and last['b']<-.65,prefix+': distinct rotation')
   check(abs(reverse['x']-middle['x'])<1 and abs(reverse['b']-middle['b'])<.01,prefix+': reversible mapping')
   page.wait_for_timeout(250);parked=state(root.locator('.ma-scroll-object'))
   check(parked['transform']==reverse['transform'],prefix+': no timed movement while parked')
   check(root.locator('[data-scroll-position]').text_content()=='50%',prefix+': real scroll readout')
   if not fallback:
    for label,ratio in [('start',0),('middle',.5),('end',1)]:
     jump(page,root,ratio);root.screenshot(path=str(out/f'{engine}-{label}.png'))
   for motion in ('translate','rotate','scale'):
    root.locator('[data-option=objectMotion]').select_option(motion)
    start=jump(page,root,0);end=jump(page,root,1);mid=jump(page,root,.5)
    check((end['x']-start['x']>500) if motion=='translate' else abs(end['x']-start['x'])<1,prefix+': isolated '+motion+' position')
    check((abs(start['b'])<.01 and abs(mid['b'])<.01) if motion!='rotate' else abs(mid['b'])>.5,prefix+': isolated '+motion+' rotation')
    check((mid['scale']>1.19) if motion=='scale' else abs(mid['scale']-1)<.01,prefix+': isolated '+motion+' size')
   root.locator('[data-option=objectMotion]').select_option('combined')
   for action,percent in [('scrollStart','0%'),('scrollMiddle','50%'),('scrollEnd','100%')]:
    button=root.locator(f'[data-atlas-action={action}]');button.focus();button.press('Enter');page.wait_for_timeout(100)
    check(root.locator('[data-scroll-position]').text_content()==percent and button.evaluate('(e)=>e===document.activeElement'),prefix+': keyboard checkpoint '+percent)
   scroll=root.locator('.ma-scroll');scroll.focus();scroll.press('Home');scroll.press('ArrowDown');page.wait_for_timeout(180)
   check(scroll.evaluate('(e)=>e.scrollTop')>0,prefix+': native keyboard scrolling')
   page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(100)
   reduced_start=jump(page,root,0);reduced_end=jump(page,root,1)
   check(reduced_start['transform']==reduced_end['transform']=='none',prefix+': changed reduced motion settles object')
   check(root.locator('[data-scroll-position]').text_content()=='100%',prefix+': checkpoints remain functional under reduction')
   page.emulate_media(reduced_motion='no-preference');page.evaluate("document.documentElement.classList.add('motion-off')");page.wait_for_timeout(100)
   check(jump(page,root,.5)['transform']=='none',prefix+': shared motion-off settles')
   page.evaluate("document.documentElement.classList.remove('motion-off')");page.wait_for_timeout(100)
   check(jump(page,root,.5)['transform']!='none',prefix+': motion restoration')
   for width in (390,320,640):
    page.set_viewport_size({'width':width,'height':1000});page.wait_for_timeout(100)
    if width==640:page.add_style_tag(content='html{font-size:200%}')
    check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),prefix+': no horizontal overflow '+str(width))
    check(root.locator('select').evaluate_all('(es)=>es.every(e=>e.getBoundingClientRect().height>=44)'),prefix+': usable select targets '+str(width))
    for ratio in (0,.25,.5,.75,1):
     sample=jump(page,root,ratio);bounds=scroll.bounding_box();r=sample['box']
     check(r['x']>=bounds['x']-1 and r['right']<=bounds['x']+bounds['width']+1 and r['y']>=bounds['y']-1 and r['bottom']<=bounds['y']+bounds['height']+1,prefix+': cube contained '+str(width)+' '+str(ratio))
    if width==390 and not fallback:root.screenshot(path=str(out/f'{engine}-mobile.png'))
   # Existing quiet modes remain usable and do not inherit scrub transforms.
   for mode in ('once','entry','exit','static'):
    root.locator('[data-option=scrollMode]').select_option(mode);jump(page,root,.5)
    check(root.get_attribute('data-scroll-mode')==mode,prefix+': retained '+mode)
   root.locator('[data-option=scrollMode]').select_option('static');page.wait_for_timeout(750)
   check(state(root.locator('.ma-scroll-object'))['transform']=='none',prefix+': static mode settled')
   # Controller teardown removes effects/listeners and freezes the output.
   page.evaluate("async()=>{const {mountEffect}=await import('./atlas.mjs');const {renderStudy}=await import('./studies.mjs');const host=document.createElement('div');host.innerHTML=renderStudy('reveal','lifecycle',{assetBase:'./assets/'});document.body.append(host);window.testController=mountEffect(host.firstElementChild);window.testRoot=host.firstElementChild;testController.destroy();}")
   page.wait_for_timeout(100)
   check(page.evaluate("testRoot.dataset.scrollEngine==='static'&&testRoot.querySelector('.ma-scroll-object').getAnimations().length===0"),prefix+': teardown cancels animation')
   page.evaluate("testRoot.querySelector('.ma-scroll').scrollTop=400");page.wait_for_timeout(100)
   check(page.evaluate("testRoot.querySelector('[data-scroll-position]').textContent==='0%'"),prefix+': teardown aborts readout events')
   # Initial preference, not only a change while mounted.
   page.emulate_media(reduced_motion='reduce');page.reload();page.wait_for_timeout(100);root=page.locator('[data-atlas=reveal]')
   check(jump(page,root,.5)['transform']=='none',prefix+': initial reduction')
   check(not errors and not failed,prefix+': no runtime or same-origin resource errors')
   samples.append({'engine':engine,'version':browser.version,'fallback':fallback,'first':first,'middle':middle,'last':last})
   context.close()
  browser.close()
(out/'scroll-results.json').write_text(json.dumps({'checks':checks,'samples':samples},indent=2))
print(str(len(checks))+' scroll-object checks passed')
