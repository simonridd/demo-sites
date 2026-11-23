#!/usr/bin/env python3
"""Package the two independent review pilots and retained source attribution."""
import argparse,zipfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1]/'kits/shorts-lab/trials/hyperplexed';a.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(a.output,'w',zipfile.ZIP_DEFLATED) as z:
 for path in sorted(root.rglob('*')):
  if path.is_file() and not any(p.startswith('._') for p in path.parts):z.write(path,'hyperplexed-review/'+str(path.relative_to(root)))
print('Exported review-only bundle:',a.output.stat().st_size,'bytes')
