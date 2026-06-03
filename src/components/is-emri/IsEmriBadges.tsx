import { cn } from "@/lib/utils/cn";
import type { IsEmriDurumu, IsEmriOdemeDurumu, IsEmriTipi } from "@/types/work-order-payment";

const TIPI_STYLES: Record<IsEmriTipi, string> = {
  "Sigortalı İş":
    "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  "Sigortasız / Müşteri Ödemeli İş":
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
};

export function IsEmriTipiBadge({
  tip,
  size = "md",
}: {
  tip: IsEmriTipi;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold",
        TIPI_STYLES[tip],
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      {tip === "Sigortalı İş" ? "Sigortalı" : "Sigortasız"}
    </span>
  );
}

const DURUM_STYLES: Record<IsEmriDurumu, string> = {
  Açık: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  Ödenmedi: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  "Kısmi Ödendi":
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  Ödendi:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  Kapandı: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100",
};

export function IsEmriDurumuBadge({
  durum,
  size = "md",
}: {
  durum: IsEmriDurumu | IsEmriOdemeDurumu;
  size?: "sm" | "md";
}) {
  const style =
    DURUM_STYLES[durum as IsEmriDurumu] ?? DURUM_STYLES["Açık"];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold",
        style,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      {durum}
    </span>
  );
}
