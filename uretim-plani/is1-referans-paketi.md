# İş 1 — Scroll Animasyonları Üretim Planı ve Referans Paketi

> Durum: Ali Bey'in onayı bekleniyor. Kredi harcanmadı, harcanmayacak — üretim ancak
> bu dosyadaki seçimler onaylandıktan sonra, yeni oturumda (Higgsfield MCP'li) yapılır.

## Değiştirilecek 3 animasyon

| # | Sayfa | Klasör | Mevcut durum | Kare |
|---|-------|--------|--------------|------|
| A | index + enerji-uretimi | `v2/frames/` | Gerçekte karşılığı olmayan spiral-körüklü silindir | 122 webp |
| B | yakma-sistemleri | `v2/frames-burner/` | Jenerik mavi "brülör" | 122 webp |
| C | proses-ekipmanlari | `v2/frames-vessel/` | Jenerik boru demetli kap (en makulü) | 122 webp |

Scroll kodu (`data-scrub`, canvas, faz yazıları) AYNEN kalıyor; yalnız kareler değişecek.
Faz yazıları (`FAZ 01 Brülör grubu ayrılır…`) yeni içeriğe göre güncellenecek.

## A — Giriş kazanı: ÜRÜN SEÇİMİ GEREKLİ (Ali Bey'e soru)

Hero metni "kızgın yağ kazanımız" diyor; şirketin amiral ürünü de kızgın yağ kazanı
(180 KYK referansı). Öneri: **katı yakıtlı kızgın yağ kazanı**.

Aday referanslar (Drive, zip'ten netleşecek):
- `13-Buyuk_KYK/` — Kronospan Ukrayna-01.JPG, IMG_20200727_131807.jpg (19MB, yüksek çözünürlük!)
- `12-Kombine_Kizgin_Yag/` — Kati Yakitli KYK.JPG
- `10-Kizgin Yag Kazanlari/` — 9MW_Dogal_Gaz_Kizgin_Yag.JPG, Indoor.jpg
- **Navisworks:** `Krasny_Yakor_BRV-8000.00-8-12-2022.nwd` — BRV-8000 komple kazan modeli
  (geometri birebir; Inventor/Navisworks ekran görüntüsü alınıp Higgsfield'e referans verilir)
- **Video:** `06-Videolar/Autodesk Inventor ...` kayıtları incelendi (kareler:
  `uretim-plani/inventor-kareler/`) — bunlar **membran duvar panel grubu** modelleri;
  komple kazan değil. Bileşen/detay referansı olarak kullanılır. Komple kazan geometrisi
  için esas kaynak Navisworks: `bersey-drive/Bersey Documents/09-Navisworks Dosyalar/`
  (yerelde çıkarıldı). Ekran görüntüsü için Navisworks Freedom (ücretsiz) kurulup
  BRV-8000 modelinden 2-3 açı alınmalı — üretim oturumunda birlikte yapılır.

## B — Yakma sistemi: ÜRÜN SEÇİMİ GEREKLİ (Ali Bey'e soru)

Seçenekler: ızgara sistemi (en zengin malzeme: `Izgara/` 8+ foto + `Izgara_Yanma.mp4`
gerçek yanma videosu) · toz yakma (`Toz Yakma/`) · yakıt besleme (`Yakıt Besleme/`).
Öneri: **ızgaralı yakma** — hem fotoğraf hem gerçek video referansı var.

## C — Proses ekipmanı

Öneri: **boru demetli eşanjör** (mevcut animasyonla aynı kavram, yani sayfa metni değişmez).
Referans: `08-Isi Esanjor/Esanjor_11.JPG` (2017, yüksek çözünürlük) + Esanjor_12/13/14.

## Prompt taslakları (onay sonrası Higgsfield'e girilecek)

Ortak stil: koyu endüstriyel stüdyo fonu (site zemini #04070B ile uyum), yumuşak tepe
aydınlatması, metalik yüzeylerde gerçekçi yansıma, kamera yatay orbit (~30° yay),
ürün sabit, 16:9, 5-6 sn. Kaynak görsel = seçilen gerçek fotoğraf (image-to-video).

- **A (kazan):** "Industrial solid-fuel thermal oil boiler, exact geometry of the reference
  photo, studio product visualization on dark background #04070B, soft top light,
  slow horizontal camera orbit, boiler perfectly static, photorealistic, no text, no people"
- **B (ızgara):** aynı kalıp + "reciprocating grate combustion system" (+ opsiyonel ikinci
  plan: `Izgara_Yanma.mp4`'ten alev dokusu referansı)
- **C (eşanjör):** aynı kalıp + "shell and tube heat exchanger, ASME flanged heads"

"Parçalarına ayrılma" (explode) efekti riskli — AI video explode'u fizik dışı üretebilir.
İki seçenek: (1) sadece orbit (güvenli, önerilen); (2) orbit + Kling'in start/end frame
özelliğiyle hafif kapak açılması. Ali Bey seçsin.

## Üretim süreci (onay sonrası, sırayla)

1. Kling (≈6 kredi) ile A üret → beğeni kontrolü → gerekirse Veo (≈40-70 kredi)
2. Onaylanan video → `ffmpeg -i video.mp4 -vf "fps=<122/süre>,scale=<mevcut boyut>" -q 80 frame_%03d.webp`
   (mevcut kare boyutları üretim günü `frames/frame_001.webp`'ten okunacak; A: ~1440px, B/C: ~1280px)
3. 122 kareye tamamla/kırp, aynı adlarla klasöre koy, faz yazılarını güncelle, yerelde test
4. B ve C için tekrarla. Tahmini toplam: **~20-60 kredi** (Kling yeterse), tavan ~200 (Veo'ya çıkılırsa)

## Ali Bey'den beklenenler

- [ ] "Bersey Resimler" + "Bersey Documents" zip'leri Desktop'a indirildi mi?
- [ ] A için ürün onayı (öneri: katı yakıtlı KYK, Krasny Yakor BRV-8000 geometrisi)
- [ ] B için ürün onayı (öneri: ızgaralı yakma)
- [ ] C onayı (öneri: eşanjör)
- [ ] Explode mu, sadece orbit mi?
