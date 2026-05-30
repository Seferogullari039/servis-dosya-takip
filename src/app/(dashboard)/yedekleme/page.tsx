import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BackupReminderBanner } from "@/components/yedekleme/BackupReminderBanner";
import { YedeklemeClient } from "@/components/yedekleme/YedeklemeClient";
import { getLastBackupDownloadInfo } from "@/lib/data/audit-logs";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function YedeklemePage() {
  const { profile } = await requireAuth();

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const lastBackup = await getLastBackupDownloadInfo();

  return (
    <AppShell title="Yedekleme">
      <div className="mx-auto max-w-5xl space-y-6">
        <BackupReminderBanner lastBackup={lastBackup} />
        <p className="text-sm text-ink-muted dark:text-zinc-400">
          Verilerinizi CSV veya JSON olarak dışa aktarın. İndirmeler yalnızca
          admin hesabıyla yapılabilir.
        </p>
        <YedeklemeClient />
      </div>
    </AppShell>
  );
}
