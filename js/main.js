/* ============================================================
   SmileCare Dental Clinic — Main Script
   ============================================================ */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const pre = $('#preloader');
    setTimeout(() => pre && pre.classList.add('hidden'), 500);
  });

  /* ---------- Header scroll state ---------- */
  const header = $('#siteHeader');
  const backToTop = $('#backToTop');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    backToTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = $('#navToggle');
  const mainNav = $('#mainNav');
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-link', mainNav).forEach(link =>
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    })
  );

  /* ---------- Active nav link on scroll (scrollspy) ---------- */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  const spy = () => {
    const pos = window.scrollY + 120;
    let current = '';
    sections.forEach(sec => {
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        current = sec.id;
      }
    });
    navLinks.forEach((l) => {
      const href = l.getAttribute('href');
      const isActive = (!current && href === '#home') || href === '#' + current;
      l.classList.toggle('active', isActive);
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = $$('.stat-num');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      counterIO.unobserve(el);
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1800;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(eased * target);
        el.textContent = val.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterIO.observe(c));

  /* ---------- Service filter ---------- */
  const filterBtns = $$('.filter-btn');
  const serviceCards = $$('.service-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      serviceCards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.classList.add('in-view'); // keep visible when shown
          // re-trigger animation
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = '';
        }
      });
    });
  });

  /* ---------- Testimonials slider ---------- */
  const slides = $$('.slide');
  const dotsWrap = $('#dots');
  let currentSlide = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = $$('.dot', dotsWrap);

  function goToSlide(i) {
    currentSlide = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === currentSlide));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
    restartAuto();
  }
  function next() { goToSlide(currentSlide + 1); }
  function prev() { goToSlide(currentSlide - 1); }

  function restartAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(next, 6000);
  }

  $('#nextSlide').addEventListener('click', next);
  $('#prevSlide').addEventListener('click', prev);
  restartAuto();

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach(item => {
    const q = $('.faq-question', item);
    const answer = $('.faq-answer', item);
    q.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(isOpen));
      answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : '0px';
      // close others
      $$('.faq-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          $('.faq-question', other).setAttribute('aria-expanded', 'false');
          $('.faq-answer', other).style.maxHeight = '0px';
        }
      });
    });
  });

  /* ---------- Appointment form (validation + fake submit) ---------- */
  const form = $('#appointmentForm');
  const successBox = $('#formSuccess');

  function setInvalid(input, valid) {
    const group = input.closest('.form-group');
    if (valid) {
      group.classList.remove('invalid');
      $('.error-msg', group).textContent = '';
    } else {
      group.classList.add('invalid');
    }
  }

  const validators = {
    name: v => v.trim().length >= 2 || 'Please enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
    phone: v => /^[+\d][\d\s().-]{7,}$/.test(v) || 'Please enter a valid phone number.',
    date: v => v !== '' || 'Please choose a date.'
  };

  function validateField(input) {
    const fn = validators[input.name];
    if (!fn) return true;
    const msg = fn(input.value);
    const group = input.closest('.form-group');
    if (msg === true) {
      setInvalid(input, true);
      return true;
    }
    setInvalid(input, false);
    $('.error-msg', group).textContent = msg;
    return false;
  }

  ['name', 'email', 'phone', 'date'].forEach(key => {
    const input = form.elements[key];
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-group').classList.contains('invalid')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    ['name', 'email', 'phone', 'date'].forEach(key => {
      const input = form.elements[key];
      if (!validateField(input)) valid = false;
    });
    if (!valid) return;

    // Save booking to localStorage (demo persistence)
    const booking = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      service: form.elements.service.value,
      date: form.elements.date.value,
      time: form.elements.time.value,
      notes: form.elements.notes.value.trim(),
      at: new Date().toISOString()
    };
    const bookings = JSON.parse(localStorage.getItem('smilecare_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('smilecare_bookings', JSON.stringify(bookings));

    // Show success
    successBox.classList.add('show');
    form.querySelectorAll('input, textarea').forEach(i => (i.value = ''));
    form.elements.service.selectedIndex = 0;
    form.elements.time.selectedIndex = 0;
    form.elements.date.value = '';

    setTimeout(() => successBox.classList.remove('show'), 6000);
  });

  /* ---------- Set min date = today ---------- */
  const dateInput = $('#fDate');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  /* ---------- Back to top ---------- */
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

})();
