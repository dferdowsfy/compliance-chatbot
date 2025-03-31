import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Popper,
  Fade as MuiFade,
  Card,
  CardContent,
  ButtonGroup,
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CodeIcon from '@mui/icons-material/Code';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ControlsPanel from '../components/ControlsPanel';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import InfoIcon from '@mui/icons-material/Info';
import fedrampControls from '../data/fedramp-controls.json';

// API configuration
const API_URL = 'http://localhost:5001';

// Predefined answers for different contexts
const PREDEFINED_ANSWERS = {
  cloudProvider: ['AWS', 'Azure', 'GCP'],
  applicationWorkload: {
    backend: {
      AWS: [
        'ECS Container Service',
        'Lambda Serverless',
        'EKS Kubernetes',
        'EC2 Virtual Machines',
        'Elastic Beanstalk'
      ],
      Azure: [
        'Azure Container Apps',
        'Azure Functions',
        'AKS Kubernetes',
        'App Service',
        'Virtual Machine Scale Sets'
      ],
      GCP: [
        'Cloud Run',
        'Cloud Functions',
        'GKE Kubernetes',
        'Compute Engine',
        'App Engine'
      ]
    },
    frontend: {
      AWS: [
        'S3 Static Website',
        'CloudFront + S3',
        'Amplify Hosting',
        'EC2 Web Server',
        'ECS Frontend'
      ],
      Azure: [
        'Static Web Apps',
        'CDN + Storage',
        'App Service',
        'Container Apps',
        'Front Door + Storage'
      ],
      GCP: [
        'Cloud Storage Website',
        'Cloud CDN + Storage',
        'Firebase Hosting',
        'Cloud Run Frontend',
        'App Engine Frontend'
      ]
    },
    database: {
      AWS: [
        'RDS Aurora',
        'DynamoDB',
        'ElastiCache',
        'Redshift',
        'DocumentDB'
      ],
      Azure: [
        'Azure SQL',
        'Cosmos DB',
        'Cache for Redis',
        'Synapse Analytics',
        'Database for MongoDB'
      ],
      GCP: [
        'Cloud SQL',
        'Cloud Spanner',
        'Cloud Memorystore',
        'BigQuery',
        'Cloud Bigtable'
      ]
    }
  },
  infrastructure: {
    AWS: {
      compute: [
        'EC2 Auto Scaling',
        'ECS Fargate',
        'Lambda Functions',
        'EKS Managed Nodes'
      ],
      storage: [
        'S3 with Encryption',
        'EBS Volumes',
        'EFS File System',
        'RDS Multi-AZ'
      ],
      network: [
        'VPC with Private Subnets',
        'Application Load Balancer',
        'API Gateway + Lambda',
        'CloudFront + WAF'
      ]
    },
    Azure: {
      compute: [
        'VM Scale Sets',
        'Container Instances',
        'Azure Functions',
        'AKS Managed Nodes'
      ],
      storage: [
        'Blob Storage Encrypted',
        'Managed Disks',
        'Azure Files',
        'Azure SQL HA'
      ],
      network: [
        'VNet with Private Subnets',
        'Application Gateway',
        'API Management',
        'Front Door + WAF'
      ]
    }
  },
  dataClassification: [
    'Sensitive Financial Records',
    'Personal Healthcare Data',
    'Public Reference Data',
    'Internal Business Data',
    'Customer Transaction Logs'
  ],
  securityControls: {
    AWS: {
      access: [
        'IAM Roles with Least Privilege',
        'Multi-Factor Authentication',
        'AWS Organizations SCP',
        'Resource-Based Policies'
      ],
      network: [
        'Security Groups + NACLs',
        'VPC Endpoints',
        'Transit Gateway',
        'Client VPN'
      ],
      encryption: [
        'KMS Managed Keys',
        'SSL/TLS Termination',
        'S3 Bucket Encryption',
        'RDS Encryption'
      ]
    },
    Azure: {
      access: [
        'Azure AD Roles',
        'Conditional Access',
        'Management Groups',
        'Azure RBAC'
      ],
      network: [
        'NSGs + ASGs',
        'Private Endpoints',
        'Virtual WAN',
        'VPN Gateway'
      ],
      encryption: [
        'Key Vault',
        'TLS Termination',
        'Storage Encryption',
        'SQL TDE'
      ]
    }
  },
  availability: {
    AWS: [
      'Multi-AZ Deployment',
      'Cross-Region Backup',
      'Auto-Scaling Groups',
      'Route 53 Failover'
    ],
    Azure: [
      'Availability Zones',
      'Geo-Redundant Storage',
      'Scale Sets',
      'Traffic Manager'
    ]
  }
};

const ChatInterface = () => {
  console.log('ChatInterface component rendering');
  
  // Simple error handling state
  const [hasRenderError, setHasRenderError] = useState(false);
  
  // Try-catch block to catch and report rendering errors
  try {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    
    // Core states
    const [messages, setMessages] = useState([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Welcome! I\'ll help you configure secure cloud infrastructure. What cloud provider would you like to use?',
        timestamp: new Date().toISOString(),
        options: ['AWS', 'Azure', 'GCP']
      }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [controls, setControls] = useState([]);
    const [terraformCode, setTerraformCode] = useState(null);
    const [showTerraform, setShowTerraform] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedCode, setEditedCode] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [autoFormat, setAutoFormat] = useState(true);
    const [controlAnnotations, setControlAnnotations] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openPopper, setOpenPopper] = useState(false);
    const [selectedControl, setSelectedControl] = useState(null);
    const [selectedCloudProvider, setSelectedCloudProvider] = useState(null);

    // Log initial state
    console.log('Initial messages:', messages);

    // Fetch controls on mount
    useEffect(() => {
      const loadControls = async () => {
        try {
          const frameworks = JSON.parse(localStorage.getItem('currentSessionFrameworks') || '[]');
          
          // Load the FedRAMP controls from the imported file
          if (frameworks.includes('fedramp-moderate') || frameworks.length === 0) {
            console.log('Loading FedRAMP controls from local file');
            setControls(fedrampControls);
          } else {
            // If there are other frameworks, still try to load from API
            const response = await axios.get(`${API_URL}/api/security-controls`, {
              params: { frameworks }
            });
            setControls(response.data);
          }
        } catch (error) {
          console.error('Error loading controls:', error);
          // Fallback to local controls if API fails
          setControls(fedrampControls);
        }
      };

      loadControls();
    }, []);

    // Update control status based on bot response
    const updateControlStatus = (response) => {
      if (!response || !response.satisfiedControls) return;
      
      setControls(prevControls => {
        return prevControls.map(control => {
          if (response.satisfiedControls.includes(control.id)) {
            return { ...control, status: 'satisfied' };
          }
          return control;
        });
      });
    };

    const handleTerraformClick = () => {
      setShowTerraform(true);
    };

    const handleCopyCode = () => {
      navigator.clipboard.writeText(editMode ? editedCode : terraformCode);
      setSnackbarMessage('Code copied to clipboard');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    };

    const handleEditToggle = () => {
      if (!editMode) {
        setEditedCode(terraformCode);
      }
      setEditMode(!editMode);
    };

    const validateTerraform = (code) => {
      // Basic validation - check for matching braces and required blocks
      const braces = code.match(/{|}/g) || [];
      if (braces.filter(b => b === '{').length !== braces.filter(b => b === '}').length) {
        return 'Invalid Terraform: Unmatched braces';
      }
      
      const requiredBlocks = ['resource', 'provider'];
      const hasRequiredBlocks = requiredBlocks.some(block => code.includes(block));
      if (!hasRequiredBlocks) {
        return 'Invalid Terraform: Missing required blocks (resource or provider)';
      }

      return null;
    };

    const handleSaveEdit = () => {
      const validationError = validateTerraform(editedCode);
      if (validationError) {
        setSnackbarMessage(validationError);
        setSnackbarSeverity('error');
        setShowSnackbar(true);
        return;
      }

      setTerraformCode(editedCode);
      setEditMode(false);
      setSnackbarMessage('Changes saved successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    };

    const handleDownloadTerraform = () => {
      const codeToDownload = editMode ? editedCode : terraformCode;
      const validationError = validateTerraform(codeToDownload);
      if (validationError) {
        setSnackbarMessage(validationError);
        setSnackbarSeverity('error');
        setShowSnackbar(true);
        return;
      }

      const blob = new Blob([codeToDownload], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'main.tf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSnackbarMessage('Terraform file downloaded');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    };

    const handleOptionClick = (option) => {
      if (option === 'Custom Input') {
        // Focus the input field for custom input
        const inputField = document.querySelector('input[type="text"]');
        if (inputField) {
          inputField.focus();
        }
        return;
      }
      
      // Set cloud provider if it's one of the cloud options
      if (['AWS', 'AZURE', 'GCP'].includes(option)) {
        setSelectedCloudProvider(option);
      }
      
      // If it's a regular option, send it as a message
      handleSendMessage(option);
    };

    const handleSendMessage = async (text) => {
      if (!text.trim()) return;
      
      // Add user message
      const userMessage = {
        id: Date.now(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);
      
      try {
        // Create request object
        const requestData = {
          message: text,
          conversationHistory: messages.map(msg => ({
            role: msg.sender,
            content: msg.text
          })),
          sessionId: localStorage.getItem('currentSessionId'),
          frameworks: JSON.parse(localStorage.getItem('currentSessionFrameworks') || '[]'),
          cloudProvider: selectedCloudProvider,
          outputControl: {
            format: 'structured',
            maxLength: 300,
            style: 'concise',
            includeControls: true,
            responseComponents: {
              explanation: true,
              action: true,
              nextSteps: true,
              satisfiedControls: true,
              terraform: true
            }
          }
        };
        
        // Make API call
        const response = await axios.post(`${API_URL}/api/chat`, requestData);
        
        // Check for Terraform code
        if (response.data.terraform) {
          setTerraformCode(response.data.terraform);
        }
        
        // Bot message with options if available
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.message || response.data,
          sender: 'bot',
          timestamp: new Date(),
          options: []
        };

        // Extract options based on message context and previous conversation
        const messageText = response.data.message || response.data;
        const lastUserMessage = messages[messages.length - 1]?.text?.toLowerCase() || '';
        
        if (typeof messageText === 'string') {
          // Initial cloud provider selection
          if (messages.length <= 2) {
            botMessage.options = PREDEFINED_ANSWERS.cloudProvider;
          }
          // Handle responses based on the last user message and current context
          else {
            const provider = selectedCloudProvider?.toUpperCase() || 'AWS';
            
            if (lastUserMessage.includes('backend') || messageText.toLowerCase().includes('backend') || 
                messageText.toLowerCase().includes('service') || messageText.toLowerCase().includes('application')) {
              botMessage.options = PREDEFINED_ANSWERS.applicationWorkload.backend[provider];
            }
            else if (lastUserMessage.includes('frontend') || messageText.toLowerCase().includes('frontend') ||
                     messageText.toLowerCase().includes('website')) {
              botMessage.options = PREDEFINED_ANSWERS.applicationWorkload.frontend[provider];
            }
            else if (lastUserMessage.includes('database') || messageText.toLowerCase().includes('database') ||
                     messageText.toLowerCase().includes('data store')) {
              botMessage.options = PREDEFINED_ANSWERS.applicationWorkload.database[provider];
            }
            // Infrastructure components based on context
            else if (messageText.toLowerCase().includes('compute') || messageText.toLowerCase().includes('processing')) {
              botMessage.options = PREDEFINED_ANSWERS.infrastructure[provider].compute;
            }
            else if (messageText.toLowerCase().includes('storage') || messageText.toLowerCase().includes('data')) {
              botMessage.options = PREDEFINED_ANSWERS.infrastructure[provider].storage;
            }
            else if (messageText.toLowerCase().includes('network') || messageText.toLowerCase().includes('connectivity')) {
              botMessage.options = PREDEFINED_ANSWERS.infrastructure[provider].network;
            }
            // Security and compliance related options
            else if (messageText.toLowerCase().includes('security') || messageText.toLowerCase().includes('compliance')) {
              const securityContext = messageText.toLowerCase();
              if (securityContext.includes('access') || securityContext.includes('authentication')) {
                botMessage.options = PREDEFINED_ANSWERS.securityControls[provider].access;
              } else if (securityContext.includes('network')) {
                botMessage.options = PREDEFINED_ANSWERS.securityControls[provider].network;
              } else if (securityContext.includes('encrypt')) {
                botMessage.options = PREDEFINED_ANSWERS.securityControls[provider].encryption;
              }
            }
            // Data classification options
            else if (messageText.toLowerCase().includes('data type') || messageText.toLowerCase().includes('information')) {
              botMessage.options = PREDEFINED_ANSWERS.dataClassification;
            }
            // Availability and reliability options
            else if (messageText.toLowerCase().includes('availability') || messageText.toLowerCase().includes('reliability')) {
              botMessage.options = PREDEFINED_ANSWERS.availability[provider];
            }

            // If no specific options were set, try to extract from the message content
            if (botMessage.options?.length === 0) {
              const questionMatch = messageText.match(/(?:what|which|how|where|when|specify|choose|select)(?:[^.!?]+\?)/gi);
              if (questionMatch) {
                const question = questionMatch[0].toLowerCase();
                // Map question context to appropriate answer options
                if (question.includes('application') || question.includes('workload')) {
                  botMessage.options = PREDEFINED_ANSWERS.applicationWorkload.backend[provider];
                } else if (question.includes('storage') || question.includes('data')) {
                  botMessage.options = PREDEFINED_ANSWERS.infrastructure[provider].storage;
                } else if (question.includes('security')) {
                  botMessage.options = PREDEFINED_ANSWERS.securityControls[provider].access;
                }
              }
            }
          }

          // Deduplicate options and ensure they exist
          botMessage.options = [...new Set(botMessage.options || [])];
        }
        
        // Update messages and controls
        setMessages((prev) => [...prev, botMessage]);
        
        if (response.data.satisfiedControls) {
          updateControlStatus(response.data);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: `Error: ${error.response?.data?.error || error.message || 'Something went wrong. Please try again later.'}`,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (terraformCode) {
        // Parse terraform code and find control satisfaction points
        // This is a simple example - you might want to use a proper HCL parser
        const annotations = controls
          .filter(control => control.status === 'satisfied')
          .map(control => {
            const lineNumber = terraformCode.split('\n').findIndex(line => 
              line.toLowerCase().includes(control.id.toLowerCase()) ||
              (control.requirements && line.toLowerCase().includes(control.requirements.toLowerCase()))
            );
            return lineNumber >= 0 ? { control, lineNumber } : null;
          })
          .filter(Boolean);
        setControlAnnotations(annotations);
      }
    }, [terraformCode, controls]);

    const handleControlClick = (event, control) => {
      setSelectedControl(control);
      setAnchorEl(event.currentTarget);
      setOpenPopper(true);
    };

    // Auto-scroll to the newest message
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages, isLoading]);

    // Render a simple UI for testing if there's a problem
    if (hasRenderError) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" color="error">Error rendering chat interface</Typography>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
            Reload Page
          </Button>
        </Box>
      );
    }
    
    // Main component render
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Compliance-Driven Infrastructure Advisor
            </Typography>
            <Tabs value="chat" sx={{ '& .MuiTab-root': { color: 'white' } }}>
              <Tab label="CHAT" value="chat" />
              <Tab 
                label="TERRAFORM" 
                value="terraform"
                disabled={!terraformCode}
                onClick={handleTerraformClick}
                sx={{ 
                  opacity: terraformCode ? 1 : 0.5,
                  cursor: terraformCode ? 'pointer' : 'not-allowed',
                  transition: 'opacity 0.3s ease'
                }}
              />
            </Tabs>
          </Toolbar>
        </AppBar>

        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          overflow: 'hidden',
          height: 'calc(100vh - 64px)', // Subtract AppBar height
        }}>
          <Box sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0, // Important for flex shrinking
          }}>
            <Box sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              p: 2, 
              backgroundColor: '#f5f5f8',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                    width: '100%',
                    opacity: 1,
                    transform: 'translateY(0)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      minWidth: '200px',
                      backgroundColor: message.sender === 'user' ? '#1976d2' : '#ffffff',
                      color: message.sender === 'user' ? '#ffffff' : 'inherit',
                      borderRadius: 2,
                      borderTopLeftRadius: message.sender === 'bot' ? 0 : 2,
                      borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto', // Allow horizontal scroll for code blocks
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      component="div"
                      sx={{ 
                        '& p': { margin: 0 },
                        '& ul, & ol': { marginTop: 1, marginBottom: 1, paddingLeft: 2 }
                      }}
                    >
                      {message.text}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                  
                  {message.options && message.options.length > 0 && (
                    <Box 
                      sx={{ 
                        mt: 1, 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1, 
                        justifyContent: message.sender === 'bot' ? 'flex-start' : 'flex-end',
                        maxWidth: '90%'
                      }}
                    >
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          onClick={() => handleOptionClick(option)}
                          sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                              borderColor: '#1565c0'
                            }
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                      <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={() => handleOptionClick('Custom Input')}
                        sx={{
                          borderStyle: 'dashed'
                        }}
                      >
                        Custom Input
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      borderTopLeftRadius: 0,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      <Typography variant="body2">Thinking...</Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
            
            <Box
              component="form"
              sx={{
                p: 2,
                backgroundColor: '#f0f0f5',
                borderTop: '1px solid #ddd',
                boxShadow: '0px -2px 6px rgba(0,0,0,0.05)',
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
            >
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputMessage)}
                  disabled={isLoading}
                  variant="outlined"
                  placeholder="Type your message..."
                  size="small"
                  sx={{
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    }
                  }}
                />
                <Button
                  type="submit"
                  color="primary"
                  endIcon={<SendIcon />}
                  disabled={isLoading || !inputMessage.trim()}
                  sx={{ 
                    minWidth: '100px',
                    fontWeight: 'bold'
                  }}
                >
                  Send
                </Button>
              </Stack>
            </Box>
          </Box>

          <ControlsPanel controls={controls} />
        </Box>

        <Dialog
          open={showTerraform}
          onClose={() => {
            setShowTerraform(false);
            setEditMode(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Terraform Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={autoFormat}
                      onChange={(e) => setAutoFormat(e.target.checked)}
                    />
                  }
                  label="Auto-format"
                />
                <Tooltip title="Copy code">
                  <IconButton onClick={handleCopyCode} size="small">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={editMode ? "Save changes" : "Edit code"}>
                  <IconButton 
                    onClick={editMode ? handleSaveEdit : handleEditToggle} 
                    size="small"
                  >
                    {editMode ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as main.tf">
                  <IconButton onClick={handleDownloadTerraform} size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {!editMode && (
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ position: 'relative' }}>
                  <SyntaxHighlighter
                    language="hcl"
                    style={tomorrow}
                    customStyle={{
                      margin: 0,
                      borderRadius: 4,
                    }}
                    wrapLines={true}
                    showLineNumbers={true}
                    lineProps={lineNumber => {
                      const annotation = controlAnnotations.find(a => a.lineNumber === lineNumber);
                      return {
                        style: {
                          display: 'block',
                          position: 'relative',
                          backgroundColor: annotation ? 'rgba(25, 118, 210, 0.05)' : undefined,
                        }
                      };
                    }}
                  >
                    {terraformCode || '# No Terraform code generated yet'}
                  </SyntaxHighlighter>
                  
                  {controlAnnotations.map(({ control, lineNumber }) => (
                    <Tooltip
                      key={control.id}
                      title="Click for details"
                      placement="left"
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleControlClick(e, control)}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: `${(lineNumber + 1) * 21}px`, // Adjust based on line height
                          padding: 0.5,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }}
                      >
                        <InfoIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>

                <Popper
                  open={openPopper}
                  anchorEl={anchorEl}
                  placement="left"
                  transition
                  sx={{ zIndex: 1300 }}
                >
                  {({ TransitionProps }) => (
                    <MuiFade {...TransitionProps} timeout={200}>
                      <Card sx={{ maxWidth: 300, boxShadow: 3 }}>
                        <CardContent>
                          {selectedControl && (
                            <>
                              <Typography variant="subtitle2" gutterBottom>
                                {selectedControl.id}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedControl.name}
                              </Typography>
                              {selectedControl.description && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {selectedControl.description}
                                </Typography>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </MuiFade>
                  )}
                </Popper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowTerraform(false);
              setEditMode(false);
            }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSnackbar(false)} 
            severity={snackbarSeverity}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  } catch (error) {
    console.error('Error rendering ChatInterface:', error);
    setHasRenderError(true);
    
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">Error rendering chat interface</Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          {error?.message || 'Unknown error occurred'}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Reload Page
        </Button>
      </Box>
    );
  }
};

export default ChatInterface; 