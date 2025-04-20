import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const AIRequirementsPage = () => {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requirementsDoc, setRequirementsDoc] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const baseQuestions = [
    "What is the main purpose of your project?",
    "Who is your target audience?",
    "What are the primary features you require?",
    "What is your timeline for the project?",
    "Are there any specific technologies or platforms you prefer?",
  ];

  useEffect(() => {
    // Start with the first question
    if (messages.length === 0) {
      setMessages([{ type: 'system', content: baseQuestions[0] }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentQuestion.trim()) return;

    const newMessage = { type: 'user', content: currentQuestion };
    setMessages(prev => [...prev, newMessage]);
    setCurrentQuestion('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ai-requirement/gather', {
        questions: [{ 
          question: baseQuestions[currentQuestionIndex], 
          answer: currentQuestion 
        }]
      });

      if (response.data.status === 'success') {
        // Move to next question if available
        if (currentQuestionIndex < baseQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setMessages(prev => [...prev, { 
            type: 'system', 
            content: baseQuestions[currentQuestionIndex + 1] 
          }]);
        } else {
          setAllQuestionsAnswered(true);
          setMessages(prev => [...prev, { 
            type: 'system', 
            content: 'All questions answered! Click "Generate Requirements" to create your document.' 
          }]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Error processing your request.';
      setError(errorMessage);
      setMessages(prev => [...prev, { type: 'error', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRequirements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const transcript = messages
        .filter(msg => msg.type === 'user')
        .map((msg, index) => `Q: ${baseQuestions[index]}\nA: ${msg.content}`)
        .join('\n\n');

      const response = await axios.post('http://localhost:5000/api/ai-requirement/generate', {
        transcript
      });

      if (response.data.status === 'success') {
        setRequirementsDoc(response.data.requirements);
        setMessages(prev => [...prev, { 
          type: 'system', 
          content: 'Requirements document generated successfully!' 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Error generating requirements document.';
      setError(errorMessage);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: errorMessage 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = () => {
    if (!requirementsDoc) return;

    const blob = new Blob([requirementsDoc], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements_document.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        AI Requirements Generator
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2, height: '60vh', overflow: 'auto' }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: message.type === 'user' ? 'primary.light' : 
                       message.type === 'error' ? 'error.light' : 'grey.100',
              color: message.type === 'user' ? 'white' : 
                     message.type === 'error' ? 'white' : 'text.primary',
            }}
          >
            <Typography>{message.content}</Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your answer..."
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading || allQuestionsAnswered}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={isLoading || !currentQuestion.trim() || allQuestionsAnswered}
        >
          Send
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={generateRequirements}
          disabled={isLoading || !allQuestionsAnswered}
        >
          Generate Requirements
        </Button>
        {requirementsDoc && (
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={downloadDocument}
          >
            Download Document
          </Button>
        )}
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AIRequirementsPage; 