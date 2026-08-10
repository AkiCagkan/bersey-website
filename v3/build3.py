# -*- coding: utf-8 -*-
"""v2 -> v3 ELEGANT dönüştürücü.
İçerik bölümlerine DOKUNMAZ; yalnız chrome (head/hero/script) değişir.
Kural: scrub/3D blokları fotoğraflı hero'ya dönüşür, metin-veri birebir kalır."""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
V2, V3 = ROOT / 'v2', ROOT / 'v3'

HERO_PHOTO = {
    'index': 'images/bersey/factory.jpg',
    'enerji-uretimi': 'images/references/06-02-Kronospan_Ukrayna.jpg',
    'yakma-sistemleri': 'images/products/grate-combustion-1.jpg',
    'proses-ekipmanlari': 'images/products/pressure-vessel-1.jpg',
    'muhendislik-hizmetleri': 'images/fonlar/fon-teknik-cizim.webp',
    'hakkimizda': 'images/bersey/bersey-kurulus.jpg',
    'referanslar': 'images/references/02-01_Starwood_27MW_Metso.jpg',
    'katalog': 'images/fonlar/fon-celik.webp',
    'teknik-yapabilirlik': 'images/fonlar/fon-kaynak.webp',
    'case-studies': 'images/references/05-02-Kronospan.jpg',
    'galeri': 'images/references/06-04-ITC_Ankara.jpg',
    'sertifikalar': 'images/fonlar/fon-gradyan.webp',
    'kariyer': 'images/fonlar/fon-atmosfer.webp',
    'iletisim': 'images/fonlar/fon-siluet.webp',
}

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800'
         '&display=swap" rel="stylesheet">\n')

SCRUB_HINT = re.compile(r'^(kaydır|scroll|прокрут|листа)', re.I)

# ürün/hizmet sayfaları arası zarif geçiş zinciri (Ali Bey talebi, 10 Ağu)
PAGE_CHAIN = ['enerji-uretimi', 'yakma-sistemleri', 'proses-ekipmanlari', 'muhendislik-hizmetleri']
PN_LABEL = {'tr': ('Önceki', 'Sıradaki'), 'en': ('Previous', 'Next'), 'ru': ('Предыдущий', 'Следующий')}

# aşırı iddialı hero başlığı ölçülü karşılıkla değişti (Ali Bey talebi, 10 Ağu)
HERO_H1 = {
    'en': 'Your reliable partner in <i>industrial energy</i>',
    'ru': 'Надёжный партнёр в <i>промышленной энергетике</i>',
}

# anasayfa hero alt metnine üç dilde aynı kapanış cümlesi (TR karşılığı elle yazılan index.html'de)
TURNKEY = {
    'en': 'Turnkey solutions for biomass, natural gas, and alternative-fuel power plants.',
    'ru': 'Решения «под ключ» для энергетических установок на биомассе, природном газе '
          'и альтернативных видах топлива.',
}


def convert(rel: str) -> str:
    src = V2 / rel
    html = src.read_text(encoding='utf-8')
    name = pathlib.Path(rel).stem
    assets = '../../assets' if '/' in rel else '../assets'

    # head: fontlar + v3 stili
    html = re.sub(r'<link rel="stylesheet" href="((?:\.\./)?)style\.css\?v=\d+">',
                  lambda m: FONTS + '<link rel="stylesheet" href="%sstyle.css?v=2">' % m.group(1),
                  html)
    html = (html.replace('BERSEY v2', 'BERSEY').replace('BERSEY MONOLITH', 'BERSEY')
                .replace('Konsept v2', 'Konsept v3')
                .replace('Concept v2', 'Concept v3')
                .replace('Концепт v2', 'Концепт v3')
                .replace('KONSEPT v2 · MONOLITH', 'KONSEPT v3 · ELEGANT')
                .replace('CONCEPT v2 · MONOLITH', 'CONCEPT v3 · ELEGANT')
                .replace('КОНЦЕПТ v2 · MONOLITH', 'КОНЦЕПТ v3 · ELEGANT'))
    # form dönüş adresi ve v2 URL kalıntıları
    html = html.replace('bersey-website/v2/', 'bersey-website/v3/')
    html = html.replace('<div id="prog"></div>\n', '').replace('<div id="prog"></div>', '')
    html = html.replace('bersey-amblem-negatif.svg', 'bersey-amblem.svg')
    html = html.replace(' data-mag', '')

    m = re.search(r'<section id="hero" data-scrub[^>]*>.*?</section>', html, re.S)
    if m:
        block = m.group(0)
        eyb = re.search(r'<p class="eyb">(.*?)</p>', block, re.S)
        h1 = re.search(r'<h1>(.*?)</h1>', block, re.S)
        sub = re.search(r'<p class="hsub">(.*?)</p>', block, re.S)
        subtxt = sub.group(1).strip() if sub else ''
        parts = re.split(r'(?<=[.!?])\s+', subtxt, maxsplit=1)
        if parts and SCRUB_HINT.match(parts[0].strip()):
            subtxt = parts[1].strip() if len(parts) > 1 else ''
        photo = HERO_PHOTO.get(name, 'images/bersey/factory.jpg')
        is_index = name == 'index'
        if is_index:
            lang = rel.split('/')[0] if '/' in rel else 'tr'
            extra = TURNKEY.get(lang, '')
            if extra and extra not in subtxt:
                subtxt = (subtxt + ' ' + extra).strip()
        cta = ''
        if is_index:
            nv = re.search(r'class="nav-cta"[^>]*>(.*?)</a>', html, re.S)
            rf = re.search(r'<a href="referanslar\.html"[^>]*>(.*?)</a>', html, re.S)
            b1 = nv.group(1).strip() if nv else 'Teklif Alın'
            b2 = rf.group(1).strip() if rf else 'Referanslar'
            cta = ('\n    <div class="hero-cta">\n'
                   '      <a class="btn" href="iletisim.html">%s</a>\n'
                   '      <a class="btn ghost" href="referanslar.html">%s</a>\n    </div>' % (b1, b2))
        klass = 'hero' if is_index else 'p-hero'
        newhero = ('<section class="%s">\n'
                   '  <div class="bgph" style="background-image:url(%s/%s)"></div>\n'
                   '  <div class="wrap">\n' % (klass, assets, photo))
        if eyb:
            newhero += '    <p class="eyb">%s</p>\n' % eyb.group(1)
        h1txt = h1.group(1) if h1 else ''
        if is_index:
            h1txt = HERO_H1.get(lang, h1txt)
        if h1txt:
            newhero += '    <h1>%s</h1>\n' % h1txt
        if subtxt:
            newhero += '    <p class="sub">%s</p>' % subtxt
        newhero += cta + '\n  </div>\n</section>'
        html = html.replace(block, newhero)
    else:
        html = re.sub(r'[ \t]*<div class="hero-3d[^"]*">.*?</div>\n?', '', html, flags=re.S)
        ph = re.search(r'<section class="p-hero">\s*(<div class="bgph")?', html)
        if ph and not ph.group(1):
            photo = HERO_PHOTO.get(name, 'images/bersey/factory.jpg')
            html = html.replace(
                '<section class="p-hero">',
                '<section class="p-hero">\n  <div class="bgph" style="background-image:url(%s/%s)"></div>'
                % (assets, photo), 1)

    html = re.sub(r'\s*<div class="h3d-hint">.*?</div>', '', html, flags=re.S)

    for pat in (r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/gsap[^"]*"></script>\s*',
                r'<script src="https://cdn\.jsdelivr\.net/npm/lenis[^"]*"></script>\s*',
                r'<script src="[^"]*hf-scrub\.js[^"]*"></script>\s*',
                r'<script src="[^"]*boiler3d\.js[^"]*"[^>]*></script>\s*'):
        html = re.sub(pat, '', html)
    html = re.sub(r'<script src="((?:\.\./)?)app\.js\?v=\d+"></script>',
                  r'<script src="\1app.js?v=2"></script>', html)

    # ── içerik cilası (QA bulguları — kalıcı kurallar) ──
    # artık var olmayan 3D etkileşimine işaret eden CTA/cümleler
    html = re.sub(r'(İncele|Explore|Подробнее) — [^<]*→', r'\1 →', html)
    html = html.replace(' Drag to rotate the model.', '').replace('Drag to rotate the model.', '')
    # JS kapalıyken sayaçlar 0 kalmasın: gerçek değer HTML'e yazılır, animasyon 0'dan başlar
    html = re.sub(r'(<b data-count="(\d+)")([^>]*)>0</b>', r'\1\3>\2</b>', html)
    if name == 'galeri':  # 2024 Pinskdrev fotoğrafları eklenince güncellenmemiş sayımlar
        html = re.sub(r'\b73\b', '75', html)
        html = re.sub(r'\b53\b', '55', html)
    if '/' in rel and rel.startswith('en/'):  # EN nav etiketi standardizasyonu
        html = html.replace('>Energy Production<', '>Energy Generation<')
    if name == 'hakkimizda':  # tam değerler "+" almasın; etiketteki çift "+" temizle
        html = html.replace('<div class="stat" data-rv><b data-count="14">',
                            '<div class="stat raw" data-rv><b data-count="14">')
        html = html.replace('<div class="stat" data-rv><b data-count="47">',
                            '<div class="stat raw" data-rv><b data-count="47">')
        html = re.sub(r'<span>\+\s*', '<span>', html)
    if name == 'case-studies':  # yıllar ve ülke sayısı tam değer
        for n in ('6', '2004', '2025'):
            html = html.replace('<div class="stat" data-rv><b data-count="%s">' % n,
                                '<div class="stat raw" data-rv><b data-count="%s">' % n)

    # "Teklif Alın" koyu bandı kaldırıldı (Ali Bey talebi, 10 Ağu) — iletişim sayfası ve nav butonu duruyor
    html = re.sub(r'<section id="teklif-cta">.*?</section>\s*', '', html, flags=re.S)
    # footer'daki "Klasik Site" linki kaldırıldı (Ali Bey talebi, 10 Ağu)
    html = re.sub(r'\s*<a class="btn ghost" href="(?:\.\./)+(?:en/|ru/)?index\.html">[^<]*</a>', '', html)

    # aşırı iddialı ifadeler ölçülü karşılıklarla değişti (Ali Bey talebi, 10 Ağu)
    html = (html.replace('kusursuz birleşir', 'özenle birleştirilir')
                .replace('fits together flawlessly', 'assembled with care')
                .replace('безупречно собирается воедино', 'тщательно собирается воедино')
                .replace('sektör lideri konumuna gelindi',
                         'sektörün önde gelen firmaları arasına girildi')
                .replace('became a sector leader in biomass energy systems',
                         'became one of the leading companies in biomass energy systems')
                .replace('Компания стала лидером отрасли',
                         'Компания вошла в число ведущих компаний отрасли'))

    # ürün/hizmet sayfaları arası Önceki/Sıradaki geçişi
    if name in PAGE_CHAIN:
        lang = rel.split('/')[0] if '/' in rel else 'tr'
        i = PAGE_CHAIN.index(name)
        prv, nxt = PAGE_CHAIN[i - 1], PAGE_CHAIN[(i + 1) % len(PAGE_CHAIN)]

        def navlabel(target):
            m2 = re.search(r'<a href="%s\.html"[^>]*>(.*?)</a>' % target, html)
            return re.sub(r'<[^>]+>', '', m2.group(1)).strip() if m2 else target

        pl, nl = PN_LABEL.get(lang, PN_LABEL['tr'])
        block = ('<section class="pagenav"><div class="wrap">\n'
                 '  <a class="pn prev" href="%s.html"><span>← %s</span><b>%s</b></a>\n'
                 '  <a class="pn next" href="%s.html"><span>%s →</span><b>%s</b></a>\n'
                 '</div></section>\n\n' % (prv, pl, navlabel(prv), nxt, nl, navlabel(nxt)))
        html = html.replace('<footer id="footer">', block + '<footer id="footer">', 1)

    out = V3 / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8', newline='\n')
    return rel


if __name__ == '__main__':
    done = []
    for f in sorted(V2.glob('*.html')):
        if f.name.startswith('_') or f.name == 'index.html':
            continue  # TR index elle yazıldı
        done.append(convert(f.name))
    for lang in ('en', 'ru'):
        for f in sorted((V2 / lang).glob('*.html')):
            done.append(convert('%s/%s' % (lang, f.name)))
    print('dönüştürülen: %d sayfa' % len(done))
    for d in done:
        print(' -', d)
