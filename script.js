/* ============================================================
   XCYLLY CAMPO — PORTFOLIO JAVASCRIPT
   Features: Particles, Typed Effect, Scroll Animations,
             Nav Active States, Form Handling, Custom Cursor
   ============================================================ */

'use strict';

/* ========== 1. PARTICLE CANVAS ========== */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];

  const CONFIG = {
    count:        90,
    maxRadius:    1.8,
    speed:        0.3,
    connectDist:  130,
    color:        '0, 229, 255',
    mouseRadius:  160,
  };

  // Mouse position
  const mouse = { x: -999, y: -999 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', () => { resize(); initDots(); });
  resize();

  /* Build dots */
  function initDots() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        r:  Math.random() * CONFIG.maxRadius + 0.5,
      });
    }
  }
  initDots();

  /* Draw loop */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color}, 0.55)`;
      ctx.fill();

      // Connect to nearby dots
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectDist) {
          const alpha = (1 - dist / CONFIG.connectDist) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }

      // React to mouse
      const mdx  = p.x - mouse.x;
      const mdy  = p.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - mdist) / CONFIG.mouseRadius;
        p.vx += (mdx / mdist) * force * 0.08;
        p.vy += (mdy / mdist) * force * 0.08;
        // Clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }
      } else {
        // Drift back to base speed
        p.vx *= 0.995;
        p.vy *= 0.995;
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ========== 2. CUSTOM CURSOR ========== */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only on hover-capable devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let rx = 0, ry = 0; // Ring position (lerped)
  let mx = 0, my = 0; // Mouse position

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function lerp() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  // Hide on leave, show on enter
  document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });
})();


/* ========== 3. NAVBAR ========== */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('hamburger');
  const links  = document.getElementById('nav-links');

  // Scrolled state
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
    toggleBackToTop();
  }, { passive: true });

  // Hamburger toggle
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    links.classList.toggle('open');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link based on scroll position
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!link) return;
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    });
  }
  updateActiveLink();
})();


/* ========== 4. TYPED TEXT EFFECT ========== */
(function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Computer Science Student',
    'Aspiring Full-Stack Developer',
    'UI/UX Enthusiast',
    'PSITS President',
    'Problem Solver',
  ];

  let pIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const current = phrases[pIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++cIdx);
      if (cIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 40 : 75);
  }
  // Start after hero animation delay
  setTimeout(type, 1200);
})();


/* ========== 5. SCROLL REVEAL ========== */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();


/* ========== 6. SKILL BARS ANIMATION ========== */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const w   = bar.getAttribute('data-w') || 0;
        // Slight delay for visual appeal
        setTimeout(() => { bar.style.width = w + '%'; }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ========== 7. BACK TO TOP ========== */
function toggleBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 500);
}

document.getElementById('back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ========== 8. CONTACT FORM ========== */
(function initForm() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending…';

    // Simulate async send (replace with real API/EmailJS call)
    setTimeout(() => {
      feedback.textContent  = '✓ Message sent! I\'ll get back to you soon.';
      feedback.className    = 'form-feedback success';
      btn.disabled          = false;
      btn.innerHTML         = '<i class="bx bx-send"></i> Send Message';
      form.reset();

      setTimeout(() => { feedback.textContent = ''; feedback.className = 'form-feedback'; }, 5000);
    }, 1800);
  });

  // Real-time border feedback on inputs
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      const valid = field.checkValidity();
      field.style.borderColor = valid || !field.value
        ? ''
        : '#ff5c5c';
    });
  });
})();


/* ========== 9. SMOOTH HOVER TILT on Project Cards ========== */
(function initTilt() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-8px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ========== 10. NAV LINK RIPPLE EFFECT ========== */
(function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);
      circle.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        top:${e.clientY - rect.top - size/2}px;
        left:${e.clientX - rect.left - size/2}px;
        border-radius:50%; background:rgba(255,255,255,0.15);
        transform:scale(0); animation:ripple 0.5s ease-out forwards;
        pointer-events:none; z-index:0;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  // Inject ripple keyframe if not present
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }';
    document.head.appendChild(s);
  }
})();


/* ========== 11. SECTION ENTRANCE COUNTER (stats) ========== */
(function initCounters() {
  // Animate number in stat chips when they enter view
  document.querySelectorAll('.stat-num').forEach(el => {
    const text = el.textContent.trim();
    const num  = parseInt(text);
    if (isNaN(num)) return;

    const suffix = text.replace(String(num), '');
    el.textContent = '0' + suffix;

    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.unobserve(el);
      let start = 0;
      const end      = num;
      const duration = 1200;
      const step     = duration / end;
      const timer    = setInterval(() => {
        start++;
        el.textContent = start + suffix;
        if (start >= end) clearInterval(timer);
      }, step);
    }, { threshold: 0.8 });

    obs.observe(el);
  });
})();
