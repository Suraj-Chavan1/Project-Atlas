import React from 'react'
import NavbarDB from './NavbarDB'

const SingleProjectMain = () => {
  return (
    <div className="flex flex-col">
        <NavbarDB title="Your Projects" byline="Manage all your projects with ease on a single page" />
        <div className="flex flex-col m-3">
            <div className='text-xl'>ProjectID: 123ABC</div>
            <div className='grid grid-cols-3 gap-4 mt-4'>
                <div className='col-span-1 shadow-lg p-3 flex flex-col rounded-md'>
                    <div>JIRA Integrations</div>
                    <div className='text-4xl'>1</div>
                </div>

                <div className='col-span-2 shadow-lg p-3 flex flex-col rounded-md'>
                    <div>JIRA Integrations</div>
                    <div className='text-4xl'>1</div>
                </div>

                <div className='col-span-2 shadow-lg p-3 flex flex-col rounded-md'>
                    <div className='text-lg font-bold mb-2'>Stakeholders</div>
                    <table className='w-full border-collapse border border-gray-300'>
                        <thead>
                            <tr className='bg-gray-200'>
                                <th className='border border-gray-300 px-4 py-2'>Name</th>
                                <th className='border border-gray-300 px-4 py-2'>Role</th>
                                <th className='border border-gray-300 px-4 py-2'>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='border border-gray-300 px-4 py-2'>John Doe</td>
                                <td className='border border-gray-300 px-4 py-2'>Manager</td>
                                <td className='border border-gray-300 px-4 py-2'>john@example.com</td>
                            </tr>
                            <tr>
                                <td className='border border-gray-300 px-4 py-2'>Jane Smith</td>
                                <td className='border border-gray-300 px-4 py-2'>Developer</td>
                                <td className='border border-gray-300 px-4 py-2'>jane@example.com</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SingleProjectMain