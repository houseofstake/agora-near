import React from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

const Footer: React.FC = () => {
  const { trackGenericEvent } = useAnalytics();
  return (
    <footer className="text-secondary gap-1 flex w-full justify-center text-sm pt-4 pb-16 px-4">
      <div className="text-primary/30">&copy;</div>
      <p>
        {new Date().getFullYear()} Agora
        <span className="hidden sm:inline">
          , the onchain governance company
        </span>
      </p>
      <div className="text-primary/30">/</div>
      <a
        href="https://twitter.com/AgoraGovernance"
        className="hover:text-secondary transition"
        target="_blank"
        onClick={() => {
          trackGenericEvent("External Link Clicked", {
            link_text: "Twitter",
            link_url: "https://twitter.com/AgoraGovernance",
            section: "footer",
          });
        }}
      >
        Twitter
      </a>
      <div className="text-primary/30">/</div>
      <a
        href="https://github.com/voteagora"
        className="hover:text-secondary transition"
        target="_blank"
        onClick={() => {
          trackGenericEvent("External Link Clicked", {
            link_text: "Github",
            link_url: "https://github.com/voteagora",
            section: "footer",
          });
        }}
      >
        Github
      </a>
      <div className="text-primary/30">/</div>
      <a
        href="https://voteagora.com"
        className="hover:text-secondary transition"
        target="_blank"
        onClick={() => {
          trackGenericEvent("External Link Clicked", {
            link_text: "About",
            link_url: "https://voteagora.com",
            section: "footer",
          });
        }}
      >
        About
      </a>
    </footer>
  );
};

export default Footer;
