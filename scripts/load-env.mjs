import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

/** .env.local değerlerini yükler; OS/shell env üzerine yazar (Next.js varsayılanı bunu yapmaz). */
export function loadEnvLocal(override = true) {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}
