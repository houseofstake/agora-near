"use client";

import { useDelegates } from "@/hooks/useDelegates";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import DelegateCardList from "./DelegateCardList";
import DelegateTable from "./DelegateTable";
import { DelegateCardLoadingState } from "./DelegateCardWrapper";
import { useNear } from "@/contexts/NearContext";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useWalletPopup } from "@/hooks/useWalletPopup";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useRef } from "react";

export default function DelegateContent({
  isPendingFilter,
  isPendingSort,
}: {
  isPendingFilter: boolean;
  isPendingSort: boolean;
}) {
  const [orderByParam] = useQueryState("order_by");
  const [filterParam] = useQueryState("filter");

  const [layout] = useQueryState("layout", {
    defaultValue: "grid",
  });

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useDelegates({
      pageSize: 10,
      orderBy: orderByParam,
      filter: filterParam,
    });

  const { signedAccountId } = useNear();
  const [showDialog, setShowDialog] = useState(false);
  const openDialog = useOpenDialog();
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;
  const { hasDismissedPopup } = useWalletPopup();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!signedAccountId && !showDialog && isDelegationEncouragementEnabled) {
        if (!hasDismissedPopup) {
          openDialog({
            type: "ENCOURAGE_CONNECT_WALLET",
            params: {},
          });
          setShowDialog(true);
        }
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [
    signedAccountId,
    showDialog,
    openDialog,
    isDelegationEncouragementEnabled,
    hasDismissedPopup,
  ]);

  const { trackDelegatePageViewed } = useAnalytics();
  const hasTrackedInitialLoad = useRef(false);

  useEffect(() => {
    if (!isLoading && data && !hasTrackedInitialLoad.current) {
      hasTrackedInitialLoad.current = true;
      trackDelegatePageViewed({
        delegates_count: data.length, // approximate for first page
        filter_applied: filterParam || "all",
        sort_by: orderByParam || "default",
      });
    }
  }, [isLoading, data, filterParam, orderByParam, trackDelegatePageViewed]);

  const onLoadMore = useCallback(() => {
    if (!hasNextPage || isLoading || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  }, [hasNextPage, isLoading, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <DelegateCardLoadingState />;
  }

  return layout === "grid" ? (
    <DelegateCardList
      delegates={data}
      hasMore={hasNextPage}
      onLoadMore={onLoadMore}
      isDelegatesFiltering={isPendingFilter || isPendingSort}
      orderByParam={orderByParam}
      filterParam={filterParam}
    />
  ) : (
    <DelegateTable
      delegates={data}
      hasMore={hasNextPage}
      onLoadMore={onLoadMore}
      isDelegatesFiltering={isPendingFilter || isPendingSort}
      orderByParam={orderByParam}
      filterParam={filterParam}
    />
  );
}
