import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Container } from '@mui/material';

import Layout from './components/Layout';
import Login from './views/Login';
import Home from './views/Home';
import Checklist from './views/Checklist';
import Calendar from './views/Calendar';
import NotFound from './views/NotFound';
import Analytics from './views/Analytics';

const theme = createTheme({
  palette: {
    primary: { main: '#2c3e50' },
    error: { main: '#e74c3c' },
    background: { default: '#f8f9fa' },
  },
});

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('jwt_token');
  return (user && token) ? JSON.parse(user) : null;
}); 

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* If not logged in, force authentication redirect on all paths */}
          {!currentUser ? (
            <Route path="*" element={
              <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Login onLoginSuccess={handleLoginSuccess} />
              </Container>
            } />
          ) : (
            /* Logged-in application routes wrapped in Layout */
            <Route path="/" element={<Layout currentUser={currentUser} onLogout={handleLogout} />}>
              <Route index element={<Home currentUser={currentUser} />} />
              <Route path="checklist" element={<Checklist />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}