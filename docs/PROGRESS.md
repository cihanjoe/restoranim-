# PROGRESS.md — Canlı İlerleme Takip Dosyası

> Bu dosya HER OTURUMDA güncellenir. AI ajanı yeni bir göreve başlamadan önce
> bu dosyayı okuyup "nerede kalındığını" buradan öğrenir. Görev bitince bu
> dosyaya yeni bir satır/güncelleme eklemeden oturum kapatılmaz.

## Genel Durum

- **Proje aşaması:** Temel altyapı kurulumu (Faz 0) — UI kaynağı netleşti,
  ilk gerçek arayüz kodlamasına geçiliyor.
- **Son güncelleme:** 2026-07-03
- **Aktif faz:** Faz 0 — Temel Kurulum (bkz. ROADMAP.md)

## Tamamlanan Modüller

- [x] Monorepo iskeleti (`apps/web` — Next.js + TypeScript)
- [x] GitHub reposu (private) kuruldu, `main` branch'e push ediliyor
- [x] Supabase projesi oluşturuldu (`restoranim`, region: Central EU/Frankfurt)
- [x] Supabase client kurulumu (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] `docs/DATABASE_SCHEMA.md` v1 tamamlandı — 20 tablo tasarlandı
- [x] İlk migration (`supabase/migrations/0001_init_schema.sql`) Supabase'de
      başarıyla çalıştırıldı — tüm tablolar + temel RLS politikaları canlıda
- [x] **UI/tasarım kararı değişti:** Tailwind+shadcn yerine **Bootstrap 5 +
      Hope UI** (github.com/iqonicdesignofficial/hope-ui-react-dashboard,
      MIT lisans) — birebir kullanılacak. `docs/DESIGN.md` bu karara göre
      yeniden yazıldı, `docs/ARCHITECTURE.md` güncellendi.
- [x] Hope UI React reposu `design-reference/hope-ui-react/` altına
      klonlandı (referans kaynak, `.gitignore`'da — GitHub'a gitmiyor)

## Şu An Üzerinde Çalışılan

- Henüz kod entegrasyonuna başlanmadı — sıradaki adım budur.

## Sıradaki Adım (Bir Sonraki Oturum Buradan Başlamalı)

1. **İlk entegrasyon görevi — Auth/Login sayfası:**
   - `design-reference/hope-ui-react/` içindeki Sign In sayfasını incele
   - Aynı görsel/bileşen yapısını `apps/web/src/app/(tenant)/giris/` altına
     Next.js App Router uyumlu şekilde taşı (React Router yerine Next.js
     routing, `'use client'` gerekiyorsa ekle)
   - Bootstrap 5 + Hope UI SCSS dosyalarını `apps/web` içine entegre et
     (bkz. docs/DESIGN.md → "Entegrasyon Yaklaşımı")
   - Supabase Auth ile gerçek giriş fonksiyonunu bağla (henüz sahte/mock
     login değil, gerçek `users` tablosu + Supabase Auth)
2. Giriş başarılı olunca `users.role` değerine göre doğru panele yönlendirme
   mantığı (henüz panel sayfaları yok, şimdilik basit bir "hoş geldin" sayfası
   yeterli — asıl panel içerikleri Faz 2'de gelecek)
3. Süper Admin'in ilk `tenant` kaydını SQL Editor üzerinden elle ekleyip
   uçtan uca login testi yapılacak

## Alınan Kritik Kararlar (Değiştirilmeden Önce Tartışılmalı)

- Tek veritabanı + `tenant_id` + Row Level Security modeli benimsendi.
- Web: Next.js + Vercel. Mobil: React Native + Expo. DB: Supabase.
- **UI: Bootstrap 5 + Hope UI (React versiyonu) — birebir kullanılacak,
  Tailwind/shadcn kararı iptal edildi.** Detay: docs/DESIGN.md
- Aksiyon maddeleri OTOMATİK oluşmaz — bölge müdürü manuel "Aksiyona Ekle"
  tikiyle işaretler.
- Personel kartındaki alanlar dinamik (Firma Admin tanımlar) — aynı motor
  `metric_definitions` için de (ciro, tabak sayısı, hijyen skoru) kullanılıyor.
- RLS politikaları `current_tenant_id()` ve `is_super_admin()` SQL
  fonksiyonları üzerinden çalışıyor (users tablosuna auth.uid() join).
- İnce taneli rol bazlı erişim (bölge müdürü → sadece atanan restoran)
  henüz RLS'e yansıtılmadı — Faz 2'de detaylandırılacak.
- Finansal veri girişi: manuel + POS API (`metric_definitions.input_mode`).
- Google puanı entegrasyonu faz 2'de değerlendirilecek. Diğer platformlar
  MVP'de manuel giriş.
- SMS bildirimi altyapısı hazır olacak ama varsayılan pasif.
- Dil: Sadece Türkçe.
- Geliştirme aracı: Codex (OpenAI) — proje kökünde `AGENTS.md` kullanılıyor.
- Proje yerel yolu: `D:\restoranim` (OneDrive'dan kaçınıldı).

## Bilinen Açık Sorular (Henüz Karar Verilmedi)

- Abonelik/fiyatlandırma modeli netleşmedi.
- E-posta sağlayıcısı netleşmedi (Resend vs alternatif).
- PDF şablon özelleştirme kapsamı detaylandırılmadı.
- RLS'in ince taneli hali yazılmadı.
- Hope UI menü stillerinden hangisi kullanılacak — "Simple" menü öneriliyor
  ama kesinleşmedi.
- Firma bazlı marka rengi özelleştirmesinin Hope UI'ın statik SCSS
  derlemesiyle nasıl dinamik hale getirileceği netleşmedi (Faz 2/3'te
  çözülecek).

## Session Log

| Tarih | Yapılan | Not |
|---|---|---|
| 2026-07-02 | Proje kapsamı, roller, akışlar konuşuldu. ARCHITECTURE.md, ROADMAP.md, PROGRESS.md, DATABASE_SCHEMA.md (taslak) oluşturuldu. | İlk beyin fırtınası oturumu |
| 2026-07-03 (sabah) | GitHub repo kuruldu, Next.js iskeleti oluşturuldu, Supabase projesi kuruldu, DATABASE_SCHEMA.md v1 tamamlandı, migration yazıldı ve çalıştırıldı. | Altyapı kurulum oturumu |
| 2026-07-03 (öğleden sonra) | UI kararı Tailwind/shadcn'den Bootstrap5/Hope UI'a değiştirildi (kullanıcının "birebir" template isteği üzerine). DESIGN.md ve ARCHITECTURE.md güncellendi. Hope UI React reposu referans olarak klonlandı. | Tasarım sistemi kararı oturumu |
