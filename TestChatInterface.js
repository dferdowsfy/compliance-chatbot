import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function TestChatInterface() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Compliance Chatbot
        </Typography>
        <Typography variant="body1" paragraph>
          This is a simplified test interface that should render without any issues.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you're seeing this message, the basic React rendering is working correctly.
        </Typography>
      </Paper>
    </Box>
  );
}

export default TestChatInterface; 