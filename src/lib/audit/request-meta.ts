import { headers } from "next/headers";

export async function getRequestAuditMeta(): Promise<{
  ip_address: string | null;
  user_agent: string | null;
}> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    h.get("x-real-ip")?.trim() ??
    null;
  const user_agent = h.get("user-agent");
  return { ip_address: ip, user_agent };
}
