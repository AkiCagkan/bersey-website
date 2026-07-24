/* ═══════════════════════════════════════════════════════════════
   BERSEY v2 MONOLITH — hareket motoru
   Lenis + GSAP ScrollTrigger · yalnız transform/opacity
   prefers-reduced-motion → tüm pin/scrub kapalı, içerik statik
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var doc = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var hasLenis = typeof Lenis !== 'undefined';
  if (!hasGsap || reduced) { document.body.classList.add('reduced'); }
  else doc.classList.add('js');

  /* ── HERO kare-dizisi (data-scrub ile sayfa bazlı; her modda ilk kare çizilir) ── */
  var scrubBox = document.querySelector('[data-scrub]');
  var FRAME_COUNT = scrubBox ? (parseInt(scrubBox.getAttribute('data-scrub-count'), 10) || 0) : (window.__FRAMES || 0);
  var FRAME_PRE = scrubBox ? (scrubBox.getAttribute('data-scrub-src') || 'frames/frame_') : 'frames/frame_';
  var canvas = document.getElementById('seq');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var frames = [], loaded = 0, current = 0;
  function src(i) { return FRAME_PRE + String(i + 1).padStart(3, '0') + '.webp'; }
  function draw(i) {
    if (!ctx) return;
    var img = null, j = i;
    while (j >= 0 && !(frames[j] && frames[j].complete && frames[j].naturalWidth)) j--;
    if (j >= 0) img = frames[j];
    if (!img) return;
    var cw = canvas.width, ch = canvas.height,
        s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight),
        w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function resize() {
    if (!canvas) return;
    var dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    draw(current);
  }
  if (canvas && FRAME_COUNT) {
    resize(); addEventListener('resize', resize);
    var order = [0];
    for (var st = 8; st >= 1; st = st >> 1)
      for (var k = 0; k < FRAME_COUNT; k += st) if (order.indexOf(k) < 0) order.push(k);
    var inflight = 0, qi = 0;
    (function pump() {
      while (inflight < 6 && qi < order.length) {
        (function (idx) {
          var im = new Image();
          inflight++;
          im.onload = im.onerror = function () {
            inflight--; loaded++;
            if (idx === 0 || Math.abs(idx - current) < 3) draw(current);
            pump();
          };
          im.src = src(idx); frames[idx] = im;
        })(order[qi++]);
      }
    })();
  }

  if (!hasGsap || reduced) return; /* statik mod: içerik CSS ile görünür */

  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis ── */
  var lenis = null;
  if (hasLenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.0 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); (lenis ? lenis.scrollTo(t, { offset: -20 }) : t.scrollIntoView()); }
    });
  });

  /* ── ilerleme çubuğu ── */
  gsap.to('#prog', { scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ── hero scrub: kare + başlık fazları ── */
  if (canvas && FRAME_COUNT) {
    var cap = document.querySelector('#hero .hcap'),
        capT = cap ? cap.querySelector('b') : null,
        capS = cap ? cap.querySelector('small') : null;
    var PHASES = [].map.call(document.querySelectorAll('#hero .scrub-phases span'), function (sp) {
      return { at: parseFloat(sp.getAttribute('data-at')) || 0.5,
               s: sp.getAttribute('data-eyb') || '', t: sp.textContent };
    });
    if (!PHASES.length) PHASES = [
      { at: 0.22, s: 'FAZ 01', t: 'Brülör grubu ayrılır' },
      { at: 0.46, s: 'FAZ 02', t: 'Ön kapak ve cidar açılır' },
      { at: 0.72, s: 'FAZ 03', t: 'Serpantin ve iç aksam' }
    ];
    var pobj = { p: 0 };
    gsap.to(pobj, {
      p: 1, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.4 },
      onUpdate: function () {
        var f = Math.min(FRAME_COUNT - 1, Math.round(pobj.p * (FRAME_COUNT - 1)));
        if (f !== current) { current = f; draw(f); }
        if (cap) {
          var op = 0, ph = null;
          PHASES.forEach(function (x) { if (Math.abs(pobj.p - x.at) < 0.11) { ph = x; op = 1 - Math.abs(pobj.p - x.at) / 0.11; } });
          cap.style.opacity = op.toFixed(3);
          if (ph && capT && capT.textContent !== ph.t) { capT.textContent = ph.t; capS.textContent = ph.s; }
        }
      }
    });
    gsap.to('#hero .htxt', { yPercent: -18, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '38% bottom', scrub: 0.4 } });
    gsap.to('#hero .scrollhint', { opacity: 0,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '12% bottom', scrub: true } });
  }

  /* ── reveal'lar ── */
  ScrollTrigger.batch('[data-rv]', {
    start: 'top 88%', batchMax: 10, interval: 0.08,
    onEnter: function (els) {
      gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        stagger: 0.06, overwrite: true });
    }
  });
  ScrollTrigger.addEventListener('refreshInit', function () {
    document.querySelectorAll('[data-rv]').forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight * 0.88 && scrollY < 10 === false) return;
    });
  });

  /* ── sayaçlar ── */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0, o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
      gsap.to(o, { v: target, duration: 1.8, ease: 'power2.out',
        onUpdate: function () { el.textContent = String(Math.round(o.v)); } });
    }});
  });

  /* ── yatay galeri: çift sıra, zıt yönlü akış ── */
  var strip = document.querySelector('#galeri .hstrip');
  if (strip) {
    var items = Array.prototype.slice.call(strip.children);
    var rowA = document.createElement('div'), rowB = document.createElement('div');
    rowA.className = 'hstrip'; rowB.className = 'hstrip';
    items.forEach(function (el, i) { (i % 2 ? rowB : rowA).appendChild(el); });
    var shell = document.createElement('div');
    shell.className = 'hrows';
    strip.parentNode.replaceChild(shell, strip);
    shell.appendChild(rowA); shell.appendChild(rowB);
    var sec = document.getElementById('galeri');
    var spanOf = function (row) { return Math.max(0, row.scrollWidth - innerWidth); };
    gsap.set(rowB, { x: function () { return -spanOf(rowB); } });
    var dist = function () { return Math.max(spanOf(rowA), spanOf(rowB)); };
    var tl = gsap.timeline({ scrollTrigger: {
      trigger: sec, start: 'top top', end: function () { return '+=' + dist(); },
      pin: true, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1 } });
    tl.to(rowA, { x: function () { return -spanOf(rowA); }, ease: 'none' }, 0)
      .to(rowB, { x: 0, ease: 'none' }, 0);
  }

  /* ── mıknatıslı butonlar ── */
  if (matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn,[data-mag]').forEach(function (b) {
      var r = null;
      b.addEventListener('pointerenter', function () { r = b.getBoundingClientRect(); });
      b.addEventListener('pointermove', function (e) {
        if (!r) r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.32,
                     y: (e.clientY - r.top - r.height / 2) * 0.32,
                     duration: 0.3, ease: 'power2.out' });
      });
      b.addEventListener('pointerleave', function () {
        r = null;
        gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.45)' });
      });
    });
  }

  /* görseller yüklendikçe pin mesafelerini tazele */
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();

/* ── mobil menü (her modda çalışır) ── */
(function () {
  var menuBtn = document.getElementById('menu-btn'), nav = document.getElementById('site-nav');
  if (!menuBtn || !nav) return;
  menuBtn.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(o));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });
})();
