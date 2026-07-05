# TASKS.md — Detaylı Uygulama Görev Listesi

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

**Durum:** [ ] Yapılmadı

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

**Durum:** [ ] Yapılmadı

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

**Durum:** [ ] Yapılmadı

---

## Görev 3 — Firmalar Sayfası (Yeniden, Gerçek Datatable ile)

> Not: Bu sayfa daha önce basit HTML tablo ile yapılmıştı
> (`apps/web/src/app/(tenant)/super-admin/firmalar/page.tsx`).
> Mantığı (Supabase bağlantısı) KORUNACAK, sadece görünüm değişecek.

**Kaynak dosyalar:**
- `views/dashboard/table/bootstrap-table.js` (gerçek Hope UI tablo stili)

**Hedef:** `apps/web/src/app/(tenant)/super-admin/firmalar/page.tsx` (üzerine yazılacak)

**Durum:** [ ] Yapılmadı

---

## Görev 4 — Personel Yönetimi Sayfası (Restoran Müdürü)

**Kaynak dosyalar:**
- `views/dashboard/app/user-list.js` (personel listesi)
- `views/dashboard/app/user-add.js` (yeni personel ekleme formu)
- `views/dashboard/app/user-profile.js` (personel detay/belge görüntüleme)

**Hedef:** `apps/web/src/app/(tenant)/restoran-muduru/personel/page.tsx`

**Supabase bağlantısı:** `staff_members` + `staff_field_values` +
`staff_field_definitions` tabloları (bkz. docs/DATABASE_SCHEMA.md bölüm 3)

**Durum:** [ ] Yapılmadı

---

## Görev 5 — Eksik Auth Sayfaları

**Kaynak dosyalar ve karşılıkları:**
| Kaynak | Hedef | Kullanım amacı |
|---|---|---|
| `views/dashboard/auth/recoverpw.js` | `apps/web/src/app/(tenant)/sifremi-unuttum/page.tsx` | Şifremi unuttum akışı |
| `views/dashboard/auth/sign-up.js` | `apps/web/src/app/(tenant)/davet-kabul/page.tsx` | Bölge müdürü/personel daveti ile ilk şifre belirleme |

**Durum:** [ ] Yapılmadı

---

## Görev 6 — ODZ Ziyaret Formu (Form Wizard) [İLERİ FAZ]

**Kaynak dosyalar:**
- `views/dashboard/from/form-wizard.js` (çok adımlı form yapısı — ODZ'nin
  bölüm bölüm ilerleyen yapısına birebir uyuyor)

**Hedef:** `apps/web/src/app/(tenant)/bolge-muduru/ziyaret/[id]/page.tsx`

**Not:** Bu görev, `odz_form_sections`/`odz_form_questions` tabloları
doldurulmadan (yani form builder çalışmadan) tam test edilemez — bu
yüzden Görev 0-5'ten SONRA yapılmalı.

**Durum:** [ ] Yapılmadı

---

## Görev 7 — Aksiyon Takip Panosu (Kanban)

**Kaynak dosyalar:**
- `views/dashboard/special-pages/kanban.js`

**Hedef:** `apps/web/src/app/(tenant)/bolge-muduru/aksiyonlar/page.tsx`

**Supabase bağlantısı:** `actions` tablosu, `status` koluna göre
sütunlara dağıtılacak (open / pending_approval / approved)

**Durum:** [ ] Yapılmadı

---

## Görev 8 — Ziyaret Geçmişi (Timeline)

**Kaynak dosyalar:**
- `views/dashboard/special-pages/timeline.js`

**Hedef:** Restoran detay sayfasının bir sekmesi/bölümü olarak kullanılacak
(tam yol Görev 1/2 tamamlanınca netleşecek)

**Durum:** [ ] Yapılmadı

---

## Referans — Henüz Göreve Bağlanmamış Diğer Kaynak Dosyalar

Bunlar ileride ihtiyaç oldukça yukarıdaki gibi görev haline getirilecek:
- `views/dashboard/widget/widgetchart.js` — grafik kartları (dashboard'larda kullanılabilir)
- `views/dashboard/from/form-element.js`, `form-validation.js` — genel form ihtiyaçlarında
- `views/dashboard/special-pages/calender.js` — ODZ ziyaret takvimi için (faz 5+)
- `views/dashboard/special-pages/billing.js` — Süper Admin abonelik ekranı için (faz 8)
- `views/dashboard/special-pages/profile.js` — genel kullanıcı profil sayfası
- `components/partials/dashboard/HeaderStyle/header-style-1.js` ... `4.js` — alternatif header stilleri (şimdilik `header.js` kullanılıyor, değişmeyecek)
- `components/partials/dashboard/SidebarStyle/sidebar-style-1.js`, `sidebar-small.js` — alternatif sidebar stilleri (şimdilik `sidebar.js` kullanılıyor)
