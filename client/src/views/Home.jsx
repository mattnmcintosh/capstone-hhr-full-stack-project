import { Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Paper elevation={2} sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
        Heavy Handed Reminders
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
        Combat executive dysfunction through ruthless double-priority queues with staleness and deadline tracking, and the 20% deadline countdown rule for time management.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ bgcolor: '#e74c3c', '&:hover': { bgcolor: '#c0392b' } }}
          onClick={() => navigate('/checklist')}
        >
          View Checklist
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate('/calendar')}
        >
          View Calendar
        </Button>
      </Box>
    </Paper>
  );
}