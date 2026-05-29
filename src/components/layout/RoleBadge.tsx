import { Badge } from "@/components/ui/Badge";
import type { UserRole } from "@/lib/auth/types";

const roleConfig: Record<
  UserRole,
  { label: string; variant: "default" | "info" | "success" }
> = {
  admin: { label: "Yönetici", variant: "info" },
  personel: { label: "Personel", variant: "default" },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
