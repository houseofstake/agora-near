import { useNearSocialProfile } from "@/hooks/useNearSocialProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  address: string;
}

export const HoverCardSocialProfile = ({ address }: Props) => {
  const { data: profile, isLoading } = useNearSocialProfile(address);

  if (isLoading) {
    return (
      <div className="p-3">
        <Skeleton className="h-4 w-[120px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-3 gap-1">
      <div className="font-semibold text-primary text-sm">
        {profile?.name || address}
      </div>
      {profile?.name && <div className="text-secondary text-xs">{address}</div>}
    </div>
  );
};
