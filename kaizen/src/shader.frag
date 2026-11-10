#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime, uAlt, uDawn, uPeak, uSummit, uPeakX;
uniform vec2 uMouse;

float h11(float n){ return fract(sin(n*127.1)*43758.5453123); }
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float n1(float x){ float i=floor(x), f=fract(x); f=f*f*(3.-2.*f); return mix(h11(i),h11(i+1.),f); }
float n2(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x), mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x), f.y);
}
// Cresta: ruido "ridged" para que salgan picos y no colinas
float ridge(float x){
  float v=0., a=.5;
  for(int i=0;i<5;i++){ float n=n1(x); n=1.-abs(n*2.-1.); v+=a*pow(n,1.35); x=x*2.13+13.1; a*=.47; }
  return v;
}
float fbm2(vec2 p){
  float v=0., a=.5;
  for(int i=0;i<4;i++){ v+=a*n2(p); p=p*2.02+vec2(7.3,3.1); a*=.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  float x = (uv.x - .5) * asp;
  float y = uv.y;
  float px = 1.5 / uRes.y;

  // --- Cielo: de noche cerrada a hora azul con franja cálida en el horizonte
  vec3 nTop = vec3(.008,.013,.034), nHor = vec3(.030,.068,.185);
  vec3 dTop = vec3(.030,.070,.215), dHor = vec3(.640,.420,.400);
  float hor = mix(.34, asp < 1. ? .43 : .31, uSummit);
  float g = clamp((y - hor + .06) / (1. - hor + .06), 0., 1.);
  vec3 sky = mix(mix(nHor, nTop, pow(g,.62)), mix(dHor, dTop, pow(g,.42)), uDawn);
  float band = exp(-abs(y - hor) * mix(8., 6.5, uDawn));
  vec3 bandCol = mix(vec3(.030,.075,.210), vec3(.980,.520,.260), uDawn);
  sky += bandCol * band * mix(.55, .62, uDawn);
  // resplandor del sol justo bajo el horizonte
  float sunX = mix(.18, .34, uSummit) * min(asp, 1.7);
  float sd = length(vec2((x - sunX) * .55, y - hor + .02));
  sky += vec3(1.,.62,.32) * exp(-sd * 5.5) * uDawn * .55;
  vec3 col = sky;

  // --- Estrellas
  vec2 sp = vec2(x, y) * 80.;
  vec2 id = floor(sp);
  float sh = h21(id);
  vec2 so = (vec2(h21(id + 1.3), h21(id + 2.7)) - .5) * .7;
  float sdist = length(fract(sp) - .5 - so);
  float big = step(.975, sh);
  float star = smoothstep(mix(.13,.24,big), .0, sdist) * step(.82, sh);
  star *= .6 + .4 * sin(uTime * 1.3 + sh * 60.);
  col += star * (1. - uDawn * .9) * smoothstep(hor + .02, hor + .36, y) * vec3(.80,.88,1.) * (.55 + .9 * h21(id + 9.1)) * 1.25;

  // --- Cumbre principal (el objetivo): flota sobre la bruma y recibe la primera luz
  if(uPeak > .001){
    float s = mix(1., 1.75, uAlt);
    float apex = mix(.80, .90, uAlt);
    float dx = (x - uPeakX) / s;
    float adx = abs(dx);
    float jag = (ridge(dx * 4.6 + 3.7) - .40) * .20 * smoothstep(.0, .10, adx);
    float slope = dx < 0. ? 1.02 : 1.38;
    float prof = apex - (pow(adx, .90) * slope - jag) * s;
    float m = smoothstep(prof + px, prof - px, y);
    // disolver la base en la bruma
    float baseFade = smoothstep(hor - .02, hor + .30, y);
    // caras: arista central irregular que separa luz y sombra
    float spine = dx - (apex - y) * .10 + (n1(y * 34. + 2.) - .5) * .030 + (n1(y * 9.) - .5) * .042;
    float lit = smoothstep(.012, -.012, spine);
    // estrías de roca siguiendo la pendiente de cada cara
    float sgn = dx < spine - dx ? 1. : -1.;
    float streak = n2(vec2((dx * 1.0 + sgn * (apex - y) * .55) * 60., (apex - y) * 9.));
    float rock = n2(vec2(dx * 24., y * 40.)) * .45 + streak * .55;
    vec3 shadeN = vec3(.022,.040,.105), lightN = vec3(.075,.125,.290);
    vec3 shadeD = vec3(.070,.085,.200), lightD = vec3(.900,.560,.400);
    vec3 pc = mix(mix(shadeN, lightN, lit), mix(shadeD, lightD, lit), uDawn);
    pc *= .66 + rock * .62;
    // nieve en la parte alta de la cara iluminada
    float snowLine = apex - (.13 + n1(dx * 34.) * .09) * s;
    float snow = smoothstep(snowLine - .05, snowLine + .04, y) * (.30 + .70 * lit) * smoothstep(.25, .62, streak + .25);
    vec3 snowCol = mix(vec3(.30,.40,.66), vec3(1.,.84,.72), uDawn);
    pc = mix(pc, snowCol, snow * (.55 + rock * .3));
    // perspectiva aérea
    pc = mix(sky, pc, mix(.25, 1., baseFade));
    col = mix(col, pc, m * uPeak);
  }

  // --- Cordilleras en capas, de lejos a cerca, con bruma entre ellas
  vec3 mistN = vec3(.060,.115,.290), mistD = vec3(.640,.470,.470);
  vec3 mist = mix(mistN, mistD, uDawn);
  for(int i=0;i<5;i++){
    float fi = float(i);
    float d = fi / 4.;
    float freq = mix(1.05, 1.9, d);
    float amp = mix(.20, .46, d);
    float base = mix(hor - .085, -.26, d);
    float drop = uAlt * mix(.05, .60, d) + uSummit * mix(.03, .55, d);
    float sx = x + uMouse.x * mix(.004, .035, d) + fi * 31.7;
    float h = base - drop + amp * ridge(sx * freq) + uMouse.y * mix(.0, .012, d);
    float m = smoothstep(h + px, h - px, y) * (1. - uSummit * step(1.5, fi));
    vec3 farC = mix(vec3(.040,.085,.215), vec3(.205,.215,.375), uDawn);
    vec3 nearC = mix(vec3(.006,.010,.024), vec3(.020,.026,.060), uDawn);
    vec3 lc = mix(farC, nearC, pow(d, .8));
    // filo de luz en la arista
    float edge = smoothstep(.007, .0, h - y) * m;
    lc += edge * mix(vec3(.030,.060,.150), vec3(.560,.300,.150), uDawn) * (1. - d * .75) * .55;
    // la ladera se aclara hacia el valle (perspectiva aérea)
    lc = mix(lc, mist, clamp((h - y) * 1.6, 0., 1.) * mix(.42, .10, d));
    col = mix(col, lc, m);
    // bruma al pie de la capa
    float f = fbm2(vec2(x * 1.25 + uTime * .016 * (1. + fi * .7) + fi * 5.3, y * 3.6 - fi * 1.7)) * .7
            + n2(vec2(x * .45 - uTime * .008 + fi * 2.1, y * 1.3 + fi)) * .3;
    float foot = 1. - smoothstep(h - .34, h - .01, y);
    col = mix(col, mist, foot * smoothstep(.22, .80, f) * mix(.62, .22, d) * (1. - uSummit * step(1.5, fi)));
  }

  // --- Mar de nubes (solo en la cumbre)
  if(uSummit > .001){
    float t = hor - y;
    if(t > 0.){
      float persp = 1. / (t + .045);
      vec2 cp = vec2(x * persp * .16 + uTime * .012, persp * .42 + uTime * .004);
      float c = fbm2(cp);
      float c2 = fbm2(cp * 2.3 + 4.);
      float d = smoothstep(.28, .82, c * .7 + c2 * .3);
      vec3 cl = mix(vec3(.085,.135,.330), vec3(1.,.700,.560), uDawn);
      vec3 cs = mix(vec3(.022,.036,.100), vec3(.155,.180,.380), uDawn);
      vec3 cc = mix(cs, cl, d);
      cc = mix(cc, sky, exp(-t * 11.));
      col = mix(col, cc, uSummit * smoothstep(0., .030, t + (c - .5) * .03));
    }
  }

  // --- Viñeta y grano (el grano evita el "banding" de los degradados)
  vec2 vv = vec2((uv.x - .5) * 1.05, uv.y - .5);
  col *= 1. - dot(vv, vv) * .55;
  gl_FragColor = vec4(max(col, 0.), 1.);
}
