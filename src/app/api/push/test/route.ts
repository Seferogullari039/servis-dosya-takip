import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { sendTestPushToUser } from "@/lib/push/dispatch";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const profile = await getCurrentProfile();
  if (!profile?.is_active || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Yalnızca admin kullanıcı test gönderebilir." },
      { status: 403 }
    );
  }

  const result = await sendTestPushToUser(user.id);

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
