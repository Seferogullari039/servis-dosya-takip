"use server";

import { writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { applyMigrations } from "@/lib/setup/apply-migrations";

export type SetupEnvState = {
  error?: string;
  success?: boolean;
};

const PROJECT_URL = "https://adtweartmsfwtuuhhqtr.supabase.co";
const SEED_EMAIL = "seferogullari@servis.com";
const SEED_PASSWORD = "Alper123";
const SEED_NAME = "Sistem Yöneticisi";

async function seedAdmin(url: string, serviceKey: string): Promise<string | null> {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find(
    (u) => u.email?.toLowerCase() === SEED_EMAIL.toLowerCase()
  );

  let userId: string;

  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: SEED_NAME, role: "admin" },
    });
    if (error) return error.message;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: SEED_NAME, role: "admin" },
    });
    if (error) return error.message;
    userId = data.user.id;
  }

  await new Promise((r) => setTimeout(r, 1500));

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    full_name: SEED_NAME,
    role: "admin",
    is_active: true,
  });

  if (profileError) return profileError.message;
  return null;
}

export async function saveEnvAction(
  _prev: SetupEnvState,
  formData: FormData
): Promise<SetupEnvState> {
  if (process.env.NODE_ENV === "production") {
    return { error: "Kurulum sayfası yalnızca development modunda kullanılabilir." };
  }

  const anonKey = String(formData.get("anonKey") ?? "").trim();
  const serviceKey = String(formData.get("serviceKey") ?? "").trim();
  const dbPassword = String(formData.get("dbPassword") ?? "").trim();

  if (!dbPassword) {
    return {
      error:
        "Veritabanı şifresi zorunlu. Supabase → Settings → Database → Database password.",
    };
  }

  if (!anonKey.startsWith("eyJ") || anonKey.length < 100) {
    return {
      error:
        "Anon key geçersiz. Supabase → Settings → API → anon public → Copy.",
    };
  }

  if (!serviceKey.startsWith("eyJ") || serviceKey.length < 100) {
    return {
      error:
        "Service role key geçersiz. Supabase → Settings → API → service_role → Reveal → Copy.",
    };
  }

  const content = `# Supabase — otomatik kurulum
NEXT_PUBLIC_SUPABASE_URL=${PROJECT_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}
SUPABASE_DB_PASSWORD=${dbPassword}

SEED_ADMIN_EMAIL=${SEED_EMAIL}
SEED_ADMIN_PASSWORD=${SEED_PASSWORD}
`;

  const envPath = path.join(process.cwd(), ".env.local");
  await writeFile(envPath, content, "utf8");

  const migrationResult = await applyMigrations(dbPassword);
  if (!migrationResult.ok) {
    return {
      error: `Migration çalıştırılamadı: ${migrationResult.error}`,
    };
  }

  const seedError = await seedAdmin(PROJECT_URL, serviceKey);
  if (seedError) {
    return {
      error: `Migration tamam ama admin oluşturulamadı: ${seedError}`,
    };
  }

  redirect("/setup?saved=1");
}
