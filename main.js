/* ============================================================
   SCALESYNC — main.js
   Módulos: Partículas · Card Glow · Scroll Reveal · Tooltip
   ============================================================ */

'use strict';

/* ─── 1. PARTÍCULAS ──────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 120;
  let particles = [];
  let rafId = null;
  let isVisible = true;

  /* Redimensiona o canvas evitando calls redundantes com debounce */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* Debounce para evitar múltiplos resize desnecessários */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x       = Math.random() * canvas.width;
      this.y       = Math.random() * canvas.height;
      this.r       = Math.random() * 1.5 + 0.3;
      this.vx      = (Math.random() - 0.5) * 0.4;
      this.vy      = (Math.random() - 0.5) * 0.4;
      this.life    = Math.random();
      this.maxLife = Math.random() * 0.015 + 0.003;
      /* Alterna entre cyan e roxo */
      this.color   = Math.random() > 0.5 ? '0,240,255' : '123,46,255';
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.life += this.maxLife;

      /* Reseta quando sai da tela ou termina o ciclo de vida */
      if (
        this.life > 1 ||
        this.x < 0 || this.x > canvas.width ||
        this.y < 0 || this.y > canvas.height
      ) {
        this.reset();
      }
    }

    draw() {
      const alpha = Math.sin(this.life * Math.PI) * 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${alpha})`;
      ctx.fill();
    }
  }

  /* Inicializa partículas */
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animate() {
    /* Pausa animação se a aba estiver oculta — economiza CPU */
    if (!isVisible) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    rafId = requestAnimationFrame(animate);
  }

  animate();

  /* Pausa quando a aba perde o foco */
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });
})();


/* ─── 2. CARD MOUSE GLOW ─────────────────────────────────── */
(function initCardGlow() {
  /* Usa delegação de eventos — 1 listener em vez de N */
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.card, .plan-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';

    card.style.setProperty('--mx', x);
    card.style.setProperty('--my', y);
  });
})();


/* ─── 3. SCROLL REVEAL ───────────────────────────────────── */
(function initScrollReveal() {
  /* Agrupa todos os .reveal em um único IntersectionObserver */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;

      /* Stagger progressivo: cada elemento demora 80ms a mais */
      setTimeout(() => {
        entry.target.classList.add('visible');
        /* Remove will-change após animação para liberar memória GPU */
        entry.target.addEventListener(
          'transitionend',
          () => entry.target.style.willChange = 'auto',
          { once: true }
        );
      }, i * 80);

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => {
    el.style.willChange = 'opacity, transform';
    observer.observe(el);
  });
})();


/* ─── 4. TOOLTIP AUTO-HIDE ───────────────────────────────── */
(function initTooltip() {
  const tooltip = document.querySelector('.float-tooltip');
  if (!tooltip) return;

  /* Esconde após 6s usando opacity (GPU-only, sem reflow) */
  setTimeout(() => {
    tooltip.style.opacity = '0';
    tooltip.setAttribute('aria-hidden', 'true');
  }, 6000);
})();