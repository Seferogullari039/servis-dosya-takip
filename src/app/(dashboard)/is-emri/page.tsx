import { AppShell } from "@/components/layout/AppShell";
import { IsEmriYeniClient } from "@/components/is-emri/IsEmriYeniClient";

export default function IsEmriPage() {
  return (
    <AppShell title="Yeni İş Emri">
      <IsEmriYeniClient />
    </AppShell>
  );
}
