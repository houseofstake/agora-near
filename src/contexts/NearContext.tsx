/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONTRACTS } from "@/lib/contractConstants";
import { getRpcUrl } from "@/lib/utils";
import { convertUnit } from "@fastnear/utils";
import {
  NetworkId,
  Optional,
  setupWalletSelector,
  Transaction,
  WalletModuleFactory,
  WalletSelector,
} from "@near-wallet-selector/core";
import { SignedMessage } from "@near-wallet-selector/core/src/lib/wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHotWallet } from "@near-wallet-selector/hot-wallet";
import { setupUnityWallet } from "@near-wallet-selector/unity-wallet";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupIntearWallet } from "@near-wallet-selector/intear-wallet";
import { setupModal } from "@near-wallet-selector/modal-ui";
import "@near-wallet-selector/modal-ui/styles.css";
import { providers } from "near-api-js";
import { NearConnector } from "@hot-labs/near-connect";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { generateNonce } from "@/lib/api/nonce/requests";
import {
  signAndSendTransactionsWithFireblocksCompat,
  getTransactionResults,
} from "@/lib/wallets/fireblocks-compat";
import { SignClient } from "@walletconnect/sign-client";

// Default to max Tgas since it gets refunded if not used
const DEFAULT_GAS = convertUnit("30 Tgas");
const DEFAULT_DEPOSIT = "0";

interface ViewMethodProps {
  contractId: string;
  method: string;
  args?: Record<string, unknown>;
  blockId?: number;
  useArchivalNode?: boolean;
}

interface CallMethodProps extends ViewMethodProps {
  gas?: string;
  deposit?: string;
}

export type MethodCall = {
  methodName: string;
  args?: Record<string, unknown>;
  gas?: string;
  deposit?: string;
};

type CallContractsProps = {
  // Map from contractId to method calls on that contract
  contractCalls: Record<string, MethodCall[]>;
  callbackUrl?: string;
};

interface TransactionsProps {
  transactions: Array<Optional<Transaction, "signerId">>;
}

interface NearContextType {
  signedAccountId: string | undefined;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  viewMethod: (options: ViewMethodProps) => Promise<any>;
  callMethod: (options: CallMethodProps) => Promise<any>;
  getTransactionResult: (txhash: string) => Promise<any>;
  getBalance: (accountId: string) => Promise<string>;
  signAndSendTransactions: (options: TransactionsProps) => Promise<any>;
  getAccessKeys: (accountId: string) => Promise<any[]>;
  callContracts: (props: CallContractsProps) => Promise<any>;
  signMessage: (options: {
    message: string;
    recipient?: string;
    nonce?: Buffer;
  }) => Promise<SignedMessage | void>;
  networkId: NetworkId;
  isInitialized: boolean;
  transferNear: (options: {
    receiverId: string;
    amount: string;
  }) => Promise<any>;
  transferFungibleToken: (options: {
    tokenContractId: string;
    receiverId: string;
    amount: string;
    memo?: string;
  }) => Promise<any>;
  buildTransferFungibleTokenTransaction: (options: {
    accountId: string;
    tokenContractId: string;
    receiverId: string;
    amount: string;
    memo?: string;
  }) => Promise<Transaction[]>;
}

export const NearContext = createContext<NearContextType>({
  signedAccountId: undefined,
  signIn: async () => {},
  signOut: async () => {},
  viewMethod: async () => null,
  callMethod: async () => null,
  getTransactionResult: async () => null,
  getBalance: async () => "",
  signAndSendTransactions: async () => null,
  getAccessKeys: async () => [],
  callContracts: async () => null,
  signMessage: async () => {},
  networkId: "mainnet" as NetworkId,
  isInitialized: false,
  transferNear: async () => null,
  transferFungibleToken: async () => null,
  buildTransferFungibleTokenTransaction: async () => [],
});

export const useNear = () => useContext(NearContext);

interface NearProviderProps {
  children: ReactNode;
  networkId: NetworkId;
  createAccessKeyFor?: string;
}

const debugLog = (message: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${new Date().toLocaleString()}]: ${message}`);
  }
};

export const NearProvider: React.FC<NearProviderProps> = ({
  children,
  networkId,
}) => {
  const [selector, setSelector] = useState<WalletSelector | undefined>();
  const [nearConnector, setNearConnector] = useState<
    NearConnector | undefined
  >();
  const [signedAccountId, setSignedAccountId] = useState<string | undefined>();
  const unsubscribeRef = useRef<() => void>();
  const [isInitialized, setIsInitialized] = useState(false);
  const useNearConnect =
    (process.env.NEXT_PUBLIC_NEAR_CONNECT_ENABLED || "false").toLowerCase() ===
    "true";

  /**
   * To be called when the website loads
   * @param {Function} accountChangeHook - a function that is called when the user signs in or out
   * @returns {Promise<string>} - the accountId of the signed-in user
   */
  const init = useCallback(async () => {
    try {
      if (useNearConnect) {
        const defaultManifestUrl = "/near-connect-manifest.json";
        const nearConnectNetwork: "mainnet" | "testnet" =
          networkId === "mainnet" ? "mainnet" : "testnet";

        const walletConnect = SignClient.init({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
          metadata: {
            name: "Agora NEAR",
            description: "The on-chain governance company",
            url: "https://gov.houseofstake.org/",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
          },
        });

        const connector = new NearConnector({
          network: nearConnectNetwork,
          autoConnect: true,
          manifest: defaultManifestUrl,
          // Do not filter by features to not hide wallets from the manifest
          logger: console,
          walletConnect: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
            ? walletConnect
            : undefined,
        });

        // Connection/disconnection events
        connector.on("wallet:signIn", (payload) => {
          const nextAccountId = payload?.accounts?.[0]?.accountId;
          setSignedAccountId(nextAccountId);
        });
        connector.on("wallet:signOut", () => {
          setSignedAccountId(undefined);
        });

        // Try existing session
        try {
          const connected = await connector.getConnectedWallet();
          const nextAccountId = connected?.accounts?.[0]?.accountId;
          setSignedAccountId(nextAccountId);
        } catch (_) {
          // No previous session
        }

        setNearConnector(connector);
      } else {
        const selector = await setupWalletSelector({
          network: networkId,
          modules: [
            setupMeteorWallet() as WalletModuleFactory,
            setupHotWallet() as WalletModuleFactory,
            setupUnityWallet({
              projectId: process.env
                .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
              metadata: {
                name: "Agora NEAR",
                description: "The on-chain governance company",
                url: "https://gov.houseofstake.org/",
                icons: ["https://avatars.githubusercontent.com/u/37784886"],
              },
            }) as WalletModuleFactory,
            setupWalletConnect({
              projectId: process.env
                .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
              metadata: {
                name: "Agora NEAR",
                description: "The on-chain governance company",
                url: "https://gov.houseofstake.org/",
                icons: ["https://avatars.githubusercontent.com/u/37784886"],
              },
            }) as WalletModuleFactory,
            setupIntearWallet() as WalletModuleFactory,
          ],
        });

        const isSignedIn = selector.isSignedIn();
        const accountId = isSignedIn
          ? selector.store.getState().accounts[0]?.accountId
          : undefined;
        setSignedAccountId(accountId);
        setSelector(selector);

        unsubscribeRef.current = selector.store.observable.subscribe(
          async (state) => {
            const signedAccount = state?.accounts.find(
              (account) => account.active
            )?.accountId;
            setSignedAccountId(signedAccount);
          }
        ).unsubscribe;
      }
    } catch (error) {
      console.error("Error initializing wallet selector:", error);
    } finally {
      setIsInitialized(true);
    }
  }, [networkId, useNearConnect]);

  /**
   * Displays a modal to login the user
   */
  const signIn = useCallback(async () => {
    if (useNearConnect) {
      if (!nearConnector) return;
      // Show wallet selector and connect with the chosen one
      const id = await nearConnector.selectWallet();
      if (id) {
        await nearConnector.connect(id);
      }
      return;
    }
    if (!selector) return;
    const modal = setupModal(selector, {
      contractId: CONTRACTS.VENEAR_CONTRACT_ID,
    });
    modal.show();
  }, [nearConnector, selector, useNearConnect]);

  /**
   * Logout the user
   */
  const signOut = useCallback(async () => {
    if (useNearConnect) {
      if (!nearConnector) return;
      await nearConnector.disconnect();
      return;
    }
    if (!selector) return;
    const selectedWallet = await selector.wallet();
    selectedWallet.signOut();
  }, [nearConnector, selector, useNearConnect]);

  /**
   * Makes a read-only call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   * @returns {Promise<any>} - the result of the method call
   */
  const viewMethod = useCallback(
    async ({
      contractId,
      method,
      args = {},
      blockId,
      useArchivalNode = false,
    }: ViewMethodProps) => {
      const url = getRpcUrl(networkId, {
        useArchivalNode,
      });

      const provider = new providers.JsonRpcProvider({ url });

      debugLog(
        `viewMethod [req - ${contractId}.${method}]: ${JSON.stringify(args, null, 2)} blockId: ${blockId}`
      );

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
        const jsonResult = JSON.parse(Buffer.from(resultArray).toString());

        debugLog(
          `viewMethod [res - ${contractId}.${method}]: ${JSON.stringify(jsonResult, null, 2)}`
        );

        return jsonResult;
      } catch (error) {
        debugLog(`Error calling ${contractId}.${method}: ${error}`);
        throw error;
      }
    },
    [networkId]
  );

  /**
   * Makes a call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   * @param {string} options.gas - the amount of gas to use
   * @param {string} options.deposit - the amount of yoctoNEAR to deposit
   * @returns {Promise<any>} - the resulting transaction
   */
  const callMethod = useCallback(
    async ({
      contractId,
      method,
      args = {},
      gas = DEFAULT_GAS,
      deposit = DEFAULT_DEPOSIT,
    }: CallMethodProps) => {
      // Sign a transaction with the "FunctionCall" action
      if (useNearConnect) {
        if (!nearConnector) return null;
        const w = await nearConnector.wallet();
        const outcome = await w.signAndSendTransaction({
          receiverId: contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: method,
                args,
                gas,
                deposit,
              },
            },
          ],
        } as any);

        if (!outcome) return null;
        return providers.getTransactionLastResult(outcome as any);
      }
      if (!selector) return null;
      const selectedWallet = await selector.wallet();
      const outcome = await selectedWallet.signAndSendTransaction({
        receiverId: contractId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: method,
              args,
              gas,
              deposit,
            },
          },
        ],
      });

      if (!outcome) return null;
      return providers.getTransactionLastResult(outcome);
    },
    [nearConnector, selector, useNearConnect]
  );

  const callContracts = useCallback(
    async ({ contractCalls, callbackUrl }: CallContractsProps) => {
      try {
        if (useNearConnect) {
          if (!nearConnector) return null;

          debugLog(
            `[Contract Calls req]: ${JSON.stringify(contractCalls, null, 2)}`
          );

          const w = await nearConnector.wallet();
          const walletAccounts = await w.getAccounts();
          const signerId =
            walletAccounts[0]?.accountId || signedAccountId || "";

          // Use Fireblocks-compatible transaction signing
          const outcomes = await signAndSendTransactionsWithFireblocksCompat(
            w,
            {
              transactions: Object.keys(contractCalls).map((contractId) => {
                return {
                  signerId,
                  receiverId: contractId,
                  actions: contractCalls[contractId].map(
                    ({ methodName, args, gas, deposit }) => ({
                      type: "FunctionCall",
                      params: {
                        methodName,
                        args: args ?? {},
                        gas: gas ? convertUnit(gas) : DEFAULT_GAS,
                        deposit: deposit
                          ? convertUnit(deposit)
                          : DEFAULT_DEPOSIT,
                      },
                    })
                  ),
                };
              }),
              callbackUrl,
            }
          );

          if (!outcomes) return null;

          const results = getTransactionResults(outcomes);

          debugLog(`[Contract Calls res]: ${JSON.stringify(results, null, 2)}`);

          return results;
        }

        if (!selector) return null;

        const selectedWallet = await selector.wallet();

        debugLog(
          `[Contract Calls req]: ${JSON.stringify(contractCalls, null, 2)}`
        );

        const outcomes = await selectedWallet.signAndSendTransactions({
          transactions: Object.keys(contractCalls).map((contractId) => {
            return {
              receiverId: contractId,
              // Putting all the transactions for a given contract into the actions prop means it will
              // rollback if one of the transactions fail.
              actions: contractCalls[contractId].map(
                ({ methodName, args, gas, deposit }) => ({
                  type: "FunctionCall",
                  params: {
                    methodName,
                    args: args ?? {},
                    gas: gas ? convertUnit(gas) : DEFAULT_GAS,
                    deposit: deposit ? convertUnit(deposit) : DEFAULT_DEPOSIT,
                  },
                })
              ),
            };
          }),
          callbackUrl,
        });

        if (!outcomes) return null;

        const results = outcomes.map((outcome) =>
          providers.getTransactionLastResult(outcome)
        );

        debugLog(`[Contract Calls res]: ${JSON.stringify(results, null, 2)}`);

        return results;
      } catch (e) {
        console.error("Error calling methods:", e);
        throw e;
      }
    },
    [nearConnector, selector, useNearConnect]
  );

  /**
   * Makes a call to a contract
   * @param {string} txhash - the transaction hash
   * @returns {Promise<any>} - the result of the transaction
   */
  const getTransactionResult = useCallback(
    async (txhash: string) => {
      if (!selector && !nearConnector) return null;
      const { network } = selector
        ? selector.options
        : { network: { networkId } as any };

      const provider = new providers.JsonRpcProvider({
        url: getRpcUrl(network.networkId, {
          useArchivalNode: true,
        }),
      });

      // Retrieve transaction result from the network
      const transaction = await provider.txStatus(txhash, "unnused");
      return providers.getTransactionLastResult(transaction);
    },
    [nearConnector, networkId, selector]
  );

  /**
   * Gets the balance of an account
   * @param {string} accountId - the account id to get the balance of
   * @returns {Promise<number>} - the balance of the account
   *
   */
  const getBalance = useCallback(
    async (accountId: string) => {
      if (!selector && !nearConnector) return "";
      const { network } = selector
        ? selector.options
        : { network: { networkId } as any };
      const provider = new providers.JsonRpcProvider({
        url: getRpcUrl(network.networkId, {
          useArchivalNode: true,
        }),
      });

      // Retrieve account state from the network
      const account = await provider.query({
        request_type: "view_account",
        account_id: accountId,
        finality: "final",
      });
      // return amount on NEAR
      const accountAmount = (account as any).amount;
      return accountAmount ?? "0";
    },
    [nearConnector, networkId, selector]
  );

  /**
   * Signs and sends transactions
   * @param {Object[]} transactions - the transactions to sign and send
   * @returns {Promise<any>} - the resulting transactions
   *
   */
  const signAndSendTransactions = useCallback(
    async ({ transactions }: TransactionsProps) => {
      if (useNearConnect) {
        if (!nearConnector) return null;
        const w = await nearConnector.wallet();
        // Use Fireblocks-compatible transaction signing
        return signAndSendTransactionsWithFireblocksCompat(w, { transactions });
      }
      if (!selector) return null;
      const selectedWallet = await selector.wallet();
      return selectedWallet.signAndSendTransactions({ transactions });
    },
    [nearConnector, selector, useNearConnect]
  );

  /**
   * Gets the access keys for an account
   * @param {string} accountId
   * @returns {Promise<Object[]>} - the access keys for the account
   */
  const getAccessKeys = useCallback(
    async (accountId: string) => {
      if (!selector && !nearConnector) return [];
      const { network } = selector
        ? selector.options
        : { network: { networkId } as any };
      const provider = new providers.JsonRpcProvider({
        url: getRpcUrl(network.networkId, {
          useArchivalNode: true,
        }),
      });

      // Retrieve account state from the network
      const keys = await provider.query({
        request_type: "view_access_key_list",
        account_id: accountId,
        finality: "final",
      });
      return (keys as any).keys || [];
    },
    [nearConnector, networkId, selector]
  );

  const signMessage = useCallback(
    async ({
      message,
      recipient = "agora-near-be",
    }: {
      message: string;
      recipient?: string;
    }) => {
      if (!selector && !nearConnector) return;

      const nonceResponse = await generateNonce({
        account_id: signedAccountId ?? "",
      });

      const nonce = Buffer.from(nonceResponse.nonce, "hex");

      // Don't sanitize the message - sign it exactly as provided - it would break the signature verification
      if (useNearConnect) {
        if (!nearConnector) return;
        const w = await nearConnector.wallet();
        return (w as any).signMessage({
          message,
          recipient,
          nonce,
        });
      }
      const selectedWallet = await selector!.wallet();
      return selectedWallet!.signMessage({
        message,
        recipient,
        nonce,
      });
    },
    [nearConnector, selector, signedAccountId, useNearConnect]
  );

  /**
   * Transfer NEAR tokens to a recipient
   * @param {Object} options - the options for the transfer
   * @param {string} options.receiverId - the recipient's account id
   * @param {string} options.amount - the amount to transfer in yoctoNEAR
   * @returns {Promise<any>} - the transaction result
   */
  const transferNear = useCallback(
    async ({ receiverId, amount }: { receiverId: string; amount: string }) => {
      if (useNearConnect) {
        if (!nearConnector) return null;
        const w = await nearConnector.wallet();
        return w.signAndSendTransaction({
          receiverId,
          actions: [
            {
              type: "Transfer",
              params: {
                deposit: amount,
              },
            },
          ],
        } as any);
      }
      if (!selector) return null;
      const selectedWallet = await selector.wallet();

      return selectedWallet.signAndSendTransaction({
        receiverId,
        actions: [
          {
            type: "Transfer",
            params: {
              deposit: amount,
            },
          },
        ],
      });
    },
    [nearConnector, selector, useNearConnect]
  );

  const buildTransferFungibleTokenTransaction = useCallback(
    async ({
      accountId,
      tokenContractId,
      receiverId,
      amount,
      memo = "",
    }: {
      accountId: string;
      tokenContractId: string;
      receiverId: string;
      amount: string;
      memo?: string;
    }) => {
      const minStorageDeposit = (await viewMethod({
        contractId: tokenContractId,
        method: "storage_balance_bounds",
        args: {},
      })) as
        | {
            min?: string;
            max?: string;
          }
        | null
        | undefined;

      const transactions: Transaction[] = [
        {
          signerId: accountId,
          receiverId: tokenContractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: {
                  account_id: receiverId,
                  registration_only: true,
                },
                gas: convertUnit("30 Tgas"),
                deposit: minStorageDeposit?.min ?? convertUnit("0.01 NEAR"),
              },
            },
          ],
        },
        {
          signerId: accountId,
          receiverId: tokenContractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer",
                args: {
                  receiver_id: receiverId,
                  amount,
                  memo,
                },
                gas: convertUnit("30 Tgas"),
                deposit: convertUnit("1 yoctoNEAR"),
              },
            },
          ],
        },
      ];

      return transactions;
    },
    [viewMethod]
  );

  /**
   * Transfer fungible tokens to a recipient
   * @param {Object} options - the options for the transfer
   * @param {string} options.tokenContractId - the fungible token contract id
   * @param {string} options.receiverId - the recipient's account id
   * @param {string} options.amount - the amount to transfer
   * @param {string} options.memo - optional memo for the transfer
   * @returns {Promise<any>} - the transaction result
   */
  const transferFungibleToken = useCallback(
    async ({
      tokenContractId,
      receiverId,
      amount,
      memo = "",
    }: {
      tokenContractId: string;
      receiverId: string;
      amount: string;
      memo?: string;
    }) => {
      if (useNearConnect) {
        if (!nearConnector) return null;
        const w = await nearConnector.wallet();

        // Get the current account ID
        const accountId = signedAccountId;
        if (!accountId) {
          throw new Error("No account selected");
        }

        const transactions = await buildTransferFungibleTokenTransaction({
          accountId,
          tokenContractId,
          receiverId,
          amount,
          memo,
        });

        // Use Fireblocks-compatible transaction signing
        return signAndSendTransactionsWithFireblocksCompat(w, { transactions });
      }
      if (!selector) return null;
      const selectedWallet = await selector.wallet();

      // Get the current account ID
      const accountId = selector.store.getState().accounts[0]?.accountId;
      if (!accountId) {
        throw new Error("No account selected");
      }

      const transactions = await buildTransferFungibleTokenTransaction({
        accountId,
        tokenContractId,
        receiverId,
        amount,
        memo,
      });

      return selectedWallet.signAndSendTransactions({ transactions });
    },
    [
      useNearConnect,
      selector,
      buildTransferFungibleTokenTransaction,
      nearConnector,
      signedAccountId,
    ]
  );

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    return () => unsubscribeRef.current?.();
  }, []);

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
      }}
    >
      {children}
    </NearContext.Provider>
  );
};
