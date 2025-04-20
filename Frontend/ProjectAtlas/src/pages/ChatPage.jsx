import React from 'react'
import Sidebar from '../components/Sidebar'
import ChatMain from '../components/ChatMain'

const ChatPage = () => {
  return (
    <div className='w-full flex justify-center'>
        <Sidebar />
        <div className='w-4/5 h-screen'>
            <ChatMain />
        </div>
    </div>
  )
}

export default ChatPage