import { Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Paper elevation={2} sx={{ p: 5, maxWidth: 500, mx: 'auto', borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          404 - Page Not Found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#2c3e50' }}>
          Return Home
        </Button>
      </Paper>
    </Box>
  );
}