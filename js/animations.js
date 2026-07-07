/* ================================================================
   VYSTRA — Animation Engine
   GSAP + ScrollTrigger powered animations
   ================================================================ */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ===== PAGE LOADER =====
    const loader = document.getElementById('loader');
    const tl = gsap.timeline({
        onComplete: () => {
            loader.classList.add('done');
            initAllAnimations();
        }
    });
    tl.to('.loader-progress', { width: '100%', duration: 1, ease: 'power2.inOut' })
      .to('.loader-logo', { scale: 0.5, opacity: 0, duration: 0.3 }, '-=0.3')
      .to(loader, { yPercent: -100, duration: 0.6, ease: 'power3.inOut' });

    function initAllAnimations() {
        initCursor();
        initParticles();
        initNav();
        initHero();
        initScrollAnimations();
        initTiltCards();
        initMagneticButtons();
    }

    // ===== CUSTOM CURSOR =====
    function initCursor() {
        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('cursorFollower');
        if (!cursor || !follower) return;
        if (window.innerWidth < 768) return;

        let mx = 0, my = 0, fx = 0, fy = 0;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            cursor.style.left = mx - 4 + 'px';
            cursor.style.top = my - 4 + 'px';
        });

        function followCursor() {
            fx += (mx - fx) * 0.12;
            fy += (my - fy) * 0.12;
            follower.style.left = fx - 18 + 'px';
            follower.style.top = fy - 18 + 'px';
            requestAnimationFrame(followCursor);
        }
        followCursor();

        // Hover states
        const hoverEls = document.querySelectorAll('a, button, .btn, .tilt-card');
        hoverEls.forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('hover'));
            el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
        });
    }

    // ===== PARTICLE CANVAS =====
    function initParticles() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        const count = Math.min(80, Math.floor(window.innerWidth / 18));

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < count; i++) particles.push(new Particle());

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(108, 92, 231, ${0.06 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ===== NAV =====
    function initNav() {
        const nav = document.getElementById('nav');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });

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

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function(e) {
                const id = this.getAttribute('href');
                if (id === '#') return;
                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    const y = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 24;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        });
    }

    // ===== HERO ENTRANCE =====
    function initHero() {
        const heroTl = gsap.timeline({ delay: 1.4 });

        // Title lines slide up
        heroTl.to('.title-line-inner', {
            y: 0, duration: 1, ease: 'power4.out',
            stagger: 0.15
        })
        // Badge
        .to('.hero-badge', {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
        }, '-=0.7')
        // Subtitle
        .to('.hero-subtitle', {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
        }, '-=0.5')
        // Buttons
        .to('.hero-actions', {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
        }, '-=0.5')
        // Stats
        .to('.hero-stats', {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            onStart: animateCounters
        }, '-=0.4')
        // Scroll indicator
        .to('.scroll-indicator', {
            opacity: 1, duration: 1, ease: 'power2.out'
        }, '-=0.2');

        // Hide scroll indicator on scroll
        ScrollTrigger.create({
            trigger: '#about',
            start: 'top 80%',
            onEnter: () => gsap.to('.scroll-indicator', { opacity: 0, duration: 0.3 })
        });
    }

    // ===== COUNTER ANIMATION =====
    function animateCounters() {
        document.querySelectorAll('.counter').forEach(el => {
            const target = parseInt(el.dataset.target);
            gsap.to(el, {
                textContent: target,
                duration: 1.5,
                ease: 'power2.out',
                snap: { textContent: 1 },
                onUpdate: function() {
                    el.textContent = Math.round(parseFloat(el.textContent));
                }
            });
        });
    }

    // ===== SCROLL ANIMATIONS =====
    function initScrollAnimations() {
        // Section tags
        gsap.utils.toArray('.section-tag').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'
            });
        });

        // Section title split lines
        gsap.utils.toArray('.split-inner').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el.parentElement, start: 'top 85%' },
                y: 0, duration: 1, ease: 'power4.out'
            });
        });

        // Section descriptions
        gsap.utils.toArray('.section-desc').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2
            });
        });

        // About cards
        gsap.utils.toArray('.about-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: { trigger: card, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                delay: i * 0.15
            });
        });

        // About highlight
        gsap.utils.toArray('.about-highlight').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
            });
        });

        // Product cards
        gsap.utils.toArray('.product-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: { trigger: card, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                delay: i * 0.2
            });
        });

        // Feature chips stagger
        ScrollTrigger.create({
            trigger: '.product-features',
            start: 'top 85%',
            onEnter: () => {
                gsap.from('.feature-chip', {
                    scale: 0.8, opacity: 0, duration: 0.5,
                    stagger: 0.08, ease: 'back.out(1.4)'
                });
            }
        });

        // Product highlights stagger
        ScrollTrigger.create({
            trigger: '.product-highlights',
            start: 'top 85%',
            onEnter: () => {
                gsap.from('.product-highlights li', {
                    x: -20, opacity: 0, duration: 0.4,
                    stagger: 0.1, ease: 'power3.out'
                });
            }
        });

        // Pipeline animation
        ScrollTrigger.create({
            trigger: '.product-pipeline',
            start: 'top 85%',
            onEnter: () => {
                gsap.from('.pipeline-step', {
                    scale: 0, opacity: 0, duration: 0.5,
                    stagger: 0.12, ease: 'back.out(2)'
                });
                gsap.from('.pipeline-connector', {
                    scaleX: 0, duration: 0.4,
                    stagger: 0.12, ease: 'power3.out', delay: 0.1
                });
            }
        });

        // Skill groups
        gsap.utils.toArray('.skill-group').forEach((group, i) => {
            gsap.to(group, {
                scrollTrigger: { trigger: group, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
                delay: i * 0.15,
                onComplete: () => {
                    // Animate tags inside this group
                    const tags = group.querySelectorAll('.skill-tag');
                    gsap.to(tags, {
                        opacity: 1, y: 0, duration: 0.4,
                        stagger: 0.05, ease: 'power3.out'
                    });
                }
            });
        });

        // Blog cards
        gsap.utils.toArray('.blog-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: { trigger: card, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                delay: i * 0.15
            });
        });

        // Blog CTA
        gsap.utils.toArray('.blog-cta').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 90%' },
                opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'
            });
        });

        // Contact items
        gsap.utils.toArray('.contact-item').forEach((item, i) => {
            gsap.to(item, {
                scrollTrigger: { trigger: item, start: 'top 85%' },
                opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
                delay: i * 0.12
            });
        });

        // Parallax glows
        gsap.to('.hero-glow-1', {
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
            y: -150, ease: 'none'
        });
        gsap.to('.hero-glow-2', {
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
            y: -100, ease: 'none'
        });

        // Section borders animate in
        gsap.utils.toArray('.about, .products, .skills, .blog-preview, .contact').forEach(section => {
            gsap.from(section, {
                scrollTrigger: { trigger: section, start: 'top 95%' },
                borderTopColor: 'transparent',
                duration: 1, ease: 'power2.out'
            });
        });
    }

    // ===== 3D TILT CARDS =====
    function initTiltCards() {
        if (window.innerWidth < 768) return;

        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }

    // ===== MAGNETIC BUTTONS =====
    function initMagneticButtons() {
        if (window.innerWidth < 768) return;

        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => { btn.style.transition = ''; }, 400);
            });
        });
    }
});
