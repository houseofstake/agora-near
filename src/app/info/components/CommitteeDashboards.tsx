"use client";

import React from "react";
import Link from "next/link";
import { CheckSquareIcon, Shield, ChevronRight } from "lucide-react";

const committees = [
  {
    title: "Screening Committee",
    description:
      "View pending reviews, past decisions, and committee member activity.",
    icon: CheckSquareIcon,
    href: "/proposals",
  },
  {
    title: "Security Council",
    description:
      "View active veto windows, historical vetoes, and public veto explanations.",
    icon: Shield,
    href: "/proposals",
  },
];

export const CommitteeDashboards = () => (
  <section className="mt-12">
    <h2 className="text-2xl font-black text-primary">Committee Dashboards</h2>
    <p className="text-secondary mt-2 mb-6">
      Track the activity of each governance body.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {committees.map((committee) => {
        const Icon = committee.icon;
        return (
          <Link
            key={committee.title}
            href={committee.href}
            className="flex items-start gap-4 p-5 bg-neutral border border-line rounded-xl hover:bg-wash hover:border-tertiary/30 transition-colors group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary border border-line shrink-0">
              <Icon className="w-5 h-5 text-wash" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                {committee.title}
              </h3>
              <p className="text-sm text-secondary mt-1">
                {committee.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-tertiary shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        );
      })}
    </div>
  </section>
);
