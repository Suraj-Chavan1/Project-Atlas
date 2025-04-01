import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import NavbarDB from './NavbarDB'
import { DiJira } from "react-icons/di";

const requirementsData = [
    { name: "Stakeholders ", Iterations: 8 },
    { name: "Documents", Iterations: 5 },
    { name: "User Stories", Iterations: 7 },
    { name: "Iterations", Iterations: 6 },
];

const SingleProjectMain = () => {
  return (
    <div className="flex flex-col">
        <NavbarDB title="Your Projects" byline="Manage all your projects with ease on a single page" />
        <div className="flex flex-col m-3">
            <div className='text-xl'>ProjectID: 123ABC</div>
            <div className='grid grid-cols-3 grid-cols-2 gap-4 mt-4'>
            <div className='col-span-1 row-span-1 shadow-lg p-3 flex flex-col rounded-md bg-white'>
    <div className="flex items-center space-x-2">
        <DiJira  className="text-blue-600 text-2xl" />
        <span className="text-lg font-semibold">JIRA Integrations</span>
    </div>

    {/* List of JIRA Integrations */}
    <ul className="mt-3 space-y-2">
        {[
            { name: 'Project Tracking', apiKey: 'abcde12345xyz67890' },
            { name: 'Bug Reports', apiKey: 'pqrst09876uvw54321' }
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
                <div className='col-span-2 row-span-1  shadow-lg p-3 flex flex-col rounded-md'>
                    <div className='text-lg font-bold mb-2'>Requirement Engineering</div>
                    
                    {/* Bar Chart for Requirements */}
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={requirementsData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="Iterations" fill="#3182ce" />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* List of Requirements */}
                    
                </div>

                <div className='col-span-3 shadow-lg p-3 flex flex-col rounded-md'>
                    <div className='text-lg font-bold mb-2'>Stakeholders</div>
                    <table className='w-full border-collapse border border-gray-300'>
    <thead>
        <tr className='bg-gray-200'>
            <th className='border border-gray-300 px-4 py-2'>Name</th>
            <th className='border border-gray-300 px-4 py-2'>Role</th>
            <th className='border border-gray-300 px-4 py-2'>Email</th>
            <th className='border border-gray-300 px-4 py-2'>Answered Questions</th>
            <th className='border border-gray-300 px-4 py-2'>Requirement Document</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td className='border border-gray-300 px-4 py-2'>Suraj</td>
            <td className='border border-gray-300 px-4 py-2'>Client</td>
            <td className='border border-gray-300 px-4 py-2'>surajchavan11@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>✅</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr>
            <td className='border border-gray-300 px-4 py-2'>Janhavi</td>
            <td className='border border-gray-300 px-4 py-2'>Developer</td>
            <td className='border border-gray-300 px-4 py-2'>janhavir0098@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>❌</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr>
            <td className='border border-gray-300 px-4 py-2'>Anuj</td>
            <td className='border border-gray-300 px-4 py-2'>SDE Team Member</td>
            <td className='border border-gray-300 px-4 py-2'>anujt65@outlook.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>✅</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
        </tr>
        <tr>
            <td className='border border-gray-300 px-4 py-2'>Sakshi</td>
            <td className='border border-gray-300 px-4 py-2'>DevOps Team Member</td>
            <td className='border border-gray-300 px-4 py-2'>sakshiee@gmail.com</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>❌</td>
            <td className='border border-gray-300 px-4 py-2 text-center'>
                <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
            </td>
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
