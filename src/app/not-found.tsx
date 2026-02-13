import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { NotFoundTracker } from "@/components/Analytics/NotFoundTracker";

export default function NotFound() {
  return (
    <>
      <NotFoundTracker />
      <ResourceNotFound
        message="Page not found."
        ctaHref="/"
        ctaLabel="Go home"
        decorated
        showCTA
      />
    </>
  );
}
