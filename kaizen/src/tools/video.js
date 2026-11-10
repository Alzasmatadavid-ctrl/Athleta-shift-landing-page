// Graba el recorrido de la página fotograma a fotograma, con el reloj de la página bajo control,
// para que el vídeo salga fluido aunque este equipo dibuje despacio.
// Uso: node video.js <dirFotogramas> <m|d> <fps> [segundosMax]
const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2], dev = process.argv[3] || 'm', FPS = +(process.argv[4] || 25), MAXS = +(process.argv[5] || 999);
const VP = dev === 'm' ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const URL = 'http://localhost:8765/';

// Guion: [segundo, posición]. La posición es una expresión evaluada en la página con ayuda de p.
const SCRIPT = [
  [0.0, 'p => 0'],
  [2.8, 'p => 0'],
  [4.6, "p => p.top('#problema')"],
  [9.4, "p => p.top('#problema') + p.h('#problema') - p.vh"],
  [10.2, "p => p.top('#problema') + p.h('#problema') - p.vh"],
  [11.6, "p => p.top('.pains') - 20"],
  [14.6, "p => p.top('.verdict') - p.vh * 0.55"],
  [16.4, "p => p.top('#historia') - 30"],
  [18.2, "p => p.top('#historia') + p.h('#historia') * 0.35"],
  [19.6, "p => p.top('#kaizen') - p.vh * 0.45"],
  [23.4, "p => p.top('#kaizen') + p.h('#kaizen') - p.vh * 0.62"],
  [25.0, "p => p.top('#metodo') - 20"],
  [26.4, "p => p.top('.mech-grid') - 80"],
  [29.6, "p => p.top('.mech-grid') - 80"],
  [31.2, "p => p.top('#ascenso')"],
  [32.4, "p => p.top('#ascenso') + (p.h('#ascenso') - p.vh) * 0.06"],
  [44.4, "p => p.top('#ascenso') + (p.h('#ascenso') - p.vh) * 0.97"],
  [45.6, "p => p.top('#ascenso') + (p.h('#ascenso') - p.vh) * 0.97"],
  [47.4, "p => p.top('#resultados') - 30"],
  [49.2, "p => p.top('.cases') - 70"],
  [51.0, "p => p.top('.cases') - 70"],
  [53.2, "p => p.top('#incluye') - 20"],
  [55.2, "p => p.top('#para-quien') - 20"],
  [57.0, "p => p.top('#dudas') - 20"],
  [58.8, "p => p.top('#aplicar')"],
  [61.0, "p => p.top('#aplicar')"],
  [63.2, "p => p.top('.offer-grid') - 90"],
  [64.8, "p => p.top('.offer-grid') - 90"],
  [67.0, 'p => p.max'],
  [68.6, 'p => p.max'],
];
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: VP, isMobile: dev === 'm', hasTouch: dev === 'm', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  // El reloj de la página va parado desde el principio y lo avanzamos nosotros a pequeños empujones.
  // (Si se deja correr solo, en escritorio el dibujo del cielo se acumula y bloquea las capturas.)
  await page.clock.install({ time: new Date() });
  await page.clock.pauseAt(new Date(Date.now() + 20));
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 45; i++) { await page.waitForTimeout(140); await page.clock.runFor(34); }   // carga real: fuentes, scripts, formulario
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.clock.runFor(34);
  // posiciones del guion
  const ys = await page.evaluate(script => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = { vh: innerHeight, max, top: s => document.querySelector(s).getBoundingClientRect().top + scrollY, h: s => document.querySelector(s).offsetHeight };
    return script.map(([t, src]) => [t, Math.max(0, Math.min(max, (new Function('return (' + src + ')'))()(p)))]);
  }, SCRIPT);
  const total = Math.min(MAXS, ys[ys.length - 1][0]);
  const N = Math.round(total * FPS);
  console.log('frames', N, 'total s', total, 'height', await page.evaluate(() => document.documentElement.scrollHeight));
  const posAt = t => {
    for (let i = 1; i < ys.length; i++) {
      if (t <= ys[i][0]) { const [t0, y0] = ys[i - 1], [t1, y1] = ys[i]; return y0 + (y1 - y0) * ease((t - t0) / (t1 - t0)); }
    }
    return ys[ys.length - 1][1];
  };
  const t00 = Date.now();
  for (let f = 0; f < N; f++) {
    const t = f / FPS;
    await page.evaluate(({ y, ms }) => {
      window.scrollTo(0, y);
      // Las animaciones CSS no obedecen al reloj falso: las colocamos a mano en su instante.
      document.getAnimations().forEach(a => {
        if (a.__t0 === undefined) a.__t0 = (a.animationName ? 0 : ms);   // las de portada empiezan en 0; las transiciones, al aparecer
        try { a.pause(); a.currentTime = Math.max(0, ms - a.__t0); } catch (e) {}
      });
    }, { y: posAt(t), ms: t * 1000 });
    await page.waitForTimeout(25);                        // eventos de scroll y observadores (tiempo real)
    await page.clock.runFor(1000 / FPS);                  // el tiempo de la página avanza exactamente un fotograma
    await page.waitForTimeout(15);
    await page.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
    if (f % 50 === 0) console.log('f', f, 't', t.toFixed(1), 's/frame', ((Date.now() - t00) / (f + 1) / 1000).toFixed(2));
  }
  await b.close();
  console.log('done', N, 'frames in', ((Date.now() - t00) / 1000).toFixed(0), 's');
})().catch(e => { console.log('ERROR', e.message); process.exit(1); });
