import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDeployLockupAndLock } from "../useDeployLockupAndLock";
import { useNear } from "../../contexts/NearContext";
import { useRegisterLockup } from "../useRegisterLockup";
import { useSelectStakingPool } from "../useSelectStakingPool";
import { useRefreshStakingPoolBalance } from "../useRefreshStakingPoolBalance";
import {
  LockTransaction,
  useLockProviderContext,
} from "../../components/Dialogs/LockProvider";
import { FUNGIBLE_TOKEN_QK } from "../useFungibleTokens";
import { NEAR_BALANCE_QK } from "../useBalance";
import { READ_NEAR_CONTRACT_QK } from "../useReadHOSContract";
import { CONTRACTS } from "../../lib/contractConstants";

// Mock the dependencies
vi.mock("../../contexts/NearContext", () => ({
  useNear: vi.fn(),
}));

vi.mock("../useRegisterLockup", () => ({
  useRegisterLockup: vi.fn(),
}));

vi.mock("../useSelectStakingPool", () => ({
  useSelectStakingPool: vi.fn(),
}));

vi.mock("../useRefreshStakingPoolBalance", () => ({
  useRefreshStakingPoolBalance: vi.fn(),
}));

vi.mock("../../components/Dialogs/LockProvider", () => ({
  useLockProviderContext: vi.fn(),
}));

const mockUseNear = vi.mocked(useNear);
const mockUseRegisterLockup = vi.mocked(useRegisterLockup);
const mockUseSelectStakingPool = vi.mocked(useSelectStakingPool);
const mockUseRefreshStakingPoolBalance = vi.mocked(
  useRefreshStakingPoolBalance
);
const mockUseLockProviderContext = vi.mocked(useLockProviderContext);

describe("useDeployLockupAndLock", () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  // Mock functions
  const mockTransferNear = vi.fn();
  const mockTransferFungibleToken = vi.fn();
  const mockRegisterAndDeployLockupAsync = vi.fn();
  const mockSelectStakingPoolAsync = vi.fn();
  const mockRefreshStakingPoolBalanceAsync = vi.fn();
  const mockLockNear = vi.fn();
  const mockGetAmountToLock = vi.fn();

  // Utility function to mock LockProviderContext with defaults and optional overrides
  const mockLockProviderContext = (overrides: Record<string, any> = {}) => {
    const defaults = {
      isLoading: false,
      error: null,
      lockupAccountId: "test-lockup.testnet",
      storageDepositAmount: "1000000000000000000000000",
      lockupDeploymentCost: "2000000000000000000000000",
      totalRegistrationCost: "3000000000000000000000000",
      selectedToken: {
        accountId: "test-token.testnet",
        metadata: {
          name: "Test Token",
          symbol: "TT",
          decimals: 24,
          icon: "https://example.com/icon.png",
        },
        type: "near" as const,
        balance: "5000000000000000000000000",
      },
      setSelectedToken: vi.fn(),
      availableTokens: [],
      venearAccountInfo: undefined,
      lockApy: "10.5",
      enteredAmount: "1",
      setEnteredAmount: vi.fn(),
      isLockingMax: false,
      onLockMax: vi.fn(),
      lockNear: mockLockNear,
      isLockingNear: false,
      lockingNearError: null,
      venearAmount: "1000000000000000000000000",
      stakingPoolId: "test-staking-pool.testnet",
      depositTotal: "1000000000000000000000000",
      requiredTransactions: [
        "deploy_lockup",
        "transfer_near",
        "lock_near",
      ] as LockTransaction[],
      transferAmountYocto: "1000000000000000000000000",
      getAmountToLock: mockGetAmountToLock,
      maxAmountToLock: "5000000000000000000000000",
      amountError: null,
      resetForm: vi.fn(),
      source: "onboarding" as const,
      venearStorageCost: "1000000000000000000000000",
      lockupStorageCost: "2000000000000000000000000",
      venearAccountLockupVersion: 1,
      venearGlobalLockupVersion: 1,
      customStakingPoolId: undefined,
      setCustomStakingPoolId: vi.fn(),
    };

    const result = { ...defaults, ...overrides };

    mockUseLockProviderContext.mockReturnValue(result);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Setup default mocks with proper structure
    mockUseNear.mockReturnValue({
      transferNear: mockTransferNear,
      transferFungibleToken: mockTransferFungibleToken,
      signedAccountId: "test-account.testnet",
      signIn: vi.fn(),
      signOut: vi.fn(),
      viewMethod: vi.fn(),
      callMethod: vi.fn(),
      getTransactionResult: vi.fn(),
      getBalance: vi.fn(),
      signAndSendTransactions: vi.fn(),
      getAccessKeys: vi.fn(),
      callContracts: vi.fn(),
      signMessage: vi.fn(),
      buildTransferFungibleTokenTransaction: vi.fn(),
      networkId: "testnet",
      isInitialized: true,
      isUsingFireblocksWallet: vi.fn().mockResolvedValue(false),
    });

    mockUseRegisterLockup.mockReturnValue({
      registerAndDeployLockup: vi.fn(),
      registerAndDeployLockupAsync: mockRegisterAndDeployLockupAsync,
      isPending: false,
      error: null,
    });

    mockUseSelectStakingPool.mockReturnValue({
      selectStakingPoolAsync: mockSelectStakingPoolAsync,
      error: null,
    });

    mockUseRefreshStakingPoolBalance.mockReturnValue({
      refreshStakingPoolBalanceAsync: mockRefreshStakingPoolBalanceAsync,
      error: null,
    });

    mockLockProviderContext();

    mockGetAmountToLock.mockResolvedValue("1000000000000000000000000");
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      expect(result.current.transactionText).toBe("");
      expect(result.current.transactionStep).toBe(0);
      expect(result.current.numTransactions).toBe(0);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Transaction Execution", () => {
    it("should execute deploy_lockup transaction successfully", async () => {
      // Override for this specific test
      mockLockProviderContext({
        requiredTransactions: ["deploy_lockup"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(mockRegisterAndDeployLockupAsync).toHaveBeenCalledWith(
        "1000000000000000000000000",
        "2000000000000000000000000"
      );
      expect(result.current.transactionText).toBe("Locked");
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should execute transfer_near transaction successfully", async () => {
      mockLockProviderContext({
        requiredTransactions: ["transfer_near"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(mockTransferNear).toHaveBeenCalledWith({
        receiverId: "test-lockup.testnet",
        amount: "1000000000000000000000000",
      });
    });

    it("should execute transfer_ft transaction successfully", async () => {
      mockLockProviderContext({
        requiredTransactions: ["transfer_ft"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(mockTransferFungibleToken).toHaveBeenCalledWith({
        tokenContractId: "test-token.testnet",
        receiverId: "test-lockup.testnet",
        amount: "1000000000000000000000000",
      });
    });

    it("should execute multiple transactions in sequence", async () => {
      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 3 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(mockRegisterAndDeployLockupAsync).toHaveBeenCalled();
      expect(mockTransferNear).toHaveBeenCalled();
      expect(mockLockNear).toHaveBeenCalled();
    });

    it("should execute select_staking_pool transaction successfully", async () => {
      mockLockProviderContext({
        requiredTransactions: ["select_staking_pool"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(mockSelectStakingPoolAsync).toHaveBeenCalledWith({
        stakingPoolId: "test-token.testnet",
      });
      expect(result.current.transactionText).toBe("Locked");
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should execute refresh_balance transaction successfully", async () => {
      mockLockProviderContext({
        requiredTransactions: ["refresh_balance"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(mockRefreshStakingPoolBalanceAsync).toHaveBeenCalledWith();
      expect(result.current.transactionText).toBe("Locked");
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should execute lock_near transaction successfully", async () => {
      mockLockProviderContext({
        requiredTransactions: ["lock_near"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(mockLockNear).toHaveBeenCalled();
      expect(result.current.transactionText).toBe("Locked");
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should execute all transaction steps successfully", async () => {
      mockLockProviderContext({
        requiredTransactions: [
          "deploy_lockup",
          "transfer_near",
          "select_staking_pool",
          "refresh_balance",
          "lock_near",
        ],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 5 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      // Verify all transaction functions were called
      expect(mockRegisterAndDeployLockupAsync).toHaveBeenCalledWith(
        "1000000000000000000000000",
        "2000000000000000000000000"
      );
      expect(mockTransferNear).toHaveBeenCalledWith({
        receiverId: "test-lockup.testnet",
        amount: "1000000000000000000000000",
      });
      expect(mockSelectStakingPoolAsync).toHaveBeenCalledWith({
        stakingPoolId: "test-token.testnet",
      });
      expect(mockRefreshStakingPoolBalanceAsync).toHaveBeenCalledWith();
      expect(mockLockNear).toHaveBeenCalled();

      expect(result.current.transactionText).toBe("Locked");
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.transactionStep).toBe(4);
    });
  });

  describe("Error Handling", () => {
    it("should handle transaction errors", async () => {
      mockRegisterAndDeployLockupAsync.mockRejectedValue(
        new Error("Deploy failed")
      );

      mockLockProviderContext({
        requiredTransactions: ["deploy_lockup"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.error).toBe("Deploy failed");
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isCompleted).toBe(false);
    });

    it("should handle invalid startAt parameter", async () => {
      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({
        numTransactions: 1,
        startAt: 10,
      });

      await waitFor(() => {
        expect(result.current.error).toBe(
          "Something went wrong executing lock transactions"
        );
      });
    });
  });

  describe("Error Messages", () => {
    it("should return registerAndDeployLockupError message", () => {
      mockUseRegisterLockup.mockReturnValue({
        registerAndDeployLockup: vi.fn(),
        registerAndDeployLockupAsync: mockRegisterAndDeployLockupAsync,
        isPending: false,
        error: new Error("Register error"),
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      expect(result.current.error).toBe(
        "Something went wrong deploying your lockup contract"
      );
    });

    it("should return selectStakingPoolError message", () => {
      mockUseSelectStakingPool.mockReturnValue({
        selectStakingPoolAsync: mockSelectStakingPoolAsync,
        error: new Error("Select pool error"),
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      expect(result.current.error).toBe(
        "Something went wrong selecting a staking pool"
      );
    });

    it("should return refreshStakingPoolBalanceError message", () => {
      mockUseRefreshStakingPoolBalance.mockReturnValue({
        refreshStakingPoolBalanceAsync: mockRefreshStakingPoolBalanceAsync,
        error: new Error("Refresh error"),
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      expect(result.current.error).toBe(
        "Something went wrong refreshing your balance"
      );
    });

    it("should return lockingNearError message", () => {
      mockLockProviderContext({
        lockingNearError: new Error("Locking error"),
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      expect(result.current.error).toBe(
        "Something went wrong locking your Test Token"
      );
    });
  });

  describe("Retry Functionality", () => {
    it("should retry from current step", async () => {
      // First, simulate a failure
      mockRegisterAndDeployLockupAsync.mockRejectedValue(
        new Error("Deploy failed")
      );

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      // Execute transactions and expect failure
      await result.current.executeTransactions({ numTransactions: 3 });

      await waitFor(() => {
        expect(result.current.error).toBe("Deploy failed");
      });

      // Now mock success and retry
      mockRegisterAndDeployLockupAsync.mockResolvedValue(undefined);

      await result.current.retryFromCurrentStep();

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });
    });
  });

  describe("Balance Refresh", () => {
    it("should invalidate relevant queries after successful execution", async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

      mockLockProviderContext({
        requiredTransactions: ["deploy_lockup"],
      });

      const { result } = renderHook(() => useDeployLockupAndLock(), {
        wrapper,
      });

      await result.current.executeTransactions({ numTransactions: 1 });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [FUNGIBLE_TOKEN_QK],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [NEAR_BALANCE_QK],
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [
          READ_NEAR_CONTRACT_QK,
          "test-lockup.testnet",
          "get_venear_liquid_balance",
        ],
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [
          READ_NEAR_CONTRACT_QK,
          CONTRACTS.VENEAR_CONTRACT_ID,
          "ft_balance_of",
        ],
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [
          READ_NEAR_CONTRACT_QK,
          "test-lockup.testnet",
          "get_liquid_owners_balance",
        ],
      });
    });
  });
});
