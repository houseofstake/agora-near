"use client";

import React, { useState, useEffect } from "react";
import { useNear } from "@/contexts/NearContext";
import toast from "react-hot-toast";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { ApiKey } from "./types";
import ApiKeysEmptyState from "./ApiKeysEmptyState";
import CreateApiKeyForm from "./CreateApiKeyForm";
import ApiKeyList from "./ApiKeyList";
import { baseApiUrl } from "@/lib/api/constants";

export default function ApiKeysManager() {
  const { isInitialized, signedAccountId, signMessage } = useNear();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const openDialog = useOpenDialog();

  const fetchKeys = async () => {
    try {
      setIsVerifying(true);
      const payloadObj = {
        accountId: signedAccountId,
        timestamp: Date.now(),
      };
      const serializedPayload = JSON.stringify(payloadObj, undefined, "\t");

      const signatureData = await signMessage({ message: serializedPayload });

      if (!signatureData) {
        throw new Error("Signature was rejected.");
      }

      const res = await fetch(`${baseApiUrl}/api-keys/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: payloadObj,
          signature: signatureData.signature,
          publicKey: signatureData.publicKey,
          message: serializedPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch API keys");
      }

      const data = await res.json();
      setKeys(data);
      setIsVerified(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch API keys");
    } finally {
      setIsVerifying(false);
    }
  };

  const generateKey = async (email: string) => {
    try {
      setIsGenerating(true);
      const payloadObj = {
        accountId: signedAccountId,
        email,
        timestamp: Date.now(),
      };
      const serializedPayload = JSON.stringify(payloadObj, undefined, "\t");
      const signatureData = await signMessage({ message: serializedPayload });

      if (!signatureData) {
        throw new Error("Signature failed.");
      }

      const res = await fetch(`${baseApiUrl}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: payloadObj,
          signature: signatureData.signature,
          publicKey: signatureData.publicKey,
          message: serializedPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate API key");
      }

      const data = await res.json();

      const newApiKey: ApiKey = {
        id: data.id,
        key: data.plainTextKey || data.key,
        email: email,
        createdAt: data.createdAt,
        lastUsedAt: null,
      };

      setKeys([newApiKey, ...keys]);
      toast.success("API Key generated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate API key");
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeKey = async (id: string) => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Revoke API Key",
        message:
          "Are you sure you want to revoke this API key? This action cannot be undone.",
        confirmText: "Revoke Key",
        variant: "danger",
        onConfirm: async () => {
          try {
            const payloadObj = {
              accountId: signedAccountId,
              timestamp: Date.now(),
            };
            const serializedPayload = JSON.stringify(
              payloadObj,
              undefined,
              "\t"
            );

            const signatureData = await signMessage({
              message: serializedPayload,
            });

            if (!signatureData) {
              throw new Error("Signature failed.");
            }

            const res = await fetch(`${baseApiUrl}/api-keys/${id}/revoke`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                data: payloadObj,
                signature: signatureData.signature,
                publicKey: signatureData.publicKey,
                message: serializedPayload,
              }),
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.error || "Failed to revoke API key");
            }

            setKeys((currentKeys) => currentKeys.filter((k) => k.id !== id));
            toast.success("API Key revoked successfully");
          } catch (err: any) {
            toast.error(err.message || "Failed to revoke API key");
          }
        },
      },
    });
  };

  if (!isInitialized || !signedAccountId || !isVerified) {
    return (
      <ApiKeysEmptyState
        isInitialized={isInitialized}
        signedAccountId={signedAccountId}
        isVerified={isVerified}
        isVerifying={isVerifying}
        onVerify={fetchKeys}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <CreateApiKeyForm
          isGenerating={isGenerating}
          onGenerate={generateKey}
        />
        <ApiKeyList keys={keys} onRevoke={revokeKey} />
      </div>
    </div>
  );
}
