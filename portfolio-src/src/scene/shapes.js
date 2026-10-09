// Point-cloud shapes the particle field morphs between, one per part of the page.
// Every shape uses the same number of particles, so the shader can blend from one
// shape to the next point-for-point.
//
// Order down the page:
//   0 portrait · 1 dust · 2–7 dot-matrix readouts (one per company, then Vystra Build) · 8 portrait again
//
// Sizes are dot diameters in scene units. A negative size marks an "unlit" dot on a
// readout's background grid (drawn small and dim); 0 means the particle is hidden.

export function seeded(seed = 1) {
  // Small deterministic random generator (mulberry32) so the shapes look the same on every load.
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Lays a hexagonal grid over the unit square and keeps the cells `keep(u, v)` accepts,
// using the finest grid whose kept cells still fit in `count`.
function hexCells(count, keep, minG = 40, maxG = 420) {
  const cellsFor = (G) => {
    const pitch = 1 / G, rowH = pitch * 0.866, out = [];
    for (let r = 0, v = rowH / 2; v < 1; r++, v += rowH) {
      for (let u = (r % 2 ? pitch : pitch / 2); u < 1; u += pitch) {
        const k = keep(u, v);
        if (k) out.push([u, v, k]);
      }
    }
    return out;
  };
  let G = minG, cells = cellsFor(G);
  for (let g = minG + 6; g <= maxG; g += 6) {
    const c = cellsFor(g);
    if (c.length > count) break;
    G = g; cells = c;
  }
  return { G, cells };
}

// ---------------------------------------------------------------------------
// Karthik's face, as a halftone grid of dots.
// `map` is the RGBA pixel data of portrait-map.png: RGB is the colour of the dot,
// A is its size (0 means no dot there).
// Returns positions plus colour+size per particle (rgba, size in scene units).
export const PORTRAIT_SIZE = 4.9; // width and height in scene units

export function portrait(count, rand, map, mapSize) {
  const sample = (u, v) => {
    const x = Math.min(mapSize - 1, Math.floor(u * mapSize));
    const y = Math.min(mapSize - 1, Math.floor(v * mapSize));
    const i = (y * mapSize + x) * 4;
    return map[i + 3] > 8 ? [map[i], map[i + 1], map[i + 2], map[i + 3]] : null;
  };
  let { G, cells } = hexCells(count, sample, 60, 360);
  if (!cells.length) cells = [[0.5, 0.5, [0, 0, 0, 0]]]; // empty map: nothing to draw
  const S = PORTRAIT_SIZE, pitch = S / G;
  const pos = new Float32Array(count * 3);
  const rgba = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const visible = i < cells.length;
    const [u, v, px] = visible ? cells[i] : cells[Math.floor(rand() * cells.length)];
    // A very gentle bulge toward the viewer: enough depth to feel 3D when tilted,
    // not so much that perspective smears the face.
    const fx = (u - 0.495) / 0.28, fy = (v - 0.47) / 0.37;
    const tx = (u - 0.507) / 0.667, ty = (v - 1.32) / 0.667;
    const z = 0.22 * Math.sqrt(Math.max(0, 1 - fx * fx - fy * fy))
            + 0.1 * Math.sqrt(Math.max(0, 1 - tx * tx - ty * ty));
    pos[i * 3] = (u - 0.5) * S;
    pos[i * 3 + 1] = -(v - 0.5) * S;
    pos[i * 3 + 2] = z - 0.1;
    rgba[i * 4] = px[0] / 255; rgba[i * 4 + 1] = px[1] / 255; rgba[i * 4 + 2] = px[2] / 255;
    rgba[i * 4 + 3] = visible ? (px[3] / 255) * pitch * 1.2 : 0;
  }
  return { pos, rgba };
}

// The face breaks apart into slow-drifting dust.
export function dust(count, rand) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = (rand() - 0.5) * 15;
    out[i * 3 + 1] = (rand() - 0.5) * 9;
    out[i * 3 + 2] = (rand() - 0.5) * 6 - 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// A dot-matrix readout, like the display on a dialysis machine or infusion pump.
// The text is drawn in Archivo, then sampled onto a hex grid of dots: lit dots form
// the characters, small unlit dots fill a soft-edged panel behind them.
export const DISPLAY_W = 3.6;
export const DISPLAY_H = 2.5;

export function dotDisplay(text, count, rand, { pitch = 0.034, font = 'Archivo' } = {}) {
  const W = DISPLAY_W, H = DISPLAY_H, PX = 220; // canvas pixels per scene unit
  const cw = Math.round(W * PX), ch = Math.round(H * PX);
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // Condensed digits read taller, like a device display.
  if ('fontStretch' in ctx) ctx.fontStretch = 'condensed';
  let fs = ch;
  ctx.font = `800 ${fs}px ${font}, 'Arial Narrow', Arial, sans-serif`;
  const m = ctx.measureText(text);
  const glyphH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || fs * 0.72;
  fs *= Math.min((cw * 0.86) / m.width, (ch * 0.7) / glyphH);
  ctx.font = `800 ${fs}px ${font}, 'Arial Narrow', Arial, sans-serif`;
  const m2 = ctx.measureText(text);
  const asc = m2.actualBoundingBoxAscent || fs * 0.72, desc = m2.actualBoundingBoxDescent || 0;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, cw / 2, ch / 2 + (asc - desc) / 2);
  const alpha = ctx.getImageData(0, 0, cw, ch).data;
  const lit = (x, y) => alpha[(Math.min(ch - 1, Math.max(0, Math.round(y))) * cw + Math.min(cw - 1, Math.max(0, Math.round(x)))) * 4 + 3];

  // Hex grid over the panel in scene units, at the requested spacing (coarser if count is too small).
  let p = Math.max(pitch, Math.sqrt((W * H) / (count * 0.866)));
  const cells = [];
  const build = () => {
    cells.length = 0;
    const rowH = p * 0.866;
    for (let r = 0, y = rowH / 2; y < H; r++, y += rowH) {
      for (let x = (r % 2 ? p : p / 2); x < W; x += p) {
        // Soft rounded panel: unlit dots shrink toward the edges and vanish outside.
        const nx = (x / W) * 2 - 1, ny = (y / H) * 2 - 1;
        const e = Math.pow(Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4), 0.25);
        const panel = Math.min(1, Math.max(0, (1.0 - e) / 0.3));
        const on = lit(x * PX, y * PX) > 127;
        if (!on && panel < 0.05) continue;
        // A faint top-to-bottom gradient on lit dots, like a backlit segment.
        const shade = 0.82 + 0.18 * (1 - y / H);
        cells.push([x - W / 2, -(y - H / 2), on ? p * 0.92 * shade : -p * 0.3 * panel]);
      }
    }
  };
  build();
  while (cells.length > count) { p *= 1.03; build(); }
  // Lit dots first so every character is complete, then the background grid.
  cells.sort((a, b) => (b[2] > 0) - (a[2] > 0));
  const litCells = cells.filter((c) => c[2] > 0);
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const c = i < cells.length ? cells[i] : litCells[Math.floor(rand() * litCells.length)] || [0, 0, 0];
    pos[i * 3] = c[0];
    pos[i * 3 + 1] = c[1];
    pos[i * 3 + 2] = 0;
    size[i] = i < cells.length ? c[2] : 0;
  }
  return { pos, size };
}
