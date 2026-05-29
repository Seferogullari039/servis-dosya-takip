const PLACEHOLDER_MARKERS = [
  "your-project",
  "your-anon-key",
  "your-service-role-key",
  "example.supabase",
  "eyj.test",
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((m) => lower.includes(m));
}

function isValidSupabaseKey(key: string | undefined): boolean {
  const trimmed = key?.trim();
  if (!trimmed || isPlaceholder(trimmed)) return false;
  return trimmed.startsWith("eyJ") && trimmed.length >= 100;
}

export function hasSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && isValidSupabaseKey(key) && !isPlaceholder(url));
}

/** Kurulum ekranında hangi alanın eksik olduğunu göstermek için (gizli tutar). */
export function getSupabaseEnvIssue(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) return "NEXT_PUBLIC_SUPABASE_URL tanımlı değil.";
  if (isPlaceholder(url))
    return "URL örnek/placeholder; .env.local veya /setup ile güncelleyin.";
  if (!key) return "NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.";
  if (isPlaceholder(key))
    return "Anon key placeholder; Supabase API sayfasından gerçek key yapıştırın.";
  if (!key.startsWith("eyJ"))
    return "Anon key geçersiz format (eyJ ile başlamalı).";
  if (key.length < 100)
    return "Anon key çok kısa; tam key kopyalandığından emin olun.";

  return null;
}
