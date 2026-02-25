"use client";

import { MobileProfileDropDown } from "./MobileProfileDropDown";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";

type MobileConnectButtonProps = {
  accountId?: string;
  isConnected: boolean;
  show: () => void;
  signOut: () => void;
};

export function MobileConnectButton({
  accountId,
  isConnected,
  show,
  signOut,
}: MobileConnectButtonProps) {
  return (
    <div className="sm:hidden flex items-center gap-2 opacity-100 transition-all active:opacity-60">
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

      {isConnected ? (
        <MobileProfileDropDown accountId={accountId} signOut={signOut} />
      ) : (
        <div onClick={show}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 21V19C16 18.4696 15.7893 17.9609 15.4142 17.5858C15.0391 17.2107 14.5304 17 14 17H10C9.46957 17 8.96086 17.2107 8.58579 17.5858C8.21071 17.9609 8 18.4696 8 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 12V7C7 6.46957 7.21071 5.96086 7.58579 5.58579C7.96086 5.21071 8.46957 5 9 5H15C15.5304 5 16.0391 5.21071 16.4142 5.58579C16.7893 5.96086 17 6.46957 17 7V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
