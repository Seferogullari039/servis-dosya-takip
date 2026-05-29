import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import type { ServiceFileEventType } from "@/types/events";

const eventConfig: Record<
  ServiceFileEventType,
  { label: string; className: string }
> = {
  created: {
    label: "Oluşturuldu",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
  },
  updated: {
    label: "Güncellendi",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  },
  status_changed: {
    label: "Durum",
    className:
      "bg-orange-50 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300",
  },
  payment_changed: {
    label: "Ödeme",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
  },
  note_added: {
    label: "Not",
    className:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300",
  },
  expert_assigned: {
    label: "Eksper",
    className:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300",
  },
  document_uploaded: {
    label: "Evrak",
    className:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300",
  },
};

export function EventBadge({ type }: { type: ServiceFileEventType }) {
  const config = eventConfig[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
