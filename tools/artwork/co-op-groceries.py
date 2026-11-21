"""Original Co-op grocery scene. Run with Blender Python (bpy 4.4+) and Pillow.

python tools/artwork/co-op-groceries.py --output co-op/assets
Produces a transparent WebP for the website and an editable .blend alongside it.
No remote assets or fonts are fetched. The website needs neither Blender nor WebGL.
"""
import argparse
import math
from pathlib import Path

import bpy
from mathutils import Vector
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--samples', type=int, default=48)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, hex_color, roughness=.7):
    color = tuple(int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4))
    # Brand values are sRGB; Blender shader colour inputs are linear.
    linear = tuple(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in color)
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*linear, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*linear, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    return mat


paper = material('Warm kraft paper', 'DAAB72')
edge = material('Paper folded edges', 'B98853')
inner = material('Paper interior', 'BB8E5B')
bread = material('Golden baked crust', 'BF7C32')
cut = material('Baguette scores', 'EAC489')
green = material('Fresh leaf green', '568951')
dark_green = material('Deep leaf green', '447951')
orange = material('Carrot orange', 'ED7C40')
white = material('Oat carton cream', 'FFFDF5')
blue = material('Co-op blue', '00A1CC')
light_blue = material('Carton fold', '8AD2DF')
red = material('Apple red', 'CB5548', .48)
stem = material('Apple stalk', '745C3A')


def finish(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    for polygon in getattr(obj.data, 'polygons', []):
        polygon.use_smooth = True
    return obj


def cube(name, location, scale, mat, bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new('Soft crafted edges', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 4
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return finish(obj, name, mat)


def sphere(name, location, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
    obj = bpy.context.object
    obj.scale = scale
    return finish(obj, name, mat)


def tube(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 24
    curve.bevel_depth = radius
    curve.bevel_resolution = 5
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for vertex, point in zip(spline.bezier_points, points):
        vertex.co = point
        vertex.handle_left_type = 'AUTO'
        vertex.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat)


def leaf(name, location, scale, rotation=0, mat=green):
    obj = sphere(name, location, scale, mat)
    obj.rotation_euler[1] = rotation
    return obj


# A real open bag with a folded rim, side gussets and two paper handles.
cube('Bag bottom', (0, 0, .14), (1.95, 1.12, .12), paper)
cube('Bag back', (0, .54, .88), (1.98, .055, 1.55), inner)
cube('Bag left', (-.97, 0, .86), (.055, 1.1, 1.5), edge)
cube('Bag right', (.97, 0, .86), (.055, 1.1, 1.5), paper)
cube('Bag front', (0, -.54, .88), (1.98, .07, 1.55), paper)
cube('Top folded front rim', (0, -.58, 1.63), (2, .09, .065), paper, .018)
cube('Right side fold', (.999, 0, .86), (.012, .025, 1.4), edge, .006)
for y in [.48, -.60]:
    tube('Paper handle', [(-.44, y, 1.48), (-.44, y, 2.07), (0, y, 2.39), (.44, y, 2.07), (.44, y, 1.48)], .035, edge)

# Bread and leaf vegetables sit behind the front wall.
loaf = sphere('Baguette', (-.72, .14, 2.14), (.23, .22, 1.02), bread)
loaf.rotation_euler[1] = -.24
for i in range(5):
    z = 1.72 + i * .23
    x = -.72 - (z - 2.14) * .24
    tube('Baguette score', [(x-.13, -.055, z-.04), (x, -.09, z), (x+.13, -.055, z+.04)], .025, cut)
for i, (x, y, z, r) in enumerate([(-.15,.34,2.26,-.3),(.1,.4,2.52,.06),(.35,.35,2.35,.42)]):
    leaf('Leaf vegetable', (x,y,z), (.20,.12,.66), r, green if i % 2 else dark_green)

# Oat carton with a pitched top and small front label.
cube('Oat carton', (.4,-.05,1.98), (.56,.48,1.12), white, .025)
mesh = bpy.data.meshes.new('Carton roof')
mesh.from_pydata([(.12,-.29,2.54),(.68,-.29,2.54),(.12,.19,2.54),(.68,.19,2.54),(.12,-.05,2.76),(.68,-.05,2.76)], [], [(0,1,5,4),(2,4,5,3),(0,4,2),(1,3,5)])
obj = bpy.data.objects.new('Carton folded top', mesh)
bpy.context.collection.objects.link(obj)
finish(obj, obj.name, light_blue)
cube('Carton seal', (.4,-.05,2.77), (.57,.035,.04), white, .01)
cube('Blue oat label', (.4,-.302,2.02), (.41,.012,.47), blue, .01)
for z, width in [(2.13,.25),(2.04,.19),(1.95,.23)]:
    cube('White label line', (.4,-.315,z), (width,.012,.025), white, .008)

bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=.045, radius2=.17, depth=.94, location=(.81,.21,2.03))
carrot = finish(bpy.context.object, 'Carrot', orange)
carrot.rotation_euler[1] = .18
for i in range(3):
    tube('Carrot leaves', [(.9,.21,2.47),(.88+(i-1)*.15,.21,2.75),(.85+(i-1)*.2,.22,2.97-abs(i-1)*.12)], .036, dark_green)

# A small apple is embossed on the bag, echoing the original illustration.
sphere('Apple left', (-.19,-.608,.80), (.27,.045,.29), red)
sphere('Apple right', (.12,-.608,.80), (.27,.045,.29), red)
tube('Apple stem', [(-.04,-.62,1.03),(-.03,-.62,1.16),(.01,-.62,1.23)], .022, stem)
leaf('Apple leaf', (.13,-.62,1.20), (.13,.022,.055), -.35)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 960
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.world = bpy.data.worlds.new('Soft studio')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.8,.88,1,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .55

for name, location, energy, size in [('Key',(-3,-4,6),550,4),('Fill',(4,-2,4),230,3),('Rim',(1,4,5),450,3)]:
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.shape = 'DISK'
    light.data.size = size
    light.rotation_euler = (Vector((0,0,1.5))-light.location).to_track_quat('-Z','Y').to_euler()

bpy.ops.object.camera_add(location=(4,-8,4.4))
camera = bpy.context.object
camera.rotation_euler = (Vector((0,0,1.6))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 3.85
scene.camera = camera
scene.render.filepath = str((args.output/'groceries-3d.png').resolve())
bpy.ops.wm.save_as_mainfile(filepath=str((args.output/'groceries-3d.blend').resolve()))
bpy.ops.render.render(write_still=True)
Image.open(args.output/'groceries-3d.png').save(args.output/'groceries-3d.webp', quality=88, method=6)
print('Web image:', (args.output/'groceries-3d.webp').stat().st_size, 'bytes')
