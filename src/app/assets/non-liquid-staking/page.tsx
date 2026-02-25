"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { useNear } from "@/contexts/NearContext";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useRefreshStakingPoolBalance } from "@/hooks/useRefreshStakingPoolBalance";
import CopyableHumanAddress from "@/components/shared/CopyableHumanAddress";
import { ExternalLink } from "lucide-react";
import { HoldingsSection } from "@/components/Assets/HoldingsSection";
import toast from "react-hot-toast";
import { UpdatedButton } from "@/components/Button";
import { useAnalytics } from "@/hooks/useAnalytics";

import { getRpcUrl } from "@/lib/utils";
import { JsonRpcProvider } from "@near-js/providers";

export default function NonLiquidOnboardingPage() {
  const openDialog = useOpenDialog();
  const { signedAccountId, networkId } = useNear();
  const nearblocksBase =
    networkId === "testnet"
      ? "https://testnet.nearblocks.io"
      : "https://nearblocks.io";
  const { trackGenericEvent } = useAnalytics();

  const { lockupAccountId, isLoading: isLoadingLockup } = useLockupAccount();

  const { stakingPoolId, isLoadingStakingPoolId: isLoadingPool } =
    useCurrentStakingPoolId({
      lockupAccountId: lockupAccountId ?? "",
      enabled: !!lockupAccountId,
    });

  const { refreshStakingPoolBalanceAsync } = useRefreshStakingPoolBalance({
    lockupAccountId: lockupAccountId ?? "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: venearAccountInfo } = useVenearAccountInfo(signedAccountId);

  // Check if lockup contract actually exists on-chain
  const [isLockupDeployed, setIsLockupDeployed] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    trackGenericEvent("Non-Liquid Staking Page Viewed", {});
  }, [trackGenericEvent]);

  useEffect(() => {
    if (!lockupAccountId) {
      setIsLockupDeployed(false);
      return;
    }

    let active = true;
    const checkLockup = async () => {
      try {
        const url = getRpcUrl(networkId, { useArchivalNode: false });
        const provider = new JsonRpcProvider({ url });

        await provider.query({
          request_type: "view_account",
          finality: "final",
          account_id: lockupAccountId,
        });
        if (active) setIsLockupDeployed(true);
      } catch (e) {
        console.warn("Lockup account check failed (likely not deployed):", e);
        if (active) setIsLockupDeployed(false);
      }
    };

    checkLockup();
    return () => {
      active = false;
    };
  }, [lockupAccountId, networkId]);

  // User has a valid lockup if:
  // 1. venearAccountInfo exists (registered in HoS)
  // 2. lockupAccountId is determined
  // 3. The lockup account actually exists on-chain
  const hasValidLockup =
    !!venearAccountInfo && !!lockupAccountId && isLockupDeployed;

  const onOpenStakingDialog = useCallback(() => {
    if (!hasValidLockup) {
      // New user or broken lockup -> Create Lockup (Onboarding)
      openDialog({
        type: "NEAR_LOCK",
        className: "sm:w-[500px]",
        params: {
          source: "onboarding",
        },
      });
    } else {
      // Existing user -> Manage Staking
      openDialog({
        type: "NEAR_STAKING",
        className: "sm:w-[500px]",
        params: {
          source: "account_management",
        },
      });
    }
  }, [hasValidLockup, openDialog]);

  const onOpenLockDialog = useCallback(() => {
    openDialog({
      type: "NEAR_LOCK",
      className: "sm:w-[500px]",
      params: {
        source: "account_management",
      },
    });
  }, [openDialog]);

  const onOpenUnlockDialog = useCallback(() => {
    openDialog({
      type: "NEAR_UNLOCK",
      params: {},
    });
  }, [openDialog]);

  const handleRefresh = useCallback(async () => {
    if (!lockupAccountId) return;
    setIsRefreshing(true);
    try {
      await refreshStakingPoolBalanceAsync();
      toast.success("Balance refreshed successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh balance");
    } finally {
      setIsRefreshing(false);
    }
  }, [lockupAccountId, refreshStakingPoolBalanceAsync]);

  const statusText = useMemo(() => {
    if (isLoadingLockup || isLoadingPool) return "Loading status...";
    if (hasValidLockup) {
      if (stakingPoolId) return "Lockup active, staking to pool.";
      return "Lockup active, no pool selected.";
    }
    return "No lockup found. Ready to onboard.";
  }, [isLoadingLockup, isLoadingPool, hasValidLockup, stakingPoolId]);

  return (
    <div className="flex min-h-screen flex-col gap-8 py-10">
      <div className="container mx-auto max-w-3xl flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Non-liquid Staking Pools
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your staking positions with non-liquid staking pools.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>
              Your current lockup and staking configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!signedAccountId ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <p className="text-muted-foreground">
                  Please connect your wallet to view your status.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">Account:</span>
                  <CopyableHumanAddress
                    address={signedAccountId}
                    shouldTruncate={false}
                  />
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">Lockup:</span>
                  {hasValidLockup ? (
                    <>
                      <CopyableHumanAddress
                        address={lockupAccountId!}
                        shouldTruncate={false}
                      />
                      <a
                        href={`${nearblocksBase}/address/${lockupAccountId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs text-primary hover:bg-muted"
                        aria-label="View lockup on NearBlocks"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </>
                  ) : (
                    <span className="font-medium">No lockup detected</span>
                  )}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">Staking Pool:</span>
                  {hasValidLockup ? (
                    stakingPoolId ? (
                      <>
                        <CopyableHumanAddress
                          address={stakingPoolId}
                          shouldTruncate={false}
                        />
                        <a
                          href={`${nearblocksBase}/address/${stakingPoolId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs text-primary hover:bg-muted"
                          aria-label="View staking pool on NearBlocks"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </>
                    ) : (
                      <span className="font-medium">—</span>
                    )
                  ) : (
                    <span className="font-medium">—</span>
                  )}
                </div>
                <Separator />
                <div className="text-sm">
                  <span className="text-muted-foreground">Summary:</span>{" "}
                  <span className="font-medium">{statusText}</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {signedAccountId ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Wallet connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-line bg-wash px-2 py-0.5 text-xs font-medium text-secondary">
                        Not connected
                      </span>
                    )}
                    {isLoadingLockup ? (
                      <span className="inline-flex items-center rounded-full border border-line bg-wash px-2 py-0.5 text-xs font-medium text-secondary">
                        Lockup loading
                      </span>
                    ) : hasValidLockup ? (
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Lockup set
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        No lockup
                      </span>
                    )}
                    {isLoadingPool ? (
                      <span className="inline-flex items-center rounded-full border border-line bg-wash px-2 py-0.5 text-xs font-medium text-secondary">
                        Pool loading
                      </span>
                    ) : stakingPoolId ? (
                      <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Pool selected
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-line bg-wash px-2 py-0.5 text-xs font-medium text-secondary">
                        No pool selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {signedAccountId && (
            <CardFooter className="flex flex-wrap gap-4 pt-4">
              <UpdatedButton
                onClick={onOpenStakingDialog}
                disabled={!signedAccountId || isLoadingLockup}
                className="w-full sm:w-auto"
                variant="rounded"
              >
                Stake
              </UpdatedButton>

              {hasValidLockup && (
                <>
                  <UpdatedButton
                    onClick={onOpenLockDialog}
                    disabled={!signedAccountId || isLoadingLockup}
                    type="secondary"
                    className="w-full sm:w-auto"
                    variant="rounded"
                  >
                    Lock
                  </UpdatedButton>
                  <UpdatedButton
                    onClick={onOpenUnlockDialog}
                    disabled={!signedAccountId || isLoadingLockup}
                    type="secondary"
                    className="w-full sm:w-auto"
                    variant="rounded"
                  >
                    Unlock
                  </UpdatedButton>
                </>
              )}

              <UpdatedButton
                onClick={handleRefresh}
                type="secondary"
                className="w-full sm:w-auto ml-auto"
                variant="rounded"
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh balance"}
              </UpdatedButton>
            </CardFooter>
          )}
        </Card>
      </div>
      {signedAccountId && (
        <div className="w-full mx-auto max-w-6xl px-4 md:px-8">
          <HoldingsSection />
        </div>
      )}
    </div>
  );
}
