/* ==============================================================
   JOURNEY.JS  —  Scroll-scrubbed camera flight
   Builds an Apple-style "fly through the world" timeline with
   GSAP + ScrollTrigger (already loaded on the page).
   The camera dives into each scene, holds, then flies through
   to the next — driven entirely by scroll position.
   Graceful fallback: reduced-motion or missing GSAP -> static.
   ============================================================== */
(function () {
    'use strict';

    var section = document.querySelector('.flight');
    if (!section) return;

    var scenes = Array.prototype.slice.call(section.querySelectorAll('.jscene'));
    var caps = Array.prototype.slice.call(section.querySelectorAll('.jcap'));
    var dots = Array.prototype.slice.call(section.querySelectorAll('.jdot'));
    var hint = section.querySelector('.journey-hint');
    var stage = section.querySelector('.journey-stage');

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    // ---- Fallback: show everything stacked, no animation ----
    if (reduce || !hasGSAP || !scenes.length) {
        section.classList.add('is-static');
        return;
    }

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    function setActive(i) {
        for (var d = 0; d < dots.length; d++) {
            dots[d].classList.toggle('active', d === i);
        }
    }
    setActive(0);

    // Distance (in px) the user scrolls per scene while pinned.
    var perScene = Math.round(Math.max(560, Math.min(820, window.innerHeight * 0.9)));
    var total = scenes.length * perScene;

    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=' + total,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            onUpdate: function (self) {
                // hide the scroll hint once we're moving
                if (hint) hint.style.opacity = self.progress > 0.03 ? '0' : '1';
                var idx = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length + 0.001));
                setActive(idx);
            }
        }
    });

    var SPACING = 0.9; // <1 = neighbouring scenes crossfade

    scenes.forEach(function (scene, i) {
        var at = i * SPACING;
        var cap = caps[i];

        // camera flies IN: from small/blurred/far -> full frame
        tl.fromTo(scene,
            { opacity: 0, scale: 0.38, filter: 'blur(14px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.42, ease: 'power2.out' },
            at
        );

        // caption fades up in sync (kept crisp — no scaling)
        if (cap) {
            tl.fromTo(cap,
                { opacity: 0, y: 26 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
                at + 0.05
            );
            tl.to(cap, { opacity: 0, y: -20, duration: 0.28, ease: 'power2.in' }, at + 0.62);
        }

        // camera flies THROUGH: scale past the lens and dissolve
        // (last scene lingers instead of blowing out)
        if (i < scenes.length - 1) {
            tl.to(scene,
                { opacity: 0, scale: 2.6, filter: 'blur(10px)', duration: 0.42, ease: 'power2.in' },
                at + 0.6
            );
        } else {
            tl.to(scene, { scale: 1.04, duration: 0.5, ease: 'none' }, at + 0.6);
        }
    });

    // ---- Pointer parallax on inner layers (subtle depth) ----
    var isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!isCoarse && stage) {
        var layers = Array.prototype.slice.call(section.querySelectorAll('.jl'));
        var raf = null, px = 0, py = 0;
        stage.addEventListener('mousemove', function (e) {
            var r = stage.getBoundingClientRect();
            px = (e.clientX - r.left) / r.width - 0.5;
            py = (e.clientY - r.top) / r.height - 0.5;
            if (!raf) raf = requestAnimationFrame(apply);
        });
        stage.addEventListener('mouseleave', function () {
            px = 0; py = 0;
            if (!raf) raf = requestAnimationFrame(apply);
        });
        function apply() {
            raf = null;
            for (var i = 0; i < layers.length; i++) {
                var depth = parseFloat(layers[i].getAttribute('data-depth')) || 0.3;
                var tx = -px * depth * 40;
                var ty = -py * depth * 40;
                layers[i].style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0)';
            }
        }
    }

    // keep pin measurements correct after full load / resize
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
