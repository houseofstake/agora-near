"use client";

import React, { useState, useEffect } from "react";
import { useNear } from "@/contexts/NearContext";
import { UpdatedButton } from "@/components/Button";
import {
  KeyRound,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Trash,
  Info,
  Edit2,
  Plus,
} from "lucide-react";
import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";
import toast from "react-hot-toast";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

interface ApiKey {
  id: string;
  keyHint: string;
  email: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

export default function ApiKeysManager() {
  const { isInitialized, signedAccountId, signMessage } = useNear();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "full_access",
  ]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const openDialog = useOpenDialog();

  // Edit Scope State
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editScopes, setEditScopes] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const AVAILABLE_SCOPES = [
    {
      id: "full_access",
      label: "Full Access",
      description: "Unrestricted access to all current endpoints.",
    },
    {
      id: "read:proposals",
      label: "Read Proposals",
      description: "Read public proposals and content.",
    },
    {
      id: "read:delegates",
      label: "Read Delegates",
      description: "Read public delegate profiles and status.",
    },
    {
      id: "read:staking",
      label: "Read Staking",
      description: "Read on-chain calculated validator APY.",
    },
    {
      id: "read:venear",
      label: "Read veNEAR",
      description: "Read historical minter count and total supply.",
    },
  ];

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) => {
      const nextScopes = prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId];

      const allGranularScopes = AVAILABLE_SCOPES.filter(
        (s) => s.id !== "full_access"
      ).map((s) => s.id);
      const hasAllGranular = allGranularScopes.every((s) =>
        nextScopes.includes(s)
      );

      if (hasAllGranular && !nextScopes.includes("full_access")) {
        return ["full_access"];
      }

      return nextScopes;
    });
  };

  const handleEditScopeToggle = (scopeId: string) => {
    setEditScopes((prev) => {
      const nextScopes = prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId];

      const allGranularScopes = AVAILABLE_SCOPES.filter(
        (s) => s.id !== "full_access"
      ).map((s) => s.id);
      const hasAllGranular = allGranularScopes.every((s) =>
        nextScopes.includes(s)
      );

      if (hasAllGranular && !nextScopes.includes("full_access")) {
        return ["full_access"];
      }

      return nextScopes;
    });
  };

  useEffect(() => {}, [isInitialized, signedAccountId]);

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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NEAR_API_ENDPOINT}/api-keys/list`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: payloadObj,
            signature: signatureData.signature,
            publicKey: signatureData.publicKey,
            message: serializedPayload,
          }),
        }
      );

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

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsGenerating(true);
      const payloadObj = {
        accountId: signedAccountId,
        email,
        scopes: selectedScopes,
        timestamp: Date.now(),
      };
      const serializedPayload = JSON.stringify(payloadObj, undefined, "\t");
      const signatureData = await signMessage({ message: serializedPayload });

      if (!signatureData) {
        throw new Error("Signature failed.");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NEAR_API_ENDPOINT}/api-keys`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: payloadObj,
            signature: signatureData.signature,
            publicKey: signatureData.publicKey,
            message: serializedPayload,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate API key");
      }

      const data = await res.json();
      setNewKey(data.plainTextKey);

      const newApiKey: ApiKey = {
        id: data.id,
        keyHint: data.keyHint,
        email: email,
        scopes: data.scopes,
        createdAt: data.createdAt,
        lastUsedAt: null,
      };

      setKeys([newApiKey, ...keys]);
      setEmail("");
      setSelectedScopes(["full_access"]);
      toast.success("API Key generated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate API key");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEdit = (key: ApiKey) => {
    setEditingKey(key);
    setEditScopes(key.scopes);
  };

  const updateKeyScopes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;

    try {
      setIsUpdating(true);
      const payloadObj = {
        accountId: signedAccountId,
        scopes: editScopes,
        timestamp: Date.now(),
      };

      const serializedPayload = JSON.stringify(payloadObj, undefined, "\t");
      const signatureData = await signMessage({ message: serializedPayload });

      if (!signatureData) {
        throw new Error("Signature failed.");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NEAR_API_ENDPOINT}/api-keys/${editingKey.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: payloadObj,
            signature: signatureData.signature,
            publicKey: signatureData.publicKey,
            message: serializedPayload,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update API key scopes");
      }

      const { scopes } = await res.json();

      // Update local state
      setKeys((currentKeys) =>
        currentKeys.map((k) =>
          k.id === editingKey.id ? { ...k, scopes: scopes } : k
        )
      );

      setEditingKey(null);
      setEditScopes([]);
      toast.success("API Key scopes updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update API key scopes");
    } finally {
      setIsUpdating(false);
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

            const res = await fetch(
              `${process.env.NEXT_PUBLIC_NEAR_API_ENDPOINT}/api-keys/${id}/revoke`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  data: payloadObj,
                  signature: signatureData.signature,
                  publicKey: signatureData.publicKey,
                  message: serializedPayload,
                }),
              }
            );

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

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          onClick={fetchKeys}
          isLoading={isVerifying}
          className="text-white w-full sm:w-auto px-8"
        >
          Sign to Verify
        </UpdatedButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-line bg-neutral p-6 shadow-newDefault">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandPrimary/10 text-brandPrimary">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-primary">Create New Key</h2>
            </div>

            <form onSubmit={generateKey} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">
                  User Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  className="w-full rounded-xl border border-line bg-transparent px-4 py-3 text-sm text-primary placeholder-secondary outline-none transition-all focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-2 text-xs text-secondary">
                  Used for important updates related to API changes.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-primary">
                  API Key Scopes
                </label>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {AVAILABLE_SCOPES.map((scope) => {
                    const isFullAccessSelected =
                      selectedScopes.includes("full_access");
                    const isThisScopeFullAccess = scope.id === "full_access";
                    const isChecked =
                      selectedScopes.includes(scope.id) ||
                      (isFullAccessSelected && !isThisScopeFullAccess);
                    const isDisabled =
                      isFullAccessSelected && !isThisScopeFullAccess;

                    return (
                      <label
                        key={scope.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                          isChecked
                            ? "border-brandPrimary bg-brandPrimary/5"
                            : "border-line bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex h-5 items-center mt-0.5">
                          <input
                            type="checkbox"
                            className={`h-4 w-4 rounded border-line text-brandPrimary focus:ring-brandPrimary ${
                              isDisabled
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => handleScopeToggle(scope.id)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-primary">
                            {scope.label}{" "}
                            <code className="ml-2 text-xs text-brandPrimary bg-brandPrimary/10 px-1 py-0.5 rounded">
                              {scope.id}
                            </code>
                          </span>
                          <span className="text-xs text-secondary mt-0.5">
                            {scope.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <UpdatedButton
                isSubmit
                type="primary"
                variant="rounded"
                isLoading={isGenerating}
                disabled={!email || isGenerating}
                fullWidth
              >
                Generate API Key
              </UpdatedButton>
            </form>
          </div>

          {newKey && (
            <div className="rounded-2xl border border-brandPrimary/30 bg-brandPrimary/5 p-6 shadow-newDefault mt-8">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-brandPrimary" />
                <h3 className="text-lg font-bold text-primary">
                  Your New API Key
                </h3>
              </div>
              <p className="mb-4 text-sm text-secondary">
                Please copy this key and store it securely.{" "}
                <strong className="text-red-500 font-bold">
                  You will not be able to see it again!
                </strong>
              </p>

              <div className="flex flex-col items-start gap-3">
                <code className="w-full overflow-x-auto whitespace-nowrap rounded-xl bg-black/5 dark:bg-white/10 px-4 py-3 text-sm font-medium text-primary border border-line">
                  {newKey}
                </code>
                <UpdatedButton
                  type="secondary"
                  variant="rounded"
                  onClick={copyToClipboard}
                  className="w-full sm:w-auto"
                >
                  {copied ? (
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Copy className="h-4 w-4" /> Copy Key
                    </span>
                  )}
                </UpdatedButton>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-line bg-neutral shadow-newDefault">
            <div className="border-b border-line px-6 py-5">
              <h2 className="text-lg font-bold text-primary">Active Keys</h2>
              <p className="text-sm text-secondary mt-1">
                Manage your active API keys and their permissions.
              </p>
            </div>

            <div className="overflow-x-auto">
              {keys.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <KeyRound className="mb-3 h-10 w-10 text-tertiary" />
                  <p className="text-sm font-medium text-secondary">
                    No API keys generated yet.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/5 dark:bg-white/5 text-xs uppercase text-secondary">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Key Hint</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Scopes</th>
                      <th className="px-6 py-4 font-semibold">Created</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {keys.map((key) => (
                      <tr
                        key={key.id}
                        className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-primary">
                          {key.keyHint}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-secondary">
                          {key.email}
                        </td>
                        <td className="px-6 py-4 text-secondary whitespace-normal min-w-[200px]">
                          <div className="flex flex-wrap gap-2">
                            {key.scopes && key.scopes.length > 0 ? (
                              key.scopes.includes("full_access") ? (
                                <span className="inline-flex items-center rounded-full bg-brandPrimary/10 px-2 py-0.5 text-xs font-medium text-brandPrimary">
                                  full_access
                                </span>
                              ) : (
                                key.scopes.map((scope) => (
                                  <span
                                    key={scope}
                                    className="inline-flex items-center rounded-full bg-brandPrimary/10 px-2 py-0.5 text-xs font-medium text-brandPrimary"
                                  >
                                    {scope}
                                  </span>
                                ))
                              )
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                                None
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-secondary">
                          {new Date(key.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 h-full">
                            <button
                              onClick={() => handleOpenEdit(key)}
                              className="inline-flex items-center justify-center rounded-lg p-2 text-tertiary transition-colors hover:bg-brandPrimary/10 hover:text-brandPrimary"
                              title="Edit Scopes"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => revokeKey(key.id)}
                              className="inline-flex items-center justify-center rounded-lg p-2 text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-500"
                              title="Revoke Key"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Scopes Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-neutral p-6 shadow-newDefault">
            <h3 className="mb-2 text-xl font-bold text-primary">
              Edit API Key Scopes
            </h3>
            <p className="mb-6 text-sm text-secondary">
              Update the permissions for API key hint{" "}
              <strong>{editingKey.keyHint}</strong>
            </p>

            <form onSubmit={updateKeyScopes}>
              <div className="mb-6 space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {AVAILABLE_SCOPES.map((scope) => {
                  const isFullAccessSelected =
                    editScopes.includes("full_access");
                  const isThisScopeFullAccess = scope.id === "full_access";
                  const isChecked =
                    editScopes.includes(scope.id) ||
                    (isFullAccessSelected && !isThisScopeFullAccess);
                  const isDisabled =
                    isFullAccessSelected && !isThisScopeFullAccess;

                  return (
                    <label
                      key={`edit-${scope.id}`}
                      className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                        isChecked
                          ? "border-brandPrimary bg-brandPrimary/5"
                          : "border-line bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="mt-0.5 flex h-5 items-center">
                        <input
                          type="checkbox"
                          className={`h-4 w-4 rounded border-line text-brandPrimary focus:ring-brandPrimary ${
                            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleEditScopeToggle(scope.id)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-primary">
                          {scope.label}{" "}
                          <code className="ml-2 text-xs text-brandPrimary bg-brandPrimary/10 px-1 py-0.5 rounded">
                            {scope.id}
                          </code>
                        </span>
                        <span className="text-xs text-secondary mt-0.5">
                          {scope.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <UpdatedButton
                  type="secondary"
                  variant="rounded"
                  onClick={() => setEditingKey(null)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </UpdatedButton>
                <UpdatedButton
                  isSubmit
                  type="primary"
                  variant="rounded"
                  isLoading={isUpdating}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Save Changes
                </UpdatedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
