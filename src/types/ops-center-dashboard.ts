export interface OpsCenterKpis {
  acikIsEmirleri: number;
  parcaBekleyen: number;
  hazirTeslim: number;
  bugunTeslimEdilecek: number;
  aktifDosya: number;
  tahsilatBekleyen: number;
  pertIncelemesinde: number;
  pertOnaylandi: number;
}

export interface OpsBoardItem {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
}

export interface OpsBoardColumn {
  key: "geciken" | "parca" | "hazir" | "tahsilat";
  title: string;
  emoji: string;
  accentClass: string;
  items: OpsBoardItem[];
}

export interface ChartPoint {
  name: string;
  value: number;
}

export interface DailyChartPoint {
  label: string;
  adet: number;
}

export interface OpsCenterCharts {
  son30GunDosya: DailyChartPoint[];
  isEmriDurum: ChartPoint[];
  tedarikDurum: ChartPoint[];
  gunlukIslem: DailyChartPoint[];
}

export interface OpsCenterDashboardData {
  kpis: OpsCenterKpis;
  columns: OpsBoardColumn[];
  charts: OpsCenterCharts;
}
