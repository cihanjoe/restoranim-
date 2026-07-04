# PROGRESS.md — Canlı İlerleme Takip Dosyası

> Bu dosya HER OTURUMDA güncellenir. AI ajanı yeni bir göreve başlamadan önce
> bu dosyayı okuyup "nerede kalındığını" buradan öğrenir. Görev bitince bu
> dosyaya yeni bir satır/güncelleme eklemeden oturum kapatılmaz.

## Genel Durum

- **Proje aşaması:** Faz 0 tamamlanmak üzere — auth akışı uçtan uca çalışıyor,
  sırada Süper Admin dashboard iskeleti var (Faz 1'e geçiş).
- **Son güncelleme:** 2026-07-04
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
- [x] Giriş ekranına Hope UI'ın gerçek SCSS renk paleti uygulandı
      (`hope-ui-theme.scss`, `_variable.scss` referans alınarak)
- [x] İlk test kullanıcısı oluşturuldu (Supabase Auth + `users` tablosu,
      rol: `super_admin`)
- [x] Hope UI Widget Basic entegrasyonu: Super Admin dashboard için
      yeniden kullanılabilir `StatCard`, `CircularProgressCard`,
      `ChartWidgetCard` bileşenleri eklendi.

## Şu An Üzerinde Çalışılan

- Süper Admin dashboard Hope UI Widget Basic bileşenleriyle güncellendi;
  sonraki adım: widget içeriklerini gerçek Supabase verilerine bağlamak ve
  diğer roller için aynı layout iskeletini çoğaltmak.

## Sıradaki Adım (Bir Sonraki Oturum Buradan Başlamalı)

1. Firma Admin, Bölge Müdürü ve Restoran Müdürü için benzer Hope UI
   layout iskeletleri oluşturulacak (farklı sidebar menüleriyle), böylece
   her rolün girişten sonra doğru panele yönlendiği uçtan uca test edilebilir
2. Süper Admin panelinden ilk gerçek `tenant` (firma) kaydını **arayüzden**
   oluşturma formu (Faz 1, ROADMAP.md) — şu ana kadar tenant kaydı hiç
   oluşturulmadı, sadece `users` tablosuna `tenant_id = null` ile
   süper admin eklendi
3. Dashboard içeriklerini gerçek Supabase verilerine bağlamak (firmalar,
   abonelikler, destek talepleri) — şu an çoğunlukla statik/mock veri ile
   çalışan bir arayüz görünümündedir

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
