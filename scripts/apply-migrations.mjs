import { readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import pg from "pg";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal(true);

const password = process.argv[2] ?? process.env.SUPABASE_DB_PASSWORD;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!password?.trim()) {
  console.error("Veritabanı şifresi gerekli.");
  console.error("Kullanım: npm run db:migrate -- <sifre>");
  console.error("veya .env.local içinde SUPABASE_DB_PASSWORD tanımlayın.");
  process.exit(1);
}

if (!projectRef) {
  console.error("NEXT_PUBLIC_SUPABASE_URL geçersiz veya eksik.");
  process.exit(1);
}

const dbUrl = `postgresql://postgres:${encodeURIComponent(password.trim())}@db.${projectRef}.supabase.co:5432/postgres`;
const migDir = resolve("supabase/migrations");
const files = readdirSync(migDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`Bağlandı: db.${projectRef}.supabase.co`);

  for (const file of files) {
    const sql = readFileSync(join(migDir, file), "utf8");
    process.stdout.write(`${file} ... `);
    await client.query(sql);
    console.log("OK");
  }

  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log(`Migration tamamlandı (${files.length} dosya).`);
} catch (e) {
  console.error("Migration hatası:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await client.end();
}
