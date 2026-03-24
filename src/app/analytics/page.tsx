"use client";

import React, { useEffect, useState } from "react";
import { Container, Stack, Typography, Box, CircularProgress, Card, Divider } from "@mui/material";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import HeaderBg from "@/assets/bg/header.webp";
import { DistributionPieChart } from "@/components/Analytics/DistributionPieChart";
import { DelegatorRelationshipsCard } from "@/components/Analytics/DelegatorRelationshipsCard";
import { ProposalAnalyticDropdown } from "@/components/Analytics/ProposalAnalyticDropdown";
import { getGlobalAnalytics, getProposalAnalytics } from "@/lib/api/analytics/analytics"; // We will create this API binding

export default function AnalyticsDashboard() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch Global Ecosystem Data exactly once on mount
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
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Global insights into Endorsed Delegate relationships, Protocol Voting Power distribution, and historical routing."
        backgroundImg={HeaderBg.src}
      />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
        <Stack spacing={6}>
          {/* GLOBAL ECOSYSTEM KPI CARDS */}
          <Box>
            <Typography variant="h5" fontWeight="bold" mb={2}>Ecosystem Voting Power</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
              <Card sx={{ flex: 1, p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <Typography variant="subtitle1" color="text.secondary">Global Distribution</Typography>
                <DistributionPieChart data={globalData?.delegationDistribution} dataKey="totalDelegatedYocto" />
              </Card>

              <Card sx={{ flex: 1, p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <Typography variant="subtitle1" color="text.secondary">Delegator Activity & Fluidity</Typography>
                <DelegatorRelationshipsCard data={globalData?.relationships} />
              </Card>
            </Stack>
          </Box>

          <Divider />

          {/* PROPOSAL SPECIFIC DISTRIBUTION */}
          <Box>
            <Typography variant="h5" fontWeight="bold" mb={2}>Proposal Endorsement Analysis</Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Select a historical governance proposal to analyze the specific voting weight carried by Endorsed Delegates versus Standard Accounts.
            </Typography>
            
            <ProposalAnalyticDropdown onSelect={(id) => setSelectedProposalId(id)} />

            {proposalLoading && (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={30} />
              </Box>
            )}

            {proposalData && !proposalLoading && (
              <Box mt={4}>
                <Card sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <Typography variant="subtitle1" color="text.secondary" mb={2}>On-chain Vote Weight Composition</Typography>
                  <DistributionPieChart data={proposalData.votesDistribution} dataKey="participatingVP" />
                </Card>
              </Box>
            )}
          </Box>
        </Stack>
      </Container>
    </>
  );
}
