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



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/version-control" element={<VersionControlPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/required-documents" element={<ReqDocPage />} />
        <Route path="/user-stories" element={<UserStoriesPage />} />
        <Route path="/test-cases" element={<TestCasesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
