import { mapRowToIsEmriOzet } from "@/lib/data/map-work-order";
import { getOperasyonDashboard } from "@/lib/data/dashboard";
import { listeleTedarikParcalari } from "@/lib/data/tedarik";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type {
  OpsBoardColumn,
  OpsBoardItem,
  OpsCenterCharts,
  OpsCenterDashboardData,
  OpsCenterKpis,
} from "@/types/ops-center-dashboard";
import {
  ARAC_DURUMLARI,
  type AracDurumu,
} from "@/types/vehicle-status";
import { TEDARIK_DURUMLARI } from "@/types/tedarik";
import type { WorkOrderRow } from "@/types/supabase";

const ISTANBUL_TZ = "Europe/Istanbul";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    timeZone: ISTANBUL_TZ,
  }).format(date);
}

function buildKpis(
  workOrders: WorkOrderRow[],
  aktifDosya: number,
  tahsilatBekleyen: number,
  pertIncelemesinde: number,
  pertOnaylandi: number
): OpsCenterKpis {
  const today = todayIso();
  let parcaBekleyen = 0;
  let hazirTeslim = 0;
  let bugunTeslimEdilecek = 0;
  let acikIsEmirleri = 0;

  for (const row of workOrders) {
    const status = row.vehicle_status as AracDurumu;
    if (status !== "Teslim Edildi") acikIsEmirleri++;
    if (status === "Parça Bekleniyor") parcaBekleyen++;
    if (status === "Hazır") {
      hazirTeslim++;
      if (row.entry_date === today) bugunTeslimEdilecek++;
    }
  }

  return {
    acikIsEmirleri,
    parcaBekleyen,
    hazirTeslim,
    bugunTeslimEdilecek,
    aktifDosya,
    tahsilatBekleyen,
    pertIncelemesinde,
    pertOnaylandi,
  };
}

function buildColumns(
  gecikenItems: OpsBoardItem[],
  workOrders: WorkOrderRow[],
  tahsilatItems: OpsBoardItem[]
): OpsBoardColumn[] {
  const parcaItems: OpsBoardItem[] = workOrders
    .filter((r) => r.vehicle_status === "Parça Bekleniyor")
    .slice(0, 12)
    .map((row) => {
      const ozet = mapRowToIsEmriOzet(row);
      return {
        id: ozet.id,
        title: ozet.plaka,
        subtitle: ozet.musteriAdi,
        meta: ozet.isEmriNo,
        href: `/is-emirleri/${ozet.id}`,
      };
    });

  const hazirItems: OpsBoardItem[] = workOrders
    .filter((r) => r.vehicle_status === "Hazır")
    .slice(0, 12)
    .map((row) => {
      const ozet = mapRowToIsEmriOzet(row);
      return {
        id: ozet.id,
        title: ozet.plaka,
        subtitle: ozet.musteriAdi,
        meta: "Teslime hazır",
        href: `/is-emirleri/${ozet.id}`,
      };
    });

  return [
    {
      key: "geciken",
      title: "Geciken Dosyalar",
      emoji: "🔴",
      accentClass: "border-red-500/40 bg-red-500/5",
      items: gecikenItems,
    },
    {
      key: "parca",
      title: "Parça Bekleyen Araçlar",
      emoji: "🟡",
      accentClass: "border-amber-500/40 bg-amber-500/5",
      items: parcaItems,
    },
    {
      key: "hazir",
      title: "Teslime Hazır Araçlar",
      emoji: "🟢",
      accentClass: "border-emerald-500/40 bg-emerald-500/5",
      items: hazirItems,
    },
    {
      key: "tahsilat",
      title: "Tahsilat Bekleyenler",
      emoji: "💰",
      accentClass: "border-sky-500/40 bg-sky-500/5",
      items: tahsilatItems,
    },
  ];
}

function buildCharts(
  dosyaGunluk: { tarih: string; adet: number }[],
  workOrders: WorkOrderRow[],
  tedarikCounts: Map<string, number>,
  eventsByDay: Map<string, number>
): OpsCenterCharts {
  const isEmriCounts = new Map<string, number>();
  for (const d of ARAC_DURUMLARI) isEmriCounts.set(d, 0);
  for (const row of workOrders) {
    const s = row.vehicle_status;
    isEmriCounts.set(s, (isEmriCounts.get(s) ?? 0) + 1);
  }

  const now = new Date();
  const gunlukIslem: { label: string; adet: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: ISTANBUL_TZ,
    }).format(day);
    gunlukIslem.push({
      label: formatDayLabel(day),
      adet: eventsByDay.get(key) ?? 0,
    });
  }

  return {
    son30GunDosya: dosyaGunluk.map((d) => ({
      label: d.tarih,
      adet: d.adet,
    })),
    isEmriDurum: ARAC_DURUMLARI.map((name) => ({
      name,
      value: isEmriCounts.get(name) ?? 0,
    })),
    tedarikDurum: TEDARIK_DURUMLARI.map((name) => ({
      name,
      value: tedarikCounts.get(name) ?? 0,
    })),
    gunlukIslem,
  };
}

export async function getOpsCenterDashboardData(): Promise<
  DataResult<OpsCenterDashboardData>
> {
  try {
    const supabase = await createClient();
    const [operasyonRes, workOrdersRes, tedarikRes, eventsRes] =
      await Promise.all([
        getOperasyonDashboard("30"),
        supabase
          .from("work_orders")
          .select("*")
          .order("created_at", { ascending: false }),
        listeleTedarikParcalari(),
        supabase
          .from("service_file_events")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(5000),
      ]);

    if (!operasyonRes.ok) return fail(operasyonRes.error);
    if (workOrdersRes.error) return fail(workOrdersRes.error.message);

    const operasyon = operasyonRes.data;
    const workOrders = (workOrdersRes.data ?? []) as WorkOrderRow[];
    const now = new Date();

    const gecikenItems: OpsBoardItem[] = operasyon.gecikenDosyalar
      .filter((d) => d.seviye !== "normal")
      .slice(0, 12)
      .map((d) => ({
        id: d.id,
        title: d.dosyaNo,
        subtitle: d.plaka,
        meta: `${d.gunSayisi} gün · ${d.mevcutDurum}`,
        href: `/dosyalar/${d.id}`,
      }));

    const tahsilatItems: OpsBoardItem[] = operasyon.dosyalar
      .filter(
        (d) =>
          d.durum !== "Kapandı" &&
          (d.durum === "Ödeme Bekleniyor" || d.odemeDurumu === "Ödenmedi")
      )
      .slice(0, 12)
      .map((d) => ({
        id: d.id,
        title: d.dosyaNo,
        subtitle: d.plaka,
        meta: d.odemeDurumu,
        href: `/dosyalar/${d.id}`,
      }));

    const kpis = buildKpis(
      workOrders,
      operasyon.operasyon.toplamAktif,
      operasyon.finans.odemeBekleyen,
      operasyon.operasyon.pertIncelemesinde,
      operasyon.operasyon.pertOnaylandi
    );

    const columns = buildColumns(gecikenItems, workOrders, tahsilatItems);

    const tedarikCounts = new Map<string, number>();
    for (const d of TEDARIK_DURUMLARI) tedarikCounts.set(d, 0);
    if (tedarikRes.ok) {
      for (const p of tedarikRes.data) {
        tedarikCounts.set(
          p.tedarikDurumu,
          (tedarikCounts.get(p.tedarikDurumu) ?? 0) + 1
        );
      }
    }

    const eventsByDay = new Map<string, number>();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    for (const row of eventsRes.data ?? []) {
      const created = new Date(row.created_at);
      if (created < start) continue;
      const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: ISTANBUL_TZ,
      }).format(created);
      eventsByDay.set(key, (eventsByDay.get(key) ?? 0) + 1);
    }

    const charts = buildCharts(
      operasyon.grafikler.gunlukAcilanDosya,
      workOrders,
      tedarikCounts,
      eventsByDay
    );

    return ok({ kpis, columns, charts });
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Operasyon merkezi yüklenemedi."
    );
  }
}
