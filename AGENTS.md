# AGENTS.md

Proje: ODZ Platform (restoran zincirleri için saha denetim/ODZ SaaS platformu)

## Önce oku
1. `docs/PROGRESS.md` — nerede kaldık, sıradaki adım ne
2. Gerekirse `docs/ARCHITECTURE.md` — tech stack, klasör yapısı, kurallar
3. Gerekirse `docs/DATABASE_SCHEMA.md` — tablo/entity yapısı
4. Gerekirse `docs/ROADMAP.md` — faz bazlı özellik listesi

## Durum
Tech stack: Next.js (App Router, TS) + Supabase (Postgres/Auth/Storage) + Vercel.
Mobil: React Native + Expo. Monorepo yapısı `docs/ARCHITECTURE.md` içinde tanımlı.

## Çalışma kuralları
- Bir modül üzerinde çalışırken sadece o modülün klasörünü ve ilgili docs
  dosyasını oku. Tüm repoyu tarama.
- Görev bitince `docs/PROGRESS.md` dosyasını güncelle: tamamlanan iş,
  session log satırı, sıradaki adım.
- Yeni kütüphane eklemeden, klasör yapısını değiştirmeden, mimari karar
  almadan önce sor / `docs/ARCHITECTURE.md`'yi güncelle.
- Tüm veritabanı tablolarında `tenant_id` zorunlu, RLS politikaları ile
  firma izolasyonu sağlanır (bkz. ARCHITECTURE.md → Multi-Tenant).
- Server Actions tercih edilir, client-side direkt Supabase yazma sadece
  basit okuma/Realtime senaryolarında.
- Build/test komutu: (proje kurulunca buraya yazılacak, örn. `npm run build`,
  `npm run lint`)

## Alt klasör override örneği (ileride eklenebilir)
`apps/mobile/AGENTS.md` — sadece mobil kodla çalışırken devreye girer,
Expo/React Native'e özel kurallar için kullanılabilir.

## PowerShell Komut Kuralı (KRİTİK)

Bu sistemde PowerShell'de `&&` ile komut zincirleme ÇALIŞMAZ. Birden
fazla komutu art arda çalıştırman gerektiğinde, ASLA `&&` kullanma.
Bunun yerine:

- Ayrı komutlar olarak, alt alta çalıştır (her biri ayrı bir tool call)
- VEYA noktalı virgül kullan: `cd apps/web; npm run build`

Yanlış: `cd apps/web && npm run build`
Doğru:  `cd apps/web; npm run build`

KRİTİK KURAL: npm install, npm init, npm run gibi komutları SADECE
apps/web/ klasörünün İÇİNDEYKEN çalıştır. Proje kökünde (D:\restoranim)
ASLA npm komutu çalıştırma, ASLA package.json oluşturma. Her komuttan
önce "pwd" ile hangi klasörde olduğunu doğrula.