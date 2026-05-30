import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginPageShell } from "@/components/auth/LoginPageShell";
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
      <LoginPageShell>
        <div className="w-full max-w-md text-center">
          <SetupRequired />
          <a
            href="/setup"
            className="mt-4 inline-block text-sm font-medium text-[#5ba3d4] underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]"
          >
            Supabase key&apos;lerini yapıştır → /setup
          </a>
        </div>
      </LoginPageShell>
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
    <LoginPageShell>
      <LoginForm redirectTo={safeRedirect} reasonMessage={reasonMessage} />
    </LoginPageShell>
  );
}
