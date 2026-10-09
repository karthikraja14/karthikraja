// Point-cloud shapes the particle field morphs between, one per part of the page.
// Every function returns a Float32Array of xyz triples, all with the same count,
// so the shader can blend from one shape to the next point-for-point.
// Order down the page: portrait, dust, globe, device field, coil, ring, heartbeat, blocks, portrait.

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

function rotate(arr, rx = 0, ry = 0, rz = 0) {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);
  for (let i = 0; i < arr.length; i += 3) {
    let x = arr[i], y = arr[i + 1], z = arr[i + 2];
    // X axis
    let y1 = y * cx - z * sx, z1 = y * sx + z * cx;
    y = y1; z = z1;
    // Y axis
    let x1 = x * cy + z * sy; z1 = -x * sy + z * cy;
    x = x1; z = z1;
    // Z axis
    x1 = x * cz - y * sz; y1 = x * sz + y * cz;
    arr[i] = x1; arr[i + 1] = y1; arr[i + 2] = z;
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Karthik's face, as a halftone grid of dots.
// `map` is the RGBA pixel data of portrait-map.png: RGB is the colour of the dot,
// A is its size (0 means no dot there). Dots sit on a hexagonal grid sized so the
// number of visible dots roughly equals `count`; leftover particles hide (size 0)
// and only appear once the field changes into another shape.
// Returns positions plus a colour+size array (rgba per particle).
export const PORTRAIT_SIZE = 4.8; // width and height in scene units

export function portrait(count, rand, map, mapSize) {
  const sample = (u, v) => {
    const x = Math.min(mapSize - 1, Math.max(0, Math.floor(u * mapSize)));
    const y = Math.min(mapSize - 1, Math.max(0, Math.floor(v * mapSize)));
    const i = (y * mapSize + x) * 4;
    return [map[i], map[i + 1], map[i + 2], map[i + 3]];
  };
  const cellsFor = (G) => {
    const pitch = 1 / G, rowH = pitch * 0.866, cells = [];
    for (let r = 0, v = rowH / 2; v < 1; r++, v += rowH) {
      for (let u = (r % 2 ? pitch : pitch / 2); u < 1; u += pitch) {
        const px = sample(u, v);
        if (px[3] > 8) cells.push([u, v, px]);
      }
    }
    return cells;
  };
  // Largest grid whose visible dots still fit in `count`.
  let G = 60, cells = cellsFor(G);
  for (let g = 70; g <= 320; g += 6) {
    const c = cellsFor(g);
    if (c.length > count) break;
    G = g; cells = c;
  }
  if (!cells.length) cells = [[0.5, 0.5, [0, 0, 0, 0]]]; // empty map: nothing to draw
  const pos = new Float32Array(count * 3);
  const rgba = new Float32Array(count * 4);
  const S = PORTRAIT_SIZE;
  for (let i = 0; i < count; i++) {
    let u, v, px, visible = i < cells.length;
    if (visible) [u, v, px] = cells[i];
    else { [u, v] = cells[Math.floor(rand() * cells.length)]; px = [0, 0, 0, 0]; }
    // Gentle 3D relief: the face and chest bulge toward the viewer, so tilting shows depth.
    const fx = (u - 0.49) / 0.21, fy = (v - 0.36) / 0.28;
    const tx = (u - 0.5) / 0.5, ty = (v - 1.0) / 0.5;
    const z = 0.75 * Math.sqrt(Math.max(0, 1 - fx * fx - fy * fy))
            + 0.4 * Math.sqrt(Math.max(0, 1 - tx * tx - ty * ty))
            + (px[3] / 255 - 0.5) * 0.12;
    pos[i * 3] = (u - 0.5) * S;
    pos[i * 3 + 1] = -(v - 0.5) * S;
    pos[i * 3 + 2] = z - 0.3;
    rgba[i * 4] = px[0] / 255; rgba[i * 4 + 1] = px[1] / 255; rgba[i * 4 + 2] = px[2] / 255;
    rgba[i * 4 + 3] = visible ? px[3] / 255 : 0;
  }
  return { pos, rgba, pitch: S / G };
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

// ANSR MedTech, a global capability centre: a globe drawn with latitude and longitude lines.
export function globe(count, rand) {
  const out = new Float32Array(count * 3);
  const R = 2.05, meridians = 14, parallels = 9;
  for (let i = 0; i < count; i++) {
    const pick = rand();
    let lat, lon;
    if (pick < 0.45) { lon = (Math.floor(rand() * meridians) / meridians) * Math.PI * 2; lat = (rand() - 0.5) * Math.PI; }
    else if (pick < 0.85) { lat = ((Math.floor(rand() * parallels) + 1) / (parallels + 1) - 0.5) * Math.PI; lon = rand() * Math.PI * 2; }
    else { lat = Math.asin(rand() * 2 - 1); lon = rand() * Math.PI * 2; }
    const r = R * (pick < 0.85 ? 1 : 0.98 + rand() * 0.04);
    out[i * 3] = Math.cos(lat) * Math.cos(lon) * r;
    out[i * 3 + 1] = Math.sin(lat) * r;
    out[i * 3 + 2] = Math.cos(lat) * Math.sin(lon) * r;
  }
  return rotate(out, 0.38, 0, 0.22);
}

// LTTS for Baxter, peritoneal dialysis: a coiled tube, like the fluid line of a home dialysis machine.
export function coil(count, rand) {
  const out = new Float32Array(count * 3);
  const L = 6.4, R = 1.15, turns = 4.5, tube = 0.28;
  for (let i = 0; i < count; i++) {
    const t = rand();
    const a = t * turns * Math.PI * 2;
    // A point near the surface of the tube around the coil's centre line.
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2, r = tube * (0.75 + rand() * 0.25);
    const k = Math.sqrt(1 - u * u);
    out[i * 3] = (t - 0.5) * L + k * Math.cos(th) * r;
    out[i * 3 + 1] = Math.cos(a) * R + k * Math.sin(th) * r;
    out[i * 3 + 2] = Math.sin(a) * R + u * r;
  }
  return rotate(out, 0.25, -0.35, 0.18);
}

// Apollo and Vijaya hospitals: a heartbeat trace stretched into a ribbon, like a patient monitor.
export function ecg(t) {
  const g = (c, w, a) => a * Math.exp(-(((t - c) / w) ** 2));
  return g(0.18, 0.035, 0.12) + g(0.37, 0.012, -0.12) + g(0.4, 0.012, 1.0) + g(0.43, 0.014, -0.25) + g(0.65, 0.06, 0.3);
}

export function signal(count, rand) {
  const out = new Float32Array(count * 3);
  const X0 = -4.8, X1 = 4.8, beats = 2.6, amp = 1.55;
  // Sample the curve densely, then place points evenly along its length so the sharp spike stays filled in.
  const N = 4000;
  const xs = new Float32Array(N), ys = new Float32Array(N), cum = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = X0 + (X1 - X0) * (i / (N - 1));
    const t = (((x - X0) / (X1 - X0)) * beats) % 1;
    xs[i] = x; ys[i] = ecg(t) * amp - 0.25;
    if (i) cum[i] = cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
  }
  const total = cum[N - 1];
  const strands = 34;
  for (let i = 0; i < count; i++) {
    const target = rand() * total;
    let lo = 0, hi = N - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < target) lo = mid + 1; else hi = mid; }
    const s = Math.floor(rand() * strands);
    const zn = s / (strands - 1) - 0.5; // -0.5 .. 0.5
    const fall = Math.exp(-((zn / 0.32) ** 2)); // strands fade in height toward the edges
    out[i * 3] = xs[lo] + (rand() - 0.5) * 0.02;
    out[i * 3 + 1] = (ys[lo] + 0.25) * (0.35 + 0.65 * fall) - 0.25 + (rand() - 0.5) * 0.02;
    out[i * 3 + 2] = zn * 1.5;
  }
  return rotate(out, 0.22, -0.28, 0);
}

// Johnson & Johnson: a tilted field of evenly spaced points, the 75,000 simulated devices.
export function fleet(count, rand) {
  const out = new Float32Array(count * 3);
  const W = 11, D = 6.6;
  const cols = Math.ceil(Math.sqrt((count * W) / D));
  const rows = Math.ceil(count / cols);
  for (let i = 0; i < count; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    out[i * 3] = (c / (cols - 1) - 0.5) * W + (rand() - 0.5) * 0.008;
    out[i * 3 + 1] = 0;
    out[i * 3 + 2] = (r / Math.max(1, rows - 1) - 0.5) * D;
  }
  rotate(out, 0.62, 0, 0);
  for (let i = 1; i < out.length; i += 3) out[i] -= 0.35;
  return out;
}

// Vystra Build: twelve stacked blocks for its 12+ modules (it's a construction product).
export function blocks(count, rand) {
  const out = new Float32Array(count * 3);
  const u = 0.95, s = 0.84;
  const cells = [];
  for (const x of [-1, 0, 1]) for (const z of [-0.5, 0.5]) cells.push([x, 0, z]);
  for (const x of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) cells.push([x, 1, z]);
  for (const z of [-0.5, 0.5]) cells.push([0, 2, z]);
  const corners = [-0.5, 0.5];
  const edges = [];
  for (const a of corners) for (const b of corners) {
    edges.push([[-0.5, a, b], [0.5, a, b]]);
    edges.push([[a, -0.5, b], [a, 0.5, b]]);
    edges.push([[a, b, -0.5], [a, b, 0.5]]);
  }
  for (let i = 0; i < count; i++) {
    const [cx, cy, cz] = cells[i % cells.length];
    let px, py, pz;
    if (rand() < 0.68) {
      const [p0, p1] = edges[Math.floor(rand() * edges.length)];
      const t = rand();
      px = p0[0] + (p1[0] - p0[0]) * t; py = p0[1] + (p1[1] - p0[1]) * t; pz = p0[2] + (p1[2] - p0[2]) * t;
    } else {
      const axis = Math.floor(rand() * 3), side = rand() < 0.5 ? -0.5 : 0.5;
      const a = rand() - 0.5, b = rand() - 0.5;
      [px, py, pz] = axis === 0 ? [side, a, b] : axis === 1 ? [a, side, b] : [a, b, side];
    }
    out[i * 3] = (cx * u + px * s) * 1.18;
    out[i * 3 + 1] = (cy * u - u + py * s) * 1.18;
    out[i * 3 + 2] = (cz * u + pz * s) * 1.18;
  }
  return rotate(out, 0.38, 0.62, 0);
}

// Fresenius, hemodialysis: a closed ring, like the loop that carries blood out and back.
export function ring(count, rand) {
  const out = new Float32Array(count * 3);
  const R = 2.15, r = 0.36;
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, b = rand() * Math.PI * 2;
    const rr = r * (0.75 + rand() * 0.3);
    out[i * 3] = (R + rr * Math.cos(b)) * Math.cos(a);
    out[i * 3 + 1] = (R + rr * Math.cos(b)) * Math.sin(a);
    out[i * 3 + 2] = rr * Math.sin(b);
  }
  return rotate(out, 1.05, 0.25, 0);
}
