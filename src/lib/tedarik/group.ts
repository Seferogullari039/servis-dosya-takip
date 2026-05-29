import {
  panelKeyForDurum,
  type TedarikPanelKey,
  type TedarikParcaKayit,
} from "@/types/tedarik";
import type { TedarikDashboardStats } from "@/types/work-order-dashboard";

export function groupTedarikByPanel(
  kayitlar: TedarikParcaKayit[]
): Record<TedarikPanelKey, TedarikParcaKayit[]> {
  const groups: Record<TedarikPanelKey, TedarikParcaKayit[]> = {
    bekleyen: [],
    yolda: [],
    gelen: [],
    stoktaYok: [],
    servisSatin: [],
  };

  for (const row of kayitlar) {
    groups[panelKeyForDurum(row.tedarikDurumu)].push(row);
  }

  return groups;
}

export function countTedarikFromParts(
  kayitlar: TedarikParcaKayit[]
): TedarikDashboardStats {
  const counts: TedarikDashboardStats = {
    bekleyen: 0,
    yolda: 0,
    gelen: 0,
    stoktaYok: 0,
    servisSatin: 0,
  };
  for (const row of kayitlar) {
    const key = panelKeyForDurum(row.tedarikDurumu);
    counts[key]++;
  }
  return counts;
}
