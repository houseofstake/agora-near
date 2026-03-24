"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import HeaderBg from "@/assets/bg/header.webp";
import { DistributionPieChart } from "@/components/Analytics/DistributionPieChart";
import { DelegatorRelationshipsCard } from "@/components/Analytics/DelegatorRelationshipsCard";
import { ProposalAnalyticDropdown } from "@/components/Analytics/ProposalAnalyticDropdown";
import {
  getGlobalAnalytics,
  getProposalAnalytics,
} from "@/lib/api/analytics/analytics";

export default function AnalyticsDashboard() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);

  useEffect(() => {
    getGlobalAnalytics()
      .then((data) => setGlobalData(data))
      .catch((err) => console.error("Failed to load global analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProposalId) {
      setProposalData(null);
      return;
    }

    setProposalLoading(true);
    getProposalAnalytics(selectedProposalId)
      .then((data) => setProposalData(data))
      .catch((err) => console.error("Failed to load proposal analytics:", err))
      .finally(() => setProposalLoading(false));
  }, [selectedProposalId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00E391]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Global insights into Endorsed Delegate relationships, Protocol Voting Power distribution, and historical routing."
        backgroundImg={HeaderBg.src}
      />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-16">
        {/* GLOBAL ECOSYSTEM Section */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-3xl font-extrabold text-black">
              Ecosystem Voting Power
            </h3>
            <p className="text-base font-medium text-gray-500 mt-2">
              The high-level macro distribution of voting power across the NEAR
              ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">
                Global Distribution
              </h4>
              <DistributionPieChart
                data={globalData?.delegationDistribution}
                dataKey="totalDelegatedYocto"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">
                Activity & Fluidity Metrics
              </h4>
              <DelegatorRelationshipsCard data={globalData?.relationships} />
            </div>
          </div>
        </section>

        {/* PROPOSAL SPECIFIC DISTRIBUTION */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-3xl font-extrabold text-black">
              Proposal Endorsement Analysis
            </h3>
            <p className="text-base font-medium text-gray-500 mt-2">
              Select a historical governance proposal to isolate exactly what
              voting weights were fielded by Endorsed Delegates compared to the
              public cohort.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
            <ProposalAnalyticDropdown
              onSelect={(id) => setSelectedProposalId(id)}
            />

            {proposalLoading && (
              <div className="flex items-center justify-center mt-12 py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E391]"></div>
              </div>
            )}

            {!proposalLoading && proposalData && (
              <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center">
                <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-8 w-full text-left">
                  On-chain Vote Weight Composition
                </h4>
                <div className="w-full max-w-lg">
                  <DistributionPieChart
                    data={proposalData.votesDistribution}
                    dataKey="participatingVP"
                  />
                </div>
              </div>
            )}

            {!proposalLoading && !proposalData && (
              <div className="mt-10 py-16 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-500">
                  Awaiting proposal selection...
                </span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
