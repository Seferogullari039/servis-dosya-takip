import { execSync } from "child_process";

/** Windows: 3000–3005 üzerindeki Next dev süreçlerini sonlandırır. */
const ports = [3000, 3001, 3002, 3003, 3004, 3005];

for (const port of ports) {
  try {
    const out = execSync(
      `netstat -ano | findstr ":${port} " | findstr LISTENING`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
    );
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Port ${port} → PID ${pid} kapatıldı.`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* port free */
  }
}

console.log("Dev portları temizlendi.");
