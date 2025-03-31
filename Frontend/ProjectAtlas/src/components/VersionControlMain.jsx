import React from 'react'
import ProjectCard from './ProjectCard'
import DocumentsTable from './DocumentsTable'
import NavbarDB from './NavbarDB'

const VersionControlMain = () => {
  return (
    <div className='flex flex-col'>
        <NavbarDB title='Version Control' byline='Track, manage, and restore document versions effortlessly.'/>

        <div className='flex flex-col m-3'>
            <button className='bg-[#00AEEF] p-1 rounded-md w-1/5 text-white text-center items-center'>+ Add New Document</button>

            <div className='mt-4'>
                <DocumentsTable />
                
            </div>
        </div>
    </div>
  )
}

export default VersionControlMain