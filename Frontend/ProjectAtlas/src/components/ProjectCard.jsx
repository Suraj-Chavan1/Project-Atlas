import React from 'react'
import { FaArrowRight } from "react-icons/fa";

const ProjectCard = () => {
  return (
    <div className='bg-white shadow-2xl shadow-gray-400 rounded-md rounded p-3 flex flex-col justify-between '>
        <div className='font-bold'>Project 1</div>
        <div className='text-sm'>lkjhbnmjhbnhgvbgfrewedfghjk</div>

        <div className='flex justify-between mt-3 items-center'>
        <button className=' bg-[#00072D] pl-3 text-center text-sm text-white font-bold rounded-md p-2 w-full flex items-center justify-center gap-1'>Go to Project<FaArrowRight />
        </button>
        </div>
        
    </div>
  )
}

export default ProjectCard