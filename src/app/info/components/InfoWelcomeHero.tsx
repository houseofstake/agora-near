import React from "react";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import { ExternalLink, MessageSquare, File, Coffee } from "lucide-react";

const Icon = ({ name, className }: { name: string; className: string }) => {
  switch (name) {
    case "Governance Forums":
      return (
        <MessageSquare
          className={`p-1.5 rounded-md w-6 h-6 shrink-0 ${className}`}
        />
      );
    case "House of Stake Docs":
      return (
        <File className={`p-1.5 rounded-md w-6 h-6 shrink-0 ${className}`} />
      );
    case "Community Telegram":
      return (
        <Coffee className={`p-1.5 rounded-md w-6 h-6 shrink-0 ${className}`} />
      );
  }
};

export const InfoWelcomeHero = () => {
  const { ui } = Tenant.current();
  const page = ui.page("info");

  const linkColors = {
    "Governance Forums": "bg-blue-200 text-blue-500",
    "House of Stake Docs": "bg-green-200 text-green-500",
    "Community Telegram": "bg-purple-200 text-purple-500",
  };

  return (
    <div className="flex flex-col mt-12">
      <h1 className="text-2xl sm:text-4xl font-black text-primary">
        Welcome to the House of Stake
      </h1>
      <p className="text-base text-secondary mt-4 max-w-2xl">
        {page?.description ||
          "House of Stake is the home of NEAR governance, powered by Agora. NEAR token holders lock tokens for voting rights, delegate votes to trusted representatives, and participate in shaping the future of the NEAR ecosystem."}
      </p>
      <div className="flex flex-wrap gap-3 mt-6">
        {page?.links?.map((link, idx) => (
          <Link
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral border border-line rounded-xl text-sm font-medium text-primary hover:bg-wash hover:border-tertiary/30 transition-colors"
          >
            <Icon
              name={link.name}
              className={linkColors[link.name as keyof typeof linkColors]}
            />
            {link.title}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};
