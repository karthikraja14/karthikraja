/* Blog page animations - lightweight */
document.addEventListener('DOMContentLoaded', () => {
    // Nav scroll
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // Mobile nav
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // GSAP entrance animations
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Header entrance
        gsap.from('.blog-page-header .hero-badge, .blog-page-header .section-title, .blog-page-header .section-desc', {
            y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.2
        });

        gsap.from('.blog-back-link', {
            x: -20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.2
        });

        gsap.from('.blog-post-title', {
            y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.3
        });

        gsap.from('.blog-post-body > *', {
            y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: '.blog-post-body', start: 'top 80%' }
        });

        // Blog list items
        gsap.utils.toArray('.blog-list-item').forEach((item, i) => {
            gsap.from(item, {
                y: 40, opacity: 0, duration: 0.6, delay: 0.1 + i * 0.1,
                ease: 'power3.out'
            });
        });

        // Filter buttons
        gsap.from('.filter-btn', {
            scale: 0.8, opacity: 0, duration: 0.4, stagger: 0.05,
            ease: 'back.out(1.4)', delay: 0.3
        });
    }
});
