(function () {
  var canvas = document.getElementById('canvas-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  var isMobile = window.innerWidth < 900;
  var scrollProgress = 0;
  var targetScrollProgress = 0;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0805);
  scene.fog = new THREE.FogExp2(0x0a0805, 0.048);

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 9, 12);
  camera.lookAt(0, 0, 0);

  var camPosA = new THREE.Vector3(0, 9, 12);
  var camPosB = new THREE.Vector3(4, 5, 10);
  var camTargetA = new THREE.Vector3(0, 0, 0);
  var camTargetB = new THREE.Vector3(1, 0, 1);
  var camCurrent = new THREE.Vector3().copy(camPosA);
  var camTargetCurrent = new THREE.Vector3().copy(camTargetA);

  function makeWoodTexture(light) {
    var size = 256;
    var cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    var ctx = cv.getContext('2d');
    var base = light ? '#d4b896' : '#4a2e14';
    var grain = light ? '#c4a882' : '#3d2510';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = grain;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.35;
    for (var i = 0; i < 18; i++) {
      var y = (i / 18) * size + Math.sin(i * 1.3) * 8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (var x = 0; x <= size; x += 8) {
        ctx.lineTo(x, y + Math.sin(x * 0.04 + i) * 3);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.12;
    for (var j = 0; j < 40; j++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    return tex;
  }

  var texLight = makeWoodTexture(true);
  var texDark = makeWoodTexture(false);

  var boardGroup = new THREE.Group();
  scene.add(boardGroup);

  var frameGeo = new THREE.BoxGeometry(10.4, 0.28, 10.4);
  var frameMat = new THREE.MeshStandardMaterial({
    map: makeWoodTexture(false),
    roughness: 0.65,
    metalness: 0.04
  });
  var frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = -0.14;
  frame.receiveShadow = true;
  boardGroup.add(frame);

  var cellSize = 1.1;
  for (var row = 0; row < 8; row++) {
    for (var col = 0; col < 8; col++) {
      var isLight = (row + col) % 2 === 0;
      var geo = new THREE.BoxGeometry(cellSize, 0.14, cellSize);
      var mat = new THREE.MeshStandardMaterial({
        map: isLight ? texLight : texDark,
        roughness: 0.55,
        metalness: 0.05
      });
      var cell = new THREE.Mesh(geo, mat);
      var x = (col - 3.5) * cellSize;
      var z = (row - 3.5) * cellSize;
      cell.position.set(x, 0, z);
      cell.receiveShadow = true;
      boardGroup.add(cell);
    }
  }

  var whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.3, metalness: 0.08 });
  var blackMat = new THREE.MeshStandardMaterial({ color: 0x1a120a, roughness: 0.4, metalness: 0.12 });

  function makePawn(isWhite) {
    var g = new THREE.Group();
    var mat = isWhite ? whiteMat : blackMat;
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.1, 16), mat);
    base.position.y = 0.05;
    g.add(base);
    var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.32, 12), mat);
    stem.position.y = 0.26;
    g.add(stem);
    var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.07, 12), mat);
    collar.position.y = 0.455;
    g.add(collar);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 10), mat);
    head.position.y = 0.63;
    g.add(head);
    return g;
  }

  function makeRook(isWhite) {
    var g = new THREE.Group();
    var mat = isWhite ? whiteMat : blackMat;
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.1, 16), mat);
    base.position.y = 0.05;
    g.add(base);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.5, 12), mat);
    body.position.y = 0.35;
    g.add(body);
    var top = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.22, 0.12, 12), mat);
    top.position.y = 0.66;
    g.add(top);
    var battlements = [[-0.15, 0], [0.15, 0], [0, -0.15], [0, 0.15]];
    battlements.forEach(function (b) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.1), mat);
      m.position.set(b[0], 0.8, b[1]);
      g.add(m);
    });
    return g;
  }

  function makeKnight(isWhite) {
    var g = new THREE.Group();
    var mat = isWhite ? whiteMat : blackMat;
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.31, 0.1, 16), mat);
    base.position.y = 0.05;
    g.add(base);
    var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.28, 12), mat);
    stem.position.y = 0.24;
    g.add(stem);
    var neck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.44, 0.22), mat);
    neck.position.set(0.04, 0.58, 0);
    neck.rotation.x = -0.22;
    g.add(neck);
    var head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.34), mat);
    head.position.set(0.06, 0.85, 0.04);
    head.rotation.x = 0.18;
    g.add(head);
    var snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.18), mat);
    snout.position.set(0.06, 0.78, 0.22);
    g.add(snout);
    return g;
  }

  function makeBishop(isWhite) {
    var g = new THREE.Group();
    var mat = isWhite ? whiteMat : blackMat;
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.1, 16), mat);
    base.position.y = 0.05;
    g.add(base);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 0.55, 12), mat);
    body.position.y = 0.375;
    g.add(body);
    var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.14, 0.08, 12), mat);
    collar.position.y = 0.68;
    g.add(collar);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), mat);
    head.position.y = 0.81;
    g.add(head);
    var tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), mat);
    tip.position.y = 1.01;
    g.add(tip);
    return g;
  }

  function makeQueen(isWhite) {
    var g = new THREE.Group();
    var mat = isWhite ? whiteMat : blackMat;
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 16), mat);
    base.position.y = 0.05;
    g.add(base);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.6, 14), mat);
    body.position.y = 0.4;
    g.add(body);
    var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.09, 14), mat);
    collar.position.y = 0.745;
    g.add(collar);
    var crown = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), mat);
    crown.position.y = 0.92;
    g.add(crown);
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2;
      var pt = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mat);
      pt.position.set(Math.cos(a) * 0.19, 1.1, Math.sin(a) * 0.19);
      g.add(pt);
    }
    return g;
  }

  function makeKing(isWhite) {
    var g = new THREE.Group();
    var mat = isWhite ? whiteMat : blackMat;
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 16), mat);
    base.position.y = 0.05;
    g.add(base);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.27, 0.65, 14), mat);
    body.position.y = 0.425;
    g.add(body);
    var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.09, 14), mat);
    collar.position.y = 0.795;
    g.add(collar);
    var crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 14), mat);
    crown.position.y = 0.94;
    g.add(crown);
    var crossV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.07), mat);
    crossV.position.y = 1.18;
    g.add(crossV);
    var crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.07), mat);
    crossH.position.y = 1.24;
    g.add(crossH);
    return g;
  }

  function placePiece(piece, x, z) {
    piece.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = !isMobile;
        child.receiveShadow = !isMobile;
      }
    });
    piece.position.set(x, 0.14, z);
    boardGroup.add(piece);
  }

  var cs = cellSize;
  function cx(col) { return (col - 3.5) * cs; }
  function cz(row) { return (row - 3.5) * cs; }

  var backRankW = [makeRook(true), makeKnight(true), makeBishop(true), makeQueen(true), makeKing(true), makeBishop(true), makeKnight(true), makeRook(true)];
  var backRankB = [makeRook(false), makeKnight(false), makeBishop(false), makeQueen(false), makeKing(false), makeBishop(false), makeKnight(false), makeRook(false)];

  backRankW.forEach(function (p, i) { placePiece(p, cx(i), cz(0)); });
  backRankB.forEach(function (p, i) { placePiece(p, cx(i), cz(7)); });

  for (var pi = 0; pi < 8; pi++) {
    placePiece(makePawn(true), cx(pi), cz(1));
    placePiece(makePawn(false), cx(pi), cz(6));
  }

  var ambientLight = new THREE.AmbientLight(0x4a3820, 0.5);
  scene.add(ambientLight);

  var keyLight = new THREE.DirectionalLight(0xfff5e0, 1.6);
  keyLight.position.set(6, 10, 8);
  keyLight.castShadow = !isMobile;
  if (!isMobile) {
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.001;
  }
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0x3050a0, 0.4);
  fillLight.position.set(-8, 4, -4);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(0xd4a84b, 0.9);
  rimLight.position.set(-2, 6, -10);
  scene.add(rimLight);

  var clock = new THREE.Clock();

  function onScroll() {
    var maxScroll = document.body.scrollHeight - window.innerHeight;
    targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  function onResize() {
    isMobile = window.innerWidth < 900;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onResize);

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    scrollProgress += (targetScrollProgress - scrollProgress) * 0.04;

    boardGroup.rotation.y = t * 0.06 + scrollProgress * 0.8;
    boardGroup.position.y = Math.sin(t * 0.4) * 0.12 - 1.5;

    var sp = scrollProgress;
    var tx = lerp(camPosA.x, camPosB.x, sp);
    var ty = lerp(camPosA.y, camPosB.y, sp);
    var tz = lerp(camPosA.z, camPosB.z, sp);

    camCurrent.x = lerp(camCurrent.x, tx, 0.03);
    camCurrent.y = lerp(camCurrent.y, ty, 0.03);
    camCurrent.z = lerp(camCurrent.z, tz, 0.03);
    camera.position.copy(camCurrent);

    var lookX = lerp(camTargetA.x, camTargetB.x, sp);
    var lookY = lerp(camTargetA.y, camTargetB.y, sp);
    var lookZ = lerp(camTargetA.z, camTargetB.z, sp);
    camTargetCurrent.x = lerp(camTargetCurrent.x, lookX, 0.03);
    camTargetCurrent.y = lerp(camTargetCurrent.y, lookY, 0.03);
    camTargetCurrent.z = lerp(camTargetCurrent.z, lookZ, 0.03);
    camera.lookAt(camTargetCurrent);

    renderer.render(scene, camera);
  }

  animate();
})();
