"use client";

import React from "react";
import { KeyRound, Trash, Copy } from "lucide-react";
import { ApiKey } from "./types";

interface ApiKeyListProps {
  keys: ApiKey[];
  onRevoke: (id: string) => void;
}

export default function ApiKeyList({ keys, onRevoke }: ApiKeyListProps) {
  return (
    <div className="flex flex-col gap-8 lg:col-span-2">
      <div className="overflow-hidden rounded-2xl border border-line bg-neutral shadow-newDefault">
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-lg font-bold text-primary">Active Keys</h2>
          <p className="text-sm text-secondary mt-1">
            Manage your active API keys.
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
                  <th className="px-6 py-4 font-semibold">API Key</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {keys.map((keyObj) => (
                  <tr
                    key={keyObj.id}
                    className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-primary">
                      <div className="flex items-center gap-2">
                        <span
                          className="max-w-[300px] truncate xl:max-w-[400px]"
                          title={keyObj.key}
                        >
                          {keyObj.key}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(keyObj.key);
                            import("react-hot-toast").then((m) =>
                              m.default.success("Copied to clipboard!")
                            );
                          }}
                          className="ml-2 inline-flex items-center justify-center rounded-lg p-1.5 text-tertiary transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10"
                          title="Copy Key"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-secondary">
                      {keyObj.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-secondary">
                      {new Date(keyObj.createdAt).toLocaleDateString(
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
                          onClick={() => onRevoke(keyObj.id)}
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
  );
}
