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
  "Ödeme Bekleniyor": "danger",
  Tamamlandı: "success",
  Kapandı: "default",
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
  return <Badge variant={durumVariant[durum]}>{durum}</Badge>;
}

export function OdemeBadge({ odeme }: { odeme: OdemeDurumu }) {
  return <Badge variant={odemeVariant[odeme]}>{odeme}</Badge>;
}
