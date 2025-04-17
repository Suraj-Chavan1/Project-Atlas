import React from 'react';
import { MdModeEdit } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { PiSparkleFill } from "react-icons/pi";



const SingleProjectDocs = () => {
  return (
    <div className="flex flex-col mx-3 my-0 h-screen"> {/* <- Set a height */}
      <div className="grid grid-cols-5 grid-rows-2 gap-4 mt-2 h-full">
    
        <div className="col-span-2 row-span-2 border border-gray-400 flex flex-col rounded-md bg-white">
          <span className="text-md text-xl p-3">Documents</span>
          <div className="flex justify-center gap-2 text-sm">
            <button>Requirements</button>
            <button>Standard Docs</button>
          </div>

        <div className='flex flex-col mt-2'>
          <div className='flex flex-col border-y p-2'>
            <div className='flex justify-between'>
                <div className='text-md font-bold'>Software Requirement Specification</div>
                <div className='text-sm p-2 rounded-full bg-green-200 border bordern-green-400'>Ver 2</div>
            </div>
            <div className='text-sm'>Uploaded on: 12 Aug 2024</div>
            <div className='text-sm'>Author:</div>
          </div>
          </div>

          <div className='flex flex-col border-y p-2'>
            <div className='flex justify-between'>
                <div className='text-md font-bold'>Business Requirement Document</div>
                <div className='text-sm p-2 rounded-full bg-red-200 border bordern-red-400'>Ver 4</div>
            </div>
            <div className='text-sm'>Uploaded on: 12 Aug 2024</div>
            <div className='text-sm'>Author:</div>
          </div>

          <div className='flex flex-col border-y p-2'>
            <div className='flex justify-between'>
                <div className='text-md font-bold'>Statement of Work</div>
                <div className='text-sm p-2 rounded-full bg-yellow-200 border bordern-yellow-400'>Ver 3</div>
            </div>
            <div className='text-sm'>Uploaded on: 12 Aug 2024</div>
            <div className='text-sm'>Author:</div>
          </div>

          
          


        </div>

        {/* Top-right Panel */}
        <div className="col-span-3 row-span-2 border border-gray-400 bg-white p-3 flex flex-col rounded-md">
        
        <div className='flex justify-between'>
          <div className='text-lg font-bold'>Software Requirement Specification</div>

          <div className=''>
          <button className='w-10 h-10 rounded-full bg-blue-500 mx-1 items-center text-white p-3'><MdModeEdit />
          </button>
          <button className='w-10 h-10 rounded-full mx-1 items-center text-white p-3 bg-[#00072D]'><FaInfo />
          </button>
          <button className='w-10 h-10 rounded-full mx-1 items-center text-white p-3 bg-[#00072D]'><PiSparkleFill />

          </button>
          </div>
        </div>
        <div className="">Version: 2</div>

        <div className="mt-3 text-sm leading-relaxed text-gray-800 bg-white p-4 rounded-md ">
  <h2 className="text-lg font-semibold mb-2">SRS Summary</h2>

  <p className="mb-2">
    <strong>Purpose:</strong> This Software Requirements Specification (SRS) defines the core functionalities and design goals of the Project Management Platform. The tool aims to streamline project tracking, resource planning, and communication among team members, ensuring efficient collaboration and delivery of project outcomes.
  </p>

  <p className="mb-2">
    <strong>Functional Requirements:</strong> The system shall allow users to register, authenticate, and manage multiple projects. Within each project, users can add and categorize requirements, upload supporting documents, and assign tasks. Version control will automatically track updates, and a commenting system will enable internal discussion and feedback.
  </p>

  <p>
    <strong>Non-Functional Requirements:</strong> The platform must provide secure user authentication, maintain high availability, and support responsiveness across various devices. It should be scalable to accommodate increasing workloads and ensure data consistency and integrity through regular backups.
  </p>
</div>


        </div>


      </div>
    </div>
  );
};

export default SingleProjectDocs;
