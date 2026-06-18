"use client";

import { ReactNode } from "react";

type ProposalReviewStatusCardProps = {
  containerClassName?: string;
  headerClassName?: string;
  statusLabel?: string;
  statusLabelClassName?: string;
  statusValue?: string;
  statusValueClassName?: string;
  preContent?: ReactNode;
  statusRowContainerClassName?: string;
  badgeLabel: string;
  badgeClassName: string;
  timeText: string;
  timeTextClassName?: string;
  progressTrackClassName: string;
  progressFillClassName: string;
  progressPercent: number;
  dateText: string;
  dateTextClassName?: string;
  timeContainerClassName?: string;
};

export const ProposalReviewStatusCard = ({
  containerClassName = "",
  headerClassName = "",
  statusLabel,
  statusLabelClassName = "text-xs text-tertiary",
  statusValue,
  statusValueClassName = "mt-2 text-2xl font-semibold leading-5 text-primary",
  preContent,
  statusRowContainerClassName = "mt-3 border-t border-line pt-3",
  badgeLabel,
  badgeClassName,
  timeText,
  timeTextClassName = "text-sm font-bold leading-5 text-primary",
  progressTrackClassName,
  progressFillClassName,
  progressPercent,
  dateText,
  dateTextClassName = "text-xs leading-4 text-tertiary",
  timeContainerClassName = "flex w-[210px] flex-col items-center gap-1.5",
}: ProposalReviewStatusCardProps) => {
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  return (
    <div className={containerClassName}>
      {(statusLabel || statusValue) && (
        <div className={headerClassName}>
          {statusLabel && <p className={statusLabelClassName}>{statusLabel}</p>}
          {statusValue && <p className={statusValueClassName}>{statusValue}</p>}
        </div>
      )}

      {preContent}

      <div className={statusRowContainerClassName}>
        <div className="flex items-center justify-between text-xs leading-4">
          <span className={badgeClassName}>{badgeLabel}</span>
          <div className={timeContainerClassName}>
            <span className={timeTextClassName}>{timeText}</span>
            <div className={progressTrackClassName}>
              <div
                className={progressFillClassName}
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <span className={dateTextClassName}>{dateText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
