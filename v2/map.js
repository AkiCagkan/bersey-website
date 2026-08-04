/* Coğrafi Varlık Haritası — dünya SVG'si üzerinde İstanbul merkezli ağ */
(async function () {
  const host = document.getElementById('cografya-harita');
  if (!host) return;

  // Dil: sayfanın <html lang> değerine göre isim ve etiketler
  const LANG = (document.documentElement.lang || 'tr').slice(0, 2);
  const L = {
    tr: { proje: n => n + ' seçili proje', pazar: 'Aktif pazar' },
    en: { proje: n => n + ' selected projects', pazar: 'Active market' },
    ru: { proje: n => n + ' избранных проектов', pazar: 'Активный рынок' },
  }[LANG] || { proje: n => n, pazar: '' };
  const NAMES = {
    tr: { TR: 'Türkiye', RU: 'Rusya', BY: 'Belarus', UA: 'Ukrayna', RO: 'Romanya', IR: 'İran', AZ: 'Azerbaycan', BG: 'Bulgaristan', EG: 'Mısır', GE: 'Gürcistan', JO: 'Ürdün', KZ: 'Kazakistan', RS: 'Sırbistan', SA: 'Suudi Arabistan' },
    en: { TR: 'Türkiye', RU: 'Russia', BY: 'Belarus', UA: 'Ukraine', RO: 'Romania', IR: 'Iran', AZ: 'Azerbaijan', BG: 'Bulgaria', EG: 'Egypt', GE: 'Georgia', JO: 'Jordan', KZ: 'Kazakhstan', RS: 'Serbia', SA: 'Saudi Arabia' },
    ru: { TR: 'Турция', RU: 'Россия', BY: 'Беларусь', UA: 'Украина', RO: 'Румыния', IR: 'Иран', AZ: 'Азербайджан', BG: 'Болгария', EG: 'Египет', GE: 'Грузия', JO: 'Иордания', KZ: 'Казахстан', RS: 'Сербия', SA: 'Саудовская Аравия' },
  }[LANG] || {};
  const COUNTRIES = {
    TR: { proje: 25 },
    RU: { proje: 13, nokta: [37.6, 55.7] },   // işaretçi Moskova'da
    BY: { proje: 3 },
    UA: { proje: 1 },
    RO: { proje: 2 },
    IR: { proje: 1 },
    AZ: { proje: null },
    BG: { proje: null },
    EG: { proje: null },
    GE: { proje: null },
    JO: { proje: null },
    KZ: { proje: null },
    RS: { proje: null },
    SA: { proje: null },
  };
  for (const cc in COUNTRIES) COUNTRIES[cc].ad = NAMES[cc] || cc;
  // Kalibrasyon çapaları: bbox merkezi ≈ coğrafi merkez kabulü (equirectangular)
  const ANCHORS = { TR: [35.2, 38.9], KZ: [66.9, 48.0], EG: [29.8, 26.6] };

  const res = await fetch((LANG === 'tr' ? '../assets' : '../../assets') + '/maps/world.svg');
  if (!res.ok) return;
  const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'geo-svg');
  const gLand = document.createElementNS(NS, 'g');
  svg.appendChild(gLand);
  doc.querySelectorAll('path[id]').forEach(p => {
    const c = document.createElementNS(NS, 'path');
    c.setAttribute('d', p.getAttribute('d'));
    c.setAttribute('class', COUNTRIES[p.id] ? 'm-land m-active' : 'm-land');
    c.dataset.cc = p.id;
    gLand.appendChild(c);
  });
  host.appendChild(svg); // bbox hesapları için DOM'da olmalı

  const bb = cc => gLand.querySelector(`[data-cc="${cc}"]`).getBBox();
  const center = cc => { const b = bb(cc); return [b.x + b.width / 2, b.y + b.height / 2]; };

  // lon/lat → svg koordinatı (TR-KZ x ölçeği, TR-EG y ölçeği)
  const [txc, tyc] = center('TR');
  const sx = (center('KZ')[0] - txc) / (ANCHORS.KZ[0] - ANCHORS.TR[0]);
  const sy = (center('EG')[1] - tyc) / (ANCHORS.TR[1] - ANCHORS.EG[1]);
  const geo = (lon, lat) => [txc + (lon - ANCHORS.TR[0]) * sx, tyc + (ANCHORS.TR[1] - lat) * sy];

  // İşaretçi noktaları
  const pts = {};
  for (const cc in COUNTRIES) {
    pts[cc] = COUNTRIES[cc].nokta ? geo(...COUNTRIES[cc].nokta) : center(cc);
  }
  const hub = geo(28.9, 41.0); // İstanbul

  // Görünüm alanı: RU hariç tüm ülke kutuları + Moskova noktası
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const cc in COUNTRIES) {
    if (cc === 'RU') continue;
    const b = bb(cc);
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  }
  y0 = Math.min(y0, pts.RU[1] - 14);
  const P = 16;
  svg.setAttribute('viewBox', `${x0 - P} ${y0 - P} ${x1 - x0 + 2 * P} ${y1 - y0 + 2 * P}`);

  // Hub ağı: İstanbul'dan her ülkeye kavisli hat
  const gNet = document.createElementNS(NS, 'g');
  svg.appendChild(gNet);
  for (const cc in pts) {
    if (cc === 'TR') continue;
    const [x, y] = pts[cc];
    const mx = (hub[0] + x) / 2, my = Math.min(hub[1], y) - Math.abs(hub[0] - x) * 0.18 - 6;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', `M${hub[0]},${hub[1]} Q${mx},${my} ${x},${y}`);
    path.setAttribute('class', 'm-arc');
    gNet.appendChild(path);
  }

  // İşaretçiler + etiketler
  const tip = document.createElement('div');
  tip.className = 'geo-tip';
  tip.hidden = true;
  host.appendChild(tip);
  const gMark = document.createElementNS(NS, 'g');
  svg.appendChild(gMark);
  for (const cc in pts) {
    const [x, y] = pts[cc];
    const d = COUNTRIES[cc];
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'm-marker' + (cc === 'TR' ? ' m-hub' : ''));
    const halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('cx', x); halo.setAttribute('cy', y); halo.setAttribute('r', cc === 'TR' ? 7 : 5);
    halo.setAttribute('class', 'm-halo');
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', cc === 'TR' ? 3.4 : 2.4);
    dot.setAttribute('class', 'm-dot');
    g.appendChild(halo); g.appendChild(dot);
    g.addEventListener('mouseenter', () => {
      const flagBase = LANG === 'tr' ? '../assets' : '../../assets';
      tip.innerHTML = `<img src="${flagBase}/images/flags/${cc.toLowerCase()}.png" alt="">` +
        `<b>${d.ad}</b><span>${d.proje ? L.proje(d.proje) : L.pazar}</span>`;
      tip.hidden = false;
      const r = dot.getBoundingClientRect(), h = host.getBoundingClientRect();
      tip.style.left = (r.left - h.left + r.width / 2) + 'px';
      tip.style.top = (r.top - h.top - 10) + 'px';
    });
    g.addEventListener('mouseleave', () => { tip.hidden = true; });
    gMark.appendChild(g);
  }
})();
