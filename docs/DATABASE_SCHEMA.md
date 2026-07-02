# DATABASE_SCHEMA.md — Veritabanı Şeması

> DURUM: TASLAK — Henüz tamamlanmadı. Bir sonraki oturumda birlikte
> dolduracağız (bkz. PROGRESS.md → "Sıradaki Adım").
> Bu dosya tamamlanınca Supabase migration dosyaları buradan üretilecek.

## Planlanan Ana Entity'ler (ön liste — detaylandırılacak)

- `tenants` (firmalar)
- `users` (tüm roller tek tabloda, `role` kolonu ile ayrım + Supabase Auth ile ilişkili)
- `regional_managers` (bölge müdürü ek bilgileri)
- `restaurants`
- `restaurant_regional_managers` (çoklu atama için ara tablo — bir restorana
  birden fazla bölge müdürü atanabilir)
- `staff_field_definitions` (firma bazlı, dinamik personel alan tanımları)
- `staff_members`
- `staff_documents` (SGK, sağlık raporu, hijyen belgesi vb. dosyalar)
- `odz_form_sections` (bölümler: Şube Genel Kontrolü, ESE, ÖSS vb.)
- `odz_form_questions` (soru tipi, zorunlu mu, fotoğraf zorunlu mu)
- `odz_form_question_options` (şıklar)
- `odz_visits` (ziyaret kaydı — restoran, bölge müdürü, tarih, durum)
- `odz_visit_answers` (her soruya verilen cevap)
- `odz_visit_photos` (fotoğraf havuzu — soruya bağlı olabilir veya bağlanmamış olabilir)
- `actions` (aksiyon maddeleri — kaynak: bir visit_answer, durum, termin, onay)
- `action_updates` (restoran müdürünün aksiyon üzerine attığı fotoğraf/açıklama geçmişi)
- `manual_daily_metrics` (ciro, tabak sayısı gibi firma tanımlı günlük veriler)
- `hygiene_scores` (aylık hijyen skoru girişleri)
- `notifications`
- `subscriptions` / `billing_records` (süper admin tarafı)

## Sonraki Adımda Netleştirilecekler

- Her tablonun kolonları, tipleri, foreign key ilişkileri
- RLS politikalarının tablo bazlı tanımı
- Index stratejisi (özellikle `tenant_id` + sık sorgulanan alanlar için)
