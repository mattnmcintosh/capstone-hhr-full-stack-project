import { Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
        404 - Page Not Found
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/')}
        sx={{ bgcolor: '#2c3e50' }}
      >
        Return Home
      </Button>
    </Paper>
  );
}