# PROGRESS.md — Canlı İlerleme Takip Dosyası

> Bu dosya HER OTURUMDA güncellenir. AI ajanı yeni bir göreve başlamadan önce
> bu dosyayı okuyup "nerede kalındığını" buradan öğrenir. Görev bitince bu
> dosyaya yeni bir satır/güncelleme eklemeden oturum kapatılmaz.

## Genel Durum

- **Proje aşaması:** Faz 0 tamamlanmak üzere — auth akışı uçtan uca çalışıyor,
  sidebar'daki tüm placeholder sayfalar oluşturuldu, sırada ilk tenant oluşturma.
- **Son güncelleme:** 2026-07-08
- **Aktif faz:** Faz 0 bitiyor → Faz 1 başlıyor (bkz. ROADMAP.md)

## Tamamlanan Modüller

- [x] Monorepo iskeleti (`apps/web` — Next.js + TypeScript)
- [x] GitHub reposu (private), Supabase projesi (Frankfurt) kuruldu
- [x] Supabase client kurulumu (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] `docs/DATABASE_SCHEMA.md` v1 — 20 tablo
- [x] Migration 0001 — tüm tablolar + RLS politikaları
- [x] Migration 0002 — RLS yardımcı fonksiyonları (`current_tenant_id()`,
      `is_super_admin()`) SECURITY DEFINER yapıldı (sonsuz döngü hatasını
      düzeltti)
- [x] Migration 0003 — `authenticated` rolüne temel GRANT (SELECT/INSERT/
      UPDATE/DELETE) verildi — **önemli ders:** RLS politikaları yeterli
      değil, temel GRANT de şart, yoksa "permission denied" hatası alınıyor
- [x] UI kararı: Tailwind+shadcn yerine **Bootstrap 5 + Hope UI**
      (design-reference/hope-ui-react — MIT lisans)
- [x] Tailwind tamamen projeden temizlendi (package.json, postcss config,
      globals.css) — artık sadece Bootstrap + Sass kullanılıyor
- [x] **Giriş (Auth) akışı uçtan uca çalışıyor:**
      `/giris` sayfası → Supabase Auth (`signInWithPassword`) → `users`
      tablosundan role okunuyor → role'e göre yönlendirme (şu an sadece
      `super_admin` için basit bir placeholder karşılama sayfası var)
- [x] **Görev 9 — Hesabım Sayfası:** `/hesabim` — 3 sekmeli profil (Profil/Aktivite/Güvenlik), Supabase users UPDATE (isim/telefon) + auth.updateUser (şifre değiştirme), Hope UI stili. Build başarılı (17 route).
- [x] Giriş ekranına Hope UI'ın gerçek SCSS renk paleti uygulandı
      (`hope-ui-theme.scss`, `_variable.scss` referans alınarak)
- [x] İlk test kullanıcısı oluşturuldu (Supabase Auth + `users` tablosu,
      rol: `super_admin`)
- [x] Hope UI Widget Basic entegrasyonu: Super Admin dashboard için
      yeniden kullanılabilir `StatCard`, `CircularProgressCard`,
      `ChartWidgetCard` bileşenleri eklendi.
- [x] **ODZ Form Builder:** `/firma-admin/form-builder` — bölüm ve soru CRUD,
      Supabase `odz_form_sections` + `odz_form_questions` canlı bağlantısı.
- [x] **Restoran Müdürü Aksiyonlarım:** `/restoran-muduru/aksiyonlarim` —
      kendi restoran aksiyonlarını görüntüleme ve onaya gönderme akışı.

## Şu An Üzerinde Çalışılan

- ODZ Form Builder (`/firma-admin/form-builder`) ROADMAP Faz 3 gereksinimlerine sadık olduğu doğrulandı: bölüm/soru CRUD, sıralama, pasif/aktif, zorunlu + fotoğraf zorunlu ayarları mevcut. Ek değişiklik gerekmedi.

## Sıradaki Adım (Bir Sonraki Oturum Buradan Başlamalı)

1. `/firma-admin/personel-alanlari` placeholder sayfasını gerçek `staff_field_definitions` CRUD ekranına dönüştürme.
2. Faz 3'ün son maddesi: Restoran bazlı özel veri alanları (ciro, tabak sayısı vb. — `metric_definitions` tablosu) için metrik tanım sayfası oluşturma.

## Alınan Kritik Kararlar (Değiştirilmeden Önce Tartışılmalı)

- Tek veritabanı + `tenant_id` + Row Level Security modeli.
- Web: Next.js + Vercel. Mobil: React Native + Expo. DB: Supabase.
- **UI: Bootstrap 5 + Hope UI (React versiyonu) — birebir kullanılacak.**
  Detay: docs/DESIGN.md
- **RLS kurulum kuralı (yeni tablo eklerken unutulmamalı):** Her yeni
  tabloda hem RLS POLICY hem `GRANT ... TO authenticated` gerekli. Migration
  0003 tüm mevcut + gelecekteki tablolar için `ALTER DEFAULT PRIVILEGES`
  ile bunu otomatikleştirdi, ama yeni bir rol/şema eklenirse tekrar
  gözden geçirilmeli.
- Aksiyon maddeleri OTOMATİK oluşmaz — bölge müdürü manuel "Aksiyona Ekle"
  tikiyle işaretler.
- Personel/metrik alanları dinamik (Firma Admin tanımlar).
- Finansal veri girişi: manuel + POS API.
- Google puanı entegrasyonu faz 2'de değerlendirilecek.
- SMS altyapısı hazır olacak, varsayılan pasif.
- Dil: Sadece Türkçe.
- Geliştirme aracı: Codex (OpenAI), `AGENTS.md` kök dizinde.
- Proje yerel yolu: `D:\restoranim`.

## Bilinen Açık Sorular (Henüz Karar Verilmedi)

- Abonelik/fiyatlandırma modeli netleşmedi.
- E-posta sağlayıcısı netleşmedi.
- PDF şablon özelleştirme kapsamı detaylandırılmadı.
- RLS'in ince taneli hali (bölge müdürü → sadece atanan restoran) yazılmadı.
- Hope UI menü stillerinden hangisi kullanılacak ("Simple" öneriliyor).
- Firma bazlı marka rengi özelleştirmesinin Hope UI'ın statik SCSS
  derlemesiyle nasıl dinamikleştirileceği netleşmedi.

## Session Log

| Tarih | Yapılan | Not |
|---|---|---|
| 2026-07-02 | Kapsam/roller/akışlar konuşuldu, ilk 4 docs dosyası oluşturuldu. | Beyin fırtınası |
| 2026-07-03 (sabah) | GitHub repo, Next.js iskeleti, Supabase projesi, DATABASE_SCHEMA v1, migration 0001. | Altyapı kurulumu |
| 2026-07-03 (öğleden sonra) | UI kararı Bootstrap5/Hope UI'a değişti, DESIGN.md yeniden yazıldı. | Tasarım kararı |
| 2026-07-03 (akşam) | Codex ile giriş sayfası entegre edildi (Hope UI + Bootstrap). RLS sonsuz döngü (migration 0002) ve eksik GRANT (migration 0003) hataları bulunup düzeltildi. Tailwind kalıntıları temizlendi. Giriş akışı uçtan uca test edildi ve çalışıyor (Süper Admin placeholder sayfasına yönlendirme başarılı). | İlk çalışan özellik — auth akışı |
| 2026-07-03 | Süper Admin dashboard iskeleti eklendi: sidebar + topbar + kart düzeni + chart widget + hızlı erişim blokları içeren Hope UI benzeri layout `/super-admin/hos-geldin` sayfasına bağlandı. `react-icons`, `apexcharts`, `react-apexcharts` paketleri eklendi. | İlk dashboard iskeleti |
| 2026-07-03 | Dashboard bileşeni `apps/web/src/components/dashboard/super-admin-dashboard.tsx` dosyasına taşındı; statik/placeholder metrikler ve işlem listesi ile zenginleştirildi. Supabase verisi henüz bağlanmadı, tüm içerik hâlâ sahte/mock verilerden oluşuyor. | Dashboard görsel entegrasyonu |
| 2026-07-04 | Hope UI `widgetbasic.js` ve `widgetchart.js` referansları incelendi. `apps/web/src/components/hope-ui/widgets/` altına `StatCard`, `CircularProgressCard`, `ChartWidgetCard` eklendi; Super Admin dashboard kartları bu widget'larla oluşturuldu. `npm run build` başarılı. | Widget Basic entegrasyonu |
| 2026-07-08 | Görev 0 tamamlandı: Ortak layout (AppSidebar + AppHeader + DashboardLayout) role göre dinamik menü ve Supabase Auth'tan kullanıcı verisi çeken yapı ile hazır. Her role ayrı layout (super-admin, firma-admin, bolge-muduru, restoran-muduru) eklendi. Super Admin dashboard sayfasından eski sidebar/header kaldırıldı. Tüm placeholder sayfalar oluşturuldu. `npm run build` başarılı. | Ortak Layout |
| 2026-07-08 (2) | Görev 1 tamamlandı: `/bolge-muduru/genel-bakis` sayfası oluşturuldu. Canlı Supabase sorguları (restaurant_regional_managers → restaurants → odz_visits, actions) ile özet kartlar (Atanan Restoran, Bu Ay Ziyaret, Açık Aksiyon) ve restoran listesi tablosu. Sidebar href güncellendi, eski sayfadan redirect eklendi. `npm run build` başarılı. | Bölge Müdürü Genel Bakış |
| 2026-07-08 (3) | Görev 2 tamamlandı: `/restoran-muduru/genel-bakis` sayfası oluşturuldu. Restoran bilgisi (restaurants), personel sayısı, açık aksiyon listesi (actions) ve son ODZ ziyareti (odz_visits) canlı Supabase sorguları ile. Sidebar güncellendi, eski sayfadan redirect eklendi. `npm run build` başarılı. | Restoran Müdürü Genel Bakış |
| 2026-07-08 (4) | Görev 3 tamamlandı: `/super-admin/firmalar` sayfası Hope UI bootstrap-table.js stiliyle yeniden yazıldı. Supabase canlı veri (tenants), Ekle/Düzenle/Sil CRUD, modal form, avatar badge'ler. `npm run build` başarılı. | Firmalar Sayfası |
| 2026-07-08 (5) | Görev 4 tamamlandı: `/restoran-muduru/personel` sayfası oluşturuldu. Supabase canlı sorgular (restaurants → staff_members) ile CRUD; Hope UI user-list.js tablo stili + user-add.js modal form. `npm run build` başarılı. | Personel Yönetimi |
| 2026-07-08 (6) | Görev 5 tamamlandı: `/sifremi-unuttum` ve `/davet-kabul` auth sayfaları oluşturuldu. Her ikisi de Hope UI split layout stilinde; Supabase Auth entegrasyonu (resetPasswordForEmail, updateUser). `/davet-kabul` hem şifre sıfırlama hem de davet akışını destekliyor (loading/error/success state'leriyle). `npm run build` başarılı. | Eksik Auth Sayfaları |
| 2026-07-08 (7) | Görev 6 tamamlandı: ODZ Ziyaret Form Wizard. `/bolge-muduru/ziyaretlerim` (ziyaret listesi + modal ile yeni ziyaret başlatma) ve `/bolge-muduru/ziyaret/[id]` (form wizard) sayfaları oluşturuldu. Dinamik soru yapısı (`odz_form_sections`/`odz_form_questions`), 3 soru tipi (choice_3, text, number), taslak kaydetme, zorunlu soru validasyonu, step indicator. `npm run build` ile 15 route derlendi. | ODZ Ziyaret Formu |
| 2026-07-08 (8) | Görev 7 tamamlandı: Aksiyon Takip Panosu (Kanban). `/bolge-muduru/aksiyonlar` sayfası oluşturuldu — 4 sütunlu Kanban (Açık/Onay Bekleyen/Onaylanan/Reddedilen), aksiyon kartları (başlık, restoran, termin, tekrar sayısı), detay modal ile durum güncelleme ve silme. `restaurant_regional_managers` → `actions` Supabase sorgusu. `npm run build` ile 16 route derlendi. | Aksiyon Takip Panosu |
| 2026-07-08 (9) | Görev 8 tamamlandı: Ziyaret Geçmişi (Timeline). `/restoran-muduru/ziyaret-gecmisi` sayfası oluşturuldu — Hope UI timeline stili (aylık gruplama, pill ay başlıkları, dikey çizgi + nokta işaretçileri), ziyaret kartları (ziyaretçi adı, tarih/saat, durum badge'i, tamamlanma bilgisi), özet kartı (Toplam/Tamamlanan/Taslak/Bildirilen). Supabase: `restaurants.manager_user_id` → `odz_visits` JOIN `users`. Sidebar restoran_muduru menüsüne "Ziyaret Geçmişi" eklendi. `npm run build` ile 17 route derlendi. | Ziyaret Geçmişi Timeline |
| 2026-07-08 (10) | Görev 9 tamamlandı: `/hesabim` sayfası — 3 sekmeli profil (Profil/Aktivite/Güvenlik), Supabase users UPDATE (isim/telefon) + auth.updateUser (şifre değiştirme), Hope UI stili. `react-bootstrap` eklendi, TS hataları düzeltildi. `npm run build` başarılı (17 route). | Hesabım Sayfası |
| 2026-07-08 (11) | Görev 10 tamamlandı: Firma Admin Restoran Yönetimi. `/firma-admin/restoranlar` (liste + ekleme modalı), `/[id]` (detay sayfası + Düzenle butonu), `/[id]/duzenle` (düzenleme formu) sayfaları oluşturuldu. Form alanları: restoran adı, il/ilçe (81 il select), açılış tarihi, tür (merkez/franchise), adres, iletişim (telefon/eposta/fatura adresi), bölge müdürü atama (checkbox list), restoran müdürü, 4 platform puanı (Google/YS/Getir/Trendyol), franchise bilgileri (sahip adı/telefon/eposta). Migration 0004 (restoran ek kolonlar) hazırlandı. `npm run build` başarılı (19 route). | Restoran Yönetimi |
| 2026-07-08 (12) | Görev 11 tamamlandı: Firma Admin Bölge Müdürleri sayfası. `/firma-admin/bolge-mudurleri` — liste (Supabase users + tenant_id filtresi), ekleme (Auth signUp + users insert), düzenleme (users update + auth admin.updateUserById şifre değiştirme), pasife alma. Sidebar link çalışıyor. `npm run build` başarılı (20 route). | Bölge Müdürleri Yönetimi |
| 2026-07-08 (13) | Super Admin Dashboard canlı Supabase verilerine bağlandı. Artık tüm kartlar, grafikler, son işlemler ve yönetim özeti gerçek veritabanı sorgularından geliyor (tenants, restaurants, support_tickets, billing_records). Statik/mock veri tamamen temizlendi. `npm run build` başarılı (20 route). | Dashboard Canlı Veri |
| 2026-07-08 (14) | **Firma Ekleme + Admin Kullanıcı:** `/super-admin/firmalar` güncellendi — firma eklerken yetkili adı/telefon/e-posta (contact) ve admin kullanıcı (ad/e-posta/şifre) alanları eklendi. Admin kullanıcı Supabase Auth'ta otomatik oluşturulup `firma_admin` rolüyle kaydediliyor. `/giris` sayfası oluşturuldu (role göre yönlendirme). Ana sayfa `/` → `/giris` redirect. Migration 0005 (tenants contact kolonları). Build başarılı (21 route). | Firma + Admin Kullanıcı |
| 2026-07-08 (15) | **Eksik placeholder sayfalar oluşturuldu:** Sidebar'daki boş linkler için 7 yeni sayfa eklendi: `/super-admin/abonelikler`, `/super-admin/destek-talepleri`, `/super-admin/ayarlar`, `/firma-admin/form-builder`, `/firma-admin/personel-alanlari`, `/firma-admin/ayarlar`, `/bolge-muduru/restoranlarim`. Build başarılı (28 route). | Placeholder Sayfalar |
| 2026-07-08 (16) | **Restoran ekleme "Tenant bilgisi bulunamadı" hatası düzeltildi:** Client-side'daki gereksiz `user?.tenant_id` kontrolü kaldırıldı — server action (`createRestoran`) kendi içinde `getTenantIdFromSession` ile tenant_id'yi doğru şekilde alıyor. Build başarılı (28 route). | Hata Düzeltme |
| 2026-07-08 (17) | **ODZ Form Builder + Aksiyonlarım:** `/firma-admin/form-builder` placeholder'ı Supabase canlı bölüm/soru CRUD ekranına çevrildi (`odz_form_sections`, `odz_form_questions`). Eksik `/restoran-muduru/aksiyonlarim` route'u eklendi; restoran müdürü kendi restoran aksiyonlarını görüp açıklama ile onaya gönderebiliyor (`actions`, `action_updates`). Değişen iki dosyada Biome check başarılı, `npm run build` başarılı (29 route). | Form Builder + Route Fix |
| 2026-07-10 | **ODZ Form Builder 'Tenant bilgisi bulunamadı' hatası düzeltildi:** client-side `user?.tenant_id` kontrolü kaldırıldı, server actions (`createSection`, `updateSection`, `createQuestion`, `updateQuestion`, `deleteSection`, `deleteQuestion`) kullanıldı. | Form Builder Bug Fix |
