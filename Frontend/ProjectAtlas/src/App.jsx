import { useState } from 'react'
import { Container, Box, Paper, Typography, CircularProgress } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Jira2Code from './components/Jira2Code/Jira2Code'
import JiraStories from './components/JiraStories/JiraStories'
import DocGeneratorBRDSRS from './components/DocGeneratorBRDSRS/DocGeneratorBRDSRS'

function App() {
  const [isLoading, setIsLoading] = useState(false)

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  return (
    <Router>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Project Atlas
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Generate User Stories and Code from Documents
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Link to="/jira2code" style={{ textDecoration: 'none', flex: 1 }}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              Jira2Code
            </Paper>
          </Link>
          <Link to="/jirastories" style={{ textDecoration: 'none', flex: 1 }}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              Jira Stories
            </Paper>
          </Link>
          <Link to="/docgeneratorbrdsrs" style={{ textDecoration: 'none', flex: 1 }}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              BRD/SRS Generator
            </Paper>
          </Link>
        </Box>

        <Routes>
          <Route 
            path="/jira2code" 
            element={<Jira2Code />} 
          />
          <Route 
            path="/jirastories" 
            element={<JiraStories />} 
          />
          <Route 
            path="/docgeneratorbrdsrs" 
            element={<DocGeneratorBRDSRS />} 
          />
          <Route 
            path="/" 
            element={<DocGeneratorBRDSRS />} 
          />
        </Routes>
      </Container>
    </Router>
  )
}

export default App
