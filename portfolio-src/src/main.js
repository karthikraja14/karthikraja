import './fonts.css';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { ParticleField } from './scene/ParticleField.js';
import { THEMES } from './themes.js';
import { initCursor, initMagnetic, initClock, initCopy, initCard } from './ui.js';
import { connectedCare, surgicalRobot, homeDialysis, hemodialysis, patientMonitor, construction } from './scene/illustrations.js';
import portraitMapUrl from './assets/portrait-map.png';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
root.classList.remove('no-js');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const narrow = () => window.innerWidth < 900;
if (reduced) root.classList.add('reduced');

// Always open on the intro, not halfway down from the last visit.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------------- Smooth scrolling (Lenis) wired into GSAP's clock ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------------- What each part of the page shows ---------------- */
// shape: which particle shape (see scene/shapes.js). theme: colour set (themes.js).
const STEPS = {
  hero: { shape: 0, theme: 'me' },
  about: { shape: 1, theme: 'me' },
  career: { shape: 1, theme: 'me' },
  ansr: { shape: 2, theme: 'ansr' },
  jnj: { shape: 3, theme: 'jnj' },
  ltts: { shape: 4, theme: 'ltts' },
  fresenius: { shape: 5, theme: 'fresenius' },
  apollo: { shape: 6, theme: 'apollo' },
  impact: { shape: 6, theme: 'me' },
  work: { shape: 7, theme: 'me' },
  tools: { shape: 7, theme: 'me' },
  contact: { shape: 8, theme: 'me' },
};

// Where the shape sits. x/y in scene units (about ±5 wide on desktop, ±2 on a phone), s = scale, o = opacity.
// Shapes 2–7 are dot-matrix drawings of the product from each role (see DRAWINGS).
const POSES = {
  wide: {
    hero: { x: 2.6, y: 0.1, s: 1, o: 1 },
    about: { x: 0, y: 0, s: 1, o: 0.5 },
    career: { x: 0, y: 0, s: 1, o: 0.55 },
    ansr: { x: 3.35, y: 0, s: 0.95, o: 1 },
    jnj: { x: 3.35, y: 0, s: 0.95, o: 1 },
    ltts: { x: 3.35, y: 0, s: 0.95, o: 1 },
    fresenius: { x: 3.35, y: 0, s: 0.95, o: 1 },
    apollo: { x: 3.35, y: 0, s: 0.95, o: 1 },
    impact: { x: 3.35, y: 0, s: 0.95, o: 0 },
    work: { x: 3.35, y: 0.1, s: 0.9, o: 1 },
    tools: { x: 3.35, y: 0, s: 0.9, o: 0.3 },
    contact: { x: 2.8, y: 0.1, s: 0.95, o: 1 },
  },
  narrow: {
    hero: { x: 0, y: 2.05, s: 0.78, o: 1 },
    about: { x: 0, y: 0, s: 0.7, o: 0.45 },
    career: { x: 0, y: 0, s: 0.7, o: 0.45 },
    ansr: { x: 0, y: 2.6, s: 0.85, o: 0.3 },
    jnj: { x: 0, y: 2.6, s: 0.85, o: 0.3 },
    ltts: { x: 0, y: 2.6, s: 0.85, o: 0.3 },
    fresenius: { x: 0, y: 2.6, s: 0.85, o: 0.3 },
    apollo: { x: 0, y: 2.6, s: 0.85, o: 0.3 },
    impact: { x: 0, y: 2.6, s: 0.85, o: 0 },
    work: { x: 0, y: 2.6, s: 0.85, o: 0.3 },
    tools: { x: 0, y: 2.6, s: 0.85, o: 0.3 },
    contact: { x: 0, y: 2.45, s: 0.66, o: 0.9 },
  },
};

// What each display draws: ANSR MedTech, J&J, LTTS (Baxter), Fresenius, Apollo and Vijaya, Vystra Build.
const DRAWINGS = [connectedCare, surgicalRobot, homeDialysis, hemodialysis, patientMonitor, construction];

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};

/* ---------------- 3D particle field ---------------- */
const canvas = document.querySelector('.field');
let field = null;

function loadPortraitMap() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = img.naturalWidth;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      resolve({ data: ctx.getImageData(0, 0, size, size).data, size });
    };
    img.onerror = reject;
    img.src = portraitMapUrl;
  });
}

// The patient monitor's numbers use the page's own font, so wait for it before drawing.
const displayFont = (document.fonts?.load('800 100px Archivo') ?? Promise.resolve()).catch(() => {});
const fieldReady = Promise.all([loadPortraitMap(), displayFont]).then(([portraitMap]) => {
  try {
    field = new ParticleField(canvas, {
      count: narrow() ? 16000 : 30000,
      colors: THEMES.me,
      portraitMap,
      drawings: DRAWINGS,
    });
    if (reduced) field.uniforms.uIntro.value = 1;
  } catch (err) {
    console.warn('WebGL unavailable, showing the page without the 3D field.', err);
    root.classList.add('no-webgl');
  }
}).catch((err) => {
  console.warn('Portrait map failed to load.', err);
  root.classList.add('no-webgl');
});

let turbulence = 0;
gsap.ticker.add((time, deltaMs) => {
  if (!field) return;
  const speed = lenis ? Math.abs(lenis.velocity) : 0;
  turbulence += (Math.min(speed / 30, 1.2) - turbulence) * 0.08;
  field.uniforms.uTurbulence.value = turbulence;
  field.render(reduced ? time * 0.25 : time, Math.min(deltaMs / 1000, 0.1));
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    field?.resize();
    if (currentStep) goTo(currentStep, true);
  }, 120);
});

/* ---------------- Moving between parts of the page ---------------- */
let currentStep = null;
let currentTheme = null;

function setTheme(name, instant) {
  if (name === currentTheme) return;
  currentTheme = name;
  const t = THEMES[name];
  const d = instant || reduced ? 0 : 1.1;
  gsap.to(root, { '--ground': t.ground, '--accent': t.accent, '--on-accent': t.onAccent, duration: d, ease: 'power2.inOut', overwrite: 'auto' });
  if (!field) return;
  const u = field.uniforms;
  [['uColorA', t.dotA], ['uColorB', t.dotB], ['uAccent', t.hi]].forEach(([key, hex]) => {
    gsap.to(u[key].value, { ...hexToRgb(hex), duration: d, ease: 'power2.inOut', overwrite: true });
  });
}

function goTo(el, instant = false) {
  currentStep = el;
  const name = el.dataset.step;
  const step = STEPS[name];
  setTheme(step.theme, instant);
  if (!field) return;
  const p = POSES[narrow() ? 'narrow' : 'wide'][name];
  const d = instant || reduced ? 0 : 1;
  gsap.to(field.uniforms.uMorph, { value: step.shape, duration: 1.9 * d, ease: 'power2.inOut', overwrite: true });
  gsap.to(field.group.position, { x: p.x, y: p.y, duration: 1.7 * d, ease: 'power3.inOut', overwrite: true });
  gsap.to(field.group.scale, { x: p.s, y: p.s, z: p.s, duration: 1.7 * d, ease: 'power3.inOut', overwrite: true });
  gsap.to(canvas, { opacity: p.o, duration: 1.2 * d, ease: 'power2.out', overwrite: true });
}

/* ---------------- Loader → intro ---------------- */
const nameSplit = new SplitText('.name-line', { type: 'chars', charsClass: 'char', aria: 'none' });

function runLoader() {
  const loader = document.querySelector('.loader');
  if (reduced || !loader) { loader?.remove(); return fieldReady; }
  root.classList.add('is-loading');
  lenis?.stop();
  const num = loader.querySelector('.loader-num');
  const count = { v: 0 };
  const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);

  return new Promise((resolve) => {
    const tl = gsap.timeline();
    tl.to('.loader-lines li', { opacity: 1, duration: 0.01, stagger: 0.32 }, 0.15);
    tl.to(count, {
      v: 100, duration: 1.7, ease: 'power2.inOut',
      onUpdate: () => { num.textContent = Math.round(count.v); },
    }, 0);
    Promise.all([fontsReady, fieldReady]).then(() => tl.then(() => {
      gsap.timeline({
        onComplete: () => {
          loader.remove();
          root.classList.remove('is-loading');
          lenis?.start();
        },
      })
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' })
        .add(resolve, 0.35);
    }));
  });
}

// Built paused straight away so the name is already hidden when the loader lifts.
function intro() {
  const chars = nameSplit.chars;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  // The dots fly in from every direction and settle into the portrait.
  tl.add(() => { if (field && !reduced) gsap.to(field.uniforms.uIntro, { value: 1, duration: 3.2, ease: 'power2.out' }); }, 0);
  if (!reduced) {
    tl.fromTo(chars,
      { yPercent: 110, '--w': 62, '--wg': 250 },
      { yPercent: 0, '--w': 125, '--wg': 800, duration: 1.5, stagger: 0.045 }, 0.1);
    tl.from(['.hero-role', '.hero-lede', '.hero-actions', '.scroll-cue', '.bar'], {
      opacity: 0, y: 18, duration: 1.2, stagger: 0.08, clearProps: 'transform',
    }, 0.55);
  }
  tl.add(() => {
    // As the hero scrolls away, the name compresses back to its narrowest width.
    gsap.fromTo(chars, { '--w': 125 }, {
      '--w': 66, ease: 'none', stagger: { each: 0.02 }, immediateRender: false,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  });
  return tl;
}

/* ---------------- Scroll-driven sections ---------------- */
function buildScroll() {
  // Each part of the page sets the shape, its position and the colours.
  document.querySelectorAll('.step').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) goTo(el); },
    });
  });

  if (reduced) return;

  // Headings and company names rise out of a mask, line by line.
  document.querySelectorAll('.reveal, .job-company').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true, aria: 'auto',
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      }),
    });
  });

  // The flip card swings into place the first time it comes into view.
  gsap.from('.card', {
    rotationY: -32, rotationX: 8, y: 70, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.about', start: 'top 75%', once: true },
  });

  // The belief paragraph brightens word by word as you read down.
  const belief = document.querySelector('.belief-text');
  const words = new SplitText(belief, { type: 'words', wordsClass: 'word', aria: 'auto' }).words;
  gsap.fromTo(words, { opacity: 0.22 }, {
    opacity: 1, ease: 'none', stagger: 0.08,
    scrollTrigger: { trigger: belief, start: 'top 75%', end: 'bottom 50%', scrub: true },
  });

  // Big numbers count up and stretch wider as they land.
  const fmt = new Intl.NumberFormat('en-IN');
  document.querySelectorAll('.ledger-num').forEach((el) => {
    const to = Number(el.dataset.to);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        gsap.fromTo(el, { '--w': 62 }, { '--w': 112, duration: 1.8, ease: 'expo.out' });
        if (to > 0) {
          gsap.fromTo(obj, { v: 0 }, {
            v: to, duration: 1.8, ease: 'expo.out',
            onUpdate: () => { el.textContent = fmt.format(Math.round(obj.v)) + suffix; },
          });
        }
      },
    });
  });

  // Skill rows loop sideways; scrolling speeds them up and flips their direction.
  const loops = [];
  document.querySelectorAll('.marquee').forEach((m) => {
    const row = m.querySelector('.marquee-row');
    const inner = document.createElement('div');
    inner.className = 'marquee-inner';
    const copy = row.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    m.replaceChild(inner, row);
    inner.append(row, copy);
    const dir = Number(m.dataset.dir) || 1;
    loops.push(gsap.fromTo(inner, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: 42, ease: 'none', repeat: -1 }));
  });
  if (lenis && loops.length) {
    let scale = 1;
    gsap.ticker.add(() => {
      const v = lenis.velocity;
      const target = (v < 0 ? -1 : 1) * (1 + Math.min(Math.abs(v) / 6, 5));
      scale += (target - scale) * 0.08;
      loops.forEach((t) => t.timeScale(scale));
    });
  }
}

/* ---------------- In-page links scroll smoothly ---------------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else if (target === 0) window.scrollTo({ top: 0 });
    else target.scrollIntoView();
  });
});

/* ---------------- Start ---------------- */
initClock();
initCopy();
initCard();
if (finePointer) {
  initCursor((e) => field?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1));
  document.addEventListener('pointerleave', () => field?.clearPointer());
  initMagnetic();
}

const hero = document.querySelector('.hero');
goTo(hero, true);
fieldReady.then(() => { currentTheme = null; goTo(currentStep || hero, true); });
const introTl = intro();
runLoader().then(() => {
  introTl.play();
  buildScroll();
});
