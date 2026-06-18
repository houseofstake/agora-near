import { ReactNode } from "react";

type InfoNotificationBarProps = {
  message: ReactNode;
};

export const InfoNotificationBar = ({ message }: InfoNotificationBarProps) => {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-[#fffbeb]">
      <div className="mx-auto max-w-desktop px-3 py-3 sm:px-8">
        <div className="flex items-start gap-2 pl-7 text-sm font-medium text-[#92400e]">
          <span className="relative mt-[5px] inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[#d97706]">
            <span className="absolute h-1.5 w-px -translate-y-[1px] bg-[#d97706]" />
          </span>
          <p className="leading-6">{message}</p>
        </div>
      </div>
    </div>
  );
};
