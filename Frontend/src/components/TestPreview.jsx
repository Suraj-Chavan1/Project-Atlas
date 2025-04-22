import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Grid,
} from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JiraStories from './JiraStories';

const TestPreview = () => {
  const [storyKey, setStoryKey] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [framework, setFramework] = useState('jest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load saved test cases from localStorage on component mount
  useEffect(() => {
    const savedStoryKey = localStorage.getItem('testPreview_storyKey');
    const savedLanguage = localStorage.getItem('testPreview_language');
    const savedFramework = localStorage.getItem('testPreview_framework');
    const savedPreview = localStorage.getItem('testPreview_data');

    if (savedStoryKey) setStoryKey(savedStoryKey);
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedFramework) setFramework(savedFramework);
    if (savedPreview) {
      try {
        setPreview(JSON.parse(savedPreview));
      } catch (e) {
        console.error('Failed to parse saved preview data:', e);
      }
    }
  }, []);

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Save current form state to localStorage
      localStorage.setItem('testPreview_storyKey', storyKey);
      localStorage.setItem('testPreview_language', language);
      localStorage.setItem('testPreview_framework', framework);

      const response = await fetch('/api/preview-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyKey,
          language,
          framework,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate preview');
      }

      // Save preview data to localStorage
      localStorage.setItem('testPreview_data', JSON.stringify(data));
      setPreview(data);
      setSnackbar({
        open: true,
        message: 'Test cases generated successfully!',
        severity: 'success',
      });
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStory = (story) => {
    setStoryKey(story.key);
    setSnackbar({
      open: true,
      message: `Selected story: ${story.key}`,
      severity: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Case Preview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <JiraStories onSelectStory={handleSelectStory} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Jira Story Key"
                value={storyKey}
                onChange={(e) => setStoryKey(e.target.value)}
                placeholder="e.g., SCRUM-123"
                fullWidth
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Language"
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Framework</InputLabel>
                <Select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  label="Framework"
                >
                  <MenuItem value="jest">Jest</MenuItem>
                  <MenuItem value="mocha">Mocha</MenuItem>
                  <MenuItem value="pytest">Pytest</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handlePreview}
                disabled={loading || !storyKey}
              >
                {loading ? <CircularProgress size={24} /> : 'Preview'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {preview && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Story Details
                </Typography>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1">
                    {preview.story.summary}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preview.story.description}
                  </Typography>
                </Paper>

                <Typography variant="h6" gutterBottom>
                  Generated Test Cases
                </Typography>
                {preview.testFiles.map((file, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {file.name}
                    </Typography>
                    <SyntaxHighlighter
                      language={language}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0 }}
                    >
                      {file.content}
                    </SyntaxHighlighter>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestPreview; 