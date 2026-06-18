"use client";

type InfoStatCardProps = {
  value: string;
  label: string;
  variant?: "default" | "positive" | "negative";
};

export const InfoStatCard = ({
  value,
  label,
  variant = "default",
}: InfoStatCardProps) => {
  const colorClass =
    variant === "positive"
      ? "text-emerald-500"
      : variant === "negative"
        ? "text-red-600"
        : "text-primary";

  return (
    <div className="flex min-w-[96px] flex-1 flex-col rounded-xl border border-line bg-neutral px-3 py-2 shadow-newDefault sm:min-w-[120px] sm:px-4 sm:py-3">
      <div className={`text-center text-lg font-black ${colorClass}`}>
        {value}
      </div>
      <div className="mt-1 text-center text-xs text-tertiary leading-snug">
        {label.split("\n").map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
};
