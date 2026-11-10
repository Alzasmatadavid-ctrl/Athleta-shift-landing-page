"""Compone una lámina con todas las secciones (escritorio o móvil), numeradas y rotuladas."""
import sys, os
from PIL import Image, ImageDraw, ImageFont

shots, dev, dst = sys.argv[1], sys.argv[2], sys.argv[3]
cols = int(sys.argv[4]); scale = float(sys.argv[5])
items = [
    ('hero', 'Portada'), ('lunes', 'Los 52 lunes'), ('pains', '¿Te suena?'), ('story', 'Mi historia'),
    ('creed', 'Manifiesto Kaizen'), ('mech2', 'Rebote vs. paso a paso'), ('asc0', 'El ascenso: inicio'), ('asc1', 'Etapa 1'),
    ('asc3', 'Etapa 3'), ('asc5', 'Etapa 5: cumbre'), ('proof2', 'Resultados'), ('pack', 'La mochila'),
    ('fit', 'Para quién es'), ('faq', 'Dudas'), ('summit', 'La cumbre'), ('summit2', 'Solicitud'),
]
if len(sys.argv) > 6:
    keep = sys.argv[6].split(','); items = [i for i in items if i[0] in keep]


def font(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


ims = [Image.open(f'{shots}/{dev}-{n}.png') for n, _ in items]
w, h = ims[0].size; tw, th = int(w * scale), int(h * scale)
pad, cap = 14, 30
rows = (len(ims) + cols - 1) // cols
W = cols * tw + (cols + 1) * pad; H = rows * (th + cap) + (rows + 1) * pad
sheet = Image.new('RGB', (W, H), (5, 7, 13))
d = ImageDraw.Draw(sheet); f = font(15)
for i, (im, (_, label)) in enumerate(zip(ims, items)):
    x = pad + (i % cols) * (tw + pad); y = pad + (i // cols) * (th + cap + pad)
    d.text((x + 2, y + 6), f'{i + 1:02d}  {label}', fill=(169, 195, 255), font=f)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + cap))
    d.rectangle([x - 1, y + cap - 1, x + tw, y + cap + th], outline=(40, 52, 90))
sheet.save(dst, quality=90)
print(dst, sheet.size, os.path.getsize(dst))
