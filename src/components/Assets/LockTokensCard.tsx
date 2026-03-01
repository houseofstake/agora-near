"use client";

import { memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LockClosedIcon from "@/assets/lock_closed.svg";

import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { UpdatedButton } from "../Button";
import { useNear } from "@/contexts/NearContext";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";

interface LockTokensCardProps {
  apy: string;
  className?: string;
}

export const LockTokensCard = memo(({ className }: LockTokensCardProps) => {
  const { signedAccountId, signIn } = useNear();
  const { data: accountInfo } = useVenearAccountInfo(signedAccountId);

  const openDialog = useOpenDialog();

  const handleStakeAndLock = useCallback(() => {
    if (!signedAccountId) {
      signIn();
      return;
    }

    openDialog({
      type: "NEAR_LOCK",
      params: {
        source: accountInfo ? "account_management" : "onboarding",
      },
    });
  }, [signedAccountId, openDialog, accountInfo, signIn]);

  return (
    <Card
      className={cn(
        "relative flex h-full border border-black shadow-lg",
        className
      )}
      style={{ backgroundColor: "#00E391" }}
    >
      <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col items-center gap-4">
        <Image
          src={LockClosedIcon}
          alt="coin"
          width={32}
          height={32}
          className="sm:w-9 sm:h-9 lg:w-10 lg:h-10"
        />
        <div className="text-black flex flex-col items-center gap-3 text-center">
          <h3 className="text-lg font-bold mb-2">
            Lock & Stake NEAR to participate in veNEAR rewards!
          </h3>
          <p className="text-sm mb-2">
            Rewards are variable and may be equivalent to up to ~7.5%**
            annually, depending on participation and program parameters.
          </p>

          <UpdatedButton
            type="primary"
            variant="rounded"
            onClick={handleStakeAndLock}
            className="!border-black"
          >
            Lock & Stake
          </UpdatedButton>
          <Link
            href="/info#ve-near-rewards"
            className="flex items-center justify-center font-medium hover:opacity-80 transition-opacity gap-2"
          >
            Learn More
            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

LockTokensCard.displayName = "LockTokensCard";
