import { cn } from "@/lib/utils";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { truncateMiddle } from "@/lib/text";

type TruncationStrategy = "end" | "middle" | "none";

function CopyableHumanAddress({
  address,
  className = "",
  shouldTruncate = true,
  strategy = "end",
}: {
  address: string;
  className?: string;
  shouldTruncate?: boolean;
  strategy?: TruncationStrategy;
}) {
  const [isInCopiedState, setIsInCopiedState] = useState<boolean>(false);

  useEffect(() => {
    let id: NodeJS.Timeout | number | null = null;
    if (isInCopiedState) {
      id = setTimeout(() => {
        setIsInCopiedState(false);
      }, 750);
    }
    return () => {
      if (id) clearTimeout(id);
    };
  }, [isInCopiedState]);

  const displayAddress = () => {
    if (!shouldTruncate || strategy === "none") return address;
    if (strategy === "middle") return truncateMiddle(address, 6, 6);
    return address;
  };

  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center cursor-pointer group text-primary",
        shouldTruncate && "max-w-[280px]",
        className
      )}
      title={address}
    >
      <span className={cn(shouldTruncate && "truncate min-w-0")}>
        {displayAddress()}
      </span>
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigator.clipboard.writeText(address);
          setIsInCopiedState(true);
        }}
        className="flex flex-shrink-0"
      >
        {isInCopiedState ? (
          <CheckCircleIcon className="text-green-600 w-3 h-3" />
        ) : (
          <Copy className="w-3 h-3 hidden group-hover:block group-hover:opacity-90" />
        )}
      </div>
    </div>
  );
}

export default CopyableHumanAddress;
