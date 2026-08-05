/* ═══════════════════════════════════════════════════════════════
   BERSEY v2 — sayfa başı Higgsfield model scrub'ı (hf-scrub.js)
   .hero-3d.hf içindeki canvas[data-src][data-count] karelerini
   sayfa scroll'una bağlar: kaydırdıkça model döner/oynar.
   prefers-reduced-motion → ilk kare sabit.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var canvas = document.querySelector('.hero-3d.hf canvas[data-src]');
  if (!canvas) return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var pre = canvas.getAttribute('data-src');
  var N = parseInt(canvas.getAttribute('data-count'), 10) || 0;
  if (!N) return;
  var frames = [], current = 0;

  function src(i) { return pre + String(i + 1).padStart(3, '0') + '.webp'; }
  function draw(i) {
    var img = null, j = i;
    while (j >= 0 && !(frames[j] && frames[j].complete && frames[j].naturalWidth)) j--;
    if (j >= 0) img = frames[j];
    if (!img) return;
    var cw = canvas.width, ch = canvas.height,
        s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight),
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

  var order = [0];
  for (var st = 8; st >= 1; st = st >> 1)
    for (var k = 0; k < N; k += st) if (order.indexOf(k) < 0) order.push(k);
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

  resize(); addEventListener('resize', resize);
  if (reduced) return;

  /* sayfanın ilk ~2.2 ekran boyu kaydırması modeli tam tur döndürür;
     sonrasında kare son konumda kalır (tekrar yukarı çıkınca geri döner) */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var p = Math.min(1, Math.max(0, (scrollY || 0) / (innerHeight * 2.2)));
      var f = Math.min(N - 1, Math.round(p * (N - 1)));
      if (f !== current) { current = f; draw(f); }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
