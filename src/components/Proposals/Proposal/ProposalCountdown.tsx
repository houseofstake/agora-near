"use client";

import { useEffect, useState } from "react";
import { ProposalStatus } from "@/lib/contracts/types/voting";

function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return "Closed";
  const s = Math.floor((msLeft / 1000) % 60);
  const m = Math.floor((msLeft / 60000) % 60);
  const h = Math.floor((msLeft / 3600000) % 24);
  const d = Math.floor(msLeft / 86400000);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || parts.length) parts.push(`${h}h`);
  if (m > 0 || parts.length) parts.push(`${m}m`);
  if (d === 0 && h === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

export function ProposalCountdown({
  votingStartTimeNs,
  votingDurationNs,
  status,
  endTimeDisplay,
  label = "Closes",
}: {
  votingStartTimeNs: string;
  votingDurationNs: string;
  status: string;
  endTimeDisplay: string;
  label?: "Closes" | "Starts";
}) {
  const [display, setDisplay] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status !== ProposalStatus.Voting) {
      setDisplay("");
      return;
    }
    const start = Number(votingStartTimeNs);
    const duration = Number(votingDurationNs);
    if (!start || !duration) {
      setDisplay("");
      return;
    }
    const startMs = start / 1_000_000;
    const endMs = (start + duration) / 1_000_000;

    const tick = () => {
      const now = Date.now();
      const targetMs = endMs;
      const msLeft = targetMs - now;
      setDisplay(formatCountdown(msLeft));
      const elapsed = Math.max(0, now - startMs);
      setProgress(Math.min(1, elapsed / (duration / 1_000_000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [votingStartTimeNs, votingDurationNs, status]);

  if (!display || display === "Closed") return null;

  if (status !== ProposalStatus.Voting) {
    return (
      <span className="text-xs text-center">
        Starts in {display} ({endTimeDisplay})
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 w-full text-center">
      <div className="text-xs font-bold text-primary tabular-nums">
        {display}
      </div>
      <div className="w-full h-2 bg-[#D6E4F8] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#367DD8] rounded-full transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="text-xs text-tertiary">
        {label} {endTimeDisplay}
      </div>
    </div>
  );
}
