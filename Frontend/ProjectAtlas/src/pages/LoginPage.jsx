import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';
import Logo from '../assets/Logo-dark.png';
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  Box
} from '@mui/material';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user, error: contextError, loading: contextLoading, setError } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    // If user is already logged in, redirect to projects page
    if (user) {
      navigate('/projects');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    setError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('sessionId', response.data.session_id);
        localStorage.setItem('userId', response.data.user.id);
        await login(response.data.user);
        navigate('/projects');
      } else {
        setLocalError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Paper elevation={3} className="max-w-md w-full space-y-8 p-8">
        <div className="flex flex-col items-center">
          <img src={Logo} alt="Logo" className="w-20 h-20" />
          <Typography component="h1" variant="h5" className="mt-4">
            Sign in to Project Atlas
          </Typography>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(contextError || localError) && (
            <Alert severity="error" className="mb-4">
              {contextError || localError}
            </Alert>
          )}

          <div className="space-y-4">
            <TextField
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={!!localError}
            />

            <TextField
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={!!localError}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              className="bg-[#00AEEF]"
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/signup')}
              disabled={loading}
            >
              Don't have an account? Sign Up
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default LoginPage;