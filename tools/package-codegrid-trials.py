#!/usr/bin/env python3
"""Self-contained review export, with pinned runtime and its source notices."""
import argparse,zipfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];source=root/'kits/shorts-lab/trials/codegrid';a.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(a.output,'w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(source.rglob('*')):
  if not f.is_file() or any(part.startswith('._') for part in f.parts):continue
  data=f.read_bytes()
  if f.name=='scenes.mjs':data=data.replace(b'../../../../assets/vendor/gsap/gsap.min.js',b'./vendor/gsap.min.js')
  if f.name=='README.md':data=data.replace(b'../../../../assets/vendor/gsap/source.json',b'./vendor/source.json')
  z.writestr('codegrid-review/'+str(f.relative_to(source)),data)
 for name in ('gsap.min.js','README.md','source.json'):z.write(root/'assets/vendor/gsap'/name,'codegrid-review/vendor/'+name)
print('Exported review-only bundle:',a.output.stat().st_size,'bytes')
