import React, { useState } from 'react';
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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';

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

    const handleGenerateCode = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/codegen/generate-code', {
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

export default CodeGenSidebar; 