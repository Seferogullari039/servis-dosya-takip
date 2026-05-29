"use client";

import type { EkspertizCheckItem } from "@/types/is-emri";
import { fieldClass, tableHeadClass } from "@/components/is-emri/is-emri-form-ui";
import { cn } from "@/lib/utils/cn";

interface EkspertizChecklistProps {
  items: EkspertizCheckItem[];
  readOnly: boolean;
  onChange: (items: EkspertizCheckItem[]) => void;
  inputProps: (editable: boolean) => ReturnType<typeof import("@/components/is-emri/is-emri-form-ui").inputPropsForMode>;
}

export function EkspertizChecklist({
  items,
  readOnly,
  onChange,
  inputProps,
}: EkspertizChecklistProps) {
  const patchItem = (key: string, patch: Partial<EkspertizCheckItem>) => {
    onChange(
      items.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li
            key={item.key}
            className="rounded-xl border border-border bg-surface-muted/30 p-4 dark:border-zinc-600 dark:bg-zinc-800/40"
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={item.checked}
                disabled={readOnly}
                onChange={(e) => patchItem(item.key, { checked: e.target.checked })}
                className="mt-0.5 h-6 w-6 shrink-0 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm font-medium text-ink dark:text-zinc-100">
                {item.label}
              </span>
            </label>
            <input
              className={cn(fieldClass(), "mt-3")}
              value={item.note}
              onChange={(e) => patchItem(item.key, { note: e.target.value })}
              placeholder="Not…"
              {...inputProps(true)}
            />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className={tableHeadClass()}>
            <tr>
              <th className="w-12 px-3 py-2" />
              <th className="px-3 py-2 font-semibold">Kontrol</th>
              <th className="px-3 py-2 font-semibold">Not</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key} className="border-t border-border/60">
                <td className="px-3 py-2 align-top">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    disabled={readOnly}
                    onChange={(e) =>
                      patchItem(item.key, { checked: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-border text-accent"
                    aria-label={item.label}
                  />
                </td>
                <td className="px-3 py-2 align-top font-medium text-ink dark:text-zinc-100">
                  {item.label}
                </td>
                <td className="px-3 py-2">
                  <input
                    className={fieldClass()}
                    value={item.note}
                    onChange={(e) => patchItem(item.key, { note: e.target.value })}
                    placeholder="Not…"
                    {...inputProps(true)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
