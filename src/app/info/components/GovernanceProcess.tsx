import React from "react";
import Link from "next/link";
import { Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    number: 1,
    title: "Forum Deliberation",
    url: "gov.near.org",
    duration: "variable",
    lineBg: "bg-emerald-400",
    circleClass: "bg-emerald-100 text-emerald-500",
    description:
      "The proposal is posted to the governance forum for public discussion and community feedback before a final proposal is submitted.",
    outcomes: [
      { text: "Proposal posted on gov.near.org", success: true, icon: "check" },
      { text: "Feedback integrated", success: true, icon: "refresh" },
    ],
  },
  {
    number: 2,
    title: "Screening Committee",
    duration: "7 days",
    lineBg: "bg-violet-400",
    circleClass: "bg-violet-100 text-violet-500",
    description:
      "The Screening Committee reviews the final proposal. Approval is required to proceed to an onchain vote.",
    outcomes: [
      { text: "Approved → proceeds to vote", success: true, icon: "check" },
      {
        text: "Rejected → Proposal requires higher quorum to pass",
        success: false,
        icon: "x",
      },
    ],
  },
  {
    number: 3,
    title: "Delegate Vote",
    duration: "14 days",
    lineBg: "bg-cyan-400",
    circleClass: "bg-cyan-100 text-cyan-500",
    description:
      "Approved proposals move to an onchain vote. Delegates have 14 days to cast their votes in favour or against.",
    outcomes: [
      { text: "Passes → Security Council check", success: true, icon: "check" },
      { text: "Defeated → proposal ends", success: false, icon: "x" },
    ],
  },
  {
    number: 4,
    title: "Security Council Check",
    duration: "7 days",
    lineBg: "bg-red-400",
    circleClass: "bg-red-100 text-red-500",
    description:
      "The Security Council has 7 days to veto the passed vote. If no veto is issued, the proposal is automatically ratified.",
    outcomes: [
      { text: "No veto → proposal ratified", success: true, icon: "check" },
      { text: "Vetoed → public post required", success: false, icon: "x" },
    ],
  },
];

export const GovernanceProcess = () => (
  <section className="mt-12">
    <h2 className="text-2xl font-bold text-primary">How Governance Works</h2>
    <p className="text-secondary mt-2 mb-6">
      All proposals follow the same sequential process before becoming ratified.
    </p>
    <div className="rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex flex-col md:flex-row items-stretch">
        {stages.map((stage, i) => (
          <div
            key={stage.number}
            className={cn(
              "relative flex flex-col flex-1 bg-white overflow-hidden min-h-[360px] border-b last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 border-gray-200",
              i === 0
                ? "rounded-tl-xl"
                : i === stages.length - 1
                  ? "rounded-tr-xl"
                  : ""
            )}
          >
            <div className={`${stage.lineBg} h-1.5 w-full`} />
            <div
              className={`absolute top-6 left-4 flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold shrink-0 ${stage.circleClass}`}
            >
              {stage.number}
            </div>
            <div className="absolute top-7 right-4">
              {stage.url ? (
                <Link
                  href={`https://${stage.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-secondary text-xs font-medium border border-gray-400"
                >
                  {stage.url}
                </Link>
              ) : (
                <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-secondary text-xs font-medium border border-gray-400">
                  {stage.duration}
                </span>
              )}
            </div>
            <div className="p-6 pt-20 flex flex-col flex-1">
              <h3 className="text-base font-bold text-primary mb-3">
                {stage.title}
              </h3>
              <p className="text-sm text-secondary mb-6 leading-relaxed flex-1">
                {stage.description}
              </p>
              <hr className="border-gray-200 mb-6" />
              <div className="space-y-3">
                {stage.outcomes.map((outcome, i) => (
                  <div
                    key={i}
                    className={cn("flex items-center gap-3 text-xs")}
                  >
                    {outcome.icon === "check" && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-200 shrink-0">
                        <Check className="w-3 h-3 text-green-700" />
                      </span>
                    )}
                    {outcome.icon === "x" && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-200 shrink-0">
                        <X className="w-3 h-3 text-red-700" />
                      </span>
                    )}
                    {outcome.icon === "refresh" && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 shrink-0">
                        <RefreshCw className="w-3 h-3 text-blue-700" />
                      </span>
                    )}
                    <span>{outcome.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-gray-200 px-4 pb-4 flex gap-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide shrink-0">
          Timeline
        </p>
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex h-4 rounded-lg overflow-hidden border border-gray-200">
            <div
              className="flex-[1] border-r border-white bg-emerald-400"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(16, 185, 129, 0.3) 2px, rgba(16, 185, 129, 0.3) 3px)",
              }}
            />
            <div className="bg-violet-400 flex-[1] border-r border-white" />
            <div className="bg-cyan-400 flex-[2] border-r border-white" />
            <div className="bg-red-400 flex-[1]" />
          </div>
          <div className="flex text-sm text-gray-500">
            <span className="flex-[1] flex items-center justify-start gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Stage 1 - variable</span>
            </span>
            <span className="flex-[1] flex items-center justify-start gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
              <span className="truncate">Stage 2 - 7 days</span>
            </span>
            <span className="flex-[2] flex items-center justify-start gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              <span className="truncate">Stage 3 - 14 days</span>
            </span>
            <span className="flex-[1] flex items-center justify-start gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span className="truncate">Stage 4 - 7 days</span>
            </span>
          </div>
          <p className="text-xs text-tertiary w-full">
            Fixed duration after forum: <strong>28 days</strong> (Screening 7d +
            Delegate vote 14d + Security Council 7d). Forum deliberation adds
            variable time before this.
          </p>
        </div>
      </div>
    </div>
  </section>
);
