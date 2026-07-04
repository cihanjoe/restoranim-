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

## Hope UI — Tam Kapsam Kontrol Listesi

> Kullanıcının talebi: Hope UI'ın sunduğu HER özellik/sayfa/bileşen
> birebir kullanılacak, seçmeci davranılmayacak. Bu yüzden entegrasyon
> tek seferde değil, **önce bileşen kütüphanesi, sonra gerçek ekranlar**
> stratejisiyle yapılır (bkz. "Entegrasyon Stratejisi" altında).

Hope UI'ın canlı demosundaki (templates.iqonic.design/hope-ui/html/dist/)
menüye göre tam envanter:

**Dashboard Varyantları**
- [ ] Default Dashboard
- [ ] Admin Dashboard
- [ ] App Dashboard

**Menü Stilleri**
- [ ] Horizontal
- [ ] Dual Horizontal
- [ ] Dual Compact
- [ ] Boxed Horizontal
- [ ] Boxed Fancy
- [ ] (Proje için hangisi kullanılacak: Faz 2'de tek bir stil seçilip
  sabitlenecek — hepsini aynı anda sunmuyoruz, kullanıcı deneyimi için
  tek tutarlı stil gerekir)

**Özel Sayfalar (Special Pages)**
- [ ] Billing (Faturalama — Süper Admin abonelik ekranında kullanılabilir)
- [ ] Calendar (ODZ ziyaret takvimi için uyarlanabilir)
- [ ] Kanban (Aksiyon takip panosu görünümü için — ROADMAP'te not edilmişti)
- [ ] Pricing (Süper Admin'in paket/plan tanıtım sayfası için)
- [ ] Timeline (Restoran ziyaret geçmişi/aksiyon geçmişi için ideal)
- [ ] RTL Support (bu proje için gerekmez, Türkçe soldan sağa)

**Authentication**
- [ ] Login / Sign In (✅ tamamlandı)
- [ ] Register / Sign Up (firma admin'in yeni bölge müdürü daveti için
  benzer form kullanılabilir)
- [ ] Confirm Mail
- [ ] Lock Screen
- [ ] Recover Password (şifremi unuttum akışı için gerekli)

**Users**
- [ ] User Profile (tüm roller için profil sayfası)
- [ ] Add User (personel/bölge müdürü ekleme formlarına temel oluşturur)
- [ ] User List (restoran/personel/bölge müdürü listeleri için)

**Utilities**
- [ ] Error 404
- [ ] Error 500
- [ ] Maintenance (bakım modu sayfası — ileride faydalı olabilir)

**Elements / Components**
- [ ] Genel component kütüphanesi (accordion, modal, tab, tooltip vb.)
- [x] Widget — Basic (istatistik kartları, mini progress göstergeleri)
- [ ] Widget — Chart (ApexCharts kart varyasyonları)
- [ ] Widget — Card (çeşitli kart düzenleri)
- [ ] Maps — Google
- [ ] Maps — Vector
- [ ] Form — Elements (tüm input tipleri)
- [ ] Form — Wizard (çok adımlı form — ODZ ziyaret formu için ideal!)
- [ ] Form — Validation
- [ ] Table — Bootstrap Table
- [ ] Table — Datatable (arama/sıralama/sayfalama özellikli — restoran/
  personel listeleri için)
- [ ] Icons — Solid / Outlined / Dual Tone

**Tema Özelleştirici (Theme Customizer)**
- [ ] Scheme (Auto/Dark/Light) — ileride "dark mode" isteği gelirse hazır
- [ ] Sidebar Color/Type (Default/Dark/Color/Transparent, Mini/Hover/Boxed)
- [ ] Sidebar Active Style
- [ ] Navbar Style (Glass/Sticky/Transparent/Default)
- [ ] Bu özelleştirici, gelecekte "her firma kendi temasını seçsin"
  isteğiyle birebir örtüşüyor — tenant ayarları ekranı için doğrudan
  ilham/temel olarak kullanılabilir

## Entegrasyon Stratejisi (Tek Seferde Değil, Katmanlı)

1. **Katman 1 — Bileşen Kütüphanesi (öncelik):** Yukarıdaki Elements/
   Components/Widget/Form/Table/Icons bölümleri, apps/web içinde
   `src/components/hope-ui/` altında YENİDEN KULLANILABİLİR bileşenler
   olarak bir kere inşa edilir. Bu bir "iç Storybook" gibi düşünülmeli —
   her sayfa ihtiyaç duydukça buradan bileşen çeker, sıfırdan yazmaz.
2. **Katman 2 — Gerçek Uygulama Ekranları:** ROADMAP.md'deki fazlara göre
   (Süper Admin dashboard, Firma Admin, ODZ form builder vb.) bu
   bileşenler kullanılarak gerçek ekranlar inşa edilir.
3. **Katman 3 — Özel Sayfalar (ihtiyaç oldukça):** Kanban (aksiyon
   panosu), Timeline (ziyaret geçmişi), Form Wizard (ODZ ziyaret akışı)
   gibi özel sayfalar ilgili modül geliştirilirken (Faz 5+) devreye girer.
4. Bu liste `docs/PROGRESS.md`'de checkbox olarak takip edilir, her
   oturumda hangi bölümün tamamlandığı işaretlenir.

## Mobil Uygulama Notu

Hope UI web'e özel bir şablon (Bootstrap tabanlı, React Native'de
doğrudan çalışmaz). Mobil uygulamada aynı **renk paleti ve marka
hissini** yakalamaya çalışırız (aynı primary renk, aynı badge renkleri)
ama bileşenler React Native'in kendi UI kütüphanesiyle (veya
React Native Paper gibi bir seçenekle — bu Faz 6 öncesinde ayrıca
kararlaştırılacak) yeniden oluşturulur. "Birebir" hedefi öncelikle
**web paneline** yöneliktir.
