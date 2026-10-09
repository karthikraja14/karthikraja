# karthikraja.in homepage — source

A single-page portfolio with a 3D particle field behind the content. It opens with Karthik's face drawn in about 20,000 glowing dots, and the dots change shape as you scroll. The page background and accent colour switch to each company's brand colours in the career section.

| Section | Dots form | Colours |
|---|---|---|
| Intro | Karthik's face, as halftone dots (from his photo) | Navy and gold (his own) |
| About | Drifting dust, with a flip card: photo on the front, anime version on the back | Navy and gold |
| ANSR MedTech (2026 to now) | A globe | Orange on teal |
| Johnson & Johnson (2023 to 2026) | A field of 75,000 "devices" | J&J red |
| L&T Technology Services, for Baxter (2021 to 2023) | A coiled tube, like a dialysis line | L&T yellow on black |
| Fresenius Medical Care (2018 to 2021) | A ring, like a blood circuit | Fresenius blues |
| Apollo and Vijaya hospitals (2017 to 2018) | A heartbeat trace | Teal and orange |
| Work | Stacked blocks for Vystra Build | Navy and gold |
| Contact | His face again | Navy and gold |

## Tech used

- **Three.js** draws the particles with WebGL (the browser's 3D graphics). The shape changes run on the graphics card through small GLSL shader programs in `src/scene/shaders.js`.
- **GSAP** with **ScrollTrigger** ties animation to scrolling: the shape and colour changes per section, the counting numbers, the line-by-line heading reveals. **SplitText** breaks text into letters, words or lines so each piece can animate.
- **Lenis** smooths out mouse-wheel scrolling.
- **Vite** runs the local dev server and builds the production files.
- Fonts are self-hosted from npm (Archivo, Newsreader, IBM Plex Mono), so the site makes no request to Google Fonts.

## Run it on your computer

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173. The page reloads by itself when you save a file.

## Build the files you deploy

```bash
npm run build
```

This writes the finished site to `dist/`. `npm run preview` serves that folder locally so you can check the production build.

`npm run build:single` makes one self-contained HTML file in `dist-single/`, with every script, style and font inlined. That's handy for sharing a preview as a single file.

## Where to change things

| To change… | Edit |
|---|---|
| Company colours | `src/themes.js` |
| The photos on the flip card | `src/assets/card-front.webp` and `card-back.webp` (720 × 900) |
| The dot portrait | `src/assets/portrait-map.png`: colour of each dot in RGB, dot size in the alpha channel |
| Any text, links, jobs, projects | `index.html` |
| Colours, fonts, spacing | the `:root` block at the top of `src/style.css` |
| Which shape and colours each section uses | `STEPS` in `src/main.js` |
| Where the 3D shape sits in each section (position, size, brightness) | `POSES` in `src/main.js` |
| The shapes themselves | `src/scene/shapes.js` |
| Particle motion, colour and glow | `src/scene/shaders.js` |
| Number of particles (20,000 desktop, 11,000 phone) | `count` in `src/main.js` |

## Built-in safeguards

- **Reduced motion:** if a visitor's device is set to reduce motion, the loader, smooth scrolling, pinning and reveals are switched off and the particles move slowly.
- **No WebGL:** if the browser can't run WebGL, the 3D field is hidden and the page still works with a soft background glow.
- **Phones:** fewer particles, no custom cursor, shapes sit dimmed behind the text, and the card flips with a tap.

## Publishing

`npm run release` builds the page and copies `index.html` and the build files in `assets/` into the website root (the folder above this one). Commit and push to `main`; GitHub Pages deploys it automatically.
