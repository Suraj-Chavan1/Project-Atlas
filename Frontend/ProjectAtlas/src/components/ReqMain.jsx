import React, { useState } from 'react'
import NavbarDB from './NavbarDB'
import ReqTable from './ReqTable';

const ReqMain = () => {
  
  return (
    <div className='flex flex-col'>
      <NavbarDB title="Requirements" byline="Manage all your requirements with ease on a single page" />

      <div className='m-2 flex justify-between'>
        <input type="text" placeholder="Search..." className="border border-gray-300 rounded p-2 w-5/6 bg-white text-sm " />
        <button className='bg-blue-600 p-2 rounded-md text-white w-1/7'>Search</button>

      </div>

      <div className='text-md m-2 p-2 bg-white rounded-md border border-gray-300 flex justify-between items-center'>
        <div>Requirements by your team</div>
        <button className='text-sm bg-blue-200  border border-blue-300 p-1 rounded-sm'>Add Document</button>
      </div>

      <ReqTable />

    </div>
  )
}

export default ReqMain