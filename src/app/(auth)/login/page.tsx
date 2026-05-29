import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SetupRequired } from "@/components/auth/SetupRequired";
import { getLoginMessageFromReason } from "@/lib/auth/errors";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hasSupabaseEnv } from "@/lib/supabase/env";

interface PageProps {
  searchParams: Promise<{ reason?: string; redirect?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { reason, redirect: redirectTo } = await searchParams;

  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-4">
        <SetupRequired />
        <a
          href="/setup"
          className="mt-4 text-sm font-medium text-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Supabase key&apos;lerini yapıştır → /setup
        </a>
      </div>
    );
  }

  const user = await getCurrentUser();

  if (user) {
    redirect(redirectTo?.startsWith("/") ? redirectTo : "/");
  }

  const reasonMessage = getLoginMessageFromReason(reason);
  const safeRedirect =
    redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-4">
      <LoginForm redirectTo={safeRedirect} reasonMessage={reasonMessage} />
    </div>
  );
}
