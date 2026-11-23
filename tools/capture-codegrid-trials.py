#!/usr/bin/env python3
"""Capture our real scene controls/scroll into owned silent MP4 evidence."""
import argparse,json,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--url',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];base=root/'kits/shorts-lab/trials/codegrid';records=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch();page=browser.new_page(viewport={'width':1280,'height':1100},reduced_motion='no-preference')
 for kind in ('gallery','stack','hero'):
  page.goto(a.url.rstrip('/')+'/kits/shorts-lab/trials/codegrid/'+kind+'.html');page.locator('[data-view=explore]').click();page.wait_for_selector('[data-mode=explore]');v=page.locator('.cg-viewport');v.scroll_into_view_if_needed();page.wait_for_timeout(100)
  path=base/'assets'/f'{kind}-preview.mp4';cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','12','-c:v','png','-i','pipe:0','-vf','scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x173e43,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','27','-movflags','+faststart',str(path)]
  proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
  for frame in range(48):
   ratio=max(0,min(1,(frame-4)/39));v.evaluate('(e,r)=>e.scrollTop=(e.scrollHeight-e.clientHeight)*r',ratio);page.wait_for_timeout(40);proc.stdin.write(v.screenshot())
  proc.stdin.close();err=proc.stderr.read();code=proc.wait();assert code==0,err.decode()
  metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,width,height,nb_frames','-of','json',str(path)]));assert float(metadata['format']['duration'])==4;assert int(metadata['streams'][0]['nb_frames'])==48
  records.append({'kind':kind,'path':'./assets/'+path.name,'method':'Actual Chromium viewport screenshots at real scroll positions; 48 frames / 12 fps, silent','probe':metadata})
  print(kind,path.stat().st_size,'bytes',flush=True)
 browser.close()
(base/'recordings.json').write_text(json.dumps({'source':'our independent browser implementations, not creator footage','recordings':records},indent=2)+'\n')
