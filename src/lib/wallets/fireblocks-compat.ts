/**
 * Fireblocks Compatibility Layer
 *
 * Fireblocks only supports the singular `near_signTransaction` method (sign-only),
 * not `near_signAndSendTransaction`. This module provides a compatibility layer that:
 * 1. Detects WalletConnect wallets (including Fireblocks)
 * 2. Uses `near_signTransaction` to sign only
 * 3. Broadcasts transactions via provider.sendTransaction (dApp-side)
 *
 * Based on: https://github.com/NearDeFi/burrow-cash/blob/main/utils/wallet-selector-compat.ts
 */

import { NearWallet } from "@hot-labs/near-connect/build/wallets/near-wallets/NearWallet";
import { providers, transactions, utils } from "near-api-js";
import { getRpcUrl } from "../utils";

/**
 * Normalize signature data from various Fireblocks/WalletConnect response formats
 * Handles: Uint8Array, plain arrays, Buffer-like objects, numeric key objects
 */
function getSignatureData(result: any): Uint8Array {
  if (result instanceof Uint8Array) {
    return result;
  } else if (Array.isArray(result)) {
    return new Uint8Array(result);
  } else if (typeof result === "object" && result !== null) {
    // Handle Buffer-like format: { type: 'Buffer', data: [...] }
    if ("type" in result && "data" in result) {
      const data = result.data;
      if (Array.isArray(data)) {
        return new Uint8Array(data);
      } else if (typeof data === "object" && data !== null) {
        return new Uint8Array(Object.values(data));
      }
    }
    // Handle numeric key objects: { 0: 64, 1: 0, ... }
    return new Uint8Array(Object.values(result));
  } else {
    throw new Error(
      `Unexpected result type from near_signTransaction: ${typeof result}`
    );
  }
}

/**
 * Check if a wallet is a WalletConnect-based wallet
 */
export function isWalletConnectWallet(wallet: NearWallet): boolean {
  const walletId = wallet.manifest?.id?.toLowerCase() || "";

  // Check for known WalletConnect wallet IDs
  const walletConnectIds = ["wallet-connect", "walletconnect", "fireblocks"];

  return walletConnectIds.some((id) => walletId.includes(id));
}

/**
 * Request signature for a single transaction using near_signTransaction
 * This is the core Fireblocks-compatible signing method
 */
async function requestSignTransaction(
  wallet: any,
  transaction: any,
  provider: providers.Provider
): Promise<any> {
  const { signerId, receiverId, actions } = transaction;

  // Get access keys for the account
  const accessKey = await provider.query<any>({
    request_type: "view_access_key_list",
    finality: "final",
    account_id: signerId,
  });

  if (!accessKey.keys || accessKey.keys.length === 0) {
    throw new Error(`No access keys found for account ${signerId}`);
  }

  // Use first available key
  const publicKey = utils.PublicKey.from(accessKey.keys[0].public_key);

  // Get current block hash
  const block = await provider.block({ finality: "final" });
  const blockHash = block.header.hash;

  // Get nonce for the account
  const accessKeyInfo = await provider.query<any>({
    request_type: "view_access_key",
    finality: "final",
    account_id: signerId,
    public_key: publicKey.toString(),
  });

  const nonce = accessKeyInfo.nonce + 1;

  // Convert actions to near-api-js action format
  const nearActions = actions.map((action: any) => {
    if (action.type === "FunctionCall") {
      return transactions.functionCall(
        action.params.methodName,
        action.params.args,
        BigInt(action.params.gas || "30000000000000"),
        BigInt(action.params.deposit || "0")
      );
    } else if (action.type === "Transfer") {
      return transactions.transfer(BigInt(action.params.deposit || "0"));
    }
    throw new Error(`Unsupported action type: ${action.type}`);
  });

  // Build the transaction
  const tx = transactions.createTransaction(
    signerId,
    publicKey,
    receiverId,
    nonce,
    nearActions,
    utils.serialize.base_decode(blockHash)
  );

  console.log(
    "[Fireblocks Compat] Requesting signature via near_signTransaction"
  );

  // Call near_signTransaction (sign-only, no broadcast)
  // Note: This assumes the wallet has a request method for WalletConnect
  // You may need to adapt this based on your actual wallet interface
  let result: any;

  try {
    // Try to access WalletConnect client if available
    const wcWallet =
      (wallet as any)._walletConnect || (wallet as any).walletConnect;
    if (!wcWallet || !wcWallet.client || !wcWallet.session) {
      throw new Error(
        "WalletConnect client not available - falling back to standard method"
      );
    }

    // Get networkId from environment
    const networkId = "mainnet";

    result = await wcWallet.client.request({
      topic: wcWallet.session.topic,
      chainId: `near:${networkId}`,
      request: {
        method: "near_signTransaction",
        params: { transaction: Array.from(tx.encode()) },
      },
    });
  } catch (error) {
    console.warn(
      "[Fireblocks Compat] Failed to use WC client directly:",
      error
    );
    // Fallback: try using wallet's signTransaction if available
    if (typeof (wallet as any).signTransaction === "function") {
      const signed = await (wallet as any).signTransaction(transaction);
      return signed;
    }
    throw error;
  }

  // Normalize the signature data
  const signatureData = getSignatureData(result);
  const bytes = Buffer.from(signatureData);

  console.log(
    "[Fireblocks Compat] Signature received, creating signed transaction"
  );

  // Create a minimal SignedTransaction-like object
  // The key is that encode() returns the raw bytes from Fireblocks
  const signedTx: any = {
    transaction: tx,
    signature: null,
    encode: () => bytes,
  };

  return signedTx;
}

/**
 * Sign and send transactions with Fireblocks compatibility
 *
 * This function:
 * 1. Checks if the wallet is WalletConnect-based
 * 2. If yes, signs each transaction individually using near_signTransaction
 * 3. Broadcasts each signed transaction via provider.sendTransaction
 * 4. If no, uses the standard signAndSendTransactions method
 */
export async function signAndSendTransactionsWithFireblocksCompat(
  wallet: NearWallet,
  params: {
    transactions: any[];
    callbackUrl?: string;
  }
): Promise<any[]> {
  const { transactions, callbackUrl } = params;

  // For non-WalletConnect wallets, use the standard method
  if (!isWalletConnectWallet(wallet)) {
    console.log("[Fireblocks Compat] Using standard signAndSendTransactions");
    return wallet.signAndSendTransactions({
      transactions,
      callbackUrl,
    } as any);
  }

  console.log(
    `[Fireblocks Compat] Detected WalletConnect wallet: ${wallet.manifest?.id}`
  );
  console.log(
    `[Fireblocks Compat] Signing ${transactions.length} transaction(s) individually for Fireblocks compatibility`
  );

  // Get RPC provider for broadcasting
  const networkId = "mainnet";
  const rpcUrl = getRpcUrl(networkId, { useArchivalNode: false });
  const provider = new providers.JsonRpcProvider({ url: rpcUrl });

  // Sign and broadcast each transaction individually
  const outcomes: any[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    console.log(
      `[Fireblocks Compat] Signing transaction ${i + 1}/${transactions.length}...`
    );

    try {
      // Sign using near_signTransaction (Fireblocks-compatible)
      const signedTx = await requestSignTransaction(
        wallet,
        transaction,
        provider
      );

      console.log(
        `[Fireblocks Compat] Broadcasting transaction ${i + 1}/${transactions.length}...`
      );

      // Broadcast via provider.sendTransaction (dApp-side)
      const outcome = await provider.sendTransaction(signedTx);
      outcomes.push(outcome);

      console.log(
        `[Fireblocks Compat] Transaction ${i + 1} completed successfully`
      );
    } catch (error) {
      console.error(
        `[Fireblocks Compat] Failed to sign/send transaction ${i + 1}:`,
        error
      );
      throw error;
    }
  }

  console.log(
    `[Fireblocks Compat] All ${outcomes.length} transaction(s) completed`
  );
  return outcomes;
}

/**
 * Get transaction results from outcomes
 */
export function getTransactionResults(outcomes: any[]): any[] {
  return outcomes.map((outcome) => providers.getTransactionLastResult(outcome));
}
