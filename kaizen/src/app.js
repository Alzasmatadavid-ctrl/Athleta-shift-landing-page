(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var FORM_ID = '260646326019052';
  var FORM_URL = 'https://form.jotform.com/' + FORM_ID;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ---------- Formulario Jotform ---------- */
  (function mountForm() {
    var slot = d.getElementById('form-slot');
    if (!slot) return;
    // Dentro de una vista previa enmarcada no se pueden incrustar formularios externos: mostramos un botón.
    if (window.self !== window.top) {
      slot.classList.add('is-link');
      slot.innerHTML = '<p>Pulsa el botón para abrir la solicitud.</p>' +
        '<a class="btn" href="' + FORM_URL + '" target="_blank" rel="noopener">Abrir la solicitud</a>';
      return;
    }
    var iframe = d.createElement('iframe');
    iframe.id = 'JotFormIFrame-' + FORM_ID;
    iframe.title = 'Solicitud Método Kaizen';
    iframe.allow = 'geolocation; microphone; camera; fullscreen';
    iframe.setAttribute('scrolling', 'no');
    iframe.loading = 'lazy';
    iframe.src = FORM_URL;
    slot.appendChild(iframe);
    // El script oficial de Jotform ajusta la altura y reenvía los parámetros de la URL
    // (por ejemplo utm_source=instagram). Si no carga, los añadimos nosotros.
    var s = d.createElement('script');
    s.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    s.onload = function () {
      if (window.jotformEmbedHandler) window.jotformEmbedHandler("iframe[id='JotFormIFrame-" + FORM_ID + "']", 'https://form.jotform.com/');
    };
    s.onerror = function () { if (location.search) iframe.src = FORM_URL + location.search; };
    d.body.appendChild(s);
  })();

  /* ---------- Las 52 semanas ---------- */
  var weeks = d.getElementById('weeks');
  if (weeks) { for (var w = 0; w < 52; w++) { var c = d.createElement('i'); c.className = 'wk x'; weeks.appendChild(c); } }

  /* ---------- Cabecera, progreso y altímetro ---------- */
  var top = d.getElementById('top'), prog = d.getElementById('progress');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset, max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? clamp(y / max) : 0;
    top.classList.toggle('scrolled', y > 24);
    prog.style.transform = 'scaleX(' + p + ')';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  onScroll();

  /* ---------- Botón fijo en móvil ---------- */
  (function stickyCta() {
    var bar = d.getElementById('sticky-cta'), hero = d.getElementById('hero'), form = $('.summit-body');
    if (!('IntersectionObserver' in window) || !bar) return;
    var heroVisible = true, formVisible = false, inline = 0;
    function update() { bar.classList.toggle('show', !heroVisible && !formVisible && inline === 0); }
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(function (e) { formVisible = e[0].isIntersecting; update(); }, { threshold: 0.02 }).observe(form);
    var seen = [];
    var ioBtn = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = seen.indexOf(e.target);
        if (e.isIntersecting && i < 0) seen.push(e.target);
        if (!e.isIntersecting && i >= 0) seen.splice(i, 1);
      });
      inline = seen.length; update();
    }, { threshold: 0.6 });
    $$('main .sec a.btn[href="#aplicar"]').forEach(function (a) { ioBtn.observe(a); });
  })();

  /* ---------- El cielo: montañas generadas por código (WebGL) ---------- */
  // Es el respaldo de los fondos fotográficos: solo se crea si una foto tarda en llegar.
  var Sky = null, skyTried = false;
  function sky() { if (!skyTried) { skyTried = true; Sky = createSky(); } return Sky; }
  function createSky() {
    var canvas = d.getElementById('sky');
    if (!canvas) return null;
    var gl = null;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false }); } catch (e) {}
    if (!gl) { root.classList.add('no-gl'); return null; }
    var FS = /*__FRAG__*/'';
    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var progm;
    try {
      var mk = function (t, src) {
        var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
        return s;
      };
      progm = gl.createProgram();
      gl.attachShader(progm, mk(gl.VERTEX_SHADER, VS));
      gl.attachShader(progm, mk(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(progm);
      if (!gl.getProgramParameter(progm, gl.LINK_STATUS)) throw new Error('link');
    } catch (e) { root.classList.add('no-gl'); return null; }
    gl.useProgram(progm);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(progm, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uRes', 'uTime', 'uAlt', 'uDawn', 'uPeak', 'uSummit', 'uPeakX', 'uMouse'].forEach(function (n) { U[n] = gl.getUniformLocation(progm, n); });

    var cur = { alt: 0, dawn: 0, peak: 0, summit: 0 }, tgt = { alt: 0, dawn: 0, peak: 0, summit: 0 };
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    var quality = 1, running = false, raf = 0, snap = true, last = 0, t0 = performance.now(), frames = 0, acc = 0, lastW = 0, lastH = 0, lastDraw = 0, small = false;

    function resize(force) {
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      // En móvil la barra del navegador cambia la altura al hacer scroll: no rehacemos el lienzo por eso.
      if (!force && w === lastW && Math.abs(h - lastH) < 140) return;
      lastW = w; lastH = h;
      small = w < 820;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.25) * (small ? 0.9 : 1) * quality;
      canvas.width = Math.max(2, Math.round(w * dpr));
      canvas.height = Math.max(2, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function draw(now) {
      var k = snap ? 1 : 0.09; snap = false;
      cur.alt += (tgt.alt - cur.alt) * k; cur.dawn += (tgt.dawn - cur.dawn) * k;
      cur.peak += (tgt.peak - cur.peak) * k; cur.summit += (tgt.summit - cur.summit) * k;
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
      var asp = canvas.width / canvas.height;
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, reduce ? 3 : (now - t0) / 1000);
      gl.uniform1f(U.uAlt, cur.alt); gl.uniform1f(U.uDawn, cur.dawn);
      gl.uniform1f(U.uPeak, cur.peak); gl.uniform1f(U.uSummit, cur.summit);
      gl.uniform1f(U.uPeakX, asp > 1.15 ? 0.30 * Math.min(asp, 1.7) : 0.06);
      gl.uniform2f(U.uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      raf = 0;
      if (!running) return;
      var dt = now - last; last = now;
      // Calidad adaptativa: si el dispositivo va justo, bajamos resolución en vez de perder fluidez.
      if (frames < 36) {
        frames++;
        if (frames > 6) acc += dt;
        if (frames === 36 && acc / 30 > 30 && quality > 0.5) { quality *= 0.7; frames = 0; acc = 0; resize(true); }
      }
      var moving = Math.abs(tgt.alt - cur.alt) + Math.abs(tgt.dawn - cur.dawn) + Math.abs(tgt.peak - cur.peak) + Math.abs(tgt.summit - cur.summit) > 0.002;
      if (!small || moving || frames < 36 || now - lastDraw > 30) { lastDraw = now; draw(now); }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; snap = true; last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { running = false; }
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); root.classList.add('no-gl'); });
    window.addEventListener('resize', function () { resize(false); });
    d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else if (api.wanted) start(); });
    if (canHover && !reduce) {
      window.addEventListener('pointermove', function (e) {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }
    resize(true);
    var api = {
      wanted: false,
      set: function (o) { for (var key in o) if (key in tgt) tgt[key] = +o[key]; },
      jump: function () { snap = true; },
      start: function () { api.wanted = true; start(); },
      stop: function () { api.wanted = false; stop(); }
    };
    draw(performance.now());
    return api;
  }

  /* ---------- Qué "ventana" está en pantalla: si su foto ya cubre, el cielo por código descansa ---------- */
  var activeWin = null, repick = function () {};
  (function windows() {
    if (!('IntersectionObserver' in window)) return;
    var vis = [], timer = 0;
    var wins = $$('.window');
    function stateOf(el) {
      if (el._sky) return el._sky;
      return { alt: el.getAttribute('data-alt') || 0, dawn: el.getAttribute('data-dawn') || 0, peak: el.getAttribute('data-peak') || 0, summit: el.getAttribute('data-summit') || 0 };
    }
    function fallback() {
      timer = 0;
      if (!activeWin || activeWin._covered) return;
      var s = sky();
      if (s) { s.set(stateOf(activeWin)); s.jump(); s.start(); }
    }
    function pick() {
      var best = null, bh = 0;
      vis.forEach(function (v) { if (v.h > bh) { bh = v.h; best = v.el; } });
      var changed = best !== activeWin;
      activeWin = best;
      if (!best || best._covered) {
        if (Sky) Sky.stop();
        if (timer) { clearTimeout(timer); timer = 0; }
        return;
      }
      if (Sky) { if (changed) { Sky.set(stateOf(best)); Sky.jump(); } Sky.start(); }
      else if (!timer) timer = setTimeout(fallback, 450);   // margen para que llegue la foto antes de arrancar WebGL
    }
    repick = pick;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var rec = null;
        vis.forEach(function (v) { if (v.el === e.target) rec = v; });
        if (!rec) { rec = { el: e.target, h: 0 }; vis.push(rec); }
        rec.h = e.isIntersecting ? e.intersectionRect.height : 0;
      });
      pick();
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
    wins.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Fondos fotográficos ---------- */
  function loadPicture(pic) {
    $$('source[data-srcset]', pic).forEach(function (s) { s.srcset = s.getAttribute('data-srcset'); s.removeAttribute('data-srcset'); });
    var img = $('img', pic);
    if (img.getAttribute('data-src')) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    return img;
  }
  function whenReady(img, cb) {
    function done() { if (img.decode) img.decode().then(cb, cb); else cb(); }
    if (img.complete && img.naturalWidth) done(); else img.addEventListener('load', done, { once: true });
  }
  function whenNear(el, cb) {   // avisa una sola vez, cuando el elemento se acerca a la pantalla
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); cb(); }
    }, { rootMargin: '150% 0px' });
    io.observe(el);
  }
  $$('.plate').forEach(function (plate) {
    var win = plate.parentNode, pic = $('picture', plate);
    function go() { whenReady(loadPicture(pic), function () { plate.classList.add('is-ready'); win._covered = true; repick(); }); }
    if ($('img[data-src]', plate)) whenNear(win, go); else go();
  });

  /* ---------- Movimiento (solo si el usuario no ha pedido reducirlo) ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  root.classList.add('js-motion');

  var lenis = null;
  if (window.Lenis && canHover) {
    lenis = new window.Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      var el = id.length > 1 && d.querySelector(id);
      if (!el || !lenis) return;
      ev.preventDefault();
      lenis.scrollTo(el, { offset: id === '#aplicar' ? 0 : -70, duration: 1.4 });
    });
  });

  // Hero: profundidad al hacer scroll
  var mm = gsap.matchMedia();
  mm.add('(min-width: 1101px), (min-width: 761px) and (orientation: landscape)', function () {
    var st = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.ht-l .ht-w', { xPercent: -9, ease: 'none', scrollTrigger: st });
    gsap.to('.ht-r .ht-w', { xPercent: 9, ease: 'none', scrollTrigger: st });
  });

  // Titulares y textos
  $$('.rv').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  // Listas en cascada
  [['.pain-list', 'li'], ['.pack-list', 'li'], ['.vs', 'li'], ['.path', 'li']].forEach(function (p) {
    var box = $(p[0]);
    if (!box) return;
    gsap.from($$(p[1], box), { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: box, start: 'top 86%', once: true } });
  });
  // Copias fotográficas: caen sobre la mesa
  [['.pile', 0.14], ['.cases', 0.08]].forEach(function (p) {
    var box = $(p[0]);
    if (!box) return;
    gsap.from($$('.print', box), { y: 70, opacity: 0, rotation: function (i) { return (i % 2 ? 1 : -1) * 14; }, scale: 1.12, duration: 0.9, ease: 'power3.out', stagger: p[1], clearProps: 'all', scrollTrigger: { trigger: box, start: 'top 82%', once: true } });
  });
  gsap.from('.case > :not(.case-prints)', { y: 22, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04, scrollTrigger: { trigger: '.cases', start: 'top 70%', once: true } });
  // Permiso de ascenso: el billete sube y los sellos caen
  gsap.from('.permit', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.permit', start: 'top 86%', once: true } });
  gsap.from('.stamp', { scale: 2.4, opacity: 0, rotation: '-=16', duration: 0.42, ease: 'power4.in', stagger: 0.28, delay: 0.5, clearProps: 'all', scrollTrigger: { trigger: '.permit', start: 'top 62%', once: true } });
  // Mapa topográfico: se desliza muy despacio al pasar
  gsap.fromTo('.topo', { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '#incluye', start: 'top bottom', end: 'bottom top', scrub: true } });
  // Firma
  gsap.fromTo('.sign .scr path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', scrollTrigger: { trigger: '.sign', start: 'top 88%', once: true } });

  // Manifiesto: las palabras se encienden a medida que bajas
  (function creed() {
    var el = d.getElementById('creed');
    if (!el) return;
    var words = [];
    function split(node, into) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { into.appendChild(d.createTextNode(' ')); return; }
            var s = d.createElement('span'); s.className = 'cw'; s.textContent = part; into.appendChild(s); words.push(s);
          });
        } else {
          var clone = ch.cloneNode(false); into.appendChild(clone); split(ch, clone);
        }
      });
    }
    var frag = d.createDocumentFragment(); split(el, frag);
    el.textContent = ''; el.appendChild(frag);
    var n = words.length;
    function paint(p) {
      var head = p * (n + 4);
      for (var i = 0; i < n; i++) words[i].style.opacity = 0.16 + 0.84 * clamp((head - i) / 4);
    }
    paint(0);
    ScrollTrigger.create({ trigger: el, start: 'top 84%', end: 'bottom 52%', scrub: true, onUpdate: function (self) { paint(self.progress); } });
    gsap.fromTo('.creed-kanji', { yPercent: 12 }, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '#kaizen', start: 'top bottom', end: 'bottom top', scrub: true } });
  })();

  // Cifras
  $$('.count').forEach(function (el) {
    var to = +el.getAttribute('data-to'), pre = el.getAttribute('data-pre') || '', o = { v: 0 };
    el.textContent = pre + '0';
    gsap.to(o, { v: to, duration: 1.4, ease: 'power2.out', onUpdate: function () { el.textContent = pre + Math.round(o.v); }, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Gráfico: primero el rebote, luego el paso a paso
  (function chart() {
    var box = d.getElementById('chart');
    if (!box) return;
    var tl = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 75%', once: true } });
    tl.fromTo('.yo', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' })
      .from('.tag-old', { opacity: 0, duration: 0.3 }, 0.9)
      .fromTo('.kz', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power1.inOut' }, 1.0)
      .from('#chart-dots circle', { scale: 0, transformOrigin: 'center', duration: 0.3, stagger: 0.19, ease: 'back.out(3)' }, 1.15)
      .from('.tag-new', { opacity: 0, duration: 0.3 }, 2.5);
  })();

  // Los lunes: el contador sube y las semanas se tachan mientras bajas
  (function lunes() {
    var sec = d.getElementById('problema'), num = d.getElementById('lunes-num'), b = d.getElementById('lunes-b');
    if (!sec || !weeks) return;
    var cells = weeks.children, lastN = -1;
    function set(n) {
      if (n === lastN) return; lastN = n;
      num.textContent = (n < 10 ? '0' : '') + n;
      for (var i = 0; i < cells.length; i++) cells[i].classList.toggle('x', i < n);
    }
    set(1); b.style.opacity = 0;
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        set(1 + Math.round(clamp(p / 0.8) * 51));
        var o = clamp((p - 0.22) / 0.2);
        b.style.opacity = o; b.style.transform = 'translate3d(0,' + ((1 - o) * 18) + 'px,0)';
      }
    });
  })();

  // El ascenso: una etapa por tramo de scroll; el cielo sube y amanece contigo
  (function ascent() {
    var sec = d.getElementById('ascenso');
    if (!sec) return;
    var frames = $$('.frame', sec), n = frames.length;
    var num = d.getElementById('as-num'), dot = d.getElementById('as-dot'), fill = d.getElementById('as-fill'), read = d.getElementById('as-read');
    var ticks = $$('.as-alt s', sec), cur = -1;
    // La película: cuatro fotos. SPAN es el tramo, medido en etapas, en el que se ve cada una.
    var plates = $$('.as-plate', sec), ready = [], lastF = 0;
    // Los cambios de foto coinciden con los cambios de etapa: noche (inicio y 01), hora azul (02 y 03),
    // primera luz (04) y amanecer en la cumbre (05).
    var SPAN = [[0, 2.3], [1.7, 4.3], [3.7, 5.3], [4.7, 6]];
    function film(f) {
      var last = plates.length - 1;
      for (var i = 0; i <= last; i++) {
        var st = plates[i].style;
        var a = i === 0 ? 1 : clamp((f - SPAN[i][0]) / (SPAN[i - 1][1] - SPAN[i][0]));          // entrada
        a = a * a * (3 - 2 * a);
        var out = i < last ? clamp((f - SPAN[i + 1][0]) / (SPAN[i][1] - SPAN[i + 1][0])) : 0;    // salida
        if (!ready[i] || a < 0.002 || (out >= 1 && ready[i + 1])) { st.visibility = 'hidden'; continue; }
        var t = clamp((f - SPAN[i][0]) / (SPAN[i][1] - SPAN[i][0]));
        st.visibility = 'visible'; st.opacity = a;
        // La cámara sube: la escena baja un poco y se acerca. Al salir, la foto se adelanta hacia la siguiente.
        st.transform = 'translate3d(0,' + (t * 8 - 2).toFixed(2) + '%,0) scale(' + (1.02 + t * 0.06 + out * out * 0.12).toFixed(4) + ')';
      }
    }
    whenNear(sec, function () {
      plates.forEach(function (pic, i) {
        whenReady(loadPicture(pic), function () {
          ready[i] = true;
          if (i === 0) { sec._covered = true; sec.classList.add('has-film'); repick(); }
          film(lastF);
        });
      });
    });
    function update(p) {
      var f = p * n, idx = Math.min(n - 1, Math.floor(f)), local = f - idx;
      lastF = f; film(f);
      for (var i = 0; i < n; i++) {
        var o = 0, y = 0;
        if (i === idx) {
          var a = i === 0 ? 1 : clamp(local / 0.2), b = i === n - 1 ? 1 : clamp((1 - local) / 0.2);
          o = Math.min(a, b); y = (1 - a) * 30 - (1 - b) * 30;
        }
        var s = frames[i].style;
        s.opacity = o; s.transform = 'translate3d(0,' + y + 'px,0)'; s.visibility = o > 0.01 ? 'visible' : 'hidden';
      }
      if (idx !== cur) {
        cur = idx;
        num.textContent = idx === 0 ? '' : '0' + idx;
        ticks.forEach(function (t, i) { t.classList.toggle('on', i < idx); });
      }
      var climb = clamp((f - 0.55) / (n - 1));
      dot.style.bottom = (climb * 100) + '%'; read.style.bottom = (climb * 100) + '%';
      fill.style.transform = 'scaleY(' + climb + ')';
      read.textContent = Math.round(climb * 100) + '%';
      sec._sky = { alt: climb * 0.7, dawn: climb * 0.64, peak: 1, summit: 0 };
      if (Sky && activeWin === sec) Sky.set(sec._sky);
    }
    update(0);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: function (self) { update(self.progress); } });
  })();

  // Botón principal "magnético" (solo con ratón)
  if (canHover) {
    $$('[data-magnetic]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.18); qy((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  function refresh() { ScrollTrigger.refresh(); onScroll(); }
  window.addEventListener('load', refresh);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(refresh);
})();
