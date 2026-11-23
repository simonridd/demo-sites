#!/usr/bin/env python3
"""Cold local fixture measurements: actual image requests, priority, LCP and CLS.
No field-performance or universal improvement claim. Requires authoring Playwright.
"""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',required=True);parser.add_argument('--output',required=True);args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
measurements=[];assertions=0
with sync_playwright() as pw:
 for engine in ('chromium','webkit'):
  browser=getattr(pw,engine).launch(headless=True)
  for width,dpr in ((1440,1),(390,1),(390,2)):
   for mode in ('eager','selective'):
    context=browser.new_context(viewport={'width':width,'height':1000 if width==1440 else 844},device_scale_factor=dpr)
    page=context.new_page();requests=[];network={};errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url) if r.resource_type=='image' and '/delivery-' in r.url else None)
    if engine=='chromium':
     cdp=context.new_cdp_session(page);cdp.send('Network.enable');cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
     cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':100,'downloadThroughput':200000,'uploadThroughput':100000})
     def requested(e):
      if e.get('type')=='Image' and '/delivery-' in e['request']['url']:network[e['requestId']]={'url':e['request']['url'].split('/')[-1],'priority':e['request'].get('initialPriority'),'timestamp':e['timestamp']}
     def finished(e):
      if e['requestId'] in network:network[e['requestId']]['encodedBytes']=e['encodedDataLength']
     cdp.on('Network.requestWillBeSent',requested);cdp.on('Network.loadingFinished',finished)
    filename='image-delivery-eager.html' if mode=='eager' else 'image-delivery.html'
    page.goto(args.url+'/kits/shorts-lab/effects/'+filename,wait_until='load');page.wait_for_timeout(350)
    hero=page.locator('#delivery-hero');assert hero.get_attribute('loading')=='eager';assertions+=1
    assert hero.get_attribute('fetchpriority')==('high' if mode=='selective' else None);assertions+=1
    assert hero.evaluate('(el)=>el.complete&&el.naturalWidth>0');assertions+=1
    initial=list(requests)
    assert any('scene=0' in url for url in initial);assertions+=1
    initial_metrics=page.evaluate('window.motionDeliveryMetrics')
    before=page.locator('.gallery').bounding_box()['y']
    first=hero.evaluate('(el)=>({currentSrc:el.currentSrc.split("/").pop(),naturalWidth:el.naturalWidth,renderedWidth:el.clientWidth})')
    page.locator('.gallery').scroll_into_view_if_needed();page.wait_for_function("[...document.querySelectorAll('.gallery img')].every(el=>el.complete&&el.naturalWidth>0)")
    assert all(any('scene='+str(i) in url for url in requests) for i in range(1,5));assertions+=1
    after=page.locator('.gallery').bounding_box()['y']+page.evaluate('scrollY')
    assert abs(before-after)<1;assertions+=1
    assert not errors;assertions+=1
    measurements.append({'engine':engine,'version':browser.version,'width':width,'dpr':dpr,'mode':mode,'networkConditions':'100 ms / 200000 bytes per second / cache disabled' if engine=='chromium' else 'cold context, local unthrottled WebKit','hero':first,'initialRequestedImages':[url.split('/')[-1] for url in initial],'initialCompletedResourceBytes':sum(x['transferBytes'] for x in initial_metrics['resources']),'initialLcp':initial_metrics['lcp'],'initialCls':initial_metrics['cls'],'finalRequestedImages':[url.split('/')[-1] for url in requests],'networkWaterfall':list(network.values())})
    if width==390 and dpr==1:page.screenshot(path=str(out/f'{engine}-{mode}-gallery.png'))
    context.close()
  browser.close()
 # Native no-script image fallback: no scripted URL insertion is needed.
 browser=pw.chromium.launch();context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844});page=context.new_page();page.goto(args.url+'/kits/shorts-lab/effects/image-delivery.html');assert page.locator('#delivery-hero').evaluate('(el)=>el.complete&&el.naturalWidth>0');assertions+=1;context.close();browser.close()
(out/'delivery-measurements.json').write_text(json.dumps(measurements,indent=2)+'\n')
for engine in ('chromium','webkit'):
 base=next(x for x in measurements if x['engine']==engine and x['width']==1440 and x['mode']=='eager')
 selected=next(x for x in measurements if x['engine']==engine and x['width']==1440 and x['mode']=='selective')
 print('INITIAL',engine,base['initialRequestedImages'],selected['initialRequestedImages'],flush=True)
 assert len(base['initialRequestedImages'])==5
 assert len(selected['initialRequestedImages'])<len(base['initialRequestedImages'])
 assertions+=2
(out/'delivery-results.json').write_text(json.dumps({'assertions':assertions,'scope':'Controlled local fixtures; lab observations, not field Core Web Vitals','measurements':measurements},indent=2)+'\n')
print('PASS',assertions,'image-delivery assertions;',len(measurements),'cold page views')
for m in measurements:print(m['engine'],m['width'],m['dpr'],m['mode'],'initial images',len(m['initialRequestedImages']),'bytes',m['initialCompletedResourceBytes'],'LCP',m['initialLcp'])
