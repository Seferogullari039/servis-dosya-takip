import { cn } from "@/lib/utils/cn";

interface StateMessageProps {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = "Bir hata oluştu",
  description,
  className,
  action,
}: Partial<StateMessageProps>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/50",
        className
      )}
      role="alert"
    >
      <p className="font-medium text-red-800 dark:text-red-200">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function EmptyState({
  title = "Kayıt bulunamadı",
  description = "Henüz servis dosyası eklenmemiş veya aramanızla eşleşen sonuç yok.",
  className,
  action,
}: Partial<StateMessageProps>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-8 text-center",
        className
      )}
    >
      <p className="font-medium text-ink">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = "Yükleniyor…" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  );
}
