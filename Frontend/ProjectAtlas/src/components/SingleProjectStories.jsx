import React from 'react'
import { CiBookmark } from "react-icons/ci";
import { PiSparkleFill } from "react-icons/pi";
import { MdModeEdit } from "react-icons/md";
import { SiJira } from "react-icons/si";



const SingleProjectStories = () => {
  return (
    <div className="flex flex-col mx-3 my-0 h-screen">
      <div className='grid grid-cols-3 grid-cols-2 gap-4 mt-2 h-full'>

        {/* Left Panel */}
        <div className='col-span-1 row-span-1 border border-gray-400 p-3 flex flex-col rounded-md bg-white h-full'>
          <div className='flex justify-between'>
            <div className='text-lg font-semibold'>All Stories</div>
            <button className='text-xs bg-blue-500 px-2 rounded-md text-white flex justify-center items-center gap-2'><PiSparkleFill />Generate Stories sdsdd</button>
          </div>
          
          <div className='flex justify-start items-center mt-2 p-1 bg-blue-200 rounded-md border border-blue-400'>
            <div className='h-10 w-10 rounded-md border border-gray-400 flex flex-col justify-center items-center text-green-700 bg-white'><CiBookmark /></div>

            <div className='flex flex-col ml-2'>
              <div className='flex justify-between items-center'>
                <div className='text-xs text-gray-500'>Sprint 2</div>
                <div className='text-xs text-red-600 font-bold'>Must do</div>
              </div>
              <div className='font-semibold text-sm'>Make Login Button Accessible</div>
            </div>
          </div>

          <div className='flex justify-start items-center mt-2'>
            <div className='h-10 w-10 rounded-md border border-gray-400 flex flex-col justify-center items-center text-green-700'><CiBookmark /></div>

            <div className='flex flex-col ml-2'>
            <div className='flex justify-between items-center'>
                <div className='text-xs text-gray-500'>Sprint 2</div>
                <div className='text-xs text-yellow-600 font-bold'>Should do</div>
              </div>
              <div className='font-semibold text-sm'>Make Login Button Accessible</div>
            </div>
          </div>

          <div className='flex justify-start items-center mt-2'>
            <div className='h-10 w-10 rounded-md border border-gray-400 flex flex-col justify-center items-center text-green-700'><CiBookmark /></div>

            <div className='flex flex-col ml-2'>
            <div className='flex justify-between items-center'>
                <div className='text-xs text-gray-500'>Sprint 2</div>
                <div className='text-xs text-green-600 font-bold'>Could do</div>
              </div>
              <div className='font-semibold text-sm'>Make Login Button Accessible</div>
            </div>
          </div>



        </div>

        {/* Right Panel */}
        <div className='col-span-2 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md h-full'>
          <div className='flex justify-between items-center'>
            <div className='text-xl font-bold'>Make Login Button Accessible</div>
            <div className='flex justify-center items-center gap-2'>
              <button className='border border-blue-500 text-sm p-1 mx-1 rounded-md flex justify-center gap-1 items-center'><SiJira />Push to Jira</button>
              <button className='w-10 h-10 rounded-full bg-blue-500 mx-1 items-center text-white p-3'><MdModeEdit /></button>
            </div>

            
            
          </div>
          <div>
            <div className='p-1 text-sm bg-red-300 border border-red-500 rounded-full w-1/6 text-center'>Must Do</div>

            <div className='mt-5'>
            <p className='text-sm'>
            <strong>As</strong> a visually impaired user,<br />
            <strong>I want</strong> the login button to be properly labeled and accessible via keyboard and screen readers,<br />
            <strong>so that</strong> I can log in without needing to use a mouse or rely on visual cues.
            </p>
            </div>
</div>

        </div>
      </div>
    </div>
  )
}

export default SingleProjectStories