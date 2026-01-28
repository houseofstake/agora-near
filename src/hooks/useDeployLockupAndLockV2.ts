import {
  LockTransaction,
  useLockProviderContext,
} from "@/components/Dialogs/LockProvider";
import { useNear } from "@/contexts/NearContext";
import { CONTRACTS } from "@/lib/contractConstants";
import { convertUnit } from "@fastnear/utils";
import {
  SignAndSendTransactionParams,
  Optional,
} from "@hot-labs/near-connect/build/types";
import { useCallback, useState } from "react";

export const useDeployLockupAndLockV2 = () => {
  const {
    lockupAccountId,
    selectedToken,
    storageDepositAmount,
    lockupDeploymentCost,
    transferAmountYocto = "0",
    requiredTransactions,
    getAmountToLock,
  } = useLockProviderContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    signedAccountId,
    signAndSendTransactions,
    buildTransferFungibleTokenTransaction,
  } = useNear();

  const buildTransactions = useCallback(
    async (
      transactions: LockTransaction[]
    ): Promise<Optional<SignAndSendTransactionParams, "signerId">[]> => {
      const txns: Optional<SignAndSendTransactionParams, "signerId">[] = [];

      if (transactions.includes("deploy_lockup")) {
        txns.push({
          receiverId: CONTRACTS.VENEAR_CONTRACT_ID,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: { account_id: signedAccountId },
                gas: convertUnit("30 Tgas"),
                deposit: convertUnit(storageDepositAmount || "0"),
              },
            },
            {
              type: "FunctionCall",
              params: {
                methodName: "deploy_lockup",
                args: {},
                gas: convertUnit("100 Tgas"),
                deposit: convertUnit(lockupDeploymentCost || "0"),
              },
            },
          ],
        });
      }

      if (transactions.includes("transfer_ft")) {
        const ftTransferTransactions =
          await buildTransferFungibleTokenTransaction({
            accountId: signedAccountId ?? "",
            tokenContractId: selectedToken?.accountId ?? "",
            receiverId: lockupAccountId || "",
            amount: transferAmountYocto,
            memo: "",
          });

        txns.push(...ftTransferTransactions);
      }

      if (transactions.includes("select_staking_pool")) {
        txns.push({
          receiverId: lockupAccountId || "",
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "select_staking_pool",
                args: {
                  staking_pool_account_id: selectedToken?.accountId ?? "",
                },
                gas: convertUnit("75 Tgas"),
                deposit: convertUnit("1"),
              },
            },
          ],
        });
      }

      if (transactions.includes("refresh_balance")) {
        txns.push({
          receiverId: lockupAccountId || "",
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "refresh_staking_pool_balance",
                args: {},
                gas: convertUnit("75 Tgas"),
                deposit: convertUnit("1"),
              },
            },
          ],
        });
      }

      if (transactions.includes("lock_near")) {
        const amountToLock = getAmountToLock();

        txns.push({
          receiverId: lockupAccountId || "",
          actions: [
            ...(transactions.includes("transfer_near")
              ? [
                  {
                    type: "Transfer",
                    params: {
                      deposit: transferAmountYocto,
                    },
                  } as const,
                ]
              : []),
            {
              type: "FunctionCall",
              params: {
                methodName: "lock_near",
                args: {
                  amount: amountToLock,
                },
                gas: convertUnit("100 Tgas"),
                deposit: convertUnit("1"),
              },
            },
          ],
        });
      }

      return txns;
    },
    [
      buildTransferFungibleTokenTransaction,
      getAmountToLock,
      lockupAccountId,
      lockupDeploymentCost,
      selectedToken?.accountId,
      signedAccountId,
      storageDepositAmount,
      transferAmountYocto,
    ]
  );

  const executeTransactions = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const txns = await buildTransactions(requiredTransactions);

      await signAndSendTransactions({
        transactions: txns,
      });

      setIsCompleted(true);
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [buildTransactions, requiredTransactions, signAndSendTransactions]);

  return {
    isSubmitting,
    isCompleted,
    error,
    executeTransactions,
  };
};
