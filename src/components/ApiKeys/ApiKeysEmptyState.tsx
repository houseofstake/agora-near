"use client";

import React from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { UpdatedButton } from "@/components/Button";
import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";

interface ApiKeysEmptyStateProps {
  isInitialized: boolean;
  signedAccountId?: string;
  isVerified: boolean;
  isVerifying: boolean;
  onVerify: () => void;
}

export default function ApiKeysEmptyState({
  isInitialized,
  signedAccountId,
  isVerified,
  isVerifying,
  onVerify,
}: ApiKeysEmptyStateProps) {
  if (!isInitialized) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AgoraLoader />
      </div>
    );
  }

  if (!signedAccountId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-neutral p-16 text-center shadow-newDefault max-w-2xl mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-line/50 mb-6">
          <KeyRound className="h-8 w-8 text-secondary" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-primary">
          Connect Wallet Required
        </h2>
        <p className="text-secondary mb-6 text-lg">
          Please connect your NEAR wallet to manage your API Keys.
        </p>
        <p className="inline-block text-sm font-medium text-brandPrimary bg-brandPrimary/10 px-4 py-2 rounded-lg">
          Use the connect button in the header above
        </p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-neutral p-16 text-center shadow-newDefault max-w-2xl mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brandPrimary/10 mb-6 border border-brandPrimary/20">
          <ShieldCheck className="h-8 w-8 text-brandPrimary" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-primary">
          Verify Ownership
        </h2>
        <p className="text-secondary mb-8 text-md max-w-md">
          To view and manage your API keys, you must sign a message with your
          connected wallet (<b>{signedAccountId}</b>) to prove ownership. No gas
          fees will be charged.
        </p>
        <UpdatedButton
          type="primary"
          variant="rounded"
          onClick={onVerify}
          isLoading={isVerifying}
          className="text-white w-full sm:w-auto px-8"
        >
          Sign to Verify
        </UpdatedButton>
      </div>
    );
  }

  return null;
}
