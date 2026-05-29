import { existsSync, readdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";

/**
 * Bozuk .next: sayfa bundle'ı var ama webpack chunk (ör. 331.js) yok.
 * NOT: @supabase serverExternalPackages ile vendor-chunks'ta olmayabilir — bu normal.
 */
function findMissingServerChunks(nextDir) {
  const serverDir = join(nextDir, "server");
  if (!existsSync(serverDir)) return [];

  const missing = [];
  const chunkRef = /require\("\.\/(\d+)\.js"\)/g;

  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (!ent.name.endsWith(".js")) continue;
      let text;
      try {
        text = readFileSync(full, "utf8");
      } catch {
        continue;
      }
      let match;
      while ((match = chunkRef.exec(text)) !== null) {
        const chunk = `${match[1]}.js`;
        const chunkPath = join(serverDir, chunk);
        if (!existsSync(chunkPath)) {
          missing.push(chunk);
        }
      }
    }
  }

  walk(join(serverDir, "app"));
  return [...new Set(missing)];
}

export function ensureNextCacheHealthy() {
  const root = process.cwd();
  const nextDir = join(root, ".next");
  if (!existsSync(nextDir)) return;

  const missingChunks = findMissingServerChunks(nextDir);
  const routesManifest = join(nextDir, "routes-manifest.json");
  const incompleteBuild =
    existsSync(join(nextDir, "server")) && !existsSync(routesManifest);

  const stale = missingChunks.length > 0 || incompleteBuild;

  if (stale) {
    const reason = missingChunks.length
      ? `eksik chunk: ${missingChunks.slice(0, 5).join(", ")}`
      : "eksik routes-manifest.json";
    console.warn(
      `[dev] Bozuk .next önbelleği algılandı (${reason}). Temizleniyor…`
    );
    rmSync(nextDir, { recursive: true, force: true });
    const nodeCache = join(root, "node_modules", ".cache");
    if (existsSync(nodeCache)) {
      rmSync(nodeCache, { recursive: true, force: true });
    }
  }
}
