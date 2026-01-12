import { useHosActivity } from "@/hooks/useHosActivity";
import { HosActivity } from "@/lib/api/delegates/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { memo, useCallback, useEffect, useRef, useMemo } from "react";
import TokenAmount from "../shared/TokenAmount";
import { Skeleton } from "../ui/skeleton";

type Props = {
  address?: string;
};

type HosActivityRowProps = {
  activity: HosActivity;
};

const HosActivityRow = memo(({ activity }: HosActivityRowProps) => {
  const getTransactionTypeDisplay = useCallback((type: string | null) => {
    if (!type) return "-";

    switch (type) {
      case "lock":
        return "Lock";
      case "unlock":
        return "Unlock";
      case "inbound_delegation":
        return "Delegated from";
      case "outbound_delegation":
        return "Delegated to";
      case "initial_registration":
        return "Registration";
      case "withdraw":
        return "Withdraw";
      case "unstake":
        return "Unstake";
      default:
        return "Unknown";
    }
  }, []);

  const getAmountColorClass = useCallback((type: string | null) => {
    if (!type) return "text-gray-500";

    switch (type) {
      case "lock":
      case "inbound_delegation":
      case "initial_registration":
        return "text-green-600";
      case "unlock":
      case "outbound_delegation":
      case "withdraw":
      case "unstake":
        return "text-red-600";
      default:
        return "text-gray-900";
    }
  }, []);

  const getAmountPrefix = useCallback((type: string | null | undefined) => {
    if (!type) return "";

    switch (type) {
      case "lock":
      case "inbound_delegation":
      case "initial_registration":
        return "+";
      case "unlock":
      case "outbound_delegation":
      case "withdraw":
      case "unstake":
        return "-";
      default:
        return "";
    }
  }, []);

  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="hidden md:table-cell py-4 text-sm text-gray-900">
        {activity.eventDate ? (
          <span>{format(new Date(activity.eventDate), "M/d/yy")}</span>
        ) : (
          "-"
        )}
      </td>
      <td className="py-4 text-sm text-gray-900">
        {activity.transactionType
          ? getTransactionTypeDisplay(activity.transactionType)
          : "-"}
      </td>
      <td
        className={cn(
          "py-4 text-sm",
          activity.transactionType
            ? getAmountColorClass(activity.transactionType)
            : "text-gray-500"
        )}
      >
        {activity.nearAmount ? (
          <span>
            {getAmountPrefix(activity.transactionType)}
            <TokenAmount amount={activity.nearAmount} currency="veNEAR" />
          </span>
        ) : (
          "-"
        )}
      </td>
      <td className="hidden md:table-cell py-4 text-sm text-gray-900">
        {activity.lockedNearBalance ? (
          <TokenAmount amount={activity.lockedNearBalance} />
        ) : (
          "No change"
        )}
      </td>
    </tr>
  );
});

HosActivityRow.displayName = "HosActivityRow";

export const HosActivityTable = memo(({ address }: Props) => {
  const {
    activities,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useHosActivity({
    address,
  });

  const filteredActivities = useMemo(
    () =>
      activities.filter(
        (activity) => activity.transactionType !== "outbound_delegation"
      ),
    [activities]
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading activity: {error?.message || "Unknown error"}
      </div>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No activity found</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="hidden md:table-cell text-left py-3 text-sm font-semibold text-gray-900">
              Date
            </th>
            <th className="text-left py-3 text-sm font-semibold text-gray-900">
              Action
            </th>
            <th className="text-left py-3 text-sm font-semibold text-gray-900">
              Change in Voting Power
            </th>
            <th className="hidden md:table-cell text-left py-3 text-sm font-semibold text-gray-900">
              New Locked Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.map((activity, index) => (
            <HosActivityRow
              key={`${activity?.receiptId}-${index}`}
              activity={activity}
            />
          ))}
        </tbody>
      </table>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-4">
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        )}
      </div>
    </div>
  );
});

HosActivityTable.displayName = "HosActivityTable";
