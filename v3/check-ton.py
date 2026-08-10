# -*- coding: utf-8 -*-
"""Ton düzenlemesi güvenlik ağı: yapı (etiket dizisi), rakamlar, görsel ve linkler değişmemeli."""
import re, sys, pathlib
from collections import Counter

V3 = pathlib.Path(__file__).resolve().parent
SNAP = V3.parent / 'v3-snapshot-ton'


def parts(p):
    html = p.read_text(encoding='utf-8')
    tags = re.findall(r'<[a-zA-Z/][^>]*>', html)
    text = re.sub(r'<[^>]+>', ' ', re.sub(r'<(script|style).*?</\1>', ' ', html, flags=re.S))
    nums = Counter(re.findall(r'\d+(?:[.,]\d+)?', text))
    imgs = set(re.findall(r'src="([^"]+)"', html))
    hrefs = set(re.findall(r'href="([^"]+)"', html))
    return tags, nums, imgs, hrefs


bad = 0
pages = [f.relative_to(SNAP) for f in
         list(SNAP.glob('*.html')) + list(SNAP.glob('en/*.html')) + list(SNAP.glob('ru/*.html'))]
for rel in pages:
    t1, n1, i1, h1 = parts(SNAP / rel)
    t2, n2, i2, h2 = parts(V3 / rel)
    probs = []
    if t1 != t2:
        d = next((k for k in range(min(len(t1), len(t2))) if t1[k] != t2[k]), min(len(t1), len(t2)))
        probs.append('ETİKET DİZİSİ değişti (ilk fark #%d: %s -> %s; %d->%d etiket)'
                     % (d, t1[d] if d < len(t1) else '-', t2[d] if d < len(t2) else '-', len(t1), len(t2)))
    if n1 != n2:
        kayip = n1 - n2
        yeni = n2 - n1
        probs.append('RAKAM farkı: kayıp=%s yeni=%s' % (dict(kayip), dict(yeni)))
    if i1 != i2:
        probs.append('GÖRSEL farkı: %s' % (i1 ^ i2))
    if h1 != h2:
        probs.append('LİNK farkı: %s' % (h1 ^ h2))
    if probs:
        bad += 1
        print('==', rel)
        for x in probs:
            print('   ', x)
print('---')
print('sorunlu sayfa: %d / %d' % (bad, len(pages)))
sys.exit(1 if bad else 0)
