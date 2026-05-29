"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { TEDARIK_DURUMLARI } from "@/types/tedarik";
import { cn } from "@/lib/utils/cn";

export function TedarikFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const durum = searchParams.get("durum") ?? "";
  const baslangic = searchParams.get("baslangic") ?? "";
  const bitis = searchParams.get("bitis") ?? "";

  const apply = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      startTransition(() => router.push(`/tedarik?${params.toString()}`));
    },
    [router, searchParams]
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        pending && "opacity-70"
      )}
    >
      <p className="text-sm font-semibold text-ink">Sigorta tedarik filtreleri</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Plaka / müşteri
          </label>
          <input
            type="search"
            defaultValue={q}
            placeholder="Plaka veya müşteri adı"
            className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                apply({ q: (e.target as HTMLInputElement).value });
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== q) apply({ q: e.target.value });
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Tedarik durumu
          </label>
          <select
            value={durum}
            onChange={(e) => apply({ durum: e.target.value })}
            className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="">Tümü</option>
            {TEDARIK_DURUMLARI.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Başlangıç
          </label>
          <input
            type="date"
            value={baslangic}
            onChange={(e) => apply({ baslangic: e.target.value })}
            className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            Bitiş
          </label>
          <input
            type="date"
            value={bitis}
            onChange={(e) => apply({ bitis: e.target.value })}
            className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
