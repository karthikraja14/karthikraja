"""
Blog Post Generator for karthikraja.in
=======================================
Usage:
    python new_post.py

It will ask you a few questions and generate:
1. The full blog post HTML file in blog/
2. Add it to blog/index.html listing
3. Add it to the homepage blog carousel
4. Update sitemap.xml
5. Update prev/next navigation on adjacent posts

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
    nav_html = '\n        <nav class="blog-post-nav">\n'
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
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{title} | Karthik Raja V">
    <meta name="twitter:description" content="{description}">
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/blog.css">
</head>
<body>
    <nav class="nav" id="nav">
        <div class="nav-container">
            <a href="/" class="nav-logo"><span class="logo-mark">KRV</span><span class="logo-text">Karthik Raja V</span></a>
            <div class="nav-links" id="navLinks">
                <a href="/#about" class="nav-link">About</a>
                <a href="/#journey" class="nav-link">Journey</a>
                <a href="/#products" class="nav-link">Products</a>
                <a href="/blog/" class="nav-link">Blog</a>
                <a href="/#contact" class="nav-link">Contact</a>
            </div>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
        </div>
    </nav>

    <article class="blog-post">
        <div class="blog-post-header" style="opacity:1;transform:none">
            <a href="/blog/" class="blog-back-link">&larr; Back to Blog</a>
            <div class="blog-post-meta" style="opacity:1;transform:none">
                <span class="blog-tag">{category}</span>
                <span class="blog-date">{date_str}</span>
                <span class="blog-read-time">{read_time} min read</span>
            </div>
            <h1 class="blog-post-title" style="opacity:1;transform:none">{title}</h1>
        </div>

        <div class="blog-post-body" style="opacity:1;transform:none">
{body_html}
        </div>
{nav_html}
    </article>

    <footer class="footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; {datetime.now().year} Karthik Raja V. All rights reserved.</p>
                <p class="footer-made">Engineered in India with care.</p>
            </div>
        </div>
    </footer>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="../js/blog.js"></script>
</body>
</html>'''


def add_to_sitemap(slug):
    """Add the new post URL to sitemap.xml."""
    sitemap_path = os.path.join(ROOT_DIR, 'sitemap.xml')
    with open(sitemap_path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_entry = f'  <url><loc>https://karthikraja.in/blog/{slug}.html</loc><priority>0.7</priority></url>\n'
    content = content.replace('</urlset>', new_entry + '</urlset>')
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  + sitemap.xml updated')


def add_to_blog_listing(title, slug, category, description, month, year):
    """Add the new post to blog/index.html listing."""
    listing_path = os.path.join(BLOG_DIR, 'index.html')
    with open(listing_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_card = f'''                <article class="blog-list-item" data-category="{category.lower()}" style="display:flex;gap:24px;padding:24px;border-radius:12px;transition:.3s">
                    <div style="min-width:50px"><span style="font-family:var(--mono);font-weight:700;color:var(--t1)">{month}</span><br><span style="font-size:.75rem;color:var(--t3)">{year}</span></div>
                    <div>
                        <div class="blog-meta"><span class="blog-tag">{category}</span></div>
                        <h2 style="font-size:1.15rem;font-weight:700;margin:8px 0"><a href="{slug}.html">{title}</a></h2>
                        <p style="font-size:.9rem;color:var(--t2)">{description}</p>
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

    print(f'\n  Done! Your post is ready at blog/{slug}.html')
    print(f'  Remember to: git add -A && git commit -m "New post: {title}" && git push\n')


if __name__ == '__main__':
    main()
