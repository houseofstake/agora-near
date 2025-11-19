/**
 * Fireblocks Compatibility Layer
 *
 * Fireblocks only supports the singular `near_signTransaction` method,
 * not the plural `near_signTransactions`. This module provides a compatibility
 * layer that detects WalletConnect wallets and handles transactions individually.
 */

import { NearWallet } from "@hot-labs/near-connect/build/wallets/near-wallets/NearWallet";
import { providers } from "near-api-js";

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
 * Sign and send transactions with Fireblocks compatibility
 *
 * This function:
 * 1. Checks if the wallet is WalletConnect-based
 * 2. If yes, signs each transaction individually (Fireblocks compatibility)
 * 3. If no, uses the standard signAndSendTransactions method
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

  // For WalletConnect wallets, sign each transaction individually
  const outcomes: any[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    console.log(
      `[Fireblocks Compat] Signing transaction ${i + 1}/${transactions.length}...`
    );

    try {
      // Use signAndSendTransaction (singular) instead of signAndSendTransactions (plural)
      const outcome = await wallet.signAndSendTransaction(transaction as any);
      outcomes.push(outcome);
      console.log(
        `[Fireblocks Compat] Transaction ${i + 1} signed and sent successfully`
      );
    } catch (error) {
      console.error(
        `[Fireblocks Compat] Failed to sign transaction ${i + 1}:`,
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
