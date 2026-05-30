"use client";

import { Fragment, useMemo, useState } from "react";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTIONS,
  type AuditLogRow,
} from "@/lib/audit/types";
import { Card } from "@/components/ui/Card";
import { formatTarihSaat } from "@/lib/utils/format";

interface IslemGecmisiClientProps {
  logs: AuditLogRow[];
  users: { id: string; name: string }[];
}

const ACTION_OPTIONS = Object.values(AUDIT_ACTIONS);

export function IslemGecmisiClient({
  logs,
  users,
}: IslemGecmisiClientProps) {
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return logs.filter((row) => {
      if (userId && row.user_id !== userId) return false;
      if (action && row.action !== action) return false;
      if (from && row.created_at < from) return false;
      if (to && row.created_at > `${to}T23:59:59.999Z`) return false;
      return true;
    });
  }, [logs, userId, action, from, to]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
            Kullanıcı
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-2 text-sm text-ink"
            >
              <option value="">Tümü</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
            İşlem tipi
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-2 text-sm text-ink"
            >
              <option value="">Tümü</option>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {AUDIT_ACTION_LABELS[a] ?? a}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
            Başlangıç
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
            Bitiş
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          {filtered.length} / {logs.length} kayıt (en fazla 500)
        </p>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/80 text-xs uppercase text-ink-muted">
                <th className="px-4 py-3">Zaman</th>
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">İşlem</th>
                <th className="px-4 py-3">Kayıt</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    className="border-b border-border/60 hover:bg-surface-muted/40"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                      {formatTarihSaat(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{row.user_name}</span>
                      {row.user_role ? (
                        <span className="ml-1 text-xs text-ink-faint">
                          ({row.user_role})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {AUDIT_ACTION_LABELS[row.action] ?? row.action}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {row.entity_label ?? row.entity_id ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-xs font-medium text-accent hover:underline"
                        onClick={() =>
                          setExpandedId(expandedId === row.id ? null : row.id)
                        }
                      >
                        {expandedId === row.id ? "Gizle" : "Detay"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === row.id ? (
                    <tr key={`${row.id}-detail`} className="bg-surface-muted/30">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold text-ink-muted">
                              Önceki değer
                            </p>
                            <pre className="mt-1 max-h-48 overflow-auto rounded border border-border bg-surface p-2 text-[11px]">
                              {row.old_value
                                ? JSON.stringify(row.old_value, null, 2)
                                : "—"}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-ink-muted">
                              Yeni değer
                            </p>
                            <pre className="mt-1 max-h-48 overflow-auto rounded border border-border bg-surface p-2 text-[11px]">
                              {row.new_value
                                ? JSON.stringify(row.new_value, null, 2)
                                : "—"}
                            </pre>
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-ink-faint">
                          IP: {row.ip_address ?? "—"} · UA:{" "}
                          {row.user_agent?.slice(0, 80) ?? "—"}
                        </p>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">
            Filtreye uygun kayıt yok.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
