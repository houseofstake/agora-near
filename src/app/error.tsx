"use client";

import { useEffect } from "react";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { UpdatedButton } from "@/components/Button";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { trackGenericEvent } = useAnalytics();

  useEffect(() => {
    trackGenericEvent("Error Displayed", {
      error_code: (error as any).digest || "Unknown",
      error_message: error.message,
      component: "GlobalError",
    });
  }, [error, trackGenericEvent]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ResourceNotFound
        message="Something went wrong."
        ctaHref="/"
        ctaLabel="Go home"
        decorated
        showCTA
      />
      <div className="mt-4">
        <UpdatedButton
          type="secondary"
          variant="rounded"
          onClick={() => reset()}
        >
          Retry
        </UpdatedButton>
      </div>
    </div>
  );
}
