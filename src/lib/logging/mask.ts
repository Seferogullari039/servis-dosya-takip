const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "service_role",
  "apikey",
  "api_key",
  "email",
  "telefon",
  "phone",
] as const;

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(\+?\d[\d\s()-]{7,}\d)/g;

function maskString(value: string): string {
  return value
    .replace(EMAIL_PATTERN, "[email]")
    .replace(PHONE_PATTERN, "[phone]");
}

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((k) => lower.includes(k));
}

/** Masks sensitive fields before logging. */
export function maskSensitiveData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return maskString(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item)) as T;
  }

  if (typeof data === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        out[key] = "[redacted]";
      } else if (typeof value === "string") {
        out[key] = maskString(value);
      } else {
        out[key] = maskSensitiveData(value);
      }
    }
    return out as T;
  }

  return data;
}
