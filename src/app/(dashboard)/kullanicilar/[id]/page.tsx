import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { UserForm } from "@/components/users/UserForm";
import { ErrorState } from "@/components/ui/DataState";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getManagedUserById } from "@/lib/data/users-admin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KullaniciDuzenlePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const result = await getManagedUserById(id);

  if (!result.ok) {
    if (result.error === "Kullanıcı bulunamadı.") notFound();
    return (
      <AppShell title="Kullanıcı Düzenle">
        <ErrorState title="Yüklenemedi" description={result.error} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Kullanıcı Düzenle">
      <div className="mb-4">
        <Link
          href="/kullanicilar"
          className="text-sm font-medium text-accent hover:underline"
        >
          ← Kullanıcı listesi
        </Link>
      </div>
      <UserForm mode="edit" user={result.data} />
    </AppShell>
  );
}
