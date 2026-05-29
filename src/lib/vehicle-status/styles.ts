import type { AracDurumu } from "@/types/vehicle-status";

export const VEHICLE_STATUS_STYLES: Record<
  AracDurumu,
  { badge: string; dot: string; chart: string }
> = {
  "Kabul Edildi": {
    badge: "bg-zinc-100 text-zinc-800 ring-zinc-300/70",
    dot: "bg-zinc-500",
    chart: "#71717a",
  },
  Ekspertizde: {
    badge: "bg-violet-100 text-violet-950 ring-violet-300/70",
    dot: "bg-violet-600",
    chart: "#7c3aed",
  },
  "Parça Bekleniyor": {
    badge: "bg-amber-100 text-amber-950 ring-amber-300/70",
    dot: "bg-amber-500",
    chart: "#f59e0b",
  },
  İşlemde: {
    badge: "bg-blue-100 text-blue-950 ring-blue-300/70",
    dot: "bg-blue-600",
    chart: "#2563eb",
  },
  Hazır: {
    badge: "bg-emerald-100 text-emerald-950 ring-emerald-300/70",
    dot: "bg-emerald-600",
    chart: "#16a34a",
  },
  "Teslim Edildi": {
    badge: "bg-zinc-200 text-zinc-900 ring-zinc-400/70",
    dot: "bg-zinc-800",
    chart: "#3f3f46",
  },
};
