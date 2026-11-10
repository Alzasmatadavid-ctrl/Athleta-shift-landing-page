const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' });
  await p.addStyleTag({ content: '.top,.tape,.hero-base,.grain{display:none!important}.hero{--stage-h:548px!important;padding-top:34px!important;min-height:630px!important}.hero::after{height:16%!important}.hero-tag{top:6px!important}' });
  await p.waitForTimeout(5000);
  await p.screenshot({ path: process.argv[2], type: 'jpeg', quality: 86 });
  await b.close();
})();
