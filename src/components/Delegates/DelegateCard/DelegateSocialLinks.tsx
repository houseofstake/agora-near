import Image from "next/image";
import discordIcon from "@/assets/discord.svg";
import xIcon from "@/assets/x.svg";
import telegramIcon from "@/assets/telegram.svg";
import toast from "react-hot-toast";
import { useAnalytics } from "@/hooks/useAnalytics";

const ICON_HEIGHT = 24;
const ICON_WIDTH = 24;

export function DelegateSocialLinks({
  discord,
  twitter,
  warpcast,
}: {
  discord?: string | null;
  twitter?: string | null;
  warpcast?: string | null;
}) {
  const { trackGenericEvent } = useAnalytics();
  const telegramUsername = warpcast?.replace(/@/g, "");
  return (
    <div className="flex flex-row gap-4 h-auto items-center justify-center">
      {twitter && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            trackGenericEvent("Share Action", {
              method: "twitter",
              action_type: "open_profile",
              target_url: `https://twitter.com/${twitter}`,
            });
            window && window.open(`https://twitter.com/${twitter}`, "_blank");
          }}
        >
          <Image
            height={ICON_HEIGHT - 6}
            width={ICON_WIDTH - 6}
            src={xIcon.src}
            alt="x icon"
          />
        </button>
      )}

      {warpcast && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            trackGenericEvent("Share Action", {
              method: "telegram",
              action_type: "open_profile",
              target_url: `https://t.me/${telegramUsername}`,
            });
            window && window.open(`https://t.me/${telegramUsername}`, "_blank");
          }}
        >
          <Image
            height={ICON_HEIGHT}
            width={ICON_WIDTH}
            src={telegramIcon.src}
            alt="Telegram icon"
          />
        </button>
      )}

      {discord && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            trackGenericEvent("Share Action", {
              method: "discord",
              action_type: "copy_handle",
              target_handle: discord,
            });
            toast("copied discord handle to clipboard");
            navigator.clipboard.writeText(discord);
          }}
        >
          <Image
            height={ICON_HEIGHT}
            width={ICON_WIDTH}
            src={discordIcon.src}
            alt="discord icon"
          />
        </button>
      )}
    </div>
  );
}
