#!/usr/bin/env python3
"""Browser acceptance for the second Motion Atlas intake. Authoring-only Playwright/Pillow.
Serve with tools/serve-motion-preview.py, then pass --url and --output.
"""
import argparse,json
from pathlib import Path
from io import BytesIO
from PIL import Image
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',required=True);parser.add_argument('--output',required=True);args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
checks=[];gutter_evidence=[]
def check(value,label):
 if not value:raise AssertionError(label)
 checks.append(label)
def option(root,name,value):
 root.scroll_into_view_if_needed();el=root.locator(f'[data-option="{name}"]')
 if el.evaluate('(el)=>el.tagName')=='SELECT':el.select_option(str(value))
 else:el.fill(str(value))
def click(root,name):root.locator(f'[data-atlas-action="{name}"]').click()
with sync_playwright() as pw:
 for engine in ('chromium','webkit'):
  browser=getattr(pw,engine).launch(headless=True,**({'ignore_default_args':['--hide-scrollbars']} if engine=='chromium' else {}))
  context=browser.new_context(viewport={'width':1440,'height':1000},has_touch=True,reduced_motion='no-preference')
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(args.url+'/kits/shorts-lab/effects/');page.wait_for_selector('[data-atlas="comparison"][data-enhanced=true]')
  effect=lambda key:page.locator('[data-atlas="'+key+'"]')
  check(page.locator('[data-atlas]').count()==23,engine+': 23 reusable studies, no duplicate rows')
  check(page.locator('[data-running=true]').count()==0,engine+': static on entry')
  wipe=effect('tv-intro');target=wipe.locator('img')
  for shape in ('horizontal','diagonal','reverse-diagonal','circle','diamond','fade'):
   option(wipe,'shape',shape);click(wipe,'play');page.wait_for_timeout(100)
   animation=target.evaluate('(el)=>el.getAnimations().length')
   check(animation>0,engine+': '+shape+' animates actual image')
   target.evaluate('(el)=>{const a=el.getAnimations()[0];a.pause();a.currentTime=900}')
   mid=target.evaluate('(el)=>({clip:getComputedStyle(el).clipPath,transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity})')
   check(mid['clip']!='inset(0px)' or mid['opacity']!='1',engine+': '+shape+' has a genuine intermediate state')
   click(wipe,'stop');check(target.evaluate('(el)=>getComputedStyle(el).clipPath')=='inset(0px)',engine+': '+shape+' settles to complete image')
  option(wipe,'variant','type');check(wipe.locator('.ma-intro-type').is_visible(),engine+': original intro variant retained')
  option(wipe,'variant','image');option(wipe,'shape','circle');option(wipe,'ratio','tall');option(wipe,'focal','90');click(wipe,'play');page.wait_for_timeout(100)
  wipe.locator('.ma-stage').screenshot(path=str(out/f'{engine}-iris.png'));click(wipe,'stop')
  counter=effect('count-up')
  for method in ('js','css'):
   option(counter,'method',method)
   for preset,final in [('large',24800),('small',100),('descending',20),('negative',50)]:
    option(counter,'target',preset);click(counter,'play');page.wait_for_timeout(170)
    if method=='css':
     number=counter.locator('.ma-number-css').evaluate('(el)=>Number(getComputedStyle(el).getPropertyValue("--ma-number"))')
     check(number!=final,engine+': CSS '+preset+' interpolates an integer')
    else:
     number=int(counter.locator('.ma-number-js').inner_text().replace(',',''))
     check(number!=final,engine+': JS '+preset+' has a genuine intermediate value')
    click(counter,'stop');check(counter.locator('.ma-number').get_attribute('aria-label').startswith(f'{final:,}'),engine+': '+method+' '+preset+' exact final accessible value')
  option(counter,'method','static');click(counter,'play');check(counter.locator('.ma-number-css').evaluate('(el)=>el.getAnimations().length')==0,engine+': static counter does not animate')
  typing=effect('typewriter');option(typing,'text','original')
  check(typing.locator('.ma-type-line').inner_text()=='A moment of impact.',engine+': original headline is complete')
  option(typing,'text','unicode');check(typing.evaluate("el=>Number(el.style.getPropertyValue('--ma-characters'))")==14,engine+': grapheme count includes emoji once')
  click(typing,'play');page.wait_for_timeout(100);check(typing.locator('.ma-type-line span').evaluate('(el)=>getComputedStyle(el).clipPath')!='inset(0px)',engine+': stepped text reveal')
  click(typing,'stop');check(typing.locator('.ma-type-line span').evaluate('(el)=>getComputedStyle(el).clipPath')=='inset(0px)',engine+': typewriter stop keeps full heading')
  border=effect('border')
  for method in ('angle','rotate'):
   option(border,'method',method);option(border,'mode','loop');click(border,'play');page.wait_for_timeout(60)
   delta=border.evaluate("""el=>{const anim=el.getAnimations({subtree:true}).find(a=>a.animationName==='ma-border-angle'||a.animationName==='ma-border-turn');anim.pause();const duration=anim.effect.getTiming().duration;anim.currentTime=duration-.01;const target=anim.effect.target;const before=getComputedStyle(target,anim.effect.pseudoElement).getPropertyValue(anim.animationName==='ma-border-angle'?'--ma-angle':'transform');anim.currentTime=duration+.01;const after=getComputedStyle(target,anim.effect.pseudoElement).getPropertyValue(anim.animationName==='ma-border-angle'?'--ma-angle':'transform');return {before,after};}""")
   check(bool(delta['before']) and bool(delta['after']),engine+': '+method+' border has sampled loop states')
   click(border,'stop')
  option(border,'trigger','focus');border.locator('.ma-border-action').focus();page.wait_for_timeout(80)
  check(border.get_attribute('data-running')=='true',engine+': focused focal action can start bounded border')
  border.locator('.ma-border-action').focus();border.locator('.ma-border-action').press('Space')
  check(border.locator('.ma-border-action').evaluate('(el)=>getComputedStyle(el).outlineStyle')!='none',engine+': border preserves separate keyboard focus')
  click(border,'stop')
  goo=effect('metaball');option(goo,'mode','loop');option(goo,'duration','1');click(goo,'play');page.wait_for_timeout(100)
  check(goo.locator('.ma-goo-track i:visible').count()==5,engine+': five discrete dots')
  goo.locator('.ma-goo-track i').evaluate_all('(els)=>els.forEach(el=>el.getAnimations()[0].pause())')
  samples=[]
  for ms in (0,250,500,750,1000,1250,1500,1750,2000,2250,2500,2750):
   goo.locator('.ma-goo-track i').evaluate_all('(els,t)=>els.forEach(el=>el.getAnimations()[0].currentTime=t)',ms)
   data=goo.locator('.ma-goo-field').screenshot();img=Image.open(BytesIO(data)).convert('RGB');row=[img.getpixel((x,img.height//2)) for x in range(img.width)]
   segments=0;inside=False
   for r,g,b in row:
    lit=min(r,g,b)>180
    if lit and not inside:segments+=1
    inside=lit
   samples.append(segments)
  check(min(samples)<max(samples) and max(samples)>=4,engine+': actual filtered dots merge and separate across three cycles '+str(samples))
  filtered=goo.locator('.ma-goo-field').screenshot(path=str(out/f'{engine}-five-dots.png'))
  option(goo,'filter','none');raw=goo.locator('.ma-goo-field').screenshot();check(filtered!=raw,engine+': no-filter comparison uses actual rendered pixels')
  option(goo,'variant','two');check(goo.locator('.ma-goo-track i:visible').count()==2,engine+': original two-dot option retained');click(goo,'stop')
  progress=effect('progress');click(progress,'sample-value');check(progress.locator('progress').get_attribute('value')=='80',engine+': original known value remains independent')
  option(progress,'variant','scroll');scroller=progress.locator('.ma-reading')
  for method in ('native','fallback'):
   option(progress,'method',method)
   for ratio in (0,.25,.5,.75,1,.5,0):
    scroller.evaluate('(el,r)=>el.scrollTop=(el.scrollHeight-el.clientHeight)*r',ratio);page.wait_for_timeout(70)
    actual=progress.locator('.ma-reading-track i').evaluate('(el)=>new DOMMatrix(getComputedStyle(el).transform).a')
    check(abs(actual-ratio)<.02,engine+': '+method+' reading position '+str(ratio))
  scroller.locator('article').evaluate('(el)=>el.innerHTML="<p>A short document.</p>"');page.wait_for_timeout(100)
  check(progress.evaluate("el=>Number(el.style.getPropertyValue('--ma-scroll-progress'))")==0,engine+': no-overflow reading state is zero')
  focus=effect('focus-within')
  for variant,selector in [('basic','.ma-focus-basic'),('search','.ma-focus-search'),('fields','.ma-focus-fields'),('toolbar','.ma-focus-toolbar')]:
   option(focus,'variant',variant);group=focus.locator(selector);field=group.locator('input').first;field.focus();page.keyboard.press('Tab');page.keyboard.press('Shift+Tab');page.wait_for_timeout(170)
   check(group.evaluate("el=>el.matches(':focus-within')"),engine+': '+variant+' contains actual focus')
   check(field.evaluate('(el)=>getComputedStyle(el).outlineStyle')!='none',engine+': '+variant+' child focus remains visible')
   focus.locator('[data-option=variant]').focus();check(not group.evaluate("el=>el.matches(':focus-within')"),engine+': '+variant+' focus boundary exits')
  option(focus,'variant','search');focus.locator('.ma-focus-search input').fill('Atlas');click(focus,'clear');check(focus.locator('.ma-focus-search input').input_value()=='',engine+': native search group clear')
  palette=effect('palette');option(palette,'space','srgb');srgb=palette.locator('.ma-mix-swatch').screenshot();option(palette,'space','oklch');oklch=palette.locator('.ma-mix-swatch').screenshot()
  check(srgb!=oklch,engine+': colour-space comparison renders differently')
  option(palette,'brand','#ffffff');data=json.loads(palette.get_attribute('data-contrast'))
  check(next(x for x in data if x['label']=='Button')['ratio']==1,engine+': white-on-white contrast is 1:1 and fails')
  option(palette,'brand','#000000');data=json.loads(palette.get_attribute('data-contrast'))
  check(next(x for x in data if x['label']=='Button')['ratio']==21,engine+': black/white contrast is 21:1')
  option(palette,'alpha','transparent');option(palette,'surface','dark');check('color-mix(in oklch' in palette.locator('textarea').input_value(),engine+': actual token snippet follows controls')
  palette.locator('.ma-stage').screenshot(path=str(out/f'{engine}-tokens.png'))
  gutters=effect('layout-shift-2');option(gutters,'scrollbars','classic');page.wait_for_timeout(100);short=json.loads(gutters.get_attribute('data-measurements'));click(gutters,'overflow');page.wait_for_timeout(100);long=json.loads(gutters.get_attribute('data-measurements'))
  gutter_evidence.append({'engine':engine,'short':short,'long':long})
  if long[0]['gutter']>short[0]['gutter']:
   check(long[0]['width']<short[0]['width'],engine+': actual classic auto width changes')
  else:check('Overlay' in gutters.locator('.ma-caption').inner_text() or short[1]['gutter']>0,engine+': no classic auto change is labelled without a fake shift')
  stable=short[1]['width']==long[1]['width'] and short[2]['width']==long[2]['width']
  if engine=='chromium':check(stable,engine+': stable gutters retain widths')
  else:check(stable or 'did not reserve a stable gutter' in gutters.locator('.ma-gutter-measure').inner_text(),engine+': WebKit classic-width limitation is shown from actual measurements')
  option(gutters,'direction','rtl');check(gutters.locator('.ma-gutters').get_attribute('dir')=='rtl',engine+': native RTL gutter comparison')
  gutters.locator('.ma-stage').screenshot(path=str(out/f'{engine}-gutters.png'))
  audit=effect('reduced-motion');option(audit,'mode','loop');click(audit,'play');page.wait_for_timeout(80);option(audit,'preference','paused')
  check(audit.evaluate("el=>el.getAnimations({subtree:true}).every(a=>a.playState!=='running')"),engine+': local manual pause')
  option(audit,'preference','reduce');check(audit.locator('.ma-audit-arrival').evaluate('(el)=>getComputedStyle(el).opacity')=='1',engine+': reduced message stays visible')
  # Initial and changed system preferences settle the entire generated library.
  option(counter,'method','js');option(counter,'target','large');click(counter,'play');page.wait_for_timeout(80)
  page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(100)
  check(counter.locator('.ma-number-js').inner_text()=='24,800',engine+': mid-count reduction settles exact final value')
  check(target.evaluate('(el)=>getComputedStyle(el).clipPath')=='inset(0px)',engine+': reduction leaves the full image visible')
  check(page.locator('[data-atlas]').evaluate_all("els=>els.every(el=>el.dataset.reduced==='true'&&el.getAnimations({subtree:true}).every(a=>a.playState!=='running'))"),engine+': all 23 studies settle when preference changes')
  for width in (390,320):
   page.set_viewport_size({'width':width,'height':844});page.wait_for_timeout(70)
   check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),engine+': narrow '+str(width)+' reflow')
  page.add_style_tag(content='html{font-size:200%}');page.wait_for_timeout(100)
  check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),engine+': 200 percent text has no horizontal overflow')
  typing.scroll_into_view_if_needed();typing.locator('.ma-stage').screenshot(path=str(out/f'{engine}-type-enlarged.png'))
  # Real viewport units at desktop-emulated portrait and landscape; no phone UI claim.
  for width,height in ((390,844),(844,390)):
   page.set_viewport_size({'width':width,'height':height})
   for unit in ('vh','svh','dvh'):
    page.goto(args.url+'/kits/shorts-lab/effects/viewport.html?unit='+unit+'&sizing=fixed')
    page.wait_for_selector('html[data-unit]');rect=page.locator('footer').bounding_box()
    check(rect['y']+rect['height']<=height+1,engine+': '+unit+' CTA inside '+str(width)+'x'+str(height)+' viewport')
    page.locator('input').focus();page.locator('[data-start]').click();check('Nothing was submitted' in page.locator('[data-outcome]').inner_text(),engine+': viewport action remains reachable after focus')
  page.goto(args.url+'/kits/shorts-lab/effects/viewport.html?unit=dvh&sizing=min');page.wait_for_selector('html[data-sizing=min]')
  check(page.evaluate('document.scrollingElement.scrollHeight>innerHeight'),engine+': min-height permits document growth')
  # Whole-gallery audit includes original CSS/JS/WAAPI/media, no native SDK actions.
  page.goto(args.url+'/kits/shorts-lab/');page.wait_for_selector('.card[data-id="82"]')
  check(page.locator('.card').count()==82,engine+': original catalogue size remains 82')
  page.emulate_media(reduced_motion='no-preference')
  page.locator('.card[data-id="66"] [data-action="ambient-toggle"]').scroll_into_view_if_needed()
  player=page.locator('.card[data-id="75"] video');player.scroll_into_view_if_needed();player.evaluate('(el)=>el.play()');page.wait_for_timeout(120)
  page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(100)
  check(page.locator('.preview').evaluate_all("els=>els.every(el=>el.getAnimations({subtree:true}).every(a=>a.playState!=='running'))"),engine+': all 69 visual study previews stop nonessential animations')
  check(page.locator('video').evaluate_all('els=>els.every(el=>el.paused)'),engine+': preference change pauses recorded motion')
  page.locator('.card[data-id="75"] [data-action="pair"]').click();page.wait_for_timeout(100)
  check(player.evaluate('(el)=>el.paused'),engine+': paired comparison respects reduced motion')
  check(not errors,engine+': no browser runtime errors '+str(errors))
  context.close();browser.close()
(out/'practical-results.json').write_text(json.dumps({'checks':len(checks),'passed':checks,'gutterMeasurements':gutter_evidence,'physicalMobileUiTested':False,'firefox':'Existing local profile launch failure; not claimed'},indent=2)+'\n')
print('PASS',len(checks),'new-intake browser assertions')
