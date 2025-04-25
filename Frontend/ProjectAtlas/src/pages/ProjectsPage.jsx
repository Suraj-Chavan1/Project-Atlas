import React from 'react'
import Sidebar from '../components/Sidebar'
import ProjectsMain from '../components/ProjectsMain'



const ProjectsPage = () => {
  return (
    <div className='w-full flex justify-center'>
        <Sidebar />
        <div className='w-4/5 h-screen ml-[20%]'>
            <ProjectsMain />
        </div>
    </div>
  )
}

export default ProjectsPage