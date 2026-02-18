"use client";

import { NEAR_TOKEN } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { APPROVAL_THRESHOLD_BASIS_POINTS } from "@/lib/proposalMetadata";
import { CheckIcon, X, MinusIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DECIMALS = 24;
const toYocto = (n: number) =>
  BigInt(Math.round(n * 1e6)) * BigInt(10 ** (DECIMALS - 6));

const MOCK_VOTERS = [
  { id: "vote.mob.near", power: toYocto(731_493), vote: 0 },
  { id: "hos.slimedragon.near", power: toYocto(537_652), vote: 0 },
  { id: "cc96f5...63c807", power: toYocto(502_096), vote: 0 },
  { id: "4783b5...646172", power: toYocto(500_496), vote: 0 },
  { id: "vadim.near", power: toYocto(472_951), vote: 0 },
  { id: "spareuni818.near", power: toYocto(336_223), vote: 0 },
  { id: "vinibarbosa.near", power: toYocto(253_063), vote: 1 },
  { id: "klausbravegov.near", power: toYocto(253_046), vote: 2 },
  { id: "alan777.near", power: toYocto(241_460), vote: 0 },
  { id: "charles-hos.near", power: toYocto(236_022), vote: 0 },
  { id: "zaki.near", power: toYocto(173_160), vote: 1 },
  { id: "pedro.near", power: toYocto(98_320), vote: 0 },
];

const SCENARIOS = [
  {
    label: "Super Majority — NOT Met (64.9%)",
    forVotes: toYocto(2_820_000),
    againstVotes: toYocto(1_520_000),
    abstainVotes: toYocto(5_000),
    quorum: toYocto(1_000),
    approvalThreshold: APPROVAL_THRESHOLD_BASIS_POINTS.SUPER_MAJORITY,
    thresholdLabel: "⅔ Super Majority",
  },
  {
    label: "Super Majority — MET (75%)",
    forVotes: toYocto(3_200_000),
    againstVotes: toYocto(1_070_000),
    abstainVotes: toYocto(30_000),
    quorum: toYocto(1_000),
    approvalThreshold: APPROVAL_THRESHOLD_BASIS_POINTS.SUPER_MAJORITY,
    thresholdLabel: "⅔ Super Majority",
  },
  {
    label: "Simple Majority — MET (65%)",
    forVotes: toYocto(2_820_000),
    againstVotes: toYocto(1_520_000),
    abstainVotes: toYocto(5_000),
    quorum: toYocto(1_000),
    approvalThreshold: APPROVAL_THRESHOLD_BASIS_POINTS.SIMPLE_MAJORITY,
    thresholdLabel: "Simple Majority",
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtVeNEAR(yocto: bigint): string {
  return formatNumber(
    yocto.toString(),
    NEAR_TOKEN.decimals,
    undefined,
    false,
    true,
    0,
    "stripIfInteger"
  );
}

function pct(numerator: bigint, denominator: bigint): number {
  if (denominator === 0n) return 0;
  return Number((numerator * 10000n) / denominator) / 100;
}

type Scenario = (typeof SCENARIOS)[number];

// ─── Shared Components ────────────────────────────────────────────────────────
function VoterList() {
  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-line">
        <div className="flex gap-1 bg-wash rounded-full p-0.5">
          <button className="flex-1 text-xs font-semibold py-1.5 rounded-full bg-neutral shadow-sm text-primary">
            Voters
          </button>
          <button className="flex-1 text-xs font-semibold py-1.5 rounded-full text-secondary">
            Hasn&apos;t voted
          </button>
        </div>
      </div>
      <div className="px-4 py-2 overflow-y-auto max-h-[280px]">
        <ul className="flex flex-col">
          {MOCK_VOTERS.map((voter) => (
            <li key={voter.id}>
              <div className="flex items-center justify-between py-1.5 text-xs">
                <span className="font-semibold text-secondary truncate mr-2">
                  {voter.id}
                </span>
                <span
                  className={`flex items-center gap-1 font-semibold tabular-nums whitespace-nowrap ${
                    voter.vote === 0
                      ? "text-positive"
                      : voter.vote === 1
                        ? "text-negative"
                        : "text-secondary"
                  }`}
                >
                  {fmtVeNEAR(voter.power)}
                  {voter.vote === 0 && (
                    <CheckIcon
                      strokeWidth={4}
                      className="w-3 h-3 text-positive"
                    />
                  )}
                  {voter.vote === 1 && (
                    <X strokeWidth={4} className="w-3 h-3 text-negative" />
                  )}
                  {voter.vote === 2 && (
                    <MinusIcon
                      strokeWidth={4}
                      className="w-3 h-3 text-secondary"
                    />
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SidebarShell({
  tag,
  children,
}: {
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full bg-neutral border border-line rounded-xl shadow-newDefault overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="font-semibold text-primary text-sm">
          Voting activity
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-semibold bg-purple-50 border-purple-200 text-purple-700">
          {tag}
        </span>
      </div>
      {children}
      <VoterList />
      <div className="px-4 py-3 border-t border-line">
        <button className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
          Connect wallet to vote
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 0: Current Implementation
// ═══════════════════════════════════════════════════════════════════════════════
function CurrentSummary({ scenario }: { scenario: Scenario }) {
  const { forVotes, againstVotes, abstainVotes, approvalThreshold } = scenario;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const participatingVotes = forVotes + againstVotes;
  const hasVotes = totalVotes > 0n;
  const approvalPercentage = approvalThreshold / 10000;

  const thresholdPosition =
    totalVotes > 0n
      ? approvalPercentage *
        (Number(participatingVotes) / Number(totalVotes)) *
        100
      : approvalPercentage * 100;

  return (
    <div className="mx-4 mb-2">
      <div className="flex flex-col gap-2 rounded-md border border-line shadow-newDefault px-4 py-3">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-positive">For — {fmtVeNEAR(forVotes)}</span>
          <span className="text-negative">
            Against — {fmtVeNEAR(againstVotes)}
          </span>
        </div>
        <div className="relative flex items-stretch gap-x-0.5">
          {hasVotes ? (
            <>
              {forVotes > 0n && (
                <div
                  style={{ flex: Number(forVotes) / Number(totalVotes) }}
                  className="min-w-[1px] bg-positive h-[10px]"
                />
              )}
              {againstVotes > 0n && (
                <div
                  style={{ flex: Number(againstVotes) / Number(totalVotes) }}
                  className="min-w-[1px] bg-negative h-[10px]"
                />
              )}
              {abstainVotes > 0n && (
                <div
                  style={{ flex: Number(abstainVotes) / Number(totalVotes) }}
                  className="min-w-[1px] bg-secondary h-[10px]"
                />
              )}
            </>
          ) : (
            <div className="w-full bg-wash h-[10px]" />
          )}
          <div
            className="bg-primary h-4 w-[2px] absolute -top-[3px] z-10"
            style={{ left: `${thresholdPosition}%` }}
          />
        </div>
        <div className="text-secondary text-xs">
          Quorum {fmtVeNEAR(scenario.quorum)}
        </div>
        <div className="flex justify-between items-center border-t border-line pt-2 -mx-4 px-4 bg-wash rounded-b-md pb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1 py-0.5 rounded-sm">
            ACTIVE
          </span>
          <span className="text-xs text-secondary">
            Ends 2026-02-19 6:49 pm
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 1: Dual Bar
// ═══════════════════════════════════════════════════════════════════════════════
function DualBarSummary({ scenario }: { scenario: Scenario }) {
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    quorum,
    approvalThreshold,
    thresholdLabel,
  } = scenario;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const participatingVotes = forVotes + againstVotes;
  const approvalPct = pct(forVotes, participatingVotes);
  const thresholdPct = approvalThreshold / 100;
  const quorumMet = totalVotes >= quorum;
  const approvalMet = approvalPct >= thresholdPct;

  return (
    <div className="mx-4 mb-2">
      <div className="flex flex-col gap-3 rounded-md border border-line shadow-newDefault px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-secondary">
              Approval{" "}
              <span className="text-tertiary font-normal text-[10px]">
                ({thresholdLabel} — {thresholdPct}%)
              </span>
            </span>
            <span
              className={`flex items-center gap-1 ${approvalMet ? "text-positive" : "text-negative"}`}
            >
              {approvalMet ? (
                <CheckIcon className="w-3 h-3" strokeWidth={3} />
              ) : (
                <X className="w-3 h-3" strokeWidth={3} />
              )}
              {approvalPct.toFixed(1)}%
            </span>
          </div>
          <div className="relative w-full h-2.5 bg-wash rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-positive rounded-l-full"
              style={{ width: `${pct(forVotes, participatingVotes)}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-negative rounded-r-full"
              style={{ width: `${pct(againstVotes, participatingVotes)}%` }}
            />
            <div
              className="absolute top-[-3px] h-[calc(100%+6px)] w-[2px] bg-primary z-10 rounded-full"
              style={{ left: `${thresholdPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-positive font-semibold">
              For {fmtVeNEAR(forVotes)}
            </span>
            <span className="text-negative font-semibold">
              Against {fmtVeNEAR(againstVotes)}
            </span>
          </div>
        </div>
        <div className="border-b border-line" />
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-secondary">Quorum</span>
            <span
              className={`flex items-center gap-1 ${quorumMet ? "text-positive" : "text-negative"}`}
            >
              {quorumMet ? (
                <CheckIcon className="w-3 h-3" strokeWidth={3} />
              ) : (
                <X className="w-3 h-3" strokeWidth={3} />
              )}
              {fmtVeNEAR(totalVotes)} / {fmtVeNEAR(quorum)}
            </span>
          </div>
          <div className="w-full h-2 bg-wash rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${Math.min(pct(totalVotes, quorum), 100)}%`,
              }}
            />
          </div>
          {abstainVotes > 0n && (
            <div className="text-[10px] text-tertiary">
              Includes {fmtVeNEAR(abstainVotes)} Abstain
            </div>
          )}
        </div>
        <div className="flex justify-between items-center border-t border-line pt-2 -mx-4 px-4 bg-wash rounded-b-md pb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1 py-0.5 rounded-sm">
            ACTIVE
          </span>
          <span className="text-xs text-secondary">
            Ends 2026-02-19 6:49 pm
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 2: Annotated Bar
// ═══════════════════════════════════════════════════════════════════════════════
function AnnotatedBarSummary({ scenario }: { scenario: Scenario }) {
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    quorum,
    approvalThreshold,
    thresholdLabel,
  } = scenario;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const participatingVotes = forVotes + againstVotes;
  const approvalPct = pct(forVotes, participatingVotes);
  const thresholdPct = approvalThreshold / 100;
  const quorumMet = totalVotes >= quorum;
  const approvalMet = approvalPct >= thresholdPct;
  const thresholdPosition =
    totalVotes > 0n
      ? (thresholdPct / 100) *
        (Number(participatingVotes) / Number(totalVotes)) *
        100
      : thresholdPct;

  return (
    <div className="mx-4 mb-2">
      <div className="flex flex-col gap-2 rounded-md border border-line shadow-newDefault px-4 py-3">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-positive">For — {fmtVeNEAR(forVotes)}</span>
          <span className="text-negative">
            Against — {fmtVeNEAR(againstVotes)}
          </span>
        </div>
        <div className="relative">
          <div className="flex items-stretch gap-x-0.5 relative">
            {forVotes > 0n && (
              <div
                style={{ flex: Number(forVotes) / Number(totalVotes) }}
                className="min-w-[1px] bg-positive h-[10px]"
              />
            )}
            {againstVotes > 0n && (
              <div
                style={{ flex: Number(againstVotes) / Number(totalVotes) }}
                className="min-w-[1px] bg-negative h-[10px]"
              />
            )}
            {abstainVotes > 0n && (
              <div
                style={{ flex: Number(abstainVotes) / Number(totalVotes) }}
                className="min-w-[1px] bg-secondary/30 h-[10px]"
              />
            )}
            <div
              className="bg-primary h-5 w-[2px] absolute -top-[5px] z-10"
              style={{ left: `${thresholdPosition}%` }}
            />
          </div>
          <div
            className="absolute top-[14px] z-10 flex flex-col items-center"
            style={{
              left: `${thresholdPosition}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="w-[1px] h-1 bg-primary" />
            <div className="bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 text-[8px] font-semibold text-primary whitespace-nowrap">
              {thresholdLabel} ({thresholdPct}%)
            </div>
          </div>
        </div>
        <div className="h-3" />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary border-t border-line pt-2">
          <span className="flex items-center gap-1">
            Approval:{" "}
            <span
              className={`font-semibold ${approvalMet ? "text-positive" : "text-negative"}`}
            >
              {approvalPct.toFixed(1)}%
            </span>
            {approvalMet ? (
              <CheckIcon className="w-3 h-3 text-positive" strokeWidth={3} />
            ) : (
              <X className="w-3 h-3 text-negative" strokeWidth={3} />
            )}
          </span>
          <span className="flex items-center gap-1">
            Quorum:{" "}
            <span
              className={`font-semibold ${quorumMet ? "text-positive" : "text-negative"}`}
            >
              {fmtVeNEAR(totalVotes)} / {fmtVeNEAR(quorum)}
            </span>
            {quorumMet ? (
              <CheckIcon className="w-3 h-3 text-positive" strokeWidth={3} />
            ) : (
              <X className="w-3 h-3 text-negative" strokeWidth={3} />
            )}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-line pt-2 -mx-4 px-4 bg-wash rounded-b-md pb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1 py-0.5 rounded-sm">
            ACTIVE
          </span>
          <span className="text-xs text-secondary">
            Ends 2026-02-19 6:49 pm
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 3: Info Card with Checklist
// ═══════════════════════════════════════════════════════════════════════════════
function InfoCardSummary({ scenario }: { scenario: Scenario }) {
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    quorum,
    approvalThreshold,
    thresholdLabel,
  } = scenario;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const participatingVotes = forVotes + againstVotes;
  const approvalPct = pct(forVotes, participatingVotes);
  const thresholdPct = approvalThreshold / 100;
  const quorumMet = totalVotes >= quorum;
  const approvalMet = approvalPct >= thresholdPct;
  const passing = quorumMet && approvalMet;

  return (
    <div className="mx-4 mb-2">
      <div className="flex flex-col rounded-md border border-line shadow-newDefault overflow-hidden">
        <div
          className={`flex items-center justify-between px-4 py-2 ${passing ? "bg-green-50 border-b border-green-200" : "bg-red-50 border-b border-red-200"}`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${passing ? "text-green-700" : "text-red-700"}`}
          >
            {passing ? "Currently Passing" : "Currently Not Passing"}
          </span>
          <span
            className={`text-[10px] font-semibold ${passing ? "text-green-600" : "text-red-600"}`}
          >
            {thresholdLabel}
          </span>
        </div>
        <div className="divide-y divide-line">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${approvalMet ? "bg-green-100" : "bg-red-100"}`}
              >
                {approvalMet ? (
                  <CheckIcon
                    className="w-2.5 h-2.5 text-green-600"
                    strokeWidth={3}
                  />
                ) : (
                  <X className="w-2.5 h-2.5 text-red-600" strokeWidth={3} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-primary">
                  Approval
                </span>
                <span className="text-[9px] text-tertiary">
                  {thresholdPct}% required
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold tabular-nums ${approvalMet ? "text-green-600" : "text-red-600"}`}
            >
              {approvalPct.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${quorumMet ? "bg-green-100" : "bg-red-100"}`}
              >
                {quorumMet ? (
                  <CheckIcon
                    className="w-2.5 h-2.5 text-green-600"
                    strokeWidth={3}
                  />
                ) : (
                  <X className="w-2.5 h-2.5 text-red-600" strokeWidth={3} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-primary">
                  Quorum
                </span>
                <span className="text-[9px] text-tertiary">
                  {fmtVeNEAR(quorum)} veNEAR required
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold tabular-nums ${quorumMet ? "text-green-600" : "text-red-600"}`}
            >
              {fmtVeNEAR(totalVotes)}
            </span>
          </div>
        </div>
        <div className="bg-wash border-t border-line px-4 py-2.5">
          <div className="flex items-stretch gap-x-0.5 rounded-full overflow-hidden mb-2">
            {forVotes > 0n && (
              <div
                style={{ flex: Number(forVotes) / Number(totalVotes) }}
                className="min-w-[1px] bg-positive h-[5px]"
              />
            )}
            {againstVotes > 0n && (
              <div
                style={{ flex: Number(againstVotes) / Number(totalVotes) }}
                className="min-w-[1px] bg-negative h-[5px]"
              />
            )}
            {abstainVotes > 0n && (
              <div
                style={{ flex: Number(abstainVotes) / Number(totalVotes) }}
                className="min-w-[1px] bg-secondary/30 h-[5px]"
              />
            )}
          </div>
          <div className="flex items-center gap-3 text-[9px] font-semibold flex-wrap">
            <span className="text-positive">
              ✓ For {fmtVeNEAR(forVotes)}
            </span>
            <span className="text-negative">
              ✗ Against {fmtVeNEAR(againstVotes)}
            </span>
            {abstainVotes > 0n && (
              <span className="text-secondary">
                — Abstain {fmtVeNEAR(abstainVotes)}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-line px-4 py-2 bg-wash">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1 py-0.5 rounded-sm">
            ACTIVE
          </span>
          <span className="text-xs text-secondary">
            Ends 2026-02-19 6:49 pm
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 4: Donut Chart
// ═══════════════════════════════════════════════════════════════════════════════
function DonutChart({
  forPct,
  againstPct,
  abstainPct,
  thresholdPct,
  approvalMet,
  approvalPctNum,
}: {
  forPct: number;
  againstPct: number;
  abstainPct: number;
  thresholdPct: number;
  approvalMet: boolean;
  approvalPctNum: number;
}) {
  const size = 140;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // SVG arcs: For starts from top (-90°), then Against, then Abstain
  const total = forPct + againstPct + abstainPct;
  const forLen = (forPct / total) * circumference;
  const againstLen = (againstPct / total) * circumference;
  const abstainLen = (abstainPct / total) * circumference;

  // Threshold tick on the donut (based on participating votes only)
  const thresholdAngle = -90 + (thresholdPct / 100) * (((forPct + againstPct) / total) * 360);
  const thresholdRad = (thresholdAngle * Math.PI) / 180;
  const tickInner = radius - stroke / 2 - 3;
  const tickOuter = radius + stroke / 2 + 3;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* For arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgb(var(--positive))"
          strokeWidth={stroke}
          strokeDasharray={`${forLen} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="butt"
        />
        {/* Against arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgb(var(--negative))"
          strokeWidth={stroke}
          strokeDasharray={`${againstLen} ${circumference}`}
          strokeDashoffset={-forLen}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="butt"
        />
        {/* Abstain arc */}
        {abstainPct > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgb(var(--secondary))"
            strokeWidth={stroke}
            strokeDasharray={`${abstainLen} ${circumference}`}
            strokeDashoffset={-(forLen + againstLen)}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
            opacity={0.3}
          />
        )}
        {/* Threshold tick */}
        <line
          x1={cx + tickInner * Math.cos(thresholdRad)}
          y1={cy + tickInner * Math.sin(thresholdRad)}
          x2={cx + tickOuter * Math.cos(thresholdRad)}
          y2={cy + tickOuter * Math.sin(thresholdRad)}
          stroke="rgb(var(--primary))"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-xl font-black tabular-nums ${approvalMet ? "text-positive" : "text-negative"}`}
        >
          {approvalPctNum.toFixed(1)}%
        </span>
        <span className="text-[9px] text-tertiary font-semibold">Approval</span>
      </div>
    </div>
  );
}

function DonutSummary({ scenario }: { scenario: Scenario }) {
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    quorum,
    approvalThreshold,
    thresholdLabel,
  } = scenario;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const participatingVotes = forVotes + againstVotes;
  const approvalPctVal = pct(forVotes, participatingVotes);
  const thresholdPct = approvalThreshold / 100;
  const quorumMet = totalVotes >= quorum;
  const approvalMet = approvalPctVal >= thresholdPct;

  const forPct = pct(forVotes, totalVotes);
  const againstPct = pct(againstVotes, totalVotes);
  const abstainPct = pct(abstainVotes, totalVotes);

  return (
    <div className="mx-4 mb-2">
      <div className="flex flex-col items-center gap-3 rounded-md border border-line shadow-newDefault px-4 py-4">
        <DonutChart
          forPct={forPct}
          againstPct={againstPct}
          abstainPct={abstainPct}
          thresholdPct={thresholdPct}
          approvalMet={approvalMet}
          approvalPctNum={approvalPctVal}
        />

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-positive" />
            For {fmtVeNEAR(forVotes)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-negative" />
            Against {fmtVeNEAR(againstVotes)}
          </span>
          {abstainVotes > 0n && (
            <span className="flex items-center gap-1 text-tertiary">
              <span className="w-2 h-2 rounded-full bg-secondary/30" />
              Abstain
            </span>
          )}
        </div>

        {/* Threshold label */}
        <div className="text-[10px] text-tertiary text-center">
          <span className="font-semibold text-primary">{thresholdLabel}</span> —{" "}
          {thresholdPct}% needed
        </div>

        {/* Criteria row */}
        <div className="w-full flex justify-between text-xs border-t border-line pt-2">
          <span className="flex items-center gap-1 text-secondary">
            Approval
            {approvalMet ? (
              <span className="text-positive font-semibold">✓</span>
            ) : (
              <span className="text-negative font-semibold">✗</span>
            )}
          </span>
          <span className="flex items-center gap-1 text-secondary">
            Quorum
            {quorumMet ? (
              <span className="text-positive font-semibold">
                ✓ {fmtVeNEAR(totalVotes)}
              </span>
            ) : (
              <span className="text-negative font-semibold">
                ✗ {fmtVeNEAR(totalVotes)}
              </span>
            )}
          </span>
        </div>

        <div className="w-full flex justify-between items-center border-t border-line pt-2 -mx-4 px-4 bg-wash rounded-b-md pb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1 py-0.5 rounded-sm">
            ACTIVE
          </span>
          <span className="text-xs text-secondary">
            Ends 2026-02-19 6:49 pm
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 5: Interactive Cards (hover-to-expand)
// ═══════════════════════════════════════════════════════════════════════════════
function InteractiveCard({
  label,
  value,
  subValue,
  color,
  met,
  detail,
}: {
  label: string;
  value: string;
  subValue: string;
  color: string;
  met: boolean;
  detail: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`flex flex-col rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        expanded
          ? `${met ? "border-green-300 bg-green-50/50 shadow-md" : "border-red-300 bg-red-50/50 shadow-md"}`
          : "border-line bg-neutral hover:border-primary/30 hover:shadow-sm"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${met ? "bg-green-400" : "bg-red-400"}`}
          />
          <span className="text-[11px] font-semibold text-primary">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-black tabular-nums ${color}`}
          >
            {value}
          </span>
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-secondary" />
          ) : (
            <ChevronDown className="w-3 h-3 text-secondary" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-2.5 border-t border-line/50 pt-2 text-[10px] text-tertiary space-y-1">
          <div>{subValue}</div>
          <div>{detail}</div>
        </div>
      )}
    </div>
  );
}

function InteractiveCardsSummary({ scenario }: { scenario: Scenario }) {
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    quorum,
    approvalThreshold,
    thresholdLabel,
  } = scenario;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const participatingVotes = forVotes + againstVotes;
  const approvalPct = pct(forVotes, participatingVotes);
  const thresholdPct = approvalThreshold / 100;
  const quorumMet = totalVotes >= quorum;
  const approvalMet = approvalPct >= thresholdPct;
  const passing = quorumMet && approvalMet;

  return (
    <div className="mx-4 mb-2">
      <div className="flex flex-col gap-2 rounded-md border border-line shadow-newDefault px-4 py-3">
        {/* Overall status */}
        <div
          className={`text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            passing
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {passing ? "✓ Passing" : "✗ Not Passing"} — {thresholdLabel}
        </div>

        {/* Interactive cards */}
        <InteractiveCard
          label="Approval"
          value={`${approvalPct.toFixed(1)}%`}
          subValue={`${fmtVeNEAR(forVotes)} For vs ${fmtVeNEAR(againstVotes)} Against`}
          color={approvalMet ? "text-green-600" : "text-red-600"}
          met={approvalMet}
          detail={`Requires ${thresholdPct}% approval. Currently ${approvalMet ? "above" : "below"} threshold by ${Math.abs(approvalPct - thresholdPct).toFixed(1)}pp.`}
        />
        <InteractiveCard
          label="Quorum"
          value={fmtVeNEAR(totalVotes)}
          subValue={`Required: ${fmtVeNEAR(quorum)} veNEAR`}
          color={quorumMet ? "text-green-600" : "text-red-600"}
          met={quorumMet}
          detail={`Total voting power participating: ${fmtVeNEAR(totalVotes)} veNEAR (${abstainVotes > 0n ? `incl. ${fmtVeNEAR(abstainVotes)} Abstain` : "no abstain"}).`}
        />
        <InteractiveCard
          label="For Votes"
          value={fmtVeNEAR(forVotes)}
          subValue={`${pct(forVotes, totalVotes).toFixed(1)}% of all votes`}
          color="text-positive"
          met={true}
          detail={`Represents ${pct(forVotes, participatingVotes).toFixed(1)}% of participating votes (excl. abstain).`}
        />
        <InteractiveCard
          label="Against Votes"
          value={fmtVeNEAR(againstVotes)}
          subValue={`${pct(againstVotes, totalVotes).toFixed(1)}% of all votes`}
          color="text-negative"
          met={false}
          detail={`Represents ${pct(againstVotes, participatingVotes).toFixed(1)}% of participating votes (excl. abstain).`}
        />

        <div className="flex justify-between items-center border-t border-line pt-2 -mx-4 px-4 bg-wash rounded-b-md pb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1 py-0.5 rounded-sm">
            ACTIVE
          </span>
          <span className="text-xs text-secondary">
            Ends 2026-02-19 6:49 pm
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 6: Framer Motion Animated
// ═══════════════════════════════════════════════════════════════════════════════
function FramerMotionSummary({ scenario }: { scenario: Scenario }) {
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    quorum,
    approvalThreshold,
    thresholdLabel,
  } = scenario;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const participatingVotes = forVotes + againstVotes;
  const approvalPct = pct(forVotes, participatingVotes);
  const thresholdPct = approvalThreshold / 100;
  const quorumMet = totalVotes >= quorum;
  const approvalMet = approvalPct >= thresholdPct;
  const passing = quorumMet && approvalMet;
  const [showDetails, setShowDetails] = useState(false);

  const forWidth = pct(forVotes, totalVotes);
  const againstWidth = pct(againstVotes, totalVotes);
  const thresholdPosition =
    totalVotes > 0n
      ? (thresholdPct / 100) *
        (Number(participatingVotes) / Number(totalVotes)) *
        100
      : thresholdPct;

  return (
    <div className="mx-4 mb-2">
      <div className="flex flex-col gap-3 rounded-md border border-line shadow-newDefault px-4 py-3 overflow-hidden">
        {/* Animated status badge */}
        <motion.div
          key={`${passing}`}
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`text-center py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
            passing
              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
              : "bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-200"
          }`}
        >
          {passing ? "✓ Currently Passing" : "✗ Not Passing"} — {thresholdLabel}
        </motion.div>

        {/* Animated bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold">
            <motion.span
              key={`for-${forVotes}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-positive"
            >
              For — {fmtVeNEAR(forVotes)}
            </motion.span>
            <motion.span
              key={`against-${againstVotes}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-negative"
            >
              Against — {fmtVeNEAR(againstVotes)}
            </motion.span>
          </div>

          <div className="relative flex items-stretch gap-x-0.5 h-3 rounded-full overflow-hidden bg-wash">
            <motion.div
              className="bg-positive h-full rounded-l-full"
              initial={{ width: 0 }}
              animate={{ width: `${forWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.div
              className="bg-negative h-full"
              initial={{ width: 0 }}
              animate={{ width: `${againstWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            />
            {/* Threshold marker */}
            <motion.div
              className="absolute top-[-4px] h-[calc(100%+8px)] w-[2.5px] bg-primary rounded-full z-10"
              initial={{ left: "50%", opacity: 0 }}
              animate={{ left: `${thresholdPosition}%`, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Animated criteria */}
        <div className="flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <span className="text-xs text-secondary">Approval</span>
            <motion.span
              key={`pct-${approvalPct}`}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`text-xs font-bold flex items-center gap-1 ${approvalMet ? "text-positive" : "text-negative"}`}
            >
              {approvalPct.toFixed(1)}% / {thresholdPct}%
              {approvalMet ? (
                <CheckIcon className="w-3 h-3" strokeWidth={3} />
              ) : (
                <X className="w-3 h-3" strokeWidth={3} />
              )}
            </motion.span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <span className="text-xs text-secondary">Quorum</span>
            <span
              className={`text-xs font-bold flex items-center gap-1 ${quorumMet ? "text-positive" : "text-negative"}`}
            >
              {fmtVeNEAR(totalVotes)} / {fmtVeNEAR(quorum)}
              {quorumMet ? (
                <CheckIcon className="w-3 h-3" strokeWidth={3} />
              ) : (
                <X className="w-3 h-3" strokeWidth={3} />
              )}
            </span>
          </motion.div>
        </div>

        {/* Expandable detail */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] text-primary font-semibold flex items-center justify-center gap-1 hover:underline"
        >
          {showDetails ? "Hide" : "Show"} vote breakdown
          {showDetails ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 text-[10px] border-t border-line pt-2">
                <div className="flex justify-between">
                  <span className="text-positive font-semibold">For</span>
                  <span className="text-secondary">
                    {fmtVeNEAR(forVotes)} ({forWidth.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-negative font-semibold">Against</span>
                  <span className="text-secondary">
                    {fmtVeNEAR(againstVotes)} ({againstWidth.toFixed(1)}%)
                  </span>
                </div>
                {abstainVotes > 0n && (
                  <div className="flex justify-between">
                    <span className="text-secondary font-semibold">
                      Abstain
                    </span>
                    <span className="text-secondary">
                      {fmtVeNEAR(abstainVotes)} (
                      {pct(abstainVotes, totalVotes).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center border-t border-line pt-2 -mx-4 px-4 bg-wash rounded-b-md pb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1 py-0.5 rounded-sm">
            ACTIVE
          </span>
          <span className="text-xs text-secondary">
            Ends 2026-02-19 6:49 pm
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════════
export default function VoteBarVariantsPage() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const scenario = SCENARIOS[selectedScenario];

  const variants = [
    { label: "Current", tag: "Current", component: <CurrentSummary scenario={scenario} /> },
    { label: "① Dual Bar", tag: "Dual Bar", component: <DualBarSummary scenario={scenario} /> },
    { label: "② Annotated", tag: "Annotated", component: <AnnotatedBarSummary scenario={scenario} /> },
    { label: "③ Info Card", tag: "Info Card", component: <InfoCardSummary scenario={scenario} /> },
    { label: "④ Donut Chart", tag: "Donut", component: <DonutSummary scenario={scenario} /> },
    { label: "⑤ Interactive", tag: "Interactive", component: <InteractiveCardsSummary scenario={scenario} /> },
    { label: "⑥ Animated", tag: "Framer Motion", component: <FramerMotionSummary scenario={scenario} /> },
  ];

  return (
    <div className="min-h-screen bg-wash py-8 px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="max-w-3xl">
          <h1 className="text-2xl font-black text-primary">
            Vote Bar Variants — Full Sidebar Preview
          </h1>
          <p className="text-sm text-secondary mt-1">
            Scroll horizontally to compare all {variants.length} variants. 
            detail page.
          </p>
        </div>

        {/* Scenario picker */}
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedScenario(i)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                selectedScenario === i
                  ? "bg-primary text-white border-primary"
                  : "bg-neutral text-secondary border-line hover:border-primary/40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Horizontal scroll container */}
        <div className="overflow-x-auto pb-6 -mx-6 px-6">
          <div
            className="flex gap-8 items-start"
            style={{ minWidth: `${variants.length * 400}px` }}
          >
            {variants.map((v, i) => (
              <div key={i} className="flex flex-col gap-2 w-[380px] flex-shrink-0">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className={`text-xs font-bold ${i === 0 ? "text-secondary" : "text-primary"}`}
                  >
                    {v.label}
                  </span>
                </div>
                <SidebarShell tag={v.tag}>{v.component}</SidebarShell>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
