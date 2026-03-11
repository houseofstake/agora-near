"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProposalConfig } from "@/hooks/useProposalConfig";
import Link from "next/link";

const SCOPE_READ_MORE_URL = "https://houseofstake.org/docs/overview";

export const InfoScopeAndParams = () => {
  const { votingDuration, isLoading: isVotingLoading } = useProposalConfig();

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-line p-6 mt-12 rounded-xl bg-neutral shadow-sm"
    >
      <AccordionItem className="border-none" value="scope">
        <AccordionTrigger className="text-primary font-bold hover:no-underline p-0">
          House of Stake Scope & Proposal Parameters
        </AccordionTrigger>
        <AccordionContent className="pt-6 px-0">
          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            <div className="flex-1 min-w-0 border border-line rounded-t-lg overflow-hidden">
              <div className="bg-wash px-4 py-3 font-semibold text-secondary text-base border-b border-line">
                Scope
              </div>
              <div className="p-4 text-secondary">
                <p className="text-base mb-4">
                  The current scope of the House of Stake is managing the
                  economic and technical future of the NEAR Protocol through
                  stake-weighted voting.
                </p>
                <ul className="list-disc list-inside space-y-1 text-base mb-4">
                  <li>Managing the treasury</li>
                  <li>Setting key economic parameters</li>
                  <li>Overseeing protocol upgrades</li>
                  <li>Shaping ecosystem growth.</li>
                </ul>
                <Link
                  href={SCOPE_READ_MORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base underline hover:text-primary transition-colors"
                >
                  Read more
                </Link>
              </div>
            </div>
            <div className="flex-1 min-w-0 lg:max-w-[400px] flex flex-col gap-4">
              <div className="border border-line rounded-t-lg overflow-hidden flex-1">
                <div className="grid grid-cols-2 bg-wash px-4 py-3 font-semibold text-secondary text-base border-b border-line">
                  <span>Parameter</span>
                  <span className="text-right">Value</span>
                </div>
                <div className="divide-y divide-line">
                  <div className="grid grid-cols-2 px-4 py-3 text-base">
                    <span className="text-secondary font-medium">
                      Voting Period
                    </span>
                    <span className="text-primary text-right font-medium">
                      {isVotingLoading ? "-" : votingDuration}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border border-line rounded-lg bg-wash px-6 py-4 text-center text-secondary text-sm">
                Proposal Types coming soon.
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
