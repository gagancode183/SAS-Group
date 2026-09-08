(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var rootEl = doc.documentElement;
  rootEl.classList.add('js', 'anim');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ============================================================
     1. Nav scroll state
     ============================================================ */
  var nav = doc.getElementById('siteNav');
  function onNavScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ============================================================
     2. Mobile menu
     ============================================================ */
  var toggle = doc.querySelector('.nav-toggle');
  var menu = doc.querySelector('.mobile-menu');
  var menuLinks = menu ? menu.querySelectorAll('a') : [];

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.style.overflow = open ? 'hidden' : '';
    menuLinks.forEach(function (a, i) {
      a.style.transitionDelay = open ? (0.12 + i * 0.08).toFixed(2) + 's' : '0s';
    });
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menuLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ============================================================
     3. Section navigation
     ============================================================ */
  var anchorLinks = doc.querySelectorAll('.site-nav .nav-link[href^="#"]');
  var anchorSections = [];

  anchorLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = doc.getElementById(id);
    if (section) anchorSections.push({ id: id, section: section });
    link.addEventListener('click', function () {
      anchorLinks.forEach(function (item) { item.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  if ('IntersectionObserver' in window && anchorSections.length) {
    var activeAnchorObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        anchorLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
    anchorSections.forEach(function (item) { activeAnchorObserver.observe(item.section); });
  }

  /* ============================================================
     3b. Editorial showcases — venture and food sliders
     ============================================================ */
  doc.querySelectorAll('[data-showcase]').forEach(function (showcase) {
    var panels = showcase.querySelectorAll('[data-showcase-panel]');
    var details = showcase.querySelectorAll('[data-showcase-detail]');
    var tabs = showcase.querySelectorAll('[data-showcase-index]');

    function selectShowcase(index) {
      var selected = Math.max(0, Math.min(index, panels.length - 1));
      panels.forEach(function (panel, i) { panel.classList.toggle('is-active', i === selected); });
      details.forEach(function (detail, i) { detail.classList.toggle('is-active', i === selected); });
      tabs.forEach(function (tab, i) {
        var active = i === selected;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        selectShowcase(parseInt(tab.getAttribute('data-showcase-index'), 10) || 0);
      });
      tab.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        var next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
        selectShowcase(next);
        tabs[next].focus();
      });
    });
    selectShowcase(0);
  });

  /* ============================================================
     4. Word-by-word split on key lines — [data-split]
     ============================================================ */
  function splitWords(el) {
    if (el.getAttribute('data-split-done')) return;
    el.setAttribute('data-split-done', '1');
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var base = parseFloat(el.getAttribute('data-split-delay')) || 0.5;
    words.forEach(function (w, i) {
      var span = doc.createElement('span');
      span.className = 'w';
      span.textContent = w;
      span.style.transitionDelay = (base + i * 0.12).toFixed(2) + 's';
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(doc.createTextNode(' '));
    });
  }
  doc.querySelectorAll('[data-split]').forEach(splitWords);

  /* ============================================================
     5. Reveal on scroll — .reveal, .reveal-mask, [data-split]
     ============================================================ */
  var revealEls = doc.querySelectorAll('.reveal, .reveal-mask, [data-split]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* ============================================================
     6. Hero — slow logo fade · ambient dust · parallax
     ============================================================ */
  function isLoaded() { rootEl.classList.add('is-loaded'); }
  if (doc.readyState === 'complete') isLoaded();
  else window.addEventListener('load', isLoaded, { once: true });

  var heroFx = doc.querySelector('.hero-fx');
  if (heroFx) {
    var inHomeHero = !!(heroFx.closest && heroFx.closest('.hero'));
    var plxSpeed = heroFx.hasAttribute('data-plx') ? parseFloat(heroFx.getAttribute('data-plx')) : 0.25;
    function updateParallax() {
      if (reduceMotion) return;
      heroFx.style.transform = 'translate3d(0,' + (-window.scrollY * plxSpeed).toFixed(1) + 'px,0)';
    }
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    if (!reduceMotion && inHomeHero) {
      for (var i = 0; i < 16; i++) {
        var mote = doc.createElement('i');
        var s = 1.5 + Math.random() * 3.2;
        mote.style.left = (4 + Math.random() * 88).toFixed(1) + '%';
        mote.style.width = s.toFixed(1) + 'px';
        mote.style.height = s.toFixed(1) + 'px';
        mote.style.setProperty('--dx', (Math.random() * 70 - 35).toFixed(0) + 'px');
        mote.style.animationDuration = (9 + Math.random() * 13).toFixed(1) + 's';
        mote.style.animationDelay = (Math.random() * 14).toFixed(1) + 's';
        heroFx.appendChild(mote);
      }
    }
  }

  /* ============================================================
     7. Soft single-colour cursor glow
     ============================================================ */
  if (finePointer && !reduceMotion) {
    var glow = doc.createElement('div');
    glow.className = 'cursor-glow';
    body.appendChild(glow);

    var gx = -400, gy = -400, cx = -400, cy = -400, on = false, raf;
    function loop() {
      cx += (gx - cx) * 0.11;
      cy += (gy - cy) * 0.11;
      glow.style.transform = 'translate(' + (cx - 190).toFixed(1) + 'px,' + (cy - 190).toFixed(1) + 'px)';
      raf = requestAnimationFrame(loop);
    }
    doc.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!on) { on = true; glow.classList.add('on'); }
    });
    var HOT = 'a, button, input, textarea, select, label, .venture-showcase, .food-showcase, .director-card, .culture-item, .link-arrow';
    doc.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOT)) glow.classList.add('hot');
    });
    doc.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOT)) glow.classList.remove('hot');
    });
    requestAnimationFrame(loop);
  }

  /* ============================================================
     8. Navigation — view transitions / Thindi palette exit
     ============================================================ */
  var sweep = doc.querySelector('.palette-sweep');
  var isWarm = body.classList.contains('theme-warm');

  function internalHref(a, e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return null;
    if (a.target === '_blank' || a.hasAttribute('download')) return null;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return null;
    if (href.indexOf('http') === 0 && href.indexOf(location.origin) !== 0) return null;
    if (href.charAt(0) !== '.' && href.charAt(0) !== '/' && href.indexOf('.html') === -1) return null;
    return href;
  }

  if (isWarm && sweep && !reduceMotion) {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = internalHref(a, e);
      if (!href) return;
      e.preventDefault();
      sweep.classList.add('exit');
      setTimeout(function () { window.location.href = href; }, 1850);
    });
  } else if (typeof doc.startViewTransition === 'function' && !reduceMotion) {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = internalHref(a, e);
      if (!href) return;
      e.preventDefault();
      doc.startViewTransition(function () {
        window.location.href = href;
      });
    });
  }

  /* ============================================================
     9. Contact form
     ============================================================ */
  var form = doc.getElementById('contactForm');
  var success = doc.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (success) success.classList.add('visible');
      form.querySelectorAll('input, textarea, select').forEach(function (el) {
        if (el.type !== 'submit') el.value = '';
      });
    });
  }

  /* ============================================================
     10. Footer year
     ============================================================ */
  doc.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
