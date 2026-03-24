"use client";

type InfoTabButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
  countActiveClassName?: string;
  countInactiveClassName?: string;
};

export const InfoTabButton = ({
  label,
  isActive,
  onClick,
  count,
  countActiveClassName = "bg-primary text-neutral",
  countInactiveClassName = "bg-line text-secondary",
}: InfoTabButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-3 pb-2 pt-2 text-sm text-left ${
        isActive
          ? "border-primary font-semibold text-primary"
          : "border-transparent font-medium text-tertiary"
      }`}
    >
      <span className="text-left leading-tight">{label}</span>
      {typeof count === "number" && (
        <span
          className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
            isActive ? countActiveClassName : countInactiveClassName
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
