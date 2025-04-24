import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useParams, useLocation } from 'react-router-dom';

const SingleProjectTestCases = () => {
    const { projectId } = useParams(); // Extract project ID from URL
    const location = useLocation();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);
    const [testCasesMap, setTestCasesMap] = useState({});
    const [loadingMap, setLoadingMap] = useState({});
    const [githubPushingMap, setGithubPushingMap] = useState({});
    const [previewMap, setPreviewMap] = useState({});
    const [showPreviewMap, setShowPreviewMap] = useState({});
    const [editingMap, setEditingMap] = useState({});
    const [editContentMap, setEditContentMap] = useState({});
    const [regenerationContextMap, setRegenerationContextMap] = useState({});
    const [showRegenerationInputMap, setShowRegenerationInputMap] = useState({});
    const [githubConfig, setGithubConfig] = useState({
        owner: 'ANUJT65',
        repo: 'Jira_Testcases'
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

    const handlePushToGitHub = async (storyKey) => {
        try {
            setGithubPushingMap(prev => ({ ...prev, [storyKey]: true }));
            
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
            } else if (testCasesMap[storyKey]) {
                // If we have saved test cases, use those
                testFiles = testCasesMap[storyKey].testFiles.map(file => {
                    const [name, ...contentParts] = file.split('\n');
                    return {
                        name: name.replace(':', ''),
                        content: contentParts.join('\n')
                    };
                });
            }
            
            if (testFiles.length === 0) {
                alert('No test cases found to push to GitHub');
                return;
            }
            
            const currentProjectId = getProjectId();
            console.log("Pushing test cases with project ID:", currentProjectId);
            
            if (!currentProjectId) {
                alert('Error: Project ID not found. Please make sure you are on a valid project page.');
                return;
            }
            
            // First save and upload to get the blob URL
            const saveResponse = await axios.post('http://localhost:5000/testcode/generate-tests', {
                story_key: storyKey,
                project_id: currentProjectId,
                test_files: testFiles
            });
            
            if (saveResponse.data.success) {
                const blobUrl = saveResponse.data.blob_url;
                
                // Now push to GitHub using the blob URL
                const response = await axios.post('http://localhost:5000/testcode/push-to-github', {
                    owner: githubConfig.owner,
                    repo: githubConfig.repo,
                    fileUrl: blobUrl,
                    path: `tests/${storyKey}_tests.py`
                });

                if (response.data.success) {
                    alert('Successfully pushed test cases to GitHub');
                } else {
                    alert(`Failed to push to GitHub: ${response.data.error}`);
                }
            } else {
                alert('Failed to save test cases before pushing to GitHub');
            }
        } catch (error) {
            console.error('Error pushing to GitHub:', error);
            alert('Failed to push test cases to GitHub');
        } finally {
            setLoadingMap(prev => ({ ...prev, [storyKey]: false }));
        }
    };

    return (
        <div className="flex flex-col mx-3 my-0 h-screen">
            <div className="mb-4">
                <button
                    onClick={handleInstallClick}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        background: "#24292e",
                        color: "#fff",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Connect GitHub App
                </button>
            </div>

            <div className="mt-2 h-full overflow-y-auto">
                {loading ? (
                    <p className="text-center p-4">Loading stories...</p>
                ) : (
                    <div className="space-y-6">
                        {stories.map((story) => (
                            <div
                                key={story.key}
                                className={`p-4 border rounded-lg ${
                                    selectedStory?.key === story.key ? 'border-blue-500' : 'border-gray-200'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div 
                                        className="cursor-pointer flex-grow"
                                        onClick={() => setSelectedStory(story)}
                                    >
                                        <h3 className="font-bold">{story.key}: {story.summary}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-sm">Status: {story.status}</span>
                                            <span className="text-sm">Priority: {story.priority}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteStory(story.key)}
                                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                        disabled={loadingMap[story.key]}
                                    >
                                        Delete
                                    </button>
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
                                            onClick={() => handlePushToGitHub(story.key)}
                                            disabled={githubPushingMap[story.key]}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {githubPushingMap[story.key] ? 'Pushing...' : 'Push to GitHub'}
                                        </button>
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
                                            <button
                                                onClick={() => handleEditTest(story.key)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {testCasesMap[story.key].testFiles.map((file, index) => (
                                                <div key={index} className="p-2 bg-white rounded border border-gray-200">
                                                    {file}
                                                </div>
                                            ))}
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
        </div>
    );
};

export default SingleProjectTestCases;
