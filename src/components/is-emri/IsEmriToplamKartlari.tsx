"use client";

import { labelClass } from "@/components/is-emri/is-emri-form-ui";
import { formatPara } from "@/lib/utils/para";

interface IsEmriToplamKartlariProps {
  parcaToplam: number;
  servisSatinAlmaToplam: number;
  iscilikToplam: number;
  genelToplam: number;
}

export function IsEmriToplamKartlari({
  parcaToplam,
  servisSatinAlmaToplam,
  iscilikToplam,
  genelToplam,
}: IsEmriToplamKartlariProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface-muted/50 p-4 print:border-gray-300">
          <p className={labelClass()}>Parça toplamı</p>
          <p className="mt-2 text-right text-xl font-bold tabular-nums text-ink">
            {formatPara(parcaToplam)}
          </p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 print:border-gray-300">
          <p className={labelClass()}>Servis satın alma</p>
          <p className="mt-2 text-right text-xl font-bold tabular-nums text-violet-900">
            {formatPara(servisSatinAlmaToplam)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-muted/50 p-4 print:border-gray-300">
          <p className={labelClass()}>İşçilik toplamı</p>
          <p className="mt-2 text-right text-xl font-bold tabular-nums text-ink">
            {formatPara(iscilikToplam)}
          </p>
        </div>
        <div className="rounded-xl border-2 border-[#0c1a2e] bg-[#0c1a2e]/5 p-4 print:border-gray-800 print:bg-gray-50">
          <p className={labelClass()}>Genel toplam</p>
          <p className="mt-2 text-right text-2xl font-bold tabular-nums text-[#0c1a2e] print:text-gray-900">
            {formatPara(genelToplam)}
          </p>
        </div>
      </div>
    </div>
  );
}
