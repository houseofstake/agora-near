"use client";

type InfoClockIconProps = {
  tone?: "neutral" | "danger";
  className?: string;
};

export const InfoClockIcon = ({ tone = "neutral", className = "" }: InfoClockIconProps) => {
  const borderClass = tone === "danger" ? "border-[#fca5a5]" : "border-line";
  const handClass = tone === "danger" ? "bg-[#ef4444]" : "bg-tertiary";

  return (
    <span className={`inline-flex h-4 w-4 items-center justify-center ${className}`}>
      <span
        className={`relative inline-flex h-4 w-4 items-center justify-center rounded-full border ${borderClass}`}
      >
        <span className={`absolute h-2 w-px -translate-y-[1px] ${handClass}`} />
      </span>
    </span>
  );
};
