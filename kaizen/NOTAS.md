# Método Kaizen · Landing principal — notas de trabajo

Notas para retomar el proyecto en una sesión nueva. El repositorio es público: aquí no va nada privado.

## Qué es

Landing de captación del **Método Kaizen** (David Alzas Coach): pérdida de grasa para hombres de 25 a 45 años mediante mejoras progresivas y sostenibles. Kaizen es el producto y la marca; David es quien lo aplica.

- **Acción del visitante:** rellenar la solicitud (Jotform) → David contacta en menos de 48 h → llamada de valoración.
- **Rama de trabajo:** `claude/kaizen-landing-page-n432rw` · **carpeta:** `kaizen/`
- **Vista previa privada (claude.ai):** https://claude.ai/artifact/1ZWcE9GqVBVTXcRMA44FGx
- **Vercel:** proyecto `athleta-shift-landing-page`. Cada guardado en la rama crea una versión de prueba en `/kaizen/`. El proyecto tiene activada la protección por inicio de sesión, y su dirección principal muestra otra página del repositorio. Publicar Kaizen está pendiente de decisión (ver «Pendiente»).

## Cómo trabajar con David

- Responder siempre en español, tono formal y cercano, sin tecnicismos; guiar paso a paso.
- Quiere **ver el avance**: enviar láminas con capturas por secciones, comparaciones de antes y ahora y vídeos del recorrido.
- Usar la skill `kaizen-web-inmersiva`. Cuestionar lo que se pueda mejorar y proponer alternativas.
- No inventar testimonios, cifras ni garantías. Sin promesas de resultado ni plazos milagro.

## Decisiones ya tomadas

| Tema | Decisión |
|---|---|
| Formulario | Su Jotform actual, incrustado. ID `260646326019052`. |
| Precio | No se muestra: se explica en la llamada de valoración. |
| Compromiso | Con condiciones: seguir el plan y las revisiones las primeras 8 semanas (plazo por confirmar). |
| Pruebas | +50 clientes, −50 kg, y los casos de David, Ivan y Juan Pablo (con permiso). |
| Color | Azul de marca sobre noche; hueso para pruebas y dudas. |
| Letra | **Sin cursiva.** No le gusta la cursiva con serifa. |
| Concepto | «La ascensión»: una subida de la noche al amanecer. |

## Dirección de arte

- **Concepto:** la página es una ascensión. El cielo y las montañas son el hilo; las secciones opacas son los altos del camino y el hueso marca que ya hay luz.
- **Color (variables en `styles.css`):** noche `#05070D`, azul `#2B63D6`, azul claro `#4C7DF0`, hielo `#A9C3FF`, azul profundo `#1141A3`, hueso `#EFECE4`, amanecer `#F2B38B`.
- **Letras:** Anton (titulares, mayúsculas), Instrument Sans (texto), JetBrains Mono (etiquetas pequeñas).
- **Énfasis en titulares:** misma letra de titulares, en azul hielo (en hueso, azul profundo). En la portada el conector «Y QUE ESTA VEZ» va en contorno.
- **Interlineado de titulares 1,14:** las mayúsculas con tilde y la Ñ suben; con menos, tocan la línea de arriba.
- **Referencias que envió (vídeos de TikTok):** web de un piloto de carreras (titulares enormes, retrato recortado, collage, color de acento); web de una empresa con montañas fotorrealistas que cambian al hacer scroll; web azul en 3D con números de contorno. Descartada: la de partículas doradas y flores (3D experimental).

## Estructura de la página

| # | Sección | `id` | Qué hace |
|---|---|---|---|
| 1 | Portada | `#hero` | «Pierde grasa y que esta vez dure». David recortado entre las dos palabras. CTA y prueba social. |
| 2 | Los 52 lunes | `#problema` | Escena fija: el contador sube y las semanas se tachan. Después, seis frases del cliente. |
| 3 | Historia | `#historia` | De 65 a 95 kg, formación, −25 kg en 9 meses. Tres fotos. |
| 4 | Manifiesto | `#kaizen` | Qué significa Kaizen; las palabras se encienden al bajar. |
| 5 | Mecanismo | `#metodo` | Gráfico «rebote frente a paso a paso» (ilustración) y tabla comparativa. |
| 6 | El ascenso | `#ascenso` | Escena fija: cinco etapas; la cumbre se acerca y amanece. |
| 7 | Resultados | `#resultados` | Cifras y tres casos como copias fotográficas. |
| 8 | La mochila | `#incluye` | Qué recibe el cliente; mapa topográfico de fondo; nota de inversión. |
| 9 | Para quién | `#para-quien` | Permiso de ascenso con sellos «Apto» / «No apto». |
| 10 | Dudas | `#dudas` | Seis objeciones. |
| 11 | La cumbre | `#aplicar` | Amanecer, pasos, compromiso y formulario. Cierre: «Que este sea el último lunes…». |

Hay un botón de solicitud cada una o dos pantallas. En móvil hay un botón fijo que se oculta en la portada, junto al formulario y cuando ya se ve un botón de la propia sección.

## Técnica

```
kaizen/
  index.html        ← GENERADO. No editar a mano.
  assets/           ← fotos, logos, imagen para compartir
  src/
    styles.css  body.html  app.js  shader.frag   ← fuentes
    build.py                                     ← monta index.html
    tools/                                       ← capturas, pruebas, vídeo
  NOTAS.md
```

- **Montar:** `python3 kaizen/src/build.py` (con `--artifact RUTA.html` genera además el fragmento para la vista previa de claude.ai).
- **Librerías:** GSAP 3.12.5 + ScrollTrigger (cdnjs) y Lenis 1.0.42 (jsDelivr). Lenis solo con ratón; en móvil el scroll es nativo.
- **El cielo:** un único `<canvas id="sky">` fijo con un shader WebGL (`shader.frag`) que dibuja estrellas, cordilleras en capas, la cumbre y el mar de nubes. Se controla con cuatro valores: `uAlt` (altura), `uDawn` (amanecer), `uPeak` (cumbre visible) y `uSummit` (vista desde arriba). Cada sección con clase `.window` deja ver el cielo y fija esos valores con `data-alt`, `data-dawn`, `data-peak`, `data-summit`; el ascenso los va cambiando con el scroll.
- **Sin movimiento:** si el visitante tiene «reducir movimiento», no se añade la clase `js-motion`: todo se muestra estático y sin escenas fijas. Si no hay WebGL, se añade `no-gl` y queda un degradado.
- **Formulario:** `iframe` de Jotform más su script oficial, que ajusta la altura y pasa los parámetros de la dirección (por ejemplo `?utm_source=instagram`). Dentro de una vista previa enmarcada (claude.ai) se muestra un botón que abre el formulario, porque allí no se pueden incrustar páginas externas.
- **Recorte de la portada:** `assets/hero-david-cut.webp` se obtuvo de la foto original con dos modelos de recorte (`tools/recorte_mascaras.py`), combinando las dos máscaras y limpiando el borde.

### Comprobar

```bash
cd kaizen && python3 -m http.server 8765
```

```bash
node kaizen/src/tools/test.js CARPETA_SALIDA
```

```bash
node kaizen/src/tools/shoot.js CARPETA_SALIDA "d:1440x900,m:390x844:m"
```

```bash
node kaizen/src/tools/video.js CARPETA_FOTOGRAMAS m 25
```

`test.js` comprueba formulario, contador de lunes, ascenso, botón fijo, movimiento reducido, vista enmarcada y sin WebGL. `shoot.js` captura cada sección. `video.js` graba el recorrido fotograma a fotograma (`m` móvil, `d` escritorio); después se monta con `ffmpeg`. `og.js` regenera la imagen para compartir.

### Actualizar la vista previa de claude.ai

Leer primero el artifact (acción `read` con su dirección) y publicar con esa misma dirección el fragmento generado con `--artifact`. Los archivos de `assets/` ya publicados se conservan; solo hay que pasar los nuevos.

## Pendiente

- Confirmar el plazo y las condiciones del compromiso (ahora, 8 semanas).
- Precisar qué mide la cifra «−50 kg» para redactarla sin ambigüedad.
- Añadir testimonios del público objetivo (25–45 años) cuando David los facilite.
- Sustituir las fotos de los casos por las originales en mayor resolución. No ampliarlas con IA: son pruebas.
- Revisar el formulario de Jotform: opción «Perder grasa», tono del saludo y casilla de privacidad.
- Política de privacidad enlazada desde la página.
- Publicación: decidir si se crea un proyecto de Vercel solo para Kaizen y se hace público.
- Probar la fluidez en un móvil real.

## Plan Higgsfield

David quiere usar su conector **«highsfield»** (Higgsfield, generación de imagen y vídeo con IA) para dar a la página el nivel fotorrealista de la referencia de las montañas. El conector solo se carga al iniciar una sesión; debe estar conectado en https://claude.ai/customize/connectors.

### Lo comprobado con el conector

- El conector se llama `highsfield` y sus herramientas empiezan por `mcp__highsfield__`. Generar exige créditos en la cuenta de Higgsfield (`balance` los muestra; `generate_image` y `generate_video` admiten `get_cost: true` para saber el coste sin gastar).
- **Imagen:** `nano_banana_2_1`, `gpt_image_2` y `cinematic_studio_2_5` admiten imagen de referencia y hasta 4K; a 2K cuestan 2 créditos por imagen.
- **Vídeo con imagen inicial y final** (`start_image`, `end_image`), clip de 5 s: `minimax_h3` (2K) 10 créditos; `wan3_0` (1080p, sin audio) 17,5; `flux_3_video` (1080p, sin audio) 40. Sin imagen final, `seedance_2_5` cuesta 35.
- Presupuesto orientativo del plan: 5 imágenes (10 créditos) y 4 clips (40–70 créditos).
- **Formato cuadrado:** generar las imágenes clave en 1:1 con la cumbre algo a la derecha del centro. Un mismo archivo sirve para el recorte 16:9 de escritorio y el 9:16 de móvil.
- **Antes del vídeo, las imágenes ya dan resultado:** con las cuatro imágenes clave se puede montar el ascenso como fundido entre ellas guiado por el scroll, con un leve movimiento de cámara. El vídeo es una mejora posterior.

### Reglas

1. **Solo paisaje.** No generar ni retocar personas, cuerpos, fotos de antes y después ni testimonios. David y sus clientes salen siempre con sus fotos reales.
2. **Enseñar antes de integrar.** Cada generación gasta créditos de su cuenta: empezar por las imágenes fijas, enviárselas y esperar su visto bueno antes de generar vídeo.
3. **El rendimiento manda.** Contenido principal visible en menos de 2,5 s en 4G. Vídeo siempre sin sonido, con imagen de espera, y en móvil una versión más ligera o una imagen fija.
4. **El cielo por código se queda** como respaldo (mientras carga, sin movimiento, sin WebGL).

### Qué generar

Aspecto común para todos los planos (añadir al final de cada descripción):

> Photorealistic cinematic alpine landscape, large-format cinema camera, 35mm anamorphic lens, natural atmospheric haze, fine film grain, deep navy shadows, cobalt blue midtones, restrained contrast. No people, no animals, no buildings, no text, no logos, no watermark.

**A. El ascenso (prioridad 1).** Cuatro imágenes clave de la misma montaña y tres tramos de vídeo que las unen. Sustituye al cielo por código en `#ascenso`: el vídeo avanza con el scroll.

| Clave | Momento | Descripción |
|---|---|---|
| K0 | Campo base, noche | Wide low-angle view from a dark valley floor at night, looking up at one dominant sharp snow-capped peak, slightly right of centre, sky full of stars, thin fog in the valley, layered ridgelines in near-black silhouette, faint cold moonlight on the snow. |
| K1 | Media ladera, hora azul | Same mountain, camera higher on the slope at blue hour before dawn, the peak larger and closer, rock ribs and snowfields visible, valley fog below, last stars fading, a faint warm line on the horizon. |
| K2 | Arista alta, primera luz | Same mountain from a high ridge at first light, the snow face catching warm pink-orange alpenglow while the valleys stay deep blue, clouds filling the valleys below. |
| K3 | Cumbre, amanecer | View from the summit above an endless sea of clouds at sunrise, warm orange band on the horizon, deep blue sky above, a few distant peaks breaking through the clouds, calm and vast. |

Usar K0 como imagen de referencia para K1–K3 y así mantener la misma montaña. Tramos de vídeo de unos 5 s (K0→K1, K1→K2, K2→K3), con imagen inicial y final si el modelo lo permite:

> Slow, steady aerial ascent: the camera rises and drifts forward toward the peak in one continuous move, mist moving gently, no cuts, no camera shake.

Formato 16:9 con la cumbre cerca del centro (en móvil se verá la franja central). Si el resultado en vertical no convence, generar también 9:16.

**B. La cumbre (prioridad 2).** Un bucle de 5–8 s para `#aplicar`:

> Above the clouds at sunrise, the sea of clouds drifts slowly, the light grows very gently, locked-off camera, seamless loop.

**C. La portada (prioridad 3, opcional).** Una imagen fija de fondo, con el centro despejado para colocar encima el recorte real de David:

> Night alpine panorama, starry sky, layered blue mountain ridges low in the frame, soft cobalt glow in the centre of the sky, calm empty centre.

No animar el retrato de David con IA salvo que él lo pida expresamente; si se prueba, comparar con la foto original y descartar cualquier resultado que cambie su cara o su físico.

### Cómo integrarlo

- **Ascenso:** extraer los fotogramas (`ffmpeg`) a WebP: unos 120 a 1280×720 para escritorio y unos 90 a 720 px de ancho para móvil, con un peso total orientativo de 2–4 MB. Dibujarlos en un `<canvas>` dentro de `.ascent-stage`, detrás del velo, usando el mismo progreso que ya calcula la función `update(p)` del ascenso en `app.js`. Cargar primero uno de cada cuatro fotogramas y luego el resto, y empezar a cargar cuando la sección se acerque a la pantalla. Hasta entonces se ve el cielo por código.
- **Cumbre y portada:** `<video muted playsinline loop autoplay poster="…">` solo en pantallas grandes; en móvil, la imagen fija.
- Repetir `test.js`, las capturas y el vídeo del recorrido, y enseñárselo a David antes de publicar.
