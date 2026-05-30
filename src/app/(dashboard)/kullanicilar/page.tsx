import { AppShell } from "@/components/layout/AppShell";
import { UsersListClient } from "@/components/users/UsersListClient";
import { ErrorState } from "@/components/ui/DataState";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listManagedUsers } from "@/lib/data/users-admin";

export default async function KullanicilarPage() {
  await requireAdmin();
  const result = await listManagedUsers();

  return (
    <AppShell title="Kullanıcılar">
      {!result.ok ? (
        <ErrorState title="Liste yüklenemedi" description={result.error} />
      ) : (
        <UsersListClient users={result.data} />
      )}
    </AppShell>
  );
}
