"use client";

import { Check } from "lucide-react";

export type ProposalReviewMemberItem = {
  id: string;
  initials: string;
  name: string;
  subtitle: string;
  statusLabel?: string;
  statusTone: "positive" | "neutral" | "danger" | "none";
  showCheckIcon?: boolean;
};

type ProposalReviewMembersListProps = {
  title?: string;
  items: ProposalReviewMemberItem[];
  rowClassName?: string;
};

export const ProposalReviewMembersList = ({
  title = "Members",
  items,
  rowClassName = "flex items-center gap-3 px-5 py-3",
}: ProposalReviewMembersListProps) => {
  return (
    <>
      <div className="px-5 pb-1 pt-3 text-[12px] font-semibold uppercase leading-[16px] tracking-[0.3px] text-tertiary">
        {title}
      </div>
      <div className="divide-y divide-line">
        {items.map((member) => (
          <div key={member.id} className={rowClassName}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white">
              {member.initials}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#171717]">{member.name}</p>
              <p className="text-xs text-tertiary">{member.subtitle}</p>
            </div>

            {member.statusTone === "none" ? null : member.statusTone === "danger" ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#fee2e2] px-[10px] text-xs font-semibold leading-4 text-[#c52f00]">
                <span className="text-[10px] leading-none">x</span>
                <span>{member.statusLabel}</span>
              </span>
            ) : member.statusTone === "positive" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-emerald-700">
                {member.showCheckIcon && <Check className="h-3 w-3" />}
                <span>{member.statusLabel}</span>
              </span>
            ) : (
              <span className="inline-flex h-[26px] items-center rounded-full border border-line bg-neutral px-[11px] text-xs font-semibold leading-4 text-secondary">
                {member.statusLabel}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

