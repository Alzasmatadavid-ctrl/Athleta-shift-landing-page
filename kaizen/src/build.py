#!/usr/bin/env python3
"""Monta kaizen/index.html a partir de las fuentes de esta carpeta.

    python3 kaizen/src/build.py
        Genera kaizen/index.html (la página que sirve Vercel).

    python3 kaizen/src/build.py --artifact RUTA.html
        Además genera el fragmento sin <html>/<head>/<body> que pide la
        vista previa de claude.ai (herramienta Artifact).

Fuentes: styles.css, body.html, app.js y shader.frag.
index.html es un archivo generado: no se edita a mano.
"""
import json
import re
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent / 'index.html'


def read(name):
    return (SRC / name).read_text(encoding='utf-8')


css = read('styles.css').strip()
body = read('body.html').strip()
js = read('app.js').strip()

# El shader se incrusta en el JavaScript sin comentarios ni sangrías.
lines = []
for ln in read('shader.frag').split('\n'):
    ln = re.sub(r'//.*$', '', ln).strip()
    if ln:
        lines.append(ln)
frag_min = '\n'.join(lines)
assert js.count("/*__FRAG__*/''") == 1, 'falta el marcador del shader en app.js'
js = js.replace("/*__FRAG__*/''", json.dumps(frag_min))

page = f'''<title>Método Kaizen</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preload" as="image" href="assets/hero-david-cut.webp" fetchpriority="high">
<link rel="preload" as="image" href="assets/fondos/hero-d.webp" media="(orientation: landscape)">
<link rel="preload" as="image" href="assets/fondos/hero-m.webp" media="(orientation: portrait)">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<style>
{css}
</style>
</head>
<body>

{body}

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
<script>
{js}
</script>
'''
full = f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Método Kaizen: pérdida de grasa para hombres de 25 a 45 años. Entrenamiento y alimentación adaptados a tu vida, con seguimiento 1 a 1 de David Alzas.">
<meta property="og:title" content="Método Kaizen · David Alzas Coach">
<meta property="og:description" content="Pierde grasa y que esta vez dure. Mejoras pequeñas cada semana, sin dietas extremas.">
<meta property="og:image" content="assets/og.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#05070D">
<link rel="icon" type="image/png" href="assets/favicon.png">
<!-- PAGE:START -->
{page}<!-- PAGE:END -->
</body>
</html>
'''
OUT.write_text(full, encoding='utf-8')
print(f'index.html: {len(full)} caracteres (shader: {len(frag_min)})')

if '--artifact' in sys.argv:
    dst = Path(sys.argv[sys.argv.index('--artifact') + 1])
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(page.replace('</head>\n<body>\n', '').strip() + '\n', encoding='utf-8')
    print(f'fragmento para la vista previa: {dst}')
