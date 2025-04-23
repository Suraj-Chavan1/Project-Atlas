import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import VersionControlPage from './pages/VersionControlPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage from './pages/ChatPage'
import ReqDocPage from './pages/ReqDocPage'
import UserStoriesPage from './pages/UserStoriesPage'
import TestCasesPage from './pages/TestCasesPage'
import AIRequirementsPage from './pages/AIRequirementsPage'
import SingleProjectPage from './pages/SingleProjectPage'
import RequirementsPage from './pages/RequirementsPage'
import HomePage2 from './pages/HomePage2'
import Test from './components/Test'

function App() {

  return (
    <UserProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage2 />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/version-control" element={
            <ProtectedRoute>
              <VersionControlPage />
            </ProtectedRoute>
          } />

          <Route path="/required-documents" element={
            <ProtectedRoute>
              <ReqDocPage />
            </ProtectedRoute>
          } />

          <Route path="/user-stories" element={
            <ProtectedRoute>
              <UserStoriesPage />
            </ProtectedRoute>
          } />

          <Route path="/project/:id" element={
            <ProtectedRoute>
              <SingleProjectPage />
            </ProtectedRoute>
          } />

          <Route path="/requirements" element={
            <ProtectedRoute>
              <RequirementsPage />
            </ProtectedRoute>
          } />

          {/* Role-specific Routes */}
          <Route path="/ai-requirements" element={
            <ProtectedRoute requiredRoles={['BA', 'Admin']}>
              <ChatPage />
            </ProtectedRoute>
          } />

          <Route path="/test-cases" element={
            <ProtectedRoute requiredRoles={['QA', 'Admin']}>
              <TestCasesPage />
            </ProtectedRoute>
          } />

          <Route path="/chat/:id" element={
            <ProtectedRoute requiredRoles={['BA', 'Admin']}>
              <AIRequirementsPage />
            </ProtectedRoute>
          } />

          <Route path="/test" element={
            <Test />
          } />  
          </Routes>

        
        
      </BrowserRouter>
    </UserProvider>
  )
}

export default App
