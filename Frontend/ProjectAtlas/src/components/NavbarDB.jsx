import React from 'react'

const NavbarDB = ({title, byline}) => {
  return (
    <div className='p-3 flex justify-between h-full items-center border-b border-[#989898]'>

            <div className='flex flex-col'>
                <div className='font-bold text-xl'>{title}</div>
                <div className='text-sm text-[#4D4D4D]'>{byline}</div>
            </div>

            <div className='flex justify-center'>
                <div className='w-10 h-10 rounded-full bg-orange-400 text-white font-bold flex justify-center items-center'>AB</div>
                <div className='flex flex-col ml-2 justify-center text-left'>
                <div className='text-sm font-bold'>Demo User</div>
                <div className='text-sm'>SCRUM Master</div>
            </div>
        </div>
    </div>
  )
}

export default NavbarDB