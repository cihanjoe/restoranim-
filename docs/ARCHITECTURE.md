# ODZ Platform - Mimari Dokümanı

> Bu dosya projenin SABİT referans dosyasıdır. Sık değişmez.
> Güncel ilerleme durumu için PROGRESS.md dosyasına bakın.
> Feature listesi ve fazlar için ROADMAP.md dosyasına bakın.
> Veritabanı yapısı için DATABASE_SCHEMA.md dosyasına bakın.

## AI Ajanlar İçin Talimat (ÖNCE BUNU OKU)

Bu projede yapay zeka ile kodlama yapılıyor. Her yeni oturuma başlarken:

1. Önce `docs/PROGRESS.md` dosyasını oku — hangi modül tamamlandı, şu an ne
   üzerinde çalışılıyor, sıradaki adım ne, gör.
2. Sonra bu dosyayı (`ARCHITECTURE.md`) oku — teknoloji ve kural referansı.
3. Gerekirse `docs/DATABASE_SCHEMA.md` ve `docs/ROADMAP.md` dosyalarına bak.
4. Kod yazmaya başlamadan önce projenin tamamını baştan taramaya ÇALIŞMA —
   sadece ilgili modülün klasörünü ve bu doküman setini oku, yeterli.
5. Bir görev tamamlandığında `docs/PROGRESS.md` dosyasını GÜNCELLE
   (tamamlanan modülü işaretle, session log'a not düş, sıradaki adımı yaz).
6. Mimariyi bozacak kararlar alma (örn. yeni bir state management kütüphanesi
   ekleme, klasör yapısını değiştirme) — böyle bir ihtiyaç doğarsa önce bu
   dosyayı güncelle, sonra kodla.

## Proje Özeti

Restoran zincirlerine kiralanan, çok kiracılı (multi-tenant) bir SaaS platformu.
Bölge müdürleri restoranlarda saha denetimi (ODZ - Operasyon Destek Ziyareti)
yapar, fotoğraflı bulgu raporu oluşturur, aksiyon takibi yapılır. Her müşteri
firma kendi subdomain'i üzerinden (örn. `xpide.restoranim.com`) kendi
yönetim paneline erişir.

## Teknoloji Yığını

| Katman | Teknoloji | Not |
|---|---|---|
| Web Frontend | Next.js 14+ (App Router), TypeScript | Vercel'de host edilecek |
| Stil/UI Kiti | Bootstrap 5 + SCSS (Hope UI tasarım sistemi) | Kaynak: github.com/iqonicdesignofficial/hope-ui-react-dashboard (MIT lisans, React versiyonu). Next.js'e uyarlanarak entegre edilir — bkz. docs/DESIGN.md |
| Mobil | React Native + Expo | iOS + Android tek kod tabanı |
| Backend/DB | Supabase (PostgreSQL) | Auth, Storage, Realtime, Edge Functions dahil |
| Kimlik Doğrulama | Supabase Auth | Rol bilgisi custom claim/tablo ile tutulacak |
| Dosya Depolama | Supabase Storage | Fotoğraflar, PDF belgeler, firma logoları |
| Sunucusuz Fonksiyonlar | Supabase Edge Functions | PDF üretimi, mail/SMS gönderimi, POS entegrasyon köprüsü |
| Hosting (Web) | Vercel | Wildcard subdomain + otomatik SSL |
| Mobil Dağıtım | Expo EAS Build | App Store / Google Play |
| E-posta | Resend veya benzeri (kararlaştırılacak) | Edge Function üzerinden tetiklenir |
| SMS | Netgsm/İletimerkezi (faz 2, opsiyonel modül) | Firma bazlı aktif/pasif |

## Repo Yapısı (Monorepo)

Tek repo, workspace yapısı (pnpm/turborepo) öneriliyor — kod paylaşımı
(tipler, Supabase client, sabitler) kolaylaşır.

```
odz-platform/
├── apps/
│   ├── web/                  # Next.js - tüm paneller burada (route bazlı ayrım)
│   │   ├── app/
│   │   │   ├── (super-admin)/      # restoranim.com ana domain
│   │   │   ├── (tenant)/           # [subdomain].restoranim.com altındaki her şey
│   │   │   │   ├── giris/
│   │   │   │   ├── firma-admin/
│   │   │   │   ├── bolge-muduru/
│   │   │   │   └── restoran-muduru/
│   │   │   └── api/
│   │   ├── modules/                # ÖZELLİK BAZLI, birbirinden bağımsız modüller
│   │   │   ├── auth/
│   │   │   ├── tenants/            # firma yönetimi (süper admin tarafı)
│   │   │   ├── restaurants/
│   │   │   ├── regional-managers/  # bölge müdürü yönetimi
│   │   │   ├── staff/              # personel modülü
│   │   │   ├── odz-form-builder/   # dinamik form/soru şablonu
│   │   │   ├── odz-visits/         # ziyaret akışı, fotoğraf eşleme
│   │   │   ├── actions/            # aksiyon takip + onay akışı
│   │   │   ├── notifications/      # push/email/sms
│   │   │   ├── billing/            # abonelik, paket, süper admin mali görünüm
│   │   │   └── reports/            # PDF üretimi, şablon özelleştirme
│   │   └── lib/
│   │       ├── supabase/
│   │       └── shared/
│   └── mobile/                # Expo React Native app
│       ├── app/                    # expo-router
│       ├── modules/                # web ile birebir aynı isimlendirme mantığı
│       └── lib/
├── packages/
│   └── shared/                # web + mobile ortak: tipler, sabitler, validasyon şemaları
├── supabase/
│   ├── migrations/            # SQL migration dosyaları (sıralı, numaralı)
│   └── functions/             # Edge Functions (her biri kendi klasöründe)
└── docs/
    ├── ARCHITECTURE.md        # bu dosya
    ├── DATABASE_SCHEMA.md
    ├── ROADMAP.md
    └── PROGRESS.md
```

## Modülerlik Kuralı (ÖNEMLİ)

Her özellik `modules/<ozellik-adi>/` altında yaşar ve şunları içerir:
`components/`, `hooks/` veya `queries/`, `types.ts`, `actions.ts` (server actions).

Bir modül başka bir modülün **iç dosyalarına** doğrudan import ile girmez;
sadece `packages/shared` üzerinden paylaşılan tipleri veya modülün kendi
`index.ts` üzerinden dışa açtığı şeyleri kullanır. Bu sayede bir modülde
yapılan değişiklik diğerini kırmaz.

Yeni bir modül eklerken:
1. `modules/<isim>/` klasörü aç.
2. `docs/DATABASE_SCHEMA.md` içinde ilgili tabloları tanımla/kontrol et.
3. `docs/ROADMAP.md` içindeki ilgili faz maddesini işaretle.
4. `docs/PROGRESS.md` içine session log satırı ekle.

## Multi-Tenant (Çok Kiracılı) Mantığı

- **Tek veritabanı**, her tabloda `tenant_id` (firma_id) kolonu bulunur.
- **Row Level Security (RLS)** ile her firma sadece kendi verisine erişir.
- Süper admin rolü RLS'de özel bir politika ile TÜM firmaların verisine
  erişebilir (bypass policy).
- Subdomain yönlendirmesi Next.js `middleware.ts` içinde yapılır:
  `xpide.restoranim.com` isteği geldiğinde middleware subdomain'i okur,
  ilgili `tenant_id`'yi bulur, request context'ine ekler.
- Ana domain (`restoranim.com`) = Süper Admin girişi / pazarlama sitesi.
- Wildcard SSL + wildcard DNS Vercel üzerinden otomatik yönetilir.

## Roller ve Yetki Seviyeleri

| Rol | Kod | Erişim Alanı |
|---|---|---|
| Süper Admin | `super_admin` | Tüm firmalar, abonelik/mali veriler, teknik destek kayıtları |
| Firma Admin | `firma_admin` | Kendi firması: bölge müdürü, restoran, form şablonu, personel alan tanımı, PDF şablon özelleştirme |
| Bölge Müdürü | `bolge_muduru` | Kendine atanan restoran(lar) — birden fazla bölge müdürü aynı restorana atanabilir |
| Restoran Müdürü | `restoran_muduru` | Kendi restoranı: personel, aksiyon tamamlama, günlük veri girişi (ciro vb. eğer manuel tanımlıysa) |

Yetki kontrolü hem RLS seviyesinde (veritabanı) hem UI seviyesinde
(route guard) çift katmanlı yapılır — sadece frontend'e güvenilmez.

## Kod Kuralları (Kısa)

- TypeScript strict mode açık.
- Tüm form validasyonları `zod` ile, şema `packages/shared` altında tanımlanır
  (web ve mobil aynı şemayı kullanır).
- Server Actions (Next.js) veritabanı yazma işlemleri için tercih edilir,
  client-side direkt Supabase yazma işlemi sadece Realtime/basit okumalarda.
- Dosya/fotoğraf yüklemeleri her zaman Supabase Storage üzerinden, path
  yapısı: `tenant_id/restaurant_id/visit_id/dosya.jpg` şeklinde standarttır.

## Ortam Değişkenleri (özet, ileride detaylandırılacak)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY= (veya seçilen mail sağlayıcı)
```
