"use client";

import Link from "next/link";
import { TedarikDurumBadge } from "@/components/is-emri/TedarikDurumBadge";
import { formatPara } from "@/lib/utils/para";
import type { TedarikParcaKayit } from "@/types/tedarik";

interface TedarikPanelProps {
  title: string;
  description: string;
  kayitlar: TedarikParcaKayit[];
  accentClass: string;
}

export function TedarikPanel({
  title,
  description,
  kayitlar,
  accentClass,
}: TedarikPanelProps) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface shadow-sm ${accentClass}`}
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <p className="text-xs text-ink-muted">{description}</p>
        <p className="mt-1 text-xs font-medium text-ink-faint">
          {kayitlar.length} parça
        </p>
      </div>
      {kayitlar.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-ink-muted">Kayıt yok</p>
      ) : (
        <ul className="divide-y divide-border max-h-[420px] overflow-y-auto">
          {kayitlar.map((row) => (
            <li key={`${row.workOrderId}-${row.partId}`} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/is-emirleri/${row.workOrderId}`}
                    className="font-bold text-ink hover:text-accent"
                  >
                    {row.plaka}
                  </Link>
                  <p className="text-sm text-ink-muted">{row.musteriAdi}</p>
                  <p className="mt-0.5 text-xs font-medium text-ink">
                    {row.parcaAdi}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {row.isEmriNo} · Adet {row.adet}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-ink">
                    {formatPara(row.toplamFiyat)}
                  </p>
                  <TedarikDurumBadge
                    durum={row.tedarikDurumu}
                    size="sm"
                    className="mt-1"
                  />
                </div>
              </div>
              {(row.tedarikNotu || row.servisSatinAldi) && (
                <p className="mt-2 text-xs text-ink-muted">
                  {row.servisSatinAldi ? "Servis satın aldı · " : ""}
                  {row.tedarikNotu}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
