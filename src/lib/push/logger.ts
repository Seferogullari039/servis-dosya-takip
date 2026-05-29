/** Sunucu tarafı push debug logları (Vercel / terminal) */
export function logPush(
  scope: string,
  message: string,
  data?: unknown
): void {
  const payload = data !== undefined ? ` ${JSON.stringify(data)}` : "";
  console.info(`[push:${scope}] ${message}${payload}`);
}

export function logPushError(
  scope: string,
  message: string,
  error: unknown,
  data?: unknown
): void {
  const detail =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { raw: String(error) };
  console.error(`[push:${scope}] ${message}`, {
    ...(data && typeof data === "object" ? data : { context: data }),
    error: detail,
  });
}
