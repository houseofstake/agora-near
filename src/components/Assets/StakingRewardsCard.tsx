"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

interface StakingRewardsCardProps {
  apy: string;
  className?: string;
  isLoadingApy: boolean;
}

export const StakingRewardsCard = memo(
  ({ apy, className, isLoadingApy }: StakingRewardsCardProps) => {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border-0 shadow-lg bg-black text-white",
          className
        )}
      >
        <CardContent className="relative p-3 sm:p-4 lg:p-6">
          <div className="relative text-center">
            <div className="flex flex-col lg:py-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
                Staking Rewards
              </h3>
              <p className="text-xs sm:text-sm lg:text-sm mb-4 text-white">
                Keep your tokens working!
              </p>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs sm:text-sm lg:text-sm text-white">
                  up to
                </span>
                {isLoadingApy ? (
                  "--"
                ) : (
                  <span className="text-3xl sm:text-4xl lg:text-6xl font-bold">
                    {apy}%
                  </span>
                )}
                <span className="text-xs sm:text-sm lg:text-sm text-white">
                  APY*
                </span>
                <Link
                  href="https://hos-docs.vercel.app/docs/overview/faqs#contract-level-onboarding"
                  className="flex items-center font-medium hover:opacity-80 transition-opacity gap-2 mt-2"
                >
                  Learn More
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </Link>
              </div>
            </div>
            <div className="flex flex-row w-full justify-center">
              <div className="grid grid-cols-5 gap-1 sm:gap-2 lg:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-current"
                    style={{ color: "#00E391" }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StakingRewardsCard.displayName = "StakingRewardsCard";
