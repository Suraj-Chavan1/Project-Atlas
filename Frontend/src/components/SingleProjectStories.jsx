import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Grid,
    CircularProgress,
    Alert,
    Paper,
    LinearProgress
} from '@mui/material';

const SingleProjectStories = () => {
    const { projectId } = useParams();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchStories();
    }, [projectId]);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/stories/${projectId}`);
            console.log('Received stories data:', response.data.stories); // Debug log
            setStories(response.data.stories);
            setError(null);
        } catch (err) {
            setError('Failed to fetch stories');
            console.error('Error fetching stories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (storyId, newStatus) => {
        try {
            setLoading(true);
            if (newStatus === 'Complete') {
                await axios.post(`/api/stories/${storyId}/complete`);
            } else {
                await axios.put(`/api/stories/${storyId}/status`, { status: newStatus });
            }
            setSuccessMessage('Story status updated successfully');
            fetchStories(); // Refresh the stories list
        } catch (err) {
            setError('Failed to update story status');
            console.error('Error updating story status:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        console.log('Getting color for status:', status); // Debug log
        switch (status) {
            case 'Backlog':
            case 'To Do':
                return 'default';
            case 'In Progress':
                return 'primary';
            case 'Complete':
                return 'success';
            default:
                console.warn('Unknown status:', status); // Debug log
                return 'default';
        }
    };

    const getStatusDisplay = (status) => {
        console.log('Getting display for status:', status); // Debug log
        switch (status) {
            case 'To Do':
                return 'Backlog';
            default:
                return status;
        }
    };

    // Calculate story statistics
    const getStoryStats = () => {
        console.log('Calculating stats for stories:', stories); // Debug log
        const total = stories.length;
        const backlog = stories.filter(story => story.status === 'Backlog' || story.status === 'To Do').length;
        const inProgress = stories.filter(story => story.status === 'In Progress').length;
        const complete = stories.filter(story => story.status === 'Complete').length;

        console.log('Story counts:', { total, backlog, inProgress, complete }); // Debug log

        return {
            total,
            backlog,
            inProgress,
            complete,
            backlogPercentage: total > 0 ? (backlog / total) * 100 : 0,
            inProgressPercentage: total > 0 ? (inProgress / total) * 100 : 0,
            completePercentage: total > 0 ? (complete / total) * 100 : 0
        };
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    const stats = getStoryStats();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Project Stories
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            {/* Status Overview Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Story Status Overview
                </Typography>
                
                {/* Progress Bar */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">
                            {stats.completePercentage.toFixed(1)}% Complete
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={stats.completePercentage} 
                        color="success"
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                </Box>

                {/* Status Cards */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" component="div" color="text.secondary">
                                    {stats.backlog}
                                </Typography>
                                <Typography color="text.secondary">
                                    Backlog ({stats.backlogPercentage.toFixed(1)}%)
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" component="div" color="primary">
                                    {stats.inProgress}
                                </Typography>
                                <Typography color="text.secondary">
                                    In Progress ({stats.inProgressPercentage.toFixed(1)}%)
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" component="div" color="success.main">
                                    {stats.complete}
                                </Typography>
                                <Typography color="text.secondary">
                                    Complete ({stats.completePercentage.toFixed(1)}%)
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {/* Stories Grid */}
            <Grid container spacing={3}>
                {stories.map((story) => {
                    console.log('Rendering story:', story); // Debug log
                    return (
                        <Grid item xs={12} md={6} lg={4} key={story.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {story.title} ss
                                        {story.status}
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Chip
                                            label={getStatusDisplay(story.status)}
                                            color={getStatusColor(story.status)}
                                            sx={{ mb: 1 }}  
                                        />
                                        {story.jira_issue_id && (
                                            <Chip
                                                label={`Jira: ${story.jira_issue_id}`}
                                                color="info"
                                                variant="outlined"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>User Role:</strong> {story.user_role}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>Goal:</strong> {story.goal}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>Benefit:</strong> {story.benefit}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>Priority:</strong> {story.priority}
                                    </Typography>

                                    <Box sx={{ mt: 2 }}>
                                        {(story.status === 'Backlog' || story.status === 'To Do') && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleStatusUpdate(story.id, 'In Progress')}
                                                sx={{ mr: 1 }}
                                            >
                                                Start Progress
                                            </Button>
                                        )}
                                        
                                        {story.status === 'In Progress' && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleStatusUpdate(story.id, 'Complete')}
                                            >
                                                Mark Complete
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default SingleProjectStories; 