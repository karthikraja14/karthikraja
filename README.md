# Karthik Raja V — Personal Website

> [karthikraja.in](https://karthikraja.in)

![Status](https://img.shields.io/badge/Status-Live-00b894?style=flat-square)
![Deploy](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222?style=flat-square&logo=github)

## About

Personal portfolio, blog, and product showcase for Karthik Raja V — Manager, Systems Automation at Insulet Corporation. 10+ years in MedTech quality engineering, building software products under the Vystra brand.

### Highlights

- **Career timeline** — 5 companies across MedTech, from Biomedical Engineer to Systems Automation Manager
- **6+ awards** — Recognition at J&J for performance engineering, automation, and validation leadership
- **Hack4Health** — Vision Beyond the OR, a post-operative recovery companion built at J&J's healthcare hackathon
- **Vystra Build** — Live construction management SaaS with 12+ modules
- **5 blog posts** — Engineering deep-dives on performance testing, pipeline qualification, and building in public

## Tech Stack

Zero-dependency static site — no frameworks, no build tools, no npm.

| Layer | Tech |
|-------|------|
| Markup | HTML5, semantic |
| Styling | CSS3 custom properties, responsive grid |
| Animation | GSAP 3 + ScrollTrigger (CDN) |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Hosting | GitHub Pages with custom domain |
| SEO | sitemap.xml, robots.txt, JSON-LD, Open Graph, Twitter cards |

## Project Structure

```
karthikraja/
├── index.html                  # Main landing page
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

## Local Development

No build step required.

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
