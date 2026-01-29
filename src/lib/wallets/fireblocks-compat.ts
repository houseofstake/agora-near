/**
 * Fireblocks Compatibility Layer
 *
 * Signs transactions individually since Fireblocks doesn't support batch.
 */

import { NearWalletBase } from "@hot-labs/near-connect";
import { Optional, Transaction } from "@near-wallet-selector/core";
import { providers } from "near-api-js";

export async function signAndSendTransactionsWithFireblocksCompat(
  wallet: NearWalletBase,
  params: {
    transactions: Array<Optional<Transaction, "signerId">>;
    callbackUrl?: string;
  }
): Promise<any[]> {
  const outcomes: any[] = [];

  for (let txIndex = 0; txIndex < params.transactions.length; txIndex++) {
    const tx = params.transactions[txIndex];
    const actionCount = tx.actions.length;
    let lastOutcome: any = null;

    for (let actionIndex = 0; actionIndex < actionCount; actionIndex++) {
      const action = tx.actions[actionIndex];
      console.log(
        `[Fireblocks] Signing ${txIndex + 1}/${params.transactions.length} (action ${actionIndex + 1}/${actionCount})...`
      );

      lastOutcome = await wallet.signAndSendTransaction({
        receiverId: tx.receiverId,
        actions: [action],
      });
    }
    if (lastOutcome != null) outcomes.push(lastOutcome);
  }

  return outcomes;
}

export function getTransactionResults(outcomes: any[]): any[] {
  return outcomes.map((outcome) => providers.getTransactionLastResult(outcome));
}
