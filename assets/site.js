/* ══════════════════════════════════════════════════════════
   BERSEY — Ortak davranışlar (site.js)
   GSAP + ScrollTrigger + Lenis (CDN) sayfada önce yüklenir.
   Bileşenler: mobil menü, yumuşak kaydırma, çapa, reveal, ilerleme,
   sekmeler (tab), akordeon, filtre, lightbox, sticky tab scroll-spy.
   GSAP yoksa .js sınıfı eklenmez → içerik görünür kalır.
   ══════════════════════════════════════════════════════════ */
(function () {
  var prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__prefersReduced = prefersReduced;
  window.__lenis = null;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  window.__hasGsap = hasGsap;

  /* Mobil menü */
  var nav = document.getElementById('site-nav');
  var menuBtn = document.getElementById('menu-btn');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }
  function closeMenu() {
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  /* Çapa kaydırma (sayfa içi) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault(); closeMenu();
      if (window.__lenis) window.__lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      else { var y = target.getBoundingClientRect().top + scrollY - 70; scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' }); }
    });
  });
  document.querySelectorAll('nav a:not([href^="#"])').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* Sekmeler (data-tab / data-panel) — ürün ve yakıt sekmeleri */
  document.querySelectorAll('[data-tabgroup]').forEach(function (group) {
    var tabs = group.querySelectorAll('[data-tab]');
    var panels = group.querySelectorAll('[data-panel]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
        panels.forEach(function (p) { p.style.display = (p.getAttribute('data-panel') === key) ? '' : 'none'; });
      });
    });
  });

  /* Akordeon */
  document.querySelectorAll('.acc-head').forEach(function (h) {
    h.addEventListener('click', function () { h.closest('.acc').classList.toggle('open'); });
  });

  /* Filtre butonları (data-filter → .pcard[data-country]) */
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter');
        filterBtns.forEach(function (x) { x.classList.toggle('active', x === b); });
        document.querySelectorAll('[data-country]').forEach(function (card) {
          var show = (f === 'all' || card.getAttribute('data-country') === f);
          card.style.display = show ? '' : 'none';
          /* data-reveal ile opacity:0'da takılı kalmasın — filtre açık bir eylem */
          if (show) { card.style.opacity = 1; card.style.transform = 'none'; }
        });
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
    });
  }

  /* Lightbox (galeri + [data-lightbox] işaretli her görsel) */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.cap');
    var figs = [].slice.call(document.querySelectorAll('.gallery figure, [data-lightbox]'));
    var idx = 0;
    function imgOf(el) { return el.tagName === 'IMG' ? el : el.querySelector('img'); }
    function open(i) { idx = (i + figs.length) % figs.length;
      var im = imgOf(figs[idx]); if (!im) return; lbImg.src = im.src;
      if (lbCap) lbCap.textContent = im.alt || ''; lb.classList.add('open'); }
    figs.forEach(function (f, i) { f.style.cursor = 'zoom-in';
      f.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.x').addEventListener('click', function () { lb.classList.remove('open'); });
    var nx = lb.querySelector('.next'), pv = lb.querySelector('.prev');
    if (nx) nx.addEventListener('click', function () { open(idx + 1); });
    if (pv) pv.addEventListener('click', function () { open(idx - 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowRight') open(idx + 1);
      if (e.key === 'ArrowLeft') open(idx - 1);
    });
  }

  if (!hasGsap) return;
  document.documentElement.classList.add('js');
  document.body.classList.add('js');
  gsap.registerPlugin(ScrollTrigger);

  /* Yumuşak kaydırma */
  if (!prefersReduced && typeof Lenis !== 'undefined') {
    var lenis = new Lenis({ smoothWheel: true, lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  /* Reveal */
  if (!prefersReduced) {
    var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
    gsap.set(items, { opacity: 0, y: 32 });
    ScrollTrigger.batch(items, { start: 'top 88%', once: true, onEnter: function (b) {
      gsap.to(b, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .08, overwrite: true });
    }});
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* İlerleme çubuğu */
  var pr = document.getElementById('progress');
  if (pr) gsap.to(pr, { scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 } });

  /* Sticky tab scroll-spy (ürün sayfaları — .tabbar a[href^="#"]) */
  var spy = document.querySelectorAll('.tabbar a[href^="#"]');
  if (spy.length) {
    spy.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute('href'));
      if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 40%', end: 'bottom 40%',
        onToggle: function (self) { if (self.isActive) {
          spy.forEach(function (x) { x.classList.remove('active'); }); a.classList.add('active');
        }}});
    });
  }
})();
