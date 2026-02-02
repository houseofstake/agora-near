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
import { useCallback, useState, useEffect } from "react";

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
  const [isFireblocksWallet, setIsFireblocksWallet] = useState(false);
  const [transactionStep, setTransactionStep] = useState<number>(0);
  const [numTransactions, setNumTransactions] = useState<number>(0);
  const [transactionText, setTransactionText] = useState<string>("");

  const {
    signedAccountId,
    signAndSendTransactions,
    buildTransferFungibleTokenTransaction,
    isUsingFireblocksWallet,
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

  const executeTransactions = useCallback(
    async (startAt: number = 0) => {
      try {
        setIsSubmitting(true);
        setError(null);

        // Build all transactions upfront to get the actual count
        const allTxns = await buildTransactions(requiredTransactions);

        if (isFireblocksWallet) {
          // For Fireblocks: execute transactions sequentially with progress tracking
          const flattenedTxns = allTxns.flatMap((txn) => {
            return txn.actions.map((action) => {
              return {
                receiverId: txn.receiverId,
                actions: [action],
              };
            });
          });
          setNumTransactions(flattenedTxns.length);

          for (let i = startAt; i < flattenedTxns.length; i++) {
            const txn = flattenedTxns[i];
            setTransactionStep(i);

            let txnText = "Processing transaction...";
            if (txn.actions && txn.actions.length > 0) {
              const action = txn.actions[0];
              if ("params" in action && "methodName" in action.params) {
                const methodName = action.params.methodName;
                if (methodName === "storage_deposit") {
                  txnText = "Storing account in veNEAR contract...";
                } else if (methodName === "deploy_lockup") {
                  txnText = "Deploying lockup contract...";
                } else if (methodName === "select_staking_pool") {
                  txnText = "Selecting staking pool...";
                } else if (methodName === "refresh_staking_pool_balance") {
                  txnText = "Refreshing balance...";
                } else if (methodName === "lock_near") {
                  txnText = `Locking ${selectedToken?.metadata?.name}...`;
                } else if (
                  methodName === "ft_transfer_call" ||
                  methodName === "ft_transfer"
                ) {
                  txnText = "Transferring tokens...";
                }
              } else if ("deposit" in action) {
                txnText = "Transferring NEAR...";
              }
            }

            setTransactionText(txnText);

            await signAndSendTransactions({
              transactions: [txn],
            });
          }
        } else {
          // For regular wallets: batch all transactions
          await signAndSendTransactions({
            transactions: allTxns,
          });
        }

        setIsCompleted(true);
      } catch {
        setError("Something went wrong, please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      buildTransactions,
      isFireblocksWallet,
      requiredTransactions,
      signAndSendTransactions,
      selectedToken?.metadata?.name,
    ]
  );

  const retryFromCurrentStep = useCallback(() => {
    executeTransactions(transactionStep);
  }, [executeTransactions, transactionStep]);

  // Detect wallet type when component mounts or when wallet changes
  useEffect(() => {
    const detectWallet = async () => {
      const isFireblocks = await isUsingFireblocksWallet();
      setIsFireblocksWallet(isFireblocks);
    };

    detectWallet();
  }, [isUsingFireblocksWallet]);

  return {
    isSubmitting,
    isCompleted,
    error,
    executeTransactions,
    isFireblocksWallet,
    transactionStep,
    numTransactions,
    transactionText,
    retryFromCurrentStep,
  };
};
