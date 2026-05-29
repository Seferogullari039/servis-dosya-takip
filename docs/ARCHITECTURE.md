# Sistem Mimarisi

## Katmanlar

```
┌─────────────────────────────────────────────────────────┐
│  UI (React Server + Client Components)                  │
│  — değişiklik yok, mevcut dashboard/dosyalar/detay      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Server Actions (dosyalar/actions.ts)                     │
│  — auth, freeze checks, cache invalidation                │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Data Layer (lib/data/*)                                │
│  — dashboard aggregation, dosyalar, events, documents     │
└──────┬───────────────────────────────┬──────────────────┘
       │                               │
┌──────▼──────┐                 ┌──────▼──────┐
│ Cache       │                 │ Events      │
│ lib/cache   │                 │ lib/events  │
│ (memory →   │                 │ idempotency │
│  redis)     │                 │ finalization│
└─────────────┘                 └─────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│ Supabase (PostgreSQL + Auth + Storage + RLS)            │
└─────────────────────────────────────────────────────────┘
```

## Production modülleri

| Modül | Yol | Amaç |
|-------|-----|------|
| Cache abstraction | `src/lib/cache/` | Memory + future Redis adapter |
| Event finalization | `src/lib/events/finalization.ts` | Schema freeze, validation |
| Query optimization | `src/lib/queries/optimization-plan.ts` | Hot path profiling |
| Error recovery | `src/lib/errors/recovery.ts` | Retry, fallback, degradation |
| Logging | `src/lib/logging/` | Levels, masking, dev/prod split |
| Deployment | `src/lib/deploy/` | Env validation, checklist, readiness |
| System freeze | `src/lib/system/freeze.ts` | Readonly, safe mode, feature freeze |
| Guardrails | `src/lib/performance/guardrails.ts` | Query timing, cache tracking |

## Veri akışı (Dashboard)

1. `getOperasyonDashboard(period)` → cache check (`appCache`)
2. Miss → 2 Supabase query (dosyalar + events)
3. In-memory aggregation → metrics, charts, geciken
4. `deriveTodayTasksData` / `deriveAlertSummary` — ek query yok

## Ortam değişkenleri (production)

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Supabase proje URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet | Sunucu only |
| `LOG_LEVEL` | Hayır | `debug` \| `info` \| `warn` \| `error` (prod: `warn`) |
| `CACHE_BACKEND` | Hayır | `memory` (default) \| `redis` (future) |
| `READONLY_MODE` | Hayır | `true` → tüm yazma işlemleri blok |
| `SAFE_MODE` | Hayır | `true` → bulk işlemler blok |
| `FEATURE_FREEZE` | Hayır | `true` → production lock flag |

## Ölçekleme sınırları (mevcut)

- **Tek instance:** ~50 eşzamanlı kullanıcı, ~5k dosya — sorunsuz
- **Multi-instance:** Redis cache gerekli (`CACHE_BACKEND=redis`)
- **>5k dosya:** Dashboard full-scan darboğaz — SQL aggregate RPC önerilir
- **>500k event:** Events tablosu archive policy gerekli

## Production deployment

```bash
# 1. Env doğrulama (CI'da)
node -e "const {runBuildSafetyChecks}=require('./dist/...')" # veya build sonrası

# 2. Build
npm run build

# 3. Start
npm start
```

Checklist: `src/lib/deploy/checklist.ts` → `DEPLOYMENT_CHECKLIST`

Readiness raporu: `generateProductionReadinessReport()` in `src/lib/deploy/readiness.ts`
