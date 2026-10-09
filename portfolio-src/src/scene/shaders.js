// GLSL shaders for the particle field. They run on the graphics card, once per particle (vertex)
// and once per pixel of each particle (fragment), which is what keeps 18,000 moving points smooth.

// 3D simplex noise by Ashima Arts / Stefan Gustavson (MIT licence).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMorph;      // 0..8: which shape we're on, fractional while changing (see shapes.js for the order)
uniform float uIntro;      // 0..1: particles fly in from a scattered cloud on load
uniform float uSize;
uniform float uPixelRatio;
uniform float uViewportH;  // drawing-buffer height in pixels, to size portrait dots exactly
uniform float uPitch;      // spacing of the portrait's dot grid, in scene units
uniform float uScale;      // current scale of the whole field
uniform float uTurbulence; // extra wobble from scroll speed
uniform float uCamZ;       // camera distance, so depth fading works at any zoom
uniform vec3  uMouseRay;   // direction of the pointer ray, in camera space
uniform float uMouseForce;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uAccent;

attribute vec3 aS1; // dust
attribute vec3 aS2; // globe
attribute vec3 aS3; // device field
attribute vec3 aS4; // coil
attribute vec3 aS5; // ring
attribute vec3 aS6; // heartbeat
attribute vec3 aS7; // blocks
attribute vec4 aRand;
attribute vec4 aPhoto; // portrait dot colour (rgb) and size (a)

varying vec3 vColor;
varying float vAlpha;
varying float vPhoto;

${noise}

// Shape 0 and shape 8 are both the portrait (stored in "position").
vec3 shapeAt(float i){
  if(i<0.5) return position;
  else if(i<1.5) return aS1;
  else if(i<2.5) return aS2;
  else if(i<3.5) return aS3;
  else if(i<4.5) return aS4;
  else if(i<5.5) return aS5;
  else if(i<6.5) return aS6;
  else if(i<7.5) return aS7;
  return position;
}

float near(float a, float b){ return clamp(1.0-abs(a-b),0.0,1.0); }

void main(){
  float seg = min(floor(uMorph), 7.0);
  float t = uMorph - seg;
  // Each particle leaves a little earlier or later than its neighbours, so a change ripples rather than snaps.
  float d = aRand.x * 0.42;
  float k = smoothstep(d, d + 0.58, t);
  vec3 p = mix(shapeAt(seg), shapeAt(seg + 1.0), k);

  // While moving between shapes, particles bow outward along a noise direction.
  float travel = sin(k * 3.14159);
  vec3 swirl = vec3(snoise(p * 0.45 + 3.1), snoise(p * 0.45 + 11.7), snoise(p * 0.45 + 23.9));
  p += swirl * travel * 0.9;

  // How much of each shape is showing right now.
  float wFace = near(uMorph, 0.0) + near(uMorph, 8.0);
  float wDust = near(uMorph, 1.0);
  float wGlobe = near(uMorph, 2.0);
  float wFleet = near(uMorph, 3.0);
  float wCoil = near(uMorph, 4.0);
  float wRing = near(uMorph, 5.0);
  float wBeat = near(uMorph, 6.0);
  float wBlocks = near(uMorph, 7.0);
  // The portrait's own colours fade in only once the dots have nearly arrived.
  float photo = smoothstep(0.55, 1.0, wFace);

  float time = uTime;
  float n = snoise(p * 0.7 + vec3(0.0, time * 0.18, 0.0));
  p += vec3(swirl.y, swirl.z, swirl.x) * 0.012 * wFace * (1.0 + sin(time * 1.4 + aRand.w * 6.28));   // face shimmers
  p += vec3(snoise(p * 0.2 + time * 0.05), snoise(p * 0.2 + 7.0 + time * 0.05), 0.0) * 0.7 * wDust;    // dust drifts
  p += normalize(p + 0.0001) * n * 0.08 * (wGlobe + wRing);                                            // globe and ring breathe
  p.y += (sin(p.x * 0.9 + time * 1.3) * 0.11 + cos(p.z * 1.2 + time * 0.9) * 0.08) * wFleet;           // device field ripples
  p += vec3(n) * 0.05 * (wCoil + wBeat + wBlocks);
  p += swirl * uTurbulence * 0.35 * (1.0 - photo * 0.7);

  // A brightness pulse that runs along the heartbeat trace and along the coil.
  float scanX = mod(time * 2.2, 12.0) - 6.0;
  float scan = exp(-pow((p.x - scanX) * 1.4, 2.0)) * (wBeat + wCoil * 0.7);

  // A few devices in the field light up at random, like units reporting in.
  float blink = step(0.985, fract(aRand.z * 91.7 + floor(time * 0.9 + aRand.w * 7.0) * 0.137)) * (wFleet + wGlobe * 0.6);

  // Fly in on load.
  vec3 scatter = normalize(aRand.xyz - 0.5 + 0.0001) * (7.0 + aRand.w * 7.0);
  float ti = smoothstep(aRand.w * 0.45, aRand.w * 0.45 + 0.55, uIntro);
  p = mix(scatter, p, ti);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Push particles gently away from the pointer, measured on screen so every depth reacts.
  vec2 m = uMouseRay.xy * (mv.z / uMouseRay.z);
  vec2 away = mv.xy - m;
  float dist = length(away);
  mv.xy += normalize(away + 0.0001) * smoothstep(1.3, 0.0, dist) * 0.5 * uMouseForce;
  gl_Position = projectionMatrix * mv;

  // Size: glowing points for the shapes; exact halftone dots for the portrait.
  float glowSize = uSize * (0.55 + aRand.y * 0.9) * (1.0 + scan * 1.6 + blink * 1.8) * uPixelRatio * (uCamZ / -mv.z);
  float dotSize = aPhoto.a * uPitch * uScale * 1.35 * projectionMatrix[1][1] * uViewportH * 0.5 / -mv.z;
  // Particles that aren't part of the portrait shrink away while it's showing.
  gl_PointSize = mix(glowSize, dotSize, photo);

  vec3 base = mix(uColorA, uColorB, aRand.z);
  vec3 shapeColor = mix(base, uAccent, clamp(scan * 1.2 + blink + travel * 0.25 * step(0.8, aRand.y), 0.0, 1.0));
  vColor = mix(shapeColor, aPhoto.rgb, photo);
  vPhoto = photo;
  float depth = smoothstep(uCamZ + 3.5, uCamZ - 3.0, -mv.z);
  float shapeAlpha = (0.32 + 0.68 * depth) * (0.55 + aRand.y * 0.45) + scan * 0.6 + blink * 0.6;
  vAlpha = mix(shapeAlpha * (1.0 - wDust * 0.45), 0.95, photo) * ti;
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vPhoto;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if(d > 0.5) discard;
  float glow = pow(smoothstep(0.5, 0.0, d), 2.2);
  float disc = smoothstep(0.5, 0.36, d);
  float shape = mix(glow, disc, vPhoto);
  vec3 col = vColor * mix(0.6 + glow, 1.0, vPhoto);
  gl_FragColor = vec4(col, vAlpha * shape);
}
`;
