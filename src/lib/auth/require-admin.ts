import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import type { AuthSession } from "@/lib/auth/types";

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();

  if (session.profile.role !== "admin") {
    redirect("/dashboard?error=unauthorized");
  }

  return session;
}
