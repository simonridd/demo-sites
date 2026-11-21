# Co-op grocery artwork

`co-op-groceries.py` constructs an original Blender scene from primitives and
curves. It reproduces the established grocery illustration as a softly lit 3D
object, using its kraft paper, blue carton, bread, carrot and greens. It fetches
no models, textures or fonts.

Use Python 3.11 and the pinned `requirements.txt` in an isolated environment:

```sh
uv venv --python 3.11 /new/private/artwork-env
uv pip install --python /new/private/artwork-env/bin/python -r tools/artwork/requirements.txt
/new/private/artwork-env/bin/python tools/artwork/co-op-groceries.py --output /new/private/render-output
```

The script writes an editable `.blend`, a transparent PNG and a 960px WebP.
Copy only `groceries-3d.webp` into `co-op/assets/`. The other files remain in the
chosen local output directory. The shipped image is 37,680 bytes and the page
uses it at a smaller display size. Runtime delivery has no Blender, Python,
WebGL or third-party animation dependency.

The original inline SVG stays available when JavaScript is absent or the image
fails. The rendered illustration enters once and settles; reduced-motion mode
shows the static composition. Inspect the actual page at desktop and narrow
sizes after regenerating it. Material appearance is an artistic choice, not
proof of customer engagement or performance improvement.
