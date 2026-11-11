"""Amplía una imagen con un modelo ONNX de superresolución, por teselas (solo CPU).

Uso:
    python3 ampliar.py MODELO.onnx ENTRADA SALIDA [escala_final]

MODELO: p. ej. clear_reality_x4.onnx o real_esrgan_x2.onnx (publicados en
        github.com/facefusion/facefusion-assets, versión models-3.0.0).
escala_final: tamaño final respecto al original (por defecto, el del modelo).
              Con un modelo x4 y escala_final 2 se amplía x4 y se reduce a x2,
              lo que da un resultado más limpio que un x2 directo.

Solo para paisajes generados. No usar con fotos de clientes: son pruebas.
"""
import sys

import numpy as np
import onnxruntime as ort
from PIL import Image

TILE, PAD = 192, 16


def upscale(model_path, im):
    opts = ort.SessionOptions()
    opts.log_severity_level = 3
    sess = ort.InferenceSession(model_path, sess_options=opts, providers=['CPUExecutionProvider'])
    name = sess.get_inputs()[0].name
    src = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    h, w, _ = src.shape
    # Espejo en los bordes para que las teselas del borde tengan contexto.
    padded = np.pad(src, ((PAD, PAD), (PAD, PAD), (0, 0)), mode='reflect')
    scale = None
    out = None
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            th, tw = min(TILE, h - y), min(TILE, w - x)
            tile = padded[y:y + th + 2 * PAD, x:x + tw + 2 * PAD]
            res = sess.run(None, {name: tile.transpose(2, 0, 1)[None]})[0][0].transpose(1, 2, 0)
            if scale is None:
                scale = res.shape[0] // tile.shape[0]
                out = np.zeros((h * scale, w * scale, 3), np.float32)
            p = PAD * scale
            out[y * scale:(y + th) * scale, x * scale:(x + tw) * scale] = res[p:p + th * scale, p:p + tw * scale]
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)), scale


if __name__ == '__main__':
    model, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
    im = Image.open(src)
    big, scale = upscale(model, im)
    if len(sys.argv) > 4:
        final = float(sys.argv[4])
        size = (round(im.width * final), round(im.height * final))
        if size != big.size:
            big = big.resize(size, Image.LANCZOS)
    big.save(dst)
    print(f'{src}: {im.size} -> {big.size} (modelo x{scale})')
