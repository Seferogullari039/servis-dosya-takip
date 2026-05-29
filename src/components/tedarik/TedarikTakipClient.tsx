"use client";

import { TedarikPanel } from "@/components/tedarik/TedarikPanel";
import { groupTedarikByPanel } from "@/lib/tedarik/group";
import type { TedarikParcaKayit } from "@/types/tedarik";

interface TedarikTakipClientProps {
  kayitlar: TedarikParcaKayit[];
}

export function TedarikTakipClient({ kayitlar }: TedarikTakipClientProps) {
  const groups = groupTedarikByPanel(kayitlar);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <TedarikPanel
        title="Bekleyen parçalar"
        description="Sigortadan beklenen ve sipariş verilen"
        kayitlar={groups.bekleyen}
        accentClass="border-l-4 border-l-amber-400"
      />
      <TedarikPanel
        title="Yolda olan parçalar"
        description="Tedarik yola çıktı ve kargoda"
        kayitlar={groups.yolda}
        accentClass="border-l-4 border-l-blue-500"
      />
      <TedarikPanel
        title="Gelen parçalar"
        description="Depoya ulaşan ve takılan"
        kayitlar={groups.gelen}
        accentClass="border-l-4 border-l-emerald-500"
      />
      <TedarikPanel
        title="Stokta olmayanlar"
        description="Tedarik edilemeyen kalemler"
        kayitlar={groups.stoktaYok}
        accentClass="border-l-4 border-l-red-500"
      />
      <TedarikPanel
        title="Servis satın alınanlar"
        description="Servisin kendi aldığı parçalar"
        kayitlar={groups.servisSatin}
        accentClass="border-l-4 border-l-violet-500 xl:col-span-2"
      />
    </div>
  );
}
