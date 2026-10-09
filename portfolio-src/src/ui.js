import gsap from 'gsap';

// Custom cursor: a small ring that grows into an amber disc with a label over links.
export function initCursor(onMove) {
  const cursor = document.querySelector('.cursor');
  const label = cursor.querySelector('.cursor-label');
  document.documentElement.classList.add('has-cursor');
  gsap.set(cursor, { opacity: 0 });
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  let shown = false;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!shown) { gsap.set(cursor, { x: e.clientX, y: e.clientY }); gsap.to(cursor, { opacity: 1, duration: 0.3 }); shown = true; }
    xTo(e.clientX); yTo(e.clientY);
    onMove?.(e);
  });
  document.addEventListener('pointerleave', () => { gsap.to(cursor, { opacity: 0, duration: 0.3 }); shown = false; });

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (!t) return;
    label.textContent = t.dataset.cursor;
    cursor.classList.add('is-big');
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (t && !t.contains(e.relatedTarget)) cursor.classList.remove('is-big');
  });
}

// Buttons that lean toward the pointer.
export function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.38);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

// Live time in Bengaluru, top right.
export function initClock() {
  const el = document.querySelector('.clock-time');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () => { el.textContent = `${fmt.format(new Date())} IST`; };
  tick();
  setInterval(tick, 15000);
}

// Copy email, with a manual fallback where the clipboard is blocked.
export function initCopy() {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  const original = btn.textContent;
  btn.addEventListener('click', () => {
    const email = btn.dataset.email;
    const done = (text) => {
      btn.textContent = text;
      btn.classList.add('is-done');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('is-done'); }, 2200);
    };
    const fallback = () => {
      const link = document.querySelector('.email-link');
      const range = document.createRange();
      range.selectNodeContents(link);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      done('Selected, press Ctrl+C');
    };
    try {
      navigator.clipboard.writeText(email).then(() => done('Copied'), fallback);
    } catch {
      fallback();
    }
  });
}

// The About card: tilts toward the pointer, and flips between the photo and the anime version.
export function initCard() {
  const card = document.getElementById('flip-card');
  if (!card) return;
  const set = (rx, ry, mx, my) => {
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
    card.style.setProperty('--mx', `${mx}%`);
    card.style.setProperty('--my', `${my}%`);
  };
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.classList.add('is-tracking');
    set((0.5 - py) * 18, (px - 0.5) * 22, px * 100, py * 100);
  });
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-tracking');
    set(0, 0, 50, 50);
  });
  card.addEventListener('click', () => {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(flipped));
    card.setAttribute('aria-label', flipped ? 'Flip the card back to the photo' : 'Flip the card to see the anime version of Karthik');
  });
}
