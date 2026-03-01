import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export const UnlockWarning = () => {
  return (
    <div className="flex flex-row items-start bg-[#F9F8F7] p-2 rounded-lg">
      <div>
        <ExclamationCircleIcon
          width={24}
          height={24}
          className="text-[#B60D0D]"
        />
      </div>
      <p className="text-sm ml-2">
        Unlocking removes your voting power immediately and ends eligibility for
        future veNEAR reward rounds. Timeline: 45 days to unlock, then if you
        staked, add 30-72 hours to unstake before withdrawal.
      </p>
    </div>
  );
};
