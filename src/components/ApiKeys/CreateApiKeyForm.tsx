"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { UpdatedButton } from "@/components/Button";

interface CreateApiKeyFormProps {
  isGenerating: boolean;
  onGenerate: (email: string) => Promise<void>;
}

export default function CreateApiKeyForm({
  isGenerating,
  onGenerate,
}: CreateApiKeyFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await onGenerate(email);
    setEmail("");
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

    </div>
  );
}
