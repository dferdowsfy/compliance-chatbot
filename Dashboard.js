import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  CircularProgress,
  SvgIcon
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import CustomControlsUpload from '../components/CustomControlsUpload';

// Framework Icons as SVG components
const FedrampIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 300 300">
    <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 30c66.274 0 120 53.726 120 120s-53.726 120-120 120S30 216.274 30 150 83.726 30 150 30zm0 30c-49.706 0-90 40.294-90 90s40.294 90 90 90 90-40.294 90-90-40.294-90-90-90zm0 30c33.137 0 60 26.863 60 60s-26.863 60-60 60-60-26.863-60-60 26.863-60 60-60z" fill="currentColor"/>
  </SvgIcon>
);

const NistIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 300 300">
    <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 50c55.228 0 100 44.772 100 100s-44.772 100-100 100S50 205.228 50 150 94.772 50 150 50zm0 20c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z" fill="currentColor"/>
  </SvgIcon>
);

const IsoIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 300 300">
    <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 40c60.751 0 110 49.249 110 110s-49.249 110-110 110S40 210.751 40 150 89.249 40 150 40zm0 30c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z" fill="currentColor"/>
  </SvgIcon>
);

const CisIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 300 300">
    <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 45c57.99 0 105 47.01 105 105s-47.01 105-105 105S45 207.99 45 150 92.01 45 150 45zm0 30c-41.421 0-75 33.579-75 75s33.579 75 75 75 75-33.579 75-75-33.579-75-75-75z" fill="currentColor"/>
  </SvgIcon>
);

// Security frameworks data
const frameworks = [
  {
    id: 'fedramp-moderate',
    name: 'FedRAMP Moderate',
    description: 'Federal Risk and Authorization Management Program for moderate impact systems.',
    Icon: FedrampIcon,
    color: '#112e51'
  },
  {
    id: 'nist-800-53',
    name: 'NIST SP 800-53',
    description: 'Security and Privacy Controls for Federal Information Systems and Organizations.',
    Icon: NistIcon,
    color: '#1a4480'
  },
  {
    id: 'iso-27001',
    name: 'ISO 27001',
    description: 'International standard for information security management systems.',
    Icon: IsoIcon,
    color: '#2e7d32'
  },
  {
    id: 'cis-controls',
    name: 'CIS Controls',
    description: 'Center for Internet Security Controls for effective cyber defense.',
    Icon: CisIcon,
    color: '#0277bd'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Handle framework selection
  const handleFrameworkToggle = (frameworkId) => {
    setSelectedFrameworks(prevSelected => {
      if (prevSelected.includes(frameworkId)) {
        return prevSelected.filter(id => id !== frameworkId);
      } else {
        return [...prevSelected, frameworkId];
      }
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };
  
  // Navigate to history page
  const navigateToHistory = () => {
    navigate('/history');
  };
  
  // Start new session
  const startNewSession = async () => {
    if (selectedFrameworks.length === 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would call the backend API to create a new session
      // const response = await axios.post('/api/sessions', { frameworks: selectedFrameworks });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock session ID
      const sessionId = 'session-' + Math.random().toString(36).substring(2);
      
      // Store session data in localStorage for demo purposes
      // In a real app, this would be stored in the database
      localStorage.setItem('currentSessionFrameworks', JSON.stringify(selectedFrameworks));
      localStorage.setItem('currentSessionId', sessionId);
      
      // Navigate to chat interface
      navigate(`/chat/${sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  
  const handleCustomControlsUpload = (result) => {
    setSelectedFrameworks(prev => [...prev, result.frameworkId]);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Compliance Chatbot
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<HistoryIcon />}
            onClick={navigateToHistory}
          >
            Session History
          </Button>
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {userEmail}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select one or more security frameworks for your infrastructure setup
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {frameworks.map((framework) => (
            <Grid item xs={12} md={6} key={framework.id}>
              <Card 
                className={`framework-card ${selectedFrameworks.includes(framework.id) ? 'selected' : ''}`}
                onClick={() => handleFrameworkToggle(framework.id)}
                sx={{ 
                  display: 'flex',
                  height: 160,
                  cursor: 'pointer',
                  border: selectedFrameworks.includes(framework.id) ? 2 : 1,
                  borderColor: selectedFrameworks.includes(framework.id) ? framework.color : 'grey.300',
                  backgroundColor: selectedFrameworks.includes(framework.id) ? `${framework.color}0a` : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                    borderColor: framework.color,
                  }
                }}
              >
                <Box 
                  sx={{ 
                    width: 140, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 2,
                    bgcolor: 'white',
                    borderRight: 1,
                    borderColor: 'grey.200'
                  }}
                >
                  <framework.Icon 
                    sx={{
                      fontSize: 80,
                      color: framework.color,
                      opacity: selectedFrameworks.includes(framework.id) ? 1 : 0.6,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography component="div" variant="h6" sx={{ color: framework.color }}>
                        {framework.name}
                      </Typography>
                      {selectedFrameworks.includes(framework.id) && (
                        <Chip 
                          label="Selected" 
                          size="small"
                          sx={{
                            bgcolor: `${framework.color}14`,
                            color: framework.color,
                            borderColor: framework.color
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {framework.description}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
            onClick={startNewSession}
            disabled={selectedFrameworks.length === 0 || loading}
            sx={{ py: 1.5, px: 4 }}
          >
            {loading ? 'Creating Session...' : 'Start Secure Setup'}
          </Button>
        </Box>
        
        <CustomControlsUpload onUploadComplete={handleCustomControlsUpload} />
      </Container>
    </Box>
  );
};

export default Dashboard; 