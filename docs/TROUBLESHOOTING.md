# Troubleshooting Guide

## Giriş yapamıyorum

1. Supabase Auth → Email provider etkin mi?
2. `.env.local` URL ve anon key doğru mu?
3. `profiles.is_active = true` mi?

## Dashboard yüklenmiyor

**Kullanıcı görür:** "Dashboard şu an yüklenemiyor"

**Kontrol:**
1. Supabase bağlantısı
2. Migration'lar (001–007) uygulandı mı?
3. Server log: `[error] dashboard route error`
4. Dev'de `[warn] query threshold exceeded` — yavaş query

**Çözüm:** Sayfayı yenile; devam ederse Supabase status kontrol edin.

## Dosya güncellenmiyor

| Mesaj | Neden | Çözüm |
|-------|-------|-------|
| Sistem güncelleme modu kapalı | `FEATURE_FREEZE_MODE=true`, personel | Admin ile iletişim |
| Salt-okunur mod | `READONLY_MODE=true` | Env kaldır |
| Yetkiniz yok | Kapandı / eksper, personel | Admin gerekli |
| Bu dosya numarası zaten kayıtlı | Duplicate dosya_no | Farklı numara |

## Timeline'da event yok

1. Event RPC hatası — server log `[warn] event validation failed`
2. Idempotency — 5s içinde duplicate click atlandı (normal)
3. Audit partial failure — `console.warn [audit]`

## Cache tutarsızlığı

- Multi-instance'da memory cache paylaşılmaz
- Çözüm: Redis adapter veya TTL kısaltma
- Mutation sonrası `invalidateDashboardCache()` otomatik çalışır

## Yavaş dashboard

1. Cache miss — ilk yükleme normal
2. Çok dosya (>5k) — full table scan darboğaz
3. Dev log: query >800ms uyarı

## Bulk işlem başarısız

1. `SAFE_MODE=true` — bulk kapalı
2. Feature freeze — personel bulk yapamaz
3. Kısmi başarı — toast'ta updated/failed sayısı

## PDF oluşturulamıyor

1. Oturum süresi dolmuş — tekrar giriş
2. `@react-pdf/renderer` server-side — build log kontrol
3. Font CDN erişimi

## Evrak yüklenemiyor

1. Format: PDF, JPG, PNG, WEBP
2. Boyut: PDF 15MB, görsel 10MB
3. Storage bucket `service-documents` ve RLS

## Hata mesajları (teknik → kullanıcı)

Uygulama `toUserFriendlyError()` ile teknik hataları sadeleştirir.  
Production'da ham stack trace kullanıcıya gösterilmez.

## Destek bilgisi toplama

1. Tarayıcı + saat
2. Kullanıcı rolü
3. İlgili dosya ID
4. Server log (LOG_LEVEL=warn)
5. `runProductionFinalCheck()` çıktısı (admin)
