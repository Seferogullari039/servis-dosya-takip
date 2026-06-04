import type { OperasyonDashboardData } from "@/types/dashboard";
import type { AlertSummary, TodayTasksData } from "@/types/operations";
import type { ServisDosyasi } from "@/types/servis-dosya";

export function deriveAlertSummary(data: OperasyonDashboardData): AlertSummary {
  const { gecikenDosyalar, finans } = data;
  const riskCount = gecikenDosyalar.filter((d) => d.seviye === "risk").length;
  const kritikCount = gecikenDosyalar.filter(
    (d) => d.seviye === "kritik"
  ).length;

  const pertIncelemesindeCount = data.dosyalar.filter(
    (d) => d.durum === "Pert İncelemesinde"
  ).length;

  return {
    riskCount,
    kritikCount,
    odemeGecikmeCount: finans.odemeBekleyen,
    pertIncelemesindeCount,
    total:
      riskCount +
      kritikCount +
      finans.odemeBekleyen +
      pertIncelemesindeCount,
  };
}

export function deriveTodayTasksData(
  data: OperasyonDashboardData,
  dosyalar: ServisDosyasi[]
): TodayTasksData {
  const { gecikenDosyalar } = data;

  const geciken = gecikenDosyalar.slice(0, 8).map((d) => ({
    id: d.id,
    dosyaNo: d.dosyaNo,
    plaka: d.plaka,
    label: `${d.gunSayisi} gün · ${d.mevcutDurum}`,
    kind: "geciken" as const,
    href: `/dosyalar/${d.id}`,
  }));

  const odemeBekleyen = dosyalar
    .filter(
      (d) =>
        d.durum !== "Kapandı" &&
        (d.durum === "Ödeme Bekleniyor" || d.odemeDurumu === "Ödenmedi")
    )
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      dosyaNo: d.dosyaNo,
      plaka: d.plaka,
      label: d.odemeDurumu,
      kind: "odeme" as const,
      href: `/dosyalar/${d.id}`,
    }));

  const tedarik = dosyalar
    .filter((d) => d.durum === "Tedarik Sürecinde")
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      dosyaNo: d.dosyaNo,
      plaka: d.plaka,
      label: d.durum,
      kind: "tedarik" as const,
      href: `/dosyalar/${d.id}`,
    }));

  const pertIncelemesinde = dosyalar
    .filter((d) => d.durum === "Pert İncelemesinde")
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      dosyaNo: d.dosyaNo,
      plaka: d.plaka,
      label: d.durum,
      kind: "pert" as const,
      href: `/dosyalar/${d.id}`,
    }));

  return { geciken, odemeBekleyen, tedarik, pertIncelemesinde };
}

/** @deprecated Prefer deriveAlertSummary with cached dashboard data */
export async function getAlertSummary(): Promise<AlertSummary> {
  const { getCachedAlertSummary } = await import("@/lib/data/dashboard");
  return getCachedAlertSummary();
}

/** @deprecated Prefer deriveTodayTasksData with single dashboard fetch */
export async function getTodayTasksData(): Promise<TodayTasksData> {
  const { getOperasyonDashboard } = await import("@/lib/data/dashboard");
  const result = await getOperasyonDashboard("7");
  if (!result.ok) {
    return { geciken: [], odemeBekleyen: [], tedarik: [], pertIncelemesinde: [] };
  }
  return deriveTodayTasksData(result.data, result.data.dosyalar);
}
