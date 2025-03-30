import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const DocGeneratorBRDSRS = () => {
  // State for document type and business domain
  const [documentType, setDocumentType] = useState('');
  const [businessDomain, setBusinessDomain] = useState('');
  
  // State for file handling
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // State for generated documents
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // State for editing dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const steps = ['Select Document Type', 'Upload Files', 'Generate Document', 'Review & Edit'];

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
  };

  const handleBusinessDomainChange = (event) => {
    setBusinessDomain(event.target.value);
  };

  const handleGenerate = async () => {
    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    if (!files.length) {
      setError('Please upload at least one file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('document_type', documentType);
    if (businessDomain) {
      formData.append('business_domain', businessDomain);
    }
    
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/docgeneratorbrdsrs/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setGeneratedDoc(response.data.document);
        setSuccess(true);
        setActiveStep(3); // Move to review step
      } else {
        setError('Failed to generate document');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing documents');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = () => {
    setEditContent(generatedDoc.content || '');
    setAdditionalContext('');
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editContent) {
      setError('No content to edit');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/docgeneratorbrdsrs/edit', {
        content: editContent,
        additional_context: additionalContext,
        document_type: documentType || 'BRD',
        edit_type: 'modify'
      });

      if (response.data.success) {
        setGeneratedDoc(response.data.document);
        setSuccess(true);
        setEditDialogOpen(false);
      } else {
        setError(response.data.message || 'Failed to update document');
      }
    } catch (err) {
      console.error('Edit error:', err);
      setError(err.response?.data?.message || 'Error updating document');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:5000/api/docgeneratorbrdsrs/regenerate', {
        document_type: documentType,
        business_domain: businessDomain
      });

      if (response.data.success) {
        setGeneratedDoc(response.data.document);
        setSuccess(true);
      } else {
        setError('Failed to regenerate document');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error regenerating document');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleDownload = async (url, format) => {
    try {
      setLoading(true);
      const response = await axios.get(url, {
        responseType: 'blob'
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'md' ? 'text/markdown' : 
              'text/plain'
      });
      
      // Create a link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `document.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (err) {
      setError(`Error downloading ${format.toUpperCase()} file: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Generate BRD/SRS Documents
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {activeStep === 0 && (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                onChange={handleDocumentTypeChange}
                label="Document Type"
              >
                <MenuItem value="BRD">Business Requirements Document (BRD)</MenuItem>
                <MenuItem value="SRS">Software Requirements Specification (SRS)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Business Domain (Optional)"
              value={businessDomain}
              onChange={handleBusinessDomainChange}
              placeholder="e.g., healthcare, finance, retail"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!documentType}
              sx={{ mt: 2 }}
            >
              Next
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
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
                Upload Files
              </Button>
            </label>

            {files.length > 0 && (
              <List>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2">{file.name}</Typography>
                  </ListItem>
                ))}
              </List>
            )}

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={files.length === 0}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Ready to generate your {documentType} document
              {businessDomain && ` for the ${businessDomain} domain`}.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {files.length} file(s) will be processed.
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Generate Document
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 3 && generatedDoc && (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => window.open(generatedDoc.previewUrl, '_blank')}
              >
                Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleOpenEditDialog}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={handleRegenerate}
                disabled={loading}
              >
                {loading ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Download Options:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="PDF"
                  onClick={() => handleDownload(generatedDoc.pdfUrl, 'pdf')}
                  clickable
                  disabled={loading}
                />
                <Chip
                  label="Markdown"
                  onClick={() => handleDownload(generatedDoc.markdownUrl, 'md')}
                  clickable
                  disabled={loading}
                />
                <Chip
                  label="Text"
                  onClick={() => handleDownload(generatedDoc.textUrl, 'txt')}
                  clickable
                  disabled={loading}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Document generated successfully!
        </Alert>
      )}

      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditContent('');
          setAdditionalContext('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ mb: 2, mt: 2 }}
            placeholder="You can make manual edits here or use the instructions below for AI-assisted editing"
          />
          <TextField
            fullWidth
            label="Editing Instructions"
            multiline
            rows={3}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Enter specific instructions like 'remove executive summary' or 'add more technical details to section X'"
            helperText="Leave empty for manual edits, or provide instructions for AI-assisted editing"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialogOpen(false);
              setEditContent('');
              setAdditionalContext('');
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={loading || !editContent}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocGeneratorBRDSRS; 