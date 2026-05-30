import Link from "next/link";
import type { OpsBoardColumn } from "@/types/ops-center-dashboard";
import { cn } from "@/lib/utils/cn";

interface OpsBoardColumnsProps {
  columns: OpsBoardColumn[];
}

export function OpsBoardColumns({ columns }: OpsBoardColumnsProps) {
  return (
    <section aria-label="Bugünün operasyonları">
      <h2 className="mb-4 text-lg font-semibold text-ink">
        Bugünün Operasyonları
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div
            key={col.key}
            className={cn(
              "flex min-h-[280px] flex-col rounded-2xl border p-4 shadow-sm backdrop-blur-sm dark:border-white/10",
              col.accentClass
            )}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span aria-hidden>{col.emoji}</span>
              {col.title}
              <span className="ml-auto rounded-full bg-surface/80 px-2 py-0.5 text-xs font-medium text-ink-muted dark:bg-black/20">
                {col.items.length}
              </span>
            </h3>
            <ul className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
              {col.items.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-ink-faint">
                  Kayıt yok
                </li>
              ) : (
                col.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="block rounded-xl border border-border/50 bg-surface/90 px-3 py-2.5 transition-colors hover:border-[#0F4C81]/40 hover:bg-[#0F4C81]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] dark:border-white/10 dark:bg-black/20 dark:hover:bg-[#0F4C81]/15"
                    >
                      <p className="font-medium text-ink">{item.title}</p>
                      <p className="text-xs text-ink-muted">{item.subtitle}</p>
                      {item.meta ? (
                        <p className="mt-1 text-[11px] text-ink-faint">
                          {item.meta}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
