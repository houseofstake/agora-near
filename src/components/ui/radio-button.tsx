import { cn } from "@/lib/utils";

interface RadioButtonProps {
  title: string;
  checked: boolean;
  onClick: () => void;
  "data-testid"?: string;
}

export function RadioButton({
  title,
  checked,
  onClick,
  "data-testid": testId,
}: RadioButtonProps) {
  return (
    <div
      className="py-2 cursor-pointer relative"
      onClick={onClick}
      data-testid={testId}
    >
      <p
        className={cn(
          "transition-all max-w-[calc(100%-24px)]",
          checked ? "text-primary font-medium" : "text-secondary font-normal"
        )}
      >
        {title}
      </p>

      <div
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 rounded-full w-4 h-4 flex items-center justify-center transition-all border",
          checked ? "border-primary" : "border-line"
        )}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
    </div>
  );
}
