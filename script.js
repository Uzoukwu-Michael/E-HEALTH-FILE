    // Theme setup
    (function setupTheme() {
      try {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const html = document.documentElement;
        if (!html.getAttribute('data-theme')) {
          html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
        const updateMetaTheme = () => {
          const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--grad-1').trim() || '#0ea5e9';
          const meta = document.querySelector('meta[name="theme-color"]');
          if (meta) meta.setAttribute('content', themeColor);
        }
        updateMetaTheme();

        const toggleButtons = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')].filter(Boolean);
        toggleButtons.forEach(btn => btn.addEventListener('click', () => {
          const current = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          html.setAttribute('data-theme', current);
          toggleButtons.forEach(b => b.setAttribute('aria-pressed', String(current === 'dark')));
          updateMetaTheme();
        }));
      } catch (e) { /* noop for sandbox */ }
    })();

    // Mobile nav
    (function mobileNav() {
      const toggle = document.getElementById('navToggle');
      const menu = document.getElementById('mobileNav');
      const primary = document.getElementById('primaryNav');
      if (!toggle || !menu || !primary) return;

      function open() {
        menu.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
      function close() {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
      toggle.addEventListener('click', () => {
        if (menu.classList.contains('hidden')) open(); else close();
      });
      menu.addEventListener('click', (e) => {
        if (e.target.closest('a')) close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });
    })();

    // Smooth scroll for anchor links
    (function smoothAnchor() {
      document.documentElement.style.scrollBehavior = 'smooth';
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (id.length > 1 && document.querySelector(id)) {
            // Default smooth scroll via CSS; no need to prevent default unless custom offset
          }
        });
      });
    })();

    // AOS init
    AOS.init({ duration: 700, offset: 80, once: true });

    // Swiper init
    const swiper = new Swiper('#testimonialSwiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 6000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      keyboard: { enabled: true },
      breakpoints: { 768: { slidesPerView: 1 }, 1024: { slidesPerView: 2 } }
    });

    // Lazy load images (IntersectionObserver)
    (function lazyImages() {
      const imgs = document.querySelectorAll('img.lazy');
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.getAttribute('data-src');
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
              }
              img.addEventListener('error', () => img.removeAttribute('src'), { once: true });
              img.classList.remove('lazy');
              obs.unobserve(img);
            }
          });
        }, { rootMargin: '200px' });
        imgs.forEach(img => io.observe(img));
      } else {
        imgs.forEach(img => img.src = img.getAttribute('data-src'));
      }
    })();

    // Animated counters
    (function counters() {
      const els = document.querySelectorAll('.count');
      if (!('IntersectionObserver' in window)) return;
      const easeOutQuad = (t) => t * (2 - t);
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target') || '0', 10);
            const duration = 1400;
            const startTime = performance.now();
            function tick(now) {
              const p = Math.min((now - startTime) / duration, 1);
              el.textContent = Math.floor(easeOutQuad(p) * target);
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.4 });
      els.forEach(el => io.observe(el));
    })();

    // Video modal
    (function videoModal() {
      const openBtn = document.getElementById('watchVideoBtn');
      const modal = document.getElementById('videoModal');
      const closeBtn = document.getElementById('closeVideo');
      const frame = document.getElementById('videoFrame');
      if (!openBtn || !modal || !closeBtn || !frame) return;

      const open = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Use a privacy-friendly sample video (placeholder)
        frame.src = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';
        closeBtn.focus();
      };
      const close = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        frame.src = '';
        openBtn.focus();
      };

      openBtn.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      modal.addEventListener('click', (e) => { if (e.target === modal || e.target.classList.contains('bg-black/70')) close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
    })();

    // Form validation (real-time + submit)
    (function formValidation() {
      const form = document.getElementById('bookingForm');
      const errors = document.getElementById('formErrors');
      const success = document.getElementById('formSuccess');
      if (!form) return;

      const fields = Array.from(form.querySelectorAll('input[required], select[required]'));

      const validators = {
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        phone: (v) => /^[0-9+\-\s()]{7,}$/.test(v.trim())
      };

      function validateField(el) {
        const name = el.getAttribute('name');
        const val = (el.value || '').trim();
        if (!val) return `${name} is required`;
        if (validators[name] && !validators[name](val)) return `Please enter a valid ${name}`;
        return '';
      }

      function showError(msgs) {
        if (!msgs.length) {
          errors.classList.add('hidden');
          errors.textContent = '';
          return;
        }
        errors.textContent = 'Please fix the following: ' + msgs.join(', ');
        errors.classList.remove('hidden');
      }

      function showSuccess(msg) {
        if (!msg) { success.classList.add('hidden'); success.textContent = ''; return; }
        success.textContent = msg;
        success.classList.remove('hidden');
      }

      fields.forEach(el => {
        el.addEventListener('input', () => {
          const msg = validateField(el);
          el.setAttribute('aria-invalid', String(Boolean(msg)));
          el.classList.toggle('outline', Boolean(msg));
          el.classList.toggle('outline-rose-500', Boolean(msg));
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const messages = [];
        fields.forEach(el => {
          const msg = validateField(el);
          el.setAttribute('aria-invalid', String(Boolean(msg)));
          el.classList.toggle('outline', Boolean(msg));
          el.classList.toggle('outline-rose-500', Boolean(msg));
          if (msg) messages.push(msg);
        });

        if (messages.length) {
          showSuccess('');
          showError(messages);
          return;
        }

        showError([]);
        showSuccess('Thanks! Your appointment request has been received. We will contact you shortly.');
        form.reset();
      });
    })();

    // Newsletter
    (function newsletter() {
      const form = document.getElementById('newsletterForm');
      const msg = document.getElementById('newsletterMsg');
      if (!form || !msg) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 4000);
        form.reset();
      });
    })();

    // Nav active highlight on scroll
    (function navHighlight() {
      const sections = ['home','about','services','stories','team','contact','appointment'].map(id => document.getElementById(id)).filter(Boolean);
      const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
      if (!('IntersectionObserver' in window) || !sections.length) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(a => {
              const ok = a.getAttribute('href') === ('#' + entry.target.id);
              a.style.background = ok ? 'rgba(148,163,184,0.12)' : 'transparent';
            });
          }
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, .25, .5, .75, 1] });
      sections.forEach(s => io.observe(s));
    })();
