export function pdfErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const cause =
      e.cause instanceof Error ? e.cause.message : String(e.cause ?? "");
    return cause ? `${e.message} (${cause})` : e.message;
  }
  return String(e);
}
