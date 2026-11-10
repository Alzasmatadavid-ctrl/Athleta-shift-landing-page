# Recorta al sujeto del fondo con dos modelos y guarda las máscaras para compararlas.
import sys, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter
src, models, out = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB'); W, H = im.size
def run(model, size, mean, std):
    sess = ort.InferenceSession(f'{models}/{model}.onnx', providers=['CPUExecutionProvider'])
    a = np.asarray(im.resize((size, size), Image.LANCZOS)).astype(np.float32)
    a = a / max(a.max(), 1e-6)
    a = (a - np.array(mean, np.float32)) / np.array(std, np.float32)
    x = a.transpose(2, 0, 1)[None].astype(np.float32)
    y = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
    y = (y - y.min()) / (y.max() - y.min() + 1e-8)
    return Image.fromarray((y * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
m1 = run('isnet-general-use', 1024, (0.5, 0.5, 0.5), (1.0, 1.0, 1.0))
m2 = run('u2net_human_seg', 320, (0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
m1.save(f'{out}/mask_isnet.png'); m2.save(f'{out}/mask_u2human.png')
# hoja de comparación: original, máscaras y recorte sobre azul
def comp(mask):
    bg = Image.new('RGB', (W, H), (16, 40, 110)); bg.paste(im, (0, 0), mask); return bg
sheet = Image.new('RGB', (W * 5 + 40, H), 'white')
for i, t in enumerate([im, m1.convert('RGB'), comp(m1), m2.convert('RGB'), comp(m2)]):
    sheet.paste(t, (i * (W + 10), 0))
sheet.resize((sheet.width // 2, sheet.height // 2)).save(f'{out}/compare.png')
print('ok', W, H)
