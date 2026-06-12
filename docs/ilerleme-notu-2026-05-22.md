# İlerleme Notu — 22 Mayıs 2026

Yarın / sonraki oturumda kaldığımız yer. **Working tree:** yalnızca bu not dosyası (ve eski `ilerleme-notu-2026-06-04.md`) commit dışı olabilir; kod **main** üzerinde push edildi.

---

## Son commit’ler (GitHub `main`)

| Hash | Mesaj |
|------|--------|
| `8b7b8b3` | `feat: add total loss workflow statuses` |
| `179b806` | `feat: improve corporate site and security` |
| `5f7a5c0` | `fix file creation insurance parser import` |
| `ded0c27` | `feat: add corporate landing page` |

Repo: `https://github.com/Seferogullari039/servis-dosya-takip`

---

## Bu oturumda tamamlananlar

### Kurumsal site (`/`)

- Ana sayfa: Hero, Hizmetler, Süreç, İletişim, Hakkımızda
- Panel girişi `/login`; panel özeti `/ozet`
- İletişim: telefon, WhatsApp, adres, Google Maps iframe
- Harita tıklama + **Haritada Aç** → `https://maps.app.goo.gl/6kHXwkdsNVmnN9Sy9`
- `src/lib/corporate-site.ts`, `CorporateLanding.tsx`

### Güvenlik (HTTP headers)

- `src/lib/security/security-headers.ts` + `next.config.ts` `headers()`
- CSP (Supabase, Firebase, Google Maps), HSTS, X-Frame-Options, vb.
- Brute-force / audit / RLS’e dokunulmadı

### Dosya oluşturma düzeltmesi (`5f7a5c0`)

- `parseSigortaSirketiFromForm` → `src/lib/dosyalar/sigorta-sirketi-form.ts` (server-safe)
- Create sonrası `redirect()` kaldırıldı; client `router.push(/dosyalar/{id})`
- `(dashboard)/error.tsx` → `isRedirectError` re-throw

### Pert (total loss) dosya durumları (`8b7b8b3`)

- **Pert İncelemesinde** (turuncu/kahverengi badge)
- **Pert Onaylandı** (kırmızı badge)
- Dropdown, detay, Dosya Özeti metrikleri, Operasyon Merkezi KPI, uyarılar paneli
- `/dosyalar?durum=Pert%20İncelemesinde` filtre
- Push bildirim etiketleri güncellendi

### Güvenlik kontrolü (sadece rapor)

- Canlıda tam CSP seti kodda yoktu; Vercel HSTS; local 500 çoğunlukla `.next` cache

### Local Internal Server Error teşhisi

- Kök neden: **bozuk / karışık `.next`** (`Cannot find module './5611.js'`, `routes-manifest.json` ENOENT)
- Çözüm: `npm run dev:clean` veya `node scripts/clean-next.mjs` + **yalnızca** `npm run dev`
- **`npm run build` ile `npm run dev` aynı anda kullanma**

---

## Veritabanı / migration

| Migration | Durum |
|-----------|--------|
| **019** | audit_logs, login_attempts (önceden) |
| **022** | `servis_dosyalari_pert_durumlari.sql` — **Supabase SQL Editor’da deploy edildi** (kullanıcı onayı) |

022 içeriği: `durum` CHECK — 10 izinli değer (pert dahil). Mevcut satırlar değiştirilmedi.

---

## Canlı

- Domain: `www.seferogullari.com` (kurumsal `/`, panel `/login` → `/ozet`)
- Vercel: `main` push sonrası otomatik deploy
- Security headers: deploy sonrası Network sekmesinden doğrulanmalı

---

## Local test kuralı (önemli)

1. Dev süreçlerini kapat: `node scripts/kill-dev-ports.mjs`
2. Önbellek: `node scripts/clean-next.mjs` veya `npm run dev:clean`
3. **Sadece** `npm run dev` (build ile dev karıştırma)
4. Port: terminalde yazan (genelde 3000)
5. Giriş: `admin@servis.local` / `Admin123!`

---

## Önemli dosya yolları

| Konu | Dosya |
|------|--------|
| Durum enum | `src/types/servis-dosya.ts` |
| Badge | `src/components/dosyalar/DurumBadge.tsx` |
| Dashboard metrik | `src/lib/data/dashboard.ts` |
| Uyarılar | `src/lib/data/operations-summary.ts`, `AlertsPanel.tsx` |
| Security headers | `src/lib/security/security-headers.ts` |
| Kurumsal harita | `src/lib/corporate-site.ts` |
| Dev cache guard | `scripts/ensure-next-cache.mjs`, `scripts/dev.mjs` |
| Migration 022 | `supabase/migrations/022_servis_dosyalari_pert_durumlari.sql` |

---

## Açık / ertelenen konular

- **Dashboard local** “Veriler geçici olarak alınamadı” — ayrı oturumda (DB/env), pert işinde dokunulmadı
- `docs/ilerleme-notu-2026-06-04.md` — eski not (XLSX fazı); arşiv
- `metadataBase` uyarısı build’de (`NEXT_PUBLIC_SITE_URL` opsiyonel)
- Firebase SW prebuild: localde env eksik uyarısı (push prod’da env gerekir)

---

## Sonraki oturumda yapılabilecekler

1. Canlıda pert durumu seç → kaydet → badge + uyarı sayacı doğrula
2. Canlı security headers (7 başlık) kontrol
3. Dashboard local veri hatası kök neden (Supabase / RLS / env)
4. İstenirse: `docs/ilerleme-notu-*.md` commit veya tek `ilerleme-notu.md` birleştirme

---

*Son güncelleme: oturum sonu — `git log -1` → `8b7b8b3`*
