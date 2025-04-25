import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import {
  CircularProgress,
  Alert,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton, 
  Backdrop
} from '@mui/material';
import ReactMarkdown from "react-markdown";
import { RiPencilFill } from "react-icons/ri";



import { AttachFile, TextFields } from '@mui/icons-material';

const sampleUsers = [
  { id: 'u1', name: 'Suraj' },
  { id: 'u2', name: 'Anuj' },
  { id: 'u3', name: 'Sakshi' },
];

const SingleProjectReqs = ({ projectId }) => {
  const { user, setUser } = useUser();
 
  const [showModal, setShowModal] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputType, setInputType] = useState('text'); // 'text' or 'file'
  const [selectedTextContent, setSelectedTextContent] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sdeDoc, setSdeDoc] = useState(null);
  const [baDoc, setBaDoc] = useState(null);
  const [clientDoc, setClientDoc] = useState(null);
  const [devopsDoc, setDevopsDoc] = useState(null);
  const [docLoading, setDocLoading] = useState({
    sde: false,
    ba: false,
    client: false,
    devops: false
  });
  const [currentDocument, setCurrentDocument] = useState(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const [success, setSuccess] = useState('');
  const [currentDocType, setCurrentDocType] = useState(null); // 'sde', 'ba', 'client', or 'devops'
  
  // Website scraping states
  const [showWebScrapeModal, setShowWebScrapeModal] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scrapedContent, setScrapedContent] = useState(null);
  const [websiteSummary, setWebsiteSummary] = useState(null);
  const [scrapingStatus, setScrapingStatus] = useState('idle'); // idle, loading, success, error
  
  // Audio transcription states
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [audioSummary, setAudioSummary] = useState(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState('idle'); // idle, loading, success, error

  useEffect(() => {
    if (projectId) {
      console.log('Current logged-in user:', {
        name: user?.name || 'Not available',
        role: user?.roles[0] || 'Not available',
        id: user?.id || 'Not available'
      });
      fetchProjectUsers();
      fetchResources();
      fetchDocuments();
    }
  }, [projectId, user]);

  const fetchProjectUsers = async () => {
    try {
      console.log('Fetching project users...');
      const response = await axios.get(`http://localhost:5000/projects/${projectId}`, {
        headers: {
          'X-User-ID': user?.id || localStorage.getItem('userId')
        }
      });
      console.log('Project users response:', response.data);
      
      if (response.data.success) {
        setProjectUsers(response.data.project.stakeholders);
        // Find the current user in stakeholders
        const currentStakeholder = response.data.project.stakeholders.find(
          s => s.id === (user?.id || localStorage.getItem('userId'))
        );
        console.log('Current stakeholder:', currentStakeholder);
        
        if (currentStakeholder) {
          console.log('Setting user role to:', currentStakeholder.role);
          // Update the user context with the role
          if (setUser) {
            setUser(prevUser => ({
              ...prevUser,
              role: currentStakeholder.role
            }));
            console.log('Updated user context with role:', currentStakeholder.role);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching project users:', err);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/resources/project/${projectId}`);
      if (response.data.success) {
        setResources(response.data.resources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    }finally {
      setTableLoading(false);
    }
  };

  const fetchDocuments = async () => {
    console.log('Starting to fetch documents for project:', projectId);
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Fetch SDE document
      console.log('Fetching SDE document...');
      setDocLoading(prev => ({ ...prev, sde: true }));
      try {
        const sdeResponse = await axios.get(`http://localhost:5000/sde/get-document/${projectId}`);
        console.log('SDE document response:', sdeResponse.data);
        if (sdeResponse.data.success && sdeResponse.data.exists) {
          console.log('Setting SDE document:', sdeResponse.data.document);
          setSdeDoc(sdeResponse.data.document);
        } else {
          console.log('No SDE document found or error in response');
          setSdeDoc(null);
        }
      } catch (sdeError) {
        console.error('Error fetching SDE document:', {
          message: sdeError.message,
          response: sdeError.response?.data,
          status: sdeError.response?.status
        });
        setSdeDoc(null);
      } finally {
        setDocLoading(prev => ({ ...prev, sde: false }));
      }

      // Add delay between requests
      await delay(500);

      // Fetch BA document
      console.log('Fetching BA document...');
      setDocLoading(prev => ({ ...prev, ba: true }));
      try {
        const baResponse = await axios.get(`http://localhost:5000/ba/get-document/${projectId}`);
        console.log('BA document response:', baResponse.data);
        if (baResponse.data.success && baResponse.data.exists) {
          console.log('Setting BA document:', baResponse.data.document);
          setBaDoc(baResponse.data.document);
        } else {
          console.log('No BA document found or error in response');
          setBaDoc(null);
        }
      } catch (baError) {
        console.error('Error fetching BA document:', {
          message: baError.message,
          response: baError.response?.data,
          status: baError.response?.status
        });
        setBaDoc(null);
      } finally {
        setDocLoading(prev => ({ ...prev, ba: false }));
      }

      // Add delay between requests
      await delay(500);

      // Fetch Client document
      console.log('Fetching Client document...');
      setDocLoading(prev => ({ ...prev, client: true }));
      try {
        const clientResponse = await axios.get(`http://localhost:5000/client/get-document/${projectId}`);
        console.log('Client document response:', clientResponse.data);
        if (clientResponse.data.success && clientResponse.data.exists) {
          console.log('Setting Client document:', clientResponse.data.document);
          setClientDoc(clientResponse.data.document);
        } else {
          console.log('No Client document found or error in response');
          setClientDoc(null);
        }
      } catch (clientError) {
        console.error('Error fetching Client document:', {
          message: clientError.message,
          response: clientError.response?.data,
          status: clientError.response?.status
        });
        setClientDoc(null);
      } finally {
        setDocLoading(prev => ({ ...prev, client: false }));
      }

      // Add delay between requests
      await delay(500);

      // Fetch DevOps document
      console.log('Fetching DevOps document...');
      setDocLoading(prev => ({ ...prev, devops: true }));
      try {
        const devopsResponse = await axios.get(`http://localhost:5000/devops/get-document/${projectId}`);
        console.log('DevOps document response:', devopsResponse.data);
        if (devopsResponse.data.success && devopsResponse.data.exists) {
          console.log('Setting DevOps document:', devopsResponse.data.document);
          setDevopsDoc(devopsResponse.data.document);
        } else {
          console.log('No DevOps document found or error in response');
          setDevopsDoc(null);
        }
      } catch (devopsError) {
        console.error('Error fetching DevOps document:', {
          message: devopsError.message,
          response: devopsError.response?.data,
          status: devopsError.response?.status
        });
        setDevopsDoc(null);
      } finally {
        setDocLoading(prev => ({ ...prev, devops: false }));
      }

    } catch (error) {
      console.error('Error in fetchDocuments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      console.log('Finished fetching all documents');
      setDocLoading({
        sde: false,
        ba: false,
        client: false,
        devops: false
      });
    }
  };

  const handleViewDocument = (doc, type) => {
    console.log('Attempting to view document:', { type, doc });
    if (doc) {
      // Always update the textContent when switching documents
      // This ensures content is updated whether in viewing or editing mode
      console.log('Setting document content for viewing:', doc.combined_text);
      setTextContent(doc.combined_text);
      setShowTemplate(true);
      // Set the current document type for tracking which document is being edited
      setCurrentDocType(type.toLowerCase());
      console.log('Current document type set to:', type.toLowerCase());
      
      // If already in editing mode, make sure we keep that state
      // This ensures we don't exit edit mode when switching documents
      console.log('Current editing state is:', isEditing ? 'editing' : 'viewing');
    } else {
      console.log('No document available for type:', type);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setTextContent(''); // Clear text content when file is selected
    }
  };

  const handleAudioFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const toggleUserTag = (userId) => {
    setTaggedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleResourceSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Handle website scraping if in website input mode
      if (inputType === 'website' && websiteUrl) {
        const response = await axios.post('http://localhost:5000/resources/scrape-website', {
          projectId: projectId,
          resourceName: resourceName,
          url: websiteUrl,
          taggedUsers: taggedUsers
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': user?.id || localStorage.getItem('userId')
          }
        });

        if (response.data.success) {
          // Store the summary for display
          if (response.data.resource && response.data.resource.summary) {
            setWebsiteSummary(response.data.resource.summary);
          }
          
          setShowModal(false);
          fetchResources(); // Refresh resources list
          // Reset form
          setResourceName('');
          setWebsiteUrl('');
          setTaggedUsers([]);
          return;
        } else {
          setError(response.data.message || 'Failed to scrape website');
          return;
        }
      }

      // Handle regular file/text resource
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('resourceName', resourceName);
      taggedUsers.forEach(userId => {
        formData.append('taggedUsers[]', userId);
      });

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (textContent) {
        formData.append('textContent', textContent);
      }

      const response = await axios.post('http://localhost:5000/resources/add', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-User-ID': user?.id || localStorage.getItem('userId')
          }
        }
      );

      if (response.data.success) {
        setShowModal(false);
        fetchResources(); // Refresh resources list
        // Reset form
        setResourceName('');
        setSelectedFile(null);
        setTextContent('');
        setTaggedUsers([]);
      } else {
        setError(response.data.message || 'Failed to add resource');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding resource');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeWebsite = async () => {
    try {
      setLoading(true);
      setError(null);
      setScrapingStatus('loading');

      const response = await axios.post('http://localhost:5000/resources/scrape-website', {
        projectId: projectId,
        resourceName: resourceName,
        url: websiteUrl,
        taggedUsers: taggedUsers
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || localStorage.getItem('userId')
        }
      });

      if (response.data.success) {
        setScrapingStatus('success');
        fetchResources(); // Refresh resources list
        
        // Store the summary for display
        if (response.data.resource && response.data.resource.summary) {
          setWebsiteSummary(response.data.resource.summary);
        }
        
        // Close the scraping modal after short delay to show success message
        setTimeout(() => {
          setShowWebScrapeModal(false);
          setResourceName('');
          setWebsiteUrl('');
          setTaggedUsers([]);
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to scrape website');
        setScrapingStatus('error');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error scraping website');
      setScrapingStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribeAudio = async () => {
    try {
      setLoading(true);
      setError(null);
      setTranscriptionStatus('loading');

      // Log audio file details to help with debugging
      console.log('Audio file being uploaded:', {
        name: audioFile?.name,
        type: audioFile?.type,
        size: audioFile?.size,
        lastModified: new Date(audioFile?.lastModified).toISOString()
      });

      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('projectId', projectId);
      formData.append('resourceName', resourceName);
      taggedUsers.forEach(userId => {
        formData.append('taggedUsers[]', userId);
      });

      console.log('Sending audio transcription request to server...');
      const response = await axios.post('http://localhost:5000/resources/transcribe-audio', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-User-ID': user?.id || localStorage.getItem('userId')
          }
        }
      );

      console.log('Transcription response received:', response.data);

      if (response.data.success) {
        setTranscriptionStatus('success');
        fetchResources(); // Refresh resources list
        
        // Store the transcript and summary for display
        if (response.data.resource) {
          setTranscript(response.data.resource.transcript);
          setAudioSummary(response.data.resource.summary);
          console.log('Transcript and summary received successfully');
        }
        
        // Close the modal after short delay to show success message
        setTimeout(() => {
          setShowModal(false);
          setResourceName('');
          setAudioFile(null);
          setTaggedUsers([]);
        }, 1500);
      } else {
        console.error('Audio transcription failed:', response.data.message);
        setError(response.data.message || 'Failed to transcribe audio');
        setTranscriptionStatus('error');
      }
    } catch (err) {
      console.error('Error during audio transcription:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || `Error transcribing audio: ${err.message}`);
      setTranscriptionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const projectUser = projectUsers.find(u => u.id === userId);
    return projectUser ? projectUser.name : 'Unknown User';
  };

  const getUserRole = (userId) => {
    const projectUser = projectUsers.find(u => u.id === userId);
    return projectUser ? projectUser.role : 'Unknown Role';
  };
 

  const handleTextClick = (content) => {
    setSelectedTextContent(content);
    setShowTextModal(true);
  };

  const handleGenerateTemplate = async () => {
    console.log('Starting template generation...');
    setIsGeneratingTemplate(true);
    try {
      console.log('Current user ID:', user?.id);
      console.log('All project users:', projectUsers);
      
      const stakeholder = projectUsers.find(s => s.id === user?.id);
      console.log('Found stakeholder:', stakeholder);
      
      if (!stakeholder) {
        console.error('User not found in project stakeholders');
        throw new Error('User not found in project stakeholders');
      }

      const role = stakeholder.role?.toLowerCase();
      console.log('Detected user role:', role);
      
      if (!role) {
        console.error('No role found for user');
        throw new Error('No role found for user');
      }

      if (!resources || resources.length === 0) {
        console.error('No resources found for template generation');
        throw new Error('Please add resources before generating a template');
      }

      const resourcesWithContent = resources.filter(r => r.context && r.context.trim());
      console.log('Resources with content:', resourcesWithContent);
      
      if (resourcesWithContent.length === 0) {
        console.error('No resources with content found');
        throw new Error('Please add resources with content before generating a template');
      }
      
      let endpoint = '';
      let docState = null;
      
      switch(role) {
        case 'sde':
          endpoint = '/sde/generate-document';
          docState = 'sde';
          break;
        case 'ba':
          endpoint = '/ba/generate-document';
          docState = 'ba';
          break;
        case 'devops':
          endpoint = '/devops/generate-document';
          docState = 'devops';
          break;
        case 'client':
          endpoint = '/client/generate-document';
          docState = 'client';
          break;
        default:
          console.error('Invalid role detected:', role);
          throw new Error(`Invalid user role for template generation: ${role}`);
      }

      const requirements_text = resourcesWithContent
        .map(r => r.context.trim())
        .join('\n\n');

      console.log('Making API request to:', endpoint);
      console.log('Request data:', {
        project_id: projectId,
        requirements_text_length: requirements_text.length,
        userId: user?.id
      });

      // Reset only the specific document state
      if (docState) {
        switch(docState) {
          case 'sde':
            setSdeDoc(null);
            setDocLoading(prev => ({ ...prev, sde: true }));
            break;
          case 'ba':
            setBaDoc(null);
            setDocLoading(prev => ({ ...prev, ba: true }));
            break;
          case 'client':
            setClientDoc(null);
            setDocLoading(prev => ({ ...prev, client: true }));
            break;
          case 'devops':
            setDevopsDoc(null);
            setDocLoading(prev => ({ ...prev, devops: true }));
            break;
        }
      }

      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        project_id: projectId,
        requirements_text: requirements_text,
        userId: user?.id
      });
      
      console.log('Template generation response:', response.data);
      
      if (response.data.success) {
        console.log('Template generation successful');
        // Fetch only the specific document that was generated
        if (docState) {
          try {
            const docResponse = await axios.get(`http://localhost:5000/${docState}/get-document/${projectId}`);
            console.log(`${docState.toUpperCase()} document response:`, docResponse.data);
            if (docResponse.data.success && docResponse.data.exists) {
              switch(docState) {
                case 'sde':
                  setSdeDoc(docResponse.data.document);
                  break;
                case 'ba':
                  setBaDoc(docResponse.data.document);
                  break;
                case 'client':
                  setClientDoc(docResponse.data.document);
                  break;
                case 'devops':
                  setDevopsDoc(docResponse.data.document);
                  break;
              }
            }
          } catch (fetchError) {
            console.error(`Error fetching ${docState} document:`, fetchError);
          }
        }
      } else {
        console.error('Template generation failed:', response.data.message);
        throw new Error(response.data.message || 'Failed to generate template');
      }
    } catch (error) {
      console.error('Template generation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      console.log('Finished template generation process');
      setIsGeneratingTemplate(false);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Saving template for document type:', currentDocType);
    
    try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Choose the correct endpoint based on currentDocType
        let endpoint = '';
        if (currentDocType === 'sde') {
            endpoint = `http://localhost:5000/sde/update-document/${projectId}`;
        } else if (currentDocType === 'ba') {
            endpoint = `http://localhost:5000/ba/update-document/${projectId}`;
        } else if (currentDocType === 'client') {
            endpoint = `http://localhost:5000/client/update-document/${projectId}`;
        } else if (currentDocType === 'devops') {
            endpoint = `http://localhost:5000/devops/update-document/${projectId}`;
        } else {
            throw new Error('Invalid document type selected for saving');
        }

        console.log('Using endpoint:', endpoint);

        const response = await axios.put(
            endpoint,
            {
                combined_text: textContent
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: false
            }
        );

        if (response.data.success) {
            console.log('Document updated successfully:', response.data);
            setSuccess('Document updated successfully');
            setTextContent(response.data.document.combined_text);
            setBlobUrl(response.data.blob_url);
            setIsEditing(false);
            
            // Update the corresponding document state based on currentDocType
            if (currentDocType === 'sde') {
                setSdeDoc(response.data.document);
            } else if (currentDocType === 'ba') {
                setBaDoc(response.data.document);
            } else if (currentDocType === 'client') {
                setClientDoc(response.data.document);
            } else if (currentDocType === 'devops') {
                setDevopsDoc(response.data.document);
            }
        } else {
            setError(response.data.message || 'Failed to update document');
        }
    } catch (error) {
        console.error('Error saving template:', error);
        setError(error.response?.data?.message || 'Failed to save template');
    } finally {
        setLoading(false);
    }
  };

  const handleAIAssist = async (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    
    if (!textContent) {
      setError('No content to edit');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`http://localhost:5000/sde/edit-with-ai/${projectId}`, {
        current_text: textContent,
        context: additionalContext
      });

      if (response.data.success) {
        setTextContent(response.data.edited_text);
        setSuccess('Document edited successfully with AI assistance');
      } else {
        setError(response.data.message || 'Failed to edit document with AI');
      }
    } catch (err) {
      console.error('AI edit error:', err);
      setError(err.response?.data?.message || 'Error editing document with AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col mx-3 my-0">
      <div className='grid grid-cols-3 grid-cols-2 gap-4 mt-2'>
        <div className='col-span-1 row-span-1 border border-gray-400 p-3 flex flex-col rounded-md bg-white'>
          <div className="">
            <span className="text-md ">Current Version</span>
            <div className='text-4xl'>3</div>
          </div>
        </div>

        <div className='col-span-1 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div>Total Listed Requirements</div>
          <div className='text-4xl'>{resources.length}</div>
        </div>

        <div className='col-span-1 row-span-1 border-gray-400 bg-white flex flex-col rounded-md'>
          <button
            className='flex flex-col justify-center items-center h-1/2 bg-blue-600 text-white'
            onClick={() => setShowModal(true)}
          >
            + Add a Resource/Requirement
          </button>
      
          <button 
            className='flex flex-col justify-center items-center h-1/2 bg from-blue-300 to-blue-600 mt-1 bg-[#00072D] text-white'
            onClick={handleGenerateTemplate}
            disabled={isGeneratingTemplate}
          >
            {isGeneratingTemplate ? 'Generating...' : 'Build Template from given resources'}
          </button>
        </div>

        <div className='col-span-2 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div className='flex justify-between'>
            <div className='text-lg font-bold mb-2'>Requirements/Resources</div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowModal(true)}
            >
              + Add Resource
            </Button>
          </div>

          {tableLoading ? <div className="flex justify-center items-center h-32">
    <CircularProgress />
  </div> : <>          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Tagged Users</TableCell>
                  <TableCell>Content/URL</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>{resource.name}</TableCell>
                    <TableCell>{resource.type}</TableCell>
                    <TableCell>{getUserName(resource.created_by)}</TableCell>
                    <TableCell>{getUserRole(resource.created_by)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {resource.tagged_users.map(userId => (
                          <Chip
                            key={userId}
                            label={`${getUserName(userId)} (${getUserRole(userId)})`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {resource.type === 'text' ? (
                        <Button
                          onClick={() => handleTextClick(resource.context)}
                          color="primary"
                        >
                          View Text
                        </Button>
                      ) : resource.type === 'audio' ? (
                        <div className="flex flex-col gap-1">
                          <Link
                            href={resource.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mb-1 flex items-center"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <i className="fa fa-headphones mr-1"></i> Listen Audio
                          </Link>
                          {resource.context && (
                            <Button
                              onClick={() => {
                                console.log("Audio resource data:", resource);
                                setTranscript(resource.context || "No transcript available");
                                setAudioSummary(resource.summary || "No summary available");
                              }}
                              color="primary"
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1 }}
                            >
                              View Transcript & Summary
                            </Button>
                          )}
                        </div>
                      ) : resource.type === 'website' ? (
                        <div className="flex flex-col gap-1">
                          <Link
                            href={resource.url || resource.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website
                          </Link>
                          {resource.summary && (
                            <Button
                              onClick={() => setWebsiteSummary(resource.summary)}
                              color="secondary"
                              size="small"
                              variant="outlined"
                              style={{ marginTop: '4px' }}
                            >
                              View Summary
                            </Button>
                          )}
                        </div>
                      ) : (
                        resource.url && (
                          <Link
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View File
                          </Link>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(resource.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </>}
        </div>

        <div className='col-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div className="text-lg font-bold mb-2">Recent Activity</div>
          
          {/* Edit Button for Current Role Template */}
          {user?.role && (
            <button 
              className='p-2 bg-black text-white rounded-md text-sm mb-4 hover:bg-gray-800'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentDoc = user.roles[0] === 'SDE' ? sdeDoc : 
                                 user.roles[0] === 'BA' ? baDoc : 
                                 user.roles[0] === 'client' ? clientDoc : 
                                 devopsDoc;
                console.log('Edit button clicked for', user.role, 'template');
                console.log('Current document:', currentDoc);
                if (currentDoc) {
                  handleViewDocument(currentDoc, user.role);
                  setIsEditing(true);
                }
              }}
              disabled={!sdeDoc?.blob_url && !baDoc?.blob_url && !clientDoc?.blob_url && !devopsDoc?.blob_url}
            >
              Edit {user.roles[0].toUpperCase()} Template
            </button>
          )}

          {/* Current Role Template Button */}
          

          {/* Generated Templates List */}
          <div className="mt-1">
            <div className="text-sm font-semibold mb-2">Generated Templates</div>
            <div className="space-y-2">
              {sdeDoc?.blob_url && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">SDE:</span>
                    <a 
                      href={sdeDoc.blob_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                  {user?.roles[0] === 'SDE' && (
                    <button 
                      className='p-1 bg-blue-100 rounded-md text-sm text-blue-600 hover:bg-blue-200 ml-8'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Edit button clicked for SDE template');
                        console.log('Current user role:', user?.roles[0]);
                        console.log('SDE document:', sdeDoc);
                        handleViewDocument(sdeDoc, 'SDE');
                        setIsEditing(true);
                      }}
                    >
                      Edit Template
                    </button>
                  )}
                </div>
              )}
              {baDoc?.blob_url && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">BA:</span>
                    <a 
                      href={baDoc.blob_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                  {user?.roles[0] === 'BA' && (
                    <button 
                      className='p-1 bg-blue-100 rounded-md text-sm text-blue-600 hover:bg-blue-200 ml-8'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Edit button clicked for BA template');
                        console.log('Current user role:', user?.roles[0]);
                        console.log('BA document:', baDoc);
                        handleViewDocument(baDoc, 'ba');
                        setIsEditing(true);
                      }}
                    >
                      Edit Template
                    </button>
                  )}
                </div>
              )}
              {clientDoc?.blob_url && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Client:</span>
                    <a 
                      href={clientDoc.blob_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                  {user?.roles[0] === 'Client' && (
                    <button 
                      className='p-1 bg-blue-100 rounded-md text-sm text-blue-600 hover:bg-blue-200 ml-8'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Edit button clicked for Client template');
                        console.log('Current user role:', user?.roles[0]);
                        console.log('Client document:', clientDoc);
                        handleViewDocument(clientDoc, 'Client');
                        setIsEditing(true);
                      }}
                    >
                      Edit Template
                    </button>
                  )}
                </div>
              )}
              {devopsDoc?.blob_url && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">DevOps:</span>
                    <a 
                      href={devopsDoc.blob_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                  {user?.roles[0] === 'DevOps' && (
                    <button 
                      className='p-1 bg-blue-100 rounded-md text-sm text-blue-600 hover:bg-blue-200 ml-8'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Edit button clicked for DevOps template');
                        console.log('Current user role:', user?.roles[0]);
                        console.log('DevOps document:', devopsDoc);
                        handleViewDocument(devopsDoc, 'DevOps');
                        setIsEditing(true);
                      }}
                    >
                      Edit Template
                    </button>
                  )}
                </div>
              )}
              {!sdeDoc?.blob_url && !baDoc?.blob_url && !clientDoc?.blob_url && !devopsDoc?.blob_url && (
                <div className="text-sm text-gray-500">No templates generated yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Text Content Modal */}
      <Dialog
        open={showTextModal}
        onClose={() => setShowTextModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Text Content
          <IconButton
            aria-label="close"
            onClick={() => setShowTextModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            X
         </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            component="pre"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontFamily: 'inherit',
              padding: '16px',
            }}
          >
            {selectedTextContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTextModal(false)}>Close</Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(selectedTextContent);
              // Optionally show a snackbar/toast to confirm copy
            }}
            color="primary"
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Resource</h2>

            <TextField
              fullWidth
              label="Resource Name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              className="mb-4"
            />

            <Tabs
              value={inputType}
              onChange={(e, newValue) => setInputType(newValue)}
              className="mb-4"
            >
              <Tab icon={<TextFields />} label="Text" value="text" />
              <Tab icon={<AttachFile />} label="File" value="file" />
              <Tab icon={<i className="fa fa-globe" />} label="Website" value="website" />
              <Tab icon={<i className="fa fa-microphone" />} label="Audio" value="audio" />
            </Tabs>

            {inputType === 'text' ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="mb-4"
              />
            ) : inputType === 'file' ? (
              <div className="mb-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.tiff"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFile />}
                  >
                    Choose File
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" className="mt-2">
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </div>
            ) : inputType === 'audio' ? (
              <div className="mb-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                  id="audio-input"
                />
                <label htmlFor="audio-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<i className="fa fa-microphone" />}
                  >
                    Choose Audio File
                  </Button>
                </label>
                {audioFile && (
                  <Typography variant="body2" className="mt-2">
                    Selected: {audioFile.name}
                  </Typography>
                )}
              </div>
            ) : (
              <TextField
                fullWidth
                label="Website URL"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="mb-4"
              />
            )}

            <div className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Tag Users
              </Typography>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {projectUsers.map(projectUser => (
                  <FormControlLabel
                    key={projectUser.id}
                    control={
                      <Checkbox
                        checked={taggedUsers.includes(projectUser.id)}
                        onChange={() => toggleUserTag(projectUser.id)}
                      />
                    }
                    label={`${projectUser.name} (${projectUser.role})`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setResourceName('');
                  setSelectedFile(null);
                  setTextContent('');
                  setTaggedUsers([]);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={inputType === 'audio' ? handleTranscribeAudio : handleResourceSubmit}
                variant="contained"
                color="primary"
                disabled={loading || (!textContent && !selectedFile && !websiteUrl && !audioFile) || !resourceName}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload Resource'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTemplate && (
        <div className="fixed inset-0 z-50  backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[95%] max-w-4xl h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">Generated Documents</h2>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mb-4">
              {!isEditing ? (
                <Button variant="outlined" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }}>
                  <RiPencilFill /> Edit

                </Button>
              ) : (
                <>
                  
                  <Button 
                    variant="outlined" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(false);
                    }}
                    disabled={loading}
                    type="button"
                  >
                    Cancel
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  setShowTemplate(false);
                  setIsEditing(false);
                  setTextContent('');
                }}
                variant="text"
                disabled={loading}
              >
                Close
              </Button>
            </div>

            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            {/* DOCUMENT PREVIEW / EDIT */}
            <div className="flex flex-col gap-4">
              {isEditing ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Context for AI
                    </label>
                    <textarea
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      className="w-full h-20 p-2 border rounded-md"
                      placeholder="Enter any additional context or instructions for the AI..."
                    />
                  </div>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full h-96 p-2 border rounded-md"
                    placeholder="Edit document content..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAIAssist}
                      disabled={loading}
                      type="button"
                    >
                      {loading ? <CircularProgress size={24} /> : 'AI Assist'}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveTemplate}
                      type="button"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(false);
                      }}
                      disabled={loading}
                      type="button"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className='px-4 border border-gray-300 rounded-md bg-gray-100'>
                <ReactMarkdown >
                  {textContent}
                </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Website Scraping Modal */}
      {showWebScrapeModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Scrape Website Content</h2>
            
            <TextField
              fullWidth
              label="Resource Name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              className="mb-4"
            />

            <TextField
              fullWidth
              label="Website URL"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="mb-4"
            />

            <div className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Tag Users
              </Typography>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {projectUsers.map(projectUser => (
                  <FormControlLabel
                    key={projectUser.id}
                    control={
                      <Checkbox
                        checked={taggedUsers.includes(projectUser.id)}
                        onChange={() => toggleUserTag(projectUser.id)}
                      />
                    }
                    label={`${projectUser.name} (${projectUser.role})`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            {scrapingStatus === 'success' && (
              <Alert severity="success" className="mb-4">
                Website scraped successfully! The content has been added to your resources.
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowWebScrapeModal(false);
                  setResourceName('');
                  setWebsiteUrl('');
                  setTaggedUsers([]);
                  setError(null);
                  setScrapingStatus('idle');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScrapeWebsite}
                variant="contained"
                color="primary"
                disabled={loading || !websiteUrl || !resourceName}
              >
                {loading ? <CircularProgress size={24} /> : 'Scrape Website'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Website Summary Modal */}
      {websiteSummary && (
        <Dialog
          open={!!websiteSummary}
          onClose={() => setWebsiteSummary(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Website Analysis Summary
            <IconButton
              aria-label="close"
              onClick={() => setWebsiteSummary(null)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              X
           </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography
              component="div"
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'inherit',
                padding: '16px',
              }}
              dangerouslySetInnerHTML={{ __html: websiteSummary.replace(/\*\*/g, '<strong>').replace(/\n/g, '<br/>') }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWebsiteSummary(null)}>Close</Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(websiteSummary);
              }}
              color="primary"
            >
              Copy to Clipboard
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Audio Transcription Results Modal */}
      {transcript && (
        <Dialog
          open={!!transcript}
          onClose={() => setTranscript(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Audio Transcription Results
            <IconButton
              aria-label="close"
              onClick={() => {
                setTranscript(null);
                setAudioSummary(null);
              }}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              X
           </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="h6" gutterBottom>
              Transcript:
            </Typography>
            <Paper 
              elevation={0} 
              variant="outlined"
              style={{ 
                padding: '16px', 
                marginBottom: '24px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              <Typography
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontFamily: 'inherit',
                }}
              >
                {transcript}
              </Typography>
            </Paper>
            
            {audioSummary && (
              <>
                <Typography variant="h6" gutterBottom>
                  Summary:
                </Typography>
                <Paper 
                  elevation={0} 
                  variant="outlined"
                  style={{ 
                    padding: '16px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <Typography
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontFamily: 'inherit',
                    }}
                    dangerouslySetInnerHTML={{ __html: audioSummary.replace(/\*\*/g, '<strong>').replace(/\n/g, '<br/>') }}
                  />
                </Paper>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setTranscript(null);
              setAudioSummary(null);
            }}>
              Close
            </Button>
            <Button
              onClick={() => {
                const content = audioSummary ? 
                  `Transcript:\n${transcript}\n\nSummary:\n${audioSummary}` : 
                  transcript;
                navigator.clipboard.writeText(content);
              }}
              color="primary"
            >
              Copy to Clipboard
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default SingleProjectReqs;
