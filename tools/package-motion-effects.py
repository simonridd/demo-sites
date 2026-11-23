#!/usr/bin/env python3
"""Export the opt-in library with owned sample media and licence notices.
No build, package installation, deployment or production integration.
"""
import argparse, zipfile
from pathlib import Path

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
source=root/'kits/shorts-lab/effects'
args.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(args.output,'w',compression=zipfile.ZIP_DEFLATED) as archive:
 archive.writestr('motion-atlas/index.html','<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./effects/"><title>Motion Atlas effects</title><a href="./effects/">Open reusable effects</a></html>')
 for path in sorted(source.rglob('*')):
  if not path.is_file():continue
  relative=path.relative_to(source)
  data=path.read_bytes()
  if relative.as_posix()=='hotspots.html':data=data.replace(b'../assets/081.mp4',b'./assets/comparison-demo.mp4')
  archive.writestr('motion-atlas/effects/'+relative.as_posix(),data)
 archive.write(root/'kits/shorts-lab/assets/081.mp4','motion-atlas/effects/assets/comparison-demo.mp4')
 archive.write(root/'kits/shorts-lab/RECONCILIATION.md','motion-atlas/RECONCILIATION.md')
 review=root/'kits/shorts-lab/RECONCILIATION-REVIEW-2.md'
 if review.exists():archive.write(review,'motion-atlas/RECONCILIATION-REVIEW-2.md')
print(f'Exported {args.output.name} ({args.output.stat().st_size:,} bytes)')
