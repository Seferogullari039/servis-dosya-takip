# Admin Guide

## Roller

| Rol | Yetkiler |
|-----|----------|
| **admin** | Tüm işlemler, Kapandı durumu, eksper değişikliği, feature freeze override |
| **personel** | Durum/ödeme/not (Kapandı hariç), liste ve detay okuma |

## Kullanıcı yönetimi

Supabase Dashboard → **Authentication → Users** ile kullanıcı ekleyin.  
`profiles` tablosu trigger ile otomatik oluşur; rol güncellemesi:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

## Feature freeze (ürün dondurma)

Production'da yeni feature deploy edilmeden önce:

```env
FEATURE_FREEZE_MODE=true
```

- Personel yazma işlemleri bloklanır
- Admin operasyonları devam eder
- Okuma, arama, PDF export çalışır

Kapatmak için: `FEATURE_FREEZE_MODE=false` veya env kaldırın.

## Acil salt-okunur mod

Veri bütünlüğü şüphesi veya bakım:

```env
READONLY_MODE=true
```

Tüm create/update durur (admin dahil).

## Cache yönetimi

- TTL: 30 saniye (dashboard + alerts)
- Mutation sonrası otomatik invalidation
- Multi-instance: `CACHE_BACKEND=redis` + `REDIS_URL` (adapter stub — implementasyon gerekli)

## Tutarlılık kontrolü

```typescript
import { checkDataConsistency } from "@/lib/data/consistency";
import { runProductionFinalCheck } from "@/lib/deploy/production-final-check";
```

- Orphan event tespiti
- Cache hit/miss raporu
- Event schema audit

## Production final check

```typescript
const report = await runProductionFinalCheck();
console.log(report.readiness.score, report.cache, report.events);
```

## Deployment checklist

`src/lib/deploy/checklist.ts` → `DEPLOYMENT_CHECKLIST`

## Seed admin (sadece development)

```bash
npm run seed:admin
```

Production'da `/api/dev/seed-admin` devre dışı bırakın veya erişimi kısıtlayın.

## PDF ve evrak

- PDF: detay sayfası → PDF Oluştur
- Evrak: detay → Evraklar sekmesi
- Storage bucket: `service-documents` (private)

## Log seviyesi

Production: `LOG_LEVEL=warn`  
Development: `LOG_LEVEL=debug` (query timing + event debug)
