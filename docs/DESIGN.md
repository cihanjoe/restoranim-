# DESIGN.md — Tasarım Sistemi (Hope UI Bazlı)

> Bu proje görsel olarak **Hope UI** admin şablonunu birebir referans
> alır. Codex her yeni ekran/bileşen yazarken Hope UI'ın kendi
> bileşenlerini, renklerini, class isimlerini KULLANIR — kendi
> tasarım kararı almaz, icat etmez.

## Kaynak

- **Ana referans (React versiyonu — öncelikli kaynak):**
  https://github.com/iqonicdesignofficial/hope-ui-react-dashboard
- **HTML versiyonu (görsel/karşılaştırma referansı olarak):**
  https://github.com/iqonicdesignofficial/hope-ui-html-admin-dashboard
- **Lisans:** MIT — ticari kullanım serbest, atıf zorunluluğu yok
  (LICENSE dosyası korunmalı).
- **Canlı demo:** https://templates.iqonic.design/hope-ui/html/dist/

## Neden React versiyonu öncelikli

HTML versiyonu Handlebars (`.hbs`) şablonlarıyla üretiliyor — Next.js'e
taşınması için önce JSX'e çevrilmesi gerekir. React versiyonu ise zaten
React bileşenleri olarak yazılmış — Next.js'e uyarlaması çok daha az
işlem gerektirir (temel fark: React Router yerine Next.js'in kendi
routing sistemi kullanılacak, `<Link to="">` yerine `next/link`,
sayfa dosyaları `app/` router yapısına taşınacak).

## Entegrasyon Yaklaşımı

1. `hope-ui-react-dashboard` reposu `design-reference/hope-ui-react/`
   altına klonlanır (referans/kaynak olarak, gerçek proje koduna değil).
2. Kullanılacak bileşenler (`src/components/`) ve stiller (`src/assets/scss/`)
   `apps/web` içine taşınır/uyarlanır — genelde şu klasörlere:
   - SCSS dosyaları → `apps/web/src/styles/` (Hope UI'ın kendi klasör
     yapısı byiik ölçüde korunur: `bootstrap/`, `custom/`, `variables/` vb.)
   - Bileşenler → `apps/web/src/components/hope-ui/` (üzerine dokunmadan,
     "vendor" bileşen olarak kabul edilir)
3. Routing farkı: Hope UI React versiyonu `react-router-dom` kullanıyorsa,
   bu proje App Router (`app/` klasörü, dosya bazlı routing) kullandığı
   için sayfa bileşenleri Next.js sayfa yapısına uyarlanır — bu adım
   modül modül (Faz 2+ boyunca) yapılacak, hepsi bir kerede değil.
4. Bootstrap 5'in JS bileşenleri (modal, dropdown, tooltip vb.) Next.js'te
   `'use client'` bileşenler içinde çalıştırılmalı (server component
   içinde değil) — bu React versiyonunda zaten büyük ölçüde çözülmüş
   olacak çünkü orijinali de React.

## Renkler, Tipografi, Boşluklar

Bunlar **Hope UI'ın kendi SCSS değişken dosyasından** alınacak, burada
tahmini/uydurma değer YAZILMAZ:

- Kaynak dosya: `src/assets/scss/hope-ui-design-system/variables/` içindeki
  `_colors.scss` / `_variables.scss` (HTML reposunda) veya React reposundaki
  eşdeğeri.
- Codex bu dosyaları okuyup projeye taşırken, marka rengini (primary) firma
  bazlı özelleştirilebilir kılmak için **CSS custom property** olarak
  dışa açmalı (örn. `--bs-primary` gibi Bootstrap'ın kendi CSS
  değişken sistemi kullanılabilir, SCSS derleme zamanı sabiti yerine).
  Bu, "her firma kendi marka rengini seçebilsin" gereksinimimiz için
  önemli — Hope UI'ın statik SCSS derlemesini tenant bazlı dinamik hale
  getirmek gerekecek (Faz 2/3'te, firma ayarları ekranı yapılırken
  detaylandırılacak).

## Layout Kalıbı

Hope UI'ın kendi sidebar + topbar + content düzeni birebir korunur:
- Sol sabit menü (Hope UI'ın "Simple" veya "Icon" menü stillerinden biri
  seçilecek — proje için "Simple" menü stili öneriyoruz, restoran/bölge
  müdürü/personel gibi çok sayıda menü öğesi olacağından okunabilirlik
  önceliği var).
- Üst bar: Hope UI'ın kendi header bileşeni (bildirim ikonu, kullanıcı
  menüsü zaten hazır geliyor — bizim `notifications` tablomuzla
  bağlanacak).
- Hope UI'ın hazır **Dashboard**, **Tablo**, **Form**, **Kanban**,
  **Profil**, **Auth (login/register)** sayfaları doğrudan başlangıç
  noktası olarak kullanılır, içerik bizim verimize göre değiştirilir.

## Kullanılacak Hazır Hope UI Bileşenleri (proje ihtiyaçlarına eşleme)

| Hope UI bileşeni/sayfası | Bizim projede nerede kullanılacak |
|---|---|
| Auth — Sign In sayfası | Tüm rollerin giriş ekranı |
| Dashboard (kart + grafik düzeni) | Firma Admin / Bölge Müdürü ana panel |
| Data Table | Restoran listesi, personel listesi, aksiyon listesi |
| Form elemanları (input, select, file upload, date picker) | ODZ form builder, personel ekleme, restoran ekleme |
| Kanban | (opsiyonel, ileride) aksiyon takip panosu görünümü için değerlendirilebilir |
| Profil sayfası | Kullanıcı profili / şifre değiştirme |
| Badge/Alert bileşenleri | Uygun/Uygun Değil/Değ. Dışı durum etiketleri, bildirimler |
| Modal | Fotoğraf galerisi seçim penceresi (ODZ cevap düzenlemede) |
| Chart (ApexCharts — Hope UI'da dahili) | Hijyen skoru trendi, aksiyon kapanma oranı gibi grafikler |

## Yapılmaması Gerekenler

- Hope UI'ın class isimlerini/yapısını "daha iyi" diye değiştirmeye
  çalışmak — amaç birebir kalmak, iyileştirme değil.
- Tailwind utility class'larıyla karıştırmak (artık Tailwind projede yok,
  saf Bootstrap 5 + Hope UI SCSS kullanılacak).
- Yeni bir üçüncü taraf bileşen kütüphanesi eklemek (Hope UI zaten
  kapsamlı, gerek yoksa başka kütüphane eklenmez).

## Mobil Uygulama Notu

Hope UI web'e özel bir şablon (Bootstrap tabanlı, React Native'de
doğrudan çalışmaz). Mobil uygulamada aynı **renk paleti ve marka
hissini** yakalamaya çalışırız (aynı primary renk, aynı badge renkleri)
ama bileşenler React Native'in kendi UI kütüphanesiyle (veya
React Native Paper gibi bir seçenekle — bu Faz 6 öncesinde ayrıca
kararlaştırılacak) yeniden oluşturulur. "Birebir" hedefi öncelikle
**web paneline** yöneliktir.
