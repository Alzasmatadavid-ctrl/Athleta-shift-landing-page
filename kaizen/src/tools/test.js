// Pruebas funcionales de la landing (no visuales).
const { chromium } = require('playwright');
const out = process.argv[2];
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const URL = 'http://localhost:8765/';
const results = [];
function ok(name, cond, extra) { results.push((cond ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? '  → ' + JSON.stringify(extra) : '')); }
const wait = (p, ms) => p.waitForTimeout(ms);
const scrollTo = (p, expr) => p.evaluate(e => { const y = (new Function('return ' + e))(); window.scrollTo(0, y); return y; }, expr);

(async () => {
  let b = await chromium.launch({ args: GL });

  // ---------- Escritorio ----------
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  let p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL + '?utm_source=instagram', { waitUntil: 'domcontentloaded' });
  await wait(p, 150); await p.screenshot({ path: out + '/intro-150.png' });
  await wait(p, 450); await p.screenshot({ path: out + '/intro-600.png' });
  await wait(p, 1200); await p.screenshot({ path: out + '/intro-1800.png' });
  await wait(p, 2500);
  ok('sin errores de consola (escritorio)', errs.length === 0, errs.slice(0, 4));
  ok('clase js-motion activa', await p.evaluate(() => document.documentElement.classList.contains('js-motion')));
  ok('WebGL activo (sin no-gl)', await p.evaluate(() => !document.documentElement.classList.contains('no-gl')));
  const iframeSrc = await p.evaluate(() => { const f = document.querySelector('#form-slot iframe'); return f && f.src; });
  ok('formulario Jotform incrustado', !!iframeSrc && iframeSrc.includes('260646326019052'), iframeSrc);
  ok('utm_source llega al formulario', !!iframeSrc && iframeSrc.includes('utm_source=instagram'));
  ok('sin scroll horizontal', await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
  // lunes
  await scrollTo(p, "document.querySelector('#problema').getBoundingClientRect().top + scrollY + 5"); await wait(p, 900);
  const n0 = await p.evaluate(() => document.getElementById('lunes-num').textContent);
  await scrollTo(p, "document.querySelector('#problema').getBoundingClientRect().top + scrollY + (document.querySelector('#problema').offsetHeight - innerHeight) * 0.9"); await wait(p, 1200);
  const n1 = await p.evaluate(() => [document.getElementById('lunes-num').textContent, document.querySelectorAll('.wk.x').length, +getComputedStyle(document.getElementById('lunes-b')).opacity]);
  ok('contador de lunes empieza bajo', +n0 <= 3, n0);
  ok('contador de lunes llega a 52 y tacha las 52 semanas', n1[0] === '52' && n1[1] === 52 && n1[2] > 0.95, n1);
  // manifiesto
  await scrollTo(p, "document.querySelector('#creed').getBoundingClientRect().bottom + scrollY - innerHeight * 0.45"); await wait(p, 1200);
  const cw = await p.evaluate(() => [...document.querySelectorAll('#creed .cw')].map(e => +getComputedStyle(e).opacity));
  ok('manifiesto: todas las palabras encendidas al final', cw.length > 10 && cw.every(v => v > 0.95), [cw.length, Math.min(...cw)]);
  // ascenso
  const asc = async f => {
    await scrollTo(p, `document.querySelector('#ascenso').getBoundingClientRect().top + scrollY + (document.querySelector('#ascenso').offsetHeight - innerHeight) * ${f}`); await wait(p, 1300);
    return p.evaluate(() => ({ vis: [...document.querySelectorAll('#ascenso .frame')].map(e => +(+e.style.opacity).toFixed(2)), num: document.getElementById('as-num').textContent, read: document.getElementById('as-read').textContent }));
  };
  const a0 = await asc(0.02), a2 = await asc(0.42), a5 = await asc(0.97);
  ok('ascenso: empieza en la intro', a0.vis[0] === 1 && a0.num === '', a0);
  ok('ascenso: a mitad muestra una sola etapa', a2.vis.filter(v => v > 0.5).length === 1 && /^0[1-5]$/.test(a2.num), a2);
  ok('ascenso: termina en la cumbre (05, 100%)', a5.vis[5] === 1 && a5.num === '05' && a5.read === '100%', a5);
  // cifras
  await scrollTo(p, "document.querySelector('.figs').getBoundingClientRect().top + scrollY - 300"); await wait(p, 2200);
  const counts = await p.evaluate(() => [...document.querySelectorAll('.count')].map(e => e.textContent));
  ok('cifras animadas terminan en +50 y −50', counts[0] === '+50' && counts[1] === '−50', counts);
  // FAQ
  await scrollTo(p, "document.querySelector('#dudas').getBoundingClientRect().top + scrollY - 80"); await wait(p, 700);
  await p.click('.faq-list details:nth-child(1) summary'); await wait(p, 300);
  ok('las dudas se abren al pulsar', await p.evaluate(() => document.querySelector('.faq-list details').open));
  // ancla
  await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 800);
  await p.click('.top .btn'); await wait(p, 2600);
  const anch = await p.evaluate(() => Math.round(document.querySelector('#aplicar').getBoundingClientRect().top));
  ok('el botón "Empezar" lleva al formulario', Math.abs(anch) < 90, anch);
  await ctx.close();

  // ---------- Móvil ----------
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  p = await ctx.newPage(); const merrs = [];
  p.on('pageerror', e => merrs.push(e.message));
  await p.goto(URL, { waitUntil: 'domcontentloaded' }); await wait(p, 4000);
  ok('sin errores (móvil)', merrs.length === 0, merrs);
  const bar = () => p.evaluate(() => document.getElementById('sticky-cta').classList.contains('show'));
  ok('botón fijo oculto en la portada', !(await bar()));
  await scrollTo(p, '2600'); await wait(p, 900);
  ok('botón fijo visible al bajar', await bar());
  await scrollTo(p, "document.querySelector('.form-card').getBoundingClientRect().top + scrollY - 120"); await wait(p, 1200);
  ok('botón fijo oculto junto al formulario', !(await bar()));
  ok('en móvil no hay scroll suave por JS (nativo)', await p.evaluate(() => !document.documentElement.classList.contains('lenis')));
  const tap = await p.evaluate(() => [...document.querySelectorAll('a.btn')].map(a => Math.round(a.getBoundingClientRect().height)).filter(h => h > 0));
  ok('botones con altura táctil ≥ 42 px', tap.every(h => h >= 42), [Math.min(...tap), Math.max(...tap)]);
  ok('sin scroll horizontal (móvil)', await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
  await ctx.close();

  // ---------- Movimiento reducido ----------
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  p = await ctx.newPage(); await p.goto(URL, { waitUntil: 'domcontentloaded' }); await wait(p, 3500);
  const rm = await p.evaluate(() => ({ motion: document.documentElement.classList.contains('js-motion'), num: document.getElementById('lunes-num').textContent, frames: [...document.querySelectorAll('#ascenso .frame')].map(e => getComputedStyle(e).opacity), sticky: getComputedStyle(document.querySelector('.ascent-stage')).position, title: getComputedStyle(document.querySelector('.ht-w > *')).animationName }));
  ok('movimiento reducido: sin animaciones y todo visible', !rm.motion && rm.num === '52' && rm.frames.every(o => o === '1') && rm.sticky !== 'sticky' && rm.title === 'none', rm);
  await scrollTo(p, "document.querySelector('#ascenso').getBoundingClientRect().top + scrollY - 60"); await wait(p, 600); await p.screenshot({ path: out + '/reduced-ascent.png' });
  await scrollTo(p, "document.querySelector('#problema').getBoundingClientRect().top + scrollY - 60"); await wait(p, 600); await p.screenshot({ path: out + '/reduced-lunes.png' });
  await scrollTo(p, '0'); await wait(p, 400); await p.screenshot({ path: out + '/reduced-hero.png' });
  await ctx.close();

  // ---------- Dentro de un marco (como la vista previa) ----------
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  p = await ctx.newPage();
  await p.setContent('<iframe src="' + URL + '" style="width:100%;height:780px;border:0"></iframe>'); await wait(p, 4000);
  const fr = p.frames().find(f => f.url().startsWith(URL));
  const framed = await fr.evaluate(() => ({ link: document.getElementById('form-slot').classList.contains('is-link'), iframe: !!document.querySelector('#form-slot iframe'), href: (document.querySelector('#form-slot a') || {}).href }));
  ok('en vista previa enmarcada: botón en vez de formulario', framed.link && !framed.iframe && /260646326019052/.test(framed.href), framed);
  await ctx.close(); await b.close();

  // ---------- Sin WebGL ----------
  b = await chromium.launch({ args: ['--disable-3d-apis'] });
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  p = await ctx.newPage(); const gerrs = []; p.on('pageerror', e => gerrs.push(e.message));
  await p.goto(URL, { waitUntil: 'domcontentloaded' }); await wait(p, 3500);
  ok('sin WebGL: la página funciona con fondo de respaldo', (await p.evaluate(() => document.documentElement.classList.contains('no-gl'))) && gerrs.length === 0, gerrs);
  await p.screenshot({ path: out + '/nogl-hero.png' });
  await scrollTo(p, "document.querySelector('#ascenso').getBoundingClientRect().top + scrollY + (document.querySelector('#ascenso').offsetHeight - innerHeight) * 0.4"); await wait(p, 1200);
  await p.screenshot({ path: out + '/nogl-ascent.png' });
  await ctx.close(); await b.close();

  console.log(results.join('\n'));
  console.log(results.filter(r => r.startsWith('FAIL')).length ? 'HAY FALLOS' : 'TODO OK');
})().catch(e => { console.log(results.join('\n')); console.log('ERROR DE PRUEBA', e.message); process.exit(1); });
