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
  if (!key?.trim() || isPlaceholder(key)) return false;
  return key.startsWith("eyJ") && key.length >= 100;
}

export function hasSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url?.trim() && isValidSupabaseKey(key) && !isPlaceholder(url));
}
