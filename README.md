# Método A90 — Landing page (David A. Coach)

Landing page estática de **Método A90**, el programa de 90 días de pérdida de grasa
con entrenamiento online. Sitio 100 % estático: HTML + CSS + JavaScript, sin build,
sin dependencias de npm y sin servidor. Listo para GitHub y para Vercel.

## Estructura

```
index.html                          Página completa (marcado, estilos y lógica)
assets/
  img/                              Fotos del hero, historia y testimonios (WebP) + logo
  fonts/                            Inter, Montserrat, Playfair Display y Space Grotesk (WOFF2, auto-alojadas)
  js/dc-runtime.js                  Runtime que monta el componente de la página
  js/image-slot.js                  Componente <image-slot> (encuadre de las fotos)
  vendor/react*.min.js              React 18.3.1 y ReactDOM 18.3.1 (auto-alojados)
  image-slots.state.json            Encuadre (zoom y posición) de cada foto
vercel.json                         Cabeceras de caché y seguridad para Vercel
```

Todos los recursos son locales: no se carga nada desde CDNs externos, así que la
página funciona igual con o sin conexión a terceros. La única llamada externa es el
formulario de contacto embebido de **Jotform**, en la sección "Solicita tu valoración".

## Ver la página en local

Ábrela con un servidor estático (no con `file://`, porque el navegador bloquea
`fetch` de archivos locales):

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

O, si prefieres Node:

```bash
npx serve .
```

## Publicar en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel: **Add New… → Project → Import Git Repository** y elige este repo.
3. Configuración del proyecto:
   - **Framework Preset:** `Other`
   - **Build Command:** vacío (no hay build)
   - **Output Directory:** vacío / `.` (raíz del repo)
4. **Deploy**. Vercel sirve `index.html` en la raíz del dominio.

También puedes desplegar desde la terminal:

```bash
npm i -g vercel
vercel        # despliegue de previsualización
vercel --prod # despliegue a producción
```

## Cómo editar el contenido

- **Textos, secciones y estilos:** están en `index.html`. El marcado visible vive
  dentro de `<x-dc>` y las animaciones e interacciones en el `<script type="text/x-dc">`
  del final del archivo.
- **Fotos:** sustituye el archivo correspondiente en `assets/img/` conservando el
  nombre (por ejemplo `hero-david.webp`, `res1-antes.webp`). Si cambias la
  proporción de una foto, ajusta su encuadre en `assets/image-slots.state.json`
  (`s` = zoom, `x` / `y` = desplazamiento en porcentaje).
- **Formulario:** el `<iframe>` de Jotform apunta a
  `https://form.jotform.com/260646326019052`; cámbialo por el ID de tu propio
  formulario si lo necesitas.

## Notas técnicas

- La página necesita JavaScript: el runtime monta el contenido de `<x-dc>` con React.
- Las fuentes están subdivididas por rango Unicode (latin, latin-ext, etc.), igual
  que las sirve Google Fonts, pero desde este mismo dominio.
- `vercel.json` marca `assets/img`, `assets/fonts` y `assets/vendor` como
  inmutables (caché de un año) y añade cabeceras básicas de seguridad.
