import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import VersionControlPage from './pages/VersionControlPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage from './pages/ChatPage'
import JiraPage from './pages/ReqDocPage'
import ReqDocPage from './pages/ReqDocPage'
import UserStoriesMain from './components/UserStoriesMain'
import UserStoriesPage from './pages/UserStoriesPage'
import TestCasesPage from './pages/TestCasesPage'
import AIRequirementsPage from './pages/AIRequirementsPage'
import SingleProjectPage from './pages/SingleProjectPage'
import RequirementsPage from './pages/RequirementsPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/*In Use */}
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/version-control" element={<VersionControlPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/required-documents" element={<ReqDocPage />} />
        <Route path="/user-stories" element={<UserStoriesPage />} />
        <Route path="/project/:id" element={<SingleProjectPage />} />
        <Route path="/requirements/" element={<RequirementsPage />} />


        {/*Not used anymore*/}
        <Route path="/ai-requirements" element={<ChatPage />} />
        <Route path="/test-cases" element={<TestCasesPage />} />
        <Route path="/chat/:id" element={<AIRequirementsPage />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
