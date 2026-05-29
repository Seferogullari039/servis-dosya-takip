export type AuthErrorCode =
  | "invalid_credentials"
  | "user_not_found"
  | "session_expired"
  | "account_inactive"
  | "email_not_confirmed"
  | "too_many_requests"
  | "unknown";

export function mapSupabaseAuthError(message: string): {
  code: AuthErrorCode;
  message: string;
} {
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  ) {
    return {
      code: "invalid_credentials",
      message: "E-posta veya şifre hatalı.",
    };
  }

  if (lower.includes("user not found") || lower.includes("no user found")) {
    return {
      code: "user_not_found",
      message: "Bu e-posta ile kayıtlı kullanıcı bulunamadı.",
    };
  }

  if (
    lower.includes("email not confirmed") ||
    lower.includes("confirm your email")
  ) {
    return {
      code: "email_not_confirmed",
      message: "E-posta adresiniz henüz doğrulanmamış.",
    };
  }

  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return {
      code: "too_many_requests",
      message: "Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin.",
    };
  }

  if (
    lower.includes("session") &&
    (lower.includes("expired") || lower.includes("missing") || lower.includes("invalid"))
  ) {
    return {
      code: "session_expired",
      message: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
    };
  }

  return {
    code: "unknown",
    message: message || "Giriş yapılamadı. Lütfen tekrar deneyin.",
  };
}

export function getLoginMessageFromReason(
  reason: string | null | undefined
): string | null {
  switch (reason) {
    case "session_expired":
      return "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.";
    case "account_inactive":
      return "Hesabınız pasif durumda. Yöneticinizle iletişime geçin.";
    case "auth_required":
      return "Bu sayfayı görüntülemek için giriş yapmalısınız.";
    default:
      return null;
  }
}
