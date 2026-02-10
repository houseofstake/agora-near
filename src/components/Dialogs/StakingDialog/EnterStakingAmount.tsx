import { UpdatedButton } from "@/components/Button";
import TokenAmount from "@/components/shared/TokenAmount";
import { Input } from "@/components/ui/input";
import { NEAR_TOKEN, NEAR_TOKEN_METADATA } from "@/lib/constants";
import { StakingPool } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import Big from "big.js";
import Image from "next/image";
import { useCallback, useState, useMemo } from "react";
import { useStakingProviderContext } from "../StakingProvider";
import { StakingDialogHeader } from "./StakingDialogHeader";
import { StakingOptionCard } from "./StakingOptionCard";
import { useIsPoolWhitelisted } from "@/hooks/useIsPoolWhitelisted";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import toast from "react-hot-toast";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useStakedBalance } from "@/hooks/useStakedBalance";
import { useAnalytics } from "@/hooks/useAnalytics";

type EnterStakingAmountProps = {
  onContinue: (selectedProvider: StakingPool) => void;
  onSkip: () => void;
};

export const EnterStakingAmount = ({
  onContinue,
  onSkip,
}: EnterStakingAmountProps) => {
  const {
    poolStats,
    pools,
    enteredAmount,
    setEnteredAmount,
    onStakeMax,
    amountError,
    selectedPool,
    setSelectedPool,
    source,
    hasAlreadySelectedStakingPool,
    isStakingMax,
    customStakingPoolId: prefilledCustomPoolId,
    totalAvailableToStake,
  } = useStakingProviderContext();

  const [customPoolId, setCustomPoolId] = useState<string>(
    prefilledCustomPoolId ?? ""
  );
  const { isWhitelisted, whitelistAccountId } = useIsPoolWhitelisted();
  const [isValidatingCustomPool, setIsValidatingCustomPool] =
    useState<boolean>(false);
  const [customPoolError, setCustomPoolError] = useState<string>("");

  // Lockup and current staking pool context to show current staked balance
  const { lockupAccountId } = useLockupAccount();
  const { stakingPoolId: currentPoolId } = useCurrentStakingPoolId({
    lockupAccountId: lockupAccountId ?? "",
    enabled: !!lockupAccountId,
  });
  const { stakedBalance } = useStakedBalance({
    stakingPoolId: currentPoolId,
    accountId: lockupAccountId,
  });

  // Basic NEAR account ID format validation
  const isValidNearAccountId = (id: string) => {
    if (!/^[a-z0-9._-]{2,64}$/.test(id)) return false;
    if (id.startsWith(".") || id.endsWith(".")) return false;
    return id
      .split(".")
      .every((part) => part.length >= 2 && /^[a-z0-9_-]+$/.test(part));
  };
  const isCustomPoolSelected = useMemo(() => {
    return !pools.some((p) => p.id === selectedPool.id);
  }, [pools, selectedPool]);

  const [showCustomPool, setShowCustomPool] = useState<boolean>(
    (!!prefilledCustomPoolId || isCustomPoolSelected) &&
      !hasAlreadySelectedStakingPool
  );

  const isCustomPoolValid = useMemo(() => {
    if (!customPoolId) return false;
    return isValidNearAccountId(customPoolId);
  }, [customPoolId]);

  const { trackStakingPoolSelected, trackCustomPoolEntered, trackStakingAmountEntered } =
    useAnalytics();

  const handleUseCustomPool = useCallback(async () => {
    if (!isCustomPoolValid) {
      setCustomPoolError("Enter a valid NEAR account ID for the staking pool.");
      toast.error("Invalid pool account ID format.");
      return;
    }

    setCustomPoolError("");
    setIsValidatingCustomPool(true);
    try {
      const allowed = await isWhitelisted(customPoolId);
      trackCustomPoolEntered({
        pool_id: customPoolId,
        is_whitelisted: !!allowed,
      });
      if (!allowed) {
        setCustomPoolError("Pool is not whitelisted for House of Stake.");
        toast.error("Pool is not whitelisted for House of Stake.");
        return;
      }
      setSelectedPool({
        id: customPoolId,
        contract: customPoolId,
        metadata: NEAR_TOKEN_METADATA,
      } as StakingPool);
      toast.success(
        `Selected pool: ${customPoolId}. Continue to Stake to apply this pool.`
      );
      setCustomPoolId("");
      setShowCustomPool(false);
    } finally {
      setIsValidatingCustomPool(false);
    }
  }, [customPoolId, isCustomPoolValid, isWhitelisted, setSelectedPool, trackCustomPoolEntered]);

  const handleContinue = useCallback(() => {
    if (!enteredAmount || !!amountError) return;
    trackStakingAmountEntered({
      amount_near: Number(enteredAmount),
      pool_id: selectedPool.id,
    });
    onContinue(selectedPool);
  }, [enteredAmount, amountError, onContinue, selectedPool, trackStakingAmountEntered]);

  return (
    <div className="flex-1 flex flex-col gap-2">
      <StakingDialogHeader />
      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stake assets and get liquid rewards
          </h1>
        </div>
        {hasAlreadySelectedStakingPool && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Staking Pool Selected</p>
              <p>
                Your lockup is currently bound to{" "}
                <span className="font-mono font-bold">
                  {currentPoolId || selectedPool.contract}
                </span>
                . To switch pools, you must first unstake and withdraw all
                funds.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {pools.map((pool) => (
            <div
              key={pool.id}
              className={
                hasAlreadySelectedStakingPool ? "opacity-50 grayscale" : ""
              }
            >
              <StakingOptionCard
                isEnabled={!hasAlreadySelectedStakingPool}
                isSelected={selectedPool.id === pool.id}
                onSelect={() => {
                  setSelectedPool(pool);
                  trackStakingPoolSelected({
                    pool_type: "curated_lst",
                    pool_id: pool.id,
                    pool_apy: poolStats[pool.id]?.apy,
                  });
                }}
                tokenMetadata={pool.metadata}
                apy={poolStats[pool.id]?.apy}
                totalVolumeYocto={poolStats[pool.id]?.totalVolumeYocto ?? "-"}
              />
            </div>
          ))}
        </div>

        {/* Active Custom Pool Card */}
        {hasAlreadySelectedStakingPool &&
          selectedPool.id === selectedPool.contract && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#9D9FA1] mb-2">
                Active Non-liquid Staking Pool
              </h3>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {selectedPool.metadata?.icon && (
                      <Image
                        src={selectedPool.metadata.icon}
                        alt={selectedPool.metadata.symbol}
                        width={24}
                        height={24}
                        className="rounded-full border border-gray-200 bg-white"
                      />
                    )}
                    <span className="font-semibold text-gray-900">
                      {selectedPool.metadata?.symbol === "NEAR"
                        ? selectedPool.contract
                        : selectedPool.metadata?.symbol}
                    </span>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
                      Non-liquid
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#9D9FA1]">
                      Currently Staked
                    </div>
                    <div className="font-medium">
                      <TokenAmount amount={stakedBalance ?? "0"} />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#9D9FA1]">
                  Pool ID:{" "}
                  <span className="font-mono text-gray-600">
                    {selectedPool.contract}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Custom pool entry / Change Pool */}
        <div className="mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowCustomPool((v) => !v)}
                  disabled={hasAlreadySelectedStakingPool}
                  className={`text-sm text-[#9D9FA1] mb-2 flex items-center gap-2 ${
                    hasAlreadySelectedStakingPool
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span
                    className={`transition-transform ${showCustomPool ? "rotate-90" : ""}`}
                  >
                    ▸
                  </span>
                  {hasAlreadySelectedStakingPool
                    ? "Staking pool locked"
                    : "Enter staking pool account ID"}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Enter the staking pool account ID you want to use. We will
                verify it against the contract whitelist.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {showCustomPool && (
            <>
              <div className="flex flex-col gap-2">
                {/* Selected pool badge and current staked summary */}
                {!hasAlreadySelectedStakingPool && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-[#9D9FA1]">
                      Selected:
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none text-black bg-gray-100 border-gray-200 w-fit">
                      {selectedPool?.contract}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Input
                              type="text"
                              placeholder="staking-pool.account.near"
                              value={customPoolId}
                              onChange={(e) =>
                                setCustomPoolId(e.target.value.trim())
                              }
                              disabled={
                                hasAlreadySelectedStakingPool &&
                                Big(stakedBalance ?? "0").gt(0)
                              }
                              className={
                                hasAlreadySelectedStakingPool &&
                                Big(stakedBalance ?? "0").gt(0)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            />
                          </div>
                        </TooltipTrigger>
                        {hasAlreadySelectedStakingPool &&
                          Big(stakedBalance ?? "0").gt(0) && (
                            <TooltipContent>
                              You cannot change pools while you have staked
                              funds. Please unstake first.
                            </TooltipContent>
                          )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <UpdatedButton
                    variant="rounded"
                    onClick={handleUseCustomPool}
                    disabled={
                      !isCustomPoolValid ||
                      isValidatingCustomPool ||
                      (hasAlreadySelectedStakingPool &&
                        Big(stakedBalance ?? "0").gt(0))
                    }
                  >
                    {isValidatingCustomPool ? "Checking..." : "Use"}
                  </UpdatedButton>
                </div>
                {/* Inline format validation for pool */}
                {customPoolId && !isValidNearAccountId(customPoolId) && (
                  <div className="text-xs text-red-500">
                    Invalid pool account ID format
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-[#9D9FA1]">
                    Contract whitelist:
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none text-black bg-[#04e391] border-[#04e391] w-fit">
                    {whitelistAccountId || "default from config"}
                  </span>
                </div>
              </div>
              {!!customPoolError && (
                <div className="text-xs text-red-500 mt-1">
                  {customPoolError}
                </div>
              )}
            </>
          )}
        </div>
        <div className="mb-6">
          <div className="text-base text-[#9D9FA1] mb-2">
            Total Available{" "}
            <span className="text-xs font-normal">(Wallet + Lockup)</span>{" "}
            <TokenAmount amount={totalAvailableToStake ?? "0"} hideCurrency />
          </div>

          {(!totalAvailableToStake || Big(totalAvailableToStake).lte(0)) && (
            <div className="mb-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-[#9D9FA1]">
                  No NEAR available to stake. To stake, lock more NEAR or
                  deposit additional funds into your lockup.
                </p>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between rounded-lg border border-gray-200 p-4 gap-3 sm:gap-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Image
                  src={NEAR_TOKEN_METADATA.icon}
                  alt="NEAR"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="font-medium">NEAR</span>
              </div>

              <div className="flex items-center flex-1 sm:ml-2 min-w-0">
                <Input
                  type="text"
                  placeholder="0"
                  value={
                    // Override value for display purposes when staking max
                    isStakingMax
                      ? formatNumber(
                          totalAvailableToStake ?? "0",
                          NEAR_TOKEN.decimals
                        )
                      : enteredAmount
                  }
                  onChange={(e) => setEnteredAmount(e.target.value)}
                  className="w-full bg-transparent border-none text-lg text-right h-auto focus-visible:ring-0 focus-visible:ring-offset-0 pr-2"
                />
                <button
                  onClick={onStakeMax}
                  disabled={
                    !totalAvailableToStake || Big(totalAvailableToStake).lte(0)
                  }
                  className="px-3 py-1 text-sm text-[#00E391] hover:bg-[#00E391] hover:text-white rounded transition-colors duration-200 flex-shrink-0"
                >
                  Max
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-red-500 h-2">{amountError}</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end gap-2 mb-4">
          <UpdatedButton
            onClick={handleContinue}
            disabled={!enteredAmount || !!amountError}
            variant="rounded"
          >
            Continue
          </UpdatedButton>

          {source === "onboarding" && <button onClick={onSkip}>Skip</button>}
        </div>
      </div>
    </div>
  );
};
