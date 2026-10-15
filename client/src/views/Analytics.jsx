import { useState, useEffect } from 'react';
import { Typography, Paper, Box, Grid, Card, CardContent, Divider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiFetch } from '../utils/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch('/analytics')
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching analytics:", err));
  }, []);

  if (!stats) {
    return <Typography sx={{ mt: 4, textAlign: 'center' }}>Crunching metrics...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Analytics & Insights
        </Typography>
      </Box>

      {/* Top Summary Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderRadius: 2, borderLeft: '5px solid #2ecc71' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Completion Rate</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.completion_rate}%</Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.completed_count} of {stats.total_items} total tasks squashed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderRadius: 2, borderLeft: '5px solid #e74c3c' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Avg. Task Lifespan (Staleness)</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.avg_staleness_days} days</Typography>
              <Typography variant="caption" color="text.secondary">Time spent sitting in queue before completion</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderRadius: 2, borderLeft: '5px solid #3498db' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Active Pending Tasks</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending_count}</Typography>
              <Typography variant="caption" color="text.secondary">Items currently awaiting action</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recharts Visual Bar Graph */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#ffffff' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Task Velocity (Last 7 Days)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Tracking your daily throughput to measure how effectively you are overriding spikes.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={stats.chart_data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2c3e50', color: '#fff', borderRadius: 4 }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="completed" fill="#e74c3c" radius={[4, 4, 0, 0]} name="Tasks Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}