# Production Usage Guide

## Günlük operasyon akışı

1. **Giriş** — `/login` (e-posta / şifre)
2. **Dashboard** — Bugünün görevleri + 4 özet metrik
3. **Dosyalar** — Liste üzerinden durum değiştir, not ekle, detaya git
4. **Detay** — Timeline, evrak, PDF (gerektiğinde)

## Sık kullanılan işlemler

| İşlem | Nerede | Nasıl |
|-------|--------|-------|
| Durum değiştir | `/dosyalar` | Satırdaki durum seçici |
| Not ekle | `/dosyalar` | "Not ekle" butonu |
| Detay gör | `/dosyalar` | "Detay" linki |
| Ödeme / eksper | `/dosyalar` | "Diğer" menüsü |
| Yeni dosya | `/dosyalar` | Sağ üst "+ Yeni Dosya" |

## Ortam değişkenleri (production)

```env
NODE_ENV=production
LOG_LEVEL=warn
FEATURE_FREEZE_MODE=true   # personel yazma işlemlerini kapatır; admin devam eder
CACHE_BACKEND=memory
```

## Performans beklentileri

- Dashboard ilk yükleme: ~2 Supabase query (cache miss)
- Sonraki yüklemeler (30s): cache hit, 0 query
- Dosya listesi: 1 query

## Feature freeze modu

`FEATURE_FREEZE_MODE=true` iken:

- **Personel:** okuma, arama, PDF — yazma kapalı
- **Admin:** tüm işlemler açık

Mesaj: *"Sistem güncelleme modu kapalı — … Yöneticinize başvurun."*

## Acil modlar

| Mod | Env | Etki |
|-----|-----|------|
| Readonly | `READONLY_MODE=true` | Tüm yazmalar kapalı (admin dahil) |
| Safe mode | `SAFE_MODE=true` | Bulk işlemler kapalı |
| Feature freeze | `FEATURE_FREEZE_MODE=true` | Personel yazmaları kapalı |

## Deployment sonrası smoke test

1. Login (admin + personel)
2. Dashboard yükleniyor mu?
3. Dosya listesi → durum değiştir → timeline event
4. Feature freeze açıkken personel yazma engelleniyor mu?
5. `npm run build` başarılı mı?
