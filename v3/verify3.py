# -*- coding: utf-8 -*-
"""v2 <-> v3 içerik paritesi: resim, link ve görünür metin kaybı raporu."""
import re, pathlib, html as H

ROOT = pathlib.Path(__file__).resolve().parent.parent
V2, V3 = ROOT / 'v2', ROOT / 'v3'

# beklenen kayıplar (scrub/3D chrome'a ait, içerik değil)
IMG_OK = re.compile(r'(frames|frames-burner|frames-vessel|/models/|bersey-amblem)')
WORD_OK = {
    # scrub anlatım sözcükleri + sürüm etiketleri
    'kaydırın', 'kaydır', 'scroll', 'прокрутите', 'листайте', 'monolith', 'v2', 'v3', 'elegant',
    'faz', 'phase', 'фаза', 'söküp', 'takın', 'сборку', 'разберите',
    # kaldırılan "Drag to rotate the model." + EN nav standardizasyonu (Production→Generation)
    'drag', 'rotate', 'model', 'production',
}


def media(html):
    imgs = set(re.findall(r'src="([^"]+\.(?:jpg|jpeg|png|webp|svg|mp4|gif))"', html, re.I))
    imgs |= set(re.findall(r'background-image:url\(([^)]+)\)', html))
    return imgs


def hrefs(html):
    return set(re.findall(r'href="([^"]+)"', html))


def words(html):
    t = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    t = re.sub(r'<style.*?</style>', ' ', t, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = H.unescape(t)
    return set(w.lower() for w in re.findall(r'[\wşŞıİğĞüÜöÖçÇа-яА-ЯёЁ%°+\-]{2,}', t))


def strip_scrub(html):
    """bilinçli kaldırılan bloklar: animasyon anlatımı + Ali Bey'in kaldırttığı teklif-cta bandı"""
    html = re.sub(r'<div class="scrub-phases"[^>]*>.*?</div>', ' ', html, flags=re.S)
    html = re.sub(r'<p class="hsub">.*?</p>', ' ', html, flags=re.S)
    html = re.sub(r'<a class="btn ghost"[^>]*>.*?</a>', ' ', html, flags=re.S)
    html = re.sub(r'<section id="teklif-cta">.*?</section>', ' ', html, flags=re.S)
    return html


def check(rel):
    a = (V2 / rel).read_text(encoding='utf-8')
    b = (V3 / rel).read_text(encoding='utf-8')
    prob = []
    mi = {x for x in media(a) - media(b) if not IMG_OK.search(x)}
    if mi:
        prob.append('KAYIP GÖRSEL: ' + ', '.join(sorted(mi)))
    hi = {x for x in hrefs(a) - hrefs(b)
          if not x.startswith(('https://cdnjs', 'https://cdn.jsdelivr'))
          and 'style.css' not in x}
    if hi:
        prob.append('KAYIP LİNK: ' + ', '.join(sorted(hi)))
    wi = {w for w in words(strip_scrub(a)) - words(strip_scrub(b))
          if w not in WORD_OK and not w.isdigit()}
    if wi:
        prob.append('KAYIP SÖZCÜK: ' + ', '.join(sorted(wi)))
    return prob


if __name__ == '__main__':
    pages = [f.name for f in sorted(V2.glob('*.html')) if not f.name.startswith('_')]
    pages += ['%s/%s' % (l, f.name) for l in ('en', 'ru') for f in sorted((V2 / l).glob('*.html'))]
    bad = 0
    for rel in pages:
        if not (V3 / rel).exists():
            print('!! EKSİK SAYFA:', rel)
            bad += 1
            continue
        p = check(rel)
        if p:
            bad += 1
            print('==', rel)
            for x in p:
                print('   ', x)
    print('---')
    print('sorunlu sayfa: %d / %d' % (bad, len(pages)))
