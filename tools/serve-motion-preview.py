#!/usr/bin/env python3
"""Loopback-only static preview with byte ranges for native MP4 seeking.
The basic Python http.server is sufficient for visual previews, but does not
support byte-range media seek acceptance. No runtime website dependency.
"""
import argparse, http.server, re
from pathlib import Path

class RangeHandler(http.server.SimpleHTTPRequestHandler):
 def send_head(self):
  self.remaining=None
  match=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers.get('Range',''))
  path=Path(self.translate_path(self.path))
  if not match or not path.is_file():return super().send_head()
  size=path.stat().st_size;start=int(match[1]);end=min(int(match[2]) if match[2] else size-1,size-1)
  if start>end:
   self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return None
  stream=path.open('rb');stream.seek(start);self.remaining=end-start+1
  self.send_response(206);self.send_header('Content-Type',self.guess_type(str(path)))
  self.send_header('Accept-Ranges','bytes');self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  self.send_header('Content-Length',str(self.remaining));self.end_headers();return stream
 def copyfile(self,source,output):
  if self.remaining is None:return super().copyfile(source,output)
  remaining=self.remaining
  while remaining:
   chunk=source.read(min(65536,remaining))
   if not chunk:break
   output.write(chunk);remaining-=len(chunk)
 def log_message(self,*args):pass

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8791);args=parser.parse_args()
 root=Path(__file__).resolve().parents[1]
 from functools import partial
 server=http.server.ThreadingHTTPServer(('127.0.0.1',args.port),partial(RangeHandler,directory=str(root)))
 print(f'http://127.0.0.1:{server.server_port}/kits/shorts-lab/',flush=True)
 server.serve_forever()
