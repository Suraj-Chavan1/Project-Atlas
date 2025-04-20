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
  IconButton
} from '@mui/material';
import { AttachFile, TextFields } from '@mui/icons-material';

const sampleUsers = [
  { id: 'u1', name: 'Suraj' },
  { id: 'u2', name: 'Anuj' },
  { id: 'u3', name: 'Sakshi' },
];

const SingleProjectReqs = ({ projectId }) => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputType, setInputType] = useState('text'); // 'text' or 'file'
  const [selectedTextContent, setSelectedTextContent] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectUsers();
      fetchResources();
    }
  }, [projectId]);

  const fetchProjectUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/projects/${projectId}`, {
        headers: {
          'X-User-ID': user?.id || localStorage.getItem('userId')
        }
      });
      if (response.data.success) {
        setProjectUsers(response.data.project.stakeholders);
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
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setTextContent(''); // Clear text content when file is selected
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

      // Use the role field instead of position
      const role = stakeholder.role?.toLowerCase();
      console.log('Detected user role:', role);
      
      if (!role) {
        console.error('No role found for user');
        throw new Error('No role found for user');
      }

      // Check if there are any resources
      if (!resources || resources.length === 0) {
        console.error('No resources found for template generation');
        throw new Error('Please add resources before generating a template');
      }

      // Check if any resources have content
      const resourcesWithContent = resources.filter(r => r.context && r.context.trim());
      console.log('Resources with content:', resourcesWithContent);
      
      if (resourcesWithContent.length === 0) {
        console.error('No resources with content found');
        throw new Error('Please add resources with content before generating a template');
      }
      
      let endpoint = '';
      
      // Determine the endpoint based on user role
      switch(role) {
        case 'sde':
          endpoint = '/sde/generate-document';
          break;
        case 'ba':
          endpoint = '/ba/generate-document';
          break;
        case 'devops':
          endpoint = '/devops/generate-document';
          break;
        case 'client':
          endpoint = '/client/generate-document';
          break;
        default:
          console.error('Invalid role detected:', role);
          throw new Error(`Invalid user role for template generation: ${role}`);
      }

      // Combine all resource content
      const requirements_text = resourcesWithContent
        .map(r => r.context.trim())
        .join('\n\n');

      console.log('Selected endpoint:', endpoint);
      console.log('Making request with data:', {
        project_id: projectId,
        requirements_text,
        userId: user?.id
      });

      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        project_id: projectId,
        requirements_text: requirements_text,
        userId: user?.id
      });
      
      if (response.data.success) {
        console.log('Template generation successful:', response.data);
        fetchResources();
      } else {
        console.error('Template generation failed:', response.data.message);
        throw new Error(response.data.message || 'Failed to generate template');
      }
    } catch (error) {
      console.error('Template generation error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setIsGeneratingTemplate(false);
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
          <div className='text-4xl'>12</div>
        </div>

        <div className='col-span-1 row-span-1 border-gray-400 bg-white flex flex-col rounded-md'>
          <button
            className='flex flex-col justify-center items-center h-full bg-blue-600 text-white'
            onClick={() => setShowModal(true)}
          >
            + Add a Resource/Requirement
          </button>
          <button 
            className='flex flex-col justify-center items-center h-full bg from-blue-300 to-blue-600 mt-1 bg-[#00072D] text-white'
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

          <TableContainer>
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
        </div>

        <div className='col-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div>Recent Activity here</div>
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
            ) : (
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
                onClick={handleResourceSubmit}
                variant="contained"
                color="primary"
                disabled={loading || (!textContent && !selectedFile) || !resourceName}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload Resource'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProjectReqs;
