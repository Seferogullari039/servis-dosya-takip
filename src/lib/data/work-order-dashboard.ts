import { mapRowToIsEmriOzet } from "@/lib/data/map-work-order";
import {
  countTedarikFromParts,
  listeleTedarikParcalari,
} from "@/lib/data/tedarik";
import { getWorkOrderImageDashboardStats } from "@/lib/data/work-order-images";
import { getPushDashboardStatus } from "@/lib/push/status";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { WorkOrderRow } from "@/types/supabase";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import {
  ARAC_DURUMLARI,
  type AracDurumu,
} from "@/types/vehicle-status";
import type {
  AracDashboardData,
  AracDashboardStats,
  CanliIsEmriSatir,
  DurumDagilimNokta,
  GunlukIsEmriNokta,
} from "@/types/work-order-dashboard";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDayLabel(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return iso;
  }
}

function buildStats(rows: { vehicle_status: string; entry_date: string }[]): AracDashboardStats {
  const today = todayIso();
  let bugunGelen = 0;
  let islemde = 0;
  let parcaBekleyen = 0;
  let hazir = 0;
  let teslimEdilen = 0;
  let toplamAktif = 0;

  for (const row of rows) {
    const status = row.vehicle_status as AracDurumu;
    if (row.entry_date === today) bugunGelen++;
    if (status === "İşlemde") islemde++;
    if (status === "Parça Bekleniyor") parcaBekleyen++;
    if (status === "Hazır") hazir++;
    if (status === "Teslim Edildi") teslimEdilen++;
    if (status !== "Teslim Edildi") toplamAktif++;
  }

  return {
    bugunGelen,
    islemde,
    parcaBekleyen,
    hazir,
    teslimEdilen,
    toplamAktif,
  };
}

function buildDurumDagilimi(
  rows: { vehicle_status: string }[]
): DurumDagilimNokta[] {
  const counts = new Map<AracDurumu, number>();
  for (const d of ARAC_DURUMLARI) counts.set(d, 0);
  for (const row of rows) {
    const s = row.vehicle_status as AracDurumu;
    if (ARAC_DURUMLARI.includes(s)) {
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
  }
  return ARAC_DURUMLARI.map((name) => ({
    name,
    value: counts.get(name) ?? 0,
  }));
}

function buildGunluk(
  rows: { created_at: string }[],
  days: string[]
): GunlukIsEmriNokta[] {
  const counts = new Map<string, number>();
  for (const d of days) counts.set(d, 0);
  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    if (counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }
  return days.map((tarih) => ({
    tarih,
    label: formatDayLabel(tarih),
    adet: counts.get(tarih) ?? 0,
  }));
}

export async function getAracDashboardData(): Promise<
  DataResult<AracDashboardData>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return fail(error.message || "Dashboard verisi yüklenemedi.");
    }

    const rows = data ?? [];
    const days = lastNDays(7);
    const stats = buildStats(rows);
    const gunlukIsEmirleri = buildGunluk(rows, days);
    const durumDagilimi = buildDurumDagilimi(rows);

    const canliPanel: CanliIsEmriSatir[] = rows
      .filter((r) => r.vehicle_status !== "Teslim Edildi")
      .slice(0, 10)
      .map((row) => {
        const ozet = mapRowToIsEmriOzet(row as WorkOrderRow);
        return {
          id: ozet.id,
          plaka: ozet.plaka,
          musteriAdi: ozet.musteriAdi,
          aracDurumu: ozet.aracDurumu,
          toplamTutar: ozet.toplamTutar,
          isEmriNo: ozet.isEmriNo,
        };
      });

    const user = await getCurrentUser();
    const [tedarikResult, gorselResult, push] = await Promise.all([
      listeleTedarikParcalari(),
      getWorkOrderImageDashboardStats(),
      user
        ? getPushDashboardStatus(user.id)
        : Promise.resolve({
            subscriptionCount: 0,
            publicFirebaseReady: false,
            missingPublicEnv: [],
            serverPushReady: false,
          }),
    ]);
    const tedarik = tedarikResult.ok
      ? countTedarikFromParts(tedarikResult.data)
      : {
          bekleyen: 0,
          yolda: 0,
          gelen: 0,
          stoktaYok: 0,
          servisSatin: 0,
        };
    const gorsel = gorselResult.ok
      ? gorselResult.data
      : { toplamGorsel: 0, bugunYuklenen: 0, eksikFotografliDosya: 0 };

    return ok({
      stats,
      tedarik,
      gorsel,
      push,
      gunlukIsEmirleri,
      durumDagilimi,
      canliPanel,
    });
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Dashboard verisi yüklenemedi."
    );
  }
}
