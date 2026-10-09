// Copies the finished homepage from dist/ into the website root, which GitHub Pages serves.
//
//   dist/index.html   → ../index.html
//   dist/assets/*     → ../assets/   (next to the site's existing favicon, logo and share image)
//
// Built files have a fingerprint in their names (index-a1B2c3D4.js), so each build adds new
// names. The list of files this script copied last time is kept in ../assets/.homepage-build.json,
// and any of those the new build no longer uses are removed. Nothing else in assets/ is touched.
import { readFileSync, writeFileSync, existsSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, '..', 'dist');
const site = join(here, '..', '..');
const siteAssets = join(site, 'assets');
const manifestPath = join(siteAssets, '.homepage-build.json');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('No dist/index.html found. Run "npm run build" first.');
  process.exit(1);
}

const built = readdirSync(join(dist, 'assets'));
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];

for (const name of previous) {
  if (!built.includes(name) && existsSync(join(siteAssets, name))) {
    rmSync(join(siteAssets, name));
    console.log(`removed  assets/${name}`);
  }
}
for (const name of built) {
  copyFileSync(join(dist, 'assets', name), join(siteAssets, name));
  console.log(`copied   assets/${name}`);
}
copyFileSync(join(dist, 'index.html'), join(site, 'index.html'));
console.log('copied   index.html');
writeFileSync(manifestPath, JSON.stringify(built, null, 2) + '\n');
console.log(`\nHomepage published into the site root (${built.length} asset files). Commit and push to deploy.`);
