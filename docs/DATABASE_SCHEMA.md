# DATABASE_SCHEMA.md — Veritabanı Şeması

> DURUM: v1 — İlk tam taslak tamamlandı. Kod yazımına başlamadan önce
> gözden geçirilip onaylanacak, sonra buradan Supabase migration
> dosyaları üretilecek.
> Konvansiyon: tüm ID'ler `uuid`, tüm tablolarda `created_at`/`updated_at`
> (timestamptz) standart olarak bulunur (aşağıda tekrar yazılmadı).
> `tenant_id` olan her tabloda RLS zorunludur.

---

## 1. Çekirdek: Firma / Kullanıcı / Rol

### `tenants` (Firmalar)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| name | text | Firma adı (örn. "X Pide Zincirleri") |
| subdomain | text UNIQUE | örn. `xpide` → xpide.restoranim.com |
| logo_url | text | Supabase Storage path |
| pdf_theme | jsonb | Renk/başlık sırası gibi PDF özelleştirme ayarları |
| status | text | `active` / `suspended` / `trial` |
| subscription_plan_id | uuid FK → subscription_plans.id | nullable, Faz 8'de dolacak |

RLS: sadece `super_admin` tüm satırları görür; diğer roller sadece kendi
`tenant_id`'sine ait satırı görebilir (genelde tek satır).

### `users` (Tüm roller tek tabloda)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | Supabase Auth `auth.users.id` ile birebir eşleşir |
| tenant_id | uuid FK → tenants.id | `super_admin` için NULL olabilir |
| role | text | `super_admin` \| `firma_admin` \| `bolge_muduru` \| `restoran_muduru` |
| full_name | text | |
| email | text | |
| phone | text | |
| status | text | `active` / `passive` |

RLS: kullanıcı sadece kendi `tenant_id`'sindeki `users` satırlarını görür
(rolüne göre ayrıca filtrelenir — örn. bölge müdürü sadece kendi profilini
düzenleyebilir, firma_admin hepsini yönetir).

---

## 2. Restoran ve Atama

### `restaurants`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| name | text | |
| address | text | |
| email | text | Restoran e-posta adresi |
| manager_name | text | Restoran müdürü adı (serbest metin, `users`'a bağlı olmayabilir) |
| assistant_manager_name | text | Müdür yardımcısı adı |
| manager_user_id | uuid FK → users.id | nullable — restoran müdürü sisteme giriş yapıyorsa bağlanır |
| total_staff_count | int | Otomatik hesaplanabilir (aktif personel sayısından) veya manuel |
| status | text | `active` / `passive` |

### `restaurant_regional_managers` (çoklu atama ara tablosu)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| restaurant_id | uuid FK → restaurants.id | |
| regional_manager_user_id | uuid FK → users.id | |

Not: Bir restoranın birden fazla bölge müdürü olabilir, bir bölge müdürü
birden fazla restorana atanabilir (many-to-many).

---

## 3. Dinamik Personel Modülü

Firma Admin hangi personel alanlarının isteneceğini kendi tanımlar
(ODZ form builder ile aynı "dinamik alan" mantığı).

### `staff_field_definitions`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| field_key | text | örn. `sgk_giris_tarihi` |
| label | text | örn. "SGK Giriş Tarihi" |
| field_type | text | `text` \| `date` \| `number` \| `file` \| `select` |
| is_required | boolean | |
| sort_order | int | |
| status | text | `active` / `passive` |

### `staff_members`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| restaurant_id | uuid FK | |
| full_name | text | |
| position | text | Görev/pozisyon |
| start_date | date | |
| end_date | date | nullable — doluysa personel otomatik pasif sayılır |
| status | text | `active` / `passive` (end_date girilince otomatik `passive`) |

### `staff_field_values`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| staff_member_id | uuid FK → staff_members.id | |
| field_definition_id | uuid FK → staff_field_definitions.id | |
| value_text | text | nullable |
| value_date | date | nullable |
| value_number | numeric | nullable |
| file_url | text | nullable — Supabase Storage path (belge alanları için) |

Not: Eksik zorunlu alan/belge tespiti bu tablo ile `staff_field_definitions`
karşılaştırılarak yapılır → bildirim tetiklenir.

---

## 4. ODZ Form Builder (Dinamik Soru Şablonu)

### `odz_form_sections` (Bölümler — Şube Genel Kontrolü, ESE, ÖSS vb.)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| title | text | |
| sort_order | int | |
| status | text | `active` / `passive` |
| created_by_user_id | uuid FK → users.id | Bölge müdürü de ekleyebiliyor (kararımız) |

### `odz_form_questions`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| section_id | uuid FK → odz_form_sections.id | |
| question_text | text | |
| question_type | text | `choice_3` (Uygun/Uygun Değil/Değ.Dışı) \| `text` \| `number` \| `photo_only` |
| is_required | boolean | |
| photo_required | boolean | Firma/bölge müdürü insiyatifine göre |
| sort_order | int | |
| status | text | `active` / `passive` |

### `odz_form_question_options`
Sadece `question_type = choice_3` gibi sabit olmayan, özel şıklı sorularda
kullanılır (çoğu zaman 3'lü sabit seçenek yeterli olacağı için bu tablo
opsiyonel/genişletilebilir alan).
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| question_id | uuid FK | |
| label | text | |
| sort_order | int | |

---

## 5. Ziyaret (ODZ) Akışı

### `odz_visits`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| restaurant_id | uuid FK | |
| regional_manager_user_id | uuid FK → users.id | Ziyareti yapan |
| visit_date | date | |
| status | text | `draft` \| `completed` \| `notified` |
| notified_at | timestamptz | nullable — "Bilgilendir" tetiklendiği an |
| pdf_url | text | nullable — oluşturulan PDF'in Storage path'i |

### `odz_visit_photos` (fotoğraf havuzu)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| visit_id | uuid FK → odz_visits.id | |
| photo_url | text | Storage path: `tenant_id/restaurant_id/visit_id/dosya.jpg` |
| taken_at | timestamptz | Cihazdan gelen zaman damgası |
| gps_lat | numeric | nullable |
| gps_lng | numeric | nullable |
| uploaded_from | text | `mobile` / `web` |

### `odz_visit_answers`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| visit_id | uuid FK → odz_visits.id | |
| question_id | uuid FK → odz_form_questions.id | |
| answer_value | text | Seçilen şık veya serbest metin/sayı |
| notes | text | nullable — açıklama metni |
| add_to_action | boolean | Bölge müdürünün "Aksiyona Ekle" tiki (kararımız — otomatik değil) |

### `odz_visit_answer_photos` (cevap ↔ fotoğraf eşleme, çoktan çoğa)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| visit_answer_id | uuid FK → odz_visit_answers.id | |
| visit_photo_id | uuid FK → odz_visit_photos.id | |

Not: Bir fotoğraf birden fazla soruya bağlanabilir, bir soru birden fazla
fotoğraf içerebilir — bu yüzden ayrı ara tablo.

---

## 6. Aksiyon Takip

### `actions`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| restaurant_id | uuid FK | |
| source_visit_answer_id | uuid FK → odz_visit_answers.id | Hangi bulgudan doğdu |
| title | text | Otomatik doldurulur (soru metninden) veya bölge müdürü düzenler |
| due_date | date | Termin tarihi |
| status | text | `open` \| `pending_approval` \| `approved` \| `rejected` |
| opened_at | timestamptz | |
| approved_at | timestamptz | nullable |
| repeat_count | int | Kaç kez tekrarlandığını izlemek için (önceki ziyarette de açıksa artar) |

### `action_updates` (restoran müdürünün ilerleme kayıtları)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| action_id | uuid FK → actions.id | |
| created_by_user_id | uuid FK → users.id | Genelde restoran müdürü |
| description | text | |
| photo_url | text | nullable |
| reviewed_by_user_id | uuid FK → users.id | nullable — onaylayan bölge müdürü |
| review_status | text | `pending` \| `approved` \| `rejected` |
| review_note | text | nullable — reddedilirse gerekçe |

---

## 7. Dinamik Günlük/Aylık Metrikler (Ciro, Tabak Sayısı, Hijyen Skoru vb.)

Aynı "dinamik alan" mantığı burada da kullanılıyor — hem manuel giriş hem
ileride POS entegrasyonu için aynı tablo yapısı çalışacak şekilde.

### `metric_definitions`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| key | text | örn. `daily_revenue`, `plate_count`, `hygiene_score` |
| label | text | örn. "Günlük Ciro" |
| unit | text | nullable — "TL", "%", "adet" |
| frequency | text | `daily` \| `monthly` |
| input_mode | text | `manual` \| `api` — POS entegrasyonu varsa `api` |
| status | text | `active` / `passive` |

### `metric_values`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| metric_definition_id | uuid FK | |
| restaurant_id | uuid FK | |
| period_date | date | Günlük ise o gün, aylık ise ayın ilk günü |
| value | numeric | |
| entered_by_user_id | uuid FK → users.id | nullable (API'den geldiyse null) |
| source | text | `manual` \| `pos_api` |

Not: Hijyen skoru da bu yapı üzerinden `frequency = monthly` bir
`metric_definition` olarak modellenir — eksik giriş tespiti burada yapılır.

---

## 8. Bildirimler

### `notifications`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| recipient_user_id | uuid FK → users.id | |
| type | text | `new_odz_report` \| `action_approval_needed` \| `action_approved` \| `action_rejected` \| `missing_staff_document` \| `missing_metric` |
| title | text | |
| body | text | |
| related_entity_type | text | nullable — `action` \| `odz_visit` \| `staff_member` |
| related_entity_id | uuid | nullable |
| read_at | timestamptz | nullable |
| channel | text | `push` \| `email` \| `sms` |
| sent_at | timestamptz | nullable |

---

## 9. Süper Admin / Abonelik (Faz 8'de derinleşecek, iskelet şimdiden)

### `subscription_plans`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| name | text | |
| price_monthly | numeric | |
| pricing_model | text | `per_restaurant` \| `tiered` \| `flat` (Faz 8'de netleşecek) |

### `billing_records`
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| amount | numeric | |
| period | text | örn. "2026-07" |
| status | text | `paid` \| `pending` \| `overdue` |

### `support_tickets` (Süper Admin teknik destek takibi)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| subject | text | |
| status | text | `open` \| `closed` |
| created_by_user_id | uuid FK | |

---

## RLS (Row Level Security) Genel Prensip

- Her `tenant_id` içeren tabloda: `USING (tenant_id = current_tenant_id())`
  şeklinde bir policy fonksiyonu kullanılacak (Supabase'de bir SQL
  fonksiyonu ile kullanıcının JWT'sinden `tenant_id` okunur).
- `super_admin` rolü için ayrı bir bypass policy: `USING (is_super_admin())`.
- `restaurant_regional_managers` ara tablosu üzerinden bölge müdürünün
  hangi restoranlara erişebileceği hesaplanır (subquery ile).
- `restoran_muduru` rolü sadece `restaurant_id = kendi restoranı` olan
  satırlara erişir.

## Sonraki Adım

Bu şema onaylanınca:
1. Supabase SQL Editor'de veya migration dosyalarıyla tablolar oluşturulacak.
2. RLS policy'leri tablo tablo yazılacak.
3. `packages/shared` içinde bu tablolara karşılık gelen TypeScript tipleri
   (Supabase CLI ile otomatik üretilebilir: `supabase gen types typescript`).
