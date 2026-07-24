#!/usr/bin/env python3
"""v2 MONOLITH çok sayfalı montaj: _shell.html + partials → 14 sayfa.
Deterministik; her çalıştırma sayfaları yeniden üretir."""
import re, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SHELL = open('_shell.html').read()

def part(name):
    return open('partials/' + name).read()

def split_sections(html):
    """Üst düzey <section ...>...</section> bloklarını sırayla döndürür (id→html)."""
    out = {}
    for m in re.finditer(r'<section[^>]*\bid="([^"]+)"[\s\S]*?</section>\s*(?=<section|\Z)', html):
        out[m.group(1)] = m.group(0)
    return out

P04 = split_sections(part('04-yakma-proses-muh.html'))
P10 = split_sections(part('10-dokuman-kariyer-iletisim.html'))

def scrub_hero(h1, eyb, sub, src, count, phases):
    ph = '\n'.join('      <span data-at="%s" data-eyb="%s">%s</span>' % p for p in phases)
    return '''<section id="hero" data-scrub data-scrub-src="%s" data-scrub-count="%d">
  <div class="pinbox">
    <canvas id="seq" class="scrub-canvas"></canvas>
    <div class="shade"></div>
    <div class="htxt">
      <p class="eyb">%s</p>
      <h1>%s</h1>
      <p class="hsub">%s</p>
    </div>
    <div class="hcap"><small></small><b></b></div>
    <div class="scrollhint">Kaydır ▾</div>
  </div>
  <div class="scrub-phases" hidden>
%s
  </div>
</section>''' % (src, count, eyb, h1, sub, ph)

def model_hero(h1, eyb, sub, model, bg):
    return '''<section class="p-hero">
  <div class="bgph" style="background-image:url(%s)"></div>
  <div class="hero-3d" data-model3d="%s"></div>
  <div class="wrap">
    <div class="crumb"><a href="index.html">Ana Sayfa</a> › %s</div>
    <h1>%s</h1>
    <p class="sub">%s</p>
  </div>
</section>''' % (bg, model, eyb, h1, sub)

CLIENTS = ['kronospan','yildiz-entegre','starwood','kastamonu','pinskdrev','borisovdrev',
  'hayat_kimya','orma','sveza','agt','teverpan','itc','krasny-yakor','aymar','trakyabirlik',
  'doysan','camsan','camsan-adapazari','siempelkamp','buttner','dieffenbacher','upg-zheshart',
  'korozo','koska','elif','onduline','divapan','marsa','mendez','selolit']
logo_imgs = ''.join('<img src="../assets/images/clients/%s.png" alt="%s" loading="lazy">' % (c, c)
                    for c in CLIENTS)

MANIFESTO = open('partials/_manifesto.html').read() if os.path.exists('partials/_manifesto.html') else ''

OVERVIEW = '''<section id="urunler" class="sec alt">
  <div class="wrap">
    <p class="eyb" data-rv>ÜRÜN &amp; HİZMETLER</p>
    <h2 class="h2" data-rv>Dört ana<br>uzmanlık</h2>
    <div class="grid g2">
      <article class="card" data-rv>
        <figure class="ph r169"><img src="../assets/images/products/thermal-oil-1.jpg" alt="Enerji üretim sistemleri" loading="lazy" width="1152" height="864"></figure>
        <h3 class="h3">Enerji Üretim Sistemleri</h3>
        <p class="p">Kızgın yağ, buhar, sıcak su ve atık ısı kazanları; buhar ve sıcak gaz jeneratörleri. 465 kW – 46 MW.</p>
        <div><a class="btn ghost" data-mag href="enerji-uretimi.html">İncele — kazanı söküp takın →</a></div>
      </article>
      <article class="card" data-rv>
        <figure class="ph r169"><img src="../assets/images/products/gas-oil-burner-1.jpg" alt="Yakma sistemleri" loading="lazy" width="1152" height="864"></figure>
        <h3 class="h3">Yakma Sistemleri</h3>
        <p class="p">Izgaralı ve akışkan yataklı yakma, gaz-sıvı yakıt brülörleri, toz yakma. 24 yakıt türünde kanıtlanmış deneyim.</p>
        <div><a class="btn ghost" data-mag href="yakma-sistemleri.html">İncele — brülörü söküp takın →</a></div>
      </article>
      <article class="card" data-rv>
        <figure class="ph r169"><img src="../assets/images/products/pressure-vessel-1.jpg" alt="Proses ekipmanları" loading="lazy" width="1152" height="864"></figure>
        <h3 class="h3">Proses Ekipmanları</h3>
        <p class="p">Basınçlı kaplar, proses tankları, eşanjörler, degazörler, baca gazı temizleme. AD 2000 · EN 13445.</p>
        <div><a class="btn ghost" data-mag href="proses-ekipmanlari.html">İncele — kabı söküp takın →</a></div>
      </article>
      <article class="card" data-rv>
        <figure class="ph r169"><img src="../assets/images/products/heat-strength-1.jpg" alt="Mühendislik hizmetleri" loading="lazy" width="1152" height="864"></figure>
        <h3 class="h3">Mühendislik Hizmetleri</h3>
        <p class="p">Boru hattı &amp; gerilme analizi, ısıl-mukavemet hesapları, ekipman tasarımı, satış sonrası hizmetler.</p>
        <div><a class="btn ghost" data-mag href="muhendislik-hizmetleri.html">İncele →</a></div>
      </article>
    </div>
  </div>
</section>
<div class="marq"><div class="marq-track">%s%s</div></div>''' % (logo_imgs, logo_imgs)

KAZAN_PH = [('0.24', 'FAZ 01', 'Brülör grubu ayrılır'),
            ('0.50', 'FAZ 02', 'Ön kapak ve cidar açılır'),
            ('0.76', 'FAZ 03', 'Serpantin ve iç aksam')]
BURNER_PH = [('0.24', 'FAZ 01', 'Alev gözetleme camı ve ön plaka'),
             ('0.50', 'FAZ 02', 'Fan grubu ve yakıt hattı açılır'),
             ('0.76', 'FAZ 03', 'Kontrollü hava, tam yanma')]
import glob as _g
BURNER_COUNT = len(_g.glob('frames-burner/*.webp')) or 121
VESSEL_COUNT = len(_g.glob('frames-vessel/*.webp')) or 121
VESSEL_PH = [('0.24', 'FAZ 01', 'Bombeli kapaklar ve flanşlar'),
             ('0.50', 'FAZ 02', 'Gövde bileziği ve iç aksam'),
             ('0.76', 'FAZ 03', 'AD 2000 · EN 13445 tasarım')]

PAGES = [
  dict(f='index.html', t='BERSEY MONOLITH — Endüstriyel Enerji & Kazan Sistemleri',
    d="1979'dan bu yana 14 ülkede 235+ enerji projesi. Konsept v2.", a='',
    hero=scrub_hero('Endüstrinin<br>enerjisini<br><i>biz üretiyoruz</i>',
      "1979'DAN BU YANA · MÜHENDİSÇE ÇÖZÜMLER",
      'Kaydırın — kızgın yağ kazanımız gözünüzün önünde parçalarına ayrılsın. Her parça ayrı hesaplanır, ayrı test edilir, kusursuz birleşir.',
      'frames/frame_', 121, KAZAN_PH),
    content='MANIFESTO+OVERVIEW'),
  dict(f='enerji-uretimi.html', t='Enerji Üretim Sistemleri | BERSEY v2',
    d='Kızgın yağ, buhar, sıcak su, atık ısı kazanları; buhar ve sıcak gaz jeneratörleri.', a='enerji',
    hero=scrub_hero('Enerji Üretim<br><i>Sistemleri</i>', 'ENERJİ ÜRETİM SİSTEMLERİ',
      'Kaydırın — kızgın yağ kazanımız parçalarına ayrılsın. 465 kW – 46 MW komple kazan sistemleri.',
      'frames/frame_', 121, [('0.24','FAZ 01','465 kW – 46 MW kapasite aralığı'),
                             ('0.50','FAZ 02','Her parça ayrı hesaplanır'),
                             ('0.76','FAZ 03',"%90'a varan verimlilik (LHV)")]),
    content='partial:03-enerji.html'),
  dict(f='yakma-sistemleri.html', t='Yakma Sistemleri | BERSEY v2',
    d='Izgaralı ve akışkan yataklı yakma, brülörler, toz yakma — 24 yakıt türü.', a='yakma',
    hero=scrub_hero('Yakma<br><i>Sistemleri</i>', 'YAKMA SİSTEMLERİ',
      'Kaydırın — gaz-sıvı yakıt brülörümüz parçalarına ayrılsın. 24 yakıt türünde kanıtlanmış deneyim.',
      'frames-burner/frame_', BURNER_COUNT, BURNER_PH),
    content='sec04:yakma'),
  dict(f='proses-ekipmanlari.html', t='Proses Ekipmanları | BERSEY v2',
    d='Basınçlı kaplar, proses tankları, eşanjörler, degazörler, baca gazı temizleme.', a='proses',
    hero=scrub_hero('Proses<br><i>Ekipmanları</i>', 'PROSES EKİPMANLARI',
      'Kaydırın — ASME basınçlı kabımız parçalarına ayrılsın. AD 2000 · EN 13445 tasarım.',
      'frames-vessel/frame_', VESSEL_COUNT, VESSEL_PH),
    content='sec04:proses'),
  dict(f='muhendislik-hizmetleri.html', t='Mühendislik Hizmetleri | BERSEY v2',
    d='Boru hattı ve gerilme analizi, ısıl-mukavemet hesapları, ekipman tasarımı, satış sonrası.', a='muhendislik',
    hero=model_hero('Mühendislik<br><i>Hizmetleri</i>', 'Mühendislik &amp; Danışmanlık',
      'Dijital ikizden sahaya: ASME · EN · API standartlarında analiz ve tasarım. Modeli sürükleyerek döndürün.',
      'twin', '../assets/images/products/heat-strength-1.jpg'),
    content='sec04:muhendislik'),
  dict(f='teknik-yapabilirlik.html', t='Teknik Yapabilirlik | BERSEY v2',
    d='Üretim yetenekleri, makine parkuru, kaynak prosedürleri.', a='',
    hero=model_hero('Teknik<br><i>Yapabilirlik</i>', 'Teknik Yapabilirlik',
      'Üretim tesisimiz, makine parkurumuz ve sertifikalı kaynak prosedürlerimiz. Modeli sürükleyerek döndürün.',
      'robotarm', '../assets/images/banners/pages/products.jpg'),
    content='partial:11-teknik.html'),
  dict(f='referanslar.html', t='Referanslar | BERSEY v2',
    d='14 ülkede 235+ proje: 180 kızgın yağ referansı ve 45 seçili proje.', a='referanslar',
    hero=model_hero('Küresel<br><i>Referanslar</i>', 'Referanslar',
      '14 ülkede 235+ proje, 2.600+ MW kurulu güç. Modeli sürükleyerek döndürün.',
      'globe', '../assets/images/banners/pages/references.jpg'),
    content='partial:05-referanslar.html'),
  dict(f='case-studies.html', t='Vaka Analizleri | BERSEY v2',
    d='45 büyük ölçekli referans projenin analizi.', a='',
    hero=model_hero('Vaka<br><i>Analizleri</i>', 'Referans Projeler',
      'Kurulumdan devreye almaya: 45 büyük ölçekli projenin hikâyesi. Modeli sürükleyerek döndürün.',
      'plant', '../assets/images/banners/pages/references.jpg'),
    content='partial:06-cases.html'),
  dict(f='galeri.html', t='Galeri | BERSEY v2',
    d='73 fotoğraf: projeler, üretim ve ekipman.', a='',
    hero=model_hero('Medya<br><i>Arşivi</i>', 'Galeri',
      'Üretim tesisimizden, projelerimizden ve montaj çalışmalarımızdan kareler. Modeli sürükleyerek döndürün.',
      'camera', '../assets/images/banners/pages/case-studies.jpg'),
    content='partial:07-galeri.html'),
  dict(f='hakkimizda.html', t='Hakkımızda | BERSEY v2',
    d="1979'dan bugüne Bersey'in hikâyesi, değerleri ve uluslararası tecrübesi.", a='hakkimizda',
    hero=model_hero('1979\'dan<br><i>bugüne</i>', 'Hakkımızda',
      'İki makine mühendisinin kurduğu atölyeden 14 ülkeye. Modeli sürükleyerek döndürün.',
      'factory', '../assets/images/banners/pages/about.jpg'),
    content='partial:08-hakkimizda.html'),
  dict(f='sertifikalar.html', t='Sertifikalar | BERSEY v2',
    d='ASME U+S, National Board, ISO, EAC, TSE — tüm belgelerimiz.', a='',
    hero=model_hero('Sertifikalar &amp;<br><i>Belgeler</i>', 'Sertifikalar',
      'Uluslararası standartlara uygunluğumuzu belgeleyen tüm sertifikalar. Modeli sürükleyerek döndürün.',
      'medal', '../assets/images/banners/pages/about.jpg'),
    content='partial:09-sertifikalar.html'),
  dict(f='katalog.html', t='Dokümanlar & Kataloglar | BERSEY v2',
    d='23 PDF: ürün katalogları (TR/EN/RU), teknik veri sayfaları, referans listeleri.', a='katalog',
    hero=model_hero('Doküman<br><i>Merkezi</i>', 'Dokümanlar',
      'Ürün katalogları, teknik veri sayfaları ve referans listeleri — üç dilde. Modeli sürükleyerek döndürün.',
      'book', '../assets/images/banners/pages/products.jpg'),
    content='sec10:dokumanlar'),
  dict(f='kariyer.html', t='Kariyer | BERSEY v2',
    d='Bersey ekibine katılın: açık pozisyonlar ve başvuru formu.', a='',
    hero=model_hero('Bersey\'de<br><i>Kariyer</i>', 'İnsan Kaynakları',
      '47 yıllık mühendislik kültürünün parçası olun. Modeli sürükleyerek döndürün.',
      'hardhat', '../assets/images/banners/pages/engineering.jpg'),
    content='sec10:kariyer'),
  dict(f='iletisim.html', t='İletişim | BERSEY v2',
    d='Teklif ve bilgi talepleri: merkez ofis, fabrika, satış & ihracat.', a='',
    hero=model_hero('Bizimle<br><i>iletişime geçin</i>', 'İletişim',
      'Projeniz için teklif alın — ekibimiz en kısa sürede dönüş yapar. Modeli sürükleyerek döndürün.',
      'pin', '../assets/images/banners/pages/contact.jpg'),
    content='sec10:iletisim'),
]

# sayfa → içerdiği id'ler (çapraz link haritası)
OWNER = {'enerji': 'enerji-uretimi.html', 'yakma': 'yakma-sistemleri.html',
  'proses': 'proses-ekipmanlari.html', 'muhendislik': 'muhendislik-hizmetleri.html',
  'referanslar': 'referanslar.html', 'vakalar': 'case-studies.html', 'galeri': 'galeri.html',
  'hakkimizda': 'hakkimizda.html', 'sertifikalar': 'sertifikalar.html',
  'dokumanlar': 'katalog.html', 'kariyer': 'kariyer.html', 'iletisim': 'iletisim.html',
  'teknik': 'teknik-yapabilirlik.html', 'urunler': 'index.html', 'manifesto': 'index.html'}

MODEL_PAGES = {'muhendislik-hizmetleri.html', 'teknik-yapabilirlik.html', 'referanslar.html',
  'case-studies.html', 'galeri.html', 'hakkimizda.html', 'sertifikalar.html',
  'katalog.html', 'kariyer.html', 'iletisim.html'}

for pg in PAGES:
    c = pg['content']
    if c == 'MANIFESTO+OVERVIEW':
        content = MANIFESTO + '\n' + OVERVIEW
    elif c.startswith('partial:'):
        content = part(c.split(':', 1)[1])
    elif c.startswith('sec04:'):
        content = P04[c.split(':')[1]]
    elif c.startswith('sec10:'):
        content = P10[c.split(':')[1]]
    own_ids = set(re.findall(r'id="([^"]+)"', content)) | {'hero'}
    def maplink(m):
        tid = m.group(1)
        if tid in own_ids or tid not in OWNER: return m.group(0)
        return 'href="%s#%s"' % (OWNER[tid], tid) if tid not in ('iletisim','kariyer','dokumanlar','urunler') \
           else 'href="%s"' % OWNER[tid]
    content = re.sub(r'href="#([a-z0-9-]+)"', maplink, content)
    hero = re.sub(r'href="#([a-z0-9-]+)"', maplink, pg['hero'])
    extra = '<script src="../assets/boiler3d.js" defer></script>' if pg['f'] in MODEL_PAGES else ''
    html = (SHELL.replace('__TITLE__', pg['t']).replace('__DESC__', pg['d'])
      .replace('__HERO__', hero).replace('__CONTENT__', content)
      .replace('__EXTRA_SCRIPTS__', extra))
    for k in ['enerji', 'yakma', 'proses', 'muhendislik', 'hakkimizda', 'referanslar', 'katalog']:
        html = html.replace('__A_%s__' % k, 'class="active"' if pg['a'] == k else '')
    open(pg['f'], 'w').write(html)
    print('OK', pg['f'], len(html))
print('BUILD DONE')
