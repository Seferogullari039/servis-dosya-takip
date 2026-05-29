import { AuthProvider } from "@/components/layout/AuthProvider";
import { PushNotificationPrompt } from "@/components/push/PushNotificationPrompt";
import { PushNotificationProvider } from "@/components/push/PushNotificationProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { requireAuth } from "@/lib/auth/require-auth";
import { getPushDashboardStatus } from "@/lib/push/status";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const pushStatus = await getPushDashboardStatus(session.user.id);

  return (
    <AuthProvider session={session}>
      <ToastProvider>
        <PushNotificationProvider initial={pushStatus}>
          {children}
          <PushNotificationPrompt />
        </PushNotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
