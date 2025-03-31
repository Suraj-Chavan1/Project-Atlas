import React, { useState } from 'react'
import Jira2Code from './Jira2Code'
import JiraStories from './JiraStories'
import DocGeneratorBRDSRS from './DocGeneratorBRDSRS'
import { Box, Container, Paper, Typography } from '@mui/material'
import { Link, Route, Routes } from 'react-router-dom'
import NavbarDB from './NavbarDB'

const ReqDocMain = () => {
    const [category, setCategory] = useState('');
  return (
    <div className='flex flex-col'>
    <NavbarDB title={'Generate Standard Documents'} byline='Iteratively build documentation'/>
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
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
    </div>
  )
}

export default ReqDocMain