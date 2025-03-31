import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import {
  Code as CodeIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';

// Configure axios defaults
const api = axios.create({
  baseURL: 'http://localhost:5000',  // Update this to match your Flask server
  headers: {
    'Content-Type': 'application/json'
  }
});

const Jira2Code = () => {
  // State management
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [codePreview, setCodePreview] = useState({ open: false, content: null });
  const [generationStatus, setGenerationStatus] = useState('idle');
  const [downloadStatus, setDownloadStatus] = useState('idle');

  // Fetch Jira stories
  const fetchStories = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/jira2code/stories');
      console.log('Raw response:', response.data);
      
      const issues = response.data?.issues || [];
      console.log('Processed stories:', issues);
      
      setStories(issues);
      
      if (issues.length === 0) {
        setError('No Jira stories found. Please check your Jira project configuration.');
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Error details:', errorMessage);
      setError('Failed to fetch Jira stories: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStories();
  }, []); // Empty dependency array to run only on mount

  // Generate code for selected story
  const generateCode = async (story) => {
    setGenerationStatus('generating');
    setError(null);
    try {
      const response = await api.post('/api/jira2code/generate', {
        story_id: story.key
      });
      console.log('Generation response:', response.data);
      if (!response.data.folder) {
        throw new Error('No folder path received from server');
      }
      // Store just the folder name without any path prefixes
      const folderName = response.data.folder.split(/[/\\]/).pop();
      setGeneratedCode({
        ...response.data,
        folder: folderName
      });
      setGenerationStatus('success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Error generating code:', errorMessage);
      setError('Failed to generate code: ' + errorMessage);
      setGenerationStatus('error');
    }
  };

  // Download generated code
  const downloadCode = async () => {
    if (!generatedCode?.folder) {
      setError('No generated code folder specified');
      return;
    }

    setDownloadStatus('downloading');
    setError(null);
    
    try {
      console.log('Generated code data:', generatedCode);
      console.log('Attempting to download from folder:', generatedCode.folder);
      
      const response = await api.get(`/api/jira2code/download/${generatedCode.folder}`, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });
      
      // Check if we got a blob response
      if (response.data instanceof Blob) {
        // Check if the blob is empty
        if (response.data.size === 0) {
          throw new Error('Received empty file from server');
        }

        // Check if we got an error response in JSON format
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const reader = new FileReader();
          const textContent = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsText(response.data);
          });
          const jsonContent = JSON.parse(textContent);
          throw new Error(jsonContent.error || 'Unknown error occurred');
        }

        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${generatedCode.folder}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloadStatus('success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Download error:', err);
      let errorMessage;
      
      if (err.response?.data instanceof Blob) {
        try {
          const textContent = await err.response.data.text();
          try {
            const jsonContent = JSON.parse(textContent);
            errorMessage = jsonContent.error || 'Unknown error occurred';
          } catch (parseErr) {
            errorMessage = textContent;
          }
        } catch (blobErr) {
          errorMessage = err.response?.data?.error || err.message;
        }
      } else {
        errorMessage = err.response?.data?.error || err.message;
      }
      
      console.error('Error details:', errorMessage);
      setError(`Failed to download code: ${errorMessage}`);
      setDownloadStatus('error');
    }
  };

  // Preview code section
  const handlePreview = (section, content) => {
    setCodePreview({
      open: true,
      content: {
        title: section,
        code: content
      }
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="h1">
            <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Jira2Code Generator
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchStories}
            disabled={loading}
          >
            Refresh Stories
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stories List */}
      <Paper sx={{ mb: 3 }}>
        <List>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : !Array.isArray(stories) || stories.length === 0 ? (
            <ListItem>
              <ListItemText primary="No stories found" />
            </ListItem>
          ) : (
            stories.map((story) => (
              <React.Fragment key={story.key || story.id}>
                <ListItem
                  button
                  selected={selectedStory?.key === story.key}
                  onClick={() => setSelectedStory(story)}
                >
                  <ListItemText
                    primary={story.fields?.summary || 'No Summary'}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={story.fields?.status?.name || 'No Status'}
                          color={story.fields?.status?.name === 'Done' ? 'success' : 'default'}
                        />
                        <Chip
                          size="small"
                          label={story.fields?.priority?.name || 'No Priority'}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => generateCode(story)}
                      disabled={generationStatus === 'generating'}
                      startIcon={<CodeIcon />}
                    >
                      Generate Code
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Generated Code Section */}
      {generatedCode && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Generated Code
          </Typography>
          
          {/* Frontend Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Frontend Files
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(generatedCode.frontend).map(([key, content]) => (
                  <ListItem key={key}>
                    <ListItemText primary={`index.${key === 'javascript' ? 'js' : key}`} />
                    <Tooltip title="Preview Code">
                      <IconButton
                        edge="end"
                        onClick={() => handlePreview(`Frontend: ${key}`, content)}
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Backend Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Backend Files
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(generatedCode.backend).map(([key, content]) => (
                  <ListItem key={key}>
                    <ListItemText primary={`${key}.py`} />
                    <Tooltip title="Preview Code">
                      <IconButton
                        edge="end"
                        onClick={() => handlePreview(`Backend: ${key}`, content)}
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={downloadStatus === 'downloading' ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={downloadCode}
              disabled={downloadStatus === 'downloading'}
            >
              {downloadStatus === 'downloading' ? 'Downloading...' : 'Download All Files'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Code Preview Dialog */}
      <Dialog
        open={codePreview.open}
        onClose={() => setCodePreview({ open: false, content: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{codePreview.content?.title}</DialogTitle>
        <DialogContent>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#f5f5f5',
              maxHeight: '70vh',
              overflow: 'auto'
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {codePreview.content?.code}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodePreview({ open: false, content: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Jira2Code; 