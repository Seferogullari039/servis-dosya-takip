import { AUDIT_ACTION_LABELS } from "@/lib/audit/types";
import type { AuditLogRow } from "@/lib/audit/types";
import { listEntityAuditLogs } from "@/lib/data/audit-logs";
import { formatTarihSaat } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface EntityAuditHistoryProps {
  entityType: string;
  entityId: string;
  title?: string;
  limit?: number;
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export async function EntityAuditHistory({
  entityType,
  entityId,
  title = "İşlem geçmişi",
  limit = 12,
}: EntityAuditHistoryProps) {
  const result = await listEntityAuditLogs(entityType, entityId, limit);
  const rows: AuditLogRow[] = result.ok ? result.data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      {rows.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-ink-muted">
          Bu kayıt için henüz işlem logu yok.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-ink">
                  {AUDIT_ACTION_LABELS[row.action] ?? row.action}
                </span>
                <span className="text-xs text-ink-faint">
                  {formatTarihSaat(row.created_at)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {row.user_name}
                {row.user_role ? ` · ${row.user_role}` : ""}
              </p>
              {(row.old_value || row.new_value) && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-accent">
                    Değişiklik detayı
                  </summary>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {row.old_value ? (
                      <pre className="max-h-32 overflow-auto rounded bg-surface-muted p-2 text-[10px] text-ink-muted">
                        {formatJson(row.old_value)}
                      </pre>
                    ) : null}
                    {row.new_value ? (
                      <pre className="max-h-32 overflow-auto rounded bg-surface-muted p-2 text-[10px] text-ink-muted">
                        {formatJson(row.new_value)}
                      </pre>
                    ) : null}
                  </div>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
