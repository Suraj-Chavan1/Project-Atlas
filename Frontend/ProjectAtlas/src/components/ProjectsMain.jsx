import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import NavbarDB from './NavbarDB';
import NewProjectModal from './NewProjectModal';

const ProjectsMain = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');

 

  return (
    <div className='flex flex-col'>
      <NavbarDB title='Your Projects' byline='Manage all your projects with ease on a single page' />
      <div className='flex flex-col m-3'>
        <button onClick={() => setIsModalOpen(true)} className='bg-[#00AEEF] p-1 rounded-md w-1/6 text-white text-center'>
          + Create New Project
        </button>

        <div className='grid grid-cols-3 gap-4 mt-4'>
          <ProjectCard /> <ProjectCard /> <ProjectCard /> <ProjectCard />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
       <NewProjectModal isModalOpen={isModalOpen} setter={setIsModalOpen} />
      )}
    </div>
  );
};

export default ProjectsMain;
