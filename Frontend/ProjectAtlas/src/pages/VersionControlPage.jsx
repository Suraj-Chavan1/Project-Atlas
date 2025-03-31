import React from 'react'
import Sidebar from '../components/Sidebar'
import VersionControlMain from '../components/VersionControlMain'

const VersionControlPage = () => {
  return (
    <div className='w-full flex justify-center'>
        <Sidebar />
        <div className='w-4/5 h-screen'>
            <VersionControlMain />
        </div>
    </div>
  )
}

export default VersionControlPage