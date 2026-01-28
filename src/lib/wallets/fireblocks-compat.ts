/**
 * Fireblocks Compatibility Layer
 *
 * Fireblocks only supports the singular `near_signTransaction` method,
 * not the plural `near_signTransactions`. This module provides a compatibility
 * layer that attempts batch signing first, then falls back to individual
 * transaction signing if batch fails (e.g., for Fireblocks).
 */

import { NearWalletBase } from "@hot-labs/near-connect";
import { providers } from "near-api-js";

/**
 * Sign and send transactions with automatic Fireblocks fallback
 *
 * Strategy:
 * 1. Try signAndSendTransactions (batch) first - works for most wallets
 * 2. If batch fails, fall back to signing each transaction individually
 *    (required for Fireblocks which only supports near_signTransaction)
 */
export async function signAndSendTransactionsWithFireblocksCompat(
  wallet: NearWalletBase,
  params: {
    transactions: any[];
    callbackUrl?: string;
  }
): Promise<any[]> {
  const { transactions, callbackUrl } = params;

  // Try batch signing first (works for most wallets)
  try {
    const outcomes = await wallet.signAndSendTransactions({
      transactions,
      callbackUrl,
    } as any);

    return outcomes;
  } catch (batchError: any) {
    const errorMessage = batchError?.message?.toLowerCase() || "";
    const isUnsupportedMethod =
      errorMessage.includes("unsupported") ||
      errorMessage.includes("not supported") ||
      errorMessage.includes("method not found") ||
      errorMessage.includes("near_signtransactions");

    if (!isUnsupportedMethod) {
      throw batchError;
    }

    console.log(
      "[Fireblocks Compat] Batch signing not supported, falling back to individual transactions"
    );
  }

  // Fallback: sign each transaction individually (for Fireblocks)
  const outcomes: any[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    console.log(
      `[Fireblocks Compat] Signing transaction ${i + 1}/${transactions.length}...`
    );

    try {
      const outcome = await wallet.signAndSendTransaction(transaction as any);
      outcomes.push(outcome);
    } catch (error) {
      console.error(
        `[Fireblocks Compat] Failed to sign transaction ${i + 1}:`,
        error
      );
      throw error;
    }
  }

  return outcomes;
}

/**
 * Get transaction results from outcomes
 */
export function getTransactionResults(outcomes: any[]): any[] {
  return outcomes.map((outcome) => providers.getTransactionLastResult(outcome));
}
