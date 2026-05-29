import type { TedarikDurumu } from "@/types/tedarik";

export const TEDARIK_STATUS_STYLES: Record<TedarikDurumu, string> = {
  "Sigortadan Bekleniyor":
    "bg-amber-100 text-amber-950 ring-amber-300/70",
  "Sipariş Verildi": "bg-orange-50 text-orange-900 ring-orange-200/80",
  "Tedarik Yola Çıktı": "bg-sky-50 text-sky-900 ring-sky-200/80",
  Kargoda: "bg-blue-100 text-blue-950 ring-blue-300/70",
  Geldi: "bg-emerald-100 text-emerald-950 ring-emerald-300/70",
  Takıldı: "bg-teal-50 text-teal-900 ring-teal-200/80",
  "Stokta Yok": "bg-red-100 text-red-950 ring-red-300/70",
  "Servis Satın Aldı": "bg-violet-100 text-violet-950 ring-violet-300/70",
};

export const TEDARIK_DOT_STYLES: Record<TedarikDurumu, string> = {
  "Sigortadan Bekleniyor": "bg-amber-500",
  "Sipariş Verildi": "bg-orange-500",
  "Tedarik Yola Çıktı": "bg-sky-500",
  Kargoda: "bg-blue-600",
  Geldi: "bg-emerald-600",
  Takıldı: "bg-teal-600",
  "Stokta Yok": "bg-red-600",
  "Servis Satın Aldı": "bg-violet-600",
};
