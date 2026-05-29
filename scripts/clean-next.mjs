import { existsSync, rmSync } from "fs";
import { join } from "path";

const targets = [".next", join("node_modules", ".cache")];

for (const dir of targets) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`${dir} silindi.`);
  }
}

console.log("Önbellek temizlendi. npm run dev ile yeniden başlatın.");
