export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): DataResult<T> {
  return { ok: true, data };
}

export function fail<T>(error: string): DataResult<T> {
  return { ok: false, error };
}
