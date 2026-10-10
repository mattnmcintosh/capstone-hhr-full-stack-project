import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Layout({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 0.5 }}>
            {currentUser && <Box component="span" sx={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 'normal', ml: 1 }}>(User: {currentUser.username})</Box>}
          </Typography>

          {currentUser && (
            <Box sx={{ display: 'flex', gap: 1, mr: 3 }}>
              <Button 
                color="inherit" 
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{ bgcolor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                startIcon={<PlaylistAddCheckIcon />}
                onClick={() => navigate('/checklist')}
                sx={{ bgcolor: location.pathname === '/checklist' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              >
                Queue
              </Button>
              <Button 
                color="inherit" 
                startIcon={<CalendarMonthIcon />}
                onClick={() => navigate('/calendar')}
                sx={{ bgcolor: location.pathname === '/calendar' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              >
                Calendar
              </Button>
            </Box>
          )}

          {currentUser && (
            <Button 
              color="inherit" 
              variant="outlined" 
              size="small" 
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', textTransform: 'none' }}
            >
              Log Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}