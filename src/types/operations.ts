import type { ServisDosyasi } from "@/types/servis-dosya";

export type OperationResult =
  | { ok: true; data?: ServisDosyasi }
  | { ok: false; error: string };

export interface AlertSummary {
  riskCount: number;
  kritikCount: number;
  odemeGecikmeCount: number;
  pertIncelemesindeCount: number;
  total: number;
}

export interface TodayTaskItem {
  id: string;
  dosyaNo: string;
  plaka: string;
  label: string;
  kind: "geciken" | "odeme" | "tedarik" | "pert";
  href: string;
}

export interface TodayTasksData {
  geciken: TodayTaskItem[];
  odemeBekleyen: TodayTaskItem[];
  tedarik: TodayTaskItem[];
  pertIncelemesinde: TodayTaskItem[];
}
