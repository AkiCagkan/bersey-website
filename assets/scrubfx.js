/* ══════════════════════════════════════════════════════════════
   BERSEY — scrubfx.js (v2 MONOLITH geçiş dili, tüm sitede)
   1) Mıknatıslı butonlar (.btn, .nav-cta) — bağımlılıksız
   2) [data-scrub] fotogerçekçi kare-dizisi hero (GSAP ScrollTrigger)
   GSAP yoksa / reduced-motion'da statik ilk kare gösterilir.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Mıknatıslı butonlar ── */
  if (matchMedia('(pointer: fine)').matches && !reduced) {
    var MAG_SEL = '.btn, .nav-cta, .fuel-tab, .tabbar a';
    document.addEventListener('pointerover', function (e) {
      var b = e.target.closest && e.target.closest(MAG_SEL);
      if (!b || b.__mag) return;
      b.__mag = true;
      var rect = null;
      b.addEventListener('pointerenter', function () {
        rect = b.getBoundingClientRect();
        b.style.transition = 'transform .18s cubic-bezier(.2,.7,.3,1)';
      });
      b.addEventListener('pointermove', function (ev) {
        if (!rect) rect = b.getBoundingClientRect();
        var dx = (ev.clientX - rect.left - rect.width / 2) * 0.28,
            dy = (ev.clientY - rect.top - rect.height / 2) * 0.28;
        b.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () {
        rect = null;
        b.style.transition = 'transform .6s cubic-bezier(.16,1.4,.3,1)';
        b.style.transform = 'translate(0,0)';
      });
    }, { passive: true });
  }

  /* ── 2 · Kare-dizisi scrub ── */
  var box = document.querySelector('[data-scrub]');
  if (!box) return;
  var canvas = box.querySelector('.scrub-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var COUNT = parseInt(box.getAttribute('data-scrub-count'), 10) || 0;
  var PRE = box.getAttribute('data-scrub-src') || '';
  var EXT = box.getAttribute('data-scrub-ext') || '.webp';
  var frames = [], current = 0;

  function src(i) { return PRE + String(i + 1).padStart(3, '0') + EXT; }
  function draw(i) {
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
    var r = canvas.parentElement.getBoundingClientRect();
    var dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    draw(current);
  }
  resize(); addEventListener('resize', resize);

  /* kareleri kaba→ince sırayla, 6'lı eşzamanlılıkla yükle */
  var order = [0], st, k;
  for (st = 8; st >= 1; st = st >> 1)
    for (k = 0; k < COUNT; k += st) if (order.indexOf(k) < 0) order.push(k);
  var inflight = 0, qi = 0;
  (function pump() {
    while (inflight < 6 && qi < order.length) {
      (function (idx) {
        var im = new Image();
        inflight++;
        im.onload = im.onerror = function () {
          inflight--;
          if (idx === 0 || Math.abs(idx - current) < 3) draw(current);
          pump();
        };
        im.src = src(idx); frames[idx] = im;
      })(order[qi++]);
    }
  })();

  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (reduced || !hasGsap || !COUNT) { box.classList.add('scrub-static'); return; }
  gsap.registerPlugin(ScrollTrigger);

  var cap = box.querySelector('.scrub-cap'),
      capB = cap ? cap.querySelector('b') : null,
      capS = cap ? cap.querySelector('small') : null;
  var PHASES = [].map.call(box.querySelectorAll('.scrub-phases span'), function (s) {
    return { at: parseFloat(s.getAttribute('data-at')) || 0.5,
             eyb: s.getAttribute('data-eyb') || '', t: s.textContent };
  });
  var fadeEls = box.querySelectorAll('[data-scrub-fade]');
  var hint = box.querySelector('.scrub-hint');

  var pobj = { p: 0 };
  gsap.to(pobj, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: box, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
    onUpdate: function () {
      var f = Math.min(COUNT - 1, Math.round(pobj.p * (COUNT - 1)));
      if (f !== current) { current = f; draw(f); }
      if (cap && PHASES.length) {
        var op = 0, ph = null;
        PHASES.forEach(function (x) {
          if (Math.abs(pobj.p - x.at) < 0.11) { ph = x; op = 1 - Math.abs(pobj.p - x.at) / 0.11; }
        });
        cap.style.opacity = op.toFixed(3);
        if (ph && capB && capB.textContent !== ph.t) { capB.textContent = ph.t; capS.textContent = ph.eyb; }
      }
    }
  });
  if (fadeEls.length) gsap.to(fadeEls, { yPercent: -14, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: box, start: 'top top', end: '34% bottom', scrub: 0.4 } });
  if (hint) gsap.to(hint, { opacity: 0,
    scrollTrigger: { trigger: box, start: 'top top', end: '10% bottom', scrub: true } });
})();
