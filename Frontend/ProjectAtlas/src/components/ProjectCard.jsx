import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({name, description, url}) => {
  console.log(url);
  const navigate = useNavigate();
  return (
    <div className='bg-white shadow-2xl shadow-gray-400 rounded-md rounded p-3 flex flex-col justify-between '>
        <div className='font-bold'>{name}</div>
        <div className='text-sm'>{description}</div>

        <div className='flex justify-between mt-3 items-center'>
        <button className=' bg-[#00072D] pl-3 text-center text-sm text-white font-bold rounded-md p-2 w-full flex items-center justify-center gap-1' onClick={()=> navigate(url)}>Go to Project<FaArrowRight />
        </button>
        </div>
        
    </div>
  )
}

export default ProjectCard