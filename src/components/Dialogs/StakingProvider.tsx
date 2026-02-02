import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useReadHOSContract } from "@/hooks/useReadHOSContract";
import { useStakingPoolExchangeRates } from "@/hooks/useStakingPoolExchangeRates";
import { useStakingPoolStats } from "@/hooks/useStakingPoolStats";

import { useNear } from "@/contexts/NearContext";
import {
  LINEAR_POOL,
  STNEAR_POOL,
  RNEAR_POOL,
  DEFAULT_GAS_RESERVE,
  NEAR_TOKEN_METADATA,
} from "@/lib/constants";
import { StakingPool } from "@/lib/types";
import { useBalance } from "@/hooks/useBalance";
import {
  convertNearToStakingToken,
  convertStakingTokenToNear,
  convertYoctoToNear,
  isValidNearAmount,
} from "@/lib/utils";
import Big from "big.js";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { StakingSource } from "./StakingDialog/StakingDialog";
import { parseNearAmount } from "@near-js/utils";

const getSupportedPools = (): StakingPool[] => {
  return [LINEAR_POOL, STNEAR_POOL, RNEAR_POOL];
};

type StakingProviderContextType = {
  isLoading: boolean;
  error?: Error | null;
  lockupAccountId?: string | null;
  currentStakingPoolId?: string | null;
  selectedPool: StakingPool;
  setSelectedPool: (pool: StakingPool) => void;
  enteredAmount: string;
  setEnteredAmount: (amount: string) => void;
  isStakingMax: boolean;
  onStakeMax: () => void;
  maxStakingAmount?: string;
  amountError: string | null;
  resetForm: () => void;
  amountInStakingToken: string;
  enteredAmountYoctoNear: string;
  pools: StakingPool[];
  poolStats: Record<string, { apy: number; totalVolumeYocto: string }>;
  source: StakingSource;
  hasAlreadySelectedStakingPool: boolean;
  customStakingPoolId?: string;
  walletBalance?: string;
  totalAvailableToStake: string;
};

const StakingContext = createContext<StakingProviderContextType>({
  isLoading: false,
  error: null,
  lockupAccountId: undefined,
  selectedPool: LINEAR_POOL,
  currentStakingPoolId: undefined,
  setSelectedPool: () => {},
  enteredAmount: "",
  setEnteredAmount: () => {},
  isStakingMax: false,
  onStakeMax: () => {},
  maxStakingAmount: undefined,
  amountError: null,
  resetForm: () => {},
  amountInStakingToken: "0",
  pools: [],
  poolStats: {},
  enteredAmountYoctoNear: "0",
  source: "onboarding",
  hasAlreadySelectedStakingPool: false,
  customStakingPoolId: undefined,
  totalAvailableToStake: "0",
});

export const useStakingProviderContext = () => {
  return useContext(StakingContext);
};

type StakingProviderProps = {
  children: React.ReactNode;
  prefilledAmount?: string;
  source: StakingSource;
  customStakingPoolId?: string;
};

export const StakingProvider = ({
  children,
  prefilledAmount,
  source,
  customStakingPoolId,
}: StakingProviderProps) => {
  const supportedPools = useMemo(() => getSupportedPools(), []);
  const [enteredAmount, setEnteredAmount] = useState(prefilledAmount ?? "");
  const [isStakingMax, setIsStakingMax] = useState(false);
  const [selectedPool, setSelectedPool] = useState<StakingPool>(
    supportedPools[0]
  );

  const { signedAccountId } = useNear();
  const { nearBalance: walletBalance } = useBalance(signedAccountId);

  const {
    lockupAccountId,
    isLoading: isLoadingLockupAccount,
    error: lockupAccountError,
  } = useLockupAccount();

  const { exchangeRateMap, isLoading: isLoadingStakingPools } =
    useStakingPoolExchangeRates({ pools: supportedPools });

  const [
    {
      data: maxStakingAmount,
      isLoading: isLoadingMaxStakingAmount,
      error: maxStakingAmountError,
    },
  ] = useReadHOSContract([
    {
      contractId: lockupAccountId ?? "",
      methodName: "get_liquid_owners_balance" as const,
      config: {
        args: {},
        enabled: !!lockupAccountId,
      },
    },
  ]);

  const { stakingPoolId, isLoadingStakingPoolId } = useCurrentStakingPoolId({
    lockupAccountId: lockupAccountId ?? "",
  });

  const preSelectedStakingPool = useMemo(() => {
    if (!stakingPoolId) return undefined;
    const supported = supportedPools.find(
      (pool) => pool.contract === stakingPoolId
    );
    if (supported) return supported;

    // If it's a custom pool not in supported list, create a temporary pool object
    return {
      id: stakingPoolId,
      contract: stakingPoolId,
      metadata: NEAR_TOKEN_METADATA, // Fallback metadata
    } as StakingPool;
  }, [stakingPoolId, supportedPools]);

  const { stats, error: stakingPoolStatsError } = useStakingPoolStats({
    pools: supportedPools,
  });

  const formattedStats = useMemo(() => {
    return supportedPools.reduce(
      (acc, curr) => {
        const rawStats = stats[curr.id];

        acc[curr.id] = {
          apy: (rawStats?.apy ?? 0) * 100,
          totalVolumeYocto: convertStakingTokenToNear(
            rawStats?.supply,
            exchangeRateMap[curr.id]
          ),
        };

        return acc;
      },
      {} as Record<string, { apy: number; totalVolumeYocto: string }>
    );
  }, [stats, exchangeRateMap, supportedPools]);

  const enteredAmountYoctoNear = useMemo(() => {
    if (isStakingMax) {
      // More robust to use the direct yocto amount rather than converting back and forth
      return maxStakingAmount ?? "0";
    }

    if (!isValidNearAmount(enteredAmount)) {
      return "0";
    }

    return parseNearAmount(enteredAmount) || "0";
  }, [enteredAmount, isStakingMax, maxStakingAmount]);

  const totalAvailableToStake = useMemo(() => {
    const lockupBalance = Big(maxStakingAmount ?? "0");
    const wallet = Big(walletBalance ?? "0");
    // Reserve gas from wallet balance if using it
    const walletAvailable = wallet.minus(DEFAULT_GAS_RESERVE);
    const safeWalletAvailable = walletAvailable.gt(0)
      ? walletAvailable
      : Big(0);

    return lockupBalance.plus(safeWalletAvailable).toFixed();
  }, [maxStakingAmount, walletBalance]);

  const amountInStakingToken = useMemo(() => {
    const exchangeRate = exchangeRateMap[selectedPool.id];
    // If no exchange rate (custom pool), assume 1:1 and return yocto
    if (!exchangeRate) {
      return enteredAmountYoctoNear;
    }
    return convertNearToStakingToken(enteredAmountYoctoNear, exchangeRate);
  }, [enteredAmountYoctoNear, exchangeRateMap, selectedPool.id]);

  const amountError = useMemo(() => {
    if (!enteredAmount) {
      return null;
    }

    // Check if the amount format is valid
    if (!isValidNearAmount(enteredAmount)) {
      return "Please enter a valid amount";
    }

    // Check if amount exceeds total available (lockup + wallet)
    if (Big(enteredAmountYoctoNear).gt(Big(totalAvailableToStake))) {
      return "Amount exceeds available balance";
    }

    return null;
  }, [enteredAmount, enteredAmountYoctoNear, totalAvailableToStake]);

  const onStakeMax = useCallback(() => {
    if (totalAvailableToStake) {
      setEnteredAmount(convertYoctoToNear(totalAvailableToStake));
      setIsStakingMax(true);
    }
  }, [totalAvailableToStake]);

  const resetForm = useCallback(() => {
    setEnteredAmount("");
    setIsStakingMax(false);
  }, []);

  const setAmount = useCallback((amount: string) => {
    setIsStakingMax(false);
    setEnteredAmount(amount);
  }, []);

  const isLoading =
    isLoadingLockupAccount ||
    isLoadingStakingPoolId ||
    isLoadingMaxStakingAmount ||
    isLoadingStakingPools;

  const error =
    lockupAccountError || stakingPoolStatsError || maxStakingAmountError;

  return (
    <StakingContext.Provider
      value={{
        currentStakingPoolId: stakingPoolId,
        selectedPool: preSelectedStakingPool ?? selectedPool,
        hasAlreadySelectedStakingPool: !!stakingPoolId,
        setSelectedPool,
        enteredAmount,
        setEnteredAmount: setAmount,
        isStakingMax,
        lockupAccountId,
        isLoading,
        error,
        onStakeMax,
        amountError,
        resetForm,
        maxStakingAmount,
        pools: supportedPools,
        poolStats: formattedStats,
        enteredAmountYoctoNear,
        amountInStakingToken,
        source,
        customStakingPoolId,
        walletBalance: walletBalance ?? undefined,
        totalAvailableToStake,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
