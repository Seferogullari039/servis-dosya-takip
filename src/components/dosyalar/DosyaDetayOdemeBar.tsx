"use client";

import { DurumBadge } from "@/components/dosyalar/DurumBadge";
import { OdemeDurumuPicker } from "@/components/operations/OdemeDurumuPicker";
import type { ServisDosyasi } from "@/types/servis-dosya";

export function DosyaDetayOdemeBar({ dosya }: { dosya: ServisDosyasi }) {
  return (
    <div className="flex flex-wrap gap-2">
      <DurumBadge durum={dosya.durum} />
      <OdemeDurumuPicker dosya={dosya} showTutar />
    </div>
  );
}
