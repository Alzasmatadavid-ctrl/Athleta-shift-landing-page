"""Prepara los fondos fotográficos de la landing a partir de las imágenes clave.

Uso:
    python3 fondos.py CARPETA_MAESTROS CARPETA_SALIDA [nombre ...]

CARPETA_MAESTROS: k0.png … k3.png ampliados a 4096 px (ver ampliar.py, a partir
                  de los originales guardados en kaizen/src/fondos/).
CARPETA_SALIDA:   normalmente kaizen/assets/fondos

Cada fondo genera dos archivos WebP:
    <nombre>-d.webp  apaisado, para pantallas más anchas que altas
    <nombre>-m.webp  vertical, para móviles
Las ventanas de recorte van en porcentajes de la imagen cuadrada: (x0, y0, x1, y1).
"""
import os
import sys

from PIL import Image

D43, M921 = (1792, 1344), (960, 2240)      # apaisado 4:3 y vertical 9:21
# nombre: (imagen clave, ventana escritorio, tamaño, ventana móvil, tamaño)
FONDOS = {
    # El ascenso: cuatro momentos de la misma montaña
    'k0': ('k0', (0, 4, 100, 79), D43, (34, 0, 76.86, 100), M921),      # campo base, noche
    'k1': ('k1', (0, 0, 100, 75), D43, (44, 0, 86.86, 100), M921),      # media ladera, hora azul
    'k2': ('k2', (0, 0, 100, 75), D43, (42, 0, 84.86, 100), M921),      # arista alta, primera luz
    'k3': ('k3', (0, 8, 100, 83), D43, (22, 0, 64.86, 100), M921),      # cumbre, amanecer
    # La portada: la misma noche, con la cumbre a un lado para dejar sitio al titular y a David
    'hero': ('k0', (0.2, 4.7, 66.2, 46), (1792, 1120), (33.7, 15, 61.4, 75), (960, 2080)),
}
CALIDAD = {'d': 70, 'm': 68}


def recorta(im, ventana, size, quality, dst):
    w, h = im.size
    x0, y0, x1, y1 = ventana
    box = (round(w * x0 / 100), round(h * y0 / 100), round(w * x1 / 100), round(h * y1 / 100))
    out = im.crop(box).resize(size, Image.LANCZOS)
    out.save(dst, 'WEBP', quality=quality, method=6)
    return os.path.getsize(dst)


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    nombres = sys.argv[3:] or list(FONDOS)
    os.makedirs(dst, exist_ok=True)
    total = {'d': 0, 'm': 0}
    maestros = {}
    for nombre in nombres:
        clave, win_d, size_d, win_m, size_m = FONDOS[nombre]
        if clave not in maestros:
            maestros[clave] = Image.open(os.path.join(src, f'{clave}.png')).convert('RGB')
        for kind, win, size in (('d', win_d, size_d), ('m', win_m, size_m)):
            n = recorta(maestros[clave], win, size, CALIDAD[kind], os.path.join(dst, f'{nombre}-{kind}.webp'))
            total[kind] += n
            print(f'{nombre}-{kind}.webp  {size[0]}x{size[1]}  {n // 1024} KB')
    print(f"total escritorio {total['d'] // 1024} KB · total móvil {total['m'] // 1024} KB")
