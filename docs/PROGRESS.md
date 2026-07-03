# PROGRESS.md — Canlı İlerleme Takip Dosyası

> Bu dosya HER OTURUMDA güncellenir. AI ajanı yeni bir göreve başlamadan önce
> bu dosyayı okuyup "nerede kalındığını" buradan öğrenir. Görev bitince bu
> dosyaya yeni bir satır/güncelleme eklemeden oturum kapatılmaz.

## Genel Durum

- **Proje aşaması:** Temel altyapı kurulumu (Faz 0)
- **Son güncelleme:** 2026-07-03
- **Aktif faz:** Faz 0 — Temel Kurulum (bkz. ROADMAP.md)

## Tamamlanan Modüller

- [x] Monorepo iskeleti (`apps/web` — Next.js + TypeScript + Tailwind + Biome)
- [x] GitHub reposu (private) kuruldu, `main` branch'e push ediliyor
- [x] Supabase projesi oluşturuldu (`restoranim`, region: Central EU/Frankfurt)
- [x] Supabase client kurulumu (`@supabase/supabase-js`, `@supabase/ssr`) —
      `apps/web/src/lib/supabase/client.ts` ve `server.ts` hazır
- [x] `docs/DATABASE_SCHEMA.md` v1 tamamlandı — 20 tablo tasarlandı
- [x] İlk migration (`supabase/migrations/0001_init_schema.sql`) Supabase'de
      başarıyla çalıştırıldı — tüm tablolar + temel RLS politikaları canlıda

## Şu An Üzerinde Çalışılan

- Henüz başlanmadı — bir sonraki oturumun konusu aşağıda.

## Sıradaki Adım (Bir Sonraki Oturum Buradan Başlamalı)

1. **Auth (kimlik doğrulama) akışı kurulumu:**
   - Supabase Auth ile giriş ekranı (`apps/web/src/app/(tenant)/giris/`)
   - Giriş sonrası `users` tablosundan role okuyup doğru panele yönlendirme
2. **Subdomain middleware:**
   - `apps/web/middleware.ts` — `[subdomain].restoranim.com` isteğini
     yakalayıp `tenants` tablosundan `tenant_id` çözümleme
   - Local geliştirmede subdomain simülasyonu için `hosts` dosyası veya
     query param fallback stratejisi belirlenecek
3. Süper Admin'in ilk `tenant` kaydını (örn. test firması) elle SQL Editor
   üzerinden ekleyip uçtan uca test edilecek.

## Alınan Kritik Kararlar (Değiştirilmeden Önce Tartışılmalı)

- Tek veritabanı + `tenant_id` + Row Level Security modeli benimsendi.
- Web: Next.js + Vercel. Mobil: React Native + Expo. DB: Supabase.
- Aksiyon maddeleri OTOMATİK oluşmaz — bölge müdürü ODZ raporunda "Uygun
  Değil" işaretlenen maddeyi manuel olarak "Aksiyona Ekle" tikiyle işaretler.
- Personel kartındaki alanlar (SGK, sağlık raporu vb.) SABİT değil, Firma
  Admin tarafından dinamik olarak tanımlanır — aynı motor `metric_definitions`
  için de (ciro, tabak sayısı, hijyen skoru) kullanılıyor.
- RLS politikaları `current_tenant_id()` ve `is_super_admin()` SQL
  fonksiyonları üzerinden çalışıyor (JWT custom claim yerine `users`
  tablosuna `auth.uid()` ile join — MVP için daha basit, ileride
  performans gerekirse JWT claim'e geçilebilir).
- İnce taneli rol bazlı erişim (örn. bölge müdürü sadece kendine atanan
  restoranı görsün) henüz RLS'e yansıtılmadı — ilgili modül (Faz 2)
  geliştirilirken policy'ler detaylandırılacak.
- Finansal veri girişi iki modu destekleyecek: manuel + POS API
  (`metric_definitions.input_mode`).
- Google puanı entegrasyonu faz 2'de değerlendirilecek. Diğer platformlar
  (Yemeksepeti/Trendyol/Getir) için MVP'de manuel giriş.
- SMS bildirimi altyapısı hazır olacak ama varsayılan pasif.
- Dil: Sadece Türkçe (MVP kapsamında çoklu dil yok).
- Geliştirme aracı: Codex (OpenAI) — proje kökünde `AGENTS.md` kullanılıyor
  (Claude Code'daki `CLAUDE.md` karşılığı).
- Proje yerel yolu: `D:\restoranim` (OneDrive senkronize klasörlerinden
  kaçınıldı — yazma izni sorunlarına yol açıyordu).

## Bilinen Açık Sorular (Henüz Karar Verilmedi)

- Abonelik/fiyatlandırma modeli netleşmedi (şube başına mı, kademeli paket mi).
- E-posta sağlayıcısı netleşmedi (Resend vs alternatif).
- PDF şablon özelleştirme kapsamı detaylandırılmadı.
- RLS'in ince taneli (bölge müdürü → sadece atanan restoran) hali yazılmadı.

## Session Log

| Tarih | Yapılan | Not |
|---|---|---|
| 2026-07-02 | Proje kapsamı, roller, akışlar konuşuldu. ARCHITECTURE.md, ROADMAP.md, PROGRESS.md, DATABASE_SCHEMA.md (taslak) oluşturuldu. | İlk beyin fırtınası oturumu |
| 2026-07-03 | GitHub repo (private) kuruldu, Next.js iskeleti (`apps/web`) oluşturuldu, Supabase projesi kuruldu, Supabase client entegre edildi, `DATABASE_SCHEMA.md` v1 tamamlandı, `0001_init_schema.sql` yazıldı ve Supabase'de başarıyla çalıştırıldı (20 tablo + RLS). | Altyapı kurulum oturumu |
