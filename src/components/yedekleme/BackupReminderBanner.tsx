import type { LastBackupDownloadInfo } from "@/lib/data/audit-logs";
import { formatTarihSaat } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type BannerVariant = "none" | "fresh" | "stale";

interface BackupReminderBannerProps {
  lastBackup: LastBackupDownloadInfo | null;
}

function resolveVariant(lastBackup: LastBackupDownloadInfo | null): BannerVariant {
  if (!lastBackup) return "none";
  const age = Date.now() - new Date(lastBackup.createdAt).getTime();
  return age <= SEVEN_DAYS_MS ? "fresh" : "stale";
}

const variantStyles: Record<
  BannerVariant,
  { box: string; title: string; subtitle?: string }
> = {
  none: {
    box: "border-orange-500/50 bg-orange-500/10 text-orange-950 dark:text-orange-100",
    title: "Henüz kayıtlı yedek bulunmuyor",
    subtitle:
      "Aşağıdan bir yedek indirdiğinizde tarih, kullanıcı ve tür burada görünecek.",
  },
  fresh: {
    box: "border-emerald-500/45 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
    title: "Sistem yedekleri güncel",
    subtitle: "Son yedek son 7 gün içinde alındı.",
  },
  stale: {
    box: "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100",
    title: "7 günden uzun süredir yedek alınmadı",
    subtitle:
      "Lütfen aşağıdan güncel CSV veya JSON yedeğinizi indirin ve güvenli bir ortamda saklayın.",
  },
};

export function BackupReminderBanner({ lastBackup }: BackupReminderBannerProps) {
  const variant = resolveVariant(lastBackup);
  const styles = variantStyles[variant];

  return (
    <div className={cn("rounded-xl border px-4 py-4 text-sm", styles.box)}>
      <p className="font-semibold">{styles.title}</p>
      {styles.subtitle ? (
        <p className="mt-1 text-xs opacity-90">{styles.subtitle}</p>
      ) : null}

      {lastBackup ? (
        <dl className="mt-4 grid grid-cols-1 gap-2 border-t border-current/15 pt-3 sm:grid-cols-3 sm:gap-3">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide opacity-70">
              Son yedek tarihi
            </dt>
            <dd className="mt-0.5 font-medium">
              {formatTarihSaat(lastBackup.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide opacity-70">
              Yedeği alan
            </dt>
            <dd className="mt-0.5 font-medium">{lastBackup.userName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide opacity-70">
              Yedek türü
            </dt>
            <dd className="mt-0.5 font-medium">
              {lastBackup.backupTypeLabel}{" "}
              <span className="font-normal opacity-80">
                ({lastBackup.format})
              </span>
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
