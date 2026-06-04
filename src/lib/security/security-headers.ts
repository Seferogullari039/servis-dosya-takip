/**
 * Merkezi HTTP güvenlik başlıkları (next.config headers).
 * Tüm sayfa route'larına uygulanır; /setup ve /login dahil.
 */

const CSP_DIRECTIVES = [
  "default-src 'self'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://www.gstatic.com",
    "https://www.googleapis.com",
    "https://apis.google.com",
  ].join(" "),
  ["style-src", "'self'", "'unsafe-inline'"].join(" "),
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    "https:",
  ].join(" "),
  ["font-src", "'self'", "data:"].join(" "),
  [
    "connect-src",
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://fcmregistrations.googleapis.com",
    "https://firebaseinstallations.googleapis.com",
    "https://firebaselogging.googleapis.com",
  ].join(" "),
  [
    "frame-src",
    "'self'",
    "https://www.google.com",
    "https://maps.google.com",
  ].join(" "),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  ["worker-src", "'self'", "blob:"].join(" "),
] as const;

export const CONTENT_SECURITY_POLICY = CSP_DIRECTIVES.join("; ");

export const SECURITY_HEADER_ENTRIES: ReadonlyArray<{
  key: string;
  value: string;
}> = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
];

/** next.config `headers()` için `{ key, value }[]` dönüşümü */
export function getNextSecurityHeaders(): Array<{ key: string; value: string }> {
  return SECURITY_HEADER_ENTRIES.map((h) => ({ ...h }));
}
