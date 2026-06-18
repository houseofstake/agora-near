"use client";

type ProposalDiscussionItem = {
  id: string;
  initials: string;
  name: string;
  subtitle: string;
  date: string;
  body: string;
  isVeto?: boolean;
};

type ProposalDiscussionThreadProps = {
  title: string;
  items: ProposalDiscussionItem[];
  emptyStateText?: string;
};

export const ProposalDiscussionThread = ({
  title,
  items,
  emptyStateText,
}: ProposalDiscussionThreadProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.66px] text-tertiary">
          {title}
        </p>
        <div className="h-px flex-1 bg-line" />
      </div>

      {items.length === 0 && emptyStateText ? (
        <div className="rounded-xl border border-line bg-[#f9f8f7] px-4 py-4 text-sm text-[#404040]">
          {emptyStateText}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white">
                {item.initials}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold leading-5 text-[#171717]">
                        {item.name}
                      </p>
                      <p className="text-xs text-tertiary">{item.subtitle}</p>
                    </div>
                    {item.isVeto && (
                      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#fee2e2] px-[10px] text-xs font-semibold leading-4 text-[#c52f00]">
                        <span className="text-[10px] leading-none">x</span>
                        <span>Veto</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-4 text-tertiary sm:text-right">
                    {item.date}
                  </p>
                </div>
                <div
                  className={`rounded-xl px-[15px] py-[13px] text-sm leading-[22.75px] text-[#404040] ${
                    item.isVeto
                      ? "border border-[#fee2e2] bg-[rgba(254,226,226,0.5)]"
                      : "border border-line bg-[#fafafa]"
                  }`}
                >
                  {item.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export type { ProposalDiscussionItem };
