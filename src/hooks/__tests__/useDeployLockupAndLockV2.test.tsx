import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useDeployLockupAndLockV2 } from "../useDeployLockupAndLockV2";
import { useLockProviderContext } from "@/components/Dialogs/LockProvider";
import { useNear } from "@/contexts/NearContext";

vi.mock("@/components/Dialogs/LockProvider", () => ({
  useLockProviderContext: vi.fn(),
}));

vi.mock("@/contexts/NearContext", () => ({
  useNear: vi.fn(),
}));

const mockViewMethod = vi.fn();
const mockBuildTransferFungibleTokenTransaction = vi.fn();
const mockSignAndSendTransactions = vi.fn();

describe("useDeployLockupAndLockV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNear).mockReturnValue({
      signedAccountId: "test.near",
      viewMethod: mockViewMethod,
      buildTransferFungibleTokenTransaction: mockBuildTransferFungibleTokenTransaction,
      signAndSendTransactions: mockSignAndSendTransactions,
      isUsingFireblocksWallet: vi.fn().mockResolvedValue(false),
    } as any);

    vi.mocked(useLockProviderContext).mockReturnValue({
      lockupAccountId: "lockup.test.near",
      selectedToken: {
        accountId: "stnear.test.near",
        type: "lst",
      },
      storageDepositAmount: "0.1",
      lockupDeploymentCost: "1",
      transferAmountYocto: "1000000000000000000000000",
      requiredTransactions: [],
      getAmountToLock: vi.fn().mockReturnValue("1000000000000000000000000"),
    } as any);
  });

  it("should build an unselect_staking_pool transaction when requested", async () => {
    vi.mocked(useLockProviderContext).mockReturnValue({
      lockupAccountId: "lockup.test.near",
      selectedToken: {
        accountId: "stnear.test.near",
        type: "lst",
      },
      requiredTransactions: ["unselect_staking_pool", "select_staking_pool"],
      getAmountToLock: vi.fn(),
    } as any);

    mockViewMethod.mockResolvedValue("linear.test.near");
    mockSignAndSendTransactions.mockResolvedValue(true);

    const { result } = renderHook(() => useDeployLockupAndLockV2());

    await act(async () => {
      await result.current.executeTransactions();
    });

    expect(mockSignAndSendTransactions).toHaveBeenCalled();
    const callArgs = mockSignAndSendTransactions.mock.calls[0][0];
    const transactions = callArgs.transactions;

    expect(transactions).toHaveLength(2);
    expect(transactions[0].actions[0].params.methodName).toBe("unselect_staking_pool");
    expect(transactions[1].actions[0].params.methodName).toBe("select_staking_pool");
    expect(transactions[1].actions[0].params.args.staking_pool_account_id).toBe("stnear.test.near");
  });

  it("should abort transaction if pre-flight safety check fails (LST mismatch without unselect)", async () => {
    vi.mocked(useLockProviderContext).mockReturnValue({
      lockupAccountId: "lockup.test.near",
      selectedToken: {
        accountId: "stnear.test.near",
        type: "lst",
      },
      // Danger! Attempting to lock without selecting the pool mapping
      requiredTransactions: ["lock_near"],
      getAmountToLock: vi.fn(),
    } as any);

    // Mock the viewMethod to pretend the contract still has linear selected
    mockViewMethod.mockResolvedValue("linear.test.near");

    const { result } = renderHook(() => useDeployLockupAndLockV2());

    await act(async () => {
      await result.current.executeTransactions();
    });

    // It should have caught the mismatch and aborted signAndSendTransactions
    expect(mockSignAndSendTransactions).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Something went wrong, please try again.");
  });

  it("should bypass pre-flight safety check if unselect_staking_pool is in requiredTransactions", async () => {
    vi.mocked(useLockProviderContext).mockReturnValue({
      lockupAccountId: "lockup.test.near",
      selectedToken: {
        accountId: "stnear.test.near",
        type: "lst",
      },
      // Safe batch! Includes unselect and select
      requiredTransactions: ["unselect_staking_pool", "select_staking_pool", "lock_near"],
      getAmountToLock: vi.fn(),
    } as any);

    // Contract has linear selected, but it doesn't matter since we are unselecting it
    mockViewMethod.mockResolvedValue("linear.test.near");

    const { result } = renderHook(() => useDeployLockupAndLockV2());

    await act(async () => {
      await result.current.executeTransactions();
    });

    // Transaction should proceed
    expect(mockSignAndSendTransactions).toHaveBeenCalled();
  });
});
