import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatInterface from './pages/ChatInterface';
import SessionHistory from './pages/SessionHistory';
import NotFound from './pages/NotFound';

// Import components
import ProtectedRoute from './components/ProtectedRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#388e3c',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  // App state
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Set up a fake auth token for direct testing if none exists
  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      console.log('Setting up test credentials...');
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userEmail', 'test@example.com');
    }
    setHasInitialized(true);
  }, []);

  if (!hasInitialized) {
    return <div>Loading application...</div>;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:sessionId" element={<ChatInterface />} />
          <Route path="/history" element={<SessionHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 