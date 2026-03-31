"use client";

import React, { useEffect, useState } from "react";
import { DelegationDistributionCard } from "@/components/Analytics/DelegationDistributionCard";
import { VotingActivityCard } from "@/components/Analytics/VotingActivityCard";
import { DistributionPieChart } from "@/components/Analytics/DistributionPieChart";
import { DelegatorRelationshipsCard } from "@/components/Analytics/DelegatorRelationshipsCard";
import { ProposalAnalyticDropdown } from "@/components/Analytics/ProposalAnalyticDropdown";
import { ProposalVotersList } from "@/components/Analytics/ProposalVotersList";
import { GovernanceHealthChart } from "@/components/Analytics/GovernanceHealthChart";
import { VoterEngagementCard } from "@/components/Analytics/VoterEngagementCard";
import { WhaleConcentrationCard } from "@/components/Analytics/WhaleConcentrationCard";
import {
  getGlobalAnalytics,
  getProposalAnalytics,
} from "@/lib/api/analytics/analytics";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGlobalAnalytics()
      .then((data) => {
        if (!data) throw new Error("No data received");
        setGlobalData(data);
      })
      .catch((err) => {
        console.error("Failed to load global analytics:", err);
        setError(
          "Failed to load analytics data. Please ensure the backend is available."
        );
      })
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
      <div className="min-h-screen bg-gradient-to-br from-[#FDFDFD] via-white to-[#EAF8F1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#00E391] animate-spin shadow-lg"></div>
          <span className="text-gray-500 font-medium tracking-wide animate-pulse uppercase text-sm">
            Aggregating Global Metrics
          </span>
        </div>
      </div>
    );
  }

  if (error && !globalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFDFD] via-white to-[#EAF8F1] flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl border border-red-100 p-8 rounded-3xl shadow-xl max-w-lg text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", bounce: 0.2, duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-[#00E391]/20 pb-24">
      <main className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row justify-between mt-12 mb-0 sm:my-12 max-w-full sm:max-w-[76rem]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col max-w-[36rem] mt-0 mb-8 sm:mb-0"
          >
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-extrabold text-2xl text-primary">
                Governance Analytics
              </h1>
              <div className="hidden sm:flex items-center gap-2 bg-[#00E391]/10 px-2.5 py-1 rounded-full border border-[#00E391]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E391] animate-pulse"></div>
                <span className="text-[9px] font-bold text-[#00E391] uppercase tracking-widest leading-none">
                  Live
                </span>
              </div>
            </div>
            <p className="text-secondary text-base">
              Macro insights into Endorsed Delegate relationships, Protocol
              Voting Power distribution, and historical routing across the NEAR
              ecosystem.
            </p>
          </motion.div>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16"
        >
          {/* GLOBAL ECOSYSTEM Section */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-end justify-between border-b border-gray-200/50 pb-5">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Ecosystem Voting Power
                </h3>
                <p className="text-sm font-semibold text-gray-500 mt-2">
                  Macro distribution across the active NEAR participant set.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group mb-6 sm:mb-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full relative z-10">
                <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{" "}
                  Ecosystem Composition
                </h4>
                <p className="text-sm font-medium text-gray-500 max-w-sm">
                  Overview of all active voting power distributed across the
                  platform, contrasting Endorsed Delegates against Standard
                  Accounts.
                </p>
              </div>
              <div className="relative z-10 w-full md:w-1/2 flex justify-center mt-[-30px] md:mt-0">
                <div className="w-full max-w-xs md:max-w-sm">
                  <DistributionPieChart
                    data={globalData?.delegationDistribution || []}
                    dataKey="totalDelegatedYocto"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>{" "}
                  Delegation Distribution
                </h4>
                <div className="relative z-10 w-full flex justify-center h-full pb-4">
                  <div className="w-full flex-1 min-h-[140px]">
                    <DelegationDistributionCard
                      delegationData={globalData?.delegationDistribution || []}
                      selfDelegationData={
                        globalData?.selfDelegationDistribution || []
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E391]"></span>{" "}
                  Voting Activity
                </h4>
                <div className="relative z-10 h-full pb-4">
                  <div className="w-full flex-1 min-h-[140px]">
                    <VotingActivityCard
                      data={globalData?.votingActivity || []}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>{" "}
                  Delegate Relationships
                </h4>
                <div className="relative z-10 h-full pb-4">
                  <div className="w-full flex-1 min-h-[140px]">
                    <DelegatorRelationshipsCard
                      data={globalData?.relationships}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* PROPOSAL SPECIFIC DISTRIBUTION */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-end justify-between border-b border-gray-200/50 pb-5 mt-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Proposal Endorsement Analysis
                </h3>
                <p className="text-sm font-semibold text-gray-500 mt-2">
                  Isolate Endorsed Delegate influence dynamically per proposal.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-8 lg:p-12 shadow-sm relative">
              <div className="w-full max-w-2xl mx-auto mb-10 sm:mb-12">
                <ProposalAnalyticDropdown
                  onSelect={(id) => setSelectedProposalId(id)}
                />
              </div>

              {proposalLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#00E391] animate-spin mb-4"></div>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                    Computing Weights...
                  </span>
                </motion.div>
              )}

              {!proposalLoading && proposalData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 pt-10 border-t border-gray-100/80 flex flex-col items-center"
                >
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10 text-center w-full">
                    On-chain Vote Weight Composition
                  </h4>
                  <div className="w-full max-w-md">
                    <DistributionPieChart
                      data={proposalData.votesDistribution}
                      dataKey="participatingVP"
                    />
                  </div>

                  {/* VOTERS LIST SECTION (WHO) */}
                  <ProposalVotersList proposalId={selectedProposalId!} />
                </motion.div>
              )}

              {!proposalLoading && !proposalData && (
                <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                    <span className="text-gray-300 transform rotate-45">⤡</span>
                  </div>
                  <span className="text-sm font-bold text-gray-400">
                    Awaiting proposal selection...
                  </span>
                </div>
              )}
            </div>
          </motion.section>

          {/* GOVERNANCE HEALTH GRID (NOVEL METRICS) */}
          <motion.section variants={itemVariants} className="mt-12">
            <div className="flex items-end justify-between border-b border-gray-200/50 pb-5 mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Governance Health &amp; Centralization Risk
                </h3>
                <p className="text-sm font-semibold text-gray-500 mt-2">
                  Advanced analytics isolating historical turnout, TVL
                  engagement tiers, and voting power concentration.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="w-full">
                <GovernanceHealthChart
                  turnoutTrend={globalData?.governanceHealth?.turnoutTrend}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <VoterEngagementCard
                  voterEngagement={
                    globalData?.governanceHealth?.voterEngagement
                  }
                />
                <WhaleConcentrationCard
                  whaleRisk={globalData?.governanceHealth?.whaleRisk}
                />
              </div>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}
