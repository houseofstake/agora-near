import { ProposalType } from "@/lib/proposalMetadata";
import { cn } from "@/lib/utils";
const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  [ProposalType.SimpleMajority]: {
    label: "Simple Majority",
    className: "border-blue-200 text-blue-700 bg-blue-50",
  },
  [ProposalType.SuperMajority]: {
    label: "Super Majority",
    className: "border-purple-200 text-purple-700 bg-purple-50",
  },
};
export const ProposalTypeBadge = ({
  type,
  className,
}: {
  type?: string | null;
  className?: string;
}) => {
  if (!type) return null;

  const config = TYPE_CONFIG[type];

  // Fallback for unknown types (future proofing)
  const label = config?.label || type.replace(/([A-Z])/g, " $1").trim();
  const style = config?.className || "border-line text-secondary bg-wash";
  return (
    <span
      className={cn(
        "inline-flex text-[10px] px-1.5 py-0.5 rounded-full border font-semibold whitespace-nowrap",
        style,
        className
      )}
    >
      {label}
    </span>
  );
};
