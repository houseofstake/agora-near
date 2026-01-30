import { useNear } from "@/contexts/NearContext";
import { useWriteHOSContract } from "@/hooks/useWriteHOSContract";
import { CONTRACTS } from "@/lib/contractConstants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRegisterLockup } from "../useRegisterLockup";

// Mock the hooks
vi.mock("@/contexts/NearContext", () => ({
  useNear: vi.fn(),
}));

vi.mock("@/hooks/useWriteHOSContract", () => ({
  useWriteHOSContract: vi.fn(),
}));

const mockUseNear = vi.mocked(useNear);
const mockUseWriteHOSContract = vi.mocked(useWriteHOSContract);

describe("useRegisterLockup", () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;
  let mockMutate: ReturnType<typeof vi.fn>;
  let mockMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    mockMutate = vi.fn();
    mockMutateAsync = vi.fn();

    // Setup default mocks
    mockUseNear.mockReturnValue({
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
      networkId: "testnet",
      isInitialized: true,
      transferNear: vi.fn(),
      transferFungibleToken: vi.fn(),
      buildTransferFungibleTokenTransaction: vi.fn(),
      isUsingFireblocksWallet: vi.fn().mockResolvedValue(false),
    });

    mockUseWriteHOSContract.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: undefined,
      variables: undefined,
      isError: false,
      isIdle: true,
      isSuccess: false,
      status: "idle",
      reset: vi.fn(),
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
    } as any);
  });

  afterEach(async () => {
    queryClient.clear();
  });

  describe("Hook Initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useRegisterLockup({}), { wrapper });

      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should call useWriteHOSContract with correct parameters", () => {
      const mockOnSuccess = vi.fn();
      renderHook(() => useRegisterLockup({ onSuccess: mockOnSuccess }), {
        wrapper,
      });

      expect(mockUseWriteHOSContract).toHaveBeenCalledWith({
        contractType: "VENEAR",
        onSuccess: expect.any(Function),
      });
    });

    it("should handle pending state from contract call", () => {
      mockUseWriteHOSContract.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
        data: undefined,
        status: "pending",
      } as any);

      const { result } = renderHook(() => useRegisterLockup({}), { wrapper });

      expect(result.current.isPending).toBe(true);
    });

    it("should handle error from contract call", () => {
      const mockError = new Error("Test error");
      mockUseWriteHOSContract.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: mockError,
        data: undefined,
      } as any);

      const { result } = renderHook(() => useRegisterLockup({}), { wrapper });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe("registerAndDeployLockup", () => {
    it("should call mutate with correct parameters", () => {
      const { result } = renderHook(() => useRegisterLockup({}), { wrapper });

      act(() => {
        result.current.registerAndDeployLockup(
          "1000000000000000000000000", // 1 NEAR
          "3000000000000000000000000" // 3 NEAR
        );
      });

      expect(mockMutate).toHaveBeenCalledWith({
        contractId: CONTRACTS.VENEAR_CONTRACT_ID,
        methodCalls: [
          {
            methodName: "storage_deposit",
            args: { account_id: "test-account.testnet" },
            deposit: "1000000000000000000000000",
          },
          {
            methodName: "deploy_lockup",
            args: {},
            deposit: "3000000000000000000000000",
          },
        ],
      });
    });
  });

  describe("registerAndDeployLockupAsync", () => {
    it("should call mutateAsync with correct parameters", async () => {
      mockMutateAsync.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useRegisterLockup({}), { wrapper });

      await act(async () => {
        await result.current.registerAndDeployLockupAsync(
          "2000000000000000000000000", // 2 NEAR
          "4000000000000000000000000" // 4 NEAR
        );
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        contractId: CONTRACTS.VENEAR_CONTRACT_ID,
        methodCalls: [
          {
            methodName: "storage_deposit",
            args: { account_id: "test-account.testnet" },
            deposit: "2000000000000000000000000",
          },
          {
            methodName: "deploy_lockup",
            args: {},
            deposit: "4000000000000000000000000",
          },
        ],
      });
    });

    it("should handle async errors", async () => {
      const mockError = new Error("Async error");
      mockMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRegisterLockup({}), { wrapper });

      await expect(
        act(async () => {
          await result.current.registerAndDeployLockupAsync(
            "2000000000000000000000000",
            "4000000000000000000000000"
          );
        })
      ).rejects.toThrow("Async error");

      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  describe("Success Callback", () => {
    it("should call onSuccess callback when mutation succeeds", () => {
      const mockOnSuccess = vi.fn();
      renderHook(() => useRegisterLockup({ onSuccess: mockOnSuccess }), {
        wrapper,
      });

      // Get the onSuccess callback that was passed to useWriteHOSContract
      const onSuccessCallback =
        mockUseWriteHOSContract.mock.calls[0]?.[0]?.onSuccess;

      act(() => {
        onSuccessCallback?.();
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
