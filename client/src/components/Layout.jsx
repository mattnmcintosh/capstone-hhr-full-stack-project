import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Checklist', path: '/checklist' },
    { label: 'Calendar', path: '/calendar' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <AppBar position="sticky" sx={{ bgcolor: '#2c3e50' }}>
        <Toolbar>
          <WarningAmberIcon sx={{ mr: 2, color: '#f39c12' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Heavy Handed Reminders
          </Typography>
          <Box>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.label}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 0.5,
                    borderBottom: isActive ? '2px solid #f39c12' : 'none',
                    borderRadius: 0,
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}