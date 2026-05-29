import { readdirSync, readFileSync } from "fs";
import path from "path";
import pg from "pg";

const PROJECT_REF = "adtweartmsfwtuuhhqtr";

function buildDbUrl(password: string): string {
  return `postgresql://postgres:${encodeURIComponent(password.trim())}@db.${PROJECT_REF}.supabase.co:5432/postgres`;
}

export async function applyMigrations(
  dbPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const migDir = path.join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(migDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new pg.Client({
    connectionString: buildDbUrl(dbPassword),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    for (const file of files) {
      const sql = readFileSync(path.join(migDir, file), "utf8");
      await client.query(sql);
    }

    await client.query("NOTIFY pgrst, 'reload schema'");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("password authentication failed")) {
      return {
        ok: false,
        error:
          "Veritabanı şifresi hatalı. Supabase → Settings → Database → Database password.",
      };
    }
    return { ok: false, error: message };
  } finally {
    await client.end();
  }
}
