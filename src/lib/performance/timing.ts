import { measureGuardedQuery } from "@/lib/performance/guardrails";

/** @deprecated Use measureGuardedQuery from guardrails. */
export async function measureQuery<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  return measureGuardedQuery(label, fn);
}
