import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute,
  ShaderMaterial, Points, Group, Color, AdditiveBlending, Vector3, Vector2,
} from 'three';
import { vertexShader, fragmentShader } from './shaders.js';
import { seeded, portrait, dust, globe, fleet, coil, ring, signal, blocks } from './shapes.js';

// Brand colours go to the shader exactly as written (no colour-space conversion),
// so a hex code here matches the same hex code in the CSS.
const raw = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return new Color().setRGB(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/**
 * The fixed 3D background: one cloud of particles that changes shape as the page scrolls.
 * It starts (and ends) as Karthik's face drawn in halftone dots.
 * main.js drives it through: uMorph (which shape), uIntro (fly-in on load),
 * the group's position and scale (where on screen it sits), and setColors (section theme).
 */
export class ParticleField {
  constructor(canvas, { count, colors, portraitMap }) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 10);

    this.group = new Group();      // moved around the screen per section
    this.spin = new Group();       // slow sway + pointer tilt
    this.group.add(this.spin);
    this.scene.add(this.group);

    const rand = seeded(14);
    const face = portrait(count, rand, portraitMap.data, portraitMap.size);
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(face.pos, 3));
    geo.setAttribute('aPhoto', new BufferAttribute(face.rgba, 4));
    geo.setAttribute('aS1', new BufferAttribute(dust(count, rand), 3));
    geo.setAttribute('aS2', new BufferAttribute(globe(count, rand), 3));
    geo.setAttribute('aS3', new BufferAttribute(fleet(count, rand), 3));
    geo.setAttribute('aS4', new BufferAttribute(coil(count, rand), 3));
    geo.setAttribute('aS5', new BufferAttribute(ring(count, rand), 3));
    geo.setAttribute('aS6', new BufferAttribute(signal(count, rand), 3));
    geo.setAttribute('aS7', new BufferAttribute(blocks(count, rand), 3));
    const r = new Float32Array(count * 4);
    for (let i = 0; i < r.length; i++) r[i] = rand();
    geo.setAttribute('aRand', new BufferAttribute(r, 4));

    this.uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uIntro: { value: 0 },
      uSize: { value: 2.4 },
      uPixelRatio: { value: 1 },
      uViewportH: { value: 900 },
      uPitch: { value: face.pitch },
      uScale: { value: 1 },
      uTurbulence: { value: 0 },
      uCamZ: { value: 10 },
      uMouseRay: { value: new Vector3(0, 0, -1) },
      uMouseForce: { value: 0 },
      uColorA: { value: raw(colors.dotA) },
      uColorB: { value: raw(colors.dotB) },
      uAccent: { value: raw(colors.hi) },
    };

    this.material = new ShaderMaterial({
      vertexShader, fragmentShader, uniforms: this.uniforms,
      transparent: true, depthWrite: false, blending: AdditiveBlending,
    });
    this.points = new Points(geo, this.material);
    this.points.frustumCulled = false;
    this.spin.add(this.points);

    // Pointer position in screen coordinates (-1..1), eased toward the real pointer.
    this.pointer = new Vector2(0, 0);
    this.pointerTarget = new Vector2(0, 0);
    this.hasPointer = false;
    this.ray = new Vector3();

    this.resize();
  }

  setPointer(nx, ny) {
    this.pointerTarget.set(nx, ny);
    this.hasPointer = true;
  }

  clearPointer() {
    this.hasPointer = false;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 800 ? 1.5 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Keep shapes a sensible size on tall phone screens.
    this.camera.position.z = w / h < 0.8 ? 14 : 10;
    this.camera.updateProjectionMatrix();
    const u = this.uniforms;
    u.uCamZ.value = this.camera.position.z;
    u.uPixelRatio.value = dpr;
    u.uViewportH.value = h * dpr;
    u.uSize.value = w < 800 ? 2.1 : 2.4;
  }

  render(time, delta) {
    const u = this.uniforms;
    u.uTime.value = time;
    u.uScale.value = this.group.scale.x;

    // How much the portrait is showing (shape 0 or 8): it should face the viewer, not sway.
    const m = u.uMorph.value;
    const face = Math.min(1, Math.max(0, 1 - Math.abs(m)) + Math.max(0, 1 - Math.abs(m - 8)));
    const sway = 1 - face;

    // Ease the pointer so the tilt never jerks.
    this.pointer.lerp(this.pointerTarget, 1 - Math.pow(0.001, delta));
    // A slow sway rather than a full turn, so flat shapes (the heartbeat, the device field) never go edge-on.
    this.spin.rotation.y = Math.sin(time * 0.16) * 0.38 * sway + this.pointer.x * (0.35 - 0.2 * face);
    this.spin.rotation.x = -this.pointer.y * (0.22 - 0.1 * face);

    u.uMouseForce.value += ((this.hasPointer ? 1 : 0) - u.uMouseForce.value) * Math.min(1, delta * 4);
    if (this.hasPointer) {
      this.ray.set(this.pointerTarget.x, this.pointerTarget.y, 0.5).applyMatrix4(this.camera.projectionMatrixInverse);
      u.uMouseRay.value.copy(this.ray);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
