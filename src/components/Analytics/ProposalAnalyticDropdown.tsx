"use client";

import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Box } from "@mui/material";

interface ProposalAnalyticDropdownProps {
  onSelect: (proposalId: string | null) => void;
}

export const ProposalAnalyticDropdown: React.FC<
  ProposalAnalyticDropdownProps
> = ({ onSelect }) => {
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    // In a real scenario, this fetches from `/api/v1/proposals`.
    // We are simulating fetching the proposals catalog.
    fetch("/api/v1/proposals?status=closed")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.proposals) {
          setProposals(data.proposals);
        }
      })
      .catch((err) =>
        console.error("Error fetching proposals dictionary:", err)
      );
  }, []);

  return (
    <Box>
      <Autocomplete
        options={proposals || []}
        getOptionLabel={(option) =>
          `#${option.proposalId} - ${option.title || "Untitled Proposal"}`
        }
        onChange={(_, newValue) => {
          onSelect(newValue ? newValue.proposalId.toString() : null);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Historical Proposals..."
            variant="outlined"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        )}
      />
    </Box>
  );
};
