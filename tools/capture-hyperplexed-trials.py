#!/usr/bin/env python3
"""Record our actual pointer/dock DOM in Chromium. No creator media copied."""
import argparse,json,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--url',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1]/'kits/shorts-lab/trials/hyperplexed';(root/'assets').mkdir(exist_ok=True);records=[]
with sync_playwright() as pw:
 b=pw.chromium.launch();page=b.new_page(viewport={'width':1280,'height':1100},reduced_motion='no-preference')
 for kind,frames in [('spotlight',60),('bubbles',80)]:
  page.goto(a.url.rstrip('/')+'/kits/shorts-lab/trials/hyperplexed/'+kind+'.html');page.wait_for_timeout(100)
  surface=page.locator('[data-spot-grid]' if kind=='spotlight' else '.hx-workbench');surface.scroll_into_view_if_needed();path=root/'assets'/(kind+'-preview.mp4')
  cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','10','-c:v','png','-i','pipe:0','-vf','scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x101c25,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','27','-movflags','+faststart',str(path)]
  proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
  for frame in range(frames):
   if kind=='spotlight':
    if frame==6:page.locator('[value=border]').check()
    if frame==24:page.locator('[value=face]').check()
    if frame==46:page.locator('[data-theme-toggle]').click()
    if frame>=6:
     r=surface.bounding_box();page.mouse.move(r['x']+r['width']*(.12+((frame-6)%30)/30*.76),r['y']+r['height']*.38)
   else:
    if frame==6:page.locator('[data-bubbles-enable]').check();page.wait_for_timeout(220)
    if frame==14:
     grip=page.locator('[data-bubble=notes]').bounding_box();bounds=page.locator('[data-bubble-boundary]').bounding_box();start=(grip['x']+25,grip['y']+25);end=(bounds['x']+38,bounds['y']+90);page.mouse.move(*start);page.mouse.down()
    if 14<=frame<=25:
     t=(frame-14)/11;page.mouse.move(start[0]+(end[0]-start[0])*t,start[1]+(end[1]-start[1])*t)
    if frame==26:page.mouse.up();page.wait_for_timeout(220)
    if frame==34:page.locator('[data-bubble=notes]').click()
    if frame==40:page.locator('[data-panel-content] textarea').fill('Keep the main task in view.')
    if frame==52:page.locator('[data-utility-close]').click();page.wait_for_timeout(220)
    if frame==58:page.locator('[data-bubble=notes]').click()
    if frame==67:page.locator('[data-utility-dismiss]').click();page.wait_for_timeout(220)
    if frame==74:page.locator('[data-bubbles-enable]').uncheck()
   page.wait_for_timeout(40);proc.stdin.write(surface.screenshot())
  proc.stdin.close();err=proc.stderr.read();assert proc.wait()==0,err.decode()
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=width,height,nb_frames,codec_name','-of','json',str(path)]));assert int(probe['streams'][0]['nb_frames'])==frames
  records.append({'kind':kind,'path':'./assets/'+path.name,'source':'Actual original Chromium DOM and real pointer/native controls; silent capture','probe':probe});print(kind,path.stat().st_size,'bytes',flush=True)
 b.close()
(root/'recordings.json').write_text(json.dumps({'creatorFootage':False,'recordings':records},indent=2)+'\n')
