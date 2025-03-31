import React from 'react'
import ProjectCard from './ProjectCard'
import NavbarDB from './NavbarDB'

const ProjectsMain = () => {
  return (
    <div className='flex flex-col'>
        <NavbarDB title='Your Projects' byline='Manage all your projects with ease on a single page'/>


        <div className='flex flex-col m-3'>
            <button className='bg-[#00AEEF] p-1 rounded-md w-1/6 text-white text-center items-center'>+ Create New Project</button>

            <div className='grid grid-cols-3 gap-4 mt-4'>
                <ProjectCard /> <ProjectCard /> <ProjectCard />
                <ProjectCard />
                
            </div>
        </div>
    </div>
  )
}

export default ProjectsMain