"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleUserActiveAction } from "@/app/(dashboard)/kullanicilar/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RoleBadge } from "@/components/layout/RoleBadge";
import { useToast } from "@/components/ui/ToastProvider";
import { formatTarih } from "@/lib/utils/format";
import type { ManagedUser } from "@/types/managed-user";

interface UsersListClientProps {
  users: ManagedUser[];
}

export function UsersListClient({ users }: UsersListClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleToggle = (user: ManagedUser) => {
    const next = !user.is_active;
    const label = next ? "aktif" : "pasif";
    if (
      !window.confirm(
        `${user.full_name} kullanıcısını ${label} yapmak istiyor musunuz?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await toggleUserActiveAction(user.id, next);
      if (!result.ok) {
        toast(result.error, "error");
        return;
      }
      toast(`Kullanıcı ${label} yapıldı.`, "success");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {users.length} kayıtlı kullanıcı
        </p>
        <Link href="/kullanicilar/yeni">
          <Button type="button">Yeni Kullanıcı</Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/80 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Ad Soyad</th>
                <th className="px-4 py-3 font-semibold">E-posta</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Kayıt</th>
                <th className="px-4 py-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/60 last:border-0 hover:bg-surface-muted/40"
                >
                  <td className="px-4 py-3 font-medium text-ink">
                    {user.full_name}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.is_active
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-ink-faint"
                      }
                    >
                      {user.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {formatTarih(user.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/kullanicilar/${user.id}`}>
                        <Button type="button" variant="secondary">
                          Düzenle
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => handleToggle(user)}
                      >
                        {user.is_active ? "Pasif Yap" : "Aktif Yap"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">
            Henüz kullanıcı yok.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
