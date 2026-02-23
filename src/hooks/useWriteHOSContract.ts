import { lockupMethodConfig } from "@/lib/contracts/config/methods/lockup";
import { LockupWriteContractMethods } from "@/lib/contracts/types/lockup";
import { venearMethodConfig } from "@/lib/contracts/config/methods/venear";
import { VenearWriteContractMethods } from "@/lib/contracts/types/venear";
import { votingMethodConfig } from "@/lib/contracts/config/methods/voting";
import { VotingWriteContractMethods } from "@/lib/contracts/types/voting";
import { useMutation } from "@tanstack/react-query";
import { MethodCall, useNear } from "../contexts/NearContext";
import { MethodConfig } from "@/lib/contracts/types/common";

type ContractMethodMap = {
  VENEAR: VenearWriteContractMethods;
  LOCKUP: LockupWriteContractMethods;
  VOTING: VotingWriteContractMethods;
};

type ContractType = keyof ContractMethodMap;

type ContractMethodType = {
  args: Record<string, unknown>;
  result: unknown;
};

type ContractSpecificMethodCall<
  T extends ContractType,
  M extends keyof ContractMethodMap[T] = keyof ContractMethodMap[T],
> = {
  methodName: M;
  args?: ContractMethodMap[T][M] extends ContractMethodType
    ? ContractMethodMap[T][M]["args"]
    : Record<string, unknown>;
  gas?: string;
  deposit?: string;
};

export type MethodName<T extends ContractType> = keyof ContractMethodMap[T];

const methodConfigMap = {
  VENEAR: venearMethodConfig,
  LOCKUP: lockupMethodConfig,
  VOTING: votingMethodConfig,
} as const;

type MethodRequirements<T extends ContractType> = MethodConfig<
  ContractMethodMap[T]
>;

// TODO: Make this work for calling multiple contracts
export function useWriteHOSContract<T extends ContractType>({
  contractType,
  onSuccess,
}: {
  contractType: T;
  onSuccess?: () => void;
}) {
  const { callContracts: callMethods } = useNear();

  return useMutation({
    onSuccess,
    mutationFn: ({
      methodCalls,
      contractId,
    }: {
      methodCalls: ContractSpecificMethodCall<T>[];
      contractId: string;
    }) => {
      const methodRequirements = methodConfigMap[
        contractType
      ] as MethodRequirements<T>;

      const processedMethodCalls = methodCalls.map((call) => {
        const requirements =
          methodRequirements[
            call.methodName as keyof typeof methodRequirements
          ];
        return {
          ...call,
          gas: call.gas ?? requirements?.gas,
          deposit: call.deposit ?? requirements?.deposit,
        };
      });

      return callMethods({
        contractCalls: {
          [contractId]: processedMethodCalls as MethodCall[],
        },
      }).then((result) => {
        // Some wallets (e.g. HOT Wallet) resolve with null on user rejection
        // instead of throwing. Normalize this to a proper Error so React Query
        // sets a truthy error state and analytics "Failed" events fire.
        if (result === null || result === undefined) {
          throw new Error("Transaction rejected by user");
        }
        return result;
      });
    },
  });
}
