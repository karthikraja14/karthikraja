# Vystra — Engineering Products That Matter

> Personal brand & product studio website for [vystra.in](https://vystra.in)

![Vystra](https://img.shields.io/badge/Status-Live-00b894?style=flat-square)
![Deploy](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=flat-square&logo=netlify)
![License](https://img.shields.io/badge/License-MIT-6c5ce7?style=flat-square)

## What is Vystra?

Vystra is a product studio — a brand hub that showcases both my professional journey as a Lead Test Engineer in MedTech and the software products I build on the side. It serves as a portfolio, resume, blog, and product showcase all in one.

### Live Products

| Product | Description | URL |
|---------|-------------|-----|
| **Vystra Build** | Construction management platform for Indian civil engineering contractors — 12+ modules, 20 calculators, PDF exports | [build.vystra.in](https://build.vystra.in) |
| **More coming...** | Next product in research phase | — |

## Tech Stack

This is a **zero-dependency static site** — no frameworks, no build tools, no npm.

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, gradient mesh backgrounds, responsive grid
- **Vanilla JS** — Custom cursor, particle canvas, 3D card tilt, text scramble
- **GSAP 3** + **ScrollTrigger** — Professional scroll-driven animations via CDN
- **Google Fonts** — Inter + JetBrains Mono

## Features

- **Animated page loader** — Logo entrance + staggered text + progress bar
- **Particle constellation** — Interactive canvas with mouse-reactive particles
- **Custom cursor** — Dot + elastic follower with hover states
- **Text scramble effect** — Hero subtitle decodes from random characters
- **3D tilt cards** — Perspective rotation following cursor position
- **Magnetic buttons** — Elastic snap-back on mouse leave
- **Themed section dividers** — Blueprint SVG lines, heartbeat pulse, construction scene draw-on
- **Timeline with scroll fill** — Career timeline fills a gradient line as you scroll
- **Gradient mesh background** — Multi-layered radial gradients with noise texture
- **Fully responsive** — Mobile-first with cursor features disabled on touch devices

## Project Structure

```
VystraWeb/
├── index.html              # Main landing page
├── css/
│   ├── style.css           # Core styles + animations
│   └── blog.css            # Blog page styles
├── js/
│   ├── animations.js       # GSAP animation engine
│   └── blog.js             # Blog page animations
├── blog/
│   ├── index.html          # Blog listing with filters
│   ├── why-i-built-vystra-build.html
│   └── building-in-public.html
├── netlify.toml            # Netlify deploy config + headers
└── README.md
```

## Local Development

No build step required. Just open `index.html` in a browser.

For a local server (better for testing relative paths):

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension → Right-click index.html → Open with Live Server
```

## Deployment

This site is deployed on **Netlify** (free tier) with a custom domain.

### Deploy from GitHub

1. Push code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → New site from Git
3. Select this repo → Deploy
4. Site goes live at `*.netlify.app`

### Custom Domain Setup (GoDaddy → Netlify)

1. **Netlify**: Site settings → Domain management → Add `vystra.in`
2. **GoDaddy DNS**:
   - A Record: `@` → `75.2.60.5`
   - CNAME: `www` → `vystraweb.netlify.app`
3. Netlify auto-provisions SSL via Let's Encrypt

### Auto-deploy

Every push to `main` branch triggers automatic deployment on Netlify.

## Customization

### Adding a new product

In `index.html`, duplicate the `.product-card` block inside `.products-grid` and update the content. Change the status from `product-soon` to `product-live` when shipped.

### Adding a blog post

1. Create a new HTML file in `blog/` (duplicate an existing post)
2. Update the title, meta, and body content
3. Add an entry in `blog/index.html` listing
4. Add a preview card in `index.html` blog section

### Updating work experience

The timeline section in `index.html` uses `.timeline-item` blocks. Add new items or update existing ones. The timeline fill animation adjusts automatically.

### Updating skills

Edit the `.skill-tags` inside each `.skill-group` in the Skills section.

## License

MIT — feel free to fork and adapt for your own brand.

---

**Vystra** — Engineered in India with care.
