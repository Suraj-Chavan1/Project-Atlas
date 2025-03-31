import React from 'react'

import Sidebar from '../components/Sidebar'
import ProjectsMain from '../components/ProjectsMain'
import JiraMain from '../components/ReqDocMain'

const ReqDocPage = () => {
  return (
    <>
    <div className='w-full flex justify-center'>
        <Sidebar />
        <div className='w-4/5 h-screen'>
            <JiraMain />
        </div>
    </div>
    
      </>
  )
}

export default ReqDocPage