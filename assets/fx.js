/* ══════════════════════════════════════════════════════════
   BERSEY — Endüstri 4.0 efekt katmanı (fx.js)
   site.js'ten SONRA yüklenir. GSAP varsa zengin, yoksa statik düşer.
   Bileşenler: techgrid, hero paralaks, sayaç (data-count), 3D tilt,
   dikey zaman çizelgesi (.vtl), coğrafi ağ haritası (canvas.geo-map)
   ══════════════════════════════════════════════════════════ */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = matchMedia('(pointer: coarse)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ── Teknik ızgara enjeksiyonu (page-hero) ── */
  document.querySelectorAll('.page-hero').forEach(function (h) {
    if (h.hasAttribute('data-scrub')) return; /* scrub hero: video katmanı var */
    var d = document.createElement('div'); d.className = 'techgrid';
    var wrap = h.querySelector('.wrap');
    if (wrap && wrap.parentNode === h) h.insertBefore(d, wrap); else h.appendChild(d);
  });

  /* ── Hero paralaks ── */
  if (hasGsap && !reduced) {
    document.querySelectorAll('.page-hero .bgimg').forEach(function (bg) {
      if (bg.closest('[data-scrub]')) return; /* scrub hero kendi hareketini yönetir */
      gsap.to(bg, { yPercent: 16, ease: 'none',
        scrollTrigger: { trigger: bg.closest('.page-hero'), start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  /* ── Sayaç animasyonu: <span data-count="235" data-format="tr"> ── */
  var counters = document.querySelectorAll('[data-count]');
  function fmt(el, v) {
    var n = Math.round(v);
    el.textContent = (el.getAttribute('data-format') === 'tr') ? n.toLocaleString('tr-TR') : String(n);
  }
  if (counters.length) {
    if (reduced || !hasGsap) {
      counters.forEach(function (el) { fmt(el, parseFloat(el.getAttribute('data-count')) || 0); });
    } else {
      counters.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var o = { v: 0 }; fmt(el, 0);
        ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
          gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: function () { fmt(el, o.v); } });
        }});
      });
    }
  }

  /* ── 3D tilt (kartlar) — dokunmatikte kapalı ── */
  if (!isTouch && !reduced) {
    document.querySelectorAll('.card,.pcard,.ds-card,.doc-card').forEach(function (c) {
      var r = null;
      c.addEventListener('pointerenter', function () { r = c.getBoundingClientRect(); });
      c.addEventListener('pointermove', function (e) {
        if (!r) r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(900px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-2px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; r = null; });
    });
  }

  /* ── Dikey zaman çizelgesi ── */
  document.querySelectorAll('.vtl').forEach(function (vtl) {
    var prog = vtl.querySelector('.vtl-prog');
    if (prog) {
      if (hasGsap && !reduced) {
        gsap.fromTo(prog, { scaleY: 0 }, { scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: vtl, start: 'top 72%', end: 'bottom 55%', scrub: true } });
      } else prog.style.transform = 'scaleY(1)';
    }
    var items = vtl.querySelectorAll('.vtl-item');
    if (hasGsap && !reduced) {
      items.forEach(function (it) {
        ScrollTrigger.create({ trigger: it, start: 'top 72%',
          onEnter: function () { it.classList.add('on'); },
          onLeaveBack: function () { it.classList.remove('on'); } });
      });
    } else items.forEach(function (it) { it.classList.add('on'); });
  });

  /* ── Coğrafi harita v2: gerçek dünya nokta-matrisi (worldmap.js) + ışık kuyruklu ağlar ── */
  var MAPLANG = (document.documentElement.lang || 'tr').slice(0, 2).toLowerCase();
  if (MAPLANG !== 'en' && MAPLANG !== 'ru') MAPLANG = 'tr';
  var GEO_I18N = {
    'İSTANBUL': { en: 'ISTANBUL', ru: 'СТАМБУЛ' },
    'İSTANBUL · MERKEZ': { en: 'ISTANBUL · HQ', ru: 'СТАМБУЛ · ЦЕНТР' },
    'Rusya': { en: 'Russia', ru: 'Россия' },
    'Belarus': { en: 'Belarus', ru: 'Беларусь' },
    'Ukrayna': { en: 'Ukraine', ru: 'Украина' },
    'Romanya': { en: 'Romania', ru: 'Румыния' },
    'Bulgaristan': { en: 'Bulgaria', ru: 'Болгария' },
    'Sırbistan': { en: 'Serbia', ru: 'Сербия' },
    'Gürcistan': { en: 'Georgia', ru: 'Грузия' },
    'Azerbaycan': { en: 'Azerbaijan', ru: 'Азербайджан' },
    'Kazakistan': { en: 'Kazakhstan', ru: 'Казахстан' },
    'İran': { en: 'Iran', ru: 'Иран' },
    'Ürdün': { en: 'Jordan', ru: 'Иордания' },
    'S. Arabistan': { en: 'Saudi Arabia', ru: 'С. Аравия' },
    'Mısır': { en: 'Egypt', ru: 'Египет' },
    'Suriye': { en: 'Syria', ru: 'Сирия' },
    'Sudan': { en: 'Sudan', ru: 'Судан' },
    'Gana': { en: 'Ghana', ru: 'Гана' }
  };
  function geoName(n) {
    var d = GEO_I18N[n];
    return (MAPLANG !== 'tr' && d && d[MAPLANG]) ? d[MAPLANG] : n;
  }
  var HUB = { name: geoName('İSTANBUL'), lat: 41.0, lon: 28.98 };
  var NODES = [
    { name: 'Rusya', lat: 55.75, lon: 37.62, lm: 'kremlin' },
    { name: 'Belarus', lat: 53.9, lon: 27.56, lm: 'castle' },
    { name: 'Ukrayna', lat: 50.45, lon: 30.52, lm: 'onion' },
    { name: 'Romanya', lat: 44.43, lon: 26.10, lm: 'bran' },
    { name: 'Bulgaristan', lat: 42.70, lon: 23.32, lm: 'dome' },
    { name: 'Sırbistan', lat: 44.79, lon: 20.45, lm: 'dome' },
    { name: 'Gürcistan', lat: 41.72, lon: 44.78, lm: 'mountain' },
    { name: 'Azerbaycan', lat: 40.41, lon: 49.87, lm: 'flames' },
    { name: 'Kazakistan', lat: 51.16, lon: 71.45, lm: 'baiterek' },
    { name: 'İran', lat: 35.69, lon: 51.39, lm: 'azadi' },
    { name: 'Ürdün', lat: 31.95, lon: 35.93, lm: 'petra' },
    { name: 'S. Arabistan', lat: 24.71, lon: 46.68, lm: 'kaaba' },
    { name: 'Mısır', lat: 30.04, lon: 31.24, lm: 'pyramids' },
    { name: 'Suriye', lat: 34.6, lon: 38.3, minor: true, lm: 'minaret' },
    { name: 'Sudan', lat: 15.50, lon: 32.55, minor: true, lm: 'meroe' },
    { name: 'Gana', lat: 7.9, lon: -1.0, minor: true, lm: 'star' }
  ];
  NODES.forEach(function (n) { n.name = geoName(n.name); });
  var HUB_LABEL = geoName('İSTANBUL · MERKEZ');
  /* ── Ülke anıtları: RENKLİ mini illüstrasyonlar (dolgu + kontur + ışıltı) ──
     Her fonksiyon kendi renklerini basar; F=fill yardımcıcı, S=stroke ── */
  function F(c, color) { c.fillStyle = color; c.fill(); }
  function S(c, color, w) { c.strokeStyle = color || 'rgba(5,30,51,.5)'; c.lineWidth = w || 1; c.stroke(); }
  var LMK_COLOR = {
    pyramids: function (c, s) {
      c.beginPath(); c.moveTo(-9 * s, 0); c.lineTo(-3.5 * s, -8 * s); c.lineTo(2 * s, 0); c.closePath();
      F(c, '#E9C46A'); S(c);
      c.beginPath(); c.moveTo(-3.5 * s, -8 * s); c.lineTo(-2.2 * s, 0); c.lineTo(2 * s, 0); c.closePath();
      F(c, '#C99B45');
      c.beginPath(); c.moveTo(0, 0); c.lineTo(5 * s, -5.5 * s); c.lineTo(9.5 * s, 0); c.closePath();
      F(c, '#E9C46A'); S(c);
      c.beginPath(); c.moveTo(5 * s, -5.5 * s); c.lineTo(6 * s, 0); c.lineTo(9.5 * s, 0); c.closePath();
      F(c, '#C99B45');
    },
    mosque: function (c, s) {
      c.beginPath(); c.moveTo(-6 * s, 0); c.lineTo(-6 * s, -3.5 * s);
      c.arc(0, -3.5 * s, 6 * s, Math.PI, 0); c.lineTo(6 * s, 0); c.closePath();
      F(c, '#DCE9F2'); S(c);
      c.beginPath(); c.arc(0, -3.5 * s, 6 * s, Math.PI, Math.PI * 1.5);
      c.lineTo(0, -3.5 * s); c.closePath(); F(c, '#B8D4E6');
      [-1, 1].forEach(function (side) {
        c.beginPath();
        c.moveTo(side * 10 * s, 0); c.lineTo(side * 10 * s, -10 * s);
        c.lineTo(side * 9.2 * s, -12.5 * s); c.lineTo(side * 8.4 * s, -10 * s);
        c.lineTo(side * 8.4 * s, 0); c.closePath();
        F(c, '#EAF2F8'); S(c);
      });
      c.beginPath(); c.arc(0, -10.6 * s, 1.1 * s, 0.6, 5.2); S(c, '#E8B84B', 1.4 * s);
    },
    kremlin: function (c, s) {
      c.beginPath(); c.moveTo(-4 * s, 0); c.lineTo(-4 * s, -7 * s); c.lineTo(4 * s, -7 * s); c.lineTo(4 * s, 0); c.closePath();
      F(c, '#C75146'); S(c);
      c.beginPath(); c.moveTo(-4 * s, -7 * s);
      c.quadraticCurveTo(-3 * s, -10 * s, 0, -12 * s);
      c.quadraticCurveTo(3 * s, -10 * s, 4 * s, -7 * s); c.closePath();
      F(c, '#E8B84B'); S(c);
      c.beginPath(); c.moveTo(0, -12 * s); c.lineTo(0, -14 * s); S(c, '#E8B84B', 1.2);
      c.beginPath(); c.arc(0, -14.3 * s, 0.9 * s, 0, 7); F(c, '#F2CE6B');
      c.beginPath(); c.arc(0, -3.5 * s, 1.3 * s, 0, 7); F(c, '#F4F7F9');
    },
    castle: function (c, s) {
      c.beginPath();
      c.moveTo(-5 * s, 0); c.lineTo(-5 * s, -7 * s); c.lineTo(-3.4 * s, -7 * s); c.lineTo(-3.4 * s, -8.5 * s);
      c.lineTo(-1.7 * s, -8.5 * s); c.lineTo(-1.7 * s, -7 * s); c.lineTo(1.7 * s, -7 * s); c.lineTo(1.7 * s, -8.5 * s);
      c.lineTo(3.4 * s, -8.5 * s); c.lineTo(3.4 * s, -7 * s); c.lineTo(5 * s, -7 * s); c.lineTo(5 * s, 0); c.closePath();
      F(c, '#D9C3A3'); S(c);
      c.beginPath(); c.moveTo(-1.2 * s, 0); c.lineTo(-1.2 * s, -3.6 * s);
      c.arc(0, -3.6 * s, 1.2 * s, Math.PI, 0); c.lineTo(1.2 * s, 0); c.closePath();
      F(c, '#7A5C3E');
    },
    onion: function (c, s) {
      function kub(x, h, r, col) {
        c.beginPath(); c.moveTo((x - r) * s, 0); c.lineTo((x - r) * s, -h * s);
        c.quadraticCurveTo((x - r) * s, -(h + 2.6) * s, x * s, -(h + 3.6) * s);
        c.quadraticCurveTo((x + r) * s, -(h + 2.6) * s, (x + r) * s, -h * s);
        c.lineTo((x + r) * s, 0); c.closePath();
        F(c, '#EAF2F8'); S(c);
        c.beginPath(); c.moveTo(x * s, -(h + 3.6) * s);
        c.quadraticCurveTo((x + r) * s, -(h + 2.6) * s, (x + r) * s, -h * s);
        c.lineTo(x * s, -h * s); c.closePath(); F(c, col);
        c.beginPath(); c.arc(x * s, -(h + 3.6) * s, 0.55 * s, 0, 7); F(c, col);
      }
      kub(-4.5, 4, 1.5, '#F0C75E'); kub(0, 7.2, 1.6, '#F0C75E'); kub(4.5, 4, 1.5, '#F0C75E');
    },
    bran: function (c, s) {
      c.beginPath(); c.moveTo(-3.5 * s, 0); c.lineTo(-3.5 * s, -8 * s); c.lineTo(3.5 * s, -8 * s); c.lineTo(3.5 * s, 0); c.closePath();
      F(c, '#E7DAC4'); S(c);
      c.beginPath(); c.moveTo(-4.2 * s, -8 * s); c.lineTo(0, -12.5 * s); c.lineTo(4.2 * s, -8 * s); c.closePath();
      F(c, '#B0413E'); S(c);
      c.beginPath(); c.rect(-0.9 * s, -4 * s, 1.8 * s, 4 * s); F(c, '#6E5844');
    },
    dome: function (c, s) {
      c.beginPath(); c.moveTo(-5 * s, 0); c.lineTo(-5 * s, -4 * s);
      c.arc(0, -4 * s, 5 * s, Math.PI, 0); c.lineTo(5 * s, 0); c.closePath();
      F(c, '#EAF2F8'); S(c);
      c.beginPath(); c.arc(0, -4 * s, 5 * s, Math.PI, 0); c.lineTo(5 * s, -4 * s); c.closePath();
      F(c, '#4E9B6E');
      c.beginPath(); c.moveTo(0, -9.2 * s); c.lineTo(0, -12 * s); S(c, '#E8B84B', 1.3);
      c.beginPath(); c.moveTo(-1.3 * s, -10.8 * s); c.lineTo(1.3 * s, -10.8 * s); S(c, '#E8B84B', 1.3);
    },
    mountain: function (c, s) {
      c.beginPath(); c.moveTo(-9 * s, 0); c.lineTo(-3 * s, -9 * s); c.lineTo(0, -4.5 * s);
      c.lineTo(3.5 * s, -11 * s); c.lineTo(9 * s, 0); c.closePath();
      F(c, '#7E93A8'); S(c);
      c.beginPath(); c.moveTo(1.8 * s, -7.8 * s); c.lineTo(3.5 * s, -11 * s); c.lineTo(5.2 * s, -7.6 * s);
      c.lineTo(4 * s, -7 * s); c.lineTo(3 * s, -7.9 * s); c.lineTo(2.6 * s, -7 * s); c.closePath();
      F(c, '#FFFFFF');
      c.beginPath(); c.moveTo(-4.5 * s, -6.7 * s); c.lineTo(-3 * s, -9 * s); c.lineTo(-1.6 * s, -6.9 * s);
      c.lineTo(-2.4 * s, -6.2 * s); c.lineTo(-3.2 * s, -7 * s); c.lineTo(-3.8 * s, -6.1 * s); c.closePath();
      F(c, '#FFFFFF');
    },
    flames: function (c, s) {
      function alev(x, h, w, col) {
        c.beginPath(); c.moveTo((x - w) * s, 0);
        c.quadraticCurveTo((x - w * 1.4) * s, -h * 0.55 * s, x * s, -h * s);
        c.quadraticCurveTo((x + w * 1.3) * s, -h * 0.5 * s, (x + w * 0.6) * s, 0);
        c.closePath(); F(c, col); S(c, 'rgba(5,30,51,.35)');
      }
      alev(-4.5, 8.5, 2.2, '#F4A261'); alev(0.5, 12, 2.6, '#E76F51'); alev(5, 7.5, 2, '#F4A261');
    },
    baiterek: function (c, s) {
      c.beginPath(); c.moveTo(-2.5 * s, 0); c.quadraticCurveTo(-1 * s, -5 * s, -0.4 * s, -8 * s);
      c.lineTo(0.4 * s, -8 * s); c.quadraticCurveTo(1 * s, -5 * s, 2.5 * s, 0); c.closePath();
      F(c, '#EAF2F8'); S(c);
      c.beginPath(); c.arc(0, -10 * s, 2 * s, 0, 7); F(c, '#F2CE6B'); S(c, 'rgba(5,30,51,.4)');
      c.beginPath(); c.arc(-0.7 * s, -10.7 * s, 0.7 * s, 0, 7); F(c, 'rgba(255,255,255,.55)');
    },
    azadi: function (c, s) {
      c.beginPath(); c.moveTo(-6 * s, 0); c.lineTo(-4.2 * s, 0);
      c.quadraticCurveTo(-3 * s, -7 * s, 0, -8.8 * s);
      c.quadraticCurveTo(3 * s, -7 * s, 4.2 * s, 0);
      c.lineTo(6 * s, 0); c.lineTo(6 * s, -1 * s);
      c.quadraticCurveTo(4 * s, -9.5 * s, 0, -11 * s);
      c.quadraticCurveTo(-4 * s, -9.5 * s, -6 * s, -1 * s); c.closePath();
      F(c, '#EAE2D0'); S(c);
      c.beginPath(); c.moveTo(-2 * s, 0); c.quadraticCurveTo(-1 * s, -3.8 * s, 0, -4.2 * s);
      c.quadraticCurveTo(1 * s, -3.8 * s, 2 * s, 0); c.closePath();
      F(c, '#8FB0C7');
    },
    petra: function (c, s) {
      c.beginPath(); c.moveTo(-6 * s, 0); c.lineTo(-6 * s, -7 * s); c.lineTo(0, -10.5 * s);
      c.lineTo(6 * s, -7 * s); c.lineTo(6 * s, 0); c.closePath();
      F(c, '#D08C76'); S(c);
      c.beginPath(); c.moveTo(-6 * s, -7 * s); c.lineTo(0, -10.5 * s); c.lineTo(6 * s, -7 * s);
      c.lineTo(4.8 * s, -6.4 * s); c.lineTo(0, -9 * s); c.lineTo(-4.8 * s, -6.4 * s); c.closePath();
      F(c, '#B87361');
      [-4, -1.3, 1.3, 4].forEach(function (x) {
        c.beginPath(); c.rect((x - 0.55) * s, -6.5 * s, 1.1 * s, 6.5 * s);
        F(c, '#E0A88F'); S(c, 'rgba(5,30,51,.35)');
      });
    },
    kaaba: function (c, s) {
      c.beginPath(); c.rect(-4.5 * s, -8 * s, 9 * s, 8 * s);
      F(c, '#23232A'); S(c);
      c.beginPath(); c.rect(-4.5 * s, -6 * s, 9 * s, 1.5 * s);
      F(c, '#E8B84B');
    },
    minaret: function (c, s) {
      c.beginPath(); c.moveTo(-1.4 * s, 0); c.lineTo(-1.4 * s, -9 * s); c.lineTo(0, -12.5 * s);
      c.lineTo(1.4 * s, -9 * s); c.lineTo(1.4 * s, 0); c.closePath();
      F(c, '#E4D9C3'); S(c);
      c.beginPath(); c.rect(-2.2 * s, -7 * s, 4.4 * s, 0.9 * s); F(c, '#C7B896');
    },
    meroe: function (c, s) {
      [[-5.5, 7, 2.5, '#D9A05B'], [0.5, 8.5, 2.6, '#E3B072'], [6, 6, 2, '#D9A05B']].forEach(function (p) {
        c.beginPath(); c.moveTo((p[0] - p[2]) * s, 0); c.lineTo(p[0] * s, -p[1] * s);
        c.lineTo((p[0] + p[2]) * s, 0); c.closePath();
        F(c, p[3]); S(c);
        c.beginPath(); c.moveTo(p[0] * s, -p[1] * s); c.lineTo((p[0] + p[2] * 0.4) * s, 0);
        c.lineTo((p[0] + p[2]) * s, 0); c.closePath(); F(c, 'rgba(5,30,51,.18)');
      });
    },
    star: function (c, s) {
      c.beginPath(); c.arc(0, -6 * s, 8 * s, 0, 7); F(c, 'rgba(242,206,107,.25)');
      c.beginPath();
      for (var i = 0; i < 5; i++) {
        var a1 = -Math.PI / 2 + i * 2.513, a2 = a1 + 1.257;
        var x1 = Math.cos(a1) * 7 * s, y1 = -6 * s + Math.sin(a1) * 7 * s;
        var x2 = Math.cos(a2) * 3 * s, y2 = -6 * s + Math.sin(a2) * 3 * s;
        if (i === 0) c.moveTo(x1, y1); else c.lineTo(x1, y1);
        c.lineTo(x2, y2);
      }
      c.closePath(); F(c, '#17181C'); S(c, '#E8B84B', 1.4);
    }
  };
  /* ── ESKİ hologram çizgiler (yedek) ── */
  var LMK = {
    pyramids: function (c, s) { /* Giza */
      c.moveTo(-9 * s, 0); c.lineTo(-3.5 * s, -8 * s); c.lineTo(2 * s, 0); c.closePath();
      c.moveTo(0, 0); c.lineTo(5 * s, -5.5 * s); c.lineTo(9.5 * s, 0); c.closePath();
      c.moveTo(-3.5 * s, -8 * s); c.lineTo(-2.4 * s, 0);
    },
    mosque: function (c, s) { /* İstanbul silueti */
      c.moveTo(-6 * s, 0); c.lineTo(-6 * s, -3.5 * s);
      c.arc(0, -3.5 * s, 6 * s, Math.PI, 0);
      c.lineTo(6 * s, 0);
      c.moveTo(-10 * s, 0); c.lineTo(-10 * s, -10 * s); c.lineTo(-9.2 * s, -12 * s); c.lineTo(-8.4 * s, -10 * s); c.lineTo(-8.4 * s, 0);
      c.moveTo(10 * s, 0); c.lineTo(10 * s, -10 * s); c.lineTo(9.2 * s, -12 * s); c.lineTo(8.4 * s, -10 * s); c.lineTo(8.4 * s, 0);
      c.moveTo(0, -9.5 * s); c.lineTo(0, -11.5 * s);
    },
    kremlin: function (c, s) { /* Spasskaya kulesi */
      c.moveTo(-4 * s, 0); c.lineTo(-4 * s, -7 * s); c.lineTo(4 * s, -7 * s); c.lineTo(4 * s, 0);
      c.moveTo(-4 * s, -7 * s); c.lineTo(0, -12 * s); c.lineTo(4 * s, -7 * s);
      c.moveTo(0, -12 * s); c.lineTo(0, -13.5 * s);
      c.moveTo(-1.2 * s, -3.5 * s); c.arc(0, -3.5 * s, 1.2 * s, Math.PI, 0);
    },
    castle: function (c, s) { /* Mir kalesi */
      c.moveTo(-5 * s, 0); c.lineTo(-5 * s, -7 * s); c.lineTo(-3.4 * s, -7 * s); c.lineTo(-3.4 * s, -8.5 * s);
      c.lineTo(-1.7 * s, -8.5 * s); c.lineTo(-1.7 * s, -7 * s); c.lineTo(1.7 * s, -7 * s); c.lineTo(1.7 * s, -8.5 * s);
      c.lineTo(3.4 * s, -8.5 * s); c.lineTo(3.4 * s, -7 * s); c.lineTo(5 * s, -7 * s); c.lineTo(5 * s, 0);
    },
    onion: function (c, s) { /* Kiev kubbe üçlüsü */
      c.moveTo(-6 * s, 0); c.lineTo(-6 * s, -4 * s);
      c.quadraticCurveTo(-6 * s, -7 * s, -4.5 * s, -8 * s); c.quadraticCurveTo(-3 * s, -7 * s, -3 * s, -4 * s);
      c.lineTo(-3 * s, 0);
      c.moveTo(-1.5 * s, 0); c.lineTo(-1.5 * s, -6 * s);
      c.quadraticCurveTo(-1.5 * s, -10 * s, 0, -11.5 * s); c.quadraticCurveTo(1.5 * s, -10 * s, 1.5 * s, -6 * s);
      c.lineTo(1.5 * s, 0);
      c.moveTo(3 * s, 0); c.lineTo(3 * s, -4 * s);
      c.quadraticCurveTo(3 * s, -7 * s, 4.5 * s, -8 * s); c.quadraticCurveTo(6 * s, -7 * s, 6 * s, -4 * s);
      c.lineTo(6 * s, 0);
    },
    bran: function (c, s) { /* Bran şatosu kulesi */
      c.moveTo(-3.5 * s, 0); c.lineTo(-3.5 * s, -8 * s); c.lineTo(0, -12 * s); c.lineTo(3.5 * s, -8 * s); c.lineTo(3.5 * s, 0);
      c.moveTo(-1 * s, -4 * s); c.lineTo(1 * s, -4 * s);
    },
    dome: function (c, s) { /* Ortodoks katedral */
      c.moveTo(-5 * s, 0); c.lineTo(-5 * s, -4 * s);
      c.arc(0, -4 * s, 5 * s, Math.PI, 0);
      c.lineTo(5 * s, 0);
      c.moveTo(0, -9 * s); c.lineTo(0, -12 * s);
      c.moveTo(-1.4 * s, -10.7 * s); c.lineTo(1.4 * s, -10.7 * s);
    },
    mountain: function (c, s) { /* Kazbek */
      c.moveTo(-9 * s, 0); c.lineTo(-3 * s, -9 * s); c.lineTo(0, -4.5 * s);
      c.lineTo(3.5 * s, -11 * s); c.lineTo(9 * s, 0);
      c.moveTo(1.8 * s, -7.8 * s); c.lineTo(3.5 * s, -9.2 * s); c.lineTo(5.2 * s, -7.6 * s);
    },
    flames: function (c, s) { /* Bakü Alev Kuleleri */
      c.moveTo(-6 * s, 0); c.quadraticCurveTo(-7.5 * s, -6 * s, -4.5 * s, -9 * s);
      c.quadraticCurveTo(-4 * s, -5 * s, -2.5 * s, -3.5 * s); c.quadraticCurveTo(-2.8 * s, -1.5 * s, -3 * s, 0);
      c.moveTo(-1 * s, 0); c.quadraticCurveTo(-2.5 * s, -7 * s, 0.5 * s, -12 * s);
      c.quadraticCurveTo(1 * s, -7 * s, 2.5 * s, -5 * s); c.quadraticCurveTo(2.2 * s, -2 * s, 2 * s, 0);
      c.moveTo(4 * s, 0); c.quadraticCurveTo(2.8 * s, -5 * s, 6 * s, -8.5 * s);
      c.quadraticCurveTo(6.5 * s, -4.5 * s, 7 * s, -2.5 * s); c.quadraticCurveTo(6.8 * s, -1 * s, 6.5 * s, 0);
    },
    baiterek: function (c, s) { /* Astana Bayterek */
      c.moveTo(0, 0); c.lineTo(0, -8 * s);
      c.moveTo(-2.5 * s, 0); c.quadraticCurveTo(-1 * s, -5 * s, 0, -8 * s);
      c.moveTo(2.5 * s, 0); c.quadraticCurveTo(1 * s, -5 * s, 0, -8 * s);
      c.moveTo(1.8 * s, -9.8 * s); c.arc(0, -9.8 * s, 1.8 * s, 0, Math.PI * 2);
    },
    azadi: function (c, s) { /* Tahran Azadi kemeri */
      c.moveTo(-6 * s, 0); c.lineTo(-4.5 * s, 0);
      c.quadraticCurveTo(-3 * s, -7 * s, 0, -8.5 * s);
      c.quadraticCurveTo(3 * s, -7 * s, 4.5 * s, 0);
      c.lineTo(6 * s, 0);
      c.moveTo(-2 * s, 0); c.quadraticCurveTo(-1 * s, -3.5 * s, 0, -4 * s);
      c.quadraticCurveTo(1 * s, -3.5 * s, 2 * s, 0);
    },
    petra: function (c, s) { /* Petra Hazine cephesi */
      c.moveTo(-6 * s, 0); c.lineTo(-6 * s, -7 * s); c.lineTo(0, -10 * s); c.lineTo(6 * s, -7 * s); c.lineTo(6 * s, 0);
      [-4, -1.3, 1.3, 4].forEach(function (x) {
        c.moveTo(x * s, 0); c.lineTo(x * s, -6.5 * s);
      });
    },
    kaaba: function (c, s) { /* Kâbe */
      c.moveTo(-4.5 * s, 0); c.lineTo(-4.5 * s, -8 * s); c.lineTo(4.5 * s, -8 * s); c.lineTo(4.5 * s, 0); c.closePath();
      c.moveTo(-4.5 * s, -5.5 * s); c.lineTo(4.5 * s, -5.5 * s);
    },
    minaret: function (c, s) { /* Emevi minaresi */
      c.moveTo(-1.4 * s, 0); c.lineTo(-1.4 * s, -9 * s); c.lineTo(0, -12 * s); c.lineTo(1.4 * s, -9 * s); c.lineTo(1.4 * s, 0);
      c.moveTo(-2.2 * s, -6.5 * s); c.lineTo(2.2 * s, -6.5 * s);
    },
    meroe: function (c, s) { /* Meroe piramitleri */
      c.moveTo(-8 * s, 0); c.lineTo(-5.5 * s, -7 * s); c.lineTo(-3 * s, 0);
      c.moveTo(-2 * s, 0); c.lineTo(0.5 * s, -8.5 * s); c.lineTo(3 * s, 0);
      c.moveTo(4 * s, 0); c.lineTo(6 * s, -6 * s); c.lineTo(8 * s, 0);
    },
    star: function (c, s) { /* Gana Kara Yıldız */
      for (var i = 0; i < 5; i++) {
        var a1 = -Math.PI / 2 + i * 2.513, a2 = a1 + 1.257;
        var x1 = Math.cos(a1) * 7 * s, y1 = -6 * s + Math.sin(a1) * 7 * s;
        var x2 = Math.cos(a2) * 3 * s, y2 = -6 * s + Math.sin(a2) * 3 * s;
        if (i === 0) c.moveTo(x1, y1); else c.lineTo(x1, y1);
        c.lineTo(x2, y2);
      }
      c.closePath();
    }
  };
  function drawLandmark(ctx2, key, x, y, sc, alpha, major, t, i) {
    var fn = LMK_COLOR[key]; if (!fn) return;
    ctx2.save();
    ctx2.translate(x, y);
    ctx2.globalAlpha = alpha;
    ctx2.lineJoin = 'round'; ctx2.lineCap = 'round';
    /* zemin gölgesi — anıtı yere oturtur */
    ctx2.beginPath(); ctx2.ellipse(0, 1.5, 8 * sc, 2.2 * sc, 0, 0, 7);
    ctx2.fillStyle = 'rgba(5,30,51,.35)'; ctx2.fill();
    ctx2.shadowColor = 'rgba(91,194,236,.55)'; ctx2.shadowBlur = major ? 10 : 6;
    fn(ctx2, sc);
    ctx2.shadowBlur = 0;
    /* ışıltı: her anıtın tepesinde dönüşümlü yıldız parıltısı */
    if (t !== undefined) {
      var tw = Math.max(0, Math.sin(t * 1.1 + i * 2.7));
      if (tw > 0.82) {
        var a2 = (tw - 0.82) / 0.18;
        var sy = -13 * sc, sx = 6 * sc;
        ctx2.strokeStyle = 'rgba(255,255,255,' + a2 + ')';
        ctx2.lineWidth = 1.2;
        ctx2.beginPath();
        ctx2.moveTo(sx - 3.5 * a2, sy); ctx2.lineTo(sx + 3.5 * a2, sy);
        ctx2.moveTo(sx, sy - 3.5 * a2); ctx2.lineTo(sx, sy + 3.5 * a2);
        ctx2.stroke();
      }
    }
    ctx2.restore();
  }
  document.querySelectorAll('canvas.geo-map').forEach(function (cv) {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var MAP = window.BERSEY_MAP || null;
    var W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);
    var PADX = 34, PADY = 30;
    var b = MAP ? MAP.bounds : [-6, 2, 78, 60];
    var minLon = b[0], minLat = b[1], maxLon = b[2], maxLat = b[3];
    var stat = document.createElement('canvas'); /* statik katman: kara noktaları */
    var sctx = stat.getContext('2d');
    function proj(lat, lon) {
      return [ PADX + (lon - minLon) / (maxLon - minLon) * (W - PADX * 2),
               PADY + (maxLat - lat) / (maxLat - minLat) * (H - PADY * 2) ];
    }
    function paintStatic() {
      stat.width = W * DPR; stat.height = H * DPR;
      sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      /* derinlik vinyeti */
      var vg = sctx.createRadialGradient(W * .42, H * .45, 40, W * .42, H * .45, W * .75);
      vg.addColorStop(0, 'rgba(15,92,140,.16)'); vg.addColorStop(1, 'rgba(5,30,51,0)');
      sctx.fillStyle = vg; sctx.fillRect(0, 0, W, H);
      if (!MAP) return;
      var r = Math.max(1.05, (W - PADX * 2) / 380);
      MAP.dots.forEach(function (d) {
        var p = proj(d[1], d[0]);
        var b = d[2] === 2; /* Bersey ülkesi: belirgin parlak; diğer kara: sönük */
        sctx.beginPath(); sctx.arc(p[0], p[1], b ? r * 1.4 : r * 0.9, 0, 7);
        sctx.fillStyle = b ? 'rgba(63,198,255,.95)' : 'rgba(91,194,236,.13)';
        sctx.fill();
      });
    }
    function resize() {
      var rct = cv.getBoundingClientRect();
      W = Math.max(320, rct.width); H = Math.max(260, rct.height);
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      paintStatic();
    }
    function qp(a, c, e, t) { /* quadratic bezier noktası */
      var u = 1 - t;
      return [u * u * a[0] + 2 * u * t * c[0] + t * t * e[0],
              u * u * a[1] + 2 * u * t * c[1] + t * t * e[1]];
    }
    var t0 = performance.now();
    function draw(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(stat, 0, 0, W, H);
      var hb = proj(HUB.lat, HUB.lon);
      /* yaylar + ışık kuyruğu (comet) */
      NODES.forEach(function (n, i) {
        var p = proj(n.lat, n.lon);
        var mid = [(hb[0] + p[0]) / 2,
                   Math.min(hb[1], p[1]) - 26 - Math.abs(hb[0] - p[0]) * 0.13];
        ctx.strokeStyle = n.minor ? 'rgba(91,194,236,.2)' : 'rgba(91,194,236,.38)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(hb[0], hb[1]);
        ctx.quadraticCurveTo(mid[0], mid[1], p[0], p[1]); ctx.stroke();
        if (!reduced) {
          var ph = ((t * 0.22) + i * 0.161) % 1;   /* yay boyunca 0→1 */
          for (var k = 0; k < 7; k++) {            /* kuyruk */
            var tt = ph - k * 0.018; if (tt < 0) continue;
            var cp = qp(hb, mid, p, tt);
            ctx.beginPath(); ctx.arc(cp[0], cp[1], 2.6 - k * 0.3, 0, 7);
            ctx.fillStyle = 'rgba(228,244,252,' + (0.85 - k * 0.115) + ')';
            ctx.fill();
          }
        }
      });
      /* düğümler: ülke sembolü (yüzen) + işaret + etiket altta */
      ctx.textAlign = 'center';
      var lmScale = Math.max(0.85, Math.min(1.5, W / 900));
      NODES.forEach(function (n, i) {
        var p = proj(n.lat, n.lon);
        var pulse = reduced ? 0 : (Math.sin(t * 2 + i * 1.7) + 1) / 2;
        var bob = reduced ? 0 : Math.sin(t * 1.4 + i * 2.1) * 2.2;
        /* sembol — işaretin üstünde süzülür */
        if (n.lm) drawLandmark(ctx, n.lm, p[0], p[1] - 7 + bob,
          (n.minor ? 0.9 : 1.25) * lmScale, n.minor ? 0.75 : 1, !n.minor, t, i);
        ctx.beginPath(); ctx.arc(p[0], p[1], (n.minor ? 6 : 9) + pulse * 4, 0, 7);
        ctx.strokeStyle = 'rgba(91,194,236,' + (0.3 - pulse * 0.22) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.beginPath(); ctx.arc(p[0], p[1], n.minor ? 2.4 : 3.2, 0, 7);
        ctx.fillStyle = '#E4F4FC'; ctx.fill();
        if (!n.minor || H > 380) {
          var label = n.name.toLocaleUpperCase('tr');
          ctx.font = '600 ' + (n.minor ? 8.5 : 9.5) + 'px Inter, Arial, sans-serif';
          ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(5,30,51,.78)';
          ctx.strokeText(label, p[0], p[1] + (n.minor ? 13 : 16));
          ctx.fillStyle = n.minor ? 'rgba(175,200,216,.85)' : '#CFE3F0';
          ctx.fillText(label, p[0], p[1] + (n.minor ? 13 : 16));
        }
      });
      /* merkez: İstanbul — cami silueti + glow */
      var hp = reduced ? 0 : (Math.sin(t * 2.6) + 1) / 2;
      var hbob = reduced ? 0 : Math.sin(t * 1.2) * 2.5;
      var hg = ctx.createRadialGradient(hb[0], hb[1], 1, hb[0], hb[1], 26 + hp * 8);
      hg.addColorStop(0, 'rgba(0,161,226,.5)'); hg.addColorStop(1, 'rgba(0,161,226,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hb[0], hb[1], 28 + hp * 8, 0, 7); ctx.fill();
      drawLandmark(ctx, 'mosque', hb[0], hb[1] - 14 + hbob, 1.1 * lmScale, 1, true, t, 99);
      ctx.beginPath(); ctx.arc(hb[0], hb[1], 5, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.beginPath(); ctx.arc(hb[0], hb[1], 10 + hp * 5, 0, 7);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 - hp * 0.35) + ')'; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.font = '800 11.5px Nunito, Arial, sans-serif';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(5,30,51,.8)';
      ctx.strokeText(HUB_LABEL, hb[0], hb[1] + 27);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(HUB_LABEL, hb[0], hb[1] + 27);
    }
    var running = false, rafId = 0;
    function loop(now) { if (!running) return; draw(now); rafId = requestAnimationFrame(loop); }
    resize(); draw(performance.now());
    if (!reduced) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; rafId = requestAnimationFrame(loop); }
          else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(rafId); }
        });
      }, { threshold: 0.05 });
      io.observe(cv);
    }
    var rt; addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { resize(); draw(performance.now()); }, 150);
    });
  });
})();
