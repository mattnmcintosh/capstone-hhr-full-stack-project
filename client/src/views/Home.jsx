import { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button, Chip } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function Home({ currentUser }) {
  const navigate = useNavigate();
  const [statusInfo, setStatusInfo] = useState({ label: 'Calculating...', color: 'default', message: 'Checking your productivity pulse...' });

  // Fetch items on mount to evaluate status
  useEffect(() => {
    apiFetch('/items')
      .then((response) => {
        // Unpack items whether it's paginated or a raw array
        const items = response.items || response; 
        const pending = items.filter(i => !i.is_completed);
        const highPriority = pending.filter(i => i.priority_score > 50);

        if (pending.length === 0) {
          setStatusInfo({ 
            label: 'Immaculate / Overachiever', 
            color: 'success', 
            message: 'Your queue is completely empty.' 
          });
        } else if (highPriority.length > 0) {
          setStatusInfo({ 
            label: 'Critical Procrastination', 
            color: 'error', 
            message: `You have ${highPriority.length} high-priority items looking for attention.` 
          });
        } else {
          setStatusInfo({ 
            label: 'Moderate Avoidance', 
            color: 'warning', 
            message: `You are maintaining ${pending.length} pending. Keep an eye on your staleness velocity.` 
          });
        }
      })
      .catch((err) => console.error("Error fetching home status:", err));
  }, []);

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3, bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
          Welcome back, {currentUser?.username}! ⚡
        </Typography>

        {/* Dynamic Health Badge */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={`Status: ${statusInfo.label}`} 
            color={statusInfo.color} 
            sx={{ fontWeight: 'bold', fontSize: '0.95rem', px: 2, py: 2.5 }} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: 500 }}>
            "{statusInfo.message}"
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
          Your engine is active. Tasks are dynamically prioritized using a dual-axis algorithm measuring **staleness** (age) and **urgency** (deadline countdowns).
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<PlaylistAddCheckIcon />}
            onClick={() => navigate('/checklist')}
            sx={{ bgcolor: '#e74c3c', px: 3 }}
          >
            Open Queue
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            startIcon={<CalendarMonthIcon />}
            onClick={() => navigate('/calendar')}
            sx={{ borderColor: '#2c3e50', color: '#2c3e50', px: 3 }}
          >
            View Calendar Feed
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate('/analytics')}
            sx={{ borderColor: '#3498db', color: '#3498db', px: 3 }}
          >
            Analytics
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}