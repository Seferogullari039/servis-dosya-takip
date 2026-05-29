import { devLogger } from "@/lib/logging";

export function debugEvent(
  action: "insert" | "skip-duplicate" | "error",
  detail: Record<string, unknown>
): void {
  devLogger.debug(`event:${action}`, detail);
}
