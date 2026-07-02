# ROADMAP.md — Fazlara Bölünmüş Geliştirme Planı

> Her faz, önceki fazın üzerine inşa edilecek şekilde sıralanmıştır.
> Bir faz tamamlanmadan sonrakine geçilmesi önerilmez (yarım kalan altyapı
> üzerine özellik eklemek teknik borç yaratır).

## Faz 0 — Temel Kurulum
- [ ] Monorepo iskeleti (`apps/web`, `apps/mobile`, `packages/shared`)
- [ ] Supabase projesi oluşturma
- [ ] `docs/DATABASE_SCHEMA.md` tamamlanması ve ilk migration'ların yazılması
- [ ] Next.js proje kurulumu, Tailwind + shadcn/ui kurulumu
- [ ] Subdomain middleware (tenant çözümleme) iskeleti

## Faz 1 — Süper Admin ve Firma Yönetimi
- [ ] Süper Admin girişi (`restoranim.com`)
- [ ] Firma (tenant) oluşturma, subdomain atama
- [ ] Firma Admin kullanıcısı oluşturma ve davet akışı
- [ ] Süper Admin: abonelik/plan görünümü (temel, mali detay Faz 8'de derinleşecek)

## Faz 2 — Firma Admin Temel Yönetim
- [ ] Bölge Müdürü ekleme (ad, telefon, e-posta, kullanıcı hesabı)
- [ ] Restoran ekleme (ad, adres, e-posta, müdür/müdür yrd. bilgisi, personel
      sayısı, bağlı bölge müdürü/müdürleri — çoklu atama desteklenmeli)
- [ ] Firma logosu yükleme
- [ ] Restoran ↔ Bölge Müdürü atama ekranı (çoklu atama desteği)

## Faz 3 — ODZ Form Builder
- [ ] Bölüm/kategori oluşturma ve sıralama (bölge müdürü yetkisiyle)
- [ ] Soru ekleme (tip: Uygun/Uygun Değil/Değ. Dışı, metin, fotoğraf, sayısal)
- [ ] Her soru için zorunlu/opsiyonel + fotoğraf zorunlu/opsiyonel ayarı
- [ ] Soru/bölüm sıralama, pasif alma, silme
- [ ] Restoran bazlı özel veri alanları tanımlama (ciro, tabak sayısı vb. —
      manuel giriş şablonu)

## Faz 4 — Personel Modülü
- [ ] Firma Admin: personel kart alanlarını tanımlama (dinamik alan editörü)
- [ ] Restoran Müdürü: personel ekleme/güncelleme, belge yükleme (SGK,
      sağlık/portör raporu, hijyen belgesi)
- [ ] Çıkış tarihi girilen personelin otomatik pasife düşmesi
- [ ] Eksik alan/belge tespiti → bildirim tetikleme

## Faz 5 — ODZ Ziyaret Akışı (Web)
- [ ] Bölge Müdürü: restoran seçip yeni ziyaret başlatma
- [ ] Form doldurma ekranı (bölüm bölüm, soru bazlı)
- [ ] Fotoğraf galerisi: o güne ait tüm fotoğraflardan seçip soruya bağlama
- [ ] Taslak kaydetme (yarım kalan ziyaret)
- [ ] "Uygun Değil" maddelerde "Aksiyona Ekle" tik kutusu
- [ ] Önceki ziyaretteki açık maddelerin otomatik hatırlatılması
- [ ] Ziyaret tamamlama ve kilitleme

## Faz 6 — Mobil Uygulama (Bölge Müdürü)
- [ ] Giriş (kullanıcı adı/parola)
- [ ] Atanan restoran listesi
- [ ] Ziyaret başlat → kamera ile fotoğraf çekimi → offline kuyruk + senkronizasyon
- [ ] Restoran bilgisi görüntüleme (ciro, personel, geçmiş aksiyonlar)
- [ ] Aksiyon onaylama ekranı

## Faz 7 — Mobil Uygulama (Restoran Müdürü)
- [ ] Giriş, kendi restoran paneli
- [ ] Açık aksiyon listesi görüntüleme
- [ ] Aksiyon tamamlama (fotoğraf + açıklama) → bölge müdürü onayına gönderme
- [ ] Personel ekleme/güncelleme (mobilden de)
- [ ] Bildirimler (eksik evrak, yeni ODZ raporu, aksiyon onay/red)

## Faz 8 — Aksiyon Takip Paneli (Web, her iki rol için)
- [ ] Açık / onay bekleyen / tamamlanan aksiyon listeleri
- [ ] "Bu ay alınan aksiyonlar" sekmesi
- [ ] Kaç gündür açık / kaç kez tekrarlandı metrikleri
- [ ] Dashboard özet görünümü

## Faz 9 — Raporlama, PDF ve Bildirim
- [ ] PDF şablonu (firma logosu + özelleştirilebilir renk/başlık sırası)
- [ ] "Bilgilendir" butonu → otomatik e-posta (restoran + sınırsız ek alıcı)
- [ ] Push bildirim altyapısı
- [ ] SMS altyapısı (varsayılan pasif, firma sağlayıcı tanımlayınca aktif)

## Faz 10 — Süper Admin İş Paneli (Derin)
- [ ] Firma bazlı gelir/gider takibi
- [ ] Abonelik planı yönetimi, ödeme takibi
- [ ] Teknik destek kaydı modülü
- [ ] Performans/kullanım metrikleri (firma bazlı aktiflik vb.)

## Faz 11 — Entegrasyonlar (İleri Seviye, Opsiyonel)
- [ ] POS sistemleri ile API/SQL entegrasyonu (ciro, tabak sayısı otomatik çekimi)
- [ ] Google Business Profile API — puan/yorum otomatik çekimi
- [ ] Hijyen skoru için harici sağlık kuruluşu veri girişi standardizasyonu
