import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function Calendar() {
  return (
    <Paper elevation={1} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Calendar & .ics Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Subscribe to your dynamic calendar export to push aggressive countdown blocks straight to Apple or Google Calendar.
      </Typography>
    </Paper>
  );
}