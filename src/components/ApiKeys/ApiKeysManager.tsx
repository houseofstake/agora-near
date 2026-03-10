"use client";

import React, { useState, useEffect } from "react";
import { useNear } from "@/contexts/NearContext";
import { UpdatedButton } from "@/components/Button";
import {
  Copy,
  Trash,
  CheckCircle2,
  KeyRound,
  Plus,
  ShieldCheck,
} from "lucide-react";
import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";
import toast from "react-hot-toast";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [email, setEmail] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isInitialized && signedAccountId) {
      fetchKeys();
    } else if (isInitialized && !signedAccountId) {
      setIsLoading(false);
    }
  }, [isInitialized, signedAccountId]);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const serializedPayload = JSON.stringify({
        accountId: signedAccountId,
        timestamp: Date.now(),
      });

      const signatureData = await signMessage({ message: serializedPayload });

      if (!signatureData) {
        throw new Error("Signature failed.");
      }

      const res = await fetch("/api/api-keys/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.parse(serializedPayload),
          signature: Buffer.from(signatureData.signature).toString("base64"),
          publicKey: signatureData.publicKey,
          message: serializedPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch API keys");
      }

      const data = await res.json();
      setKeys(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsGenerating(true);
      const serializedPayload = JSON.stringify({
        accountId: signedAccountId,
        email,
        scopes: ["full"],
        timestamp: Date.now(),
      });
      const signatureData = await signMessage({ message: serializedPayload });

      if (!signatureData) {
        throw new Error("Signature failed.");
      }

      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.parse(serializedPayload),
          signature: Buffer.from(signatureData.signature).toString("base64"),
          publicKey: signatureData.publicKey,
          message: serializedPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate API key");
      }

      const data = await res.json();
      setNewKey(data.plainTextKey);
      setKeys([data, ...keys]);
      setEmail("");
      toast.success("API Key generated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate API key");
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone."
      )
    )
      return;

    try {
      const serializedPayload = JSON.stringify({
        accountId: signedAccountId,
        timestamp: Date.now(),
      });

      const signatureData = await signMessage({ message: serializedPayload });

      if (!signatureData) {
        throw new Error("Signature failed.");
      }

      const res = await fetch(`/api/api-keys/${id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.parse(serializedPayload),
          signature: Buffer.from(signatureData.signature).toString("base64"),
          publicKey: signatureData.publicKey,
          message: serializedPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to revoke API key");
      }

      setKeys(keys.filter((k) => k.id !== id));
      toast.success("API Key revoked successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke API key");
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AgoraLoader />
      </div>
    );
  }

  if (!signedAccountId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-neutral p-12 text-center shadow-newDefault">
        <KeyRound className="mb-4 h-12 w-12 text-secondary" />
        <h2 className="mb-2 text-xl font-bold text-primary">
          Authentication Required
        </h2>
        <p className="text-secondary mb-6">
          Connect your wallet to manage Developer API Keys.
        </p>
        <p className="text-sm font-semibold text-brandPrimary">
          Use the connect button in the header.
        </p>
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
                  Developer Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="dev@houseofstake.com"
                  className="w-full rounded-xl border border-line bg-transparent px-4 py-3 text-sm text-primary placeholder-secondary outline-none transition-all focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-2 text-xs text-secondary">
                  Used for important updates related to API changes.
                </p>
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
                Manage your active Developer API keys and their permissions.
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
                          <button
                            onClick={() => revokeKey(key.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-500"
                            title="Revoke Key"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
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
    </div>
  );
}
