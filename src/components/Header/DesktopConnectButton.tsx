import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";
import EncourageDelegationDot from "./EncourageDelegationDot";
import Tenant from "@/lib/tenant/tenant";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";

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
    <div className="hidden sm:flex items-center gap-2">
      {/* Theme toggle: visible when disconnected, slides out on connect, slides back on disconnect */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <ThemeToggle />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onClick={!isConnected ? handleShow : undefined}
        className="border border-line text-primary font-medium bg-wash py-2 px-4 rounded-full cursor-pointer flex items-center transition-all hover:shadow-newDefault h-[48px] relative"
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
    </div>
  );
}
