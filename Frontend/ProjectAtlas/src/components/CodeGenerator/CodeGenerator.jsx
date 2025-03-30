import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  IconButton,
  Snackbar
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';
import TabPanel from '../common/TabPanel';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeGenerator({ story }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (story) {
      generateCode();
    }
  }, [story]);

  const generateCode = async () => {
    if (!story) {
      setError('No story selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/jira/generate-code', {
        story: {
          fields: {
            summary: story.title,
            description: `As a user, I want to ${story.title.toLowerCase()} so that I can achieve the business goal.
            Type: ${story.type}
            Priority: ${story.priority}
            ID: ${story.id}`
          }
        }
      });

      if (response.data.success) {
        setGeneratedCode(response.data.code);
      } else {
        setError(response.data.error || 'Failed to generate code');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const getLanguageForTab = (tabIndex) => {
    switch (tabIndex) {
      case 0:
        return 'html';
      case 1:
        return 'css';
      case 2:
        return 'python';
      default:
        return 'text';
    }
  };

  if (!story) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No story selected. Please select a user story to generate code.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Code Generator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Selected Story
        </Typography>
        <Typography variant="body1">
          {story.title}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Type: {story.type}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            •
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Priority: {story.priority}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            •
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ID: {story.id}
          </Typography>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : generatedCode ? (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
              <Tab label="HTML" />
              <Tab label="CSS" />
              <Tab label="Python" />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            <Paper sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => handleCopyCode(generatedCode.html)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size="small"
              >
                <ContentCopyIcon />
              </IconButton>
              <SyntaxHighlighter
                language="html"
                style={materialLight}
                customStyle={{ margin: 0 }}
              >
                {generatedCode.html}
              </SyntaxHighlighter>
            </Paper>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Paper sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => handleCopyCode(generatedCode.css)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size="small"
              >
                <ContentCopyIcon />
              </IconButton>
              <SyntaxHighlighter
                language="css"
                style={materialLight}
                customStyle={{ margin: 0 }}
              >
                {generatedCode.css}
              </SyntaxHighlighter>
            </Paper>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Paper sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => handleCopyCode(generatedCode.python)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size="small"
              >
                <ContentCopyIcon />
              </IconButton>
              <SyntaxHighlighter
                language="python"
                style={materialLight}
                customStyle={{ margin: 0 }}
              >
                {generatedCode.python}
              </SyntaxHighlighter>
            </Paper>
          </TabPanel>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CodeIcon />}
            onClick={generateCode}
          >
            Generate Code
          </Button>
        </Box>
      )}

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Code copied to clipboard!"
      />
    </Box>
  );
}

export default CodeGenerator; 