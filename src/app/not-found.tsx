import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";

export default function NotFound() {
  const { trackGenericEvent } = useAnalytics();

  useEffect(() => {
    trackGenericEvent("Error Displayed", {
      error_code: "404",
      error_message: "Page Not Found",
      component: "GlobalNotFound",
    });
  }, [trackGenericEvent]);

  return (
    <ResourceNotFound
      message="Page not found."
      ctaHref="/"
      ctaLabel="Go home"
      decorated
      showCTA
    />
  );
}
