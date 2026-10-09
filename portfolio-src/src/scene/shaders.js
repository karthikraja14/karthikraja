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
uniform float uMorph;      // 0..8: which shape is showing, fractional while changing (order in shapes.js)
uniform float uIntro;      // 0..1: particles fly in from a scattered cloud on load
uniform float uSize;       // glow size for the dust
uniform float uPixelRatio;
uniform float uViewportH;  // drawing-buffer height in pixels, to size dots exactly
uniform float uScale;      // current scale of the whole field
uniform float uTurbulence; // extra wobble from scroll speed
uniform float uCamZ;       // camera distance, so depth fading works at any zoom
uniform vec3  uMouseRay;   // direction of the pointer ray, in camera space
uniform float uMouseForce;
uniform vec3  uColorA;     // section colour: lit dots
uniform vec3  uColorB;     // section second colour: unlit grid and dust
uniform vec3  uAccent;     // highlight for the refresh sweep

attribute vec4 aPhoto;  // portrait dot colour (rgb) and diameter (a)
attribute vec3 aS1;     // dust
attribute vec3 aS2;     // readouts, one per career step
attribute vec3 aS3;
attribute vec3 aS4;
attribute vec3 aS5;
attribute vec3 aS6;
attribute vec3 aS7;
attribute vec4 aSizeA;  // readout dot diameters for shapes 2–5 (negative = unlit grid dot)
attribute vec2 aSizeB;  // and for shapes 6–7
attribute vec4 aRand;

varying vec3 vColor;
varying float vAlpha;
varying float vCrisp;

${noise}

// Shapes 0 and 8 are both the portrait (stored in "position").
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
float sizeAt(float i){
  if(i<0.5) return aPhoto.a;
  else if(i<1.5) return 0.0;
  else if(i<2.5) return aSizeA.x;
  else if(i<3.5) return aSizeA.y;
  else if(i<4.5) return aSizeA.z;
  else if(i<5.5) return aSizeA.w;
  else if(i<6.5) return aSizeB.x;
  else if(i<7.5) return aSizeB.y;
  return aPhoto.a;
}

float near(float a, float b){ return clamp(1.0-abs(a-b),0.0,1.0); }
float crispOf(float i){ return (i > 0.5 && i < 1.5) ? 0.0 : 1.0; }

void main(){
  float seg = min(floor(uMorph), 7.0);
  float t = uMorph - seg;
  // Each particle leaves a little earlier or later than its neighbours, so a change ripples rather than snaps.
  float d = aRand.x * 0.42;
  float k = smoothstep(d, d + 0.58, t);
  vec3 p = mix(shapeAt(seg), shapeAt(seg + 1.0), k);

  // Dot size and whether it's a lit dot, blended between the two shapes.
  float sFrom = sizeAt(seg), sTo = sizeAt(seg + 1.0);
  float dotW = mix(abs(sFrom), abs(sTo), k);
  float lit = mix(step(0.0, sFrom), step(0.0, sTo), k);
  // Crisp halftone dots everywhere except the dust (shape 1).
  float crisp = mix(crispOf(seg), crispOf(seg + 1.0), k);

  // While moving between shapes, particles bow outward along a noise direction.
  float travel = sin(k * 3.14159);
  vec3 swirl = vec3(snoise(p * 0.45 + 3.1), snoise(p * 0.45 + 11.7), snoise(p * 0.45 + 23.9));
  p += swirl * travel * 0.9;

  float wFace = near(uMorph, 0.0) + near(uMorph, 8.0);
  float wDust = near(uMorph, 1.0);
  // The portrait's own colours fade in only once the dots have nearly arrived.
  float photo = smoothstep(0.55, 1.0, wFace);
  float settled = 1.0 - travel;

  float time = uTime;
  p += vec3(snoise(p * 0.2 + time * 0.05), snoise(p * 0.2 + 7.0 + time * 0.05), 0.0) * 0.7 * wDust;   // dust drifts
  p += swirl * uTurbulence * 0.3 * (1.0 - crisp * settled);                                           // fast scrolling shakes loose dots only

  // A slow refresh sweep down each readout, like a display redrawing.
  float scanY = 1.6 - mod(time * 0.55, 4.4);
  float scan = exp(-pow((p.y - scanY) * 3.0, 2.0)) * (1.0 - wFace) * (1.0 - wDust);

  // Fly in on load.
  vec3 scatter = normalize(aRand.xyz - 0.5 + 0.0001) * (7.0 + aRand.w * 7.0);
  float ti = smoothstep(aRand.w * 0.45, aRand.w * 0.45 + 0.55, uIntro);
  p = mix(scatter, p, ti);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Push dots gently away from the pointer, measured on screen so every depth reacts.
  vec2 m = uMouseRay.xy * (mv.z / uMouseRay.z);
  vec2 away = mv.xy - m;
  float dist = length(away);
  float radius = mix(1.3, 0.85, wFace);
  mv.xy += normalize(away + 0.0001) * smoothstep(radius, 0.0, dist) * mix(0.5, 0.32, wFace) * uMouseForce;
  gl_Position = projectionMatrix * mv;

  // Size: soft glowing points for the dust, exact dots for the portrait and readouts.
  float glowSize = uSize * (0.55 + aRand.y * 0.9) * uPixelRatio * (uCamZ / -mv.z);
  float dotPx = dotW * uScale * projectionMatrix[1][1] * uViewportH * 0.5 / -mv.z;
  gl_PointSize = mix(glowSize, dotPx * (1.0 + scan * 0.25 * lit), crisp);

  // Colour: dust mixes the two section colours; readouts are lit (colour A) on an unlit grid (colour B);
  // the portrait uses the photo's own colours.
  vec3 dustCol = mix(uColorA, uColorB, aRand.z);
  vec3 litCol = mix(uColorA, uAccent, scan * 0.55);
  vec3 gridCol = uColorB * 0.6;
  vec3 dispCol = mix(gridCol, litCol, lit);
  vColor = mix(mix(dustCol, dispCol, crisp), min(aPhoto.rgb * 1.3, vec3(1.0)), photo);
  vCrisp = crisp;

  float depth = smoothstep(uCamZ + 3.5, uCamZ - 3.0, -mv.z);
  float dustAlpha = (0.32 + 0.68 * depth) * (0.55 + aRand.y * 0.45) * (1.0 - wDust * 0.45);
  float dispAlpha = mix(0.45, 0.95, lit);
  vAlpha = mix(dustAlpha, dispAlpha, crisp) * ti;
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vCrisp;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if(d > 0.5) discard;
  float glow = pow(smoothstep(0.5, 0.0, d), 2.2);
  float disc = smoothstep(0.5, 0.4, d);
  float shape = mix(glow, disc, vCrisp);
  vec3 col = vColor * mix(0.6 + glow, 1.0, vCrisp);
  gl_FragColor = vec4(col, vAlpha * shape);
}
`;
