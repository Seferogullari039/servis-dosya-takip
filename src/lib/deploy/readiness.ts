/**
 * Production readiness assessment — static analysis + architecture review.
 * Run manually or import in CI smoke scripts.
 */

import { getDashboardProfilingReport } from "@/lib/queries/optimization-plan";
import { EVENT_SCHEMA_FREEZE_POLICY } from "@/lib/events/finalization";
import { DEPLOYMENT_CHECKLIST } from "@/lib/deploy/checklist";

export type RiskSeverity = "critical" | "medium" | "low";

export interface ProductionRisk {
  id: string;
  severity: RiskSeverity;
  title: string;
  mitigation: string;
}

export const PRODUCTION_RISKS: ProductionRisk[] = [
  {
    id: "cache.multi-instance",
    severity: "critical",
    title: "In-memory cache is per-process",
    mitigation: "Deploy Redis adapter (CACHE_BACKEND=redis) for multi-instance.",
  },
  {
    id: "events.dedup.process-local",
    severity: "medium",
    title: "Event idempotency is process-local (5s window)",
    mitigation: "Add DB idempotency_key unique index at scale.",
  },
  {
    id: "dashboard.full-scan",
    severity: "medium",
    title: "Dashboard loads all servis_dosyalari rows",
    mitigation: "SQL aggregate RPC when file count exceeds ~5k.",
  },
  {
    id: "events.limit",
    severity: "medium",
    title: "Dashboard events capped at 2000 rows",
    mitigation: "Archive old events; SQL-based geciken calculation.",
  },
  {
    id: "bulk.sequential",
    severity: "low",
    title: "Bulk updates run sequentially",
    mitigation: "Batch RPC or parallel with concurrency limit.",
  },
  {
    id: "pdf.server-memory",
    severity: "low",
    title: "PDF generation is CPU/memory intensive",
    mitigation: "Queue + worker for high PDF volume.",
  },
];

export interface ReadinessReport {
  score: number;
  grade: "A" | "B" | "C" | "D";
  summary: string;
  risks: {
    critical: ProductionRisk[];
    medium: ProductionRisk[];
    low: ProductionRisk[];
  };
  scalingBottlenecks: string[];
  checklistItems: readonly string[];
  eventSchemaVersion: string;
  queryReduction: ReturnType<typeof getDashboardProfilingReport>["reduction"];
}

function scoreFromRisks(risks: ProductionRisk[]): number {
  let score = 100;
  for (const r of risks) {
    if (r.severity === "critical") score -= 15;
    else if (r.severity === "medium") score -= 7;
    else score -= 3;
  }
  return Math.max(0, Math.min(100, score));
}

function gradeFromScore(score: number): ReadinessReport["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}

export function generateProductionReadinessReport(): ReadinessReport {
  const profiling = getDashboardProfilingReport();
  const score = scoreFromRisks(PRODUCTION_RISKS);

  return {
    score,
    grade: gradeFromScore(score),
    summary:
      "Production-ready for single-instance deployment with moderate load (<50 concurrent users, <5k files). Multi-instance requires Redis cache.",
    risks: {
      critical: PRODUCTION_RISKS.filter((r) => r.severity === "critical"),
      medium: PRODUCTION_RISKS.filter((r) => r.severity === "medium"),
      low: PRODUCTION_RISKS.filter((r) => r.severity === "low"),
    },
    scalingBottlenecks: [
      "Full-table servis_dosyalari scan on every dashboard cache miss",
      "service_file_events growth (2000 row in-memory slice for metrics)",
      "Process-local TTL cache (no cross-instance invalidation)",
      "Sequential bulk server actions",
      "Supabase connection pool per serverless invocation",
    ],
    checklistItems: DEPLOYMENT_CHECKLIST,
    eventSchemaVersion: EVENT_SCHEMA_FREEZE_POLICY.version,
    queryReduction: profiling.reduction,
  };
}
