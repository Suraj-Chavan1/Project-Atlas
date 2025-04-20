import React from 'react'
import Sidebar from '../components/Sidebar'
import TestCasesMain from '../components/TestCasesMain'

const TestCasesPage = () => {
  return (
    <div className='w-full flex justify-center'>
        <Sidebar />
        <div className='w-4/5 h-screen'>
            <TestCasesMain />
        </div>
    </div>
  )
}

export default TestCasesPage