#!/usr/bin/env python3
"""Original deterministic raster fixtures, no external photos. Authoring-only Pillow."""
from pathlib import Path
import math,random
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]/'kits/shorts-lab/effects/assets'
image=Image.new('RGB',(1200,800));pixels=image.load();rng=random.Random(47)
for y in range(800):
 for x in range(1200):
  noise=rng.randrange(-9,10)
  pixels[x,y]=(max(0,min(255,35+int(y*.05)+noise)),max(0,min(255,110+int(x*.035)+noise)),max(0,min(255,125+int(y*.06)+noise)))
draw=ImageDraw.Draw(image)
draw.ellipse((850,80,1040,270),fill='#f8d398')
for layer,color in [(0,'#234f43'),(1,'#4fa58c'),(2,'#a7d4b1')]:
 points=[(0,800)]+[(x,int(400+layer*120+80*math.sin(x/210+layer))) for x in range(0,1201,4)]+[(1200,800)]
 draw.polygon(points,fill=color)
for width in (600,1200):
 resized=image.resize((width,round(width*2/3)),Image.Resampling.LANCZOS)
 for fmt,ext in [('WEBP','webp'),('AVIF','avif'),('JPEG','jpg')]:
  path=root/f'delivery-{width}.{ext}';resized.save(path,format=fmt,quality=72)
  print(path.name,path.stat().st_size)

import json
metadata=[{'width':w,**{ext:(root/f'delivery-{w}.{ext}').stat().st_size for ext in ['webp','avif','jpg']}} for w in [600,1200]]
(root.parent/'image-fixtures.mjs').write_text('// Generated from original deterministic fixtures; bytes, not quality rankings.\nexport const imageFixtures='+json.dumps(metadata)+';\n')
