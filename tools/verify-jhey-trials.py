#!/usr/bin/env python3
"""Playwright acceptance for issue 96's isolated three-component review route."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--output',required=True);a=p.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True);checks=[];support=[]
route=a.url.rstrip('/')+'/kits/shorts-lab/trials/jhey-practical/'
def check(ok,label):
 if not ok:raise AssertionError(label)
 checks.append(label)
with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch();context=browser.new_context(viewport={'width':1280,'height':1100});page=context.new_page();errors=[];failed=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failed.append(r.url) if r.url.startswith(a.url) and r.status>=400 else None)
  page.goto(route);root=page.locator('[data-composer]');field=root.locator('textarea');field.wait_for();page.wait_for_timeout(100)
  support.append({'engine':engine,'version':browser.version,'fieldSizing':page.evaluate("CSS.supports('field-sizing:content')"),'interpolateSize':page.evaluate("CSS.supports('interpolate-size:allow-keywords')")})
  for mode in ['auto','fallback','static']:
   page.locator('[data-composer-engine]').select_option(mode);field.fill('Short thought.');small=field.bounding_box()['height'];field.fill(('A longer thought for the next scene.\n')*25);page.wait_for_timeout(100);large=field.bounding_box()['height']
   check(large<=225,engine+': composer maximum '+mode)
   check(large>small+60 if mode!='static' else abs(large-small)<1,engine+': composer growth '+mode)
   check(field.evaluate('(e)=>e.scrollHeight>e.clientHeight'),engine+': long note scrolls internally '+mode)
   field.press('ControlOrMeta+A');field.press('Backspace');page.wait_for_timeout(100)
   check(field.bounding_box()['height']<=110,engine+': composer shrinks '+mode)
   check(root.locator('[data-count]').text_content()=='0 / 2000',engine+': native editing preserved '+mode)
  field.fill('Keyboard note.');page.locator('[data-save]').focus();page.keyboard.press('Enter');check('Nothing sent or stored' in page.locator('[data-save-status]').text_content(),engine+': save is explicit preview only')
  menu=page.locator('[data-intent-menu]');menu.scroll_into_view_if_needed();page.mouse.click(5,5);page.wait_for_timeout(80)
  summaries=menu.locator('summary');rows=menu.locator('details');rects=[summaries.nth(i).bounding_box() for i in range(3)]
  # Rapid transit across all rows must not activate any of them.
  for r in rects:page.mouse.move(r['x']+40,r['y']+20)
  page.mouse.move(5,5);page.wait_for_timeout(330)
  check(menu.locator('details[open]').count()==0,engine+': fast pointer passes do not open panels')
  r=rects[0];page.mouse.move(r['x']+40,r['y']+20);page.wait_for_timeout(330)
  check(rows.nth(0).get_attribute('open') is not None,engine+': intentional dwell opens')
  # Cross the second row near the panel edge, then enter the original panel.
  page.mouse.move(r['x']+r['width']-4,r['y']+r['height']-5)
  second=rects[1];page.mouse.move(second['x']+second['width']-4,second['y']+12);page.wait_for_timeout(300)
  check(rows.nth(0).get_attribute('open') is not None,engine+': diagonal corridor extends switch grace')
  panel=rows.nth(0).locator('.intent-panel').bounding_box();page.mouse.move(panel['x']+40,second['y']+12);page.wait_for_timeout(550)
  check(rows.nth(0).get_attribute('open') is not None,engine+': entering original panel cancels pending switch')
  rows.nth(0).locator('a').first.focus();page.mouse.move(second['x']+40,second['y']+20);page.wait_for_timeout(600)
  check(rows.nth(0).get_attribute('open') is not None and rows.nth(0).locator('a').first.evaluate('(e)=>e===document.activeElement'),engine+': pointer cannot steal keyboard focus')
  page.keyboard.press('Escape');check(menu.locator('details[open]').count()==0 and summaries.nth(0).evaluate('(e)=>e===document.activeElement'),engine+': Escape closes and restores summary focus')
  summaries.nth(1).press('Enter');page.wait_for_timeout(50);check(rows.nth(1).get_attribute('open') is not None,engine+': immediate keyboard disclosure')
  page.keyboard.press('Alt+Tab' if engine=='webkit' else 'Tab');check(rows.nth(1).locator('a').first.evaluate('(e)=>e===document.activeElement'),engine+': Tab reaches ordinary navigation link')
  page.keyboard.press('Enter');check(page.url.endswith('#review-target'),engine+': actual local link destination')
  disclosure=page.locator('[data-disclosures]');summary=disclosure.locator('summary').first;summary.focus();summary.press('Enter');page.wait_for_timeout(80)
  check(disclosure.locator('details').first.get_attribute('open') is not None,engine+': native FAQ keyboard open')
  page.keyboard.press('Alt+Tab' if engine=='webkit' else 'Tab');check(disclosure.locator('a').first.evaluate('(e)=>e===document.activeElement'),engine+': FAQ content focus reachable')
  page.locator('[data-disclosure-motion]').check();summary.click();summary.click();page.wait_for_timeout(350)
  body=disclosure.locator('.disclosure-body').first
  check(body.is_visible() and body.bounding_box()['height']>60,engine+': complete enhanced disclosure content')
  page.emulate_media(reduced_motion='reduce');summary.click();summary.click();page.wait_for_timeout(50)
  check(body.is_visible(),engine+': changed reduced motion retains content')
  check(disclosure.locator('details').first.evaluate("e=>getComputedStyle(e,'::details-content').transitionDuration.split(',').every(v=>parseFloat(v)===0)"),engine+': reduced motion removes disclosure transition')
  page.emulate_media(reduced_motion='no-preference')
  for width in [390,320,640]:
   page.set_viewport_size({'width':width,'height':1000})
   if width==640:page.add_style_tag(content='html{font-size:200%}')
   page.wait_for_timeout(80);check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),engine+': reflow '+str(width))
   field.fill(('Responsive note.\n')*20);check(field.bounding_box()['height']<=225,engine+': bounded composer on reflow '+str(width))
  page.screenshot(path=str(out/f'{engine}-enlarged.png'),full_page=True)
  # Teardown: a pending hover timer cannot open a removed scene; input stops resizing.
  page.goto(route);menu=page.locator('[data-intent-menu]');menu.scroll_into_view_if_needed();page.wait_for_timeout(80)
  page.evaluate("async()=>{const {mountComposer,mountIntentMenu}=await import('./patterns.mjs');const host=document.createElement('section');host.innerHTML=document.querySelector('[data-composer]').innerHTML;document.querySelector('main').append(host);window.testComposer=mountComposer(host,{engine:'fallback'});window.testField=host.querySelector('textarea');testComposer.destroy();const m=document.querySelector('[data-intent-menu]').cloneNode(true);document.querySelector('main').append(m);window.testMenu=m;window.testIntent=mountIntentMenu(m,{openDelay:200});}")
  clone=page.locator('[data-intent-menu]').last;clone.locator('summary').first.hover();page.evaluate('testIntent.destroy()');page.wait_for_timeout(300)
  check(page.evaluate("!testMenu.querySelector('details[open]')&&testMenu.dataset.enhanced==='false'"),engine+': teardown cancels pending hover')
  page.evaluate("testField.value='Line\\n'.repeat(30);testField.dispatchEvent(new Event('input'))")
  check(page.evaluate("testField.style.height===''") ,engine+': composer teardown aborts events')
  check(not errors and not failed,engine+': no runtime or asset errors')
  context.close()
  # No script must retain the native controls and complete link destinations.
  nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':900});q=nojs.new_page();q.goto(route)
  q.locator('textarea').fill('No script note.');check(q.locator('textarea').input_value()=='No script note.',engine+': no-script editing')
  q.locator('[data-intent-menu] summary').nth(0).click();check(q.locator('[data-intent-menu] a').first.is_visible(),engine+': no-script navigation')
  q.locator('[data-disclosures] summary').first.click();check(q.locator('.disclosure-body').first.is_visible(),engine+': no-script FAQ')
  check(q.locator('[data-intent-menu] .intent-panel').first.bounding_box()['width']<390,engine+': no-script inline layout')
  nojs.close()
  touch=browser.new_context(has_touch=True,is_mobile=True,viewport={'width':390,'height':844},reduced_motion='reduce');q=touch.new_page();q.goto(route)
  q.locator('[data-intent-menu] summary').nth(2).tap();check(q.locator('[data-intent-menu] details').nth(2).get_attribute('open') is not None,engine+': immediate touch disclosure')
  q.locator('[data-disclosures] summary').first.tap();check(q.locator('.disclosure-body').first.is_visible(),engine+': initial reduced-motion touch FAQ')
  q.screenshot(path=str(out/f'{engine}-mobile.png'),full_page=True);touch.close();browser.close()
(out/'trial-results.json').write_text(json.dumps({'checks':checks,'support':support},indent=2));print(str(len(checks))+' practical-trial assertions passed')
