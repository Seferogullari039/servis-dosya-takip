import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_EMAIL = "admin@servis.local";
const DEFAULT_PASSWORD = "Admin123!";
const DEFAULT_NAME = "Sistem Yöneticisi";

/**
 * Development-only: örnek admin kullanıcı oluşturur.
 * POST /api/dev/seed-admin
 * Gövde (opsiyonel): { "email", "password", "fullName" }
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Bu endpoint yalnızca development ortamında kullanılabilir." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email =
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim()
        : process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL;
    const password =
      typeof body.password === "string" && body.password
        ? body.password
        : process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
    const fullName =
      typeof body.fullName === "string" && body.fullName.trim()
        ? body.fullName.trim()
        : DEFAULT_NAME;

    const admin = createAdminClient();

    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    if (found) {
      userId = found.id;
      await admin.auth.admin.updateUserById(userId, {
        password,
        user_metadata: { full_name: fullName, role: "admin" },
      });
    } else {
      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: "admin" },
        });

      if (createError || !created.user) {
        return NextResponse.json(
          { error: createError?.message ?? "Kullanıcı oluşturulamadı." },
          { status: 400 }
        );
      }
      userId = created.user.id;
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        role: "admin",
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      email,
      password,
      message:
        "Admin kullanıcı hazır. Bu şifreyi yalnızca development ortamında kullanın.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Seed işlemi başarısız.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
