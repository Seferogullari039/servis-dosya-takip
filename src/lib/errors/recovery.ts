import { logger } from "@/lib/logging";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type { AlertSummary } from "@/types/operations";
import type { OperasyonDashboardData } from "@/types/dashboard";
import type { PaginatedEvents } from "@/types/events";
import type { ServisDosyasi } from "@/types/servis-dosya";

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  /** Multiplier for exponential backoff (default 2) */
  factor?: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 200,
  maxDelayMs: 2_000,
  factor: 2,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoff(attempt: number, policy: RetryPolicy): number {
  const factor = policy.factor ?? 2;
  const raw = policy.baseDelayMs * Math.pow(factor, attempt - 1);
  return Math.min(raw, policy.maxDelayMs);
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("econnreset") ||
    msg.includes("503") ||
    msg.includes("502")
  );
}

/** Exponential backoff retry for transient failures. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  label = "operation"
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = isRetryableError(error);
      if (!retryable || attempt >= policy.maxAttempts) break;

      const wait = computeBackoff(attempt, policy);
      logger.warn(`${label} retry`, {
        attempt,
        waitMs: wait,
        error: error instanceof Error ? error.message : String(error),
      });
      await delay(wait);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`${label} failed after ${policy.maxAttempts} attempts`);
}

/** Safe fallback when primary data source fails. */
export async function withSafeFallback<T>(
  primary: () => Promise<DataResult<T>>,
  fallback: () => T,
  label: string
): Promise<T> {
  try {
    const result = await primary();
    if (result.ok) return result.data;
    logger.warn(`${label} primary failed`, { error: result.error });
  } catch (error) {
    logger.error(`${label} primary threw`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return fallback();
}

export const EMPTY_DASHBOARD_FALLBACK: OperasyonDashboardData = {
  period: "7",
  dosyalar: [],
  operasyon: {
    toplamAktif: 0,
    bugunAcilan: 0,
    tedarikSurecinde: 0,
    eksperBekleyen: 0,
    onarimda: 0,
    pertIncelemesinde: 0,
    pertOnaylandi: 0,
    bugunKapanan: 0,
  },
  finans: {
    odemeBekleyen: 0,
    kismiOdenen: 0,
    tamamlananOdeme: 0,
    toplamTahsilat: 0,
    kapananDosyaTutari: 0,
    aktifDosyaTahminiTutari: 0,
    tahsilatBekleyen: 0,
    toplamDosyaTutari: 0,
    bekleyenTutar: 0,
    sonOdemeHareketleri: [],
  },
  gecikenDosyalar: [],
  personel: { bugunIslemSayisi: 0, kullanicilar: [] },
  sonAktiviteler: [],
  grafikler: {
    durumDagilimi: [],
    odemeDagilimi: [],
    gunlukAcilanDosya: [],
  },
  report: {
    period: "7",
    periodLabel: "7 Gün",
    generatedAt: new Date().toISOString(),
    operasyon: {
      toplamAktif: 0,
      bugunAcilan: 0,
      tedarikSurecinde: 0,
      eksperBekleyen: 0,
      onarimda: 0,
      pertIncelemesinde: 0,
      pertOnaylandi: 0,
      bugunKapanan: 0,
    },
    finans: {
      odemeBekleyen: 0,
      kismiOdenen: 0,
      tamamlananOdeme: 0,
      toplamTahsilat: 0,
      kapananDosyaTutari: 0,
      aktifDosyaTahminiTutari: 0,
      tahsilatBekleyen: 0,
      toplamDosyaTutari: 0,
      bekleyenTutar: 0,
      sonOdemeHareketleri: [],
    },
    gecikenDosyalar: [],
    personel: { bugunIslemSayisi: 0, kullanicilar: [] },
    sonAktiviteler: [],
    grafikler: {
      durumDagilimi: [],
      odemeDagilimi: [],
      gunlukAcilanDosya: [],
    },
  },
};

export const EMPTY_ALERTS_FALLBACK: AlertSummary = {
  riskCount: 0,
  kritikCount: 0,
  odemeGecikmeCount: 0,
  pertIncelemesindeCount: 0,
  total: 0,
};

export function emptyEventsFallback(): PaginatedEvents {
  return {
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false,
  };
}

export function emptyDosyaFallback(): DataResult<ServisDosyasi | null> {
  return fail("Dosya yüklenemedi — geçici hata.");
}

/** Graceful degradation: return DataResult with fallback data on failure. */
export async function recoverDataResult<T>(
  fn: () => Promise<DataResult<T>>,
  fallback: T,
  label: string
): Promise<DataResult<T>> {
  try {
    const result = await fn();
    if (result.ok) return result;
    logger.warn(`${label} degraded`, { error: result.error });
    return ok(fallback);
  } catch (error) {
    logger.error(`${label} recovery`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return ok(fallback);
  }
}
