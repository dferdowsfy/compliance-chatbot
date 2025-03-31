import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Button,
  Fade,
  Zoom,
  Card,
  CardHeader,
  CardContent,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const ControlsPanel = ({ controls, onControlClick }) => {
  const [width, setWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedFrameworks, setExpandedFrameworks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [recentlyUpdated, setRecentlyUpdated] = useState(new Set());

  // Track control status changes for animations
  useEffect(() => {
    const updatedControls = controls.reduce((acc, control) => {
      if (control.status === 'satisfied') {
        acc.add(control.id);
      }
      return acc;
    }, new Set());

    setRecentlyUpdated(updatedControls);
    const timer = setTimeout(() => {
      setRecentlyUpdated(new Set());
    }, 2000); // Reset animation after 2 seconds

    return () => clearTimeout(timer);
  }, [controls]);

  // Group controls by framework
  const groupedControls = controls.reduce((acc, control) => {
    const framework = control.framework || 'default';
    if (!acc[framework]) acc[framework] = [];
    acc[framework].push(control);
    return acc;
  }, {});

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    // Calculate new width based on window width minus mouse position from right
    const newWidth = Math.max(200, Math.min(800, window.innerWidth - e.clientX));
    setWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };
  }, [handleMouseMove, handleMouseUp]);

  const toggleFramework = (framework) => {
    setExpandedFrameworks(prev => ({
      ...prev,
      [framework]: !prev[framework]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'satisfied':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filterControls = (controls) => {
    return controls.filter(control => {
      const matchesSearch = (
        control.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesStatus = statusFilter === 'all' || control.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const handleExport = () => {
    const exportData = {
      date: new Date().toISOString(),
      summary: {
        total: controls.length,
        satisfied: controls.filter(c => c.status === 'satisfied').length,
        pending: controls.filter(c => c.status === 'pending').length,
      },
      controls: controls.map(control => ({
        id: control.id,
        name: control.name,
        framework: control.framework,
        status: control.status,
        description: control.description,
        requirements: control.requirements,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-controls-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: `${width}px`,
        height: '100%',
        backgroundColor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        transition: isResizing ? 'none' : 'width 0.2s ease',
        flexShrink: 0,
      }}
    >
      {/* Resize Handle */}
      <Box
        sx={{
          position: 'absolute',
          left: -8,
          top: 0,
          bottom: 0,
          width: 16,
          cursor: 'col-resize',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            '& .resize-handle-line': {
              backgroundColor: 'primary.main',
            },
          },
        }}
        onMouseDown={handleMouseDown}
      >
        <Box
          className="resize-handle-line"
          sx={{
            width: 4,
            height: '100%',
            backgroundColor: 'divider',
            transition: 'background-color 0.2s',
          }}
        />
      </Box>

      {/* Panel Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Security Controls</Typography>
      </Box>

      {/* Controls List */}
      <Box sx={{ 
        overflow: 'auto',
        flex: 1,
        p: 2
      }}>
        <List>
          {Object.entries(groupedControls).map(([framework, frameworkControls]) => (
            <React.Fragment key={framework}>
              <ListItem 
                button 
                onClick={() => toggleFramework(framework)}
                sx={{ 
                  backgroundColor: 'background.default',
                  mb: 1,
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {framework.toUpperCase()} ({frameworkControls.length})
                </Typography>
                <IconButton size="small" edge="end">
                  {expandedFrameworks[framework] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </ListItem>
              <Collapse in={expandedFrameworks[framework]} timeout="auto" unmountOnExit>
                <List dense disablePadding>
                  {frameworkControls.map((control) => (
                    <Fade key={control.id} in={true}>
                      <Card 
                        sx={{ 
                          mb: 1, 
                          borderLeft: control.status === 'satisfied' 
                            ? '4px solid green' 
                            : (control.mentioned ? '4px solid orange' : undefined),
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                        onClick={() => onControlClick?.(control)}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {control.id}
                            {control.status === 'satisfied' && (
                              <CheckCircleIcon 
                                color="success" 
                                fontSize="small" 
                                sx={{ ml: 1, verticalAlign: 'middle' }} 
                              />
                            )}
                            {control.mentioned && control.status !== 'satisfied' && (
                              <RadioButtonUncheckedIcon 
                                color="warning" 
                                fontSize="small" 
                                sx={{ ml: 1, verticalAlign: 'middle' }} 
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {control.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ControlsPanel; 