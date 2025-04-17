import React from 'react'
import { DiJira } from "react-icons/di";

const SingleProjectReqs = () => {
  return (
    <div className="flex flex-col mx-3 my-0">
        <div className='grid grid-cols-3 grid-cols-2 gap-4 mt-2'>
            <div className='col-span-1 row-span-1 border border-gray-400 p-3 flex flex-col rounded-md bg-white'>
                <div className="">
                    <span className="text-md ">Current Version</span>
                    <div className='text-4xl'>3</div>
                </div>
            </div>
    
            <div className='col-span-1 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
                <div>Total Listed Requirements</div>
                <div className='text-4xl'>12</div>
            </div>

            <div className='col-span-1 row-span-1  border-gray-400 bg-white  flex flex-col rounded-md'>
                <button className='flex flex-col justify-center items-center h-full bg-blue-600  text-white'>+ Add a Resource/Requirement</button>
                <button className='flex flex-col justify-center items-center h-full bg from-blue-300 to-blue-600 mt-1 bg-[#00072D] text-white'>Build Template from given resources</button>
            </div>
    
            <div className='col-span-2 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
                <div className='flex justify-between'>
                    <div className='text-lg font-bold mb-2'>Requirements/Resources </div>
                    <div className='flex justify-center gap-2'>
                    <button className='mb-2 bg-blue-600 px-3 py-1/2 rounded-md text-white text-sm'>View Team Document</button>
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
    {/*end of table*/}

    <div className='col-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
        <div>Recent Activity here</div>
    </div>
    </div>
    </div>
  )
}

export default SingleProjectReqs