"""
Blog Post Generator for karthikraja.in
=======================================
Usage:
    python new_post.py

It will ask you a few questions and generate:
1. The full blog post HTML file in blog/
2. Add it to blog/index.html listing
3. Update sitemap.xml
4. Update feed.xml

Content format: Write your content in a simple text file or paste it inline.
Use these markers for formatting:
    ## Heading          → <h2>
    ### Sub-heading     → <h3>
    - List item         → <li>
    1. Numbered item    → <ol><li>
    > Blockquote        → <blockquote>
    **bold text**       → <strong>
    `code`              → <code>
    Empty line          → new paragraph
"""

import os
import re
import sys
from datetime import datetime
from email.utils import format_datetime
from xml.etree import ElementTree

BLOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog')
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))


def slugify(text):
    """Convert title to URL-friendly slug."""
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug


def content_to_html(content):
    """Convert simple markdown-like content to HTML."""
    lines = content.strip().split('\n')
    html_parts = []
    in_ul = False
    in_ol = False
    paragraph = []

    def flush_paragraph():
        if paragraph:
            text = ' '.join(paragraph)
            text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
            text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
            html_parts.append(f'            <p>{text}</p>\n')
            paragraph.clear()

    def close_lists():
        nonlocal in_ul, in_ol
        if in_ul:
            html_parts.append('            </ul>\n')
            in_ul = False
        if in_ol:
            html_parts.append('            </ol>\n')
            in_ol = False

    for line in lines:
        stripped = line.strip()

        # Empty line = paragraph break
        if not stripped:
            flush_paragraph()
            close_lists()
            continue

        # Headings
        if stripped.startswith('### '):
            flush_paragraph()
            close_lists()
            html_parts.append(f'            <h3>{stripped[4:]}</h3>\n')
            continue
        if stripped.startswith('## '):
            flush_paragraph()
            close_lists()
            html_parts.append(f'            <h2>{stripped[3:]}</h2>\n')
            continue

        # Blockquote
        if stripped.startswith('> '):
            flush_paragraph()
            close_lists()
            quote = stripped[2:]
            quote = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', quote)
            html_parts.append(f'            <blockquote>\n                <p>{quote}</p>\n            </blockquote>\n')
            continue

        # Unordered list
        if stripped.startswith('- '):
            flush_paragraph()
            if in_ol:
                html_parts.append('            </ol>\n')
                in_ol = False
            if not in_ul:
                html_parts.append('            <ul>\n')
                in_ul = True
            item = stripped[2:]
            item = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', item)
            item = re.sub(r'`(.+?)`', r'<code>\1</code>', item)
            html_parts.append(f'                <li>{item}</li>\n')
            continue

        # Ordered list
        if re.match(r'^\d+\.\s', stripped):
            flush_paragraph()
            if in_ul:
                html_parts.append('            </ul>\n')
                in_ul = False
            if not in_ol:
                html_parts.append('            <ol>\n')
                in_ol = True
            item = re.sub(r'^\d+\.\s', '', stripped)
            item = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', item)
            html_parts.append(f'                <li>{item}</li>\n')
            continue

        # Regular text = accumulate as paragraph
        close_lists()
        paragraph.append(stripped)

    flush_paragraph()
    close_lists()
    return ''.join(html_parts)


def generate_post_html(title, slug, category, read_time, description, body_html, date_str, prev_post=None, next_post=None):
    """Generate the full blog post HTML."""
    published_date = datetime.now().strftime('%Y-%m-%d')
    nav_html = '\n        <nav class="blog-post-nav" aria-label="Article navigation">\n'
    if prev_post:
        nav_html += f'            <a href="{prev_post["file"]}" class="blog-nav-link prev">\n'
        nav_html += f'                <span class="blog-nav-dir">&larr; Previous</span>\n'
        nav_html += f'                <span class="blog-nav-title">{prev_post["title"]}</span>\n'
        nav_html += f'            </a>\n'
    else:
        nav_html += '            <span></span>\n'
    if next_post:
        nav_html += f'            <a href="{next_post["file"]}" class="blog-nav-link next">\n'
        nav_html += f'                <span class="blog-nav-dir">Next &rarr;</span>\n'
        nav_html += f'                <span class="blog-nav-title">{next_post["title"]}</span>\n'
        nav_html += f'            </a>\n'
    else:
        nav_html += '            <span></span>\n'
    nav_html += '        </nav>\n'

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#08080a">
    <title>{title} | Karthik Raja V</title>
    <meta name="description" content="{description}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title} | Karthik Raja V">
    <meta name="twitter:description" content="{description}">
    <link rel="canonical" href="https://karthikraja.in/blog/{slug}.html">
    <meta property="og:title" content="{title} | Karthik Raja V">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="https://karthikraja.in/blog/{slug}.html">
    <meta property="og:type" content="article">
    <meta property="og:image" content="https://karthikraja.in/assets/og-image.png">
    <meta name="twitter:image" content="https://karthikraja.in/assets/og-image.png">
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="alternate" type="application/rss+xml" title="Karthik Raja V - Engineering Notes" href="../feed.xml">
    <link rel="stylesheet" href="../css/home.css">
    <link rel="stylesheet" href="../css/blog.css">
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
    "@type": "BlogPosting",
      "headline": "{title}",
      "description": "{description}",
      "author": {{ "@type": "Person", "name": "Karthik Raja V", "url": "https://karthikraja.in" }},
    "datePublished": "{published_date}",
    "dateModified": "{published_date}",
    "image": "https://karthikraja.in/assets/og-image.png",
      "url": "https://karthikraja.in/blog/{slug}.html",
      "publisher": {{ "@type": "Person", "name": "Karthik Raja V" }},
      "mainEntityOfPage": {{ "@type": "WebPage", "@id": "https://karthikraja.in/blog/{slug}.html" }}
    }}
    </script>
</head>
<body>
    <a class="skip-link" href="#main-content">Skip to article</a>
    <nav class="nav" id="nav" aria-label="Primary navigation">
        <div class="nav-container">
            <a href="/" class="nav-logo"><span class="logo-mark">KRV</span><span class="logo-text">Karthik Raja V</span></a>
            <div class="nav-links" id="navLinks">
                <a href="/#about" class="nav-link">About</a>
                <a href="/#experience" class="nav-link">Experience</a>
                <a href="/#products" class="nav-link">Products</a>
                <a href="/blog/" class="nav-link">Blog</a>
                <a href="/#contact" class="nav-link">Contact</a>
            </div>
            <button class="nav-toggle" id="navToggle" type="button" aria-label="Open navigation menu" aria-controls="navLinks" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
    </nav>

    <article class="blog-post" id="main-content">
        <header class="blog-post-header">
            <a href="/blog/" class="blog-back-link">&larr; Back to Blog</a>
            <div class="blog-post-meta">
                <span class="blog-tag">{category}</span>
                <span class="blog-date">{date_str}</span>
                <span class="blog-read-time">{read_time} min read</span>
            </div>
            <h1 class="blog-post-title">{title}</h1>
        </header>

        <div class="blog-post-body">
{body_html}
        </div>
{nav_html}
    </article>

    <footer class="footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; {datetime.now().year} Karthik Raja V. All rights reserved.</p>
                <p class="footer-policy"><a href="../privacy.html">Privacy</a><a href="../terms.html">Terms</a></p>
            </div>
        </div>
    </footer>
    <script src="../js/blog.js"></script>
</body>
</html>'''


def add_to_sitemap(slug):
    """Add the new post URL to sitemap.xml."""
    sitemap_path = os.path.join(ROOT_DIR, 'sitemap.xml')
    with open(sitemap_path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_entry = f'  <url>\n    <loc>https://karthikraja.in/blog/{slug}.html</loc>\n    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n'
    content = content.replace('</urlset>', new_entry + '</urlset>')
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  + sitemap.xml updated')


def add_to_feed(title, slug, description):
    """Add the new post to the RSS feed using structured XML."""
    feed_path = os.path.join(ROOT_DIR, 'feed.xml')
    ElementTree.register_namespace('atom', 'http://www.w3.org/2005/Atom')
    tree = ElementTree.parse(feed_path)
    channel = tree.getroot().find('channel')
    if channel is None:
        raise ValueError('feed.xml is missing its channel element')

    published = format_datetime(datetime.now().astimezone())
    channel.find('lastBuildDate').text = published
    item = ElementTree.Element('item')
    post_url = f'https://karthikraja.in/blog/{slug}.html'
    ElementTree.SubElement(item, 'title').text = title
    ElementTree.SubElement(item, 'link').text = post_url
    ElementTree.SubElement(item, 'guid', {'isPermaLink': 'true'}).text = post_url
    ElementTree.SubElement(item, 'pubDate').text = published
    ElementTree.SubElement(item, 'description').text = description

    first_item = next((index for index, child in enumerate(channel) if child.tag == 'item'), len(channel))
    channel.insert(first_item, item)
    ElementTree.indent(tree, space='  ')
    tree.write(feed_path, encoding='UTF-8', xml_declaration=True)
    print('  + feed.xml updated')


def add_to_blog_listing(title, slug, category, description, month, year):
    """Add the new post to blog/index.html listing."""
    listing_path = os.path.join(BLOG_DIR, 'index.html')
    with open(listing_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_card = f'''                <article class="blog-list-item" data-category="{category.lower()}">
                    <div><span>{month}</span><br><span>{year}</span></div>
                    <div>
                        <div class="blog-meta"><span class="blog-tag">{category}</span></div>
                        <h2><a href="{slug}.html">{title}</a></h2>
                        <p>{description}</p>
                    </div>
                </article>
'''
    # Insert after the first blog-list-item opening (at the top of the list)
    marker = '<div class="blog-list">'
    content = content.replace(marker, marker + '\n' + new_card, 1)

    with open(listing_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  + blog/index.html listing updated')


def main():
    print('\n  Blog Post Generator for karthikraja.in')
    print('  ' + '=' * 42 + '\n')

    # Collect metadata
    title = input('  Title: ').strip()
    if not title:
        print('  Title is required.')
        return

    slug = slugify(title)
    suggested_slug = slug
    custom_slug = input(f'  Slug [{suggested_slug}]: ').strip()
    if custom_slug:
        slug = slugify(custom_slug)

    print(f'\n  Categories: Engineering, Launch, Hackathon, Product')
    category = input('  Category [Engineering]: ').strip() or 'Engineering'

    description = input('  One-line description (for SEO): ').strip()
    if not description:
        description = title

    read_time = input('  Read time in minutes [5]: ').strip() or '5'

    now = datetime.now()
    date_str = now.strftime('%B %Y')
    month = now.strftime('%b')
    year = now.strftime('%Y')

    # Content input
    print(f'\n  Now enter your blog content.')
    print(f'  Use ## for headings, - for lists, > for quotes, **bold**')
    print(f'  Type END on a new line when done.\n')

    content_lines = []
    while True:
        try:
            line = input()
            if line.strip() == 'END':
                break
            content_lines.append(line)
        except EOFError:
            break

    content = '\n'.join(content_lines)
    if not content.strip():
        print('  No content provided.')
        return

    # Generate HTML
    body_html = content_to_html(content)

    # Check output path
    output_path = os.path.join(BLOG_DIR, f'{slug}.html')
    if os.path.exists(output_path):
        overwrite = input(f'\n  {slug}.html already exists. Overwrite? [y/N]: ').strip().lower()
        if overwrite != 'y':
            print('  Aborted.')
            return

    # Write the post
    post_html = generate_post_html(title, slug, category, read_time, description, body_html, date_str)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(post_html)
    print(f'\n  Created: blog/{slug}.html')

    # Update sitemap
    add_to_sitemap(slug)

    # Update blog listing
    add_to_blog_listing(title, slug, category, description, month, year)

    # Update RSS feed
    add_to_feed(title, slug, description)

    print(f'\n  Done! Your post is ready at blog/{slug}.html')
    print(f'  Remember to: git add -A && git commit -m "New post: {title}" && git push\n')


if __name__ == '__main__':
    main()
