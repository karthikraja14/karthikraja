/* ================================================================
   VYSTRA â€” Ultra Animation Engine
   Themed transitions, text scramble, SVG draw-on, parallax
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth <= 768;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== LENIS SMOOTH SCROLL — DISABLED (causes scroll delay) =====
    // Native browser scroll is faster and more responsive

    // ===== LOADER =====
    const loaderTl = gsap.timeline({
        onComplete: () => {
            document.getElementById('loader').classList.add('done');
            startPage();
        }
    });

    if (prefersReduced) {
        // Reduced motion: skip the loader animation entirely
        loaderTl.kill();
        document.getElementById('loader').classList.add('done');
        startPage();
    } else if (isMobile) {
        // Fast loader on mobile
        loaderTl
            .to('.loader-logo', { opacity: 1, scale: 1, duration: 0.3 })
            .to('.loader-progress', { width: '100%', duration: 0.4, ease: 'power2.inOut' })
            .to('#loader', { yPercent: -100, duration: 0.4, ease: 'power3.inOut' });
    } else {
        // Desktop: fast but polished loader (under 1s)
        loaderTl
            .to('.loader-logo', { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)' })
            .to('.loader-text', { opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.1')
            .to('.loader-progress', { width: '100%', duration: 0.5, ease: 'power2.inOut' }, '-=0.1')
            .to('#loader', { yPercent: -100, duration: 0.4, ease: 'power3.inOut' });
    }

    function startPage() {
        initNav();
        if (isMobile || prefersReduced) {
            // Mobile or reduced-motion: skip all heavy animations, just show content
            initMobileReveal();
            return;
        }
        // Desktop: full animation suite
        initCursor();
        initParticles();
        initECG();
        initHero();
        initTextScramble();
        initScrollAnims();
        initTimeline();
        initDividers();
        initTilt();
        initMagnetic();
    }

    // ===== MOBILE: instant reveal, no animations =====
    function initMobileReveal() {
        // Force everything visible immediately
        document.querySelectorAll('.title-line-inner,.hero-badge,.hero-tagline,.hero-subtitle,.hero-actions,.hero-metrics,.scroll-indicator,.section-tag,.section-desc,.about-card,.about-stat-card,.about-highlight,.product-card,.skill-group,.blog-card,.blog-cta,.contact-item,.faq-item,.loader-text').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        // Animate hero counters
        animateCounters();
        // Skill tags
        document.querySelectorAll('.skill-tag').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }

    // ===== CUSTOM CURSOR =====
    function initCursor() {
        if (window.innerWidth < 768) return;
        const c = document.getElementById('cursor'), f = document.getElementById('cursorFollower');
        if (!c || !f) return;
        document.body.classList.add('custom-cursor');
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

    // ===== PARTICLE CONSTELLATION (optimized) =====
    function initParticles() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W, H;
        function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
        resize(); window.addEventListener('resize', resize);

        const N = Math.min(45, Math.floor(W / 28));
        const pts = Array.from({ length: N }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.4 + 0.1
        }));

        (function draw() {
            ctx.clearRect(0, 0, W, H);
            for (const p of pts) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201,168,76,${p.o})`;
                ctx.fill();
            }
            // Lines between nearby particles
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                    const d = dx * dx + dy * dy; // skip sqrt
                    if (d < 19600) { // 140^2
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(201,168,76,${0.06 * (1 - Math.sqrt(d) / 140)})`;
                        ctx.lineWidth = 0.5;
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

    // ===== ECG HEARTBEAT WAVE =====
    function initECG() {
        const canvas = document.getElementById('ecgCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W, H;
        function resize() {
            W = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
            H = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }
        resize();
        window.addEventListener('resize', resize);

        const cW = () => canvas.offsetWidth;
        const cH = () => canvas.offsetHeight;
        let offset = 0;
        const speed = 1.2;

        // ECG waveform pattern (one heartbeat cycle, normalized 0-1 height)
        function ecgY(x) {
            const t = x % 1;
            // Flat baseline
            if (t < 0.10) return 0.5;
            // P wave (small bump)
            if (t < 0.18) { const p = (t - 0.10) / 0.08; return 0.5 - 0.08 * Math.sin(p * Math.PI); }
            // Flat
            if (t < 0.22) return 0.5;
            // Q dip
            if (t < 0.26) { const q = (t - 0.22) / 0.04; return 0.5 + 0.06 * Math.sin(q * Math.PI); }
            // R spike (tall)
            if (t < 0.32) { const r = (t - 0.26) / 0.06; return 0.5 - 0.38 * Math.sin(r * Math.PI); }
            // S dip
            if (t < 0.37) { const s = (t - 0.32) / 0.05; return 0.5 + 0.12 * Math.sin(s * Math.PI); }
            // Flat
            if (t < 0.45) return 0.5;
            // T wave (medium bump)
            if (t < 0.58) { const tw = (t - 0.45) / 0.13; return 0.5 - 0.10 * Math.sin(tw * Math.PI); }
            // Flat baseline
            return 0.5;
        }

        let frameSkip = 0;
        function draw() {
            frameSkip++;
            if (frameSkip % 2 !== 0) { requestAnimationFrame(draw); return; } // draw every 2nd frame
            ctx.clearRect(0, 0, cW(), cH());
            const w = cW();
            const h = cH();
            const cycleWidth = 280;
            offset += speed * 2; // compensate for skipped frames

            // Draw two stacked ECG lines for depth
            for (let line = 0; line < 2; line++) {
                const yOffset = line === 0 ? h * 0.35 : h * 0.7;
                const alpha = line === 0 ? 0.7 : 0.4;
                const lineOffset = offset + (line * 140);

                ctx.beginPath();
                ctx.strokeStyle = `rgba(201, 168, 76, ${alpha})`;
                ctx.lineWidth = line === 0 ? 2 : 1.5;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                for (let x = 0; x <= w; x += 2) {
                    const normalX = (x + lineOffset) / cycleWidth;
                    const y = ecgY(normalX) * h * 0.6 + yOffset - h * 0.15;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            requestAnimationFrame(draw);
        }
        draw();

        // Fade in with GSAP
        gsap.fromTo('#ecgCanvas', { opacity: 0 }, { opacity: 0.15, duration: 1.5, delay: 1, ease: 'power2.out' });
    }

    // ===== HERO ENTRANCE =====
    function initHero() {
        // Character-level split for hero name
        const heroName = document.getElementById('heroName');
        if (heroName) {
            const text = heroName.textContent;
            heroName.innerHTML = text.split('').map(ch =>
                ch === ' ' ? ' ' : `<span class="char" style="display:inline-block;opacity:0;transform:translateY(40px)">${ch}</span>`
            ).join('');
        }

        const tl = gsap.timeline({ delay: 0.3 });
        tl.to('.title-line-inner', { y: 0, duration: 0.01 })
          .to('.title-line-inner .char', {
              opacity: 1, y: 0,
              duration: 0.4, ease: 'power4.out',
              stagger: { each: 0.03, from: 'start' }
          })
          .to('.hero-badge', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
          .to('.hero-tagline', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
          .to('.hero-actions', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
          .to('.hero-metrics', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', onStart: animateCounters }, '-=0.3')
          .to('.scroll-indicator', { opacity: 1, duration: 0.5 }, '-=0.2');
        ScrollTrigger.create({
            trigger: '#about', start: 'top 80%',
            onEnter: () => gsap.to('.scroll-indicator', { opacity: 0, duration: 0.3 })
        });
    }

    function animateCounters() {
        if (prefersReduced) {
            document.querySelectorAll('.counter').forEach(el => { el.textContent = el.dataset.target; });
            return;
        }
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
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
        });
        // Split lines
        gsap.utils.toArray('.split-inner').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el.parentElement, start: 'top 88%' }, y: 0, duration: 0.6, ease: 'power4.out' });
        });
        // Section desc
        gsap.utils.toArray('.section-desc').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 });
        });
        // About cards
        gsap.utils.toArray('.about-card').forEach((c, i) => {
            gsap.to(c, { scrollTrigger: { trigger: c, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: i * 0.08 });
        });
        // About stat cards
        gsap.utils.toArray('.about-stat-card').forEach((c, i) => {
            gsap.to(c, { scrollTrigger: { trigger: c, start: 'top 88%' }, opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', delay: i * 0.06 });
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
                        const obj = { v: 0 };
                        gsap.to(obj, {
                            v: num, duration: 1.2, ease: 'power2.out',
                            onUpdate: () => { el.innerHTML = '<span class="gradient-text">' + Math.round(obj.v) + suffix + '</span>'; }
                        });
                    }
                });
            }
        });
        // About highlight
        gsap.utils.toArray('.about-highlight').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        });
        // Product cards
        gsap.utils.toArray('.product-card').forEach((c, i) => {
            gsap.to(c, { scrollTrigger: { trigger: c, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: i * 0.08 });
        });
        // Feature chips pop
        ScrollTrigger.create({
            trigger: '.product-features', start: 'top 88%',
            onEnter: () => gsap.from('.feature-chip', { scale: 0.8, opacity: 0, duration: 0.3, stagger: 0.04, ease: 'back.out(1.4)' })
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
                opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: i * 0.06,
                onComplete: () => gsap.to(g.querySelectorAll('.skill-tag'), { opacity: 1, y: 0, duration: 0.2, stagger: 0.02, ease: 'power3.out' })
            });
        });
        // Blog cards — animate all at once when section enters viewport
        const blogSection = document.querySelector('.blog-preview') || document.querySelector('.blog-grid-wrap');
        if (blogSection) {
            gsap.utils.toArray('.blog-card').forEach((c, i) => {
                gsap.to(c, { scrollTrigger: { trigger: blogSection, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: i * 0.08 });
            });
        }
        // Blog CTA
        gsap.utils.toArray('.blog-cta').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 92%' }, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
        });
        // Contact items
        gsap.utils.toArray('.contact-item').forEach((item, i) => {
            gsap.to(item, { scrollTrigger: { trigger: item, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', delay: i * 0.06 });
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
    const blogWrap = blogGrid ? blogGrid.closest('.blog-grid-wrap') : null;
    const scrollLeft = blogWrap ? blogWrap.querySelector('.blog-scroll-left') : null;
    const scrollRight = blogWrap ? blogWrap.querySelector('.blog-scroll-right') : null;
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
