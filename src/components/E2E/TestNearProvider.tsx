import React, { useCallback, useEffect, useState, ReactNode } from "react";
import { JsonRpcProvider } from "@near-js/providers";
import { getRpcUrl } from "@/lib/utils";
import { NearContext } from "@/contexts/NearContext";

// Deterministic mock account for E2E
const MOCK_ACCOUNT_ID = "e2e-signer.near";

export const TestNearProvider: React.FC<{
  children: ReactNode;
  networkId: string;
}> = ({ children, networkId }) => {
  const [signedAccountId, setSignedAccountId] = useState<string | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setSignedAccountId(MOCK_ACCOUNT_ID);
    setIsInitialized(true);
  }, []);

  const signIn = useCallback(async () => {
    setSignedAccountId(MOCK_ACCOUNT_ID);
  }, []);

  const signOut = useCallback(async () => {
    setSignedAccountId(undefined);
  }, []);

  // Pass-through to real RPC for contract reads
  const viewMethod = useCallback(
    async ({
      contractId,
      method,
      args = {},
      blockId,
      useArchivalNode = false,
    }: any) => {
      const url = getRpcUrl(networkId, { useArchivalNode });
      const provider = new JsonRpcProvider({ url });

      try {
        const res = await provider.query({
          request_type: "call_function",
          account_id: contractId,
          method_name: method,
          args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
          finality: useArchivalNode ? undefined : "optimistic",
          block_id: blockId,
        });
        const resultArray = (res as any).result;
        return JSON.parse(Buffer.from(resultArray).toString());
      } catch (error) {
        console.warn(
          `[E2E] Mock viewMethod error for ${contractId}.${method}:`,
          error
        );
        throw error;
      }
    },
    [networkId]
  );

  const getBalance = useCallback(async () => {
    return "100000000000000000000000"; // 100 NEAR
  }, []);

  // MOCK WRITES
  const callMethod = useCallback(async () => {
    console.log("[E2E] callMethod mocked success");
    return { transaction_outcome: { id: "mock-tx-hash-123" } };
  }, []);

  const callContracts = useCallback(async () => {
    console.log("[E2E] callContracts mocked success");
    return [{ transaction_outcome: { id: "mock-tx-hash-456" } }];
  }, []);

  const signAndSendTransactions = useCallback(async () => {
    console.log("[E2E] signAndSendTransactions mocked success");
    return [{ transaction_outcome: { id: "mock-tx-hash-789" } }];
  }, []);

  const getTransactionResult = useCallback(async (txhash: string) => {
    return {
      status: { SuccessValue: "" },
      transaction_outcome: { id: txhash },
    };
  }, []);

  const getAccessKeys = useCallback(async () => {
    return [];
  }, []);

  const signMessage = useCallback(async () => {
    return {
      accountId: MOCK_ACCOUNT_ID,
      publicKey: "ed25519:MockPublicKeyForE2E",
      signature: "MockSignatureBase64==",
    };
  }, []);

  const transferNear = useCallback(async () => {
    console.log("[E2E] transferNear mocked success");
    return { transaction_outcome: { id: "mock-tx-hash-transfer" } };
  }, []);

  const buildTransferFungibleTokenTransaction = useCallback(async () => {
    return [];
  }, []);

  const transferFungibleToken = useCallback(async () => {
    console.log("[E2E] transferFungibleToken mocked success");
    return [{ transaction_outcome: { id: "mock-tx-hash-ft" } }];
  }, []);

  const isUsingFireblocksWallet = useCallback(async () => false, []);

  return (
    <NearContext.Provider
      value={{
        signedAccountId,
        signIn,
        signOut,
        viewMethod,
        callMethod,
        getTransactionResult,
        getBalance,
        signAndSendTransactions,
        getAccessKeys,
        callContracts,
        signMessage,
        networkId,
        isInitialized,
        transferNear,
        transferFungibleToken,
        buildTransferFungibleTokenTransaction,
        isUsingFireblocksWallet,
      }}
    >
      {children}
    </NearContext.Provider>
  );
};
