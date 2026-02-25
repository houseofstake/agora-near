import { UpdatedButton } from "@/components/Button";
import { useNear } from "@/contexts/NearContext";
import { useEffect } from "react";
import { useWalletPopup } from "@/hooks/useWalletPopup";

export const EncourageConnectWalletDialog = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const { signedAccountId, signIn } = useNear();
  const { dismissPopup } = useWalletPopup();

  useEffect(() => {
    if (signedAccountId) {
      closeDialog();
    }
  }, [signedAccountId, closeDialog]);

  useEffect(() => {
    return () => {
      dismissPopup();
    };
  }, [dismissPopup]);

  const handleConnectWallet = () => {
    dismissPopup();
    signIn();
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-7 justify-center ">
      <div>
        <div className="text-primary text-2xl font-bold leading-loose">
          Governance starts with you!
        </div>
        <div className="justify-start text-neutral-700 text-base font-medium leading-normal">
          Your tokens matter— connect your wallet to delegate your voting power
          to trusted community members and shape the future of the NEAR
          ecosystem.
        </div>
      </div>
      <UpdatedButton
        type="primary"
        className="w-full px-[20px] py-3 font-medium text-[16px] leading-[24px]"
        onClick={handleConnectWallet}
      >
        Connect wallet
      </UpdatedButton>
    </div>
  );
};
