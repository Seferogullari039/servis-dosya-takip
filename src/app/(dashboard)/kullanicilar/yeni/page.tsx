import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { UserForm } from "@/components/users/UserForm";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function YeniKullaniciPage() {
  await requireAdmin();

  return (
    <AppShell title="Yeni Kullanıcı">
      <div className="mb-4">
        <Link
          href="/kullanicilar"
          className="text-sm font-medium text-accent hover:underline"
        >
          ← Kullanıcı listesi
        </Link>
      </div>
      <UserForm mode="create" />
    </AppShell>
  );
}
