"use client";

import { Check, ExternalLink } from "lucide-react";

export type ProposalTimelineStage = "completed" | "active" | "pending";
export type ProposalTimelineBadgeTone =
  | "success"
  | "info"
  | "danger"
  | "neutral";

export type ProposalTimelineVoteSummary = {
  forLabel: string;
  againstLabel: string;
  votersLabel: string;
  quorumLabel: string;
  forRatio?: number;
};

export type ProposalTimelineRow = {
  id: string;
  title: string;
  rightLabel: string;
  stage: ProposalTimelineStage;
  detail?: string;
  forumLinkLabel?: string;
  badgeLabel?: string;
  badgeTone?: ProposalTimelineBadgeTone;
  voteSummary?: ProposalTimelineVoteSummary;
};

type ProposalTimelineViewProps = {
  rows: ProposalTimelineRow[];
};

export const ProposalTimelineView = ({ rows }: ProposalTimelineViewProps) => {
  return (
    <div className="relative overflow-x-hidden pt-4">
      <div className="space-y-6 sm:space-y-7">
        {rows.map((row, idx) => (
          <div key={row.id} className="relative pl-8">
            {idx < rows.length - 1 && (
              <span className="absolute left-[11px] top-[22px] h-[calc(100%+20px)] w-px bg-line" />
            )}

            <div
              className={`absolute left-0 top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                row.stage === "active"
                  ? "border-[#2563eb] bg-[#2563eb]"
                  : row.stage === "pending"
                    ? "border-line bg-neutral"
                    : "border-[#171717] bg-white"
              }`}
            >
              {row.stage === "active" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              ) : row.stage === "pending" ? (
                <span className="h-[6px] w-[6px] rounded-full bg-line" />
              ) : (
                <Check className="h-3 w-3 text-[#171717]" strokeWidth={2.5} />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                <p
                  className={`text-sm font-bold leading-5 ${
                    row.stage === "pending" ? "text-tertiary" : "text-[#171717]"
                  }`}
                >
                  {row.title}
                </p>
                <p className="text-xs leading-4 text-tertiary sm:text-right">
                  {row.rightLabel}
                </p>
              </div>

              {(row.badgeLabel || row.detail || row.forumLinkLabel) && (
                <div className="flex flex-wrap items-center gap-2 text-xs leading-4 text-tertiary">
                  {row.badgeLabel && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold ${
                        row.badgeTone === "success"
                          ? "rounded-full bg-[#dcfce7] text-[#15803d]"
                          : row.badgeTone === "info"
                            ? "rounded-md bg-[#dbeafe] font-bold text-[#2563eb]"
                            : row.badgeTone === "danger"
                              ? "rounded-full bg-[#fee2e2] text-[#c52f00]"
                              : "rounded-full border border-line bg-neutral text-secondary"
                      }`}
                    >
                      {row.badgeLabel}
                    </span>
                  )}

                  {row.detail && (
                    <span className="break-words">{row.detail}</span>
                  )}

                  {row.forumLinkLabel && (
                    <span className="inline-flex items-center gap-1 text-[#404040]">
                      <ExternalLink className="h-2.5 w-2.5" />
                      {row.forumLinkLabel}
                    </span>
                  )}
                </div>
              )}

              {row.voteSummary && (
                <div className="mt-2 rounded-xl border border-line px-3 pb-3 pt-3 sm:px-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold leading-5 text-[#06ab34]">
                      {row.voteSummary.forLabel}
                    </p>
                    <p className="text-sm font-semibold leading-5 text-[#d62600]">
                      {row.voteSummary.againstLabel}
                    </p>
                  </div>

                  <div className="mt-2 h-2 w-full rounded-full bg-[#1f1f1f]">
                    <div className="flex h-full w-full overflow-hidden rounded-full">
                      <div
                        className="h-full bg-[#06ab34]"
                        style={{
                          width: `${Math.max(0, Math.min(100, (row.voteSummary.forRatio ?? 0.66) * 100))}%`,
                        }}
                      />
                      <div className="h-full w-[2px] bg-[#171717]" />
                      <div className="h-full flex-1 bg-[#d62600]" />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs leading-4">
                    <span className="text-[#404040]">
                      {row.voteSummary.votersLabel}
                    </span>
                    <span className="text-tertiary">
                      {row.voteSummary.quorumLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
