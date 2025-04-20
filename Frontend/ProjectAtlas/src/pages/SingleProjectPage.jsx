import React from 'react'
import Sidebar from '../components/Sidebar'
import SingleProjectMain from '../components/SingleProjectMain'

const SingleProjectPage = () => {
  return (
    <div className='w-full flex justify-center'>
      <Sidebar />
      <div className='w-4/5 h-screen bg-gray-200'>
          <SingleProjectMain />
      </div>
    </div>
  )
}

export default SingleProjectPage