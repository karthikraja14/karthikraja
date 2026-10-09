# Karthik Raja V — Personal Website

> [karthikraja.in](https://karthikraja.in)

![Status](https://img.shields.io/badge/Status-Live-00b894?style=flat-square)
![Deploy](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222?style=flat-square&logo=github)

## About

Personal portfolio, blog, and product showcase for Karthik Raja V — Manager, Systems Automation at ANSR MedTech, Bengaluru. 10+ years in MedTech quality engineering, building software products under the Vystra brand.

### Highlights

- **Career timeline** — 5 companies across MedTech, from Biomedical Engineer to Systems Automation Manager
- **6+ awards** — Recognition at J&J for performance engineering, automation, and validation leadership
- **Hack4Health** — Vision Beyond the OR, a post-operative recovery companion built at J&J's healthcare hackathon
- **Vystra Build** — Live construction management SaaS with 12+ modules
- **5 blog posts** — Engineering deep-dives on performance testing, pipeline qualification, and building in public

## Tech Stack

The homepage is built from `portfolio-src/` and committed as finished files; every other page is plain static HTML, as before.

| Layer | Tech |
|-------|------|
| Homepage | Three.js (3D dot portrait and shapes), GSAP + ScrollTrigger + SplitText, Lenis smooth scroll, built with Vite |
| Other pages | HTML5, CSS3 custom properties, GSAP 3 (CDN) |
| Fonts | Homepage: Archivo, Newsreader, IBM Plex Mono (self-hosted). Other pages: Inter + JetBrains Mono |
| Hosting | GitHub Pages with custom domain |
| SEO | sitemap.xml, robots.txt, JSON-LD, Open Graph, Twitter cards |

## Project Structure

```
karthikraja/
├── index.html                  # Homepage (built output of portfolio-src/, don't edit by hand)
├── portfolio-src/              # Homepage source code (see "Editing the homepage")
├── resume.html                 # Visual resume
├── resume-ats.html             # ATS-friendly resume
├── privacy.html                # Privacy policy
├── terms.html                  # Terms of service
├── 404.html                    # Custom 404 page
├── sitemap.xml                 # XML sitemap for SEO
├── robots.txt                  # Crawler directives
├── CNAME                       # Custom domain config
├── .nojekyll                   # Disable Jekyll processing
├── assets/
│   ├── index-*.js, *.css, ...  # Homepage build files (listed in .homepage-build.json)
│   ├── favicon.svg             # Geometric K monogram
│   ├── og-image.svg            # Social sharing image
│   └── karthik_resized.jpg     # Profile photo (optimised)
├── blog/
│   ├── index.html              # Blog listing with filters
│   ├── performance-testing-75k-devices.html
│   ├── pipeline-qualification.html
│   ├── why-i-built-vystra-build.html
│   ├── vision-beyond-or.html
│   └── building-in-public.html
├── css/
│   ├── style.css               # Core styles + responsive
│   ├── blog.css                # Blog page styles
│   └── resume.css              # Resume page styles
├── js/
│   ├── animations.js           # GSAP animation engine
│   └── blog.js                 # Blog animations + progress bar
└── tools/
    └── index.html              # JD Resume Tailor (private)
```

## Editing the homepage

The homepage source lives in `portfolio-src/` (details in its own README). You need Node.js 20 or newer.

```bash
cd portfolio-src
npm install
npm run dev        # live preview at http://localhost:5173
npm run release    # build, then copy index.html and assets/ into the site root
```

Then commit and push. `npm run release` also removes the previous build's files from `assets/`, and leaves everything else there alone.

## Local Development (whole site)

No build step required to preview the whole site.

```bash
# Python
python -m http.server 8000

# VS Code
# Install "Live Server" extension → Right-click index.html → Open with Live Server
```

## Deployment

Hosted on **GitHub Pages** with custom domain `karthikraja.in`.

Every push to `main` triggers automatic deployment.

### DNS Setup (GoDaddy → GitHub Pages)

| Type | Name | Value |
|------|------|-------|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |
| CNAME | www | `karthikraja14.github.io` |

HTTPS enforced via GitHub Pages with auto-provisioned SSL.

---

**Karthik Raja V** — Engineered in India with care.
