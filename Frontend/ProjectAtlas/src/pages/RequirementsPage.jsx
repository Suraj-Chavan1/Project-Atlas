import React from 'react'
import Sidebar from '../components/Sidebar'
import SingleProjectMain from '../components/SingleProjectMain'
import ReqMain from '../components/ReqMain'

const RequirementsPage = () => {
  return (
    <div className='w-full flex justify-center'>
      <Sidebar />
      <div className='w-4/5 h-screen bg-gray-200'>
          <ReqMain />
      </div>
    </div>
  )
}

export default RequirementsPage