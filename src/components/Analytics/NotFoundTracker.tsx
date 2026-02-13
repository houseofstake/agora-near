"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function NotFoundTracker() {
  const { trackGenericEvent } = useAnalytics();

  useEffect(() => {
    trackGenericEvent("Error Displayed", {
      error_code: "404",
      error_message: "Page Not Found",
      component: "GlobalNotFound",
    });
  }, [trackGenericEvent]);

  return null;
}
