/**
 * Fireblocks Compatibility Layer
 *
 * Signs transactions individually since Fireblocks doesn't support batch.
 */

import { NearWalletBase } from "@hot-labs/near-connect";
import { providers } from "near-api-js";

export async function signAndSendTransactionsWithFireblocksCompat(
  wallet: NearWalletBase,
  params: { transactions: any[]; callbackUrl?: string }
): Promise<any[]> {
  const outcomes: any[] = [];
  for (let i = 0; i < params.transactions.length; i++) {
    console.log(`[Fireblocks] Signing ${i + 1}/${params.transactions.length}...`);
    const outcome = await wallet.signAndSendTransaction(params.transactions[i] as any);
    outcomes.push(outcome);
  }
  return outcomes;
}

export function getTransactionResults(outcomes: any[]): any[] {
  return outcomes.map((outcome) => providers.getTransactionLastResult(outcome));
}
