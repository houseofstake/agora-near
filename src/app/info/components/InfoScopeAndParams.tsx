"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GovernorSettingsParams from "@/app/info/components/GovernorSettingsParams";
import ContractList from "@/app/info/components/ContractList";

export const InfoScopeAndParams = () => (
  <Accordion
    type="single"
    collapsible
    className="w-full border border-line p-6 mt-12 rounded-xl bg-neutral shadow-sm"
  >
    <AccordionItem className="border-none" value="scope">
      <AccordionTrigger className="text-primary font-bold hover:no-underline p-0">
        Scope of House of Stake & Proposal Parameters
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-0">
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-[65%] border border-line rounded-lg">
            <ContractList />
          </div>
          <div className="w-full sm:w-[35%] border border-line h-fit rounded-lg">
            <GovernorSettingsParams />
          </div>
        </div>
        <div className="w-full border border-line rounded-lg mt-6">
          <div className="p-6 text-center">
            <a
              href="https://docs.agora.xyz/crypto-governance/glossary#proposal-type"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary text-sm hover:text-primary transition-colors"
            >
              Proposal Types coming soon.
            </a>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
