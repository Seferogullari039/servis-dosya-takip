/**
 * Development admin seed (CLI)
 * Kullanım: node --env-file=.env.local scripts/seed-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_ADMIN_EMAIL ?? "admin@servis.local";
const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
const fullName = "Sistem Yöneticisi";

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list } = await admin.auth.admin.listUsers();
const existing = list?.users?.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase()
);

let userId;

if (existing) {
  userId = existing.id;
  await admin.auth.admin.updateUserById(userId, {
    password,
    user_metadata: { full_name: fullName, role: "admin" },
  });
  console.log("Mevcut kullanıcı güncellendi:", email);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin" },
  });
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log("Yeni admin oluşturuldu:", email);
}

const { error: profileError } = await admin.from("profiles").upsert({
  id: userId,
  full_name: fullName,
  role: "admin",
  is_active: true,
});

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

console.log("Profil admin olarak ayarlandı.");
console.log("Giriş:", email, "/", password);
