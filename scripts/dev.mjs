import { spawn } from "child_process";
import { resolve } from "path";
import { ensureNextCacheHealthy } from "./ensure-next-cache.mjs";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal(true);
ensureNextCacheHealthy();

const nextBin = resolve("node_modules/next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
