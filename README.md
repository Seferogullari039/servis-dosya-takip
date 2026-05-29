# Servis Dosya Takip

Araç servis dosyalarını plaka veya dosya numarası ile hızlıca bulmak için personel paneli.

## Teknolojiler

- Next.js 15 (App Router, Server Components)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS)

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase migration'ları (sırayla)

SQL Editor'da şu dosyaları **sırayla** çalıştırın:

1. `supabase/migrations/001_servis_dosyalari.sql`
2. `supabase/migrations/002_profiles_and_auth.sql`
3. `supabase/migrations/003_servis_dosyalari_auth_rls.sql`
4. `supabase/migrations/004_service_file_events.sql`
5. `supabase/migrations/005_service_file_documents.sql`
6. `supabase/migrations/006_storage_service_documents.sql`
7. `supabase/migrations/007_dashboard_indexes.sql`

(İsteğe bağlı veri) `supabase/seed.sql`  
(İsteğe bağlı timeline) `supabase/seed_events.sql`  
(İsteğe bağlı evrak metadata) `supabase/seed_documents.sql`

### 3. Ortam değişkenleri

```bash
copy .env.example .env.local
```

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Proje URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — **sadece sunucu**, asla client'a vermeyin |
| `SEED_ADMIN_EMAIL` | Dev admin e-posta (opsiyonel) |
| `SEED_ADMIN_PASSWORD` | Dev admin şifre (opsiyonel) |

Supabase Dashboard → **Authentication → Providers** → Email etkin olsun.

### 4. Development admin kullanıcı

**CLI:**

```bash
npm run seed:admin
```

**veya HTTP (dev sunucusu çalışırken):**

```bash
curl -X POST http://localhost:3000/api/dev/seed-admin
```

Varsayılan: `admin@servis.local` / `Admin123!`

### 5. Çalıştırma

```bash
npm run dev
```

Giriş: **http://localhost:3000/login**

## Operasyon Dashboard

- Veri katmanı: `src/lib/data/dashboard.ts`
- Filtreler: bugün / 7 gün / 30 gün (`?period=today|7|30`)
- Metrikler: operasyon + finans + geciken dosyalar + personel aktivitesi
- Grafikler: recharts (durum, ödeme, günlük açılan)
- PDF rapor verisi: `getDashboardReportData()`

## PDF çıktı

- Teknoloji: **@react-pdf/renderer** (server-side, A4)
- Font: **Roboto latin-ext** (Türkçe karakter)
- API: `GET /api/pdf/summary/[id]`, `GET /api/pdf/operation/[id]`
- Dosya adı: `servis-dosyasi-{dosyaNo}.pdf` / `servis-dosyasi-{dosyaNo}-operasyon.pdf`
- Detay sayfası → **PDF Oluştur** (önizleme + indirme)

## Evrak yükleme

- Tablo: `service_file_documents` (soft delete: `deleted_at`)
- Storage bucket: `service-documents` (private)
- Formatlar: PDF, JPG, JPEG, PNG, WEBP
- Limitler: PDF 15 MB, görsel 10 MB
- Detay sayfası → **Evraklar** sekmesi

## Hareket geçmişi (Timeline)

- Tablo: `service_file_events` (audit log)
- Olaylar: oluşturma, güncelleme, durum/ödeme/not/eksper değişiklikleri
- Dosya detay sayfasında zaman sıralı panel (en yeni üstte)
- Insert yalnızca `insert_service_file_event` RPC ile (manuel silme yok)

## Auth

- E-posta / şifre (Supabase Auth)
- Middleware korumalı rotalar: `/`, `/dosyalar`, `/dosyalar/yeni`, `/dosyalar/[id]`
- Roller: `admin`, `personel` (`profiles` tablosu)
- Yeni kullanıcı → trigger ile otomatik `profiles` kaydı

## Operasyon Hızlandırma (Quick Actions)

Dosya detayına girmeden liste ve dashboard üzerinden hızlı operasyon.

| Bileşen | Konum |
|---------|--------|
| Quick Actions | `src/components/operations/QuickActions.tsx` |
| Inline tablo | `src/components/operations/DosyaListesiClient.tsx` |
| Toplu işlemler | `src/components/operations/BulkActionsBar.tsx` |
| Bugünün görevleri | `src/components/dashboard/TodayTasks.tsx` |
| Uyarı paneli | `src/components/operations/AlertsPanel.tsx` (TopBar) |
| Server actions | `src/app/(dashboard)/dosyalar/actions.ts` |

**Aksiyonlar:** durum değiştir, ödeme durumu, not ekle, eksper değiştir (admin).

**UX:** optimistic update, hata durumunda rollback, toast bildirimi, hover ile inline butonlar (masaüstü), mobil bottom sheet + swipe durum değiştirme.

**Güvenlik:** `Kapandı` durumu ve eksper değişikliği yalnızca admin; diğer işlemler admin + personel.

**Uyarı kuralları:** 7+ gün risk, 14+ gün kritik, ödeme gecikmesi — TopBar badge.

**Performans:** `memo` ile satır bazlı re-render, `revalidatePath` ile cache invalidation.

## Sistem Stabilizasyonu

- **Cache:** `src/lib/cache/` — abstraction layer (memory + Redis stub)
- **Event idempotency:** `src/lib/events/idempotency.ts` — 5s dedup window
- **Event finalization:** `src/lib/events/finalization.ts` — schema freeze, validation
- **Dashboard aggregation:** 4 query → 2 query, TTL cache 30s
- **Error recovery:** `src/lib/errors/recovery.ts` — retry + graceful fallback
- **Logging:** `src/lib/logging/` — levels, sensitive data masking
- **Deployment:** `src/lib/deploy/checklist.ts` — env validation, health helpers
- **System freeze:** `src/lib/system/freeze.ts` — READONLY_MODE, SAFE_MODE
- **Guardrails:** query timing threshold, cache hit/miss tracking (dev)

Detaylı mimari: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Ürünleştirme (Productization)

- **Feature freeze:** `src/lib/system/feature-freeze.ts` — `FEATURE_FREEZE_MODE=true`, admin override
- **UX sadeleştirme:** 3 ana aksiyon (durum, detay, not) + "Diğer" menüsü
- **Dashboard:** Bugünün görevleri + 4 özet metrik; detaylar collapsible
- **Sidebar:** Dashboard + Dosyalar (Yeni Dosya → liste sayfası butonu)
- **Hata mesajları:** Kullanıcı dostu (`src/lib/errors/user-messages.ts`)
- **Final check:** `src/lib/deploy/production-final-check.ts`

Kılavuzlar:

- [Production kullanım](docs/PRODUCTION-USAGE.md)
- [Admin rehberi](docs/ADMIN-GUIDE.md)
- [Sorun giderme](docs/TROUBLESHOOTING.md)

## Production ortam değişkenleri (opsiyonel)

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `LOG_LEVEL` | `warn` (prod) | Log seviyesi |
| `CACHE_BACKEND` | `memory` | `redis` — gelecek multi-instance |
| `READONLY_MODE` | `false` | Salt-okunur acil durum modu |
| `SAFE_MODE` | `false` | Bulk işlemleri devre dışı bırakır |
| `FEATURE_FREEZE` | `false` | Production lock flag (legacy) |
| `FEATURE_FREEZE_MODE` | `false` | Ürün dondurma — personel yazmaları kapalı, admin devam |

## Sayfalar

| Sayfa | Yol |
|-------|-----|
| Giriş | `/login` |
| Dashboard | `/` |
| Dosya listesi | `/dosyalar` |
| Yeni dosya | `/dosyalar/yeni` |
| Detay | `/dosyalar/[id]` |
