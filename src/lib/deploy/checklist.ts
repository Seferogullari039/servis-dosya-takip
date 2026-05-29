import { logger } from "@/lib/logging";

export interface EnvVarSpec {
  name: string;
  required: boolean;
  /** Must not be exposed to client bundle */
  serverOnly?: boolean;
  /** Placeholder values that fail validation */
  invalidPlaceholders?: string[];
}

export const REQUIRED_ENV_VARS: EnvVarSpec[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    invalidPlaceholders: ["https://your-project.supabase.co"],
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    invalidPlaceholders: ["your-anon-key"],
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    serverOnly: true,
    invalidPlaceholders: ["your-service-role-key"],
  },
];

export const OPTIONAL_ENV_VARS: EnvVarSpec[] = [
  { name: "SEED_ADMIN_EMAIL", required: false },
  { name: "SEED_ADMIN_PASSWORD", required: false, serverOnly: true },
  { name: "CACHE_BACKEND", required: false },
  { name: "REDIS_URL", required: false, serverOnly: true },
  { name: "LOG_LEVEL", required: false },
  { name: "READONLY_MODE", required: false },
  { name: "SAFE_MODE", required: false },
  { name: "FEATURE_FREEZE", required: false },
];

export interface EnvValidationIssue {
  variable: string;
  message: string;
  severity: "error" | "warning";
}

export interface EnvValidationResult {
  ok: boolean;
  issues: EnvValidationIssue[];
}

function isPlaceholder(value: string, placeholders?: string[]): boolean {
  if (!placeholders) return false;
  return placeholders.some((p) => value.trim() === p);
}

export function validateEnvironment(
  env: NodeJS.ProcessEnv = process.env
): EnvValidationResult {
  const issues: EnvValidationIssue[] = [];

  for (const spec of REQUIRED_ENV_VARS) {
    const value = env[spec.name];
    if (!value?.trim()) {
      issues.push({
        variable: spec.name,
        message: "Required environment variable is missing",
        severity: "error",
      });
      continue;
    }
    if (isPlaceholder(value, spec.invalidPlaceholders)) {
      issues.push({
        variable: spec.name,
        message: "Still using placeholder value from .env.example",
        severity: "error",
      });
    }
  }

  if (env.CACHE_BACKEND === "redis" && !env.REDIS_URL?.trim()) {
    issues.push({
      variable: "REDIS_URL",
      message: "CACHE_BACKEND=redis requires REDIS_URL",
      severity: "error",
    });
  }

  if (env.NODE_ENV === "production" && env.SEED_ADMIN_PASSWORD) {
    issues.push({
      variable: "SEED_ADMIN_PASSWORD",
      message: "Seed credentials should not be set in production",
      severity: "warning",
    });
  }

  return {
    ok: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}

export interface BuildSafetyResult {
  ok: boolean;
  checks: { name: string; passed: boolean; message?: string }[];
}

/** Build-time safety checks (run in CI or startup). */
export function runBuildSafetyChecks(
  env: NodeJS.ProcessEnv = process.env
): BuildSafetyResult {
  const envResult = validateEnvironment(env);
  const checks = [
    {
      name: "environment",
      passed: envResult.ok,
      message: envResult.ok
        ? undefined
        : envResult.issues.map((i) => `${i.variable}: ${i.message}`).join("; "),
    },
    {
      name: "node_version",
      passed: parseInt(process.versions.node.split(".")[0] ?? "0", 10) >= 18,
      message: "Node.js 18+ required",
    },
    {
      name: "production_secret_exposure",
      passed: !env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      message: "Service role key must not use NEXT_PUBLIC_ prefix",
    },
  ];

  return {
    ok: checks.every((c) => c.passed),
    checks,
  };
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    name: string;
    status: "pass" | "fail" | "warn";
    message?: string;
  }[];
}

/** Runtime health check helper (no DB ping — avoids extra query). */
export function runRuntimeHealthCheck(
  env: NodeJS.ProcessEnv = process.env
): HealthCheckResult {
  const envValidation = validateEnvironment(env);
  const checks: HealthCheckResult["checks"] = [
    {
      name: "env",
      status: envValidation.ok ? "pass" : "fail",
      message: envValidation.ok
        ? undefined
        : envValidation.issues.map((i) => i.variable).join(", "),
    },
    {
      name: "readonly_mode",
      status: env.READONLY_MODE === "true" ? "warn" : "pass",
      message:
        env.READONLY_MODE === "true" ? "Readonly mode active" : undefined,
    },
    {
      name: "safe_mode",
      status: env.SAFE_MODE === "true" ? "warn" : "pass",
      message: env.SAFE_MODE === "true" ? "Safe mode active" : undefined,
    },
  ];

  const hasFail = checks.some((c) => c.status === "fail");
  const hasWarn = checks.some((c) => c.status === "warn");

  return {
    status: hasFail ? "unhealthy" : hasWarn ? "degraded" : "healthy",
    timestamp: new Date().toISOString(),
    checks,
  };
}

export const DEPLOYMENT_CHECKLIST = [
  "Run all Supabase migrations (001–007) in order",
  "Set production env vars (no placeholders)",
  "Disable /api/dev/seed-admin in production",
  "Configure Supabase Auth email provider",
  "Set LOG_LEVEL=warn in production",
  "Verify RLS policies on servis_dosyalari, events, documents",
  "Configure Storage bucket service-documents (private)",
  "Run npm run build successfully",
  "Smoke test: login, dashboard, dosya list, quick action",
] as const;

/** Log deployment checklist issues at startup (server only). */
export function assertDeploymentReady(): void {
  const build = runBuildSafetyChecks();
  if (!build.ok && process.env.NODE_ENV === "production") {
    logger.error("Deployment safety check failed", {
      checks: build.checks.filter((c) => !c.passed),
    });
  }
}
