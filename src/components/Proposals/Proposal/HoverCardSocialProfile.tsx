import { useNearSocialProfile } from "@/hooks/useNearSocialProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  address: string;
}

export const HoverCardSocialProfile = ({ address }: Props) => {
  const { data: profile, isLoading } = useNearSocialProfile(address);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <Skeleton className="h-4 w-[150px]" />
      </div>
    );
  }

  if (!profile || !profile.name) {
    return (
      <div className="flex flex-col p-2 text-sm text-secondary">
        No NEAR.Social profile found.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2">
      <div className="font-semibold text-primary">{profile.name}</div>
      <div className="text-secondary text-xs">{address}</div>
    </div>
  );
};
