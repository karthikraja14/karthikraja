/* ==============================================================
   ENHANCE.JS  —  Framer-inspired premium interactions
   Self-injects shared chrome (aurora, progress bar, palette,
   cursor spotlight) so it works across index + blog pages.
   ============================================================== */
(function () {
    'use strict';

    /* Apply saved palette ASAP to minimise flash */
    try {
        var savedTheme = localStorage.getItem('krv-theme');
        if (savedTheme === 'ink') document.documentElement.setAttribute('data-theme', 'ink');
    } catch (e) { }

    const ready = (fn) =>
        document.readyState !== 'loading'
            ? fn()
            : document.addEventListener('DOMContentLoaded', fn);

    ready(function () {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.innerWidth <= 768;
        const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
        if (hasGSAP) { try { gsap.registerPlugin(ScrollTrigger); } catch (e) { } }

        /* ---------- 0. Inject shared chrome if missing ---------- */
        (function injectChrome() {
            if (!document.querySelector('.aurora')) {
                const aurora = document.createElement('div');
                aurora.className = 'aurora';
                aurora.setAttribute('aria-hidden', 'true');
                aurora.innerHTML = '<span class="aurora-blob a1"></span><span class="aurora-blob a2"></span><span class="aurora-blob a3"></span>';
                document.body.insertBefore(aurora, document.body.firstChild);
            }
            if (!document.getElementById('scrollProgress')) {
                const bar = document.createElement('div');
                bar.className = 'scroll-progress';
                bar.id = 'scrollProgress';
                document.body.insertBefore(bar, document.body.firstChild);
            }
            if (!document.querySelector('.palette-switch')) {
                const ps = document.createElement('div');
                ps.className = 'palette-switch';
                ps.setAttribute('role', 'group');
                ps.setAttribute('aria-label', 'Colour theme');
                ps.innerHTML =
                    '<button type="button" data-theme-set="gold" title="Warm Charcoal" aria-label="Warm Charcoal theme"><i></i></button>' +
                    '<button type="button" data-theme-set="ink" title="Midnight Ink" aria-label="Midnight Ink theme"><i></i></button>';
                document.body.appendChild(ps);
            }
        })();

        /* ---------- 0b. Palette switcher ---------- */
        (function paletteSwitch() {
            const wrap = document.querySelector('.palette-switch');
            if (!wrap) return;
            const apply = (theme) => {
                if (theme === 'ink') document.documentElement.setAttribute('data-theme', 'ink');
                else document.documentElement.removeAttribute('data-theme');
                wrap.querySelectorAll('[data-theme-set]').forEach(b =>
                    b.classList.toggle('active', (b.dataset.themeSet === 'ink') === (theme === 'ink')));
                try { localStorage.setItem('krv-theme', theme); } catch (e) { }
            };
            wrap.addEventListener('click', e => {
                const btn = e.target.closest('[data-theme-set]');
                if (btn) apply(btn.dataset.themeSet);
            });
            apply(document.documentElement.getAttribute('data-theme') === 'ink' ? 'ink' : 'gold');
        })();

        /* ---------- 0c. Cursor spotlight (desktop, motion OK) ---------- */
        (function cursorSpotlight() {
            if (isMobile || reduced || window.innerWidth < 768) return;
            const spot = document.createElement('div');
            spot.className = 'cursor-spotlight';
            document.body.appendChild(spot);
            let tx = window.innerWidth / 2, ty = window.innerHeight / 2, cx = tx, cy = ty;
            window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
            (function loop() {
                cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
                spot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
                requestAnimationFrame(loop);
            })();
        })();

        /* ---------- 0d. Hero parallax (index only) ---------- */
        (function heroParallax() {
            const content = document.querySelector('.hero-content');
            if (!content || !hasGSAP || isMobile || reduced) return;
            gsap.to(content, {
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
                y: 110, opacity: 0.55, ease: 'none'
            });
        })();

        /* ---------- 1. Scroll progress bar ---------- */
        (function scrollProgress() {
            const bar = document.getElementById('scrollProgress');
            if (!bar) return;
            let ticking = false;
            const update = () => {
                const h = document.documentElement;
                const max = h.scrollHeight - h.clientHeight;
                const pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
                bar.style.width = (pct * 100).toFixed(2) + '%';
                ticking = false;
            };
            window.addEventListener('scroll', () => {
                if (!ticking) { requestAnimationFrame(update); ticking = true; }
            }, { passive: true });
            update();
        })();

        /* ---------- 2. Manifesto — word-by-word scroll reveal ---------- */
        (function manifesto() {
            const man = document.querySelector('.manifesto');
            if (!man) return;
            const words = Array.from(man.querySelectorAll('.word'));
            const sign = man.querySelector('.manifesto-sign');
            if (!words.length) return;

            if (reduced || isMobile) {
                words.forEach(w => w.classList.add('lit'));
                if (sign) sign.classList.add('in');
                return;
            }
            man.classList.add('js-reveal');

            if (hasGSAP) {
                ScrollTrigger.create({
                    trigger: man, start: 'top 72%', end: 'bottom 78%', scrub: 0.4,
                    onUpdate: self => {
                        const lit = Math.round(self.progress * words.length);
                        for (let i = 0; i < words.length; i++) words[i].classList.toggle('lit', i < lit);
                        if (sign) sign.classList.toggle('in', self.progress > 0.82);
                    }
                });
            } else {
                // Fallback: reveal all when section enters view
                const io = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            words.forEach((w, i) => setTimeout(() => w.classList.add('lit'), i * 45));
                            if (sign) setTimeout(() => sign.classList.add('in'), words.length * 45);
                            io.disconnect();
                        }
                    });
                }, { threshold: 0.4 });
                io.observe(man);
            }
        })();

        /* ---------- 3. Generic reveal-up + bento cells ---------- */
        (function revealOnScroll() {
            const targets = document.querySelectorAll('.reveal-up, .bento-cell');
            if (!targets.length) return;
            if (reduced || isMobile) { targets.forEach(t => t.classList.add('in')); return; }
            const io = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        const el = e.target;
                        const delay = parseFloat(el.dataset.delay || 0);
                        setTimeout(() => el.classList.add('in'), delay);
                        io.unobserve(el);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
            targets.forEach(t => io.observe(t));
        })();

        /* ---------- 4. Bento spotlight follow ---------- */
        (function bentoSpotlight() {
            if (isMobile) return;
            document.querySelectorAll('.bento-cell').forEach(cell => {
                cell.addEventListener('mousemove', e => {
                    const r = cell.getBoundingClientRect();
                    cell.style.setProperty('--bx', (e.clientX - r.left) + 'px');
                    cell.style.setProperty('--by', (e.clientY - r.top) + 'px');
                });
            });
        })();

        /* ---------- 5. Wire new cards into existing cursor + tilt ---------- */
        (function hookExisting() {
            if (isMobile) return;
            const f = document.getElementById('cursorFollower');
            if (f) {
                document.querySelectorAll('.bento-cell,.marquee-item,.endorse-item,.palette-switch button').forEach(el => {
                    el.addEventListener('mouseenter', () => f.classList.add('hover'));
                    el.addEventListener('mouseleave', () => f.classList.remove('hover'));
                });
            }
        })();
    });
})();
