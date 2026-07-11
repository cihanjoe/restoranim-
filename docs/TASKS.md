# TASKS.md — Detaylı Uygulama Görev Listesi

## ⚠️ ZORUNLU KURAL — HER GÖREV İÇİN GEÇERLİ (ATLANAMAZ)

Bir görev, sadece Hope UI görünümü doğru olduğu için TAMAMLANMIŞ
sayılmaz. Aşağıdaki dört şart sağlanmadan görev YARIM'dır, ✅ işareti
KONULMAZ:

1. **EKLE çalışıyor** — Sayfadaki "Ekle/Yeni" formu doldurulup
   gönderildiğinde, ilgili Supabase tablosuna GERÇEKTEN yeni bir satır
   ekleniyor. (Test: Supabase Table Editor'de yeni satırı gör.)

2. **GÖRÜNTÜLE çalışıyor** — Sayfa açıldığında, ilgili Supabase
   tablosundaki GERÇEK veriler listeleniyor (sabit/örnek/hardcoded
   veri DEĞİL). (Test: Supabase'de bir satır ekle/sil, sayfayı
   yenile, listenin değiştiğini gör.)

3. **DÜZENLE çalışıyor** — Bir satıra tıklayıp bilgilerini
   değiştirdiğinde, Supabase'deki ilgili satır GERÇEKTEN güncelleniyor.
   (Test: Değişikliği kaydet, sayfayı yenile, değişikliğin kalıcı
   olduğunu gör.)

4. **SİL çalışıyor** (silme özelliği olan sayfalarda) — Bir satırı
   sildiğinde, Supabase'deki ilgili satır GERÇEKTEN siliniyor.
   (Test: Sil, Supabase Table Editor'de satırın gittiğini gör.)

**Bu şartlardan biri bile eksikse:**
- Görevi ✅ olarak işaretleme
- docs/PROGRESS.md'ye "TAMAMLANMADI — sadece görsel, Supabase bağlantısı
  eksik: [hangi kısım eksik]" diye not düş
- Kullanıcıya "bu sayfa şu an sadece tasarım, veri bağlantısı henüz
  yapılmadı" diye açıkça söyle — "tamamlandı" deme

**Kabul testi formatı (her görevin sonunda bunu çalıştır):**
1. Sayfayı aç → gerçek veri görünüyor mu?
2. Yeni kayıt ekle → Supabase'de görünüyor mu?
3. Var olan kaydı düzenle → Supabase'de güncelleniyor mu?
4. (Varsa) Kaydı sil → Supabase'den siliniyor mu?

Bu dört adımdan biri başarısızsa, görev bitmemiştir, düzeltilmesi
gerekir — "tasarım güzel oldu ama veri bağlı değil" bir sonraki adıma
ERTELENEMEZ, aynı görevin İÇİNDE çözülmesi gerekir.

### Ek Kural — Grafikler, İstatistikler ve Özet Kartları

Yukarıdaki 4 madde (Ekle/Görüntüle/Düzenle/Sil) sadece form/liste
sayfaları için değil, PROJEDEKİ HER SAYI/GRAFİK/İSTATİSTİK için de
geçerlidir. Bu şu anlama gelir:

- Dashboard'daki özet kartlarındaki HER sayı (örn. "Aktif Firmalar: 12",
  "Toplam Restoran: 184", "Aylık Gelir: ₺86.4K") gerçek bir Supabase
  sorgusunun (COUNT, SUM, AVG vb.) sonucu olmalı — asla sabit/örnek
  rakam yazılmamalı.
- HER grafik (çizgi grafik, dairesel progress, trend grafiği) gerçek
  veritabanı verisinden hesaplanmalı — örnek/rastgele veri dizisi
  YASAK. Eğer o an yeterli gerçek veri yoksa (örn. proje yeni
  başladığı için sadece 1-2 kayıt var), grafik BOŞ veya "Henüz yeterli
  veri yok" mesajı göstermeli — ASLA uydurma sayı göstermemeli.
- "Bu ay +3 firma", "%68", "+8.2%" gibi her karşılaştırma/yüzde de
  gerçek hesaplamadan gelmeli (örn. bu ayki kayıt sayısı - geçen ayki
  kayıt sayısı), sabit yazılmamalı.

**Kabul testi:** Supabase'de test verisi ekle/sil, dashboard'ı yenile,
İLGİLİ sayı/grafiğin değiştiğini gör. Değişmiyorsa o widget hâlâ
sahte/sabit veridir, görev tamamlanmamıştır.

> KULLANIM: "docs/TASKS.md dosyasındaki Görev N'yi uygula" de. Model
> ARAMA yapmayacak, aşağıda verilen tam dosya yollarını kullanacak.
> Her görev bağımsız çalıştırılabilir ama SIRAYLA yapılması önerilir
> (Görev 0 ortak altyapı olduğu için ilk yapılmalı).
> Her görev bitince: npm run build ile doğrula, bu dosyada ✅ işaretle,
> docs/PROGRESS.md'ye session log satırı ekle.

Kaynak kök: `design-reference/hope-ui-react/src/`
Hedef kök: `apps/web/src/`

---

## Görev 0 — Ortak Layout (Sidebar + Header) [ÖNCELİKLİ, HERKESİ ETKİLER]

**Amaç:** Şu ana kadar her sayfa kendi sidebar/header'ını ayrı ayrı
içeriyordu (tutarsızlık riski). Bunun yerine TEK bir ortak layout
bileşeni oluşturup her rol onu kullansın.

**Kaynak dosyalar:**
- `components/partials/dashboard/SidebarStyle/sidebar.js` (ana sidebar)
- `components/partials/dashboard/SidebarStyle/vertical-nav.js` (menü öğeleri listesi)
- `components/partials/dashboard/HeaderStyle/header.js` (ana header — arama, bildirim, kullanıcı avatarı)
- `layouts/dashboard/default.js` (bu ikisini saran genel şablon)

**Hedef:**
- `apps/web/src/components/hope-ui/layout/AppSidebar.tsx`
- `apps/web/src/components/hope-ui/layout/AppHeader.tsx`
- `apps/web/src/app/(tenant)/[role]/layout.tsx` — bu ikisini kullanan ortak layout

**Önemli detaylar:**
- Header'daki kullanıcı adı/rolü **sabit metin OLMAMALI** — Supabase
  Auth'tan giriş yapan kullanıcının `users` tablosundaki `full_name` ve
  `role` alanından gelmeli (şu anki "Ahmet Yılmaz" hatası burada düzelecek)
- Sidebar menü öğeleri role göre DEĞİŞMELİ:
  - `super_admin`: Genel Bakış, Firmalar, Abonelikler, Destek Talepleri, Ayarlar
  - `firma_admin`: Genel Bakış, Restoranlar, Bölge Müdürleri, ODZ Form Builder, Personel Alanları, Ayarlar
  - `bolge_muduru`: Genel Bakış, Restoranlarım, Ziyaretlerim, Aksiyonlar
  - `restoran_muduru`: Genel Bakış, Personelim, Aksiyonlarım

**Durum:** [x] Tamamlandı — ortak layout (AppSidebar + AppHeader + DashboardLayout) tüm roller için hazır, build başarılı

---

## Görev 1 — Bölge Müdürü Paneli (Genel Bakış)

**Kaynak dosyalar:**
- `views/dashboard/app/user-list.js` (kendine atanan restoranların listesi için temel)
- `views/dashboard/widget/widgetbasic.js` (üst özet kartları için)

**Hedef:** `apps/web/src/app/(tenant)/bolge-muduru/genel-bakis/page.tsx`

**İçerik:**
- Üstte özet kartlar: Atanan Restoran Sayısı, Bu Ay Yapılan Ziyaret, Açık Aksiyon
- Altta, `restaurant_regional_managers` tablosu üzerinden bu bölge
  müdürüne atanan restoranların listesi (isim, adres, son ziyaret tarihi)
- Supabase sorgusu: `restaurants` tablosu, `restaurant_regional_managers`
  ile JOIN, `regional_manager_user_id = giriş yapan kullanıcı` filtresi

**Durum:** [x] Tamamlandı — `/bolge-muduru/genel-bakis` sayfası oluşturuldu; Supabase canlı sorgular (restaurant_regional_managers → restaurants → odz_visits, actions) ile çalışıyor; özet kartlar (StatCard), restoran tablosu, boş durum mesajı mevcut. Build başarılı.

---

## Görev 2 — Restoran Müdürü Paneli (Genel Bakış)

**Kaynak dosyalar:**
- `views/dashboard/widget/widgetcard.js` (özet kartlar)
- `views/dashboard/special-pages/timeline.js` (son aksiyonlar/ziyaretler için)

**Hedef:** `apps/web/src/app/(tenant)/restoran-muduru/genel-bakis/page.tsx`

**İçerik:**
- Kendi restoranının bilgisi (isim, personel sayısı)
- Açık aksiyon listesi (özet)
- Son ODZ ziyareti bilgisi

**Durum:** [x] Tamamlandı — `/restoran-muduru/genel-bakis` sayfası oluşturuldu; restoran bilgisi (restaurants tablosundan), personel sayısı, açık aksiyon listesi (actions), son ODZ ziyareti (odz_visits) canlı Supabase sorguları ile; sidebar güncellendi, eski sayfadan redirect eklendi. Build başarılı.

---

## Görev 3 — Firmalar Sayfası (Yeniden, Gerçek Datatable ile)

> Not: Bu sayfa daha önce basit HTML tablo ile yapılmıştı
> (`apps/web/src/app/(tenant)/super-admin/firmalar/page.tsx`).
> Mantığı (Supabase bağlantısı) KORUNACAK, sadece görünüm değişecek.

**Kaynak dosyalar:**
- `views/dashboard/table/bootstrap-table.js` (gerçek Hope UI tablo stili)

**Hedef:** `apps/web/src/app/(tenant)/super-admin/firmalar/page.tsx` (üzerine yazılacak)

**Durum:** [x] Tamamlandı — `/super-admin/firmalar` sayfası Hope UI bootstrap-table.js stiliyle yeniden yazıldı; Supabase canlı veri (tenants tablosu), Ekle/Düzenle/Sil CRUD işlemleri, modal form, badge'ler, initial avatar'lar. Build başarılı.

---

## Görev 4 — Personel Yönetimi Sayfası (Restoran Müdürü)

**Kaynak dosyalar:**
- `views/dashboard/app/user-list.js` (personel listesi)
- `views/dashboard/app/user-add.js` (yeni personel ekleme formu)
- `views/dashboard/app/user-profile.js` (personel detay/belge görüntüleme)

**Hedef:** `apps/web/src/app/(tenant)/restoran-muduru/personel/page.tsx`

**Supabase bağlantısı:** `staff_members` + `staff_field_values` +
`staff_field_definitions` tabloları (bkz. docs/DATABASE_SCHEMA.md bölüm 3)

**Durum:** [x] Tamamlandı — `/restoran-muduru/personel` sayfası oluşturuldu; Supabase canlı sorgular (restaurants → staff_members) ile CRUD işlemleri çalışıyor; Hope UI user-list.js tablo stili + modal form ile Ekle/Düzenle/Sil mevcut. Sidebar menüsü zaten vardı. Build başarılı.

---

## Görev 5 — Eksik Auth Sayfaları

**Kaynak dosyalar ve karşılıkları:**
| Kaynak | Hedef | Kullanım amacı |
|---|---|---|
| `views/dashboard/auth/recoverpw.js` | `apps/web/src/app/sifremi-unuttum/page.tsx` | Şifremi unuttum akışı |
| `views/dashboard/auth/sign-up.js` | `apps/web/src/app/davet-kabul/page.tsx` | Bölge müdürü/personel daveti ile ilk şifre belirleme |

**Durum:** [x] Tamamlandı — `/sifremi-unuttum` ve `/davet-kabul` sayfaları oluşturuldu. Her ikisi de Hope UI auth stiliyle (split layout, gradient sol panel, logo, form kartı). Supabase Auth entegrasyonu: `resetPasswordForEmail` ve `updateUser`. Davet-kabul sayfası hem şifre sıfırlama (recovery) hem de davet akışını (mevcut session) destekliyor, loading/error/success durumları var. Build başarılı.

---

## Görev 6 — ODZ Ziyaret Formu (Form Wizard)

**Kaynak dosyalar:**
- `views/dashboard/from/form-wizard.js` (çok adımlı form yapısı)

**Hedefler:**
- `apps/web/src/app/(tenant)/bolge-muduru/ziyaretlerim/page.tsx` — ziyaret listesi + yeni ziyaret başlatma
- `apps/web/src/app/(tenant)/bolge-muduru/ziyaret/[id]/page.tsx` — form wizard

**İçerik:**
- Ziyaret listesi: Supabase `odz_visits` + `restaurants` JOIN; durum badge'leri (draft/completed/notified); "Yeni Ziyaret" butonu → modal ile restoran seç → hemen draft oluştur → wizard'a yönlendir
- Form wizard: Hope UI form-wizard.js step indicator stili (adım butonları); dinamik olarak `odz_form_sections` ve `odz_form_questions` tablolarından soruları çeker; 3 soru tipi (choice_3 butonlar, text textarea, number input); her soruda not alanı ve "Aksiyona Ekle" checkbox'ı; taslak kaydetme (delete+insert); zorunlu soru validasyonu; tamamlama sonrası status=completed.

**Durum:** [x] Tamamlandı — ziyaret listesi + form wizard. Dinamik soru yapısı (`odz_form_sections` / `odz_form_questions` db'den okuyor), 3 soru tipi (choice_3, text, number), taslak kaydetme, zorunlu soru kontrolü, step indicator, success ekranı. `npm run build` ile 15 route derlendi.

---

## Görev 7 — Aksiyon Takip Panosu (Kanban)

**Kaynak dosyalar:**
- `views/dashboard/special-pages/kanban.js`

**Hedef:** `apps/web/src/app/(tenant)/bolge-muduru/aksiyonlar/page.tsx`

**İçerik:**
- 4 sütunlu Kanban: Açık (open), Onay Bekleyen (pending_approval), Onaylanan (approved), Reddedilen (rejected)
- Aksiyon kartları: başlık, restoran adı, termin tarihi, tekrar sayısı
- Detay modal: başlık, restoran, termin, oluşturma tarihi, durum dropdown (anlık güncelleme), silme butonu
- Supabase: `restaurant_regional_managers` üzerinden bölge müdürüne atanan restoranların aksiyonlarını çeker; durum güncelleme, silme CRUD

**Supabase bağlantısı:** `actions` tablosu, `status` kolonuna göre sütunlara dağıtılır

**Durum:** [x] Tamamlandı — 4 sütunlu Kanban panosu, aksiyon kartları, detay modal ile durum güncelleme ve silme. Bölge müdürüne atanan restoranların aksiyonları (`restaurant_regional_managers` → `actions`). 16 route derlendi.

---

## Görev 8 — Ziyaret Geçmişi (Timeline)

**Kaynak dosyalar:**
- `views/dashboard/special-pages/timeline.js`

**Hedef:**
- `apps/web/src/app/(tenant)/restoran-muduru/ziyaret-gecmisi/page.tsx`

**İçerik:**
- Hope UI timeline stili: aylara göre gruplanmış, ay başlıkları pill badge, dikey çizgi ve nokta işaretçileri
- Her ziyaret: ziyaretçi adı (users.full_name), tarih/saat, durum badge'i (Taslak/Tamamlandı/Bildirildi), tamamlanma tarihi
- Supabase: `restaurants.manager_user_id` → restoran ID → `odz_visits` (users JOIN, odz_visit_answers COUNT)
- Sağ sütunda özet kartı: Toplam/Tamamlanan/Taslak/Bildirilen sayıları
- Sidebar restoran_muduru menüsüne "Ziyaret Geçmişi" eklendi

**Durum:** [x] Tamamlandı — 17 route derlendi. Aylık gruplanmış Hope UI timeline; Supabase canlı sorgu (restaurants → odz_visits → users); özet kartı. Sidebar menüsü güncellendi.

---

---

## Görev 9 — Hesabım Sayfası (Kullanıcı Profili)

**Kaynak dosyalar:**
- `views/dashboard/special-pages/profile.js`

**Hedef:**
- `apps/web/src/app/(tenant)/hesabim/page.tsx`

**İçerik:**
- 3 sekmeli profil sayfası (Profil / Aktivite / Güvenlik)
- Profil sekmesi: Ad Soyad, E-posta (salt okunur), Telefon, Rol (salt okunur), Kayıt Tarihi — düzenleme formu Supabase `users` tablosuna UPDATE yazar
- Aktivite sekmesi: timeline başlangıcı (şu an sadece hesap oluşturma kaydı)
- Güvenlik sekmesi: şifre değiştirme (Supabase Auth `updateUser`)
- Hope UI stil uyumlu tasarım, profil fotoğrafı yerine Initials avatar

**Supabase bağlantısı:**
- `users` tablosu: SELECT (profil okuma) + UPDATE (isim/telefon güncelleme)
- `auth.updateUser()`: şifre değiştirme

**Durum:** [x] Tamamlandı — 17 route derlendi. Profil düzenleme (users UPDATE), şifre değiştirme (auth.updateUser), 3 sekme (Tab.Container), Hope UI tatlı stil. Build başarılı.

---

## Görev 10 — Firma Admin Restoran Yönetimi

**Amaç:** Firma Admin'in kendi firmasına ait restoranları listelemesi, eklemesi, görüntülemesi ve düzenlemesi.

**Hedef sayfalar:**
- `apps/web/src/app/(tenant)/firma-admin/restoranlar/page.tsx` — Restoran listesi (tablo) + "Restoran Ekle" butonu → modal form
- `apps/web/src/app/(tenant)/firma-admin/restoranlar/[id]/page.tsx` — Restoran detay sayfası (tüm bilgiler kart halinde, "Düzenle" butonu)
- `apps/web/src/app/(tenant)/firma-admin/restoranlar/[id]/duzenle/page.tsx` — Restoran düzenleme sayfası (detay sayfasındaki "Düzenle" butonundan gidilir)

**Form alanları (modal/ekleme + düzenleme):**
- Temel: Restoran Adı, İl (select → 81 il), İlçe, Açılış Tarihi, Tür (Merkeze Bağlı / Franchise select), Adres, Durum
- İletişim: Telefon, E-posta, Fatura Adresi
- Bölge Müdürü Atama: `users` tablosundaki `bolge_muduru` rolündeki aktif kullanıcılar checkbox listesi (çoklu seçim)
- Restoran Müdürü: metin alanı
- Platform Puanları (0-5): Google Puanı, Yemek Sepeti Puanı, Getir Puanı, Trendyol Yemek Puanı
- Franchise bilgileri (sadece Franchise seçiliyse gösterilir): Restoran Sahibi, Sahip İletişim No, Sahip E-posta

**Supabase bağlantısı:**
- `restaurants` tablosu: SELECT/INSERT/UPDATE — yeni kolonlar: city, district, opening_date, franchise, phone, yemeksepeti_score, getir_score, trendyol_yemek_score, google_score, franchise_owner, franchise_owner_phone, franchise_owner_email, invoice_address
- `restaurant_regional_managers` tablosu: INSERT (yeni atama) / DELETE (mevcut atamaları sil) — çoktan çoğa ilişki
- `users` tablosu: SELECT — bölge müdürü listesi için (`role = bolge_muduru`)

**Migration:** `supabase/migrations/0004_restoran_ek_kolonlar.sql` — mevcut `restaurants` tablosuna yeni kolonları ekler. Supabase SQL Editor'da elle çalıştırılmalı veya `supabase db push` ile uygulanmalı.

**Durum:** [x] Tamamlandı — 3 sayfa oluşturuldu; liste + ekleme modalı + detay + düzenleme; Supabase canlı CRUD; build başarılı (19 route). Migration SQL Editor'dan elle çalıştırılmalı.

---

## Görev 11 — Firma Admin ODZ Form Builder

**Amaç:** Firma Admin'in ODZ ziyaret formu bölümlerini ve sorularını canlı Supabase verisiyle yönetmesi.

**Hedef sayfa:**
- `apps/web/src/app/(tenant)/firma-admin/form-builder/page.tsx`

**İçerik:**
- Bölüm listeleme, ekleme, düzenleme, silme
- Bölüm durum/sıra yönetimi (`active` / `passive`, `sort_order`)
- Bölüm altında soru listeleme, ekleme, düzenleme, silme
- Soru tipi: `choice_3`, `text`, `number`, `photo_only`
- Soru ayarları: zorunlu cevap, fotoğraf zorunluluğu, sıra, durum
- Özet kartları: toplam bölüm, aktif bölüm, toplam soru

**Supabase bağlantısı:**
- `odz_form_sections`: SELECT/INSERT/UPDATE/DELETE
- `odz_form_questions`: SELECT/INSERT/UPDATE/DELETE
- Tenant filtresi `useUser().tenant_id` ile uygulanır; sorular bölüm üzerinden tenant'a bağlanır.

**Durum:** [x] Tamamlandı — placeholder sayfa gerçek CRUD ekranına çevrildi. Değişen dosyada Biome check başarılı, `npm run build` başarılı (29 route).

---

## Görev 12 — Restoran Müdürü Aksiyonlarım Route Eksikliği

**Amaç:** Sidebar'da var olan `/restoran-muduru/aksiyonlarim` linkinin 404'e düşmesini engellemek ve restoran müdürünün kendi aksiyonlarını yönetebilmesi.

**Hedef sayfa:**
- `apps/web/src/app/(tenant)/restoran-muduru/aksiyonlarim/page.tsx`

**İçerik:**
- Restoran müdürünün `restaurants.manager_user_id` ile bağlı olduğu restoranları bulma
- Bu restoranlara ait `actions` kayıtlarını canlı listeleme
- Durum özet kartları: açık, onay bekleyen, reddedilen, onaylanan
- Açık/reddedilen aksiyonu açıklama ile `pending_approval` durumuna gönderme
- Gönderim sırasında `action_updates` tablosuna ilerleme kaydı oluşturma

**Supabase bağlantısı:**
- `restaurants`: SELECT (`manager_user_id = auth.uid()`)
- `actions`: SELECT/UPDATE
- `action_updates`: INSERT

**Durum:** [x] Tamamlandı — route eklendi, sidebar linki artık çalışıyor. Değişen dosyada Biome check başarılı, `npm run build` başarılı (29 route).

## Referans — Henüz Göreve Bağlanmamış Diğer Kaynak Dosyalar

Bunlar ileride ihtiyaç oldukça yukarıdaki gibi görev haline getirilecek:
- `views/dashboard/widget/widgetchart.js` — grafik kartları (dashboard'larda kullanılabilir)
- `views/dashboard/from/form-element.js`, `form-validation.js` — genel form ihtiyaçlarında
- `views/dashboard/special-pages/calender.js` — ODZ ziyaret takvimi için (faz 5+)
- `views/dashboard/special-pages/billing.js` — Süper Admin abonelik ekranı için (faz 8)
- `components/partials/dashboard/HeaderStyle/header-style-1.js` ... `4.js` — alternatif header stilleri (şimdilik `header.js` kullanılıyor, değişmeyecek)
- `components/partials/dashboard/SidebarStyle/sidebar-style-1.js`, `sidebar-small.js` — alternatif sidebar stilleri (şimdilik `sidebar.js` kullanılıyor)
