import { AppShell } from "@/components/layout/AppShell";
import { IslemGecmisiClient } from "@/components/audit/IslemGecmisiClient";
import { ErrorState } from "@/components/ui/DataState";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAuditLogs } from "@/lib/data/audit-logs";
import { listManagedUsers } from "@/lib/data/users-admin";

export default async function IslemGecmisiPage() {
  await requireAdmin();

  const [logsRes, usersRes] = await Promise.all([
    listAuditLogs({ limit: 500 }),
    listManagedUsers(),
  ]);

  const users =
    usersRes.ok ?
      usersRes.data.map((u) => ({ id: u.id, name: u.full_name }))
    : [];

  return (
    <AppShell title="İşlem Geçmişi">
      {!logsRes.ok ? (
        <ErrorState
          title="Kayıtlar yüklenemedi"
          description={logsRes.error}
        />
      ) : (
        <IslemGecmisiClient logs={logsRes.data} users={users} />
      )}
    </AppShell>
  );
}
