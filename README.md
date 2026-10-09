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
| Other pages | Plain HTML with one shared stylesheet (`css/site.css`) and a small script (`js/site.js`); same look as the homepage |
| Fonts | Archivo, Newsreader, IBM Plex Mono, all self-hosted (no Google Fonts) |
| Hosting | GitHub Pages with custom domain |
| SEO | sitemap.xml, robots.txt, JSON-LD, Open Graph, Twitter cards |

## Project Structure

```
karthikraja/
├── index.html                  # Homepage (built output of portfolio-src/, don't edit by hand)
├── portfolio-src/              # Homepage source code (see "Editing the homepage")
├── privacy.html                # Privacy policy
├── terms.html                  # Terms of service
├── 404.html                    # Custom 404 page
├── sitemap.xml                 # XML sitemap for SEO
├── robots.txt                  # Crawler directives
├── CNAME                       # Custom domain config
├── .nojekyll                   # Disable Jekyll processing
├── assets/
│   ├── index-*.js, *.css, ...  # Homepage build files (listed in .homepage-build.json)
│   ├── fonts/                  # Archivo, Newsreader, IBM Plex Mono (self-hosted, open font licence)
│   ├── favicon.svg             # KR icon (navy and gold); also /favicon.ico and apple-touch-icon.png
│   ├── og-image.png            # Social sharing image (1200 × 630)
│   └── karthik_resized.jpg     # Profile photo (optimised)
├── blog/
│   ├── index.html              # Blog listing with filters
│   ├── performance-testing-75k-devices.html
│   ├── pipeline-qualification.html
│   ├── why-i-built-vystra-build.html
│   ├── vision-beyond-or.html
│   └── building-in-public.html
├── css/
│   └── site.css                # Shared design for the blog, posts, 404, privacy, terms
├── js/
│   ├── site.js                 # Blog filters + reading progress bar
│   └── analytics.js            # Google Analytics loader (off until an ID is set)
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

## Writing a blog post

```bash
python new_post.py
```

It asks for a title, topic, one-line description and the text, then creates the post in the site's design, adds it to the top of the blog list, and updates the sitemap and RSS feed. Commit and push to publish.

## Search engines

- `sitemap.xml` lists every public page; `robots.txt` points to it and keeps `/tools/` and `/portfolio-src/` out of search.
- Google: add the site in Search Console, submit `https://karthikraja.in/sitemap.xml`, and use URL Inspection → Request indexing after big changes.
- Bing: in Bing Webmaster Tools, import the site from Google Search Console (or add it and submit the sitemap).
- IndexNow (Bing, Yandex and others): the key file `ddad5b5bdf9d4317b1107148c60d0a44.txt` in the site root proves ownership. To announce a changed page, open
  `https://www.bing.com/indexnow?url=https://karthikraja.in/PAGE&key=ddad5b5bdf9d4317b1107148c60d0a44`

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
