# BERSEY v2 "MONOLITH" — içerik partial sözleşmesi

Hedef: /Users/cagkanaki/bersey-website/v2/partials/NN-ad.html dosyaları. Her partial TAM bir <section> bloğudur; <html>/<head> YOK. Kaynak: kök TR sayfaları (/Users/cagkanaki/bersey-website/*.html). İÇERİK EKSİLTME YASAK — kaynaktaki her metin/veri (tablolar dahil satır satır), görsel yolu ve PDF linki partial'a taşınır. Yeni pazarlama metni uydurma; kaynak metni aynen veya çok hafif redaksiyonla kullan.

## Kurallar
- Görsel/PDF yolları: v2 bir alt klasör → `../assets/...` önekli.
- Sadece şu yapı blokları (CSS hazır, başka class üretme):
  - `<section id="ID" class="sec">` (varyant: `sec alt` koyu-panel zebra) → içinde `<div class="wrap">`
  - Bölüm başı: `<p class="eyb" data-rv>KICKER</p><h2 class="h2" data-rv>Başlık</h2><p class="lead" data-rv>giriş</p>`
  - Metin: `<p class="p" data-rv>`, liste `<ul class="list" data-rv><li>`
  - Izgara: `<div class="grid g2|g3|g4">` içinde `<article class="card" data-rv>` → kart içi `<h3 class="h3">`, `<p class="p">`, `<ul class="list">`, chip satırı `<div class="chips"><span class="chip">`
  - Görsel: `<figure class="ph r43|r169|r11" data-rv><img src="../assets/..." alt="..." loading="lazy" width="W" height="H"></figure>` (oran class'ı zorunlu — layout shift yasak; W/H bilinmiyorsa 1152x864)
  - Büyük tablo: `<div class="tblwrap" data-rv><table class="tbl"><thead>...<tbody>` (sticky thead CSS'te)
  - Akordeon: `<details class="acc" data-rv><summary>Başlık <em>N proje</em></summary>...</details>`
  - Buton/link: `<a class="btn" data-mag href="...">Metin</a>` (dış PDF: target="_blank")
  - Rakam sayacı: `<div class="stat" data-rv><b data-count="235">0</b><span>etiket</span></div>` (`<div class="stats">` içinde)
  - Yatay şerit öğesi (yalnız galeri partial'ı): `<figure class="hitem"><img ... loading="lazy" width="" height=""><figcaption>alt metni</figcaption></figure>`
- data-rv = scroll'da reveal; her anlamlı bloğa koy, karta tek tek.
- Dil: Türkçe. id'ler ascii-kebab.
- Doğrulama (zorunlu): partial'daki `<img|href` sayısı kaynaktaki ilgili bölümle eşleşmeli; tablo satır sayısı birebir; `="assets/` (öneksiz) 0 olmalı. Dönüş: 'OK <dosya> <bayt> <satır-sayısı>' + tek satır içerik özeti.
