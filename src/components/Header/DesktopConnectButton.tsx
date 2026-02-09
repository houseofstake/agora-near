import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";
import EncourageDelegationDot from "./EncourageDelegationDot";
import Tenant from "@/lib/tenant/tenant";
import { useAnalytics } from "@/hooks/useAnalytics";

type DesktopConnectButtonProps = {
  isConnected: boolean;
  show: () => void;
  accountId?: string;
  signOut: () => void;
};

export function DesktopConnectButton({
  isConnected,
  show,
  accountId,
  signOut,
}: DesktopConnectButtonProps) {
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement-wallet"
  )?.enabled;
  const { trackWalletSelectorOpened } = useAnalytics();

  const handleShow = () => {
    trackWalletSelectorOpened("header");
    show?.();
  };

  return (
    <div
      onClick={!isConnected ? handleShow : undefined}
      className="border border-line text-primary font-medium bg-wash py-2 px-4 rounded-full cursor-pointer hidden sm:flex items-center transition-all hover:shadow-newDefault h-[48px] relative"
    >
      {isConnected ? (
        <>
          <DesktopProfileDropDown accountId={accountId} signOut={signOut} />
          {isDelegationEncouragementEnabled && (
            <EncourageDelegationDot className="left-8 top-[10px]" />
          )}
        </>
      ) : (
        <>
          Connect{"\u00A0"}Wallet
          <ArrowRight className="ml-3 mr-1 stroke-primary" />
        </>
      )}
    </div>
  );
}
