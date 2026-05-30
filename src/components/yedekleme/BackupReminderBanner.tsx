import { formatTarihSaat } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface BackupReminderBannerProps {
  lastBackupAt: string | null;
}

export function BackupReminderBanner({
  lastBackupAt,
}: BackupReminderBannerProps) {
  const stale =
    !lastBackupAt ||
    Date.now() - new Date(lastBackupAt).getTime() > SEVEN_DAYS_MS;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        stale
          ? "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100"
          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
      )}
    >
      <p className="font-semibold">
        {stale
          ? "7 günden uzun süredir yedek alınmadı"
          : "Yedekleme durumu güncel"}
      </p>
      <p className="mt-1 text-xs opacity-90">
        Son kayıtlı yedek indirme (sunucu):{" "}
        {lastBackupAt ? formatTarihSaat(lastBackupAt) : "Henüz kayıt yok"}
      </p>
      {stale ? (
        <p className="mt-2 text-xs">
          Lütfen aşağıdan güncel CSV/JSON yedeğinizi indirin ve güvenli bir
          ortamda saklayın.
        </p>
      ) : null}
    </div>
  );
}
