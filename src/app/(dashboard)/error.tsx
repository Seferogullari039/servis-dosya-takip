"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/DataState";
import { ERROR_UI, toUserFriendlyError } from "@/lib/errors/user-messages";
import { logger } from "@/lib/logging";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardRouteError({
  error,
  reset,
}: RouteErrorProps) {
  if (isRedirectError(error)) {
    throw error;
  }

  useEffect(() => {
    logger.error("dashboard route error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md space-y-4">
        <ErrorState
          title={ERROR_UI.dashboard.title}
          description={toUserFriendlyError(error, ERROR_UI.dashboard.description)}
        />
        <Button fullWidth onClick={reset}>
          Tekrar dene
        </Button>
      </div>
    </div>
  );
}
