/** Maps technical errors to user-friendly Turkish messages. */

const PATTERNS: { match: RegExp | string; message: string }[] = [
  { match: /network|fetch failed|econnreset/i, message: "Bağlantı sorunu oluştu. İnternetinizi kontrol edip tekrar deneyin." },
  { match: /timeout/i, message: "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin." },
  { match: /unauthorized|401|oturum/i, message: "Oturumunuz sona ermiş olabilir. Tekrar giriş yapın." },
  { match: /forbidden|403|yetkiniz/i, message: "Bu işlem için yetkiniz bulunmuyor." },
  { match: /not found|404|bulunamadı/i, message: "Aradığınız kayıt bulunamadı." },
  { match: /duplicate|23505|zaten kayıtlı/i, message: "Bu kayıt zaten mevcut." },
  { match: /salt-okunur|readonly|dondurma modu|güncelleme modu kapalı/i, message: "Sistem şu an değişiklik kabul etmiyor. Yöneticinize başvurun." },
  { match: /güvenli mod/i, message: "Güvenli mod aktif — toplu işlemler geçici olarak kapalı." },
];

export function toUserFriendlyError(
  error: unknown,
  fallback = "Bir sorun oluştu. Lütfen tekrar deneyin."
): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (!raw.trim()) return fallback;

  for (const { match, message } of PATTERNS) {
    if (typeof match === "string" ? raw.includes(match) : match.test(raw)) {
      return message;
    }
  }

  if (process.env.NODE_ENV === "development") return raw;
  return fallback;
}

export const ERROR_UI = {
  dashboard: {
    title: "Dashboard şu an yüklenemiyor",
    description: "Veriler geçici olarak alınamadı. Sayfayı yenilemeyi deneyin.",
  },
  dosyaDetay: {
    title: "Dosya bilgileri yüklenemedi",
    description: "Dosya detayı şu an görüntülenemiyor. Listeye dönüp tekrar deneyin.",
  },
  generic: {
    title: "Bir sorun oluştu",
    description: "İşleminiz tamamlanamadı. Biraz sonra tekrar deneyin.",
  },
} as const;
