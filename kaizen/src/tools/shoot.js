// Captura cada sección de la página (servida en http://localhost:8765/).
// Uso: node shoot.js <carpeta> <cfg[,cfg...]> [seccion,seccion...]
// cfg = nombre:ANCHOxALTO[:m][:r]   (m = móvil/táctil, r = movimiento reducido)
const { chromium } = require('playwright');
const out = process.argv[2];
const cfgs = (process.argv[3] || 'd:1440x900,m:390x844:m').split(',').map(c => {
  const [name, size, ...flags] = c.split(':'); const [w, h] = size.split('x').map(Number);
  return { name, w, h, mobile: flags.includes('m'), reduce: flags.includes('r') };
});
const only = (process.argv[4] || '').split(',').filter(Boolean);
const shots = [
  ['hero', p => 0],
  ['lunes', p => p.top('#problema') + p.vh * 0.75],
  ['pains', p => p.top('.pains') + 40],
  ['pains2', p => p.top('.pain-list') + p.vh * 0.45],
  ['story', p => p.top('#historia') - 40],
  ['creed', p => p.top('#kaizen') - p.vh * 0.25],
  ['mech', p => p.top('#metodo') - 20],
  ['mech2', p => p.top('.mech-grid') - 90],
  ['asc0', p => p.top('#ascenso') + 10],
  ['asc1', p => p.top('#ascenso') + p.h('#ascenso') * 0.24],
  ['asc3', p => p.top('#ascenso') + p.h('#ascenso') * 0.50],
  ['asc5', p => p.top('#ascenso') + p.h('#ascenso') * 0.80],
  ['proof', p => p.top('#resultados') - p.vh * 0.35],
  ['proof2', p => p.top('.cases') - 90],
  ['pack', p => p.top('#incluye') - 10],
  ['fit', p => p.top('#para-quien') - 10],
  ['faq', p => p.top('#dudas') - 10],
  ['summit', p => p.top('#aplicar') - 10],
  ['summit2', p => p.top('.offer-grid') - 100],
  ['end', p => 9e9],
];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const cfg of cfgs) {
    const ctx = await b.newContext({ viewport: { width: cfg.w, height: cfg.h }, isMobile: cfg.mobile, hasTouch: cfg.mobile, deviceScaleFactor: 1, reducedMotion: cfg.reduce ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    await p.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(5000);
    const info = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight, cls: document.documentElement.className, canvas: [document.getElementById('sky').width, document.getElementById('sky').height] }));
    console.log(cfg.name, JSON.stringify(info));
    for (const [sname, fn] of shots) {
      if (only.length && !only.includes(sname)) continue;
      await p.evaluate(({ src }) => {
        const api = { vh: innerHeight, top: s => document.querySelector(s).getBoundingClientRect().top + scrollY, h: s => document.querySelector(s).offsetHeight };
        const y = Math.max(0, Math.min((new Function('p', 'return (' + src + ')(p)'))(api), document.documentElement.scrollHeight - innerHeight));
        window.scrollTo(0, y);
      }, { src: fn.toString() });
      await p.waitForTimeout(sname === 'hero' ? 400 : 1900);
      await p.screenshot({ path: `${out}/${cfg.name}-${sname}.png` });
    }
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(cfg.name, 'scroll horizontal:', overflow ? 'SÍ (revisar)' : 'no', '· errores:', errs.slice(0, 8).join(' | ') || 'ninguno');
    await ctx.close();
  }
  await b.close();
})();
