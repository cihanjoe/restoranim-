# PROGRESS.md — Canlı İlerleme Takip Dosyası

> Bu dosya HER OTURUMDA güncellenir. AI ajanı yeni bir göreve başlamadan önce
> bu dosyayı okuyup "nerede kalındığını" buradan öğrenir. Görev bitince bu
> dosyaya yeni bir satır/güncelleme eklemeden oturum kapatılmaz.

## Genel Durum

- **Proje aşaması:** Planlama / Mimari Tasarım
- **Son güncelleme:** 2026-07-02
- **Aktif faz:** Faz 0 — Dokümantasyon ve mimari kurulum (bkz. ROADMAP.md)

## Tamamlanan Modüller

_(Henüz kod yazımına başlanmadı — bu bölüm ilk modül tamamlandığında
doldurulmaya başlanacak.)_

- [ ] —

## Şu An Üzerinde Çalışılan

- Veritabanı entity/tablo listesinin çıkarılması (`docs/DATABASE_SCHEMA.md`)
  henüz tamamlanmadı — bir sonraki oturumun konusu.

## Sıradaki Adım (Bir Sonraki Oturum Buradan Başlamalı)

1. `docs/DATABASE_SCHEMA.md` dosyasını birlikte doldur: Firma, Bölge Müdürü,
   Restoran, Personel, ODZ Form Şablonu, Soru, Ziyaret, Aksiyon, Fotoğraf,
   Bildirim, Abonelik/Fatura entity'leri ve aralarındaki ilişkiler.
2. Ardından Supabase projesi kurulup ilk migration dosyaları yazılacak.
3. Ardından Next.js proje iskeleti (`apps/web`) oluşturulacak, auth +
   subdomain middleware kurulacak.

## Alınan Kritik Kararlar (Değiştirilmeden Önce Tartışılmalı)

- Tek veritabanı + `tenant_id` + Row Level Security modeli benimsendi
  (ayrı şema/DB per firma yaklaşımı reddedildi).
- Web: Next.js + Vercel. Mobil: React Native + Expo. DB: Supabase.
- Aksiyon maddeleri OTOMATİK oluşmaz — bölge müdürü ODZ raporunda "Uygun
  Değil" işaretlenen maddeyi manuel olarak "Aksiyona Ekle" tikiyle işaretler.
- Personel kartındaki alanlar (SGK, sağlık raporu vb.) SABİT değil, Firma
  Admin tarafından dinamik olarak tanımlanır (ODZ form builder ile aynı
  motor kullanılabilir).
- Finansal veri girişi (ciro, tabak sayısı vb.) iki modu da destekleyecek:
  (a) manuel günlük giriş — Firma Admin hangi alanların isteneceğini tanımlar,
  (b) POS entegrasyonu (API/SQL) — faz 2.
- Google puanı entegrasyonu faz 2'de değerlendirilecek (OAuth gerektirir).
  Yemeksepeti/Trendyol/Getir için resmi API garantisi yok — MVP'de manuel giriş.
- SMS bildirimi altyapısı hazır olacak ama varsayılan pasif; firma kendi SMS
  sağlayıcı bilgisini tanımlayınca aktif olur.
- Dil: Sadece Türkçe (MVP kapsamında çoklu dil yok).

## Bilinen Açık Sorular (Henüz Karar Verilmedi)

- Abonelik/fiyatlandırma modeli netleşmedi (şube başına mı, kademeli paket mi).
- E-posta sağlayıcısı netleşmedi (Resend vs alternatif).
- PDF şablon özelleştirme kapsamı (hangi alanlar özelleştirilebilir — renk,
  logo konumu, başlık sırası) detaylandırılmadı.

## Session Log

| Tarih | Yapılan | Kim/Not |
|---|---|---|
| 2026-07-02 | Proje kapsamı, roller, akışlar konuşuldu. ARCHITECTURE.md, ROADMAP.md, PROGRESS.md oluşturuldu. | İlk beyin fırtınası oturumu |
