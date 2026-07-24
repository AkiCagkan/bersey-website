/* ══════════════════════════════════════════════════════════
   BERSEY — 3D motor v3 (boiler3d.js)
   İki mod:
   • SHOWROOM: <div class="hero-3d" data-model3d="boiler|vessel|burner|twin">
     döner platform + sürükle-döndür + scroll dönüşü
   • SCROLLY:  data-scrolly eklenirse → hero sabitlenir (pin), scroll ile:
     model ekrana YAKLAŞIR → PARÇALARA DAĞILIR → GERİ BİRLEŞİR → yerine oturur;
     fazlara bağlı başlıklar belirir, sonra sayfa normal akar.
   ══════════════════════════════════════════════════════════ */
(function () {
  var mounts = document.querySelectorAll('[data-model3d]');
  if (!mounts.length) return;
  if (matchMedia('(max-width:900px)').matches) return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js')
    .then(function (THREE) { mounts.forEach(function (el) { mount(THREE, el); }); })
    .catch(function () {});

  var LANG = (document.documentElement.lang || 'tr').slice(0, 2).toLowerCase();
  if (LANG !== 'en' && LANG !== 'ru') LANG = 'tr';
  var CAPTIONS_I18N = {
    tr: {
      boiler: ['465 kW – 46 MW kapasite aralığı', 'Her parça ayrı hesaplanır', "%90'a varan verimlilik (LHV)"],
      burner: ['24 yakıt türünde kanıtlanmış deneyim', 'Kontrollü hava, tam yanma', 'Düşük emisyon, yüksek verim'],
      vessel: ['AD 2000 · EN 13445 tasarım', 'CE · EAC · Gospromnadzor sertifikalı', 'Uzun ömür, güvenli işletme'],
      twin: ['3D ortamda modellenir', 'ASME · EN · API standartlarında analiz', 'Sahaya kusursuz iner']
    },
    en: {
      boiler: ['465 kW – 46 MW capacity range', 'Every part engineered individually', 'Up to 90% efficiency (LHV)'],
      burner: ['Proven experience with 24 fuel types', 'Controlled air, complete combustion', 'Low emissions, high efficiency'],
      vessel: ['AD 2000 · EN 13445 design', 'CE · EAC · Gospromnadzor certified', 'Long service life, safe operation'],
      twin: ['Modelled in 3D', 'Analysed to ASME · EN · API standards', 'Delivered flawlessly to site']
    },
    ru: {
      boiler: ['Диапазон мощности 465 кВт – 46 МВт', 'Каждый узел рассчитан отдельно', 'КПД до 90% (по низшей теплоте)'],
      burner: ['Подтверждённый опыт на 24 видах топлива', 'Контролируемый воздух, полное сгорание', 'Низкие выбросы, высокий КПД'],
      vessel: ['Расчёт по AD 2000 · EN 13445', 'Сертификаты CE · EAC · Госпромнадзор', 'Долгий срок службы, безопасная эксплуатация'],
      twin: ['Моделируется в 3D', 'Расчёты по ASME · EN · API', 'Безупречный монтаж на площадке']
    }
  };
  var HINTS_I18N = {
    tr: ['⟲ kaydırın · model dağılır ve birleşir', '⟲ 360° — sürükleyerek döndürün'],
    en: ['⟲ scroll · the model explodes and reassembles', '⟲ 360° — drag to rotate'],
    ru: ['⟲ прокрутите · модель разбирается и собирается', '⟲ 360° — вращайте перетаскиванием']
  };
  var CAPTIONS = CAPTIONS_I18N[LANG];

  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function srnd(i) { var x = Math.sin(i * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); }

  function mount(THREE, el) {
    var variant = el.getAttribute('data-model3d') || 'boiler';
    var wantScrolly = el.hasAttribute('data-scrolly') && !reduced &&
      typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.touchAction = 'pan-y';

    var hint = document.createElement('div');
    hint.className = 'h3d-hint';
    hint.textContent = wantScrolly ? HINTS_I18N[LANG][0] : HINTS_I18N[LANG][1];
    el.appendChild(hint);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    var camZ = wantScrolly ? 10.4 : 8.8;
    camera.position.set(0.3, 1.15, camZ);
    camera.lookAt(0, 0, 0);

    /* Stüdyo ortamı → metal yansımaları */
    (function () {
      var env = new THREE.Scene();
      var box = new THREE.BoxGeometry(1, 1, 1);
      function lb(x, y, z, sx, sy, sz, c) {
        var m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: c }));
        m.position.set(x, y, z); m.scale.set(sx, sy, sz); env.add(m);
      }
      var room = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x0c1d2e, side: THREE.BackSide }));
      room.scale.set(40, 24, 40); env.add(room);
      lb(0, 11, 0, 14, .4, 6, 0xffffff); lb(-14, 5, 2, .4, 8, 10, 0xbfe4ff);
      lb(14, 4, -2, .4, 7, 9, 0x5bc2ec); lb(0, 4, -16, 12, 6, .4, 0x99c4dd);
      lb(6, 2, 14, 6, 4, .4, 0xffffff);
      var pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(env, 0.05).texture;
      pm.dispose();
      env.traverse(function (o) { if (o.isMesh) o.material.dispose(); });
      box.dispose();
    })();

    var key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(5, 8, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(0x5BC2EC, 1.2); rim.position.set(-7, 3, -5); scene.add(rim);
    scene.add(new THREE.AmbientLight(0x8fb4cc, 0.35));

    var steel = new THREE.MeshPhysicalMaterial({ color: 0xc7ced6, metalness: 0.95, roughness: 0.22,
      clearcoat: 0.5, clearcoatRoughness: 0.25 });
    var paint = new THREE.MeshPhysicalMaterial({ color: 0x14405e, metalness: 0.35, roughness: 0.34,
      clearcoat: 0.9, clearcoatRoughness: 0.18 });
    var dark = new THREE.MeshPhysicalMaterial({ color: 0x252e38, metalness: 0.7, roughness: 0.4 });
    var glow = new THREE.MeshStandardMaterial({ color: 0x5BC2EC, metalness: 0.3, roughness: 0.3,
      emissive: 0x5BC2EC, emissiveIntensity: 0.55 });

    function mesh(g, m, x, y, z, rx, ry, rz) {
      var o = new THREE.Mesh(g, m);
      o.position.set(x || 0, y || 0, z || 0); o.rotation.set(rx || 0, ry || 0, rz || 0);
      return o;
    }
    function boltRing(g, r, count, x, mat, boltGeo) {
      for (var i = 0; i < count; i++) {
        var a = i / count * Math.PI * 2;
        g.add(mesh(boltGeo, mat, x, Math.cos(a) * r, Math.sin(a) * r, 0, 0, Math.PI / 2));
      }
    }

    function buildBoiler() {
      var g = new THREE.Group();
      var boltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 8);
      var capGeo = new THREE.SphereGeometry(1.05, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
      g.add(mesh(new THREE.CylinderGeometry(1.05, 1.05, 3.4, 48), paint, 0, 0, 0, 0, 0, Math.PI / 2));
      g.add(mesh(capGeo, steel, 1.7, 0, 0, 0, 0, -Math.PI / 2));
      g.add(mesh(capGeo, steel, -1.7, 0, 0, 0, 0, Math.PI / 2));
      [-1.15, 0, 1.15].forEach(function (x) {
        g.add(mesh(new THREE.TorusGeometry(1.06, 0.05, 14, 56), steel, x, 0, 0, 0, Math.PI / 2, 0));
        boltRing(g, 1.13, 12, x, dark, boltGeo);
      });
      g.add(mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.2, 32), dark, 2.3, 0, 0, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.TorusGeometry(0.58, 0.055, 12, 40), glow, 2.4, 0, 0, 0, Math.PI / 2, 0));
      boltRing(g, 0.44, 10, 2.44, steel, boltGeo);
      g.add(mesh(new THREE.BoxGeometry(0.1, 0.34, 0.16), steel, 2.32, 0.62, 0.2));
      g.add(mesh(new THREE.CylinderGeometry(0.25, 0.31, 2.5, 28), steel, -1.15, 1.9, 0));
      g.add(mesh(new THREE.TorusGeometry(0.27, 0.035, 10, 30), dark, -1.15, 2.6, 0, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.TorusGeometry(0.29, 0.035, 10, 30), dark, -1.15, 1.2, 0, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.1, 16), steel, 0.6, 1.5, 0));
      g.add(mesh(new THREE.SphereGeometry(0.19, 18, 12), paint, 0.6, 2.1, 0));
      g.add(mesh(new THREE.TorusGeometry(0.24, 0.035, 10, 28), glow, 0.6, 2.32, 0, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), steel, 0.6, 2.32, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.0, 14), steel, 0, 0.55, 1.14, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.TorusGeometry(0.2, 0.09, 12, 22, Math.PI / 2), steel, 1.5, 0.35, 1.14));
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 14), steel, 1.7, -0.05, 1.14));
      g.add(mesh(new THREE.BoxGeometry(0.3, 0.44, 0.07), dark, 1.15, 0.62, 1.08, 0.15, 0, 0));
      g.add(mesh(new THREE.PlaneGeometry(0.2, 0.26), glow, 1.15, 0.66, 1.12, 0.15, 0, 0));
      g.add(mesh(new THREE.BoxGeometry(0.65, 0.22, 0.03), steel, 0.1, 0.42, 1.07, 0.1, 0, 0));
      g.add(mesh(new THREE.BoxGeometry(0.75, 0.55, 2.0), dark, -1.0, -1.25, 0));
      g.add(mesh(new THREE.BoxGeometry(0.75, 0.55, 2.0), dark, 1.0, -1.25, 0));
      g.userData.baseY = 0.25;
      return g;
    }

    function buildVessel() {
      var g = new THREE.Group();
      var capGeo = new THREE.SphereGeometry(0.95, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
      g.add(mesh(new THREE.CylinderGeometry(0.95, 0.95, 2.7, 44), paint, 0, 0.2, 0));
      g.add(mesh(capGeo, steel, 0, 1.55, 0));
      g.add(mesh(capGeo, steel, 0, -1.15, 0, Math.PI, 0, 0));
      [0.95, -0.55].forEach(function (y) {
        g.add(mesh(new THREE.TorusGeometry(0.96, 0.045, 12, 52), steel, 0, y, 0, Math.PI / 2, 0, 0));
      });
      g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.9, 16), steel, 0, 2.55, 0));
      g.add(mesh(new THREE.TorusGeometry(0.21, 0.04, 10, 26), glow, 0, 3.0, 0, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 12), steel, 0.28, 2.7, 0, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.26, 24), dark, 1.0, 0.5, 0, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.TorusGeometry(0.32, 0.045, 10, 30), glow, 1.15, 0.5, 0, 0, Math.PI / 2, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 10), glow, -1.07, 0.2, 0));
      g.add(mesh(new THREE.BoxGeometry(0.05, 0.16, 0.14), steel, -1.07, 1.2, 0));
      g.add(mesh(new THREE.BoxGeometry(0.05, 0.16, 0.14), steel, -1.07, -0.8, 0));
      for (var i = 0; i < 6; i++)
        g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), steel, 0, -1.4 + i * 0.55, -1.06, Math.PI / 2, 0, Math.PI / 2));
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.4, 8), steel, -0.21, 0.15, -1.06));
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.4, 8), steel, 0.21, 0.15, -1.06));
      for (var j = 0; j < 3; j++) {
        var a = j / 3 * Math.PI * 2 + 0.5;
        g.add(mesh(new THREE.BoxGeometry(0.18, 1.15, 0.36), dark, Math.cos(a) * 0.8, -1.9, Math.sin(a) * 0.8, 0, -a, 0));
      }
      g.userData.baseY = 0.35;
      return g;
    }

    function buildBurner() {
      var g = new THREE.Group();
      var boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8);
      g.add(mesh(new THREE.CylinderGeometry(0.6, 0.9, 1.7, 32), paint, -1.7, 0, 0, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.8, 24), dark, -2.75, 0, 0, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.14, 32), steel, -0.72, 0, 0, 0, 0, Math.PI / 2));
      boltRing(g, 0.8, 12, -0.72, dark, boltGeo);
      g.add(mesh(new THREE.CylinderGeometry(0.88, 0.62, 0.8, 32), dark, -0.25, 0, 0, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.CylinderGeometry(0.62, 0.44, 0.85, 32), steel, 0.45, 0, 0, 0, 0, Math.PI / 2));
      g.add(mesh(new THREE.TorusGeometry(0.63, 0.05, 10, 36), glow, 0.06, 0, 0, 0, Math.PI / 2, 0));
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * Math.PI * 2;
        g.add(mesh(new THREE.BoxGeometry(0.3, 0.16, 0.03), steel, 0.85, Math.cos(a) * 0.3, Math.sin(a) * 0.3, a, 0, 0.5));
      }
      g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.7, 12), steel, -1.5, -0.95, 0.25, 0, 0, 0.45));
      g.add(mesh(new THREE.SphereGeometry(0.15, 14, 10), glow, -1.12, -0.6, 0.25));
      g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 12), steel, -1.6, -0.85, -0.3, 0, 0, 0.5));
      g.add(mesh(new THREE.SphereGeometry(0.12, 14, 10), paint, -1.3, -0.55, -0.3));
      var N = 420, pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (var k = 0; k < N; k++) { seed[k] = Math.random(); pos[k * 3] = 0.9; }
      var pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var flameMat = new THREE.PointsMaterial({ size: 0.085, color: 0x7fd4ff,
        transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
      var coreMat = new THREE.PointsMaterial({ size: 0.045, color: 0xffffff,
        transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
      var flame = new THREE.Points(pg, flameMat); flame.userData.noExplode = true; g.add(flame);
      var core = new THREE.Points(pg.clone(), coreMat); core.userData.noExplode = true; g.add(core);
      g.userData.flameMats = [flameMat, coreMat];
      g.userData.tick = function (t) {
        var a = pg.attributes.position.array;
        for (var i = 0; i < N; i++) {
          var ph = (t * (0.55 + seed[i] * 0.8) + seed[i]) % 1;
          var spread = 0.06 + ph * 0.5;
          var ang = seed[i] * 6.283 + t * (2 + seed[i]);
          a[i * 3] = 0.92 + ph * 3.1;
          a[i * 3 + 1] = Math.cos(ang) * spread * (1 - ph * 0.3);
          a[i * 3 + 2] = Math.sin(ang) * spread * (1 - ph * 0.3);
        }
        pg.attributes.position.needsUpdate = true;
        core.geometry.attributes.position.copy(pg.attributes.position);
        core.geometry.attributes.position.needsUpdate = true;
      };
      g.position.x = -0.1;
      g.userData.baseY = 0.1;
      return g;
    }

    function buildTwinPoints() { /* showroom nokta-bulutu (teknik-yapabilirlik vb.) */
      var src = buildBoiler();
      src.updateWorldMatrix(true, true);
      var pts = [];
      src.traverse(function (o) {
        if (!o.isMesh) return;
        var p = o.geometry.attributes.position, v = new THREE.Vector3();
        var stride = Math.max(1, Math.floor(p.count / 700));
        for (var i = 0; i < p.count; i += stride) {
          v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); pts.push(v.x, v.y, v.z);
        }
      });
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      var g = new THREE.Group();
      g.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.035, color: 0x5BC2EC,
        transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })));
      addScanRing(g);
      g.userData.baseY = 0.1;
      return g;
    }

    function buildHolo() { /* scrolly twin: hologram kazan — parçalanabilir */
      var g = buildBoiler();
      var holo = new THREE.MeshBasicMaterial({ color: 0x5BC2EC, wireframe: true,
        transparent: true, opacity: 0.5 });
      var holoBright = new THREE.MeshBasicMaterial({ color: 0xBFE9FF, wireframe: true,
        transparent: true, opacity: 0.75 });
      var i = 0;
      g.traverse(function (o) { if (o.isMesh) { o.material = (i++ % 5 === 0) ? holoBright : holo; } });
      addScanRing(g);
      g.userData.baseY = 0.25;
      return g;
    }

    function addScanRing(g) {
      var ring = mesh(new THREE.TorusGeometry(2.6, 0.02, 8, 64), glow, 0, 0, 0, Math.PI / 2, 0, 0);
      var disk = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48),
        new THREE.MeshBasicMaterial({ color: 0x5BC2EC, transparent: true, opacity: 0.05,
          side: THREE.DoubleSide, depthWrite: false }));
      disk.rotation.x = Math.PI / 2;
      ring.userData.noExplode = true; disk.userData.noExplode = true;
      g.add(ring); g.add(disk);
      var prev = g.userData.tick;
      g.userData.tick = function (t) {
        if (prev) prev(t);
        var y = Math.sin(t * 0.7) * 1.5 + 0.2;
        ring.position.y = y; disk.position.y = y;
      };
    }

    /* ── Sayfaya özel ek modeller — her sayfada FARKLI obje ── */
    var gold = new THREE.MeshPhysicalMaterial({ color: 0xE8B84B, metalness: 0.9, roughness: 0.28,
      clearcoat: 0.6, clearcoatRoughness: 0.2 });
    var white = new THREE.MeshPhysicalMaterial({ color: 0xEAF2F8, metalness: 0.15, roughness: 0.4,
      clearcoat: 0.7, clearcoatRoughness: 0.25 });
    var blue = new THREE.MeshPhysicalMaterial({ color: 0x00A1E2, metalness: 0.4, roughness: 0.35,
      clearcoat: 0.8, clearcoatRoughness: 0.15 });

    function smokeSystem(g, ox, oy, oz, color, size, spread, rise) {
      var N = 140, pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (var i = 0; i < N; i++) { seed[i] = Math.random(); pos[i * 3 + 1] = oy; }
      var pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: size, color: color,
        transparent: true, opacity: 0.55, depthWrite: false }));
      pts.userData.noExplode = true; g.add(pts);
      var prev = g.userData.tick;
      g.userData.tick = function (t) {
        if (prev) prev(t);
        var a = pg.attributes.position.array;
        for (var i = 0; i < N; i++) {
          var ph = (t * (0.25 + seed[i] * 0.3) + seed[i]) % 1;
          a[i * 3] = ox + Math.sin(ph * 9 + seed[i] * 7) * spread * ph;
          a[i * 3 + 1] = oy + ph * rise;
          a[i * 3 + 2] = oz + Math.cos(ph * 7 + seed[i] * 5) * spread * ph;
        }
        pg.attributes.position.needsUpdate = true;
      };
    }

    function buildFactory() { /* hakkımızda: fabrika kampüsü */
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(3.4, 1.5, 2.0), paint, -0.4, -0.85, 0));
      /* testere-dişi çatı */
      for (var i = 0; i < 4; i++) {
        var sx = -1.65 + i * 0.85;
        var roof = mesh(new THREE.BoxGeometry(0.85, 0.55, 2.0), white, sx + 0.42, 0.12, 0);
        roof.geometry = new THREE.CylinderGeometry(0.42, 0.42, 2.0, 3, 1);
        roof.rotation.set(Math.PI / 2, 0, Math.PI); roof.position.set(sx + 0.42, 0.12, 0);
        g.add(roof);
      }
      g.add(mesh(new THREE.BoxGeometry(1.3, 2.2, 1.3), steel, 1.9, -0.5, 0));
      g.add(mesh(new THREE.PlaneGeometry(0.7, 0.5), glow, 1.9, -0.2, 0.66));
      g.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.6, 18), steel, -1.5, 1.2, -0.5));
      g.add(mesh(new THREE.CylinderGeometry(0.13, 0.16, 2.0, 18), steel, -0.7, 0.9, -0.6));
      g.add(mesh(new THREE.TorusGeometry(0.17, 0.03, 8, 22), glow, -1.5, 2.45, -0.5, Math.PI / 2, 0, 0));
      smokeSystem(g, -1.5, 2.5, -0.5, 0xBFD6E4, 0.09, 0.5, 2.2);
      smokeSystem(g, -0.7, 1.9, -0.6, 0xA9C6D8, 0.07, 0.4, 1.8);
      g.userData.baseY = 0.35;
      return g;
    }

    function buildHardhat() { /* kariyer: baret */
      var g = new THREE.Group();
      var domeM = blue;
      g.add(mesh(new THREE.SphereGeometry(1.5, 40, 22, 0, Math.PI * 2, 0, Math.PI / 2), domeM, 0, -0.5, 0));
      /* tepe sırtı */
      g.add(mesh(new THREE.BoxGeometry(0.34, 0.16, 2.6), domeM, 0, 0.95, 0));
      /* siper */
      var brim = mesh(new THREE.CylinderGeometry(1.95, 2.05, 0.12, 42), domeM, 0, -0.55, 0);
      g.add(brim);
      g.add(mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.3, 40), white, 0, -0.42, 0));
      /* logo plaketi */
      g.add(mesh(new THREE.BoxGeometry(0.8, 0.34, 0.06), white, 0, 0.1, 1.44, -0.28, 0, 0));
      g.add(mesh(new THREE.PlaneGeometry(0.6, 0.18), glow, 0, 0.1, 1.48, -0.28, 0, 0));
      g.userData.baseY = 0.35;
      return g;
    }

    function buildRobotArm() { /* teknik yapabilirlik: kaynak robotu + kıvılcım */
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.4, 32), dark, 0, -1.4, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.7, 24), steel, 0, -0.9, 0));
      var seg1 = mesh(new THREE.BoxGeometry(0.44, 1.9, 0.44), paint, -0.35, 0.05, 0, 0, 0, 0.45);
      g.add(seg1);
      g.add(mesh(new THREE.SphereGeometry(0.34, 20, 14), gold, -0.76, 0.9, 0));
      var seg2 = mesh(new THREE.BoxGeometry(0.36, 1.7, 0.36), paint, -0.15, 1.5, 0, 0, 0, -0.85);
      g.add(seg2);
      g.add(mesh(new THREE.SphereGeometry(0.28, 20, 14), gold, 0.5, 2.05, 0));
      var torch = mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.7, 12), steel, 0.85, 1.75, 0, 0, 0, -1.1);
      g.add(torch);
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.25, 8), glow, 1.12, 1.5, 0, 0, 0, -1.1));
      /* kaynak kıvılcımları */
      var N = 160, pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (var i = 0; i < N; i++) seed[i] = Math.random();
      var pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var sparks = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.05, color: 0xFFD98A,
        transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
      sparks.userData.noExplode = true; g.add(sparks);
      var flash = mesh(new THREE.SphereGeometry(0.09, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true }), 1.24, 1.34, 0);
      flash.userData.noExplode = true; g.add(flash);
      g.userData.tick = function (t) {
        var a = pg.attributes.position.array;
        for (var i = 0; i < N; i++) {
          var ph = (t * (1.2 + seed[i]) + seed[i]) % 1;
          var ang = seed[i] * 6.283;
          a[i * 3] = 1.24 + Math.cos(ang) * ph * 0.9;
          a[i * 3 + 1] = 1.34 + Math.sin(seed[i] * 9) * ph * 0.7 - ph * ph * 1.6;
          a[i * 3 + 2] = Math.sin(ang) * ph * 0.9;
        }
        pg.attributes.position.needsUpdate = true;
        flash.material.opacity = 0.55 + Math.sin(t * 37) * 0.45;
      };
      g.userData.baseY = 0.2;
      return g;
    }

    function buildGlobe() { /* referanslar: dünya + yörünge işaretleri */
      var g = new THREE.Group();
      g.add(mesh(new THREE.SphereGeometry(1.7, 40, 28),
        new THREE.MeshPhysicalMaterial({ color: 0x0E3A5C, metalness: 0.2, roughness: 0.45,
          clearcoat: 0.8, transparent: true, opacity: 0.94 }), 0, 0.2, 0));
      var wf = mesh(new THREE.SphereGeometry(1.72, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0x5BC2EC, wireframe: true, transparent: true, opacity: 0.28 }),
        0, 0.2, 0);
      g.add(wf);
      /* ekvator + meridyen halkaları */
      g.add(mesh(new THREE.TorusGeometry(1.74, 0.015, 8, 64), glow, 0, 0.2, 0, Math.PI / 2, 0, 0));
      /* yörünge halkası + uydu işaretler */
      var orbit = new THREE.Group(); orbit.position.y = 0.2; orbit.rotation.z = 0.35;
      orbit.add(mesh(new THREE.TorusGeometry(2.5, 0.012, 8, 72),
        new THREE.MeshBasicMaterial({ color: 0x5BC2EC, transparent: true, opacity: 0.5 }), 0, 0, 0, Math.PI / 2, 0, 0));
      for (var i = 0; i < 5; i++) {
        var a = i / 5 * Math.PI * 2;
        orbit.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), i % 2 ? gold : glow,
          Math.cos(a) * 2.5, 0, Math.sin(a) * 2.5));
      }
      orbit.userData.noExplode = true; g.add(orbit);
      /* kıta noktaları: küre yüzeyinde rastgele parlak noktalar */
      var N = 220, pos = new Float32Array(N * 3);
      for (var j = 0; j < N; j++) {
        var u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
        pos[j * 3] = Math.sin(v) * Math.cos(u) * 1.73;
        pos[j * 3 + 1] = 0.2 + Math.cos(v) * 1.73;
        pos[j * 3 + 2] = Math.sin(v) * Math.sin(u) * 1.73;
      }
      var pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var dots = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.045, color: 0x8FE0FF,
        transparent: true, opacity: 0.9, depthWrite: false }));
      dots.userData.noExplode = true; g.add(dots);
      var prev = g.userData.tick;
      g.userData.tick = function (t) { if (prev) prev(t); orbit.rotation.y = t * 0.5; };
      g.userData.baseY = 0.3;
      return g;
    }

    function buildPlant() { /* case studies: enerji santrali */
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(2.4, 1.6, 1.6), paint, -0.7, -0.8, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.6, 3, 1), white, -0.7, 0.25, 0, Math.PI / 2, 0, Math.PI));
      g.add(mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), steel, 1.1, -1.1, 0.1));
      /* soğutma kulesi */
      g.add(mesh(new THREE.CylinderGeometry(0.55, 0.8, 1.7, 26), white, 2.1, -0.7, -0.4));
      g.add(mesh(new THREE.CylinderGeometry(0.62, 0.55, 0.4, 26), white, 2.1, 0.35, -0.4));
      /* baca */
      g.add(mesh(new THREE.CylinderGeometry(0.18, 0.24, 3.0, 20), steel, -1.6, 0.9, -0.4));
      g.add(mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 22), glow, -1.6, 2.35, -0.4, Math.PI / 2, 0, 0));
      /* konveyör */
      g.add(mesh(new THREE.BoxGeometry(2.2, 0.1, 0.5), steel, 0.6, -0.4, 0.95, 0, 0, 0.35));
      smokeSystem(g, -1.6, 2.4, -0.4, 0xBFD6E4, 0.09, 0.5, 2.0);
      smokeSystem(g, 2.1, 0.55, -0.4, 0xD8E8F2, 0.11, 0.6, 1.6);
      g.userData.baseY = 0.35;
      return g;
    }

    function buildCamera() { /* galeri: fotoğraf makinesi */
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(3.0, 1.9, 1.1), dark, 0, 0, 0));
      g.add(mesh(new THREE.BoxGeometry(3.0, 0.5, 1.1), steel, 0, 0.72, 0));
      /* lens */
      g.add(mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.5, 36), steel, 0.3, -0.05, 0.75, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 36), dark, 0.3, -0.05, 1.05, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 32),
        new THREE.MeshPhysicalMaterial({ color: 0x123A5E, metalness: 0.1, roughness: 0.05,
          clearcoat: 1, clearcoatRoughness: 0 }), 0.3, -0.05, 1.2, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.TorusGeometry(0.63, 0.035, 10, 40), glow, 0.3, -0.05, 1.06, 0, 0, 0));
      /* vizör + deklanşör + flaş */
      g.add(mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), dark, -0.15, 1.15, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 18), gold, -1.05, 1.05, 0));
      var flash = mesh(new THREE.PlaneGeometry(0.4, 0.24),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.25 }), 1.05, 1.02, 0.1);
      flash.userData.noExplode = true; g.add(flash);
      g.userData.tick = function (t) {
        var f = (t % 3.2) < 0.12 ? 1 : 0.15;
        flash.material.opacity = f;
      };
      g.userData.baseY = 0.45;
      return g;
    }

    function buildMedal() { /* sertifikalar: altın madalya + kurdele */
      var g = new THREE.Group();
      var ribbonB = new THREE.MeshPhysicalMaterial({ color: 0x00A1E2, metalness: 0.1, roughness: 0.5 });
      var ribbonN = new THREE.MeshPhysicalMaterial({ color: 0x0A3A5C, metalness: 0.1, roughness: 0.5 });
      var r1 = mesh(new THREE.BoxGeometry(0.55, 2.2, 0.07), ribbonB, -0.4, 1.4, -0.05, 0, 0, 0.3);
      var r2 = mesh(new THREE.BoxGeometry(0.55, 2.2, 0.07), ribbonN, 0.4, 1.4, -0.05, 0, 0, -0.3);
      g.add(r1); g.add(r2);
      g.add(mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.16, 48), gold, 0, -0.3, 0, Math.PI / 2, 0, 0));
      g.add(mesh(new THREE.TorusGeometry(1.26, 0.05, 12, 56), gold, 0, -0.3, 0));
      g.add(mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.18, 48),
        new THREE.MeshPhysicalMaterial({ color: 0xF2CE6B, metalness: 0.85, roughness: 0.2 }),
        0, -0.3, 0.0, Math.PI / 2, 0, 0));
      /* yıldız kabartma */
      for (var i = 0; i < 5; i++) {
        var a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
        g.add(mesh(new THREE.BoxGeometry(0.14, 0.72, 0.1), gold,
          Math.cos(a) * 0.36, -0.3 + Math.sin(a) * 0.36, 0.12, 0, 0, a + Math.PI / 2));
      }
      g.add(mesh(new THREE.TorusGeometry(0.16, 0.045, 10, 22), gold, 0, 0.95, 0));
      g.userData.baseY = 0.35;
      return g;
    }

    function buildBook() { /* katalog: açık katalog + süzülen sayfalar */
      var g = new THREE.Group();
      var coverM = paint;
      var pageM = new THREE.MeshPhysicalMaterial({ color: 0xF4F7F9, metalness: 0, roughness: 0.7 });
      var c1 = mesh(new THREE.BoxGeometry(1.9, 0.1, 2.6), coverM, -0.95, -0.6, 0, 0, 0, 0.2);
      var c2 = mesh(new THREE.BoxGeometry(1.9, 0.1, 2.6), coverM, 0.95, -0.6, 0, 0, 0, -0.2);
      g.add(c1); g.add(c2);
      for (var i = 0; i < 4; i++) {
        g.add(mesh(new THREE.BoxGeometry(1.75, 0.03, 2.45), pageM, -0.88 + i * 0.02, -0.48 + i * 0.045, 0, 0, 0, 0.2 - i * 0.02));
        g.add(mesh(new THREE.BoxGeometry(1.75, 0.03, 2.45), pageM, 0.88 - i * 0.02, -0.48 + i * 0.045, 0, 0, 0, -0.2 + i * 0.02));
      }
      g.add(mesh(new THREE.PlaneGeometry(1.2, 0.7), glow, -0.85, -0.28, 0.01, -Math.PI / 2 + 0.2, 0, 0));
      /* süzülen sayfalar */
      var sheets = [];
      for (var j = 0; j < 3; j++) {
        var sh = mesh(new THREE.PlaneGeometry(0.8, 1.1),
          new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, metalness: 0, roughness: 0.6,
            side: THREE.DoubleSide, transparent: true, opacity: 0.92 }), 0, 0, 0);
        sh.userData.noExplode = true; sheets.push(sh); g.add(sh);
      }
      g.userData.tick = function (t) {
        sheets.forEach(function (sh, i) {
          var a = t * 0.6 + i * 2.1;
          sh.position.set(Math.cos(a) * 2.3, 0.7 + Math.sin(t * 0.9 + i) * 0.5, Math.sin(a) * 2.3);
          sh.rotation.set(0.4 + Math.sin(a) * 0.3, a + Math.PI / 2, Math.sin(t + i) * 0.2);
        });
      };
      g.userData.baseY = 0.45;
      return g;
    }

    function buildPin() { /* iletişim: konum pini + halka dalgası */
      var g = new THREE.Group();
      g.add(mesh(new THREE.SphereGeometry(1.05, 36, 24), blue, 0, 0.9, 0));
      var cone = mesh(new THREE.ConeGeometry(0.75, 1.9, 32), blue, 0, -0.5, 0);
      cone.rotation.x = Math.PI; g.add(cone);
      /* iç amblem: beyaz parlayan halka */
      g.add(mesh(new THREE.TorusGeometry(0.42, 0.09, 14, 36),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xE4F4FC,
          emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.3 }), 0, 0.95, 0.95));
      /* yer halka dalgaları */
      var rings = [];
      for (var i = 0; i < 3; i++) {
        var r = mesh(new THREE.TorusGeometry(0.8, 0.025, 8, 48),
          new THREE.MeshBasicMaterial({ color: 0x5BC2EC, transparent: true, opacity: 0.5 }),
          0, -1.55, 0, Math.PI / 2, 0, 0);
        r.userData.noExplode = true; rings.push(r); g.add(r);
      }
      g.userData.tick = function (t) {
        rings.forEach(function (r, i) {
          var ph = ((t * 0.5) + i / 3) % 1;
          r.scale.setScalar(0.4 + ph * 2.6);
          r.material.opacity = 0.55 * (1 - ph);
        });
      };
      g.userData.baseY = 0.6;
      return g;
    }

    var BUILDERS = {
      boiler: buildBoiler, vessel: buildVessel, burner: buildBurner,
      twin: function () { return wantScrolly ? buildHolo() : buildTwinPoints(); },
      factory: buildFactory, hardhat: buildHardhat, robotarm: buildRobotArm,
      globe: buildGlobe, plant: buildPlant, camera: buildCamera,
      medal: buildMedal, book: buildBook, pin: buildPin
    };
    var SCALES = { boiler: 1.1, pin: 0.92, globe: 1.08, medal: 1.1, factory: 1.12, twin: 1.1 };
    var model = (BUILDERS[variant] || buildBoiler)();
    model.scale.setScalar(SCALES[variant] || 1.18);
    scene.add(model);

    /* Parça envanteri (patlama koreografisi için) */
    var parts = [];
    model.children.forEach(function (o, i) {
      if (o.userData.noExplode) return;
      if (!o.isMesh && !o.isPoints) return;
      var dir = o.position.clone();
      if (dir.length() < 0.25) dir.set(Math.cos(i * 2.4), Math.sin(i * 1.7) * 0.6, Math.sin(i * 2.4));
      dir.normalize();
      /* EKSENEL DEMONTAJ (saat kurgusu): parçalar X ekseni boyunca sıralı açılır,
         ana gövde merkezde çapa kalır, radyal katkı hafif → okunur mekanik ayrışma */
      var rad = 0.5;
      if (o.geometry) {
        if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
        if (o.geometry.boundingSphere) rad = o.geometry.boundingSphere.radius;
      }
      var core = rad > 0.9 && Math.abs(o.position.x) < 0.3; /* ana gövde: sabit çapa */
      var ax = o.position.x !== 0 ? Math.sign(o.position.x) : (i % 2 ? 1 : -1);
      dir.set(
        ax * (1.6 + Math.abs(o.position.x) * 0.9),
        o.position.y * 0.55 + (srnd(i + 60) - 0.5) * 0.5,
        o.position.z * 0.55 + (srnd(i + 300) - 0.5) * 0.4);
      dir.normalize();
      parts.push({ o: o, pos: o.position.clone(), rot: o.rotation.clone(),
        dir: dir, str: core ? 0 : (rad > 0.9 ? 2.6 : 1.5) + srnd(i) * 0.9,
        spin: new THREE.Vector3(srnd(i + 40) - .5, srnd(i + 80) - .5, srnd(i + 120) - .5)
          .multiplyScalar(core ? 0 : (rad > 0.9 ? 0.4 : 1.6)),
        ph: srnd(i + 200) });
    });

    /* Patlama anı ışık halesi (arka planda büyüyen parlama) */
    var burst = (function () {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var g2 = c.getContext('2d');
      var rg = g2.createRadialGradient(128, 128, 4, 128, 128, 126);
      rg.addColorStop(0, 'rgba(140,220,255,.9)');
      rg.addColorStop(0.35, 'rgba(0,161,226,.35)');
      rg.addColorStop(1, 'rgba(0,161,226,0)');
      g2.fillStyle = rg; g2.fillRect(0, 0, 256, 256);
      var m = new THREE.Mesh(new THREE.PlaneGeometry(9, 9),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true,
          opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.position.set(0, 0.3, -2.5);
      scene.add(m);
      return m;
    })();

    /* Platform + neon halka + temas gölgesi */
    var platY = -2.0;
    var plat = new THREE.Group();
    plat.add(mesh(new THREE.CylinderGeometry(2.9, 3.05, 0.14, 64),
      new THREE.MeshPhysicalMaterial({ color: 0x0c2338, metalness: 0.6, roughness: 0.35,
        clearcoat: 0.8, clearcoatRoughness: 0.2 }), 0, platY, 0));
    plat.add(mesh(new THREE.TorusGeometry(2.92, 0.035, 10, 90), glow, 0, platY + 0.08, 0, Math.PI / 2, 0, 0));
    plat.add(mesh(new THREE.TorusGeometry(2.2, 0.015, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0x5BC2EC, transparent: true, opacity: 0.35 }),
      0, platY + 0.09, 0, Math.PI / 2, 0, 0));
    (function () {
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var g2 = c.getContext('2d');
      var rg = g2.createRadialGradient(64, 64, 8, 64, 64, 62);
      rg.addColorStop(0, 'rgba(0,0,0,.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g2.fillStyle = rg; g2.fillRect(0, 0, 128, 128);
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
      sh.rotation.x = -Math.PI / 2; sh.position.y = platY + 0.09;
      plat.add(sh);
    })();
    scene.add(plat);

    function resize() {
      var w = el.clientWidth || 600, h = el.clientHeight || 460;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(el);

    var visible = true;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible = e.isIntersecting; });
    }, { threshold: 0.02 }).observe(el);

    /* Etkileşim: sürükle-döndür + paralaks */
    var dragRot = 0, dragVel = 0, dragging = false, lastX = 0, mx = 0;
    var dom = renderer.domElement;
    dom.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; dom.style.cursor = 'grabbing';
      dom.setPointerCapture(e.pointerId); hint.style.opacity = '0';
    });
    dom.addEventListener('pointermove', function (e) {
      if (dragging) { var dx = e.clientX - lastX; lastX = e.clientX;
        dragRot += dx * 0.011; dragVel = dx * 0.011; }
    });
    function endDrag() { dragging = false; dom.style.cursor = 'grab'; }
    dom.addEventListener('pointerup', endDrag);
    dom.addEventListener('pointercancel', endDrag);
    if (!reduced) addEventListener('pointermove', function (e) {
      mx = (e.clientX / innerWidth - 0.5);
    }, { passive: true });

    /* ── SCROLLY kurulumu ── */
    var prog = 0, heroWrap = null, caps = [];
    if (wantScrolly) {
      var hero = el.closest('.page-hero');
      if (hero) {
        hero.style.minHeight = '100vh'; /* sabitli sahne tam ekran — altta bant kalmasın */
        heroWrap = hero.querySelector('.wrap');
        var capBox = document.createElement('div');
        capBox.className = 'scrolly-caps';
        (CAPTIONS[variant] || CAPTIONS.boiler).forEach(function (txt, i) {
          var d = document.createElement('div');
          d.className = 'scrolly-cap';
          d.innerHTML = '<span class="n">0' + (i + 1) + '</span>' + txt;
          capBox.appendChild(d); caps.push(d);
        });
        hero.appendChild(capBox);
        ScrollTrigger.create({
          trigger: hero, start: 'top top', end: '+=260%',
          pin: true, scrub: 0.55,
          onUpdate: function (self) { prog = self.progress; }
        });
      } else wantScrolly = false;
    }

    /* Faz eğrileri: yaklaş → dağıl (kamera İÇİNDEN geçer) → birleş → otur */
    function choreo(p) {
      var k, cz, capA = 0, capB = 0, capC = 0;
      if (p < 0.16) { k = 0; cz = lerp(11.4, 8.2, ease(p / 0.16)); capA = ease(p / 0.16); }
      else if (p < 0.46) { k = ease((p - 0.16) / 0.30); cz = lerp(8.2, 7.4, k); /* hafif dal */
        capA = 1 - ease((p - 0.16) / 0.10); capB = ease((p - 0.24) / 0.14); }
      else if (p < 0.76) { k = 1 - ease((p - 0.46) / 0.30); cz = lerp(7.4, 8.5, ease((p - 0.46) / 0.30));
        capB = 1 - ease((p - 0.46) / 0.12); capC = ease((p - 0.56) / 0.16); }
      else { k = 0; cz = lerp(8.5, 8.8, ease((p - 0.76) / 0.24)); capC = 1 - ease((p - 0.82) / 0.18); }
      return { k: k, cz: cz, caps: [capA, capB, capC] };
    }
    function bounceIn(t) { /* giriş: yukarıdan düş + sekme */
      if (t >= 1) return 0;
      var u = 1 - t;
      return Math.abs(Math.cos(t * 9)) * u * u * 5.5;
    }
    var prevK = 0, snapT = -9;

    var t0 = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      var t = reduced ? 0 : (now - t0) / 1000;
      if (!dragging) { dragRot += dragVel; dragVel *= 0.95; }

      if (wantScrolly) {
        var c = choreo(prog);
        camera.position.z = c.cz;
        camera.position.x = 0.3 + Math.sin(prog * 3.1) * 0.7; /* dağılırken hafif yörünge */
        /* parçalar: kademeli dağılma + süzülme */
        var n = parts.length;
        parts.forEach(function (pt, i) {
          var ki = ease(Math.max(0, Math.min(1, c.k * 1.35 - (i / n) * 0.35)));
          var fl = ki * Math.sin(t * 1.3 + pt.ph * 9) * 0.09; /* dağınıkken parçalar nefes alır */
          pt.o.position.set(
            pt.pos.x + pt.dir.x * (ki * pt.str + fl),
            pt.pos.y + pt.dir.y * (ki * pt.str + fl),
            pt.pos.z + pt.dir.z * (ki * pt.str + fl));
          pt.o.rotation.set(
            pt.rot.x + pt.spin.x * ki + fl,
            pt.rot.y + pt.spin.y * ki,
            pt.rot.z + pt.spin.z * ki);
        });
        /* birleşme ANI: ışık nabzı */
        if (prevK > 0.05 && c.k <= 0.05 && prog > 0.5) snapT = t;
        prevK = c.k;
        var snap = Math.max(0, 1 - (t - snapT) * 2.2);
        burst.material.opacity = c.k * 0.75 + snap * 0.9;
        burst.scale.setScalar(0.6 + c.k * 1.1 + snap * 0.5);
        /* alev: dağılırken söner */
        if (model.userData.flameMats) model.userData.flameMats.forEach(function (m, i) {
          m.opacity = (i === 0 ? 0.9 : 0.5) * (1 - c.k);
        });
        /* profil görünümü korunur: eksenel açılma yandan okunsun diye az döner */
        model.rotation.y = 0.35 + prog * 1.5 + dragRot + mx * 0.25 + (reduced ? 0 : t * 0.03);
        /* başlık ve fazlı yazılar */
        if (heroWrap) {
          var o = Math.max(0, 1 - prog * 6);
          heroWrap.style.opacity = o;
          heroWrap.style.transform = 'translateY(' + (-prog * 60) + 'px)';
          heroWrap.style.pointerEvents = o < 0.1 ? 'none' : '';
        }
        caps.forEach(function (d, i) {
          var a = Math.max(0, Math.min(1, c.caps[i]));
          d.style.opacity = a;
          d.style.transform = 'translateY(' + (16 - a * 16) + 'px)';
        });
        plat.rotation.y = model.rotation.y * 0.25;
        model.position.y = (model.userData.baseY || 0) + Math.sin(t * 0.8) * 0.04 + bounceIn(t / 1.35);
      } else {
        var scrollRot = reduced ? 0 : scrollY * 0.0022;
        model.rotation.y = 0.5 + (reduced ? 0 : t * 0.12) + scrollRot + dragRot + mx * 0.3;
        plat.rotation.y = model.rotation.y * 0.25;
        model.position.y = (model.userData.baseY || 0) + (reduced ? 0 : Math.sin(t * 0.8) * 0.06)
          + (reduced ? 0 : bounceIn(t / 1.35));
      }
      if (!reduced) { camera.position.y = 1.15 + Math.sin(t * 0.5) * 0.06; camera.lookAt(0, 0, 0); }
      if (model.userData.tick && !reduced) model.userData.tick(t);
      renderer.render(scene, camera);
    }
    if (reduced) { renderer.render(scene, camera); } else requestAnimationFrame(frame);
  }
})();
