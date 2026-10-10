import React, { useState } from 'react';
import { Typography, Paper, Box, TextField, Button, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function LoginView({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isSignup ? '/api/signup' : '/api/login';

    try {
      const response = await fetch(`http://localhost:5555${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isSignup) {
          // Save JWT token and user object
          localStorage.setItem('jwt_token', data.access_token);
          onLoginSuccess(data.user);
        } else {
          // If signup, automatically log them in or prompt login
          setIsSignup(false);
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <LockOutlinedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {isSignup ? 'Create Account' : 'Login'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Username" 
            size="small" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField 
            label="Password" 
            type="password" 
            size="small" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" type="submit" sx={{ bgcolor: '#2c3e50', mt: 1 }}>
            {isSignup ? 'Sign Up' : 'Log In'}
          </Button>

          <Button 
            size="small" 
            onClick={() => setIsSignup(!isSignup)} 
            sx={{ textTransform: 'none' }}
          >
            {isSignup ? 'Already have an account? Log in' : "Need an account? Sign up"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}