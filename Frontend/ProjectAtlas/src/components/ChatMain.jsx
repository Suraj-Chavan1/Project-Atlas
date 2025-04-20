import React from 'react'
import AIResponse from './AIResponse'
import HumanMessage from './HumanMessage'
import NavbarDB from './NavbarDB'
import ChatDocuments from './ChatDocuments'

const ChatMain = () => {
  return (
    <div>
        <NavbarDB title='AI Requirements Engineer' byline='Use an LLM to formulate and gather requirements'/>

        {/* Chat messages will go here */}
        <div className='grid grid-cols-7'>
            <div className='col-span-5 h-115 border-r border-[#989898] p-2'>
                <div>Micro Finance | Project ID: #1234566</div>
                <div className='flex flex-col justify-end h-full'>
                    <div className='bg-white h-full mx-3 flex flex-col justify-end'>
                        <AIResponse />
                        <HumanMessage />
                    </div>
                    <div className='flex justify-between'>
                        <input className='p-1 border border-[#989898] m-3 w-full' type='text' placeholder='Type your message here...' />
                        <button className='bg-black px-2 py-1 my-3 text-white'>Send</button>
                    </div>
                    
                </div>
            </div>

            <div className='col-span-2 h-115 '>
                <ChatDocuments />
            </div>
        </div>
    </div>
  )
}

export default ChatMain