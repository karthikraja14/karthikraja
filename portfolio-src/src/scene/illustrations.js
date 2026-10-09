// Line drawings of the kind of product Karthik worked on at each company.
// These are simple, original illustrations of a product *type* (a surgical robot arm,
// a dialysis machine and so on), not copies of any company's actual design.
//
// Each function draws in white on a canvas already scaled to scene units, inside a
// box DISPLAY_W × DISPLAY_H (3.6 × 2.5). shapes.js then turns the drawing into dots:
// strong strokes become full-size lit dots, faint fills become smaller dots (shading).

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Fill the current path faintly, then stroke it at full strength.
function paint(ctx, { fill = 0, stroke = 1, lw = 0.06 } = {}) {
  if (fill) { ctx.globalAlpha = fill; ctx.fill(); }
  if (stroke) { ctx.globalAlpha = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  ctx.globalAlpha = 1;
}

function line(ctx, pts, lw = 0.05, alpha = 1, dash = null) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (dash) ctx.setLineDash(dash);
  ctx.globalAlpha = alpha; ctx.lineWidth = lw; ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;
}

function circle(ctx, x, y, r, opts) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); paint(ctx, opts);
}

// A hollow, rounded limb with a faintly shaded inside (robot arm segments).
function limb(ctx, x1, y1, x2, y2, w) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.lineWidth = w; ctx.stroke();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = w - 0.12; ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.32; ctx.stroke(); ctx.globalAlpha = 1;
}

// One heartbeat, t from 0 to 1 (P wave, QRS spike, T wave).
function beat(t) {
  const g = (c, w, a) => a * Math.exp(-(((t - c) / w) ** 2));
  return g(0.18, 0.035, 0.12) + g(0.37, 0.012, -0.12) + g(0.4, 0.012, 1.0) + g(0.43, 0.014, -0.25) + g(0.65, 0.06, 0.3);
}

// Text at a size given in scene units (drawn at 100× and scaled down, since tiny font sizes are unreliable).
function label(ctx, str, x, y, size, weight, font, alpha = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(0.01, 0.01);
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `${weight} ${size * 100}px ${font}, Arial, sans-serif`;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}

function trace(ctx, x0, x1, base, amp, f, lw, alpha) {
  const pts = [];
  for (let i = 0; i <= 260; i++) {
    const u = i / 260;
    pts.push([x0 + (x1 - x0) * u, base - f(u) * amp]);
  }
  line(ctx, pts, lw, alpha);
}

// ANSR MedTech: connected care. A phone app, the cloud and a body-worn sensor, linked by data.
export function connectedCare(ctx) {
  rr(ctx, 0.4, 0.22, 1.0, 2.06, 0.16); paint(ctx, { fill: 0.1, lw: 0.07 });
  rr(ctx, 0.5, 0.42, 0.8, 1.6, 0.06); paint(ctx, { fill: 0.26, stroke: 0 });
  line(ctx, [[0.78, 0.32], [1.02, 0.32]], 0.04);
  trace(ctx, 0.56, 1.24, 1.0, 0.36, (u) => beat((u * 2) % 1), 0.045, 1);
  rr(ctx, 0.58, 1.3, 0.28, 0.28, 0.05); paint(ctx, { fill: 0.7, stroke: 0 });
  rr(ctx, 0.94, 1.3, 0.28, 0.28, 0.05); paint(ctx, { fill: 0.7, stroke: 0 });
  rr(ctx, 0.58, 1.68, 0.64, 0.1, 0.04); paint(ctx, { fill: 0.7, stroke: 0 });

  ctx.beginPath();
  ctx.moveTo(2.3, 1.05);
  ctx.bezierCurveTo(2.05, 1.05, 2.05, 0.7, 2.34, 0.7);
  ctx.bezierCurveTo(2.36, 0.4, 2.76, 0.3, 2.9, 0.58);
  ctx.bezierCurveTo(3.06, 0.44, 3.36, 0.56, 3.28, 0.8);
  ctx.bezierCurveTo(3.48, 0.84, 3.46, 1.05, 3.26, 1.05);
  ctx.closePath();
  paint(ctx, { fill: 0.3, lw: 0.06 });

  ctx.setLineDash([0.05, 0.06]);
  circle(ctx, 2.85, 1.88, 0.46, { stroke: 0.8, lw: 0.04 });
  ctx.setLineDash([]);
  circle(ctx, 2.85, 1.88, 0.3, { fill: 0.35, lw: 0.06 });
  circle(ctx, 2.85, 1.88, 0.08, { fill: 1, stroke: 0 });

  const dash = [0.04, 0.07];
  ctx.setLineDash(dash); ctx.lineWidth = 0.04;
  ctx.beginPath(); ctx.moveTo(1.48, 0.85); ctx.quadraticCurveTo(1.8, 0.55, 2.12, 0.86); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.85, 1.12); ctx.lineTo(2.85, 1.36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.36, 1.9); ctx.quadraticCurveTo(1.9, 2.1, 1.48, 1.75); ctx.stroke();
  ctx.setLineDash([]);
}

// Johnson & Johnson: the Digital Surgery Platform. Operating-room devices (a robot arm,
// an imaging cart, a laptop, an energy console) all linked through one platform hub to the cloud.
export function connectedOR(ctx, font) {
  // Platform hub in the middle, labelled DSP (Digital Surgery Platform).
  rr(ctx, 1.42, 0.92, 0.76, 0.66, 0.1); paint(ctx, { fill: 0.3, lw: 0.07 });
  label(ctx, 'DSP', 1.5, 1.37, 0.32, 800, font);

  // Cloud above the hub.
  ctx.beginPath();
  ctx.moveTo(1.5, 0.5);
  ctx.bezierCurveTo(1.32, 0.5, 1.32, 0.28, 1.52, 0.28);
  ctx.bezierCurveTo(1.55, 0.08, 1.85, 0.04, 1.93, 0.22);
  ctx.bezierCurveTo(2.06, 0.12, 2.3, 0.2, 2.24, 0.36);
  ctx.bezierCurveTo(2.38, 0.4, 2.34, 0.5, 2.2, 0.5);
  ctx.closePath();
  paint(ctx, { fill: 0.3, lw: 0.05 });

  // Links: hub to cloud and hub to each device, with a node dot at every end.
  const links = [
    [[1.8, 0.92], [1.8, 0.52]],
    [[1.42, 1.0], [1.02, 0.62]],
    [[1.42, 1.5], [0.98, 1.78]],
    [[2.18, 1.0], [2.6, 0.66]],
    [[2.18, 1.5], [2.6, 1.8]],
  ];
  links.forEach(([a, b]) => {
    line(ctx, [a, b], 0.035, 1, [0.05, 0.05]);
    circle(ctx, a[0], a[1], 0.045, { fill: 1, stroke: 0 });
    circle(ctx, b[0], b[1], 0.045, { fill: 1, stroke: 0 });
  });

  // Top left: a small surgical robot arm.
  rr(ctx, 0.22, 0.86, 0.46, 0.12, 0.03); paint(ctx, { fill: 0.5, lw: 0.035 });
  line(ctx, [[0.42, 0.86], [0.42, 0.56], [0.72, 0.3], [0.96, 0.5]], 0.07);
  [[0.42, 0.56], [0.72, 0.3]].forEach(([x, y]) => circle(ctx, x, y, 0.07, { fill: 0.6, lw: 0.035 }));
  line(ctx, [[0.96, 0.5], [0.98, 0.66]], 0.035);

  // Bottom left: an imaging cart with its screen.
  rr(ctx, 0.25, 1.5, 0.72, 0.5, 0.05); paint(ctx, { fill: 0.25, lw: 0.05 });
  trace(ctx, 0.33, 0.89, 1.78, 0.16, (u) => Math.sin(u * Math.PI * 4) * 0.5 + 0.5, 0.03, 0.9);
  line(ctx, [[0.61, 2.0], [0.61, 2.28]], 0.05);
  line(ctx, [[0.34, 2.3], [0.88, 2.3]], 0.05);
  circle(ctx, 0.38, 2.36, 0.04, { fill: 1, stroke: 0 });
  circle(ctx, 0.84, 2.36, 0.04, { fill: 1, stroke: 0 });

  // Top right: a laptop.
  rr(ctx, 2.62, 0.3, 0.68, 0.44, 0.04); paint(ctx, { fill: 0.25, lw: 0.05 });
  [0.42, 0.52, 0.62].forEach((y, i) => line(ctx, [[2.72, y], [2.72 + [0.4, 0.3, 0.46][i], y]], 0.03));
  rr(ctx, 2.52, 0.76, 0.88, 0.07, 0.03); paint(ctx, { fill: 0.7, stroke: 0 });

  // Bottom right: an energy console with a handheld instrument on its cable.
  rr(ctx, 2.62, 1.6, 0.66, 0.46, 0.06); paint(ctx, { fill: 0.2, lw: 0.05 });
  rr(ctx, 2.7, 1.68, 0.3, 0.16, 0.03); paint(ctx, { fill: 0.6, stroke: 0 });
  circle(ctx, 3.12, 1.76, 0.06, { fill: 0.8, stroke: 0 });
  [2.74, 2.88, 3.02].forEach((x) => circle(ctx, x, 1.96, 0.035, { fill: 1, stroke: 0 }));
  ctx.lineWidth = 0.03;
  ctx.beginPath(); ctx.moveTo(3.28, 1.9); ctx.bezierCurveTo(3.5, 1.95, 3.45, 2.3, 3.2, 2.3); ctx.stroke();
  line(ctx, [[3.2, 2.3], [2.9, 2.36]], 0.06);
}

// L&T Technology Services, for Baxter: home peritoneal dialysis. A bedside machine,
// the warmed solution bag on top, and the drain bag beside it.
export function homeDialysis(ctx) {
  rr(ctx, 0.3, 2.05, 3.0, 0.1, 0.03); paint(ctx, { fill: 0.5, lw: 0.04 });
  line(ctx, [[0.5, 2.15], [0.5, 2.42]], 0.05);
  line(ctx, [[3.1, 2.15], [3.1, 2.42]], 0.05);
  rr(ctx, 0.85, 1.05, 1.7, 1.0, 0.12); paint(ctx, { fill: 0.16, lw: 0.07 });
  rr(ctx, 0.95, 0.7, 1.5, 0.32, 0.15); paint(ctx, { fill: 0.35, lw: 0.05 });
  ctx.beginPath(); ctx.rect(2.45, 0.8, 0.12, 0.1); paint(ctx, { fill: 0.8, stroke: 0 });
  rr(ctx, 1.0, 1.2, 0.75, 0.45, 0.05); paint(ctx, { fill: 0.35, lw: 0.04 });
  line(ctx, [[1.08, 1.32], [1.5, 1.32]], 0.04);
  line(ctx, [[1.08, 1.44], [1.62, 1.44]], 0.04);
  line(ctx, [[1.08, 1.56], [1.4, 1.56]], 0.04);
  [1.15, 1.35, 1.55].forEach((x) => circle(ctx, x, 1.84, 0.06, { fill: 1, stroke: 0 }));
  rr(ctx, 1.9, 1.18, 0.52, 0.7, 0.06); paint(ctx, { fill: 0.14, lw: 0.05 });
  line(ctx, [[2.0, 1.78], [2.32, 1.78]], 0.05);
  ctx.lineWidth = 0.045;
  ctx.beginPath(); ctx.moveTo(2.57, 0.85); ctx.bezierCurveTo(2.98, 0.85, 2.98, 1.05, 2.96, 1.32); ctx.stroke();
  rr(ctx, 2.75, 1.32, 0.42, 0.62, 0.12); paint(ctx, { fill: 0.35, lw: 0.05 });
  ctx.lineWidth = 0.045;
  ctx.beginPath(); ctx.moveTo(0.85, 1.5); ctx.bezierCurveTo(0.55, 1.5, 0.55, 1.15, 0.32, 1.1); ctx.stroke();
}

// Fresenius Medical Care: hemodialysis. A clinic machine with its screen, blood pumps,
// filter (dialyser) on the side and a saline bag on the pole.
export function hemodialysis(ctx) {
  line(ctx, [[0.4, 2.42], [3.2, 2.42]], 0.03, 0.6);
  line(ctx, [[1.0, 0.25], [1.0, 2.32]], 0.05);
  ctx.lineWidth = 0.04; ctx.beginPath(); ctx.arc(1.0, 0.28, 0.07, Math.PI, 0); ctx.stroke();
  rr(ctx, 0.8, 0.36, 0.38, 0.5, 0.1); paint(ctx, { fill: 0.35, lw: 0.045 });
  ctx.lineWidth = 0.035; ctx.beginPath(); ctx.moveTo(0.99, 0.86); ctx.bezierCurveTo(0.99, 1.1, 1.2, 1.15, 1.38, 1.18); ctx.stroke();

  rr(ctx, 1.3, 0.15, 1.25, 0.78, 0.08); paint(ctx, { fill: 0.12, lw: 0.07 });
  rr(ctx, 1.4, 0.25, 1.05, 0.58, 0.04); paint(ctx, { fill: 0.3, stroke: 0 });
  [0.32, 0.22, 0.4, 0.28, 0.36, 0.18, 0.3].forEach((h, i) => {
    const x = 1.52 + i * 0.13;
    line(ctx, [[x, 0.76], [x, 0.76 - h]], 0.06);
  });
  ctx.beginPath(); ctx.rect(1.82, 0.93, 0.22, 0.12); paint(ctx, { fill: 0.5, stroke: 0 });
  rr(ctx, 1.38, 1.05, 1.1, 1.15, 0.08); paint(ctx, { fill: 0.14, lw: 0.07 });
  [[1.68, 1.36], [2.18, 1.36]].forEach(([x, y]) => {
    circle(ctx, x, y, 0.17, { fill: 0.25, lw: 0.05 });
    line(ctx, [[x - 0.13, y], [x + 0.13, y]], 0.04);
    line(ctx, [[x, y - 0.13], [x, y + 0.13]], 0.04);
  });
  rr(ctx, 1.5, 1.66, 0.86, 0.22, 0.04); paint(ctx, { fill: 0.4, lw: 0.04 });
  rr(ctx, 2.62, 1.0, 0.16, 0.85, 0.08); paint(ctx, { fill: 0.45, lw: 0.05 });
  [1.2, 1.4, 1.6].forEach((y) => line(ctx, [[2.64, y], [2.76, y]], 0.03));
  ctx.lineWidth = 0.04;
  ctx.beginPath(); ctx.moveTo(2.18, 1.19); ctx.bezierCurveTo(2.25, 0.98, 2.55, 0.92, 2.7, 1.0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.7, 1.85); ctx.bezierCurveTo(2.6, 2.0, 2.3, 1.75, 2.18, 1.53); ctx.stroke();
  rr(ctx, 1.3, 2.2, 1.26, 0.1, 0.04); paint(ctx, { fill: 0.6, stroke: 0 });
  circle(ctx, 1.45, 2.34, 0.06, { fill: 1, stroke: 0 });
  circle(ctx, 2.42, 2.34, 0.06, { fill: 1, stroke: 0 });
}

// Apollo and Vijaya hospitals: a bedside patient monitor showing heartbeat (ECG),
// blood oxygen and breathing traces, with heart rate and oxygen readings.
export function patientMonitor(ctx, font) {
  rr(ctx, 0.35, 0.25, 2.9, 1.75, 0.14); paint(ctx, { fill: 0.1, lw: 0.08 });
  rr(ctx, 0.5, 0.4, 2.6, 1.45, 0.06); paint(ctx, { fill: 0.2, stroke: 0 });
  trace(ctx, 0.62, 2.2, 0.86, 0.34, (u) => beat((u * 3) % 1), 0.05, 1);
  trace(ctx, 0.62, 2.2, 1.34, 0.12, (u) => Math.max(0, Math.sin(u * Math.PI * 6)) ** 1.6, 0.04, 0.9);
  trace(ctx, 0.62, 2.2, 1.66, 0.07, (u) => Math.sin(u * Math.PI * 3), 0.035, 0.65);
  line(ctx, [[2.3, 0.5], [2.3, 1.75]], 0.02, 0.5);
  label(ctx, 'HR', 2.42, 0.6, 0.12, 700, font, 0.85);
  label(ctx, 'SpO2', 2.42, 1.16, 0.12, 700, font, 0.85);
  label(ctx, '72', 2.42, 1.02, 0.46, 800, font);
  label(ctx, '98', 2.42, 1.5, 0.34, 800, font);
  ctx.beginPath(); ctx.rect(1.65, 2.0, 0.3, 0.18); paint(ctx, { fill: 0.45, stroke: 0 });
  rr(ctx, 1.25, 2.18, 1.1, 0.1, 0.04); paint(ctx, { fill: 0.6, stroke: 0 });
}

// Vystra Build: construction. A tower crane lowering a beam onto a building going up.
export function construction(ctx) {
  line(ctx, [[0.2, 2.4], [3.4, 2.4]], 0.04);
  line(ctx, [[0.85, 2.4], [0.85, 0.5]], 0.04);
  line(ctx, [[1.05, 2.4], [1.05, 0.5]], 0.04);
  const zig = [];
  for (let y = 2.4, s = 0; y > 0.5; y -= 0.18, s ^= 1) zig.push([s ? 1.05 : 0.85, y]);
  line(ctx, zig, 0.025, 0.85);
  line(ctx, [[0.35, 0.38], [3.25, 0.38]], 0.04);
  line(ctx, [[0.35, 0.5], [3.25, 0.5]], 0.04);
  const jib = [];
  for (let x = 1.05, s = 0; x < 3.25; x += 0.16, s ^= 1) jib.push([x, s ? 0.38 : 0.5]);
  line(ctx, jib, 0.025, 0.85);
  line(ctx, [[0.85, 0.38], [0.95, 0.12], [1.05, 0.38]], 0.035);
  line(ctx, [[0.95, 0.12], [2.6, 0.38]], 0.025, 0.8);
  line(ctx, [[0.95, 0.12], [0.4, 0.38]], 0.025, 0.8);
  rr(ctx, 0.35, 0.5, 0.36, 0.22, 0.03); paint(ctx, { fill: 0.6, stroke: 0 });
  rr(ctx, 1.06, 0.5, 0.18, 0.16, 0.02); paint(ctx, { fill: 0.5, stroke: 0 });
  ctx.beginPath(); ctx.rect(2.54, 0.5, 0.16, 0.06); paint(ctx, { fill: 0.9, stroke: 0 });
  line(ctx, [[2.62, 0.56], [2.62, 1.02]], 0.025);
  ctx.lineWidth = 0.035; ctx.beginPath(); ctx.arc(2.62, 1.06, 0.05, -Math.PI * 0.5, Math.PI); ctx.stroke();
  line(ctx, [[2.62, 1.06], [2.36, 1.16]], 0.02, 0.8);
  line(ctx, [[2.62, 1.06], [2.88, 1.16]], 0.02, 0.8);
  rr(ctx, 2.3, 1.16, 0.64, 0.09, 0.02); paint(ctx, { fill: 0.85, stroke: 0 });
  [1.65, 2.15, 2.65, 3.15].forEach((x) => line(ctx, [[x, 1.45], [x, 2.4]], 0.05));
  [1.45, 1.77, 2.08].forEach((y) => line(ctx, [[1.65, y], [3.15, y]], 0.05));
  [[1.65, 2.08], [2.15, 2.08], [2.65, 2.08], [1.65, 1.77], [2.15, 1.77]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.rect(x + 0.06, y + 0.06, 0.38, 0.2); paint(ctx, { fill: 0.3, stroke: 0 });
  });
  line(ctx, [[2.65, 1.45], [3.15, 1.77]], 0.03, 0.8);
}
