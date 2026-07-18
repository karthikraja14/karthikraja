"""Zero-dependency quality checks for the static website."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent
HTML_FILES = sorted(ROOT.rglob("*.html"))
IGNORED_DIRECTORIES = {".git", "__pycache__"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.description = ""
        self.lang = ""
        self.h1_count = 0
        self.ids: list[str] = []
        self.references: list[str] = []
        self.external_runtime: list[str] = []
        self.json_ld: list[str] = []
        self.nav_toggles: list[dict[str, str]] = []
        self._capture_title = False
        self._capture_json_ld = False
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name: value or "" for name, value in attrs}
        if tag == "html":
            self.lang = attributes.get("lang", "")
        elif tag == "title":
            self._capture_title = True
        elif tag == "meta" and attributes.get("name", "").lower() == "description":
            self.description = attributes.get("content", "").strip()
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "script" and attributes.get("type", "").lower() == "application/ld+json":
            self._capture_json_ld = True
            self._buffer = []

        element_id = attributes.get("id")
        if element_id:
            self.ids.append(element_id)

        for attribute in ("href", "src"):
            value = attributes.get(attribute, "").strip()
            if not value:
                continue
            self.references.append(value)
            parsed = urlsplit(value)
            is_stylesheet = tag == "link" and "stylesheet" in attributes.get("rel", "").lower().split()
            if parsed.scheme in {"http", "https"} and (tag == "script" or is_stylesheet):
                self.external_runtime.append(value)

        if tag == "button" and attributes.get("id") == "navToggle":
            self.nav_toggles.append(attributes)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._capture_title = False
        elif tag == "script" and self._capture_json_ld:
            self.json_ld.append("".join(self._buffer).strip())
            self._capture_json_ld = False
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._capture_title:
            self.title += data
        if self._capture_json_ld:
            self._buffer.append(data)


def local_target(page: Path, reference: str) -> Path | None:
    parsed = urlsplit(reference)
    if parsed.scheme or reference.startswith(("mailto:", "tel:", "data:", "javascript:", "#")):
        return None
    path = parsed.path
    if not path:
        return None
    target = ROOT / path.lstrip("/") if path.startswith("/") else page.parent / path
    if path.endswith("/"):
        target /= "index.html"
    return target.resolve()


def validate() -> list[str]:
    failures: list[str] = []
    if not HTML_FILES:
        return ["No HTML files found"]

    for page in HTML_FILES:
        if any(part in IGNORED_DIRECTORIES for part in page.parts):
            continue
        relative = page.relative_to(ROOT)
        source = page.read_text(encoding="utf-8")
        parser = PageParser()
        try:
            parser.feed(source)
        except Exception as exc:  # HTMLParser errors are rare but actionable.
            failures.append(f"{relative}: HTML parsing failed: {exc}")
            continue

        if parser.lang.lower() != "en":
            failures.append(f"{relative}: expected <html lang=\"en\">")
        if not parser.title.strip():
            failures.append(f"{relative}: missing document title")
        if relative.name != "resume-ats.html" and not parser.description and relative.name != "resume.html":
            failures.append(f"{relative}: missing meta description")
        if parser.h1_count != 1:
            failures.append(f"{relative}: expected exactly one h1, found {parser.h1_count}")

        duplicate_ids = sorted({element_id for element_id in parser.ids if parser.ids.count(element_id) > 1})
        if duplicate_ids:
            failures.append(f"{relative}: duplicate IDs: {', '.join(duplicate_ids)}")

        for reference in parser.references:
            target = local_target(page, reference)
            if target is not None and not target.exists():
                failures.append(f"{relative}: missing local target {reference}")

        for reference in parser.external_runtime:
            failures.append(f"{relative}: external runtime dependency {reference}")

        for payload in parser.json_ld:
            try:
                json.loads(payload)
            except json.JSONDecodeError as exc:
                failures.append(f"{relative}: invalid JSON-LD: {exc.msg}")

        for toggle in parser.nav_toggles:
            for required in ("type", "aria-label", "aria-controls", "aria-expanded"):
                if not toggle.get(required):
                    failures.append(f"{relative}: navToggle missing {required}")

        if re.search(r"Aug(?:ust)? 2026\s*(?:&ndash;|-|—)\s*Present", source, re.IGNORECASE):
            failures.append(f"{relative}: future August 2026 role is marked Present")
        if "/tools/" in source or "href=\"tools/" in source:
            failures.append(f"{relative}: references removed public tools path")

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    if "Sitemap: https://karthikraja.in/sitemap.xml" not in robots:
        failures.append("robots.txt: canonical sitemap declaration missing")

    try:
        sitemap = ElementTree.parse(ROOT / "sitemap.xml")
        namespace = {"sitemap": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sitemap_urls = {element.text for element in sitemap.findall("sitemap:url/sitemap:loc", namespace)}
        public_pages = [ROOT / "index.html", ROOT / "blog" / "index.html", *sorted((ROOT / "blog").glob("*.html")), ROOT / "privacy.html", ROOT / "terms.html"]
        for public_page in public_pages:
            relative = public_page.relative_to(ROOT).as_posix()
            route = relative.removesuffix("index.html").removesuffix(".html")
            route = f"/{route}" if route else "/"
            canonical_url = f"https://karthikraja.in{route}"
            if public_page.name != "index.html":
                canonical_url += ".html"
            if canonical_url not in sitemap_urls:
                failures.append(f"sitemap.xml: missing {canonical_url}")
    except (ElementTree.ParseError, OSError) as exc:
        failures.append(f"sitemap.xml: parsing failed: {exc}")

    try:
        feed = ElementTree.parse(ROOT / "feed.xml")
        feed_urls = {element.text for element in feed.findall("./channel/item/link")}
        for article in sorted((ROOT / "blog").glob("*.html")):
            if article.name == "index.html":
                continue
            article_url = f"https://karthikraja.in/blog/{article.name}"
            if article_url not in feed_urls:
                failures.append(f"feed.xml: missing {article_url}")
    except (ElementTree.ParseError, OSError) as exc:
        failures.append(f"feed.xml: parsing failed: {exc}")

    return failures


if __name__ == "__main__":
    errors = validate()
    if errors:
        print("Site validation failed:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    print(f"Site validation passed for {len(HTML_FILES)} HTML files.")
