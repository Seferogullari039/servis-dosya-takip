import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/events/map-event-row";
import {
  CACHE_TTL,
  alertsCacheKey,
  appCache,
  dashboardCacheKey,
} from "@/lib/cache";
import { EMPTY_ALERTS_FALLBACK } from "@/lib/errors/recovery";
import { measureGuardedQuery, trackCacheHit, trackCacheMiss } from "@/lib/performance/guardrails";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type {
  DashboardPeriod,
  DashboardReportData,
  GecikenDosya,
  GecikmeSeviyesi,
  GrafikVerisi,
  OdemeHareketi,
  OperasyonDashboardData,
  OperasyonMetrikleri,
  FinansMetrikleri,
  PersonelAktiviteOzeti,
  PersonelAktivitesi,
} from "@/types/dashboard";
import { DASHBOARD_PERIODS } from "@/types/dashboard";
import type { ServiceFileEvent } from "@/types/events";
import { mapRowToServisDosya } from "@/lib/data/map-dosya";
import { deriveAlertSummary } from "@/lib/data/operations-summary";
import type { DosyaDurumu, OdemeDurumu, ServisDosyasi } from "@/types/servis-dosya";
import type { ServisDosyasiRow, ServiceFileEventRow, UserRole } from "@/types/supabase";

const ISTANBUL_TZ = "Europe/Istanbul";
const DASHBOARD_EVENTS_LIMIT = 2000;

function startOfDayInTz(date: Date, tz: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

export function getPeriodRange(period: DashboardPeriod): {
  start: Date;
  end: Date;
  days: number;
} {
  const now = new Date();
  const end = now;
  let start: Date;

  if (period === "today") {
    start = startOfDayInTz(now, ISTANBUL_TZ);
    return { start, end, days: 1 };
  }

  const days = period === "7" ? 7 : 30;
  start = new Date(now);
  start.setDate(start.getDate() - days);
  return { start, end, days };
}

function isSameCalendarDay(a: Date, b: Date, tz = ISTANBUL_TZ): boolean {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
  return fmt(a) === fmt(b);
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function gecikmeSeviyesi(gun: number): GecikmeSeviyesi {
  if (gun >= 14) return "kritik";
  if (gun >= 7) return "risk";
  return "normal";
}

function computeOperasyonMetrikleri(
  dosyalar: ServisDosyasi[],
  events: ServiceFileEvent[],
  now: Date
): OperasyonMetrikleri {
  const aktif = dosyalar.filter((d) => d.durum !== "Kapandı");

  const bugunKapananIds = new Set(
    events
      .filter(
        (e) =>
          e.eventType === "status_changed" &&
          isSameCalendarDay(new Date(e.createdAt), now) &&
          e.newValue?.durum === "Kapandı"
      )
      .map((e) => e.serviceFileId)
  );

  return {
    toplamAktif: aktif.length,
    bugunAcilan: dosyalar.filter((d) =>
      isSameCalendarDay(new Date(d.olusturulmaTarihi), now)
    ).length,
    tedarikSurecinde: aktif.filter((d) => d.durum === "Tedarik Sürecinde")
      .length,
    eksperBekleyen: aktif.filter(
      (d) =>
        d.durum === "Eksper Sürecinde" || d.durum === "Evrak Bekleniyor"
    ).length,
    onarimda: aktif.filter((d) => d.durum === "Onarımda").length,
    bugunKapanan: bugunKapananIds.size,
  };
}

function computeFinansMetrikleri(
  dosyalar: ServisDosyasi[],
  paymentEvents: Array<
    ServiceFileEvent & { dosyaNo?: string; plaka?: string }
  >
): FinansMetrikleri {
  const aktif = dosyalar.filter((d) => d.durum !== "Kapandı");

  const sonOdemeHareketleri: OdemeHareketi[] = paymentEvents
    .slice(0, 10)
    .map((e) => ({
      id: e.id,
      serviceFileId: e.serviceFileId,
      dosyaNo: e.dosyaNo ?? "—",
      plaka: e.plaka ?? "—",
      title: e.title,
      description: e.description,
      userFullName: e.userFullName,
      createdAt: e.createdAt,
      yeniOdeme:
        typeof e.newValue?.odeme_durumu === "string"
          ? e.newValue.odeme_durumu
          : undefined,
    }));

  let toplamTahsilat = 0;
  let toplamDosyaTutari = 0;
  let bekleyenTutar = 0;

  for (const d of dosyalar) {
    toplamTahsilat += d.odenenTutar;
    if (d.dosyaTutari != null && d.dosyaTutari > 0) {
      toplamDosyaTutari += d.dosyaTutari;
      const kalan = d.dosyaTutari - d.odenenTutar;
      if (kalan > 0) bekleyenTutar += kalan;
    }
  }

  return {
    odemeBekleyen: aktif.filter(
      (d) =>
        d.durum === "Ödeme Bekleniyor" || d.odemeDurumu === "Ödenmedi"
    ).length,
    kismiOdenen: dosyalar.filter((d) => d.odemeDurumu === "Kısmi Ödendi")
      .length,
    tamamlananOdeme: dosyalar.filter((d) => d.odemeDurumu === "Ödendi")
      .length,
    toplamTahsilat,
    toplamDosyaTutari,
    bekleyenTutar,
    sonOdemeHareketleri,
  };
}

function computeGecikenDosyalar(
  dosyalar: ServisDosyasi[],
  lastStatusByFile: Map<string, string>,
  now: Date
): GecikenDosya[] {
  const aktif = dosyalar.filter((d) => d.durum !== "Kapandı");
  const geciken: GecikenDosya[] = [];

  for (const d of aktif) {
    const statusSinceIso =
      lastStatusByFile.get(d.id) ?? d.olusturulmaTarihi;
    const gun = daysBetween(new Date(statusSinceIso), now);
    const seviye = gecikmeSeviyesi(gun);
    if (seviye === "normal") continue;

    geciken.push({
      id: d.id,
      dosyaNo: d.dosyaNo,
      plaka: d.plaka,
      mevcutDurum: d.durum,
      gunSayisi: gun,
      seviye,
    });
  }

  return geciken.sort((a, b) => {
    const order = { kritik: 0, risk: 1, normal: 2 };
    if (order[a.seviye] !== order[b.seviye]) {
      return order[a.seviye] - order[b.seviye];
    }
    return b.gunSayisi - a.gunSayisi;
  });
}

function computePersonelAktivite(
  events: ServiceFileEvent[],
  profiles: Map<string, { fullName: string; role: UserRole }>,
  now: Date
): PersonelAktiviteOzeti {
  const bugunEvents = events.filter((e) =>
    isSameCalendarDay(new Date(e.createdAt), now)
  );

  const byUser = new Map<string, PersonelAktivitesi>();

  for (const e of events) {
    const profile = profiles.get(e.userId);
    const existing = byUser.get(e.userId) ?? {
      userId: e.userId,
      fullName: profile?.fullName ?? e.userFullName,
      role: profile?.role ?? "personel",
      islemSayisi: 0,
      sonIslemZamani: null as string | null,
    };
    existing.islemSayisi += 1;
    if (
      !existing.sonIslemZamani ||
      e.createdAt > existing.sonIslemZamani
    ) {
      existing.sonIslemZamani = e.createdAt;
    }
    byUser.set(e.userId, existing);
  }

  return {
    bugunIslemSayisi: bugunEvents.length,
    kullanicilar: Array.from(byUser.values()).sort(
      (a, b) => b.islemSayisi - a.islemSayisi
    ),
  };
}

function computeGrafikler(
  dosyalar: ServisDosyasi[],
  periodDays: number,
  now: Date
): GrafikVerisi {
  const aktif = dosyalar.filter((d) => d.durum !== "Kapandı");

  const durumMap = new Map<string, number>();
  for (const d of aktif) {
    durumMap.set(d.durum, (durumMap.get(d.durum) ?? 0) + 1);
  }

  const odemeMap = new Map<string, number>();
  for (const d of dosyalar) {
    odemeMap.set(d.odemeDurumu, (odemeMap.get(d.odemeDurumu) ?? 0) + 1);
  }

  const gunluk: { tarih: string; adet: number }[] = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const label = new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      timeZone: ISTANBUL_TZ,
    }).format(day);
    const adet = dosyalar.filter((d) =>
      isSameCalendarDay(new Date(d.olusturulmaTarihi), day)
    ).length;
    gunluk.push({ tarih: label, adet });
  }

  return {
    durumDagilimi: Array.from(durumMap.entries()).map(([name, value]) => ({
      name,
      value,
    })),
    odemeDagilimi: Array.from(odemeMap.entries()).map(([name, value]) => ({
      name,
      value,
    })),
    gunlukAcilanDosya: gunluk,
  };
}

function buildLastStatusMap(
  statusEvents: ServiceFileEvent[]
): Map<string, string> {
  const map = new Map<string, string>();
  const sorted = [...statusEvents].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  for (const e of sorted) {
    if (!map.has(e.serviceFileId)) {
      map.set(e.serviceFileId, e.createdAt);
    }
  }
  return map;
}

type EventRowJoined = ServiceFileEventRow & {
  profiles: { full_name: string; role: UserRole } | null;
  servis_dosyalari?: { dosya_no: string; plaka: string } | null;
};

async function fetchDashboardAggregation(
  period: DashboardPeriod
): Promise<DataResult<OperasyonDashboardData>> {
  try {
    const supabase = await createClient();
    const { start, days } = getPeriodRange(period);
    const now = new Date();
    const startIso = start.toISOString();

    const [dosyalarRes, eventsRes] = await Promise.all([
      supabase.from("servis_dosyalari").select("*"),
      supabase
        .from("service_file_events")
        .select(
          `
          *,
          profiles:user_id ( full_name, role ),
          servis_dosyalari:service_file_id ( dosya_no, plaka )
        `
        )
        .order("created_at", { ascending: false })
        .limit(DASHBOARD_EVENTS_LIMIT),
    ]);

    if (dosyalarRes.error) return fail(dosyalarRes.error.message);
    if (eventsRes.error) return fail(eventsRes.error.message);

    const dosyalar = (dosyalarRes.data ?? []).map(mapRowToServisDosya);
    const allEventRows = (eventsRes.data ?? []) as EventRowJoined[];

    const profileMap = new Map<
      string,
      { fullName: string; role: UserRole }
    >();
    for (const row of allEventRows) {
      if (row.profiles && row.user_id) {
        profileMap.set(row.user_id, {
          fullName: row.profiles.full_name,
          role: row.profiles.role as UserRole,
        });
      }
    }

    const allEvents = allEventRows.map(mapEventRow);
    const periodEvents = allEvents.filter(
      (e) => e.createdAt >= startIso
    );

    const statusEventsForDelay = allEvents.filter(
      (e) => e.eventType === "status_changed"
    );
    const lastStatusByFile = buildLastStatusMap(statusEventsForDelay);

    const paymentEvents = allEventRows
      .filter((row) => row.event_type === "payment_changed")
      .map((row) => {
        const ev = mapEventRow(row);
        const dosyaMeta = row.servis_dosyalari;
        return {
          ...ev,
          dosyaNo: dosyaMeta?.dosya_no,
          plaka: dosyaMeta?.plaka,
        };
      });

    const operasyon = computeOperasyonMetrikleri(dosyalar, periodEvents, now);
    const finans = computeFinansMetrikleri(dosyalar, paymentEvents);
    const gecikenDosyalar = computeGecikenDosyalar(
      dosyalar,
      lastStatusByFile,
      now
    );
    const personel = computePersonelAktivite(periodEvents, profileMap, now);
    const sonAktiviteler = periodEvents.slice(0, 15);
    const grafikler = computeGrafikler(dosyalar, days, now);

    const periodLabel =
      DASHBOARD_PERIODS.find((p) => p.value === period)?.label ?? period;

    const report: DashboardReportData = {
      period,
      periodLabel,
      generatedAt: now.toISOString(),
      operasyon,
      finans,
      gecikenDosyalar,
      personel,
      sonAktiviteler,
      grafikler,
    };

    return ok({
      period,
      dosyalar,
      operasyon,
      finans,
      gecikenDosyalar,
      personel,
      sonAktiviteler,
      grafikler,
      report,
    });
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Dashboard verileri yüklenemedi."
    );
  }
}

export async function getOperasyonDashboard(
  period: DashboardPeriod = "7"
): Promise<DataResult<OperasyonDashboardData>> {
  const key = dashboardCacheKey(period);
  const cached = appCache.get<DataResult<OperasyonDashboardData>>(key);
  if (cached) {
    trackCacheHit(key);
    return cached;
  }
  trackCacheMiss(key);

  const result = await measureGuardedQuery(
    `dashboard:${period}`,
    () => fetchDashboardAggregation(period),
    1500
  );

  if (result.ok) {
    appCache.set(key, result, CACHE_TTL.dashboard);
  }

  return result;
}

/** PDF / dış raporlar için */
export async function getDashboardReportData(
  period: DashboardPeriod = "7"
): Promise<DataResult<DashboardReportData>> {
  const result = await getOperasyonDashboard(period);
  if (!result.ok) return result;
  return ok(result.data.report);
}

export async function getCachedAlertSummary(): Promise<
  import("@/types/operations").AlertSummary
> {
  const key = alertsCacheKey();
  const cached = appCache.get<
    import("@/types/operations").AlertSummary
  >(key);
  if (cached) {
    trackCacheHit(key);
    return cached;
  }
  trackCacheMiss(key);

  const result = await getOperasyonDashboard("7");
  if (!result.ok) {
    return EMPTY_ALERTS_FALLBACK;
  }

  const summary = deriveAlertSummary(result.data);
  appCache.set(key, summary, CACHE_TTL.alerts);
  return summary;
}
