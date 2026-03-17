"use client";

import React, { useState } from "react";
import { Plus, ShieldCheck, CheckCircle2, Copy } from "lucide-react";
import { UpdatedButton } from "@/components/Button";
import toast from "react-hot-toast";

interface CreateApiKeyFormProps {
  isGenerating: boolean;
  onGenerate: (email: string) => Promise<void>;
  newKey: string | null;
}

export default function CreateApiKeyForm({
  isGenerating,
  onGenerate,
  newKey,
}: CreateApiKeyFormProps) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await onGenerate(email);
    setEmail("");
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="rounded-2xl border border-line bg-neutral p-6 shadow-newDefault">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandPrimary/10 text-brandPrimary">
            <Plus className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-primary">Create New Key</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <h3 className="text-lg font-bold text-primary">Your New API Key</h3>
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
  );
}
