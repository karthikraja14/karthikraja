document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const postBody = document.querySelector('.blog-post-body, .blog-content');
    if (postBody && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const progress = document.createElement('div');
        progress.className = 'reading-progress';
        progress.setAttribute('aria-hidden', 'true');
        document.body.prepend(progress);
        const updateProgress = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
        };
        updateProgress();
        window.addEventListener('scroll', updateProgress, { passive: true });
    }

    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
        const closeMenu = () => {
            links.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        };
        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isOpen));
            links.classList.toggle('open', !isOpen);
            document.body.classList.toggle('nav-open', !isOpen);
        });
        links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') { closeMenu(); toggle.focus(); }
        });
    }

    document.querySelectorAll('.filter-btn').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.classList.contains('active')));
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach((item) => {
                const active = item === button;
                item.classList.toggle('active', active);
                item.setAttribute('aria-pressed', String(active));
            });
            document.querySelectorAll('.blog-list-item').forEach((item) => {
                item.hidden = filter !== 'all' && item.dataset.category !== filter;
            });
        });
    });
});