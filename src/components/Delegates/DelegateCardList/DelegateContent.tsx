"use client";

import { useDelegates } from "@/hooks/useDelegates";
import { useDelegateSearch } from "@/hooks/useDelegateSearch";
import { searchResultToDelegateProfile } from "@/lib/api/delegates/types";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [searchQuery] = useQueryState("q", { defaultValue: "", clearOnDefault: true });
  const [issuesParam] = useQueryState("issues", { defaultValue: "", clearOnDefault: true });

  const [layout] = useQueryState("layout", {
    defaultValue: "grid",
  });

  const isSearchMode = !!searchQuery?.trim();

  const { data: browseData, hasNextPage, fetchNextPage, isLoading: isBrowseLoading, isFetchingNextPage } =
    useDelegates({
      pageSize: 10,
      orderBy: orderByParam,
      filter: filterParam,
    });

  const { data: searchData, isLoading: isSearchLoading } = useDelegateSearch(
    searchQuery?.trim() ?? "",
    {
      orderBy: orderByParam,
      filterParam,
      issuesParam: issuesParam || null,
      limit: 50,
    }
  );

  const delegates = useMemo(() => {
    if (isSearchMode && searchData) {
      return searchData.delegates.map(searchResultToDelegateProfile);
    }
    return browseData ?? [];
  }, [isSearchMode, searchData, browseData]);

  const isLoading = isSearchMode ? isSearchLoading : isBrowseLoading;

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
    if (!isLoading && delegates.length >= 0 && !hasTrackedInitialLoad.current) {
      hasTrackedInitialLoad.current = true;
      trackDelegatePageViewed({
        delegates_count: delegates.length,
        filter_applied: filterParam || "all",
        sort_by: orderByParam || "default",
      });
    }
  }, [isLoading, delegates, filterParam, orderByParam, trackDelegatePageViewed]);

  const onLoadMore = useCallback(() => {
    if (isSearchMode || !hasNextPage || isLoading || isFetchingNextPage) {
      return;
    }
    fetchNextPage();
  }, [isSearchMode, hasNextPage, isLoading, isFetchingNextPage, fetchNextPage]);

  const hasMore = isSearchMode ? false : hasNextPage;

  if (isLoading) {
    return <DelegateCardLoadingState />;
  }

  return layout === "grid" ? (
    <DelegateCardList
      delegates={delegates}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      isDelegatesFiltering={isPendingFilter || isPendingSort}
      orderByParam={orderByParam}
      filterParam={filterParam}
    />
  ) : (
    <DelegateTable
      delegates={delegates}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      isDelegatesFiltering={isPendingFilter || isPendingSort}
      orderByParam={orderByParam}
      filterParam={filterParam}
    />
  );
}
