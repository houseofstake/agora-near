import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "../ui/Drawer";

import agoraIconWithText from "@/assets/agoraIconWithText.svg";
import discordIcon from "@/assets/discord.svg";
import githubIcon from "@/assets/github.svg";
import telegramIcon from "@/assets/telegram.svg";
import twitterIcon from "@/assets/x.svg";
import TokenAmount from "@/components/shared/TokenAmount";
import { useTotalSupply } from "@/hooks/useTotalNearSupply";
import { useAnalytics } from "@/hooks/useAnalytics";

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  const pathname = usePathname() || "";
  const { ui } = Tenant.current();
  const {
    totalSupply: totalSupplyFromNear,
    isLoadingTotalSupply,
    isLoadingVotableSupply,
    votableSupply,
  } = useTotalSupply();
  const { trackGenericEvent } = useAnalytics();

  // Links
  const governanceForumLink = ui.link("governance-forum");
  const bugsLink = ui.link("bugs");
  const discordLink = ui.link("discord");
  const githubLink = ui.link("github");
  const twitterLink = ui.link("twitter");
  const telegramLink = ui.link("telegram");
  const blogLink = ui.link("blog");

  const proposalsToggle = ui.toggle("proposals");
  const hasProposals = proposalsToggle !== undefined && proposalsToggle.enabled;
  const hasProposalsHref = ui.page("proposals")?.href !== undefined;

  const delegatesToggle = ui.toggle("delegates");
  const hasDelegates = delegatesToggle !== undefined && delegatesToggle.enabled;

  const assetsToggle = ui.toggle("assets");
  const hasAssets = assetsToggle !== undefined && assetsToggle.enabled;

  const infoToggle = ui.toggle("info");
  const hasInfo = infoToggle !== undefined && infoToggle.enabled;

  const navItems = [
    ...(hasProposals
      ? [
          {
            name: "Proposals",
            href: hasProposalsHref
              ? ui.page("proposals")?.href || "/proposals"
              : "/proposals",
            target: hasProposalsHref ? "_blank" : "_self",
            isActive: pathname.includes("proposals") || pathname === "/",
          },
        ]
      : []),
    ...(hasDelegates
      ? [
          {
            name: "Voters",
            href: "/delegates",
            target: "_self",
            isActive: pathname.includes("delegates"),
          },
        ]
      : []),
    ...(hasAssets
      ? [
          {
            name: "Assets",
            href: "/assets",
            target: "_self",
            isActive: pathname.includes("assets"),
          },
        ]
      : []),
    ...(hasInfo
      ? [
          {
            name: "Info",
            href: "/info",
            target: "_self",
            isActive: pathname.includes("info"),
          },
        ]
      : []),
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="left" title="Menu">
      <div className="flex flex-col h-full">
        {/* Navigation Items */}
        <div className="pl-4 pr-6 py-8 flex flex-col justify-start items-start text-primary">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target={item.target}
              onClick={onClose}
              className={cn(
                "self-stretch pl-4 pr-2 py-2 h-12 flex items-center",
                item.isActive ? "bg-tertiary/10" : ""
              )}
            >
              <div className="font-semibold">{item.name}</div>
            </Link>
          ))}
        </div>

        {/* Bottom Sections - Fixed to bottom */}
        <div className="mt-auto text-tertiary text-base font-semibold leading-normal">
          {/* Metrics Section */}
          {(totalSupplyFromNear || votableSupply) && (
            <div className="p-8 flex flex-col justify-center border-b border-t border-line items-start gap-3">
              <div className="">
                {isLoadingTotalSupply || !totalSupplyFromNear ? (
                  "-"
                ) : (
                  <TokenAmount amount={totalSupplyFromNear} />
                )}
                total supply
              </div>
              <div>
                {isLoadingVotableSupply || !votableSupply ? (
                  "-"
                ) : (
                  <TokenAmount amount={votableSupply} currency="veNEAR" />
                )}
                votable supply
              </div>
            </div>
          )}

          {/* Links Section */}
          {(governanceForumLink ||
            bugsLink ||
            discordLink ||
            githubLink ||
            twitterLink ||
            telegramLink ||
            blogLink) && (
            <div className="px-8 py-6 border-t border-line font-medium">
              <div className="flex flex-col space-y-4">
                <a href="/terms-of-service" className="text-tertiary">
                  Terms of Use
                </a>
                {governanceForumLink && (
                  <>
                    <a
                      href={governanceForumLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                      className="text-tertiary"
                    >
                      {governanceForumLink.title}
                    </a>
                  </>
                )}
                {bugsLink && (
                  <>
                    <a
                      href={bugsLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-tertiary"
                      onClick={() => {
                        trackGenericEvent("Help/Support Accessed", {
                          method: "bug_report",
                          link: bugsLink.url,
                          source: "mobile_menu",
                        });
                      }}
                    >
                      {bugsLink.title}
                    </a>
                  </>
                )}
                {discordLink && (
                  <>
                    <a
                      href={discordLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-tertiary"
                      onClick={() => {
                        trackGenericEvent("Help/Support Accessed", {
                          method: "discord",
                          link: discordLink.url,
                          source: "mobile_menu",
                        });
                      }}
                    >
                      {discordLink.title}
                      <Image
                        src={discordIcon}
                        alt="Discord"
                        width={20}
                        height={20}
                        className="opacity-70"
                      />
                    </a>
                  </>
                )}
                {githubLink && (
                  <>
                    <a
                      href={githubLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-tertiary"
                    >
                      {githubLink.title}
                      <Image
                        src={githubIcon}
                        alt="GitHub"
                        width={20}
                        height={20}
                        className="opacity-70"
                      />
                    </a>
                  </>
                )}
                {twitterLink && (
                  <>
                    <a
                      href={twitterLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-tertiary"
                    >
                      {twitterLink.title}
                      <Image
                        src={twitterIcon}
                        alt="Twitter"
                        width={20}
                        height={20}
                        className="opacity-70"
                      />
                    </a>
                  </>
                )}
                {telegramLink && (
                  <>
                    <a
                      href={telegramLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-tertiary"
                    >
                      {telegramLink.title}
                      <Image
                        src={telegramIcon}
                        alt="Telegram"
                        width={20}
                        height={20}
                        className="opacity-70"
                      />
                    </a>
                  </>
                )}
                {blogLink && (
                  <>
                    <a
                      href={blogLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-tertiary"
                    >
                      Blog
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Agora Logo Section */}
          <div className="p-8 bg-neutral-50 flex justify-start items-center gap-2">
            <Image
              src={agoraIconWithText}
              alt="Agora Logo"
              width={82}
              height={21}
            />
            <div className="justify-start text-primary font-normal text-sm">
              Onchain Governance
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default MobileNavMenu;
