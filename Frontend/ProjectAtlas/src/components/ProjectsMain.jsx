import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import NavbarDB from './NavbarDB';
import NewProjectModal from './NewProjectModal';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { CircularProgress, Alert } from '@mui/material';

const ProjectsMain = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Fetch user's projects when component mounts or when user changes
  useEffect(() => {
    fetchUserProjects();
  }, [user]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from context or localStorage
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/projects/user/${userId}`, {
        headers: {
          'X-User-ID': userId
        }
      });

      if (response.data.success) {
        setProjects(response.data.projects);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddProject = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  return (
    <div className="flex flex-col">
      <NavbarDB title="Your Projects" byline="Manage all your projects with ease on a single page" />
      <div className="flex flex-col m-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00AEEF] p-1 rounded-md w-1/6 text-white text-center"
        >
          + Create New Project
        </button>

        {error && (
          <Alert severity="error" className="mt-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <CircularProgress />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {projects.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500">
                No projects found. Create a new project to get started!
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  name={project.name}
                  url={`/project/${project.id}`}
                  role={project.stakeholders.find(s => s.id === (user?.id || localStorage.getItem('userId')))?.role}
                  projectKey={project.projectKey}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <NewProjectModal
          isModalOpen={isModalOpen}
          setter={setIsModalOpen}
          onAddProject={handleAddProject}
          onProjectCreated={fetchUserProjects} // Add this to refresh the list after creation
        />
      )}
    </div>
  );
};

export default ProjectsMain;
