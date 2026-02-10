"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function DelegatesSearch() {
  const router = useRouter();
  const [enteredName, setEnteredName] = useState("");
  const { trackDelegateSearchPerformed } = useAnalytics();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        trackDelegateSearchPerformed({
          search_query: enteredName,
          results_count: 0, // We don't know the count yet as it redirects
        });
        router.push(`/delegates/${enteredName}`);
      }}
    >
      <div className="w-full sm:w-auto flex flex-row items-center relative">
        <div className="absolute z-10 top-3 left-3">
          <MagnifyingGlassIcon className="text-secondary w-4 h-4" />
        </div>

        <TextInputWithTooltip
          onChange={(value) => setEnteredName(value)}
          placeholder="Exact address"
          tooltipMessage="Please input exact address. Partial and fuzzy search is not supported yet."
          className="py-2 pr-2 pl-8 rounded-full bg-wash border border-line w-full sm:w-auto placeholder-tertiary/50 text-secondary"
        />
      </div>
    </form>
  );
}
