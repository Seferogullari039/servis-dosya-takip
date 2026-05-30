/** Service role JWT doğrulama (sunucu tarafı, imza doğrulanmaz). */
export function decodeSupabaseJwtRole(apiKey: string): string | null {
  try {
    const parts = apiKey.trim().split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const data = JSON.parse(json) as { role?: string };
    return data.role ?? null;
  } catch {
    return null;
  }
}

export function isServiceRoleApiKey(apiKey: string | undefined): boolean {
  if (!apiKey?.trim()) return false;
  return decodeSupabaseJwtRole(apiKey) === "service_role";
}

export function getServiceRoleKeyIssue(
  apiKey: string | undefined
): string | null {
  if (!apiKey?.trim()) {
    return "SUPABASE_SERVICE_ROLE_KEY eksik veya okunamıyor";
  }
  const role = decodeSupabaseJwtRole(apiKey);
  if (role === "service_role") return null;
  if (role === "anon") {
    return "SUPABASE_SERVICE_ROLE_KEY geçersiz: anon key kullanılıyor (service_role olmalı)";
  }
  return `SUPABASE_SERVICE_ROLE_KEY geçersiz (JWT role: ${role ?? "bilinmiyor"})`;
}
