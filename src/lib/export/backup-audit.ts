import { AUDIT_ACTIONS } from "@/lib/audit/types";
import { recordAuditWithProfile } from "@/lib/audit/record";
import { notifyBackupDownloaded } from "@/lib/push/security-events";
import type { Profile } from "@/lib/auth/types";

export async function auditBackupDownload(
  profile: Profile,
  backupType: string,
  filename: string
): Promise<void> {
  await recordAuditWithProfile(profile, {
    action: AUDIT_ACTIONS.BACKUP_DOWNLOAD,
    entity_type: "backup",
    entity_label: filename,
    new_value: { type: backupType, filename },
  });

  notifyBackupDownloaded({
    backupType,
    adminName: profile.full_name,
    excludeUserId: profile.id,
  });
}
