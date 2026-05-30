import { NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/auth/assert-admin";
import { auditBackupDownload } from "@/lib/export/backup-audit";
import { buildTumYedekJson } from "@/lib/export/backup-data";
import { jsonDownloadResponse } from "@/lib/export/http";
import { exportDateStamp } from "@/lib/export/csv";

export async function GET() {
  const auth = await assertAdminAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await buildTumYedekJson();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const filename = `tum-yedek-${exportDateStamp()}.json`;
  await auditBackupDownload(auth.profile, "tum", filename);
  return jsonDownloadResponse(result.data, filename);
}
