# Karthik Raja V - Personal Website

[karthikraja.in](https://karthikraja.in) is a proof-led portfolio and engineering publication focused on regulated MedTech systems, test architecture, performance engineering, and product building.

Karthik has 10+ years in quality engineering and is joining Insulet Corporation as Manager, Systems Automation in August 2026.

## What Is Here

- Selected case studies with scope, methods, outcomes, and evidence boundaries
- A career timeline spanning MedTech quality engineering and systems automation
- MedSBOM and Vystra Build product work
- Seven long-form engineering articles with an RSS feed
- Visual and ATS-friendly resumes
- Privacy, terms, structured data, social metadata, sitemap, and custom 404 pages

## Architecture

The site is intentionally small and resilient: semantic HTML, responsive CSS, and progressive JavaScript, hosted on GitHub Pages. Essential content has no framework, package manager, build step, analytics script, remote font, or CDN dependency.

| Layer | Implementation |
| --- | --- |
| Markup | Semantic HTML5 and JSON-LD |
| Styling | CSS custom properties, grid, and reduced-motion support |
| Interaction | Dependency-free JavaScript with accessible ARIA state |
| Discovery | Open Graph, Twitter cards, RSS, sitemap, and robots directives |
| Hosting | GitHub Pages with a custom domain and HTTPS |
| Validation | Zero-dependency Python checks and GitHub Actions |

## Project Structure

```text
.
|-- index.html
|-- resume.html
|-- resume-ats.html
|-- privacy.html
|-- terms.html
|-- 404.html
|-- feed.xml
|-- sitemap.xml
|-- robots.txt
|-- new_post.py
|-- validate_site.py
|-- assets/
|   |-- favicon.svg
|   |-- og-image.png
|   `-- karthik_resized.jpg
|-- blog/
|   |-- index.html
|   `-- seven article pages
|-- css/
|   |-- home.css
|   |-- blog.css
|   `-- resume.css
|-- js/
|   |-- home.js
|   `-- blog.js
`-- .github/workflows/site-quality.yml
```

## Local Development

No installation or build step is required.

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Run the same checks used in CI before publishing:

```powershell
python -m py_compile new_post.py validate_site.py
python validate_site.py
```

The validator checks local links and assets, essential metadata, heading structure, duplicate IDs, JSON-LD syntax, accessible navigation state, external runtime dependencies, and future-role wording.

## Publishing An Article

```powershell
python new_post.py
```

The generator creates the article and updates the blog listing, sitemap, and RSS feed. Review the generated copy and evidence claims before publishing.

## Deployment

GitHub Pages deploys the `main` branch to the custom domain. Changes should pass the `Site quality` workflow before release.
