import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Grid,
} from '@mui/material';

const JiraStories = ({ onSelectStory }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stories');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stories');
      }

      setStories(data.stories || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStory = (story) => {
    if (onSelectStory) {
      onSelectStory(story);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (stories.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No stories found. Please check your Jira configuration.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Jira Stories</Typography>
        <Button variant="outlined" size="small" onClick={fetchStories}>
          Refresh
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {stories.map((story, index) => (
          <React.Fragment key={story.key}>
            <ListItem 
              button 
              onClick={() => handleSelectStory(story)}
              sx={{ 
                '&:hover': { 
                  bgcolor: 'action.hover',
                  cursor: 'pointer'
                } 
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" component="div">
                    {story.key}: {story.summary}
                  </Typography>
                }
                secondary={
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status: {story.status}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Priority: {story.priority}
                      </Typography>
                    </Grid>
                  </Grid>
                }
              />
            </ListItem>
            {index < stories.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default JiraStories; 