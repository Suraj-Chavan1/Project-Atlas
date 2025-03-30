import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  List,
  ListItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const JiraStories = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatedStories, setGeneratedStories] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!files.length) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/jirastories/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setGeneratedStories(response.data.stories);
        setSuccess(true);
        setError(null);
      } else {
        setError('Failed to generate stories');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing document');
    } finally {
      setLoading(false);
    }
  };

  const handlePushToJira = async (story) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/jirastories/push-to-jira', {
        story: story
      });

      if (response.data.success) {
        setSuccess(true);
        // Update the story status in the list
        setGeneratedStories(prevStories =>
          prevStories.map(s =>
            s.title === story.title ? { ...s, pushedToJira: true } : s
          )
        );
      } else {
        setError('Failed to push story to Jira');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error pushing to Jira');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (story) => {
    setSelectedStory(story);
    setOpenPreview(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Generate Jira Stories
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <input
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.xls,.xlsx"
          style={{ display: 'none' }}
          id="raised-button-file"
          multiple
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            Upload Document
          </Button>
        </label>

        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Selected files:</Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <Typography variant="body2">{file.name}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !files.length}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Generate Stories
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Stories generated successfully!
        </Alert>
      )}

      {generatedStories.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Stories
          </Typography>
          <List>
            {generatedStories.map((story, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">{story.title}</Typography>
                  <Chip
                    label={story.priority}
                    color={
                      story.priority === 'Must Have' ? 'error' :
                      story.priority === 'Should Have' ? 'warning' :
                      story.priority === 'Could Have' ? 'info' : 'default'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  As a {story.user_role}, I want to {story.goal} so that {story.benefit}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handlePreview(story)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handlePushToJira(story)}
                    disabled={story.pushedToJira || loading}
                  >
                    {story.pushedToJira ? 'Pushed to Jira' : 'Push to Jira'}
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Story Details</DialogTitle>
        <DialogContent>
          {selectedStory && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">{selectedStory.title}</Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Priority: {selectedStory.priority}
              </Typography>
              <Typography variant="body1" paragraph>
                As a {selectedStory.user_role}, I want to {selectedStory.goal} so that {selectedStory.benefit}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Acceptance Criteria:
              </Typography>
              <Typography variant="body1">
                {selectedStory.acceptance_criteria}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JiraStories; 