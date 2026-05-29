import { AuthProvider } from "@/components/layout/AuthProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <AuthProvider session={session}>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}