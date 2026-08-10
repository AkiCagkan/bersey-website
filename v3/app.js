/* ═══════════════════════════════════════════════════════════════
   BERSEY v3 ELEGANT — hafif etkileşim · kütüphanesiz
   IntersectionObserver reveal + sayaç + mobil menü + üstbilgi gölgesi
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  if (reduced || !hasIO) document.body.classList.add('reduced');
  else document.documentElement.classList.add('js');

  /* ── üstbilgi gölgesi ── */
  var hd = document.getElementById('hd');
  function onScroll() { if (hd) hd.classList.toggle('scrolled', scrollY > 8); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ── reveal ── */
  if (!reduced && hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('[data-rv]').forEach(function (el) { io.observe(el); });
  }

  /* ── sayaçlar ── */
  function fmtVal(el, n) {
    var f = el.getAttribute('data-format');
    if (!f) return String(n);
    var loc = { tr: 'tr-TR', en: 'en-US', ru: 'ru-RU' }[f] || 'tr-TR';
    return n.toLocaleString(loc);
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0,
        t0 = null, DUR = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / DUR),
          e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtVal(el, Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('b[data-count]');
  if (reduced || !hasIO) {
    counters.forEach(function (el) {
      el.textContent = fmtVal(el, parseFloat(el.getAttribute('data-count')) || 0);
    });
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }
})();

/* ── mobil menü ── */
(function () {
  var menuBtn = document.getElementById('menu-btn'), nav = document.getElementById('site-nav');
  if (!menuBtn || !nav) return;
  function setOpen(o) {
    nav.classList.toggle('open', o);
    menuBtn.setAttribute('aria-expanded', String(o));
    menuBtn.textContent = o ? '✕' : '☰';
  }
  menuBtn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false);
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false);
  });
})();
