import React from 'react'
import { DiJira } from "react-icons/di";

const SingleProjectHome = () => {
  return (
    <div className="flex flex-col mx-3 my-0">
        <div className='grid grid-cols-3 grid-cols-2 gap-4 mt-2'>

            {/*Integrations */}
            <div className='col-span-1 row-span-1 border border-gray-400 p-3 flex flex-col rounded-md bg-white'>
                <div className="flex items-center space-x-2">
                    <DiJira  className="text-blue-600 text-2xl" />
                    <span className="text-lg font-semibold">Integrations</span>
        
                </div>
                <ul className="mt-3 space-y-2">
                {[
                    { name: 'JIRA ', apiKey: 'abcde12345xyz23a12' }, { name: 'GitHub ', apiKey: 'sdcxsdfw123edaxs' },
                    ].map((integration, index) => (
                    <li key={index} className="flex justify-between items-center border-b py-2">
                    <span className="text-gray-700">{integration.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                    {integration.apiKey.slice(0, 5) + '••••••' + integration.apiKey.slice(-4)}
                    </span>
                </li>
                ))}
                </ul>
                </div>

                {/* Requirement Engineering Graph + List */}
                <div className='col-span-1 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
                    <div>Today's Schedule</div>
                </div>

                <div className='col-span-1 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
                    <div>Recent Activity</div>
                </div>

                <div className='col-span-2 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
                    <div className='flex justify-between'>
                    <div className='text-lg font-bold mb-2'>Stakeholders: </div>

                    <div className='flex justify-center gap-2'>
                    <div className="mb-2">
                        <select id="teamSelect" className="border border-gray-300 rounded p-2 w-full">
                            <option value="Client">Client</option>
                            <option value="SDE">SDE</option>
                            <option value="Business Analyst">Business Analyst</option>
                            <option value="DevOps">DevOps</option>
                        </select>
                    </div>

                    </div>
                    </div>
                    <table className='w-full border-collapse border border-gray-300'>
    <thead>
        <tr className='bg-gray-200 text-sm'>
            <th className='border border-gray-300 px-4 py-2'>Name</th>
            <th className='border border-gray-300 px-4 py-2'>Email</th>
            <th className='border border-gray-300 px-4 py-2'>Attached Documents</th>
        </tr>
    </thead>
    <tbody>
        <tr className='text-md'>
            <td className='border border-gray-300 px-4 py-2'>Suraj</td>
            <td className='border border-gray-300 px-4 py-2'>surajchavan11@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr className='text-md'>
            <td className='border border-gray-300 px-4 py-2'>Anuj</td>
            <td className='border border-gray-300 px-4 py-2'>anujt65@outlook.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr className='text-md'>
            <td className='border border-gray-300 px-4 py-2'>Sakshi</td>
            <td className='border border-gray-300 px-4 py-2'>sakshiee@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr className='text-md'>
            <td className='border border-gray-300 px-4 py-2'>Sakshi</td>
            <td className='border border-gray-300 px-4 py-2'>sakshiee@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr className='text-md'>
            <td className='border border-gray-300 px-4 py-2'>Sakshi</td>
            <td className='border border-gray-300 px-4 py-2'>sakshiee@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr className='text-md'>
            <td className='border border-gray-300 px-4 py-2'>Sakshi</td>
            <td className='border border-gray-300 px-4 py-2'>sakshiee@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr className='text-md'>
            <td className='border border-gray-300 px-4 py-2'>Anuj</td>
            <td className='border border-gray-300 px-4 py-2'>anujt65@outlook.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
    </tbody>
</table>

                </div>
            </div>
        </div>
  )
}

export default SingleProjectHome