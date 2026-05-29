export interface ParsedSupabaseError {
  code: string | null;
  message: string;
  details: string | null;
  hint: string | null;
  category: string;
  categoryLabel: string;
}

type PostgrestLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export function parseSupabaseError(error: unknown): ParsedSupabaseError {
  const e = error as PostgrestLikeError;
  const code = e?.code ?? null;
  const message = e?.message ?? (error instanceof Error ? error.message : String(error));
  const details = e?.details ?? null;
  const hint = e?.hint ?? null;
  const lower = `${message} ${details ?? ""} ${hint ?? ""}`.toLowerCase();

  let category = "unknown";
  let categoryLabel = "Bilinmeyen hata";

  if (code === "23503" || lower.includes("foreign key")) {
    category = "foreign_key_violation";
    categoryLabel = "Foreign key violation (user_id auth.users ile eşleşmiyor olabilir)";
  } else if (code === "23505") {
    category = "unique_violation";
    categoryLabel = "Unique violation (aynı token zaten kayıtlı)";
  } else if (code === "42703" || lower.includes("column")) {
    category = "missing_column";
    categoryLabel = "Missing column (tablo şeması uyumsuz)";
  } else if (
    code === "42501" ||
    lower.includes("row-level security") ||
    lower.includes("rls")
  ) {
    category = "rls_violation";
    categoryLabel = "RLS violation";
  } else if (lower.includes("permission denied") || code === "42501") {
    category = "permission_denied";
    categoryLabel = "Permission denied";
  } else if (lower.includes("invalid input syntax for type uuid") || lower.includes("invalid user")) {
    category = "invalid_user_id";
    categoryLabel = "Invalid user_id (UUID formatı hatalı)";
  } else if (message) {
    categoryLabel = message;
  }

  return { code, message, details, hint, category, categoryLabel };
}

export function logPushRegisterError(
  context: string,
  payload: {
    userId: string;
    email?: string | null;
    error: unknown;
  }
): void {
  const parsed = parseSupabaseError(payload.error);
  console.error("[push-register]", {
    context,
    userId: payload.userId,
    email: payload.email ?? null,
    error: parsed.message,
    code: parsed.code,
    details: parsed.details,
    hint: parsed.hint,
    category: parsed.category,
    categoryLabel: parsed.categoryLabel,
  });
}
