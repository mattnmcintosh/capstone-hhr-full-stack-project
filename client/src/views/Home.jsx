import { Typography, Paper, Box, Button } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';

export default function Home({ currentUser }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3, bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
          Welcome back, {currentUser?.username}! ⚡
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
          Checklist tasks are dynamically prioritized using a dual-axis algorithm measuring **staleness** (age) and **urgency** (deadline countdowns). A calendar is also provided.
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
            View Calendar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}