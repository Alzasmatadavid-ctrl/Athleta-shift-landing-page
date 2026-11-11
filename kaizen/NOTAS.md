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

- **Concepto:** la página es una ascensión. La montaña es el hilo; las secciones opacas son los altos del camino y el hueso marca que ya hay luz.
- **Fotos de la montaña:** cuatro imágenes de la misma cumbre (noche, hora azul, primera luz, amanecer arriba), generadas con IA. Solo paisaje: David y sus clientes salen siempre con sus fotos reales.
- **Color (variables en `styles.css`):** noche `#05070D`, azul `#2B63D6`, azul claro `#4C7DF0`, hielo `#A9C3FF`, azul profundo `#1141A3`, hueso `#EFECE4`, amanecer `#F2B38B`.
- **Letras:** Anton (titulares, mayúsculas), Instrument Sans (texto), JetBrains Mono (etiquetas pequeñas).
- **Énfasis en titulares:** misma letra de titulares, en azul hielo (en hueso, azul profundo). En la portada el conector «Y QUE ESTA VEZ» va en contorno.
- **Interlineado de titulares 1,14:** las mayúsculas con tilde y la Ñ suben; con menos, tocan la línea de arriba.
- **Referencias que envió (vídeos de TikTok):** web de un piloto de carreras (titulares enormes, retrato recortado, collage, color de acento); web de una empresa con montañas fotorrealistas que cambian al hacer scroll; web azul en 3D con números de contorno. Descartada: la de partículas doradas y flores (3D experimental).

## Estructura de la página

| # | Sección | `id` | Qué hace |
|---|---|---|---|
| 1 | Portada | `#hero` | «Pierde grasa y que esta vez dure». David recortado entre las dos palabras, bajo la Vía Láctea y con la cumbre al fondo. CTA y prueba social. |
| 2 | Los 52 lunes | `#problema` | Escena fija: el contador sube y las semanas se tachan. Después, seis frases del cliente. |
| 3 | Historia | `#historia` | De 65 a 95 kg, formación, −25 kg en 9 meses. Tres fotos. |
| 4 | Manifiesto | `#kaizen` | Qué significa Kaizen; las palabras se encienden al bajar. |
| 5 | Mecanismo | `#metodo` | Gráfico «rebote frente a paso a paso» (ilustración) y tabla comparativa. |
| 6 | El ascenso | `#ascenso` | Escena fija: cinco etapas sobre una película de cuatro fotos que cambian con las etapas (noche → hora azul → primera luz → cumbre). |
| 7 | Resultados | `#resultados` | Cifras y tres casos como copias fotográficas. |
| 8 | La mochila | `#incluye` | Qué recibe el cliente; mapa topográfico de fondo; nota de inversión. |
| 9 | Para quién | `#para-quien` | Permiso de ascenso con sellos «Apto» / «No apto». |
| 10 | Dudas | `#dudas` | Seis objeciones. |
| 11 | La cumbre | `#aplicar` | Foto del amanecer sobre el mar de nubes, pasos, compromiso y formulario. Cierre: «Que este sea el último lunes…». |

Hay un botón de solicitud cada una o dos pantallas. En móvil hay un botón fijo que se oculta en la portada, junto al formulario y cuando ya se ve un botón de la propia sección.

## Técnica

```
kaizen/
  index.html        ← GENERADO. No editar a mano.
  assets/           ← fotos, logos, imagen para compartir
    fondos/         ← fondos de la montaña listos para la web (escritorio -d, móvil -m)
  src/
    styles.css  body.html  app.js  shader.frag   ← fuentes
    build.py                                     ← monta index.html
    fondos/                                      ← las cuatro imágenes originales (1024 px)
    tools/                                       ← capturas, pruebas, vídeo, fondos
  NOTAS.md
```

- **Montar:** `python3 kaizen/src/build.py` (con `--artifact RUTA.html` genera además el fragmento para la vista previa de claude.ai).
- **Librerías:** GSAP 3.12.5 + ScrollTrigger (cdnjs) y Lenis 1.0.42 (jsDelivr). Lenis solo con ratón; en móvil el scroll es nativo.
- **Fondos fotográficos:** la portada y la cumbre llevan un `.plate` (foto fija a la pantalla; la sección la recorta con `clip-path` y el contenido pasa por delante). El ascenso lleva `.as-film`: cuatro `.as-plate` apiladas que se funden y se desplazan según el scroll; los tramos están en `SPAN` dentro de `app.js`. Cada foto tiene versión apaisada y vertical (`<picture>`). La de la portada se precarga; las demás se descargan al acercarse (`data-src`).
- **El cielo por código (respaldo):** `<canvas id="sky">` con un shader WebGL (`shader.frag`) que dibuja estrellas, cordilleras, la cumbre y el mar de nubes. Solo se crea si la foto de la sección visible tarda más de 450 ms o falla. Se controla con `uAlt`, `uDawn`, `uPeak` y `uSummit`, que cada sección `.window` fija con `data-alt`, `data-dawn`, `data-peak`, `data-summit`.
- **Sin movimiento:** si el visitante tiene «reducir movimiento», no se añade la clase `js-motion`: todo se muestra estático, sin escenas fijas ni película (la portada y la cumbre conservan su foto). Si no hay fotos ni WebGL, se añade `no-gl` y queda un degradado.
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

`test.js` comprueba formulario, fondos, contador de lunes, ascenso y su película, botón fijo, movimiento reducido, vista enmarcada, respaldo sin fotos y sin WebGL. `shoot.js` captura cada sección. `video.js` graba el recorrido fotograma a fotograma (`m` móvil, `d` escritorio); después se monta con `ffmpeg`. `og.js` regenera la imagen para compartir.

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
- Decidir si se añade vídeo a la montaña (necesita créditos de Higgsfield).

## Fondos de la montaña (hecho) y vídeo (opcional)

### Cómo se hicieron las fotos

- Generadas con la herramienta de imagen de **Figma** (modelo `gemini-3.1-flash-image`, 1024×1024), en un archivo de Figma llamado «Kaizen · Fondos de la landing». Cada imagen gasta créditos de IA de la cuenta de Figma de David.
- Los originales están en `kaizen/src/fondos/k0…k3.webp`. Los enlaces de descarga de Figma caducan a los 7 días.
- Ampliadas a 4096 px en local con `tools/ampliar.py` y el modelo `clear_reality_x4.onnx` (github.com/facefusion/facefusion-assets, versión `models-3.0.0`). Da un resultado más natural que `real_esrgan_x2` y `ultra_sharp_x4`.
- Recortadas para la web con `tools/fondos.py` (ventanas y tamaños dentro del script). La portada usa otro recorte de la imagen de la noche, con la cumbre a un lado.

```bash
python3 kaizen/src/tools/ampliar.py clear_reality_x4.onnx kaizen/src/fondos/k0.webp MAESTROS/k0.png
```

```bash
python3 kaizen/src/tools/fondos.py MAESTROS kaizen/assets/fondos
```

Descripciones usadas (todas terminan en «No people, no animals, no buildings, no text, no logos, no watermark»):

| Clave | Momento | Idea |
|---|---|---|
| k0 | Campo base, noche | Valle oscuro mirando hacia el Cervino nevado bajo la Vía Láctea, niebla en el valle, sendero en primer plano. |
| k1 | Media ladera, hora azul | Desde una arista por encima de la niebla, la cumbre más cerca, huellas en la nieve, primer resplandor en el horizonte. |
| k2 | Arista alta, primera luz | La pirámide final con luz rosada, valles en sombra azul, mar de nubes. |
| k3 | Cumbre, amanecer | Desde arriba: arista nevada con huellas, mar de nubes, sol recién salido. |

Para que la montaña sea la misma en todas, en las descripciones se nombra el Cervino («the Matterhorn»).

### Reglas

1. **Solo paisaje.** No generar ni retocar personas, cuerpos, fotos de antes y después ni testimonios.
2. **Enseñar antes de integrar** y avisar de que cada generación gasta créditos.
3. **El rendimiento manda.** Cada fondo pesa unos 100 KB; si se añade vídeo, siempre sin sonido, con imagen de espera y, en móvil, versión ligera o imagen fija.

### Mejora opcional: vídeo con Higgsfield

David tiene un conector llamado `highsfield` (herramientas `mcp__highsfield__*`). Generar exige créditos en su cuenta de Higgsfield (`balance` los muestra; `generate_image` y `generate_video` admiten `get_cost: true` para saber el coste sin gastar).

- **Vídeo con imagen inicial y final** (`start_image`, `end_image`), clip de 5 s: `minimax_h3` (2K) 10 créditos; `wan3_0` (1080p, sin audio) 17,5; `flux_3_video` (1080p, sin audio) 40.
- Con créditos, se podrían unir las cuatro fotos con tres clips (k0→k1, k1→k2, k2→k3) y un bucle del mar de nubes para la cumbre: unos 40–70 créditos. Descripción del movimiento: «Slow, steady aerial ascent: the camera rises and drifts forward toward the peak in one continuous move, mist moving gently, no cuts, no camera shake.»
- Integración: extraer los fotogramas a WebP (unos 120 en escritorio y 90 en móvil, 2–4 MB en total), dibujarlos en un `<canvas>` dentro de `.as-film` con el mismo progreso que usa `film(f)`, y cargarlos al acercarse la sección. Las fotos actuales quedarían como imagen de espera.
- No animar el retrato de David con IA salvo que él lo pida expresamente; si se prueba, comparar con la foto original y descartar cualquier resultado que cambie su cara o su físico.
