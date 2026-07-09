/* ================================================================
   VYSTRA â€” Ultra Animation Engine
   Themed transitions, text scramble, SVG draw-on, parallax
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ===== LENIS SMOOTH SCROLL =====
    let lenis;
    if (window.innerWidth > 768 && typeof Lenis !== 'undefined') {
        lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // ===== LOADER =====
    const loaderTl = gsap.timeline({
        onComplete: () => {
            document.getElementById('loader').classList.add('done');
            startPage();
        }
    });
    loaderTl
        .to('.loader-logo', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' })
        .to('.loader-text', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2')
        .to('.loader-progress', { width: '100%', duration: 0.9, ease: 'power2.inOut' }, '-=0.2')
        .to('.loader-inner', { opacity: 0, y: -30, duration: 0.3 })
        .to('#loader', { yPercent: -100, duration: 0.6, ease: 'power3.inOut' });

    function startPage() {
        initCursor();
        initParticles();
        initNav();
        initHero();
        initTextScramble();
        initScrollAnims();
        initTimeline();
        initDividers();
        initTilt();
        initMagnetic();
    }

    // ===== CUSTOM CURSOR =====
    function initCursor() {
        if (window.innerWidth < 768) return;
        const c = document.getElementById('cursor'), f = document.getElementById('cursorFollower');
        if (!c || !f) return;
        let mx = 0, my = 0, fx = 0, fy = 0;
        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            c.style.left = (mx - 4) + 'px'; c.style.top = (my - 4) + 'px';
        });
        (function tick() {
            fx += (mx - fx) * 0.1; fy += (my - fy) * 0.1;
            f.style.left = (fx - 18) + 'px'; f.style.top = (fy - 18) + 'px';
            requestAnimationFrame(tick);
        })();
        document.querySelectorAll('a,button,.btn,.tilt-card').forEach(el => {
            el.addEventListener('mouseenter', () => f.classList.add('hover'));
            el.addEventListener('mouseleave', () => f.classList.remove('hover'));
        });
    }

    // ===== PARTICLE CONSTELLATION =====
    function initParticles() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W, H;
        function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
        resize(); window.addEventListener('resize', resize);

        const N = Math.min(90, Math.floor(W / 16));
        const pts = Array.from({ length: N }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.5 + 0.1
        }));
        let mouse = { x: -999, y: -999 };
        canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

        (function draw() {
            ctx.clearRect(0, 0, W, H);
            for (const p of pts) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;
                // Mouse repulsion
                const dx = p.x - mouse.x, dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    p.x += dx * 0.02; p.y += dy * 0.02;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201,168,76,${p.o})`;
                ctx.fill();
            }
            // Lines
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 140) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(201,168,76,${0.07 * (1 - d / 140)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
            // Mouse lines
            if (mouse.x > 0) {
                for (const p of pts) {
                    const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (d < 160) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(201,168,76,${0.12 * (1 - d / 160)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        })();
    }

    // ===== NAV =====
    function initNav() {
        const nav = document.getElementById('nav');
        window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });
        const toggle = document.getElementById('navToggle'), links = document.getElementById('navLinks');
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
        });
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            links.classList.remove('open'); document.body.style.overflow = '';
        }));
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function (e) {
                const id = this.getAttribute('href'); if (id === '#') return;
                const el = document.querySelector(id);
                if (el) { e.preventDefault(); window.scrollTo({ top: el.offsetTop - nav.offsetHeight - 20, behavior: 'smooth' }); }
            });
        });
    }

    // ===== HERO ENTRANCE =====
    function initHero() {
        // Character-level split for hero name
        const heroName = document.getElementById('heroName');
        if (heroName) {
            const text = heroName.textContent;
            heroName.innerHTML = text.split('').map(ch =>
                ch === ' ' ? ' ' : `<span class="char" style="display:inline-block;opacity:0;transform:translateY(80px) rotate(8deg)">${ch}</span>`
            ).join('');
        }

        const tl = gsap.timeline({ delay: 1.6 });
        tl.to('.title-line-inner', { y: 0, duration: 0.01 }) // reset container
          .to('.title-line-inner .char', {
              opacity: 1, y: 0, rotation: 0,
              duration: 0.6, ease: 'power4.out',
              stagger: { each: 0.04, from: 'start' }
          })
          .to('.hero-badge', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3')
          .to('.hero-tagline', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
          .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
          .to('.hero-metrics', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', onStart: animateCounters }, '-=0.3')
          .to('.scroll-indicator', { opacity: 1, duration: 0.8 }, '-=0.2');
        ScrollTrigger.create({
            trigger: '#about', start: 'top 80%',
            onEnter: () => gsap.to('.scroll-indicator', { opacity: 0, duration: 0.3 })
        });
    }

    function animateCounters() {
        document.querySelectorAll('.counter').forEach(el => {
            const t = parseInt(el.dataset.target);
            gsap.to({ v: 0 }, {
                v: t, duration: 2, ease: 'power2.out',
                onUpdate: function () { el.textContent = Math.round(this.targets()[0].v); }
            });
        });
    }

    // ===== TEXT SCRAMBLE =====
    function initTextScramble() {
        const el = document.querySelector('.scramble-text');
        if (!el) return;
        const finalText = el.dataset.text;
        const chars = '!@#$%^&*()_+{}|:<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let iteration = 0;
        const interval = setInterval(() => {
            el.textContent = finalText.split('').map((ch, i) => {
                if (i < iteration) return finalText[i];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            if (iteration >= finalText.length) clearInterval(interval);
            iteration += 1 / 2;
        }, 40);
        // Start after loader
        setTimeout(() => { iteration = 0; }, 2200);
    }

    // ===== THEMED SECTION DIVIDERS =====
    function initDividers() {
        // Blueprint lines draw on
        gsap.utils.toArray('.divider-path').forEach(path => {
            const len = path.getTotalLength();
            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
            gsap.to(path, {
                strokeDashoffset: 0, duration: 2, ease: 'power2.out',
                scrollTrigger: { trigger: path.closest('.section-divider'), start: 'top 85%' }
            });
        });

        // Pulse line (heartbeat)
        const pulseLine = document.querySelector('.pulse-line');
        if (pulseLine) {
            const len = pulseLine.getTotalLength();
            gsap.set(pulseLine, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
            gsap.to(pulseLine, {
                strokeDashoffset: 0, duration: 1.5, ease: 'power2.out',
                scrollTrigger: { trigger: '.divider-pulse', start: 'top 85%' }
            });
        }

        // Construction scene draw-on
        const constSvg = document.querySelector('.divider-construction');
        if (constSvg) {
            const lines = constSvg.querySelectorAll('.const-line');
            const cranes = constSvg.querySelectorAll('.const-crane');
            const builds = constSvg.querySelectorAll('.const-build');
            const dots = constSvg.querySelectorAll('.const-dot');

            // Set up stroke dash for lines and cranes
            [...lines, ...cranes].forEach(el => {
                if (el.tagName === 'line' || el.tagName === 'path') {
                    const len = el.tagName === 'line' ?
                        Math.hypot(
                            parseFloat(el.getAttribute('x2')) - parseFloat(el.getAttribute('x1')),
                            parseFloat(el.getAttribute('y2')) - parseFloat(el.getAttribute('y1'))
                        ) : el.getTotalLength();
                    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
                }
            });

            ScrollTrigger.create({
                trigger: constSvg, start: 'top 85%',
                onEnter: () => {
                    // Ground line first
                    gsap.to(lines, { strokeDashoffset: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out' });
                    // Buildings rise
                    gsap.to(builds, { opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.3 });
                    // Build rects: animate from bottom
                    builds.forEach((b, i) => {
                        gsap.from(b, { scaleY: 0, transformOrigin: 'bottom', duration: 0.8, delay: 0.4 + i * 0.06, ease: 'power3.out' });
                    });
                    // Crane draws
                    gsap.to(cranes, { strokeDashoffset: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power2.out', delay: 0.6 });
                    // Scaffold dots pop
                    gsap.to(dots, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(2)', delay: 1 });
                    gsap.from(dots, { scale: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(2)', delay: 1 });
                }
            });
        }
    }

    // ===== SCROLL ANIMATIONS =====
    function initScrollAnims() {
        // Section tags
        gsap.utils.toArray('.section-tag').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        });
        // Split lines
        gsap.utils.toArray('.split-inner').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el.parentElement, start: 'top 88%' }, y: 0, duration: 1, ease: 'power4.out' });
        });
        // Section desc
        gsap.utils.toArray('.section-desc').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 });
        });
        // About cards
        gsap.utils.toArray('.about-card').forEach((c, i) => {
            gsap.to(c, { scrollTrigger: { trigger: c, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.12 });
        });
        // About stat cards
        gsap.utils.toArray('.about-stat-card').forEach((c, i) => {
            gsap.to(c, { scrollTrigger: { trigger: c, start: 'top 88%' }, opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.1 });
        });
        // Scroll-triggered stat number counters
        document.querySelectorAll('.stat-number').forEach(el => {
            const text = el.textContent.trim();
            const num = parseInt(text);
            if (!isNaN(num) && num > 0) {
                const suffix = text.replace(/\d+/, '');
                ScrollTrigger.create({
                    trigger: el, start: 'top 90%', once: true,
                    onEnter: () => {
                        gsap.from({ v: 0 }, {
                            v: num, duration: 1.5, ease: 'power2.out',
                            onUpdate: function() { el.innerHTML = '<span class="gradient-text">' + Math.round(this.targets()[0].v) + suffix + '</span>'; }
                        });
                    }
                });
            }
        });
        // About highlight
        gsap.utils.toArray('.about-highlight').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        });
        // Product cards with scale entrance
        gsap.utils.toArray('.product-card').forEach((c, i) => {
            gsap.to(c, { scrollTrigger: { trigger: c, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.15 });
        });
        // Feature chips pop
        ScrollTrigger.create({
            trigger: '.product-features', start: 'top 88%',
            onEnter: () => gsap.from('.feature-chip', { scale: 0.7, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)' })
        });
        // Product highlights slide
        ScrollTrigger.create({
            trigger: '.product-highlights', start: 'top 88%',
            onEnter: () => gsap.from('.product-highlights li', { x: -24, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' })
        });
        // Pipeline
        ScrollTrigger.create({
            trigger: '.product-pipeline', start: 'top 88%',
            onEnter: () => {
                gsap.from('.pipeline-step', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(2.5)' });
                gsap.from('.pipeline-line', { scaleX: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
            }
        });
        // Skill groups
        gsap.utils.toArray('.skill-group').forEach((g, i) => {
            gsap.to(g, {
                scrollTrigger: { trigger: g, start: 'top 88%' },
                opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.1,
                onComplete: () => gsap.to(g.querySelectorAll('.skill-tag'), { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power3.out' })
            });
        });
        // Blog cards
        gsap.utils.toArray('.blog-card').forEach((c, i) => {
            gsap.to(c, { scrollTrigger: { trigger: c, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.12 });
        });
        // Blog CTA
        gsap.utils.toArray('.blog-cta').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 92%' }, opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        });
        // Contact items
        gsap.utils.toArray('.contact-item').forEach((item, i) => {
            gsap.to(item, { scrollTrigger: { trigger: item, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: i * 0.1 });
        });
        // Parallax glows
        gsap.to('.hero-glow-1', { scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }, y: -180, ease: 'none' });
        gsap.to('.hero-glow-2', { scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }, y: -120, ease: 'none' });
    }

    // ===== TIMELINE DRAW =====
    function initTimeline() {
        // Fill line on scroll
        const fill = document.getElementById('timelineFill');
        if (fill) {
            ScrollTrigger.create({
                trigger: '.timeline', start: 'top 60%', end: 'bottom 80%', scrub: 0.5,
                onUpdate: self => { fill.style.height = (self.progress * 100) + '%'; }
            });
        }
        // Timeline items
        gsap.utils.toArray('.timeline-item').forEach((item, i) => {
            gsap.to(item, {
                scrollTrigger: { trigger: item, start: 'top 82%' },
                opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.1
            });
        });
        // Dots pulse on enter
        gsap.utils.toArray('.timeline-dot').forEach(dot => {
            ScrollTrigger.create({
                trigger: dot, start: 'top 80%',
                onEnter: () => {
                    gsap.fromTo(dot, { scale: 0.5 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
                    gsap.to(dot, { boxShadow: '0 0 20px rgba(201,168,76,0.6)', duration: 0.3 });
                }
            });
        });
        // Timeline tags stagger
        gsap.utils.toArray('.timeline-tags').forEach(container => {
            ScrollTrigger.create({
                trigger: container, start: 'top 88%',
                onEnter: () => gsap.from(container.children, { scale: 0.5, opacity: 0, duration: 0.3, stagger: 0.04, ease: 'back.out(1.5)' })
            });
        });
    }

    // ===== 3D TILT =====
    function initTilt() {
        if (window.innerWidth < 768) return;
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                const rx = ((y - r.height / 2) / r.height) * -5;
                const ry = ((x - r.width / 2) / r.width) * 5;
                card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
            });
        });
    }

    // ===== MAGNETIC BUTTONS =====
    function initMagnetic() {
        if (window.innerWidth < 768) return;
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
                btn.style.transform = '';
            });
        });
    }

    // ===== BLOG SCROLL ARROWS =====
    const blogGrid = document.getElementById('blogGrid');
    const scrollLeft = document.querySelector('.blog-scroll-left');
    const scrollRight = document.querySelector('.blog-scroll-right');
    if (blogGrid && scrollLeft && scrollRight) {
        const scrollAmt = 380;
        scrollLeft.addEventListener('click', () => blogGrid.scrollBy({ left: -scrollAmt, behavior: 'smooth' }));
        scrollRight.addEventListener('click', () => blogGrid.scrollBy({ left: scrollAmt, behavior: 'smooth' }));
    }

    // ===== AWARDS SCROLL ARROWS =====
    const awardsGrid = document.getElementById('awardsGrid');
    const awardLeft = document.querySelector('.award-scroll-left');
    const awardRight = document.querySelector('.award-scroll-right');
    if (awardsGrid && awardLeft && awardRight) {
        const scrollAmt = 380;
        awardLeft.addEventListener('click', () => awardsGrid.scrollBy({ left: -scrollAmt, behavior: 'smooth' }));
        awardRight.addEventListener('click', () => awardsGrid.scrollBy({ left: scrollAmt, behavior: 'smooth' }));
    }
});
