/**
 * Read optimization plan — hot paths, cache candidates, query profiling map.
 * Static documentation + runtime metadata for production tuning.
 */

export type QueryHotness = "hot" | "warm" | "cold";
export type CacheCandidate = "yes" | "partial" | "no";

export interface QueryProfileEntry {
  id: string;
  description: string;
  location: string;
  hotness: QueryHotness;
  cacheCandidate: CacheCandidate;
  cacheKey?: string;
  cacheTtlMs?: number;
  supabaseQueries: number;
  notes?: string;
}

export const QUERY_OPTIMIZATION_PLAN: QueryProfileEntry[] = [
  {
    id: "dashboard.aggregation",
    description: "Operasyon dashboard — dosyalar + events aggregation",
    location: "src/lib/data/dashboard.ts → fetchDashboardAggregation",
    hotness: "hot",
    cacheCandidate: "yes",
    cacheKey: "dashboard:{period}",
    cacheTtlMs: 30_000,
    supabaseQueries: 2,
    notes: "Primary hot path. Reduced from 4 queries. TTL cache via appCache.",
  },
  {
    id: "dashboard.alerts",
    description: "TopBar alerts summary",
    location: "src/lib/data/dashboard.ts → getCachedAlertSummary",
    hotness: "hot",
    cacheCandidate: "yes",
    cacheKey: "alerts:summary",
    cacheTtlMs: 30_000,
    supabaseQueries: 0,
    notes: "Cache hit = 0 queries. Miss delegates to dashboard aggregation.",
  },
  {
    id: "dosyalar.list",
    description: "Dosya listesi (arama ile)",
    location: "src/lib/data/dosyalar.ts → listeleDosyalar",
    hotness: "hot",
    cacheCandidate: "partial",
    supabaseQueries: 1,
    notes: "User-specific via RLS. Short TTL cache possible per search term (future).",
  },
  {
    id: "dosyalar.detail",
    description: "Tek dosya detayı",
    location: "src/lib/data/dosyalar.ts → getDosyaById",
    hotness: "warm",
    cacheCandidate: "no",
    supabaseQueries: 1,
    notes: "Freshness critical after quick actions.",
  },
  {
    id: "events.timeline",
    description: "Dosya timeline (paginated)",
    location: "src/lib/data/events.ts → listEventsByServiceFileId",
    hotness: "warm",
    cacheCandidate: "no",
    supabaseQueries: 2,
    notes: "Count + data query. Max page size 100.",
  },
  {
    id: "documents.list",
    description: "Evrak listesi + signed URLs",
    location: "src/lib/data/documents.ts → listDocumentsByServiceFileId",
    hotness: "cold",
    cacheCandidate: "no",
    supabaseQueries: 2,
    notes: "Signed URLs expire — avoid long cache.",
  },
  {
    id: "pdf.fetch",
    description: "PDF generation data bundle",
    location: "src/lib/pdf/fetch-pdf-data.ts",
    hotness: "cold",
    cacheCandidate: "no",
    supabaseQueries: 3,
    notes: "On-demand export path.",
  },
];

export const SUPABASE_QUERY_REDUCTION_MAP = {
  before: {
    dashboardPageLoad: 13,
    dashboardAggregation: 4,
  },
  after: {
    dashboardPageLoad: 2,
    dashboardAggregation: 2,
    alertsCacheHit: 0,
  },
  reductionPercent: {
    dashboardPageLoad: Math.round((1 - 2 / 13) * 100),
    dashboardAggregation: Math.round((1 - 2 / 4) * 100),
  },
} as const;

export function getHotPathQueries(): QueryProfileEntry[] {
  return QUERY_OPTIMIZATION_PLAN.filter((q) => q.hotness === "hot");
}

export function getCacheCandidates(): QueryProfileEntry[] {
  return QUERY_OPTIMIZATION_PLAN.filter((q) => q.cacheCandidate === "yes");
}

export function getDashboardProfilingReport(): {
  hotPaths: QueryProfileEntry[];
  cacheCandidates: QueryProfileEntry[];
  reduction: typeof SUPABASE_QUERY_REDUCTION_MAP;
  recommendations: string[];
} {
  return {
    hotPaths: getHotPathQueries(),
    cacheCandidates: getCacheCandidates(),
    reduction: SUPABASE_QUERY_REDUCTION_MAP,
    recommendations: [
      "Keep dashboard cache TTL at 30s for multi-user consistency.",
      "Implement Redis adapter when running >1 server instance.",
      "Consider Supabase RPC for geciken dosyalar at >10k files.",
      "Monitor events table growth; archive policy at 500k+ rows.",
    ],
  };
}
