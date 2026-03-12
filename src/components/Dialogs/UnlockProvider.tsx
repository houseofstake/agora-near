import { useAvailableToUnlock } from "@/hooks/useAvailableToUnlock";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useVenearConfig } from "@/hooks/useVenearConfig";
import {
  convertYoctoToNear,
  formatNanoSecondsToTimeUnit,
  isValidNearAmount,
} from "@/lib/utils";
import { NEAR_TOKEN } from "@/lib/constants";
import { parseNearAmount } from "@near-js/utils";
import Big from "big.js";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type UnlockProviderContextType = {
  isLoading: boolean;
  error: Error | null;
  lockupAccountId: string | null;
  availableToUnlock: string | null;
  enteredAmount: string;
  setEnteredAmount: (amount: string) => void;
  isUnlockingMax: boolean;
  onUnlockMax: () => void;
  maxAmountToUnlock: string;
  amountError: string | null;
  resetForm: () => void;
  nearAmount: string;
  formattedUnlockDuration: string;
  unlockDurationNs: string;
};

export const UnlockProviderContext = createContext<UnlockProviderContextType>({
  isLoading: false,
  error: null,
  lockupAccountId: null,
  availableToUnlock: null,
  enteredAmount: "",
  setEnteredAmount: () => {},
  isUnlockingMax: false,
  onUnlockMax: () => {},
  maxAmountToUnlock: "0",
  amountError: null,
  resetForm: () => {},
  nearAmount: "0",
  formattedUnlockDuration: "0",
  unlockDurationNs: "0",
});

export const useUnlockProviderContext = () => {
  return useContext(UnlockProviderContext);
};

type UnlockProviderProps = {
  children: React.ReactNode;
};

export const UnlockProvider = ({ children }: UnlockProviderProps) => {
  const [enteredAmount, setEnteredAmount] = useState<string>("");
  const [isUnlockingMax, setIsUnlockingMax] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  const {
    lockupAccountId,
    isLoading: isLoadingLockupAccount,
    error: lockupAccountError,
  } = useLockupAccount();

  const { availableToUnlock, isLoading: isLoadingAvailableToUnlock } =
    useAvailableToUnlock({
      lockupAccountId: lockupAccountId || "",
    });

  const { unlockDuration } = useVenearConfig({ enabled: true });

  const isInitializing = isLoadingLockupAccount || isLoadingAvailableToUnlock;

  const maxAmountToUnlock = useMemo(() => {
    return availableToUnlock || "0";
  }, [availableToUnlock]);

  // 1:1 conversion - unlocking veNEAR gives you NEAR
  const nearAmount = useMemo(() => {
    if (isUnlockingMax) {
      // More robust to use the direct yocto amount rather than converting back and forth
      return maxAmountToUnlock ?? "0";
    }

    if (!isValidNearAmount(enteredAmount)) {
      return "0";
    }

    return parseNearAmount(enteredAmount) || "0";
  }, [enteredAmount, isUnlockingMax, maxAmountToUnlock]);

  const validateAmount = useCallback(
    (amount: string) => {
      try {
        if (!isValidNearAmount(amount)) {
          setAmountError("Please enter a valid amount");
          return;
        }
        
        // If they click Max, the exact string might be "0.000...1" which parseNearAmount can mangle.
        // We explicitly check if it matches the converted max amount, and if so, it's valid.
        const exactMaxString = convertYoctoToNear(maxAmountToUnlock ?? "0", NEAR_TOKEN.decimals);
        const isExactMax = amount === exactMaxString;

        if (isExactMax && Big(maxAmountToUnlock ?? "0").gt(0)) {
          setAmountError(null);
          return;
        }

        const parsedAmount = parseNearAmount(amount);

        if (Big(parsedAmount ?? "0").gt(Big(maxAmountToUnlock ?? "0"))) {
          setAmountError("Not enough veNEAR available to unlock");
        } else if (Big(amount).lte(0)) {
          setAmountError("Amount must be greater than 0");
        } else {
          setAmountError(null);
        }
      } catch (e) {
        setAmountError("Invalid amount");
      }
    },
    [maxAmountToUnlock]
  );

  const resetForm = useCallback(() => {
    setEnteredAmount("");
    setAmountError(null);
    setIsUnlockingMax(false);
  }, []);

  const onUnlockMax = useCallback(() => {
    const maxAmountStr = convertYoctoToNear(maxAmountToUnlock ?? "0");
    setEnteredAmount(maxAmountStr);
    setIsUnlockingMax(true);
    setAmountError(null);
  }, [maxAmountToUnlock]);

  const onEnteredAmountUpdated = useCallback(
    (amount: string) => {
      setEnteredAmount(amount);
      const exactMaxString = convertYoctoToNear(maxAmountToUnlock ?? "0", NEAR_TOKEN.decimals);
      setIsUnlockingMax(amount === exactMaxString);
      validateAmount(amount);
    },
    [validateAmount]
  );

  const formattedUnlockDuration = useMemo(() => {
    return formatNanoSecondsToTimeUnit(unlockDuration.toString());
  }, [unlockDuration]);

  return (
    <UnlockProviderContext.Provider
      value={{
        isLoading: isInitializing,
        error: lockupAccountError,
        lockupAccountId: lockupAccountId ?? null,
        availableToUnlock: availableToUnlock ?? null,
        enteredAmount,
        setEnteredAmount: onEnteredAmountUpdated,
        isUnlockingMax,
        onUnlockMax,
        maxAmountToUnlock,
        amountError,
        resetForm,
        nearAmount,
        formattedUnlockDuration,
        unlockDurationNs: unlockDuration.toString(),
      }}
    >
      {children}
    </UnlockProviderContext.Provider>
  );
};
