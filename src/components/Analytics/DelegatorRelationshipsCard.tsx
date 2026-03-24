"use client";

import React from "react";
import { Box, Typography, Stack, Avatar } from "@mui/material";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

interface DelegatorRelationshipsCardProps {
  data: any;
}

export const DelegatorRelationshipsCard: React.FC<DelegatorRelationshipsCardProps> = ({ data }) => {
  if (!data) return <Typography>No data</Typography>;

  const endorsedReceiversObj = data.receivers?.find((r: any) => r.isEndorsed) || { delegatesWithMultiple: 0 };
  const standardReceiversObj = data.receivers?.find((r: any) => !r.isEndorsed) || { delegatesWithMultiple: 0 };

  return (
    <Stack spacing={3} mt={2}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: "rgba(11, 97, 205, 0.1)", color: "#0b61cd" }}>
          <AccountTreeIcon />
        </Avatar>
        <Box>
          <Typography variant="h6">{Number(data.historicallySwitched).toLocaleString()}</Typography>
          <Typography variant="body2" color="text.secondary">Addresses historically switching delegates</Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: "rgba(117, 117, 117, 0.1)", color: "#757575" }}>
          <PeopleAltIcon />
        </Avatar>
        <Box>
          <Typography variant="h6">{Number(endorsedReceiversObj.delegatesWithMultiple)} Endorsed / {Number(standardReceiversObj.delegatesWithMultiple)} Regular</Typography>
          <Typography variant="body2" color="text.secondary">Delegates receiving veNEAR from 2+ overlapping wallets</Typography>
        </Box>
      </Box>
    </Stack>
  );
};
