import React from 'react'

const ChatDocuments = () => {
  return (
    <div className='p-2 flex flex-col'>
        <div className='font-bold'>Your Documents for this project</div>
        <button className='bg-[#00072D] p-1 text-white rounded-md my-1'>+ Add a new document</button>
        <div className='p-1 border border-gray-300 rounded-md'>Excel Sheet.xslx</div>
    </div>
  )
}

export default ChatDocuments