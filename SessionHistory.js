import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock session data for demo
const generateMockSessions = () => {
  const frameworks = {
    'fedramp-moderate': 'FedRAMP Moderate',
    'nist-800-53': 'NIST SP 800-53',
    'iso-27001': 'ISO 27001',
    'cis-controls': 'CIS Controls'
  };
  
  const providers = ['aws', 'gcp', 'azure'];
  
  return Array.from({ length: 5 }, (_, i) => {
    // Generate random date within the last month
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Select random frameworks (1-3)
    const numFrameworks = Math.floor(Math.random() * 3) + 1;
    const frameworkKeys = Object.keys(frameworks);
    const selectedFrameworks = [];
    for (let j = 0; j < numFrameworks; j++) {
      const randomFramework = frameworkKeys[Math.floor(Math.random() * frameworkKeys.length)];
      if (!selectedFrameworks.includes(randomFramework)) {
        selectedFrameworks.push(randomFramework);
      }
    }
    
    // Select random provider
    const provider = providers[Math.floor(Math.random() * providers.length)];
    
    // Calculate random compliance score
    const complianceScore = Math.floor(Math.random() * 30) + 70;
    
    return {
      id: `session-${i}`,
      date: date.toISOString(),
      frameworks: selectedFrameworks,
      frameworkNames: selectedFrameworks.map(fw => frameworks[fw]),
      cloudProvider: provider,
      complianceScore,
      controlsSatisfied: Math.floor(Math.random() * 20) + 10,
      totalControls: Math.floor(Math.random() * 20) + 20,
      description: `${provider.toUpperCase()} secure infrastructure with ${selectedFrameworks.length} compliance frameworks`,
    };
  });
};

const SessionHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Load sessions
  useEffect(() => {
    // In a real app, this would be an API call to get the user's sessions
    // For demo purposes, we'll generate mock data
    setSessions(generateMockSessions());
  }, []);
  
  // Go back to dashboard
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  // View session details
  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setShowDetails(true);
  };
  
  // Close details dialog
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  // Delete session
  const handleDeleteSession = (sessionId, event) => {
    event.stopPropagation();
    // In a real app, this would be an API call to delete the session
    setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
  };
  
  // Generate framework chip color
  const getFrameworkColor = (framework) => {
    switch (framework) {
      case 'fedramp-moderate': return 'primary';
      case 'nist-800-53': return 'secondary';
      case 'iso-27001': return 'success';
      case 'cis-controls': return 'warning';
      default: return 'default';
    }
  };
  
  // Get provider name
  const getProviderName = (provider) => {
    switch (provider) {
      case 'aws': return 'Amazon Web Services (AWS)';
      case 'gcp': return 'Google Cloud Platform (GCP)';
      case 'azure': return 'Microsoft Azure';
      default: return provider;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Download session report
  const handleDownloadReport = async () => {
    if (!selectedSession) {
      setSnackbar({
        open: true,
        message: 'No session selected',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Generating PDF for session:', selectedSession.id);
      
      // Initialize PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text('Compliance Session Report', 20, 20);
      
      // Add session information
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Session Information', 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Session ID: ${selectedSession.id}`, 20, 50);
      doc.text(`Date Created: ${formatDate(selectedSession.date)}`, 20, 58);
      doc.text(`Cloud Provider: ${getProviderName(selectedSession.cloudProvider)}`, 20, 66);
      
      // Add frameworks
      doc.setFontSize(16);
      doc.text('Compliance Frameworks', 20, 84);
      
      doc.setFontSize(12);
      selectedSession.frameworks.forEach((fw, index) => {
        const frameworkName = fw.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        doc.text(`• ${frameworkName}`, 20, 94 + (index * 8));
      });
      
      // Add compliance score
      doc.setFontSize(16);
      doc.text('Compliance Score', 20, 124);
      
      doc.setFontSize(12);
      const scoreText = `${selectedSession.complianceScore}% (${selectedSession.controlsSatisfied} of ${selectedSession.totalControls} controls satisfied)`;
      doc.text(scoreText, 20, 134);
      
      // Add controls implementation table
      doc.setFontSize(16);
      doc.text('Controls Implementation', 20, 154);
      
      // Generate controls data
      const controls = Array.from({ length: 5 }, (_, i) => {
        const randomFramework = selectedSession.frameworks[Math.floor(Math.random() * selectedSession.frameworks.length)];
        return {
          id: `${randomFramework === 'fedramp-moderate' ? 'AC' : randomFramework === 'nist-800-53' ? 'CM' : randomFramework === 'iso-27001' ? 'A' : 'CIS'}-${Math.floor(Math.random() * 20)}`,
          name: ['Access Control', 'Cryptographic Protection', 'Network Security', 'System Monitoring', 'Identification & Authentication'][Math.floor(Math.random() * 5)],
          framework: randomFramework.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          status: Math.random() > 0.3 ? 'Implemented' : 'Not Implemented',
        };
      });

      // Create table using autoTable
      autoTable(doc, {
        startY: 164,
        head: [['Control ID', 'Name', 'Framework', 'Status']],
        body: controls.map(control => [
          control.id,
          control.name,
          control.framework,
          control.status
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 60 },
          2: { cellWidth: 50 },
          3: { cellWidth: 40 },
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(128);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      const filename = `compliance-report-${selectedSession.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      setSnackbar({
        open: true,
        message: 'Report downloaded successfully',
        severity: 'success'
      });
      
      console.log('PDF generated and downloaded:', filename);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setSnackbar({
        open: true,
        message: 'Error generating report: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  // Revalidate framework
  const handleRevalidateFramework = async (sessionId) => {
    try {
      // Show loading state
      setSelectedSession(prev => ({
        ...prev,
        isRevalidating: true
      }));

      // In a real app, this would be an API call to revalidate the framework
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the session with new random values to simulate revalidation
      const newScore = Math.floor(Math.random() * 30) + 70;
      const newControlsSatisfied = Math.floor(Math.random() * 20) + 10;
      const newTotalControls = Math.floor(Math.random() * 20) + 20;

      // Update both the sessions list and selected session
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? {
                ...session,
                complianceScore: newScore,
                controlsSatisfied: newControlsSatisfied,
                totalControls: newTotalControls,
                lastRevalidated: new Date().toISOString()
              }
            : session
        )
      );

      setSelectedSession(prev => ({
        ...prev,
        complianceScore: newScore,
        controlsSatisfied: newControlsSatisfied,
        totalControls: newTotalControls,
        lastRevalidated: new Date().toISOString(),
        isRevalidating: false
      }));

    } catch (error) {
      console.error('Error revalidating framework:', error);
      setSelectedSession(prev => ({
        ...prev,
        isRevalidating: false
      }));
    }
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleGoBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Session History
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <HistoryIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5">Your Compliance Sessions</Typography>
          </Box>
          
          <List sx={{ width: '100%' }}>
            {sessions.map((session) => (
              <Paper 
                key={session.id} 
                elevation={1} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  }
                }}
                onClick={() => handleViewDetails(session)}
              >
                <ListItem>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {session.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(session.date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {session.frameworks.map((framework) => (
                          <Chip 
                            key={framework} 
                            label={framework.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                            size="small" 
                            color={getFrameworkColor(framework)}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: session.complianceScore >= 90 ? 'success.main' : 
                                  session.complianceScore >= 70 ? 'warning.main' : 'error.main',
                          }}
                        >
                          {session.complianceScore}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </ListItem>
              </Paper>
            ))}
            
            {sessions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No session history found. Start a new compliance session from the dashboard.
                </Typography>
              </Box>
            )}
          </List>
        </Paper>
      </Container>
      
      {/* Session details dialog */}
      <Dialog 
        open={showDetails} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
      >
        {selectedSession && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Session Details</Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Session ID
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedSession.id}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Date Created
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formatDate(selectedSession.date)}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Cloud Provider
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {getProviderName(selectedSession.cloudProvider)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Compliance Frameworks
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {selectedSession.frameworks.map((framework) => (
                      <Chip 
                        key={framework} 
                        label={framework.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                        size="small" 
                        color={getFrameworkColor(framework)}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Compliance Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: selectedSession.complianceScore >= 90 ? 'success.main' : 
                              selectedSession.complianceScore >= 70 ? 'warning.main' : 'error.main',
                        mr: 1
                      }}
                    >
                      {selectedSession.complianceScore}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({selectedSession.controlsSatisfied} of {selectedSession.totalControls} controls satisfied)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Controls Implementation
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Control ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Framework</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from({ length: 5 }, (_, i) => {
                          const randomFramework = selectedSession.frameworks[Math.floor(Math.random() * selectedSession.frameworks.length)];
                          return {
                            id: `${randomFramework === 'fedramp-moderate' ? 'AC' : randomFramework === 'nist-800-53' ? 'CM' : randomFramework === 'iso-27001' ? 'A' : 'CIS'}-${Math.floor(Math.random() * 20)}`,
                            name: ['Access Control', 'Cryptographic Protection', 'Network Security', 'System Monitoring', 'Identification & Authentication'][Math.floor(Math.random() * 5)],
                            framework: randomFramework,
                            status: Math.random() > 0.3 ? 'Implemented' : 'Not Implemented',
                          };
                        }).map((control, index) => (
                          <TableRow key={index}>
                            <TableCell>{control.id}</TableCell>
                            <TableCell>{control.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={control.framework.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                                size="small" 
                                color={getFrameworkColor(control.framework)}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={control.status} 
                                size="small"
                                color={control.status === 'Implemented' ? 'success' : 'error'}
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<DownloadIcon />}
                variant="outlined"
                onClick={handleDownloadReport}
                disabled={!selectedSession}
              >
                Download Report
              </Button>
              <Button 
                startIcon={<CompareArrowsIcon />}
                variant="outlined"
                color="secondary"
                onClick={() => handleRevalidateFramework(selectedSession?.id)}
                disabled={!selectedSession || selectedSession.isRevalidating}
              >
                {selectedSession?.isRevalidating ? 'Revalidating...' : 'Revalidate Framework'}
              </Button>
              <Button 
                onClick={handleCloseDetails}
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Add Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SessionHistory; 