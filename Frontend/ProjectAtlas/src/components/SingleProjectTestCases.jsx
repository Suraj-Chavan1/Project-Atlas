import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import CoverageComponent from './CoverageComponent';
import {
    Box,
    Drawer,
    IconButton,
    TextField,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 400;

const CodeGenSidebar = ({ open, onClose }) => {
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('python');
    const [framework, setFramework] = useState('');
    const [context, setContext] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pushing, setPushing] = useState(false);
    const [githubConfig, setGithubConfig] = useState({
        owner: 'ANUJT65',
        repo: 'Jira_Testcases',
        path: ''
    });

    const handleGenerateCode = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('http://localhost:5000/testcode/generate-code', {
                input,
                language,
                framework,
                context
            });

            if (response.data.success) {
                setGeneratedCode(response.data.code);
                setSuccess('Code generated successfully');
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate code');
        } finally {
            setLoading(false);
        }
    };

    const handlePushToGitHub = async () => {
        if (!generatedCode) {
            setError('No code to push. Please generate code first.');
            return;
        }

        try {
            setPushing(true);
            setError('');
            const response = await axios.post('http://localhost:5000/testcode/push-code-to-github', {
                code: generatedCode,
                language,
                framework,
                path: githubConfig.path || `generated_code/${Date.now()}.${language}`
            });

            if (response.data.success) {
                setSuccess('Code pushed to GitHub successfully');
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to push code to GitHub');
        } finally {
            setPushing(false);
        }
    };

    return (
        <Drawer
            variant="persistent"
            anchor="right"
            open={open}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f5',
                },
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Typography variant="h6">Code Generator</Typography>
                <IconButton onClick={onClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </Box>

            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Enter your requirements"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={language}
                            label="Language"
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <MenuItem value="python">Python</MenuItem>
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="java">Java</MenuItem>
                            <MenuItem value="csharp">C#</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Framework (optional)"
                        value={framework}
                        onChange={(e) => setFramework(e.target.value)}
                    />
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Additional Context (optional)"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Button
                    variant="contained"
                    onClick={handleGenerateCode}
                    disabled={loading || !input}
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Generate Code'}
                </Button>

                {generatedCode && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Generated Code:
                        </Typography>
                        <Box
                            component="pre"
                            sx={{
                                p: 2,
                                bgcolor: '#1e1e1e',
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: '400px'
                            }}
                        >
                            <SyntaxHighlighter
                                language={language}
                                style={vscDarkPlus}
                            >
                                {generatedCode}
                            </SyntaxHighlighter>
                        </Box>

                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                GitHub Configuration:
                            </Typography>
                            <TextField
                                fullWidth
                                label="Repository Path (optional)"
                                value={githubConfig.path}
                                onChange={(e) => setGithubConfig(prev => ({ ...prev, path: e.target.value }))}
                                placeholder="e.g., src/generated/code.py"
                                sx={{ mb: 1 }}
                            />
                        </Box>

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handlePushToGitHub}
                            disabled={pushing}
                            fullWidth
                        >
                            {pushing ? <CircularProgress size={24} /> : 'Push to GitHub'}
                        </Button>
                    </Box>
                )}

                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError('')}
                >
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess('')}
                >
                    <Alert severity="success" onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                </Snackbar>
            </Box>
        </Drawer>
    );
};

const SingleProjectTestCases = () => {
    const { projectId } = useParams(); // Extract project ID from URL
    const location = useLocation();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);
    const [testCasesMap, setTestCasesMap] = useState({});
    const [loadingMap, setLoadingMap] = useState({});
    const [githubPushingMap, setGithubPushingMap] = useState({});
    const [pushedMap, setPushedMap] = useState({});
    const [previewMap, setPreviewMap] = useState({});
    const [showPreviewMap, setShowPreviewMap] = useState({});
    const [editingMap, setEditingMap] = useState({});
    const [editContentMap, setEditContentMap] = useState({});
    const [regenerationContextMap, setRegenerationContextMap] = useState({});
    const [showRegenerationInputMap, setShowRegenerationInputMap] = useState({});
    const [codeGenOpen, setCodeGenOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' // 'success' or 'error'
    });

    // Extract project ID from URL if not available in params
    const getProjectId = () => {
        if (projectId) return projectId;
        
        // Fallback: Extract from URL path
        const pathParts = location.pathname.split('/');
        const projectIndex = pathParts.indexOf('project');
        if (projectIndex !== -1 && projectIndex + 1 < pathParts.length) {
            return pathParts[projectIndex + 1];
        }
        
        console.error('Could not extract project ID from URL');
        return null;
    };

    useEffect(() => {
        const id = getProjectId();
        console.log("Project ID from URL:", id);
        fetchStories();
    }, [projectId, location]);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/testcode/stories');
            if (response.data.success) {
                setStories(response.data.stories);
            } else {
                console.error('Error fetching stories:', response.data.error);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTests = async (storyKey, e) => {
        if (e) e.stopPropagation();
        
        try {
            // Set loading state for this specific story
            setLoadingMap(prev => ({ ...prev, [storyKey]: true }));
            
            // First, generate test cases without zipping
            const response = await axios.post('http://localhost:5000/testcode/preview-tests', {
                story_key: storyKey,
                language: 'python',
                framework: 'pytest'
            });
            
            if (response.data.success) {
                // Log the response to understand its structure
                console.log('Preview response:', response.data);
                
                // Store the preview data
                setPreviewMap(prev => ({
                    ...prev,
                    [storyKey]: {
                        testFiles: response.data.test_files,
                        timestamp: response.data.timestamp
                    }
                }));
                
                // Show the preview
                setShowPreviewMap(prev => ({
                    ...prev,
                    [storyKey]: true
                }));
                
                alert('Test cases generated successfully. Review and click "Save & Upload" to finalize.');
            }
        } catch (error) {
            console.error('Error generating tests:', error);
            alert('Failed to generate test cases');
        } finally {
            // Clear loading state for this specific story
            setLoadingMap(prev => ({ ...prev, [storyKey]: false }));
        }
    };

    const handleSaveAndUpload = async (storyKey) => {
        try {
            setLoadingMap(prev => ({ ...prev, [storyKey]: true }));
            
            // Get the test files from the preview or edited content
            let testFiles = [];
            
            if (editingMap[storyKey]) {
                // If we're editing, use the edited content
                testFiles = Object.entries(editContentMap[storyKey]).map(([name, content]) => ({
                    name,
                    content
                }));
            } else if (previewMap[storyKey]) {
                // Otherwise use the preview content
                testFiles = previewMap[storyKey].testFiles;
            }
            
            const currentProjectId = getProjectId();
            console.log("Saving test cases with project ID:", currentProjectId);
            
            if (!currentProjectId) {
                alert('Error: Project ID not found. Please make sure you are on a valid project page.');
                return;
            }
            
            // Now zip and upload the test cases
            const response = await axios.post('http://localhost:5000/testcode/generate-tests', {
                story_key: storyKey,
                project_id: currentProjectId, // Use the project ID from URL
                test_files: testFiles
            });
            
            if (response.data.success) {
                // Log the response to understand its structure
                console.log('Save response:', response.data);
                
                // Update test cases map with the new test cases for this story
                const newTestCasesMap = {
                    ...testCasesMap,
                    [storyKey]: {
                        testFiles: testFiles.map(file => `${file.name}:\n${file.content}`),
                        blobUrl: response.data.blob_url,
                        testCaseId: response.data.test_case_id,
                        folder: response.data.folder,
                        timestamp: new Date().toISOString()
                    }
                };
                
                // Save to state
                setTestCasesMap(newTestCasesMap);
                
                // Hide the preview and editing
                setShowPreviewMap(prev => ({
                    ...prev,
                    [storyKey]: false
                }));
                setEditingMap(prev => ({
                    ...prev,
                    [storyKey]: false
                }));
                
                alert(`Test cases saved and uploaded successfully in ${response.data.folder}`);
            }
        } catch (error) {
            console.error('Error saving and uploading tests:', error);
            alert('Failed to save and upload test cases');
        } finally {
            setLoadingMap(prev => ({ ...prev, [storyKey]: false }));
        }
    };

    const handleCancelPreview = (storyKey) => {
        setShowPreviewMap(prev => ({
            ...prev,
            [storyKey]: false
        }));
    };

    const handleEditTest = (storyKey, fileIndex) => {
        // Set editing state for this story
        setEditingMap(prev => ({
            ...prev,
            [storyKey]: true
        }));
        
        // Initialize edit content with the current test files
        if (previewMap[storyKey] && previewMap[storyKey].testFiles) {
            const editContent = {};
            previewMap[storyKey].testFiles.forEach(file => {
                editContent[file.name] = file.content;
            });
            
            setEditContentMap(prev => ({
                ...prev,
                [storyKey]: editContent
            }));
        }
    };

    const handleEditContentChange = (storyKey, fileName, content) => {
        setEditContentMap(prev => ({
            ...prev,
            [storyKey]: {
                ...prev[storyKey],
                [fileName]: content
            }
        }));
    };

    const handleDeleteStory = async (storyKey) => {
        if (window.confirm(`Are you sure you want to delete the story ${storyKey}?`)) {
            try {
                setLoadingMap(prev => ({ ...prev, [storyKey]: true }));
                
                // Call the API to delete the story
                const response = await axios.delete(`http://localhost:5000/testcode/stories/${storyKey}`);
                
                if (response.data.success) {
                    // Remove the story from the state
                    setStories(prev => prev.filter(story => story.key !== storyKey));
                    
                    // Remove any test cases for this story
                    const newTestCasesMap = { ...testCasesMap };
                    delete newTestCasesMap[storyKey];
                    setTestCasesMap(newTestCasesMap);
                    
                    // Remove any preview for this story
                    const newPreviewMap = { ...previewMap };
                    delete newPreviewMap[storyKey];
                    setPreviewMap(newPreviewMap);
                    
                    // Hide any preview for this story
                    const newShowPreviewMap = { ...showPreviewMap };
                    delete newShowPreviewMap[storyKey];
                    setShowPreviewMap(newShowPreviewMap);
                    
                    alert(`Story ${storyKey} deleted successfully`);
                }
            } catch (error) {
                console.error('Error deleting story:', error);
                alert('Failed to delete story');
            } finally {
                setLoadingMap(prev => ({ ...prev, [storyKey]: false }));
            }
        }
    };

    const handleInstallClick = () => {
        const appName = "test-cases-for-atlas";
        const redirectUri = encodeURIComponent("http://localhost:5000/github/callback");
        const installUrl = `https://github.com/apps/test-cases-for-atlas/installations/new?redirect_uri=${redirectUri}`;
        window.location.href = installUrl;
    };

    const handleRegenerateTests = async (storyKey) => {
        console.log(`Starting test regeneration for story ${storyKey}`);
        try {
            setLoadingMap(prev => ({ ...prev, [storyKey]: true }));
            
            const currentProjectId = getProjectId();
            console.log('Current project ID:', currentProjectId);
            
            if (!currentProjectId) {
                console.error('Project ID not found');
                alert('Error: Project ID not found. Please make sure you are on a valid project page.');
                return;
            }

            // Get the current test files
            let testFiles = [];
            if (editingMap[storyKey]) {
                console.log('Getting test files from edit mode');
                testFiles = Object.entries(editContentMap[storyKey]).map(([name, content]) => ({
                    name,
                    content
                }));
            } else if (previewMap[storyKey]) {
                console.log('Getting test files from preview mode');
                testFiles = previewMap[storyKey].testFiles;
            }
            
            console.log('Current test files:', testFiles);
            console.log('Regeneration context:', regenerationContextMap[storyKey]);

            // Call the regenerate endpoint with the context
            console.log('Making API call to regenerate tests...');
            const response = await axios.post('http://localhost:5000/testcode/regenerate-tests', {
                story_key: storyKey,
                project_id: currentProjectId,
                test_files: testFiles,
                context: regenerationContextMap[storyKey] || '',
                language: 'python',
                framework: 'pytest'
            });

            console.log('Regeneration API response:', response.data);

            if (response.data.success) {
                console.log('Successfully regenerated tests');
                // Update the preview with the regenerated tests
                setPreviewMap(prev => ({
                    ...prev,
                    [storyKey]: {
                        testFiles: response.data.test_files,
                        timestamp: new Date().toISOString()
                    }
                }));

                // Hide the regeneration input
                setShowRegenerationInputMap(prev => ({
                    ...prev,
                    [storyKey]: false
                }));

                // Clear the context
                setRegenerationContextMap(prev => ({
                    ...prev,
                    [storyKey]: ''
                }));

                alert('Test cases regenerated successfully with your context. Review and click "Save & Upload" to finalize.');
            } else {
                console.error('Regeneration failed:', response.data.error);
            }
        } catch (error) {
            console.error('Error regenerating tests:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert('Failed to regenerate test cases');
        } finally {
            setLoadingMap(prev => ({ ...prev, [storyKey]: false }));
        }
    };

    const handleRegenerationContextChange = (storyKey, context) => {
        console.log(`Updating context for story ${storyKey}`);
        console.log('New context:', context);
        setRegenerationContextMap(prev => ({
            ...prev,
            [storyKey]: context
        }));
    };

    const toggleRegenerationInput = (storyKey) => {
        console.log(`Toggling regeneration input for story ${storyKey}`);
        console.log('Current showRegenerationInputMap:', showRegenerationInputMap);
        
        // Use functional update to ensure we're working with the latest state
        setShowRegenerationInputMap(prev => {
            const newValue = !prev[storyKey];
            console.log(`Setting ${storyKey} to ${newValue}`);
            return {
                ...prev,
                [storyKey]: newValue
            };
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handlePushToGitHub = async (testFiles) => {
        try {
            console.log('Pushing test cases with project ID:', projectId);
            
            // Default GitHub configuration
            const defaultConfig = {
                owner: 'ANUJT65',
                repo: 'Jira_Testcases',
                path: 'tests'
            };

            // Format test files properly
            const formattedTestFiles = testFiles.map(file => {
                if (typeof file === 'string') {
                    const [name, ...contentParts] = file.split('\n');
                    return {
                        name: name.replace(':', '').trim(),
                        content: contentParts.join('\n').trim()
                    };
                }
                return {
                    name: file.name,
                    content: file.content
                };
            });

            console.log('Formatted test files:', formattedTestFiles);

            let successCount = 0;
            let errorCount = 0;

            for (const file of formattedTestFiles) {
                if (!file.content) {
                    console.error('Empty content for file:', file.name);
                    errorCount++;
                    continue;
                }

                const response = await fetch('http://localhost:5000/testcode/push-code-to-github', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: file.content,
                        language: 'python',
                        framework: 'pytest',
                        is_test_case: true,
                        path: `${defaultConfig.path}/${file.name}`
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Failed to push ${file.name}:`, errorData.error);
                    errorCount++;
                } else {
                    const result = await response.json();
                    console.log(`Successfully pushed ${file.name}:`, result);
                    successCount++;
                }
            }

            // Show appropriate notification
            if (errorCount === 0) {
                setNotification({
                    open: true,
                    message: `Successfully pushed ${successCount} test file(s) to GitHub`,
                    severity: 'success'
                });
            } else if (successCount === 0) {
                setNotification({
                    open: true,
                    message: `Failed to push ${errorCount} test file(s) to GitHub`,
                    severity: 'error'
                });
            } else {
                setNotification({
                    open: true,
                    message: `Pushed ${successCount} test file(s) successfully, ${errorCount} failed`,
                    severity: 'warning'
                });
            }

        } catch (error) {
            console.error('Error pushing to GitHub:', error);
            setNotification({
                open: true,
                message: `Error pushing to GitHub: ${error.message}`,
                severity: 'error'
            });
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <CoverageComponent />
                    <Box>
                        <IconButton
                            onClick={() => setCodeGenOpen(true)}
                            sx={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                            }}
                        >
                            <CodeIcon />
                        </IconButton>
                        <button
                            onClick={handleInstallClick}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                background: "#24292e",
                                color: "#fff",
                                border: "none",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginLeft: '10px'
                            }}
                        >
                            Connect GitHub App
                        </button>
                    </Box>
                </Box>

                <div className="mt-2 h-full overflow-y-auto">
                    {loading ? (
                        <p className="text-center p-4">Loading stories...</p>
                    ) : (
                        <div className="space-y-6">
                            {stories.map((story) => (
                                <div
                                    key={story.key}
                                    className={`p-4 border rounded-lg bg-white  ${
                                        selectedStory?.key === story.key ? 'border-blue-500' : 'border-gray-500'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div 
                                            className="cursor-pointer flex-grow"
                                            onClick={() => setSelectedStory(story)}
                                        >
                                            <h3 className="font-bold">{story.key}: {story.summary}</h3>
                                            <ReactMarkdown  >{story.description}</ReactMarkdown >
                                            <div className="flex justify-between mt-2">
                                                <span className="text-sm">Status: {story.status}</span>
                                                <span className="text-sm">Priority: {story.priority}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 flex justify-between items-center">
                                        <button
                                            onClick={(e) => handleGenerateTests(story.key, e)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            disabled={loadingMap[story.key]}
                                        >
                                            {loadingMap[story.key] ? 'Generating...' : 'Generate Tests'}
                                        </button>
                                        
                                        <div className="space-x-2">
                                            
                                            <button
                                                onClick={() => handleDeleteStory(story.key)}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Delete Story
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {testCasesMap[story.key] && (
                                        <span className="text-xs text-gray-500">
                                            Generated: {new Date(testCasesMap[story.key].timestamp).toLocaleString()}
                                        </span>
                                    )}
                                    
                                    {/* Preview Section */}
                                    {showPreviewMap[story.key] && previewMap[story.key] && previewMap[story.key].testFiles && previewMap[story.key].testFiles.length > 0 && !editingMap[story.key] && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold">Preview Test Files</h4>
                                                <div className="space-x-2">
                                                
                                                    <button
                                                        onClick={() => handleCancelPreview(story.key)}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditTest(story.key)}
                                                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRegenerationInput(story.key)}
                                                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                                                    >
                                                        Regenerate with Context
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveAndUpload(story.key)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                                        disabled={loadingMap[story.key]}
                                                    >
                                                        {loadingMap[story.key] ? 'Saving...' : 'Save & Upload'}
                                                    </button>
                                                </div>
                                            </div>
                                            {showRegenerationInputMap[story.key] && (
                                                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                                                    <h4 className="font-semibold mb-2">Enter Context for Regeneration</h4>
                                                    <textarea
                                                        value={regenerationContextMap[story.key] || ''}
                                                        onChange={(e) => handleRegenerationContextChange(story.key, e.target.value)}
                                                        placeholder="Enter additional context for regenerating test cases..."
                                                        className="w-full h-32 p-2 border rounded mb-2"
                                                    />
                                                    <button
                                                        onClick={() => handleRegenerateTests(story.key)}
                                                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                                                        disabled={loadingMap[story.key]}
                                                    >
                                                        {loadingMap[story.key] ? 'Regenerating...' : 'Regenerate'}
                                                    </button>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                {previewMap[story.key].testFiles.map((file, index) => (
                                                    <div key={index} className="p-2 bg-white rounded border border-gray-200">
                                                        <div className="text-xs text-gray-500 mb-1">{file.name}</div>
                                                        <SyntaxHighlighter
                                                            language="python"
                                                            style={vscDarkPlus}
                                                            customStyle={{ margin: 0, maxHeight: '300px' }}
                                                        >
                                                            {file.content}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Regeneration Context Input */}
                                            
                                        </div>
                                    )}
                                    
                                    {/* Edit Section */}
                                    {editingMap[story.key] && editContentMap[story.key] && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold">Edit Test Files</h4>
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={() => setEditingMap(prev => ({ ...prev, [story.key]: false }))}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveAndUpload(story.key)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                                        disabled={loadingMap[story.key]}
                                                    >
                                                        {loadingMap[story.key] ? 'Saving...' : 'Save & Upload'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {Object.entries(editContentMap[story.key]).map(([fileName, content], index) => (
                                                    <div key={index} className="p-2 bg-white rounded border border-gray-200">
                                                        <div className="text-xs text-gray-500 mb-1">{fileName}</div>
                                                        <textarea
                                                            value={content}
                                                            onChange={(e) => handleEditContentChange(story.key, fileName, e.target.value)}
                                                            className="w-full h-64 font-mono text-sm p-2 border border-gray-300 rounded"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Saved Test Cases Section */}
                                    {testCasesMap[story.key] && !showPreviewMap[story.key] && !editingMap[story.key] && testCasesMap[story.key].testFiles && testCasesMap[story.key].testFiles.length > 0 && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold">Generated Test Files</h4>
                                                <div>
                                                <button
                                                onClick={() => handlePushToGitHub(testCasesMap[story.key].testFiles)}
                                                disabled={githubPushingMap[story.key]}
                                                className="px-4 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mx-2"
                                            >
                                                {githubPushingMap[story.key] 
    ? 'Pushing...' 
    : pushedMap[story.key] 
        ? 'Pushed' 
        : 'Push to GitHub'}

                                            </button>
                                                <button
                                                    onClick={() => handleEditTest(story.key)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                                >
                                                    Edits
                                                </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {/*{testCasesMap[story.key].testFiles.map((file, index) => (
                                                    <div key={index} className="p-2 bg-white rounded border border-gray-200">
                                                        <SyntaxHighlighter
                                                        language="python"
                                                        style={vscDarkPlus}
                                                        customStyle={{ margin: 0, maxHeight: '300px' }}>
                                                        {file}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                ))}*/}
                                                Test Coverage here: <CoverageComponent />
                                            </div>
                                            
                                            {testCasesMap[story.key].blobUrl && (
                                                <div className="mt-3">
                                                    <a 
                                                        href={testCasesMap[story.key].blobUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline text-sm"
                                                    >
                                                        Download Test Cases
                                                    </a>
                                                </div>
                                            )}
                                            
                                            {testCasesMap[story.key].testCaseId && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        Test Case ID: {testCasesMap[story.key].testCaseId}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Box>

            <CodeGenSidebar 
                open={codeGenOpen} 
                onClose={() => setCodeGenOpen(false)} 
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SingleProjectTestCases;
