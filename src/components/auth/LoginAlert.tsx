import { cn } from "@/lib/utils/cn";

type LoginAlertVariant = "error" | "info";

interface LoginAlertProps {
  title: string;
  description?: string;
  variant?: LoginAlertVariant;
}

const variantStyles: Record<LoginAlertVariant, string> = {
  error:
    "border-red-400/35 bg-red-500/10 text-red-100 [&_svg]:text-red-300",
  info: "border-amber-400/35 bg-amber-500/10 text-amber-50 [&_svg]:text-amber-300",
};

export function LoginAlert({
  title,
  description,
  variant = "error",
}: LoginAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-left backdrop-blur-sm",
        variantStyles[variant]
      )}
    >
      <svg
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        {variant === "error" ? (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        )}
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed opacity-90">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
