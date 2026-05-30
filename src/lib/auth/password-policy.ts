export type PasswordValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const MIN_LENGTH = 8;

export function validateStrongPassword(
  password: string
): PasswordValidationResult {
  const p = password.trim();
  if (p.length < MIN_LENGTH) {
    return {
      ok: false,
      error: `Şifre en az ${MIN_LENGTH} karakter olmalıdır.`,
    };
  }
  if (!/[A-ZÇĞİÖŞÜ]/.test(p)) {
    return {
      ok: false,
      error: "Şifre en az bir büyük harf içermelidir.",
    };
  }
  if (!/[a-zçğıöşü]/.test(p)) {
    return {
      ok: false,
      error: "Şifre en az bir küçük harf içermelidir.",
    };
  }
  if (!/[0-9]/.test(p)) {
    return {
      ok: false,
      error: "Şifre en az bir rakam içermelidir.",
    };
  }
  if (!/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(p)) {
    return {
      ok: false,
      error: "Şifre en az bir özel karakter içermelidir.",
    };
  }
  return { ok: true };
}
