# -*- coding: utf-8 -*-
"""v3 sayfalarındaki tüm varlık ve sayfa yollarının diskte var olduğunu doğrular."""
import re, pathlib

V3 = pathlib.Path(__file__).resolve().parent
bad = 0
pages = list(V3.glob('*.html')) + list(V3.glob('en/*.html')) + list(V3.glob('ru/*.html'))
for f in pages:
    html = f.read_text(encoding='utf-8')
    refs = set(re.findall(r'(?:src|href)="([^"]+)"', html))
    refs |= set(re.findall(r'background-image:url\(([^)]+)\)', html))
    for r in refs:
        if r.startswith(('http', 'mailto:', 'tel:', '#')):
            continue
        p = (f.parent / r.split('?')[0].split('#')[0]).resolve()
        if not p.exists():
            print('KIRIK:', f.relative_to(V3), '->', r)
            bad += 1
print('taranan sayfa:', len(pages), '· kırık yol:', bad)
