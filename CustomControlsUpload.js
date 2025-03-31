import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const CustomControlsUpload = ({ onUploadComplete }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [frameworkName, setFrameworkName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    try {
      // Preview the file contents
      const text = await selectedFile.text();
      let controls = [];

      if (selectedFile.type === 'application/json') {
        controls = JSON.parse(text);
      } else if (selectedFile.type === 'text/csv') {
        controls = parseCSV(text);
      } else {
        throw new Error('Unsupported file type. Please upload JSON or CSV.');
      }

      setFile(selectedFile);
      setPreview(controls.slice(0, 5)); // Show first 5 controls as preview
      setError('');
    } catch (err) {
      setError('Error reading file: ' + err.message);
      setFile(null);
      setPreview([]);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
        return obj;
      }, {});
    });
  };

  const handleUpload = async () => {
    if (!file || !frameworkName) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('frameworkName', frameworkName);

    try {
      const response = await fetch('/api/security-controls/custom', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onUploadComplete(result);
      setOpen(false);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={() => setOpen(true)}
      >
        Upload Custom Controls
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Custom Security Controls</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Upload your custom security controls in JSON or CSV format.
              Each control should include: id, name, description, and requirements.
            </Typography>
            <TextField
              fullWidth
              label="Framework Name"
              value={frameworkName}
              onChange={(e) => setFrameworkName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              component="label"
              sx={{ mr: 2 }}
            >
              Select File
              <input
                type="file"
                hidden
                accept=".json,.csv"
                onChange={handleFileSelect}
              />
            </Button>
            {file && (
              <Typography variant="body2" color="text.secondary">
                Selected: {file.name}
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {preview.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preview (first 5 controls):
              </Typography>
              <List dense>
                {preview.map((control, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${control.id} - ${control.name}`}
                      secondary={control.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {uploading && <LinearProgress sx={{ mb: 2 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !frameworkName || uploading}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomControlsUpload; 