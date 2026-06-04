import { Badge } from "@/components/ui/Badge";
import type { DosyaDurumu, OdemeDurumu } from "@/types/servis-dosya";

const durumVariant: Record<
  DosyaDurumu,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  "Yeni Açıldı": "info",
  "Evrak Bekleniyor": "warning",
  "Eksper Sürecinde": "info",
  "Tedarik Sürecinde": "warning",
  Onarımda: "info",
  "Pert İncelemesinde": "warning",
  "Pert Onaylandı": "danger",
  "Ödeme Bekleniyor": "danger",
  Tamamlandı: "success",
  Kapandı: "default",
};

/** Pert ve özel durum rozetleri (turuncu/kahverengi, kırmızı) */
const durumBadgeClass: Partial<Record<DosyaDurumu, string>> = {
  "Pert İncelemesinde":
    "bg-orange-100 text-orange-950 ring-1 ring-orange-300/60 dark:bg-orange-950/90 dark:text-orange-200 dark:ring-orange-800/80",
  "Pert Onaylandı":
    "bg-red-100 text-red-900 ring-1 ring-red-300/60 dark:bg-red-950/90 dark:text-red-200 dark:ring-red-800/80",
};

const odemeVariant: Record<
  OdemeDurumu,
  "default" | "success" | "warning" | "danger"
> = {
  Ödenmedi: "danger",
  "Kısmi Ödendi": "warning",
  Ödendi: "success",
};

/** Tailwind sınıfları — tıklanabilir ödeme rozeti için */
export const odemeBadgeVariant: Record<OdemeDurumu, string> = {
  Ödenmedi:
    "bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300",
  "Kısmi Ödendi":
    "bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
  Ödendi:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
};

export function DurumBadge({ durum }: { durum: DosyaDurumu }) {
  const custom = durumBadgeClass[durum];
  if (custom) {
    return <Badge className={custom}>{durum}</Badge>;
  }
  return <Badge variant={durumVariant[durum]}>{durum}</Badge>;
}

export function OdemeBadge({ odeme }: { odeme: OdemeDurumu }) {
  return <Badge variant={odemeVariant[odeme]}>{odeme}</Badge>;
}
